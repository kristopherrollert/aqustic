/* -------------------------------------------------------------------------- */
/* -------------------------- ALBUM ON-LOAD CODE -------------------------- */
/* -------------------------------------------------------------------------- */
$(document).ready(function() {

    openLoadingScreen();
    var albumId = getUrlId();
    var partyToken = getPartyToken();
    setHeaderLinks(partyToken);

    /* DESC: If there is no album id then throw error */
    if (albumId == null || albumId == undefined) {
        console.log("NO ALBUM GIVEN");
        return;
    }

    /* DESC: Pull album data and generate HTML content */
    $.ajax({
        type: "GET",
        url: "/search/album/" + albumId,
        data: {
            partyToken : partyToken
        }
    }).done(function(data) {
        if (data.hasOwnProperty("error")) {
            $(".content-box").hide();
            $("#album-error").text(data.error).show();
            setTimeout(closeLoadingScreen, 1000);
        }
        else {
            var maxResults = 4;
            generateHeader(data.albumName, data.artists, data.image);
            generateAlbumTracks(data.tracks);
            setTimeout(closeLoadingScreen, 1000);
        }
    });
});

/* -------------------------------------------------------------------------- */
/* ----------------------- ALBUM SPECIFIC FUNCTIONS ------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Generates header HTML
 * @param {String} name : the name of the
 * @param {Array} artists : a list of artist objects
 * @param {String} img : the url (or null) of the image
 */
function generateHeader(name, artists, img) {
    var headerTemplate = Handlebars.compile($("#content-header-temp").html());
    var headerInfo = {
        NAME: name,
        ARTISTS : artistsToText(artists),
        IMG: img
    };
    var headerHtml = headerTemplate(headerInfo);
    $(".content-header-section").append(headerHtml);
}

/**
 * Generates HTML from a list of tracks
 * @param {Array} tracks : a list of tracks on the album to display
 */
function generateAlbumTracks(tracks) {
    var trackTemplate = Handlebars.compile($("#album-song-temp").html());
    for (var i = 0; i < tracks.length; i++) {
        var currentTrack = tracks[i];
        var trackInfo = {
            NAME: currentTrack.songName,
            ARTISTS: artistsToText(currentTrack.songArtists),
            NUMBER: (i + 1),
            SONG_ID: currentTrack.songId
        };
        var trackHtml = trackTemplate(trackInfo);
        $(".album-songs-content").append(trackHtml);
        $("#song-" + trackInfo.SONG_ID).bind('click', {songInfo: currentTrack}, onSongClick);

    }
}
