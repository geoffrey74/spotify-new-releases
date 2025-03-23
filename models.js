export class Artist {
    constructor(id, name, image) {
        this.id = id;
        this.name = name;
        this.image = image;
    }
}

export class Album {
    constructor(id, name, releaseDate, artists, image, tracks) {
      this.id = id;
      this.name = name;
      this.releaseDate = releaseDate;
      this.artists = artists;
      this.image = image;
      this.tracks = tracks;
    }
  }
  
  export class Track {
    constructor(uri, name, onTryouts) {
      this.uri = uri;
      this.name = name;
      this.onTryouts = onTryouts;
    }
  }
