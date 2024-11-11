import * as dotenv from 'dotenv';
import request from 'request';
import { stringify } from 'querystring';

dotenv.config();

var client_id = process.env.SPOTIFY_CLIENT_ID;
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
var redirect_port = 8888;
var redirect_uri = `http://localhost:${redirect_port}/callback`;
var stateKey = 'spotify_auth_state';

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

export function login (req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    var scope = 'user-read-private user-read-email user-library-read playlist-modify-private user-follow-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
};

export function callback (req, res) {
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (req.query.state === null || req.query.state !== storedState) {
        console.error('State mismatch.');
        return;
    }

    res.clearCookie(stateKey);
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: req.query.code || null,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.cookie('auth_token', body.access_token);
            res.redirect('/newreleases');
        } else {
            console.error(`Auth error: ${JSON.stringify(error)}`);
        }
    });
}
