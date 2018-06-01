/*
 * Connect song object to have album and artist objects
 */

$(document).ready(function() {
    var urlArray = (window.location.pathname).split("/");
    switch (urlArray[1]) {
        case "signup":
            signUpPage();
            break;
        case "signin":
            signInPage();
            break;
        case "home":
            homePage();
            break;
        case "party":
            var partyToken = urlArray[2];
            switch (urlArray[3]) {
                case undefined:
                    partyHomePage(partyToken);
                    break;
                case "search":
                    searchPage(partyToken);
                    break;
                default:
                    alert("cannot find this page!");
                    break;
            }
            break;
        default:
            alert("Cannot find: " + window.location.pathname);
            break;
    }
});

/* ------------------------------------------------------------------------ */
/* -------------------------- PAGE SPECIFIC CODE -------------------------- */
/* ------------------------------------------------------------------------ */

// PLAN !!!!!
// 1. move queue stuff to its own module
// 2. create endpoint to get currentlyPlaying song
// 3. write queue template stuff for home page

function partyHomePage(partyToken) {
    var socket = io.connect('http://localhost:8080');
    socket.on('appendToQueue', function (data) {
        var songList = $(".song-item");
        var queueSongsToAdd = [];
        var queueOffsetFlag = false;
        for (var i = 0; i < data.songQueue.length; i++) {
            if (songList[i] == undefined) {
                queueSongsToAdd.push(data.songQueue[i]);
                continue;
            }
            // parases out "song-" out of the id
            var currentSongId = songList[i].id.slice(5);

            if (currentSongId != data.songQueue[i].songId || queueOffsetFlag) {
                // THERE IS MISS ALIGNMENT
                songList[i].remove();
                queueOffsetFlag = true;
                queueSongsToAdd.push(data.songQueue[i]);
            }
        }

        if (queueSongsToAdd.length > 0) {
            generateQueueContent(queueSongsToAdd);
        }
    });

    socket.on('updateCurrentlyPlaying', function (data) {
        // Pop off first item in stack
        $(".song-item").first().remove();
        var songList = $(".song-item");
        var queueSongsToAdd = [];
        var queueOffsetFlag = false;
        for (var i = 0; i < data.songQueue.length; i++) {
            if (songList[i] == undefined) {
                queueSongsToAdd.push(data.songQueue[i]);
                continue;
            }
            // parases out "song-" out of the id
            var currentSongId = songList[i].id.slice(5);

            if (currentSongId != data.songQueue[i].songId || queueOffsetFlag) {
                // THERE IS MISS ALIGNMENT
                songList[i].remove();
                queueOffsetFlag = true;
                queueSongsToAdd.push(data.songQueue[i]);
            }
        }

        if (queueSongsToAdd.length > 0) {
            generateQueueContent(queueSongsToAdd);
        }

        generateNowPlayingContent(data.currentlyPlaying);
    });

    $(".show-more-button").click(function () {
        $(location).attr('href', "/party/" + partyToken + "/search");
    });

    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/queue"
    }).done(function(data) {
        generateQueueContent(data);
    });

    // Generate
    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/now-playing"
    }).done(function (data) {
        generateNowPlayingContent(data);
    });

    // $.ajax({
    //     type: "GET",
    //     url: "/party/" + partyToken + "/party-info"
    // }).done(function (data) {
    //     generatePartyInfoContent(data);
    // });
}

function generatePartyInfoContent(data) {
    if (data == undefined || data == null) return;
    // -- GENREATE PARTY INFO --
    var partyInfoTemplate = Handlebars.compile($("#party-info-template").html());
    var partyInfo = {
        PARTY_NAME : "Slug Rager",
        PARTY_OWNER : "Ryan Glenn",
    };
    var partyInfoHtml = partyInfoTemplate(partyInfo);
    $(".party-info-section").append(partyInfoHtml);
}

function generateNowPlayingContent(data) {
    if (data == undefined || data == null || data == "") return;
    var songWidth =  $(".content-party-connect").outerWidth();
    var nowPlayingTemplate = Handlebars.compile($("#now-playing-template").html());
    var artists = artistsToText(data.songArtists);
    var nowPlayingInfo = {
        NAME: data.songName,
        ARTIST: artists,
        WIDTH: songWidth
    };

    var nowPlayingHtml = nowPlayingTemplate(nowPlayingInfo);
    $(".now-playing-section").append(nowPlayingHtml);
}

function generateQueueContent(queueInfo) {
    if (queueInfo == undefined || queueInfo == null || queueInfo.length == 0) return;
    var songTemplate = Handlebars.compile($("#song-template").html());
    var songWidth =  $(".content-party-connect").outerWidth();
    var boxSize = (78.22 - 10) / 2;
    //              = boxSize + song default padding + padding between + border
    var discrepancy = boxSize + 15 + 10 + 2;
    var songInfoWidth = songWidth - discrepancy;

    for (var i = 0; i < queueInfo.length; i++ ) {
        var artists = artistsToText(queueInfo[i].songArtists);
        var songInfo = {
            NAME: queueInfo[i].songName,
            ARTIST: artists,
            WIDTH_SONG: songInfoWidth,
            BOX_SIZE: boxSize,
            SONG_ID: queueInfo[i].songId
        };

        var songHtml = songTemplate(songInfo);
        $(".song-queue-list").append(songHtml);

        $("#vote-song-" + songInfo.SONG_ID+" > .like-button").bind('click', {queueIndex: i}, function (event){

            var path = event.view.window.location.pathname;
            path = path.split("/");
            var partyToken = path[2];
            var songId = songInfo.SONG_ID;
            $.ajax({
                type: "PUT",
                url: "/party/" + partyToken + "/vote",
                data: {
                    queueIndex: event.data.queueIndex,
                    isLike: true,
                }
            }).done(function(data) {
                //Here you kris
                console.log("liked")
            });
        });

        $("#vote-song-" + songInfo.SONG_ID+" > .dislike-button").bind('click', {queueIndex: i}, function (event){

            var path = event.view.window.location.pathname;
            path = path.split("/");
            var partyToken = path[2];
            var songId = songInfo.SONG_ID;
            $.ajax({
                type: "PUT",
                url: "/party/" + partyToken + "/vote",
                data: {
                    queueIndex: event.data.queueIndex,
                    isLike: false,
                }
            }).done(function(data) {
                //Also for you kris
                console.log("disliked")
            });
        });

    }
}

/*
 * signup page: password length and username length control
 */
function signInPage() {
    console.log("SIGN IN PAGE");
    $("#login-form").submit(function(e) {
        e.preventDefault();
    });

    $("#login-button").click(function() {
        var username = $("#username-section").val();
        var password = $("#password-section").val();

        $.ajax({
            type: "PUT",
            url: "/account/sign-in",
            data: {
                username: username,
                password: password
            }
        }).done(function(data) {
            if (data.hasOwnProperty('error')){
                console.log("ERROR");
                console.log(data.error);
                throwLoginError(data.error);
                $("#password-section").val('');
            }
            else if(data.hasOwnProperty ('loginCode')) {
                var url = "/home";
                console.log("SUCCESS");
                console.log(data);
                $(location).attr('href',url);
            }
            else{
                var url = "/signin";
                $(location).attr('href',url);
            }
        });

    });
}

/*
 * signup page: password length and username length control
 */
function signUpPage() {

    console.log("SIGN UP PAGE");

    $("#signup-form").submit(function(e) {
        e.preventDefault();
    });


    $("#signup-button").click(function() {
        var username = $("#username-section").val();
        var password = $("#password-section").val();
        var passwordConf = $("#password-confirm-section").val();
        $.ajax({
            type: "PUT",
            url: "/account/sign-up",
            data: {
                username: username,
                password: password,
                passwordConf: passwordConf
            }
        }).done(function(data) {
            if (data.hasOwnProperty('error')){
                console.log("ERROR");
                console.log(data.error);
                throwLoginError(data.error);
                $("#password-section").val('');
                $("#password-confirm-section").val('');
            }
            else if(data.hasOwnProperty ('loginCode')){
                var url = "/home";
                console.log("SUCCESS");
                console.log(data);
                $(location).attr('href',url);
            }
            else{
                var url = "/signin";
                $(location).attr('href',url);
            }
        });
  });
}

/* Home Page */
function homePage() {
    console.log("HOME PAGE");


}

/* Search Page */
function searchPage(partyToken) {
    var width =  $(".content-box").outerWidth();
    $(".search-content").css("width", width+"px");
    $(".search-content").css("max-width", width+"px");

    $("#search-form").submit(function(e) {
        e.preventDefault();
    });

    $(".search-tab").click(function(){
        if (this != $(".search-curr")) {
            $(".search-curr").removeClass("search-curr");
            $("#" + this.id).addClass("search-curr");
            $(".search-section-cur").removeClass("search-section-cur");
            var section = "." + this.id.split("-")[0] + "-content";
            $(section).addClass("search-section-cur");
        }
    });

    $("#search-button").click(function() {
        var query = $("#search-query").val();
        if (query == "") {
            removeSearchContent();
            $("#song-error").text("SEARCH CANNOT BE EMPTY").css("display", "block");
            $("#album-error").text("SEARCH CANNOT BE EMPTY").css("display", "block");
            $("#artist-error").text("SEARCH CANNOT BE EMPTY").css("display", "block");
            $("#playlist-error").text("SEARCH CANNOT BE EMPTY").css("display", "block");
            return;
        }

        var currentMaxResults = 6;

        // Removes old error message when searching again
        $("#song-error").css("display", "none");
        $("#album-error").css("display", "none");
        $("#artist-error").css("display", "none");
        $("#playlist-error").css("display", "none");


        $.ajax({
            type: "GET",
            url: "/search",
            data: {
                query: query,
                type: 'all'
            }
        }).done(function(data) {
            console.log(data);
            //TODO PRECOMPILE
            removeSearchContent();
            if (data.tracks == null) {
                $("#song-error").text("COULD NOT GET SONGS FROM SPOTIFY").css("display", "block");
                $("#album-error").text("COULD NOT GET SONGS FROM SPOTIFY").css("display", "block");
                $("#artist-error").text("COULD NOT GET SONGS FROM SPOTIFY").css("display", "block");
                $("#playlist-error").text("COULD NOT GET SONGS FROM SPOTIFY").css("display", "block");
            }
            else {
                if (data.tracks.length == 0)
                    $("#song-error").text("NO SONGS FOUND").css("display", "block");
                else
                    generateSongContent(currentMaxResults, data.tracks);

                if (data.albums.length == 0)
                    $("#album-error").text("NO ALBUMS FOUND").css("display", "block");
                else
                    generateAlbumContent(currentMaxResults, data.albums);

                if (data.artists.length == 0)
                    $("#artist-error").text("NO ARTISTS FOUND").css("display", "block");
                else
                    generateArtistContent(currentMaxResults, data.artists);

                if (data.playlists.length == 0)
                    $("#playlist-error").text("NO PLAYLISTS FOUND").css("display", "block");
                // else
                    // generatePlaylistContent(currentMaxResults, data.playlists);
            }
        });
  });
}

function generatePlaylistContent(maxResults, playlistData) {
    var width = $(".content-box").outerWidth();
    var playlistTemplate = Handlebars.compile($("#playlist-item-template").html());
    var m = maxResults < playlistData.length ? maxResults : playlistData.length;
    for (var y = 0; y < m; y++) {
        var currentPlaylist = playlistData[y];
        var playlistInfo = {
            NAME: currentPlaylist.name,
            CREATOR: currentPlaylist.ownerId,
            YEAR: "1999",
            PLAYLIST_ID: currentPlaylist.id,
            IMG: currentPlaylist.image.url
        };
        var playlistHtml = playlistTemplate(playlistInfo);
        var playlistQuery = "#playlist-" + playlistInfo.PLAYLIST_ID;
        $(".playlist-content").append(playlistHtml);
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
            var path = event.view.window.location.pathname;
            var partyToken = path.split("/")[2];
            window.location.href = "/party/" + partyToken + "/search/playlist/" + event.data.playlistInfo.id ;
        });
    }

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

function generateArtistContent(maxResults, artistData) {
    var width =  $(".content-box").outerWidth();
    var artistTemplate = Handlebars.compile($("#artist-item-template").html());
    var m = maxResults < artistData.length ? maxResults : artistData.length;
    var maxSize = 0;
    for (var y = 0; y < m; y++) {
        var currentArtist = artistData[y];
        var artistInfo = {
            NAME: currentArtist.name,
            ID: currentArtist.id,
            IMG: currentArtist.image.url
        };
        var artistHtml = artistTemplate(artistInfo);
        $(".artist-content-rows").append(artistHtml);
        var tempHeight = parseInt($("#artist-" + artistInfo.ID).actual("height"));
        if (maxSize < tempHeight) {
            maxSize = tempHeight;
            $(".artist-item").css("height", maxSize);
        }
        $("#artist-" + artistInfo.ID).bind('click', {artistInfo: artistData[y]}, function (event) {
            var path = event.view.window.location.pathname;
            var partyToken = path.split("/")[2];
            window.location.href = "/party/" + partyToken + "/search/artist/" + event.data.artistInfo.id ;
        });
    }

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

function generateAlbumContent(maxResults, albumData) {
    var width =  $(".content-box").outerWidth();
    var albumTemplate = Handlebars.compile($("#album-item-template").html());

    var m = maxResults < albumData.length ? maxResults : albumData.length;
    for (var y = 0; y < m; y++) {
        var currentAlbum = albumData[y];
        var artistsList = artistsToText(currentAlbum.artists);
        var albumInfo = {
            NAME: currentAlbum.name,
            ARTIST: artistsList,
            YEAR: currentAlbum.releaseDate.substring(0,4),
            ALBUM_ID: currentAlbum.id,
            IMG: currentAlbum.image.url
        };
        var albumHtml = albumTemplate(albumInfo);
        var albumQuery = "#album-" + albumInfo.ALBUM_ID;
        $(".album-content").append(albumHtml);
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
            var path = event.view.window.location.pathname;
            var partyToken = path.split("/")[2];
            window.location.href = "/party/" + partyToken + "/search/album/" + event.data.albumInfo.id ;
        });
    }

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


// ASSUMES songData is not empty!
function generateSongContent(maxResults, songData) {
    var songTemplate = Handlebars.compile($("#song-item-template").html());
    var songWidth =  $(".content-box").outerWidth() - 16 - 45;

    var m = maxResults < songData.length ? maxResults : songData.length;
    for (var y = 0; y < m; y++) {
        var name = songData[y].songName;
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


 var onSongClick = function(event) {
     var songInfo = event.data.songInfo;
     var songCoverTemp = Handlebars.compile($("#song-cover-temp").html());
     var artists = artistsToText(songInfo.songArtists);
     var popUpInfo = {
        NAME: songInfo.songName,
        ARTIST: artists,
        ARTIST_ID: songInfo.artistId,
        ALBUM_NAME: songInfo.albumName,
        ALBUM_ID: songInfo.albumId,
        COVER_URL: songInfo.albumImage
    };
    var songCoverHtml = songCoverTemp(popUpInfo);
    $("body").addClass("body-cover");
    $("body").append(songCoverHtml);
    $(".song-cover").click(closeSongCover);
    $("#sc-queue").bind("click", {songInfo : songInfo}, queueSong);
    $("#sc-album").bind("click", {songInfo : songInfo}, function () {
        var path = window.location.pathname;
        var partyToken = path.split("/")[2];
        window.location.href = "/party/" + partyToken + "/search/album/" + event.data.songInfo.albumId;
    });
    $("#sc-artists").bind("click", {songInfo : songInfo}, function () {
        var path = window.location.pathname;
        var partyToken = path.split("/")[2];
        window.location.href = "/party/" + partyToken + "/search/artist/" + event.data.songInfo.songArtists[0].id;
    });

    function closeSongCover(event) {
        if (event.target.className == "song-cover" ||
            event.target.id == "sc-close") {
                $("body").removeClass("body-cover");
                $(".song-cover").remove();
        }
    }

    function queueSong(event) {
        var path = event.view.window.location.pathname;
        path = path.split("/");
        var partyToken = path[2];
        $.ajax({
            type: "PUT",
            url: "/party/" + partyToken + "/queue-song",
            data: {
                songInfo: JSON.stringify(event.data.songInfo),
                user: null,
            }
        }).done(function(data) {
            var socket = io.connect('http://localhost:8080');
            socket.emit('updateQueuePing', partyToken, "Queued Song");
        });
    }

};


function artistsToText(artists) {
    var artistsText = artists[0].name.toUpperCase();
    for (var x = 1; x < artists.length; x++) {
        artistsText = artistsText + ', ' +  artists[x].name.toUpperCase() ;
    }
    return artistsText;
}

// SERVER JS SONG OBJECT NEEDS TO HAVE ALBUM ID, AND ARTISTS ID
function addSongClick(songInfo) {
    var viewMoreTemp = Handlebars.compile($("#song-" + songInfo.songId).html());
    var popUpInfo = {
        NAME: songInfo.songName,
        ARTIST: artistsToText(songInfo.songArtists),
    };
    var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE SONGS", ID: "song"});
}

/* ----------------------------------------------------------------------- */
/* -------------------------- GENERAL FUNCTIONS -------------------------- */
/* ----------------------------------------------------------------------- */

/*
 * Used to throw errors on sign up
 */
function throwLoginError(error) {
    var width =  $("#username-section").outerWidth() - 30;
    $(".client-error").css("width", width+"px");
    $(".client-error").css("max-width", width+"px");
    $("#error-text").text(error);
    $(".client-error").css("display", "block");
}


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


/* ----------------------------------------------------------------------- */
/* -------------------------- Playing Songs! ----------------------------- */
/* ----------------------------------------------------------------------- */
/*
window.onSpotifyWebPlaybackSDKReady = function() {

    var player = new Spotify.Player({
        name: 'aqustic Spotify Web Player',
        getOAuthToken: function(callback) {
            //TODO the token must be put in the args for callback()
            //Also outdated token, was just temporary one for testing
            callback("your mom");
        }
    }); */

/*
 *  THE FOLLOWING CODE IS COPIED OFF OF https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#
 */

/*
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();





}
*/
