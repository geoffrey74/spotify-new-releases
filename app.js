import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import { getArtists } from './artists.js';
import { getAllReleases } from './albums.js';
import { getPlaylistTracks, addTracksToPlaylist } from './playlists.js';
import { login, callback } from './authentication.js';
import * as settings from './settings.js';

const __dirname = path.resolve();

let app = express()
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.urlencoded({ extended: true }));

app.get('/login', login);
app.get('/callback', callback);

app.get('/settings', (req, res) => {
  res.sendFile(__dirname + '/public/settings.html');
});

app.post('/newreleases', (req, res) => {
  app.locals.days = req.body.days;
  app.locals.includeCompilations = req.body.comps == 'on';
  console.log('Days:', app.locals.days);
  console.log('Include compilations:', app.locals.includeCompilations);
  res.sendFile(__dirname + '/public/newreleases.html');
});

app.get('/followed_artists', async (req, res) => {
  let url = `${settings.SPOTIFY_BASE_URL}/me/following?type=artist&limit=50`;
  getArtists(url, req.cookies.auth_token)
    .then((artists) => {
      app.locals.artists = artists;
      res.send(artists);
    })
    .catch((error) => console.error(error));
});

app.get('/new_releases', async (req, res) => {
  let tryoutsUrl = `${settings.SPOTIFY_BASE_URL}/playlists/${settings.PLAYLIST_ID}/tracks?limit=100`;
  let tryoutsTracks = await getPlaylistTracks(tryoutsUrl, req.cookies.auth_token);
  let newReleases = await getAllReleases(app.locals.artists, tryoutsTracks, app.locals.days, req.cookies.auth_token);
  res.send(newReleases);
});

app.post('/addtotryouts', async function (req, res) {
  var response = await addTracksToPlaylist(req.body.trackUris, req.cookies.auth_token);
  res.send(response);
});

console.log('Launching...');
app.listen(8888);
