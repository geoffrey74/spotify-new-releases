async function beginPageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');
    if (!debug) {
        let artists = await $.ajax({ url: '/followed_artists' });
        cycleArtistPhotos(artists);
    }
    loadNewReleases(debug);
}

function cycleArtistPhotos(artists) {
    var i = 1;
    cycleImage = () => {
        if ($('#loader').attr('class') === 'loading') {
            if (artists[i]) {
                $('#artist-image').attr('src', artists[i].image);
                $('#artist-name').html(artists[i].name);
            }
            if (i++ === artists.length - 1) i = 0;
        }
    }
    setInterval(cycleImage, 500);
    cycleImage();
}

const newReleaseContainerString = '                 \
    <div id="new-release-container">                \
        <hr>                                        \
        <div class="album-data">                    \
        <h3 class="album-title"></h3>               \
        <h4 class="album-artists"></h4>             \
        <h5 class="album-release-date"></h5>        \
        <div class="art-tracks">                    \
            <img class="album-art"/>                \
            <div class="track-data">                \
        </div>                                      \
    </div>';

async function loadNewReleases(debug) {
    let url = debug ? '/new_releases?debug=true' : '/new_releases';
    let newReleases = await $.ajax({ url: url });

    $('#loader').attr('class', 'hidden');

    newReleases.forEach(release => {
        let newReleaseContainer = $(newReleaseContainerString);
        newReleaseContainer.attr('id', release.id);
        newReleaseContainer.attr('class','new-release-container')
        newReleaseContainer.find('.album-title').html(release.name);
        newReleaseContainer.find('.album-artists').html(release.artists);
        newReleaseContainer.find('.album-release-date').html(release.releaseDate);
        newReleaseContainer.find('.album-art').attr('src', release.image);

        let tracksAlreadyAdded = 0;
        release.tracks.forEach(track => {
            let trackElement = $(`<p id="${track.uri}" class="track">${track.name}</p>`);
            if (track.onTryouts) {
                trackElement.html('&#x2714; ' + track.name);
                trackElement.attr('on-tryouts', 'true');
                tracksAlreadyAdded++;
            } else {
                trackElement.click(addToTryouts);
            }
            newReleaseContainer.find('.track-data').append(trackElement);
        });
        if (tracksAlreadyAdded < release.tracks.length) {
            newReleaseContainer.find('.album-art').click(addToTryouts);
        }

        $('#new-releases').append(newReleaseContainer);
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
