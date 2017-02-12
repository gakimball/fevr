/* global describe it */
import dotenv from 'dotenv';
import { expect } from 'chai';
import Parser from './src';

dotenv.config();

describe('Parser', () => {
  describe('parse()', () => {
    it('works', function() {
      this.timeout(0);

      const p = new Parser({
        discogsKey: process.env.DISCOGS_KEY,
        discogsSecret: process.env.DISCOGS_SECRET,
        spotifyKey: process.env.SPOTIFY_KEY,
        spotifySecret: process.env.SPOTIFY_SECRET
      });

      return p.parse('gakimball', 0).then(res => {
        console.log(res);
        console.log(p.format(res));
        expect(res).to.be.an('array');
      });
    });
  });
});
