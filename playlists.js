import got from 'got';
import * as config from './config.js';

let _tracks = [];

export const getPlaylistTracks = async (url, token) => {
  const response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const tracksPage = JSON.parse(response.body);
  for (const t of tracksPage.items) {
    _tracks.push(t.track.uri);
  }
  if (tracksPage.next) return getPlaylistTracks(tracksPage.next, token);
  return _tracks;
}

export const addTracksToPlaylist = async (trackIds, token) => {
  const url = `${config.SPOTIFY_BASE_URL}/playlists/${config.PLAYLIST_ID}/tracks`;
  const options = {
    headers: { 'Authorization': 'Bearer ' + token },
    json: { 'uris': trackIds }
  };
  await got.post(url, options);
}
