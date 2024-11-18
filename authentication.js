import * as dotenv from 'dotenv';
import got from 'got';
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

export async function callback (req, res) {
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (req.query.state === null || req.query.state !== storedState) {
        console.error('State mismatch.');
        return;
    }

    res.clearCookie(stateKey);

    var authOptions = {
        form: {
            code: req.query.code || null,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'content-type': 'application/x-www-form-urlencoded',
        }
    };

    let url = 'https://accounts.spotify.com/api/token';

    try {
        let response = await got.post(url, authOptions);
        if (response.statusCode === 200) {
            res.cookie('auth_token', JSON.parse(response.body).access_token);
            res.redirect('/newreleases');
        } else {
            console.log(`Auth error: ${JSON.stringify(response.body)}`);
        }
    } catch (ex) {
        console.error(`Auth exception: ${JSON.stringify(ex)}`);
    }
}
