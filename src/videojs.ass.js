/*! videojs-ass
 * Copyright (c) 2014 Sunny Li
 * Licensed under the Apache-2.0 license. */

(function (videojs, libjass) {
  'use strict';

  var vjs_ass = function (options) {
    var cur_id = 0,
      id_count = 0,
      overlay = document.createElement('div'),
      clocks = [],
      clockRate = options.rate || 1,
      delay = options.delay || 0,
      player = this,
      renderers = [],
      rendererSettings = null,
      OverlayComponent = null,
	  switching = false;

    if (!options.src) {
      return;
    }

    overlay.className = 'vjs-ass';

    OverlayComponent = {
      name: function () {
        return 'AssOverlay';
      },
      el: function () {
        return overlay;
      }
    }
	
	var tracks = player.textTracks();
	var previousActiveTrack = null;
	
	var assTracks = {};
	
	tracks.on('change', function() {
		if(!switching) {
			var activeTrack = this.tracks_.find(track => track.mode == 'showing');
			if(activeTrack && activeTrack != previousActiveTrack)
			{
				overlay.style.display = '';
				switchTo(assTracks[activeTrack.language]);
			}
			else if(!activeTrack && activeTrack != previousActiveTrack) overlay.style.display = 'none';
			previousActiveTrack = activeTrack;
		}
	})

    player.addChild(OverlayComponent, {}, 3);

    function getCurrentTime() {
      return player.currentTime() - delay;
    }

    clocks[cur_id] = new libjass.renderers.AutoClock(getCurrentTime, 500);

    player.on('play', function () {
      clocks[cur_id].play();
    });

    player.on('pause', function () {
      clocks[cur_id].pause();
    });

    player.on('seeking', function () {
      clocks[cur_id].seeking();
    });

    function updateClockRate() {
      clocks[cur_id].setRate(player.playbackRate() * clockRate);
    }

    updateClockRate();
    player.on('ratechange', updateClockRate);

    function updateDisplayArea() {
      setTimeout(function () {
        // player might not have information on video dimensions when using external providers
        var videoWidth = options.videoWidth || player.videoWidth() || player.el().offsetWidth,
          videoHeight = options.videoHeight || player.videoHeight() || player.el().offsetHeight,
          videoOffsetWidth = player.el().offsetWidth,
          videoOffsetHeight = player.el().offsetHeight,

          ratio = Math.min(videoOffsetWidth / videoWidth, videoOffsetHeight / videoHeight),
          subsWrapperWidth = videoWidth * ratio,
          subsWrapperHeight = videoHeight * ratio,
          subsWrapperLeft = (videoOffsetWidth - subsWrapperWidth) / 2,
          subsWrapperTop = (videoOffsetHeight - subsWrapperHeight) / 2;

        renderers[cur_id].resize(subsWrapperWidth, subsWrapperHeight, subsWrapperLeft, subsWrapperTop);
      }, 100);
    }

    window.addEventListener('resize', updateDisplayArea);
    player.on('loadedmetadata', updateDisplayArea);
    player.on('resize', updateDisplayArea);
    player.on('fullscreenchange', updateDisplayArea);

    player.on('dispose', function () {
      for (var i = 0; i < clocks.length; i++) {
        clocks[i].disable();
      }
      window.removeEventListener('resize', updateDisplayArea);
    });

    rendererSettings = new libjass.renderers.RendererSettings();
    libjass.ASS.fromUrl(options.src, libjass.Format.ASS).then(
      function (ass) {
        if (options.hasOwnProperty('enableSvg')) {
          rendererSettings.enableSvg = options.enableSvg;
        }
        if (options.hasOwnProperty('fontMap')) {
          rendererSettings.fontMap = new libjass.Map(options.fontMap);
        } else if (options.hasOwnProperty('fontMapById')) {
          rendererSettings.fontMap = libjass.renderers.RendererSettings
            .makeFontMapFromStyleElement(document.getElementById(options.fontMapById));
        }

		addTrack(options.src,{label:options.label, srclang:options.srclang, switchImmediately: true});
        renderers[cur_id] = new libjass.renderers.WebRenderer(ass, clocks[cur_id], overlay, rendererSettings);
      }
    );
	
	function addTrack(url,opts) {
      var newTrack = player.addRemoteTextTrack({src:"",kind:'subtitles', label:opts.label, srclang:opts.srclang, default: opts.switchImmediately});
      assTracks[opts.srclang] = cur_id;
	  if(opts.switchImmediately)
	  {
		  //Using a variable to prevent the "change" event from firing
		  switching = true;
		  var trackList = player.textTracks();
		  for(var t = 0; t < trackList.length; t++) {
			  if(trackList[t].src == newTrack.src && trackList[t].language == newTrack.srclang) trackList[t].mode = "showing";
			  else trackList[t].mode = "hidden";
		  }
		  switching = false;
	  }
	}
	
	function switchTo(new_id) {
      renderers[cur_id]._removeAllSubs();
      renderers[cur_id]._preRenderedSubs.clear();
      renderers[cur_id].clock.disable();
	  	  
	  cur_id = new_id;
	  	  
	  renderers[cur_id].clock.enable();
	  updateDisplayArea();
	  clocks[cur_id].play();
	}
	
    /*
      Experimental API use at your own risk!!
    */
    function loadNewSubtitle(url,label,srclang,switchImmediately) {
      if(switchImmediately) {
	     renderers[cur_id]._removeAllSubs();
         renderers[cur_id]._preRenderedSubs.clear();
         renderers[cur_id].clock.disable();
	  }

      libjass.ASS.fromUrl(url, libjass.Format.ASS).then(
        function (ass) {
          cur_id = ++id_count;
          clocks[cur_id] = new libjass.renderers.AutoClock(getCurrentTime, 500);
          renderers[cur_id] = new libjass.renderers.WebRenderer(ass, clocks[cur_id], overlay, rendererSettings);
          updateDisplayArea();
          if(switchImmediately) clocks[cur_id].play();
		  else {
			  renderers[cur_id]._removeAllSubs();
        	  renderers[cur_id]._preRenderedSubs.clear();
         	  renderers[cur_id].clock.disable();
		  }
		  addTrack(options.src,{label:label, srclang:srclang, switchImmediately: switchImmediately});
        }
      );
    };
	
	

    return {
      loadNewSubtitle: loadNewSubtitle
    };
  };

  videojs.plugin('ass', vjs_ass);
}(window.videojs, window.libjass));
