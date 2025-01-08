import got from "got";
import * as settings from "./settings.js";

export class Album {
  constructor(id, name, releaseDate, artists, image, tracks) {
    this.id = id;
    this.name = name;
    this.releaseDate = releaseDate;
    this.artists = artists;
    this.image = image;
    this.tracks = tracks;
  }
}

export class Track {
  constructor(uri, name, onTryouts) {
    this.uri = uri;
    this.name = name;
    this.onTryouts = onTryouts;
  }
}

let _albums = [];
let _tryoutsTracks = [];

export async function getAllReleases(artists, tryoutsTracks, dayCount, token) {
  _tryoutsTracks = tryoutsTracks;
  let releaseTracker = [];
  let dateCutoff = new Date();
  dateCutoff.setDate(dateCutoff.getDate() - dayCount);
  
  for (let a of artists) {
    let url = `${settings.SPOTIFY_BASE_URL}/artists/${a.id}/albums?limit=20`;
    let response = await got(url, { headers: { 'Authorization': 'Bearer ' + token } });
    for (let b of JSON.parse(response.body).items) {
      if (new Date(b.release_date) >= dateCutoff
        && (b.album_type !== 'compilation' || app.locals.includeCompilations)
        && !releaseTracker.includes(b.id)) {
        releaseTracker.push(b.id);
        let artistNames = [];
        for (let n of b.artists) artistNames.push(n.name);
        let tracks = await getAlbumTracks(b, token);
        let release = new Album(b.id, b.name, b.release_date, artistNames.join(' / '), b.images[1]?.url, tracks);
        _albums.push(release);
      }
    }
  }
  console.log(`${_albums.length} new releases available!`);
 return _albums;
};

async function getAlbumTracks(album, token) {
  let tracks = [];
  let url = `${settings.SPOTIFY_BASE_URL}/albums/${album.id}/tracks?limit=50`;
  while (url) {
    await got(url, { headers: { 'Authorization': 'Bearer ' + token } })
      .then((response) => {
        let tracksPage = JSON.parse(response.body);
        for (let t of tracksPage.items) {
          let onTryouts = _tryoutsTracks.includes(t.uri);
          let track = new Track(t.uri, t.name, onTryouts);
          tracks.push(track);
          url = tracksPage.next;
        }
      })
      .catch((error) => {
        console.error(error);
      })
    
  }
  return tracks;
};
