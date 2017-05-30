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
      AssButton = null,
      AssButtonInstance = null,
      OverlayComponent = null,
      VjsButton = null;

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

        renderers[cur_id] = new libjass.renderers.WebRenderer(ass, clocks[cur_id], overlay, rendererSettings);
      }
    );

    /*
      Experimental API use at your own risk!!
    */
    function loadNewSubtitle(url) {
      renderers[cur_id]._removeAllSubs();
      renderers[cur_id]._preRenderedSubs.clear();
      renderers[cur_id].clock.disable();

      libjass.ASS.fromUrl(url, libjass.Format.ASS).then(
        function (ass) {
          cur_id = ++id_count;
          clocks[cur_id] = new libjass.renderers.AutoClock(getCurrentTime, 500);
          renderers[cur_id] = new libjass.renderers.WebRenderer(ass, clocks[cur_id], overlay, rendererSettings);
          updateDisplayArea();
          clocks[cur_id].play();
        }
      );
    };

    // Visibility Toggle Button
    if (!options.hasOwnProperty('button') || options.button) {
      VjsButton = videojs.getComponent('Button');
      AssButton = videojs.extend(VjsButton, {
        constructor: function (player, options) {
          options.name = options.name || 'assToggleButton';
          VjsButton.call(this, player, options);
        },
        buildCSSClass: function () {
          var classes = VjsButton.prototype.buildCSSClass.call(this);
          return 'vjs-ass-button ' + classes;
        },
        handleClick: function () {
          if (!this.hasClass('inactive')) {
            this.addClass('inactive');
            overlay.style.display = "none";
          } else {
            this.removeClass('inactive');
            overlay.style.display = "";
          }
        }
      });

      player.ready(function () {
        AssButtonInstance = new AssButton(player, options);
        player.controlBar.addChild(AssButtonInstance);
        player.controlBar.el().insertBefore(
          AssButtonInstance.el(),
          player.controlBar.getChild('customControlSpacer').el().nextSibling
        );
      });
    }

    return {
      loadNewSubtitle: loadNewSubtitle
    };
  };

  videojs.plugin('ass', vjs_ass);
}(window.videojs, window.libjass));
