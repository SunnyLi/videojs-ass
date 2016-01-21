# videojs-ass

Add **Advanced SubStation Alpha (ASS)** subtitles support to
[videojs](https://github.com/videojs/video.js) using the
[libjass](https://github.com/Arnavion/libjass) library.


## Install

You can get this plugin using either bower or npm:

`bower install videojs-ass`

`npm install videojs-ass`


## Usage

Initialize the `ass` plugin with the `src` field like the following:

```
videojs('player_id', {
  plugins: {
    ass: {
      src: 'subs/subtitles.ass'
    }
  }
}
```

| Option      | Default       | Description                                                |
| ----------- | ------------- | ---------------------------------------------------------- |
| src         | -<sup>1</sup> | `.ass` / `.ssa` source.                                    |
| button      | true          | add subtitle display toggle button to video control bar    |
| delay       | 0<sup>2</sup> | delay subtitle rendering by the specfied value in seconds  |
| rate        | 1             | subtitle update speed relative to video playback rate      |
| enableSvg   | true          | see [here][svg-effects] regarding SVG filter               |
| fontMap     | -             | see [here][font-map] regarding using custom web fonts      |
| fontMapById | -             | alternate to above, takes id and runs [this][font-map-el]  |

**Footnotes:**

1. This property is required!
2. Value can be negative

[svg-effects]: https://github.com/Arnavion/libjass/blob/v0.10.0/README.md#what-browser-and-javascript-features-does-libjass-need
[font-map]: https://arnavion.github.io/libjass/api.xhtml#libjass.renderers.RendererSettings.fontMap
[font-map-el]: https://arnavion.github.io/libjass/api.xhtml#libjass.renderers.RendererSettings.makeFontMapFromStyleElement

