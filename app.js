import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { getArtists } from './artists.js';
import { getAllReleases } from './albums.js';
import { getPlaylistTracks, addTracksToPlaylist } from './playlists.js';
import { login, callback } from './authentication.js';
import * as config from './config.js';

const __dirname = path.resolve();

let app = express()
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(express.json());

app.get('/login', login);
app.get('/callback', callback);

app.get('/settings', (req, res) => {
  res.sendFile(__dirname + '/public/settings.html');
});

let _settings = {
  days: 7,
  includeCompilations: false
};

app.post('/newreleases', (req, res) => {
  _settings.days = req.body['days'];
  _settings.includeCompilations = req.body['include-comps'] == 'on';
  console.log('Days:', _settings.days);
  console.log('Include compilations:', _settings.includeCompilations);
  res.send(JSON.stringify('Settings saved'));
});

app.get('/newreleases', (req, res) => {
  res.sendFile(__dirname + '/public/newreleases.html');
});

let _artists = [];

app.get('/followed_artists', async (req, res) => {
  let url = `${config.SPOTIFY_BASE_URL}/me/following?type=artist&limit=50`;
  getArtists(url, req.cookies.auth_token)
    .then((artists) => {
      _artists = artists;
      res.send(artists);
    })
    .catch((error) => console.error(error));
});

app.get('/new_releases', async (req, res) => {
  let tryoutsUrl = `${config.SPOTIFY_BASE_URL}/playlists/${config.PLAYLIST_ID}/tracks?limit=100`;
  let tryoutsTracks = await getPlaylistTracks(tryoutsUrl, req.cookies.auth_token);
  let newReleases = await getAllReleases(_artists, _settings, tryoutsTracks, req.cookies.auth_token);
  res.send(newReleases);
});

app.post('/addtotryouts', async function (req, res) {
  var response = await addTracksToPlaylist(req.body.trackUris, req.cookies.auth_token);
  res.send(response);
});

console.log('Launching...');
app.listen(8888);
