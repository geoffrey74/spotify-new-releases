import * as dotenv from 'dotenv';
import got from 'got';

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectPort = 8888;
const redirectUri = `http://127.0.0.1:${redirectPort}/callback`;
const stateKey = 'spotify_auth_state';
const scope = 'user-read-private user-read-email user-library-read playlist-modify-private user-follow-read';

export const login = (req, res) => {
    const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const state = [...Array(16)].reduce(a => a + p[Math.floor((Math.random() * p.length))],'');

    res.cookie(stateKey, state);
    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state
          }));
};

export const callback = async (req, res) => {
    const authOptions = {
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

    try {
        const response = await got.post('https://accounts.spotify.com/api/token', authOptions);
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
