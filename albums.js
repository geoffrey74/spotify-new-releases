import got from "got";
import { SPOTIFY_BASE_URL, DAY_COUNT } from "./settings.js";

export class Album {
  constructor(id, name, release_date, artists, image, tracks) {
    this.id = id;
    this.name = name;
    this.release_date = release_date;
    this.artists = artists;
    this.image = image;
    this.tracks = tracks;
  }
}

export class Track {
  constructor(uri, name, on_tryouts) {
    this.uri = uri;
    this.name = name;
    this.on_tryouts = on_tryouts;
  }
}

let ALBUMS = [];
let TRYOUTS_TRACKS = [];

let dateCutoff = new Date();
dateCutoff.setDate(dateCutoff.getDate() - DAY_COUNT);

export async function getAllReleases(artists, tryouts_tracks, token) {
  TRYOUTS_TRACKS = tryouts_tracks;
  let releaseTracker = [];
  for (let a of artists) {
    let url = `${SPOTIFY_BASE_URL}/artists/${a.id}/albums?limit=20`;
    let response = await got(url, { headers: { 'Authorization': 'Bearer ' + token } });
    for (let b of JSON.parse(response.body).items) {
      if (new Date(b.release_date) >= dateCutoff
        && b.album_type !== 'compilation'
        && !releaseTracker.includes(b.id)) {
        releaseTracker.push(b.id);
        let artistNames = [];
        for (let n of b.artists) artistNames.push(n.name);
        let tracks = await getAlbumTracks(b, token);
        let release = new Album(b.id, b.name, b.release_date, artistNames.join(' / '), b.images[1]?.url, tracks);
        ALBUMS.push(release);
      }
    }
  }
  console.log(`${ALBUMS.length} new releases available!`);
 return ALBUMS;
};

async function getAlbumTracks(album, token) {
  let tracks = [];
  let url = `${SPOTIFY_BASE_URL}/albums/${album.id}/tracks?limit=50`;
  while (url) {
    await got(url, { headers: { 'Authorization': 'Bearer ' + token } })
      .then((response) => {
        let tracksPage = JSON.parse(response.body);
        for (let t of tracksPage.items) {
          let on_tryouts = TRYOUTS_TRACKS.includes(t.uri);
          let track = new Track(t.uri, t.name, on_tryouts);
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
