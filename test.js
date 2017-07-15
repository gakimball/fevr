import dotenv from 'dotenv';
import { expect } from 'chai';
import Fevr, { format } from './src';

dotenv.config();

describe('Parser', () => {
  describe('parse()', () => {
    it('works', function() {
      this.timeout(0);

      const f = new Fevr({
        discogsKey: process.env.DISCOGS_KEY,
        discogsSecret: process.env.DISCOGS_SECRET,
        spotifyKey: process.env.SPOTIFY_KEY,
        spotifySecret: process.env.SPOTIFY_SECRET,
      });

      return f.get('gakimball', 0).then(res => {
        console.log(res);
        console.log(format(res));
        expect(res).to.be.an('array');
      });
    });
  });
});
