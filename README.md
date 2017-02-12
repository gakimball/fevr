# fevr

> Get audio metrics from your Discogs collection

<!-- [![Travis](https://img.shields.io/travis/gakimball/fevr.svg?maxAge=2592000)](https://travis-ci.org/gakimball/fevr) [![npm](https://img.shields.io/npm/v/fevr.svg?maxAge=2592000)](https://www.npmjs.com/package/fevr) -->

Take a folder from a Discogs collection, and get audio metadata from Spotify's API for every track.

**Thing ain't quite done. Don't use it. 💕**

## Installation

```bash
npm i fevr
```

## Usage

You'll need API keys for both Discogs and Spotify. Because this library only culls from public data, no OAuth business is involved in setting things up.

```js
import Fevr from 'fevr';

const f = new Fevr(opts);

f.get('gakimball', 0).then(tracks => {
  // `tracks` is an array of objects
  console.log(f.format(tracks));
});
```

## API

### Fevr(opts)

Create a parser instance with a set of API credentials.

- `opts` (Object): instance options.
  - `opts.discogsKey` (String): Discogs application ID.
  - `opts.discogsSecret` (String): Discogs application secret.
  - `opts.spotifyKey` (String): Spotify application ID.
  - `opts.spotifySecret` (String): Spotify application secret.

#### Fevr.get(user[, folder])

Get track metadata for a user's collection or folder.

- `user` (String): Discogs user.
- `folder` (Integer): Collection folder.
  - `0` gets everything.
  - `1` gets uncategorized records.
  - Or, put in the ID of a specific folder.

Returns a Promise containing an array of objects. Each object is a track with metadata.

#### Fevr.format(tracks)

Format track metadata as an ASCII table. Includes these columns for now:

- Title
- Artist
- Album
- BPM

Returns a string of the table.

## Local Development

```bash
git clone https://github.com/gakimball/fevr
cd fevr
npm install
npm test
```

## License

MIT &copy; [Geoff Kimball](http://geoffkimball.com)
