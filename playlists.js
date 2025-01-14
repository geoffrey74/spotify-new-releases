import got from 'got';
import * as config from './config.js';

let _tracks = [];

export async function getPlaylistTracks(url, token) {
  let response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
  let tracksPage = JSON.parse(response.body);
  for (let t of tracksPage.items) {
    _tracks.push(t.track.uri);
  }
  if (tracksPage.next) return getPlaylistTracks(tracksPage.next, token);
  
  return _tracks;
}

export async function addTracksToPlaylist(trackIds, token) {
  let url = `${config.SPOTIFY_BASE_URL}/playlists/${config.PLAYLIST_ID}/tracks`;
  var options = {
    headers: { 'Authorization': 'Bearer ' + token },
    json: { 'uris': trackIds }
  };

  await got.post(url, options);
}
