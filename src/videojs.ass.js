/*! videojs-ass
 * Copyright (c) 2014 Sunny Li
 * Licensed under the Apache-2.0 license. */

(function (videojs, libjass) {
  'use strict';

  var vjs_ass = function (options) {
    var overlay = document.createElement('div'),
      clock = new libjass.renderers.ManualClock(),
      player = this,
      renderer = null;

    // locate ass file source
    if (!options.src) {
      options.src = player.el().querySelector('video ass').getAttribute('src');
      if (!options.src) {
        return;
      }
    }

    overlay.className = 'vjs-ass';
    overlay.style.height = screen.height + 'px';
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
      clock.tick(player.currentTime());
    });

    function updateDisplayArea() {
      if (player.isFullscreen()) {
        renderer.resize(screen.width, screen.height);
      } else {
        renderer.resize(player.width(), player.height());
      }
    }

    player.on('resize', updateDisplayArea);
    player.on('fullscreenchange', updateDisplayArea);

    var subsRequest = new XMLHttpRequest();
    subsRequest.open("GET", options.src, true);

    subsRequest.addEventListener("load", function () {
      var ass = libjass.ASS.fromString(
        subsRequest.responseText,
        libjass.Format.ASS
      );

      renderer = new libjass.renderers.WebRenderer(ass, clock, {}, overlay);
      updateDisplayArea();
    }, false);

    subsRequest.send(null);
  };

  videojs.plugin('ass', vjs_ass);
}(window.videojs, window.libjass));
