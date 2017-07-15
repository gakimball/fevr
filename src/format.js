import table from 'markdown-table';

/**
 * Format a list of tracks into a table displaying track title, artist, album, and BPM.
 * @param {Object[]} tracks - List of tracks.
 * @returns {String} Formatted table.
 * @todo Add sorting options.
 */
export default function format(tracks) {
  return table(
    [['Artist', 'Album', 'Track', 'BPM']].concat(tracks.map(track =>
      [track.artist, track.album, track.title, track.tempo]
    ))
  );
}
