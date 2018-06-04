/* ------------------------------------------------------------------------- */
/* -------------------------- SEARCH ON-LOAD CODE -------------------------- */
/* ------------------------------------------------------------------------- */
$(document).ready(function () {

    // Parses out the party token from the url
    var partyToken = getPartyToken();

    /* DESC: Set default size for the page */
    var width =  $(".content-box").outerWidth();
    $(".search-content").css("width", width+"px");
    $(".search-content").css("max-width", width+"px");

    /* DESC: Remove the forms default submit action */
    $("#search-form").submit(function(e) {
        e.preventDefault();
    });

    /* DESC: On click, switch the clicked tab */
    $(".search-tab").click(function(){
        if (this != $(".search-curr")) {
            $(".search-curr").removeClass("search-curr");
            $("#" + this.id).addClass("search-curr");
            $(".search-section-cur").removeClass("search-section-cur");
            var section = "." + this.id.split("-")[0] + "-content";
            $(section).addClass("search-section-cur");
        }
    });

    /* DESC: On click, searches and displays all content from the query */
    $("#search-button").click(function() {
        var query = $("#search-query").val();
        if (query == "") {
            $(".open-message").hide();
            removeSearchContent();
            throwAllErrorMessages("SEARCH CANNOT BE EMPTY");
            return;
        }

        var currentMaxResults = 6;
        hideAllErrorMessages();


        $.ajax({
            type: "GET",
            url: "/search",
            data: {
                query: query,
                type: 'all',
                partyToken: partyToken
            }
        }).done( function (data) {
            $(".open-message").hide();
            removeSearchContent();
            if (data.tracks == null)
                throwAllErrorMessages("COULD NOT GET SONGS FROM SPOTIFY");
            else {
                generateSongContent(currentMaxResults, data.tracks);
                generateAlbumContent(currentMaxResults, data.albums);
                generateArtistContent(currentMaxResults, data.artists);
                generatePlaylistContent(currentMaxResults, data.playlists);
            }
        });
  });
});


/* ------------------------------------------------------------------------- */
/* ----------------------- SEARCH SPECIFIC FUNCTIONS ----------------------- */
/* ------------------------------------------------------------------------- */

/*
 * Hides the messages of all section's error text
 */
function hideAllErrorMessages () {
    $("#song-error").hide();
    $("#album-error").hide();
    $("#artist-error").hide();
    $("#playlist-error").hide();
}

/*
 * Writes the message to a specific section's error text
 * @param jQuery $item : jQuery object of where to show text
 * @param String message : the text about what error to display
 */
function throwSingleErrorMessage ($item, message) {
    $item.text(message).show();
}


/*
 * Writes the message to all section's error text
 * @param String message : the text about what error to display
 */
function throwAllErrorMessages (message) {
    $("#song-error").text(message).css("display", "block");
    $("#album-error").text(message).css("display", "block");
    $("#artist-error").text(message).css("display", "block");
    $("#playlist-error").text(message).css("display", "block");
}


/*
 * Removes HTML for all search content
 */
function removeSearchContent () {
    if ($(".song-item") != null)
        $(".song-item").remove();

    if ($("#show-more-song") != null)
        $("#show-more-song").remove();

    if ($(".album-item") != null)
        $(".album-item").remove();

    if ($("#show-more-album") != null)
        $("#show-more-album").remove();

    if ($(".artist-item") != null)
        $(".artist-item").remove();

    if ($("#show-more-artist") != null)
        $("#show-more-artist").remove();
}


/*
 * From information about the songs, generate song HTML from templates
 * @param Integer maxResults : the number of results to be displayed
 * @param Array songData : a list of information about each song
 */
function generateSongContent(maxResults, songData) {
    if (songData.length == 0) {
        throwSingleErrorMessage($("#song-error"), "NO SONGS FOUND");
        return;
    }

    var songTemplate = Handlebars.compile($("#song-item-template").html());
    var songWidth =  $(".content-box").outerWidth() - 16 - 45;

    var m = maxResults < songData.length ? maxResults : songData.length;
    for (var y = 0; y < m; y++) {
        var name = songData[y].songName;

        /* DESC: Template generation per item */
        var artists = artistsToText(songData[y].songArtists);
        var songInfo = {
            NAME: name,
            ARTIST: artists,
            WIDTH: songWidth,
            SONG_ID: songData[y].songId
        };
        var songHtml = songTemplate(songInfo);
        $(".song-content").append(songHtml);
        $("#song-" + songInfo.SONG_ID).bind('click', {songInfo: songData[y]}, onSongClick);
    }

    /* DESC: Creates show more button only if there are more elements to show */
    if (maxResults < songData.length) {
        var viewMoreTemp = Handlebars.compile($("#show-more").html());
        var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE SONGS", ID: "song"});
        $(".song-content").append(viewMoreHtml);
        $("#show-more-song").click(function() {
            $(".song-item").remove();
            $("#show-more-song").remove();
            generateSongContent(maxResults + 6, songData);
        });
    }
}

/*
 * From information about the albums, generate album HTML from templates
 * @param Integer maxResults : the number of results to be displayed
 * @param Array albumData : a list of information about each album
 */
function generateAlbumContent (maxResults, albumData) {
    if (albumData.length == 0) {
        throwSingleErrorMessage($("#album-error"), "NO ALBUMS FOUND");
        return;
    }

    var width =  $(".content-box").outerWidth();

    var albumTemplate = Handlebars.compile($("#album-item-template").html());
    var m = maxResults < albumData.length ? maxResults : albumData.length;
    for (var y = 0; y < m; y++) {
        var currentAlbum = albumData[y];

        /* DESC: Template generation per item */
        var artistsList = artistsToText(currentAlbum.artists);
        var albumInfo = {
            NAME: currentAlbum.name,
            ARTIST: artistsList,
            YEAR: currentAlbum.releaseDate.substring(0,4),
            ALBUM_ID: currentAlbum.id,
            IMG: currentAlbum.image
        };
        var albumHtml = albumTemplate(albumInfo);
        var albumQuery = "#album-" + albumInfo.ALBUM_ID;
        $(".album-content").append(albumHtml);

        /* DESC: Complicated height calculation and setting*/
        var albumItemHeight = $(albumQuery + " > .album-content-section").actual("height");
        var albumItemTextWidth = width - albumItemHeight - 2 - 15;
        var squareCSS = {
            width: albumItemHeight + "px",
            height: albumItemHeight + "px"
        };
        $(albumQuery + " > .album-cover-section > img").css(squareCSS);
        $(albumQuery + " > .album-cover-section").css(squareCSS);
        $(albumQuery + " > .album-content-section").css("width", albumItemTextWidth + "px");
        $(albumQuery).css("visibility", "visible");
        $(albumQuery).hover(function () {
            $(this).find(".album-cover-section").css({
                "border": "1px solid #222b2f",
                "backgroundColor" : "#222b2f"
            });
            $(this).find(".album-content-section").css({
                "border" : "1px solid #222b2f",
                "backgroundColor" : "#222b2f"
            });

        }, function () {
            $(this).find(".album-cover-section").css("border", "1px solid #f6ca5a");
            $(this).find(".album-content-section").css({
                "border" : "1px solid #f6ca5a",
                "backgroundColor" : "transparent"
            });
        });

        $(albumQuery).bind('click', {albumInfo: albumData[y]}, function (event) {
            var partyToken = eventGetPartyToken(event);
            window.location.href = "/party/" + partyToken + "/search/album/" + event.data.albumInfo.id ;
        });
    }

    /* DESC: Creates show more button only if there are more elements to show */
    if (maxResults < albumData.length) {
        var viewMoreTemp = Handlebars.compile($("#show-more").html());
        var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE ALBUMS", ID: "album"});
        $(".album-content").append(viewMoreHtml);
        $("#show-more-album").click(function() {
            $(".album-item").remove();
            $("#show-more-album").remove();
            generateAlbumContent(maxResults + 6, albumData);
        });
    }
}


/*
 * From information about the playlist, generate playlist HTML from templates
 * @param Integer maxResults : the number of results to be displayed
 * @param Array playlistData : a list of information about each playlist
 */
function generatePlaylistContent(maxResults, playlistData) {
    if (playlistData.length == 0) {
        throwSingleErrorMessage($("#playlist-error"), "NO PLAYLISTS FOUND");
        return;
    }

    var width = $(".content-box").outerWidth();

    var playlistTemplate = Handlebars.compile($("#playlist-item-template").html());
    var m = maxResults < playlistData.length ? maxResults : playlistData.length;
    for (var y = 0; y < m; y++) {
        var currentPlaylist = playlistData[y];

        /* DESC: Template generation per item */
        var playlistInfo = {
            NAME: currentPlaylist.name,
            CREATOR: currentPlaylist.ownerName.toUpperCase(),
            COUNT: currentPlaylist.songCount,
            PLAYLIST_ID: currentPlaylist.id,
            IMG: currentPlaylist.image
        };
        var playlistHtml = playlistTemplate(playlistInfo);
        var playlistQuery = "#playlist-" + playlistInfo.PLAYLIST_ID;
        $(".playlist-content").append(playlistHtml);

        /* DESC: Complicated height calculation and setting*/
        var playlistItemHeight = $(playlistQuery + " > .playlist-content-section").actual("height");
        var playlistItemTextWidth = width - playlistItemHeight - 2 - 15;
        var squareCSS = {
            width: playlistItemHeight + "px",
            height: playlistItemHeight + "px"
        };
        $(playlistQuery + " > .playlist-cover-section > img").css(squareCSS);
        $(playlistQuery + " > .playlist-cover-section").css(squareCSS);
        $(playlistQuery + " > .playlist-content-section").css("width", playlistItemTextWidth + "px");
        $(playlistQuery).css("visibility", "visible");

        /* DESC: Making the elments hoverable */
        $(playlistQuery).hover(function () {
            $(this).find(".playlist-cover-section").css({
                "border": "1px solid #222b2f",
                "backgroundColor" : "#222b2f"
            });

            $(this).find(".playlist-content-section").css({
                "border" : "1px solid #222b2f",
                "backgroundColor" : "#222b2f"
            });

        }, function () {
            $(this).find(".playlist-cover-section").css("border", "1px solid #f6ca5a");
            $(this).find(".playlist-content-section").css({
                "border" : "1px solid #f6ca5a",
                "backgroundColor" : "transparent"
            });
        });

        $(playlistQuery).bind('click', {playlistInfo: playlistData[y]}, function (event) {
            var partyToken = eventGetPartyToken(event);
            window.location.href = "/party/" + partyToken + "/search/playlist/" + event.data.playlistInfo.id ;
        });
    }

    /* DESC: Creates show more button only if there are more elements to show */
    if (maxResults < playlistData.length) {
        var viewMoreTemp = Handlebars.compile($("#show-more").html());
        var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE PLAYLISTS", ID: "playlist"});
        $(".playlist-content").append(viewMoreHtml);
        $("#show-more-playlist").click(function() {
            $(".playlist-item").remove();
            $("#show-more-playlist").remove();
            generatePlaylistContent(maxResults + 6, playlistData);
        });
    }

}


/*
 * From information about the artists, generate artist HTML from templates
 * @param Integer maxResults : the number of results to be displayed
 * @param Array artistData : a list of information about each artist
 */
function generateArtistContent(maxResults, artistData) {
    if (artistData.length == 0) {
        throwSingleErrorMessage($("#artist-error"), "NO ARTISTS FOUND");
        return;
    }

    var width =  $(".content-box").outerWidth();

    var artistTemplate = Handlebars.compile($("#artist-item-template").html());
    var m = maxResults < artistData.length ? maxResults : artistData.length;
    var maxSize = 0;
    for (var y = 0; y < m; y++) {
        var currentArtist = artistData[y];
        var artistInfo = {
            NAME: currentArtist.name,
            ID: currentArtist.id,
            IMG: currentArtist.image || "https://i.imgur.com/Q04jr6Q.png"
        };
        var artistHtml = artistTemplate(artistInfo);
        $(".artist-content-rows").append(artistHtml);
        var tempHeight = parseInt($("#artist-" + artistInfo.ID).actual("height"));

        /* DESC: Makes every item the same height equal to the largest */
        if (maxSize < tempHeight) {
            maxSize = tempHeight;
            $(".artist-item").css("height", maxSize);
        }
        $("#artist-" + artistInfo.ID).bind('click', {artistInfo: artistData[y]}, function (event) {
            var partyToken = eventGetPartyToken(event);
            window.location.href = "/party/" + partyToken + "/search/artist/" + event.data.artistInfo.id ;
        });
    }

    /* DESC: Creates show more button only if there are more elements to show */
    if (maxResults < artistData.length) {
        var viewMoreTemp = Handlebars.compile($("#show-more").html());
        var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE ARTISTS", ID: "artist"});
        $(".artist-content-rows").append(viewMoreHtml);
        $("#show-more-artist").click(function() {
            $(".artist-item").remove();
            $("#show-more-artist").remove();
            generateArtistContent(maxResults + 6, artistData);
        });
    }
}
