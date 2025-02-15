import * as dotenv from 'dotenv';
import got from 'got';

dotenv.config();

var clientId = process.env.SPOTIFY_CLIENT_ID;
var clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
var redirectPort = 8888;
var redirectUri = `http://127.0.0.1:${redirectPort}/callback`;
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
        new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state
          }));
};

export async function callback (req, res) {
    var authOptions = {
        form: {
            code: req.query.code || null,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64')),
            'content-type': 'application/x-www-form-urlencoded',
        }
    };

    let url = 'https://accounts.spotify.com/api/token';

    try {
        let response = await got.post(url, authOptions);
        if (response.statusCode === 200) {
            res.cookie('auth_token', JSON.parse(response.body).access_token);
            res.redirect('/settings');
        } else {
            console.log(`Auth error: ${JSON.stringify(response.body)}`);
        }
    } catch (ex) {
        console.error(`Auth exception: ${JSON.stringify(ex)}`);
    }
}
