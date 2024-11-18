import express from 'express';
import {json} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { getArtists } from './artists.js';
import { getAllReleases } from './albums.js';
import { getPlaylistTracks, addTracksToPlaylist } from './playlists.js';
import { login, callback } from './authentication.js';
import { SPOTIFY_BASE_URL, PLAYLIST_ID, DAY_COUNT } from './settings.js';

const __dirname = path.resolve();
let ARTISTS = [];
let TRYOUTS = PLAYLIST_ID;

let app = express()
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(json())

app.get('/login', login);
app.get('/callback', callback);

app.get('/newreleases', (req, res) => {
  res.sendFile(__dirname + '/public/newreleases.html',);
});

app.get('/followed_artists', async (req, res) => {
  let url = `${SPOTIFY_BASE_URL}/me/following?type=artist&limit=50`;
  getArtists(url, req.cookies.auth_token)
    .then((artists) => {
      ARTISTS = artists;
      res.send(artists);
    })
    .catch((error) => console.error(error));
});

app.get('/new_releases', async (req, res) => {
  let tryoutsUrl = `${SPOTIFY_BASE_URL}/playlists/${TRYOUTS}/tracks?limit=100`;
  let tryoutsTracks = await getPlaylistTracks(tryoutsUrl, req.cookies.auth_token);
  let newReleases = await getAllReleases(ARTISTS, tryoutsTracks, req.cookies.auth_token);
  res.send(newReleases);
});

app.post('/addtotryouts', async function (req, res) {
  var response = await addTracksToPlaylist(req.body.trackUris, req.cookies.auth_token);
  res.send(response);
});

console.log('Launching...');
console.log('Days:', DAY_COUNT);
app.listen(8888);
