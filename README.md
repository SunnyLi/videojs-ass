# videojs-ass

Add **Advanced SubStation Alpha (ASS)** subtitles support to
[videojs](https://github.com/videojs/video.js) using the
[libjass](https://github.com/Arnavion/libjass) library.

Check out the demo
[here](https://sunnyli.github.io/videojs-ass/example.html)


## Install

For plugin that supports videojs v5.x install using either:

- `bower install videojs-ass`

or

- `npm install videojs-ass`

For videojs v4:

Just specify version to be within:

```
"videojs-ass": ">=0.3.0 < 0.5.0"
```
for bower or npm whichever you prefer using.


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
| label       | -<sup>2</sup> | subtitle track label that shows up in the subtitles picker |
| delay       | 0<sup>3</sup> | delay subtitle rendering by the specified value in seconds |
| rate        | 1             | subtitle update speed relative to video playback rate      |
| enableSvg   | true          | see [here][svg-effects] regarding SVG filter               |
| fontMap     | -             | see [here][font-map] regarding using custom web fonts      |
| fontMapById | -             | alternate to above, takes id and runs [this][font-map-el]  |
| videoWidth  | -<sup>3</sup> | metadata to assist in determining the optimal (cont below) |
| videoHeight | -<sup>3</sup> | (cont) subtitle letterboxing ratio                         |

**Footnotes:**

1. This property is required!
2. Has fallback values but you should provide a better label.
3. Value can be negative
4. Generally, you should set these values when using external videojs providers
   as they might not expose the video dimensions to the player.

[svg-effects]: https://github.com/Arnavion/libjass/blob/v0.10.0/README.md#what-browser-and-javascript-features-does-libjass-need
[font-map]: https://arnavion.github.io/libjass/api.xhtml#libjass.renderers.RendererSettings.fontMap
[font-map-el]: https://arnavion.github.io/libjass/api.xhtml#libjass.renderers.RendererSettings.makeFontMapFromStyleElement
