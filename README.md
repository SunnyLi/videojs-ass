# videojs-ass

Add **Advanced SubStation Alpha (ASS)** subtitles support to
[videojs](https://github.com/videojs/video.js) using the
[libjass](https://github.com/Arnavion/libjass) library.

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
