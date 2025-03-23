import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as config from './config.js';

import { getUser } from './users.js';
import { getArtists } from './artists.js';
import { getAllMockReleases, getAllReleases } from './albums.js';
import { getPlaylistTracks, addTracksToPlaylist } from './playlists.js';
import { login, callback } from './authentication.js';

const __dirname = path.resolve();

const app = express()
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(express.json());

app.get('/favicon.ico', (_req, res) => res.status(204));

app.get('/login', login);
app.get('/callback', callback);

app.get('/user-data', (req, res) => {
  res.send(getUser(`${config.SPOTIFY_BASE_URL}/me`, req.cookies.auth_token));
});

app.get('/settings', (_req, res) => {
  res.sendFile(__dirname + '/public/settings.html');
});

app.post('/settings', (req, res) => {
  app.locals.settings = {
    days: req.body['days'],
    includeCompilations: req.body['include-comps'] == 'on',
    debug: req.body['debug'] == 'on'
  };
  console.log('Settings', app.locals.settings);
  res.send(JSON.stringify('Settings saved'));
});

app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/public/newreleases.html');
});

app.get('/followed-artists', async (req, res) => {
  getArtists(`${config.SPOTIFY_BASE_URL}/me/following?type=artist&limit=50`, req.cookies.auth_token)
    .then((artists) => {
      app.locals.artists = artists;
      res.send(artists);
    })
    .catch((error) => console.error(error));
});

app.get('/new-releases', async (req, res) => {
  if (req.query.debug) res.send(await getAllMockReleases());
  else {
    const tryoutsUrl = `${config.SPOTIFY_BASE_URL}/playlists/${config.PLAYLIST_ID}/tracks?limit=100`;
    const tryoutsTracks = await getPlaylistTracks(tryoutsUrl, req.cookies.auth_token);
    res.send(await getAllReleases(app.locals.artists, app.locals.settings, tryoutsTracks, req.cookies.auth_token));
  }
});

app.post('/tryouts', async (req, res) => {
  const response = await addTracksToPlaylist(req.body.trackUris, req.cookies.auth_token);
  res.send(response);
});

console.log('Launching...');
app.listen(8888);
