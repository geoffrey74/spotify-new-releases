import * as dotenv from 'dotenv';
dotenv.config();

export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
export const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;
