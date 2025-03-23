const run = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugEnabled = urlParams.get('debug');
    if (!debugEnabled) {
        const followedArtists = await $.ajax({ url: '/followed-artists' });
        cycleArtistPhotos(followedArtists);
    }
    loadNewReleases(debugEnabled);
};

const cycleArtistPhotos = (artists) => {
    let i = 0;
    const cycleImage = () => {
        if ($('#loader').attr('class') === 'loading') {
            $('#artist-image').attr('src', artists[i]?.image);
            $('#artist-name').html(artists[i]?.name);
            if (i++ === artists.length) i = 0;
        }
    }
    setInterval(cycleImage, 500);
}

const newReleaseContainerString = '                 \
    <div id="new-release-container">                \
        <hr>                                        \
        <div class="album-data">                    \
        <h3 class="album-header title"></h3>        \
        <h4 class="album-header artists"></h4>      \
        <h5 class="album-header release-date"></h5> \
        <div class="art-tracks">                    \
            <img class="album-art"/>                \
            <div class="track-data">                \
        </div>                                      \
    </div>';

const loadNewReleases = async (debugEnabled) => {
    const url = debugEnabled ? '/new-releases?debug=true' : '/new-releases';
    const newReleases = await $.ajax({ url: url });

    $('#loader').attr('class', 'hidden');

    newReleases.forEach(release => {
        let newReleaseContainer = $(newReleaseContainerString);
        newReleaseContainer.attr('id', release.id);
        newReleaseContainer.attr('class', 'new-release-container')
        newReleaseContainer.find('.title').html(release.name);
        newReleaseContainer.find('.artists').html(release.artists);
        newReleaseContainer.find('.release-date').html(release.releaseDate);
        newReleaseContainer.find('.album-art').attr('src', release.image);

        let tracksAlreadyAdded = 0;
        for (const t of release.tracks) {
            let trackElement = $(`<p id="${t.uri}" class="track">${t.name}</p>`);
            if (t.onTryouts) {
                trackElement.html('&#x2714; ' + t.name);
                trackElement.attr('on-tryouts', 'true');
                tracksAlreadyAdded++;
            } else {
                trackElement.click(handleAddTrack);
            }
            newReleaseContainer.find('.track-data').append(trackElement);
        }
        if (tracksAlreadyAdded < release.tracks.length) {
            newReleaseContainer.find('.album-art').click(handleAddAlbum);
        }

        $('#new-releases').append(newReleaseContainer);
    });
}

const handleAddAlbum = (event) => {
    let unaddedTrackElements = [];
    const allTrackElements = Array.from(event.target.nextElementSibling.children);
    for (const e of allTrackElements) {
        if (!$(e).attr('on-tryouts')) unaddedTrackElements.push(e)
    }
    addTracksToTryouts(unaddedTrackElements);
}

const handleAddTrack = (event) => {
    addTracksToTryouts([event.target]);
}

const addTracksToTryouts = (elements) => {
    const trackIds = elements.map(e => e.id);
    $.ajax({
        url: '/tryouts',
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify({ "trackUris": trackIds }),
        success: () => applyAddedStyling(elements),
        fail: (error) => {
            for (const e of elements) { e.style.color = 'red' };
            console.log(error);
        }
    });
}

const applyAddedStyling = (elements) => {
    for (const e of elements) {
        $(e).html(`&#x2714; ${$(e).html()}`);
        $(e).off('click');
        $(e).attr('on-tryouts', '');
    };
}
