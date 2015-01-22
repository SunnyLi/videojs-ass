/*! videojs-ass
 * Copyright (c) 2014 Sunny Li
 * Licensed under the Apache-2.0 license. */

document.createElement('ass');

(function (videojs, libjass) {
  'use strict';

  var vjs_ass = function (options) {
    var overlay = document.createElement('div'),
      clock = new libjass.renderers.ManualClock(),
      delay = options.delay || 0,
      player = this,
      renderer = null;

    // locate ass file source
    if (!options.src) {
      options.src = player.el().querySelector('video>ass').getAttribute('src');
      if (!options.src) {
        return;
      }
    }

    overlay.className = 'vjs-ass';
    player.el().insertBefore(overlay, player.el().firstChild.nextSibling);

    player.on('play', function() {
      clock.play();
    });

    player.on('pause', function() {
      clock.pause();
    });

    player.on('ended', function() {
      clock.stop();
    });

    player.on('timeupdate', function () {
      clock.tick(player.currentTime() - delay);
    });

    function updateDisplayArea() {
      if (player.isFullscreen()) {
        overlay.style.height = screen.height + 'px';
        renderer.resize(screen.width, screen.height);
      } else {
        overlay.style.height = player.height() + 'px';
        renderer.resize(player.width(), player.height());
      }
    }

    player.on('resize', updateDisplayArea);
    player.on('fullscreenchange', updateDisplayArea);

    var subsRequest = new XMLHttpRequest();
    subsRequest.open("GET", options.src, true);

    subsRequest.addEventListener("load", function () {
      var assPromise = libjass.ASS.fromString(
        subsRequest.responseText,
        libjass.Format.ASS
      );

      assPromise.then(
        function (ass) {
          renderer = new libjass.renderers.WebRenderer(ass, clock, overlay);
          updateDisplayArea();
        }
      );
    }, false);

    subsRequest.send(null);

    // Visibility Toggle Button
    if (typeof(options.button) == 'undefined' || options.button) {
      videojs.AssButton = videojs.Button.extend();

      videojs.AssButton.prototype.onClick = function () {
        if (!/inactive/.test(this.el().className)) {
          this.el().className += ' inactive';
          overlay.style.display = "none";
        } else {
          this.el().className = this.el().className.replace(/\s?inactive/, '');
          overlay.style.display = "";
        }
      };

      player.controlBar.el().appendChild(
        new videojs.AssButton(this, { 'el': createAssButton() }).el()
      );
    }

    function createAssButton() {
      var props = {
        className: 'vjs-ass-button vjs-control',
        role: 'button',
        'aria-label': 'ASS subtitle toggle',
        'aria-live': 'polite',
        tabIndex: 0
      };
      return videojs.Component.prototype.createEl(null, props);
    }
  };

  videojs.plugin('ass', vjs_ass);
}(window.videojs, window.libjass));
