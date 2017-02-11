require('dotenv').config();
const Discogs = require('disconnect').Client;
const find = require('lodash.find');
const flatten = require('lodash.flatten');
const SpotifyWebApi = require('spotify-web-api-node');
const table = require('markdown-table');

const discogs = new Discogs({
  consumerKey: process.env.DISCOGS_KEY,
  consumerSecret: process.env.DISCOGS_SECRET
});
const db = discogs.database();
const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_KEY,
  clientSecret: process.env.SPOTIFY_SECRET
});

getDiscogsCollection('gakimball', 0)
  .then(getDiscogsTracks)
  .then(authenticateSpotify)
  .then(doSpotifySearches)
  .then(getAudioFeatures)
  .then(printTable)
  .catch(err => console.log(err));

// Get a Discogs collection for a specific user
function getDiscogsCollection(user, id) {
  return discogs.user().collection().getReleases(user, id);
}

// Collect track metadata
function getDiscogsTracks(res) {
  return Promise.all(res.releases.slice(0, 10).map((release, index, arr) => {
    console.log(`Fetching release ${index + 1}/${arr.length} ${release.id}`);
    return db.getRelease(release.id).then(res => res.tracklist.map(track => ({
      artist: res.artists[0].name.replace(/ \([\d]+\)$/, ''),
      album: res.title,
      title: track.title
    })));
  }));
}

// Authenticate with Spotify
function authenticateSpotify(tracks) {
  return spotify.clientCredentialsGrant().then(data => {
    spotify.setAccessToken(data.body.access_token);
    return tracks;
  });
}

// For each Discogs track, use the track + artist name to search Spotify for a match
function doSpotifySearches(res) {
  const trax = flatten(res);
  return Promise.all(trax.slice(0, 10).map(track => {
    console.log(`Fetching track "${track.title}" by ${track.artist}`);
    return spotify.searchTracks(`track:${track.title} artist:${track.artist}`).then(({body}) => {
      const tracks = body.tracks.items;
      if (tracks.length > 0) {
        return Object.assign({}, track, {id: tracks[0].id});
      }
      return null;
    });
  }));
}

// Using Spotify track IDs, fetch all advanced audio metadata for each track
function getAudioFeatures(tracks) {
  return spotify.getAudioFeaturesForTracks(tracks.map(t => t.id)).then(({body}) => {
    return tracks.map(track => Object.assign({}, track, find(body.audio_features, {id: track.id})));
  });
}

// Finally, print a table with (some of) the information
function printTable(tracks) {
  console.log(
    table(
      [['Artist', 'Album', 'Track', 'BPM']].concat(tracks.map(track =>
        [track.artist, track.album, track.title, track.tempo]
      ))
    )
  );
}
