import { Album, Track } from './models.js';

export var mock_releases = [
    new Album('1', 'Album 1', '2021-01-01', 'Artist 1', 'https://picsum.photos/300?random=1', 
        [
            new Track('1', 'Track 1', false),
            new Track('2', 'Track 2', true)
        ]), 
    new Album('2', 'Album 2', '2021-01-02', 'Artist 2', 'https://picsum.photos/300?random=2', 
        [
            new Track('3', 'Track 3', false),
            new Track('4', 'Track 4', true)
        ])
];
