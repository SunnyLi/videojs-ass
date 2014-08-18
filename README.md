# videojs-ass

Add **Advanced SubStation Alpha (ASS)** subtitles support to
[videojs](https://github.com/videojs/video.js) using the
[libjass](https://github.com/Arnavion/libjass) library.


## Demo

If you are not on a phone or using a very bad browser, come check out the demo
[here](https://sunnyli.github.io/videojs-ass/example.html)


## Install

You can get this plugin using bower or npm,
the latter will build libjass from source

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
