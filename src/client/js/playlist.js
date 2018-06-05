/* -------------------------------------------------------------------------- */
/* -------------------------- PLAYLIST ON-LOAD CODE ------------------------- */
/* -------------------------------------------------------------------------- */
$(document).ready(function() {

    openLoadingScreen();
    var playlistInfo = getUrlId().split("-");
    var playlistId = playlistInfo[0];
    var userId = playlistInfo[1];
    var partyToken = getPartyToken();
    setHeaderLinks(partyToken);

    /* DESC: If there is no playlist id then throw error */
    if (playlistId == null || playlistId == undefined) {
        $(".content-box").hide();
        $("#playlist-error").text("NO PLAYLIST GIVEN").show();
        setTimeout(closeLoadingScreen, 1000);
    }

    /* DESC: Pull playlist data and generate HTML content */
    $.ajax({
        type: "GET",
        url: "/search/playlist/" + playlistId,
        data: {
            partyToken : partyToken,
            userId: userId
        }
    }).done(function(data) {
        console.log(data);
        if (data.hasOwnProperty("error")) {
            $(".content-box").hide();
            $("#playlist-error").text(data.error).show();
            setTimeout(closeLoadingScreen, 1000);
        }
        else {
            var maxResults = 4;
            generateHeader(data.name, data.creator, data.image);
            generatePlaylistTracks(data.tracks);
            setTimeout(closeLoadingScreen, 1000);
        }
    });
});

/* -------------------------------------------------------------------------- */
/* ----------------------- PLAYLIST SPECIFIC FUNCTIONS ---------------------- */
/* -------------------------------------------------------------------------- */

/*
 * Generates header HTML
 * @param String name : the name of the
 * @param Array artists : a list of artist objects
 * @param String img : the url (or null) of the image
 */
function generateHeader(name, creator, img) {
    var headerTemplate = Handlebars.compile($("#content-header-temp").html());
    var headerInfo = {
        NAME: name,
        CREATOR : creator,
        IMG: img
    };
    var headerHtml = headerTemplate(headerInfo);
    $(".content-header-section").append(headerHtml);
}

/*
 * Generates HTML from a list of tracks
 * @param Array tracks : a list of tracks on the playlist to display
 */
function generatePlaylistTracks(tracks) {
    var trackTemplate = Handlebars.compile($("#playlist-song-temp").html());
    for (var i = 0; i < tracks.length; i++) {
        var currentTrack = tracks[i];
        var trackInfo = {
            NAME: currentTrack.songName,
            ARTISTS: artistsToText(currentTrack.songArtists),
            NUMBER: (i + 1),
            SONG_ID: currentTrack.songId
        };
        var trackHtml = trackTemplate(trackInfo);
        $(".playlist-songs-content").append(trackHtml);
        $("#song-" + trackInfo.SONG_ID).bind('click', {songInfo: currentTrack}, onSongClick);

    }
}
