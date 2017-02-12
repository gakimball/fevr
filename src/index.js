import { Client as Discogs } from 'disconnect';
import find from 'lodash.find';
import flatten from 'lodash.flatten';
import SpotifyWebApi from 'spotify-web-api-node';
import table from 'markdown-table';

/**
 * Track parser class.
 */
module.exports = class Fevr {
  /**
   * Create a new parser instance.
   * @param {Object} opts - Parser options.
   * @param {String} opts.discogsKey - Discogs API key.
   * @param {String} opts.discogsSecret - Discogs API secret.
   * @param {String} opts.spotifyKey - Spotify API key.
   * @param {String} opts.spotifySecret - Spotify API secret.
   */
  constructor(opts) {
    const discogs = new Discogs({
      consumerKey: opts.discogsKey,
      consumerSecret: opts.discogsSecret
    });

    this.db = discogs.database();
    this.collection = discogs.user().collection();
    this.spotify = new SpotifyWebApi({
      clientId: opts.spotifyKey,
      clientSecret: opts.spotifySecret
    });
  }

  /**
   * Get the audio data for all tracks in a user's Discogs collection.
   * @param {String} user - Discogs username.
   * @param {Integer} [collection=0] - Discogs collection ID.
   * @returns {Promise.<Object[]>} List of track metadata.
   */
  get(user, collection = 0) {
    return this.getDiscogsCollection(user, collection)
      .then(this.getDiscogsTracks)
      .then(this.authenticateSpotify)
      .then(this.doSpotifySearches)
      .then(this.getAudioFeatures)
      .catch(err => console.log(err));
  }

  /**
   * Format a list of tracks into a table displaying track title, artist, album, and BPM.
   * @param {Object[]} tracks - List of tracks.
   * @returns {String} Formatted table.
   * @todo Add sorting options.
   */
  format(tracks) {
    return table(
      [['Artist', 'Album', 'Track', 'BPM']].concat(tracks.map(track =>
        [track.artist, track.album, track.title, track.tempo]
      ))
    );
  }

  // Get a Discogs collection for a specific user
  getDiscogsCollection = (user, id) => {
    return this.collection.getReleases(user, id);
  }

  // Collect track metadata
  getDiscogsTracks = (res) => {
    return Promise.all(res.releases.slice(0, 10).map((release, index, arr) => {
      console.log(`Fetching release ${index + 1}/${arr.length} ${release.id}`);
      return this.db.getRelease(release.id).then(res => res.tracklist.map(track => ({
        artist: res.artists[0].name.replace(/ \([\d]+\)$/, ''),
        album: res.title,
        title: track.title
      })));
    }));
  }

  // Authenticate with Spotify
  authenticateSpotify = (tracks) => {
    return this.spotify.clientCredentialsGrant().then(data => {
      this.spotify.setAccessToken(data.body.access_token);
      return tracks;
    });
  }

  // For each Discogs track, use the track + artist name to search Spotify for a match
  doSpotifySearches = (res) => {
    const trax = flatten(res);
    return Promise.all(trax.slice(0, 10).map(track => {
      console.log(`Fetching track "${track.title}" by ${track.artist}`);
      return this.spotify.searchTracks(`track:${track.title} artist:${track.artist}`).then(({ body }) => {
        const tracks = body.tracks.items;
        if (tracks.length > 0) {
          return Object.assign({}, track, {id: tracks[0].id});
        }
        return null;
      });
    }));
  }

  // Using Spotify track IDs, fetch all advanced audio metadata for each track
  getAudioFeatures = (tracks) => {
    return this.spotify.getAudioFeaturesForTracks(tracks.map(t => t.id)).then(({body}) => {
      return tracks.map(track =>
        Object.assign({}, track, find(body.audio_features, { id: track.id }))
      );
    });
  }
};
