import got from 'got';

class Artist {
    constructor(id, name, image) {
        this.id = id;
        this.name = name;
        this.image = image;
    }
}

let ARTISTS = [];

export async function getArtists(url, token) {
    let response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
    let artistsPage = JSON.parse(response.body).artists;
    for (let a of artistsPage.items) {
        let img = (a.images !== 'undefined' && a.images.length > 1) ? a.images[1].url : "";
        ARTISTS.push(new Artist(a.id, a.name, img));
    }
    if (artistsPage.next) {
        return getArtists(artistsPage.next, token);
    } else {
        console.log(`Artist count: ${ARTISTS.length}`);
    }
    
    return ARTISTS;
}
