async function beginPageLoad() {
    let artists = await $.ajax({ url: '/followed_artists' });
    cycleArtistPhotos(artists);
    loadNewReleases();
}

function cycleArtistPhotos(artists) {
    var imageElement = document.getElementById('artist-image');
    var artistName = document.getElementById('artist-name');
    var i = 1;
    cycleImage = () => {
        if (imageElement.attributes['loading'].value === 'true') {
            if (artists[i]) {
                imageElement.src = artists[i].image;
                artistName.innerText = artists[i].name;
            }
            if (i++ === artists.length - 1) i = 0;
        }
    }
    setInterval(cycleImage, 500);
    cycleImage();
}

async function loadNewReleases() {
    let newReleases = await $.ajax({ url: '/new_releases' });

    let imageElement = document.getElementById('artist-image');
    imageElement.setAttribute('loading', 'false');

    let newReleasesSource = document.getElementById('new-releases-template').innerHTML,
        newReleaseTemplate = Handlebars.compile(newReleasesSource),
        newReleasesPlaceholder = document.getElementById('new-releases');

    newReleasesPlaceholder.innerHTML = newReleaseTemplate(newReleases);
    let tracks = document.getElementsByClassName('track');
    Array.from(tracks).forEach(track => {
        if (track.hasAttribute('on-tryouts')) {
            track.innerHTML = '&#x2714; ' + track.innerHTML;
        } else {
            track.addEventListener('click', addToTryouts);
        }
    });
    let albumArts = document.getElementsByClassName('album-art');
    Array.from(albumArts).forEach(albumArt => {
        let trackElements = Array.from(albumArt.nextElementSibling.children);
        let tracksAlreadyAdded = 0;
        trackElements.forEach(trackElement => {
            if (trackElement.hasAttribute('on-tryouts')) {
                tracksAlreadyAdded++;
            }
        });
        if (tracksAlreadyAdded < trackElements.length) {
            albumArt.addEventListener('click', addToTryouts)
        }
    });
}

function addToTryouts(event) {
    var trackUris = [];
    var addType = '';
    switch (event.target.attributes['class'].value) {
        case 'album-art':
            addType = 'album';
            var trackElements = Array.from(event.target.nextElementSibling.children);
            trackElements.forEach(track => {
                if (!track.hasAttribute('on-tryouts')) {
                    trackUris.push(track.id);
                }
            });
            break;
        case 'track':
            addType = 'track';
            trackUris = [event.target.id];
            break;
        default:
            trackUris = null;
            console.warn('No track associated with object.');
            return;
    }

    $.ajax({
        url: '/addtotryouts',
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({ "trackUris": trackUris }),
        success: function (res) {
            if (addType === 'album') {
                trackElements.forEach(trackElement => {
                    if (!trackElement.hasAttribute('on-tryouts')) {
                        applyAddedStyling(trackElement);
                    }
                });
            } else if (addType === 'track') {
                applyAddedStyling(event.target);
            }
        },
        fail: function(error) {
            event.target.style.color = 'red';
            console.log(error);
        }
    });
}

function applyAddedStyling(element) {
    element.innerHTML = '&#x2714; ' + element.innerHTML;
    element.removeEventListener('click', addToTryouts);
    element.setAttribute('on-tryouts', '');
}
