import * as dotenv from 'dotenv';
dotenv.config();

export const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
export const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;
export const DAY_COUNT = parseInt(process.argv[2]) || 7;

export const INCLUDE_COMPILATIONS = false;
