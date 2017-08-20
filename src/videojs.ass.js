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
      assTrackIdMap = {},
      tracks = player.textTracks(),
      isTrackSwitching = false;

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

    tracks.on('change', function () {
      if (isTrackSwitching) {
        return;
      }

      var activeTrack = this.tracks_.find(function (track) {
        return track.mode === 'showing';
      });

      if (activeTrack) {
        overlay.style.display = '';
        switchTrackTo(assTrackIdMap[activeTrack.language + activeTrack.label]);
      } else {
        overlay.style.display = 'none';
      }
    })

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

        addTrack(options.src, { label: options.label, srclang: options.srclang, switchImmediately: true });
        renderers[cur_id] = new libjass.renderers.WebRenderer(ass, clocks[cur_id], overlay, rendererSettings);
      }
    );

    function addTrack(url, opts) {
      var newTrack = player.addRemoteTextTrack({
        src: "",
        kind: 'subtitles',
        label: opts.label || 'ASS #' + cur_id,
        srclang: opts.srclang || 'vjs-ass-' + cur_id,
        default: opts.switchImmediately
      });

      assTrackIdMap[newTrack.srclang + newTrack.label] = cur_id;

      if(!opts.switchImmediately) {
        // fix multiple track selected highlight issue
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t].mode === "showing") {
            tracks[t].mode = "showing";
          }
        }
        return;
      }

      isTrackSwitching = true;
      for (var t = 0; t < tracks.length; t++) {
        if (tracks[t].label == newTrack.label && tracks[t].language == newTrack.srclang) {
          if (tracks[t].mode !== "showing") {
            tracks[t].mode = "showing";
          }
        } else {
          if (tracks[t].mode === "showing") {
            tracks[t].mode = "disabled";
          }
        }
      }
      isTrackSwitching = false;
    }

    function switchTrackTo(selected_track_id) {
      renderers[cur_id]._removeAllSubs();
      renderers[cur_id]._preRenderedSubs.clear();
      renderers[cur_id].clock.disable();

      cur_id = selected_track_id;
      if (cur_id == undefined) {
        // case when we switche to regular non ASS closed captioning
        return;
      }

      renderers[cur_id].clock.enable();
      updateDisplayArea();
      clocks[cur_id].play();
    }

    /*
      Experimental API use at your own risk!!
    */
    function loadNewSubtitle(url, label, srclang, switchImmediately) {
      var old_id = cur_id;
      if (switchImmediately) {
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

          if (switchImmediately) {
            clocks[cur_id].play();
          } else {
            renderers[cur_id]._removeAllSubs();
            renderers[cur_id]._preRenderedSubs.clear();
            renderers[cur_id].clock.disable();
          }

          addTrack(options.src, { label: label, srclang: srclang, switchImmediately: switchImmediately });

          if (!switchImmediately) {
            cur_id = old_id;
          }
        }
      );
    };

    return {
      loadNewSubtitle: loadNewSubtitle
    };
  };

  videojs.plugin('ass', vjs_ass);
}(window.videojs, window.libjass));
