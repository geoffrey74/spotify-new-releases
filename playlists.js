import got from 'got';
import {SPOTIFY_BASE_URL, PLAYLIST_ID} from './settings.js';

let TRACKS = [];
let tryouts = PLAYLIST_ID;

export async function getPlaylistTracks(url, token) {
  let response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
  let tracksPage = JSON.parse(response.body);
  for (let t of tracksPage.items) {
    TRACKS.push(t.track.uri);
  }
  if (tracksPage.next) return getPlaylistTracks(tracksPage.next, token);
  
  return TRACKS;
}

export async function addTracksToPlaylist(trackIds, token) {
  let url = `${SPOTIFY_BASE_URL}/playlists/${tryouts}/tracks`;
  var options = {
    headers: { 'Authorization': 'Bearer ' + token },
    json: { 'uris': trackIds }
  };

  await got.post(url, options);
}
