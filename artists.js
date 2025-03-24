import got from 'got';
import { Artist } from './models.js';

let _artists = [];

export const getArtists = async (url, token) => {
    const response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const artistsPage = JSON.parse(response.body).artists;
    for (const a of artistsPage.items) {
        const img = (a.images !== 'undefined' && a.images.length > 1) ? a.images[1].url : "";
        _artists.push(new Artist(a.id, a.name, img));
    }
    if (artistsPage.next) return getArtists(artistsPage.next, token);
    else console.log(`Artist count: ${_artists.length}`);
    
    return _artists;
}
