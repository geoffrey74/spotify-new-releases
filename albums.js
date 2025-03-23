import got from "got";
import * as config from "./config.js";
import { mock_releases } from "./mocks.js";
import { Album, Track } from "./models.js";

let _albums = [];
let _tryoutsTracks = [];

export const getAllReleases = async (artists, settings, tryoutsTracks, token) => {
  _tryoutsTracks = tryoutsTracks;
  let releaseTracker = [];
  let dateCutoff = new Date();
  dateCutoff.setDate(dateCutoff.getDate() - settings.days);
  
  for (const a of artists) {
    const url = `${config.SPOTIFY_BASE_URL}/artists/${a.id}/albums?limit=20`;
    const response = await got(url, { headers: { 'Authorization': 'Bearer ' + token } });
    for (const b of JSON.parse(response.body).items) {
      if (new Date(b.release_date) >= dateCutoff
        && (b.album_type !== 'compilation' || settings.includeCompilations)
        && !releaseTracker.includes(b.id)) {
        releaseTracker.push(b.id);
        let artistNames = [];
        for (const n of b.artists) artistNames.push(n.name);
        const tracks = await getAlbumTracks(b, token);
        const release = new Album(b.id, b.name, b.release_date, artistNames.join(' / '), b.images[1]?.url, tracks);
        _albums.push(release);
      }
    }
  }
  console.log(`${_albums.length} new releases available!`);
 return _albums;
};

const getAlbumTracks = async (album, token) => {
  let tracks = [];
  let url = `${config.SPOTIFY_BASE_URL}/albums/${album.id}/tracks?limit=50`;
  while (url) {
    await got(url, { headers: { 'Authorization': 'Bearer ' + token } })
      .then((response) => {
        const tracksPage = JSON.parse(response.body);
        for (const t of tracksPage.items) {
          const onTryouts = _tryoutsTracks.includes(t.uri);
          const track = new Track(t.uri, t.name, onTryouts);
          tracks.push(track);
          url = tracksPage.next;
        }
      })
      .catch((error) => console.error(error))
  }
  return tracks;
};

export const getAllMockReleases = () => {
  return mock_releases;
}
