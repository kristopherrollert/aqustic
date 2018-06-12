/* -------------------------------------------------------------------------- */
/* ---------------------------- GENERAL FUNCTIONS --------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Takes the artists and parses them into a single string with artist names seperated
 * by commas
 * @param {Array} artists : a list of artist objects
 */
function artistsToText(artists) {
    var artistsText = artists[0].name.toUpperCase();
    for (var x = 1; x < artists.length; x++) {
        artistsText = artistsText + ', ' +  artists[x].name.toUpperCase() ;
    }
    return artistsText;
}

/**
 * Closes the song cover that is clicked
 * @param {Object} event : event data when clicked on
 */
function closeSongCover(event) {
    if (event.target.className == "song-cover" ||
        event.target.id == "sc-close") {
            $("body").removeClass("body-cover");
            $(".song-cover").remove();
    }
}

/**
 * Gets the party token from the url
 * @return {String} : the string associated with the party
 */
function getPartyToken () {
    return (window.location.pathname).split("/")[2];
}

/**
 * Gets the party token from the event data
 * @return {String} : the string associated with the party
 */
function eventGetPartyToken (event) {
    return (event.view.window.location.pathname).split("/")[2];
}

/**
 * Get the Album/Artist/Playlist id from the url
 * @return {String} : string of the url's id
 */
function getUrlId() {
    return (window.location.pathname).split("/")[5];
}

/**
 * Gets the song id from the item clicked on and queues that song
 * @param {Object} event : the event that is clicked on
 */
function queueSong (event) {
    var partyToken = eventGetPartyToken(event);
    $.ajax({
        type: "PUT",
        url: "/party/" + partyToken + "/queue-song",
        data: {
            songInfo: JSON.stringify(event.data.songInfo)
        }
    }).done(function(data) {
        var socket = io.connect();
        socket.emit('updateQueuePing', partyToken);
        $(".song-cover").remove();
        $("body").removeClass("body-cover");
    });
}

/**
 * When clicked on, generates the pop up for that specific song
 * @param {Object} event : the event that is clicked on
 */
var onSongClick = function(event) {

    /* DESC: Generates popup */
    var songInfo = event.data.songInfo;
    var songCoverTemp = Handlebars.compile($("#song-cover-temp").html());
    var artists = artistsToText(songInfo.songArtists);
    console.log(songInfo);
    var popUpInfo = {
       NAME: songInfo.songName,
       ARTIST: artists,
       ARTIST_ID: songInfo.artistId,
       ALBUM_NAME: songInfo.albumName,
       ALBUM_ID: songInfo.albumId,
       COVER_URL: songInfo.albumImage
   };
   var songCoverHtml = songCoverTemp(popUpInfo);
   $("body").append(songCoverHtml);


   /* DESC: Prevent background scrolling */
   $("body").addClass("body-cover");

   /* DESC: Binds clicks to specific actions */
   $(".song-cover").click(closeSongCover);
   $("#sc-queue").bind("click", {songInfo : songInfo}, queueSong);
   $("#sc-album").bind("click", {songInfo : songInfo}, redirectToAlbum);
   $("#sc-artists").bind("click", {songInfo : songInfo}, redirectToArtist);
};

/**
 * Redirects to artist page with the artist id taken from the data binded
 * @param {Object} event : the event that is clicked on
 */
function redirectToArtist (event) {
    var partyToken = eventGetPartyToken(event);
    var artistId = event.data.songInfo.songArtists[0].id;
    $(location).attr("href", "/party/" + partyToken + "/search/artist/" + artistId);
}

/**
 * Redirects to album page with the album id taken from the data binded
 * @param {Object} event : the event that is clicked on
 */
function redirectToAlbum (event) {
    var partyToken = eventGetPartyToken(event);
    var albumId = event.data.songInfo.albumId;
    $(location).attr("href", "/party/" + partyToken + "/search/album/" + albumId);
}

/*
 * Change Styling of playlist that is hovered into
 */
function playlistHoverIn () {
    $(this).find(".playlist-cover-section").css({
        "border": "1px solid #222b2f",
        "backgroundColor" : "#222b2f"
    });

    $(this).find(".playlist-content-section").css({
        "border" : "1px solid #222b2f",
        "backgroundColor" : "#222b2f"
    });
}

/*
 * Change Styling of playlist that is hovered out
 */
function playlistHoverOut () {
    $(this).find(".playlist-cover-section").css("border", "1px solid #f6ca5a");
    $(this).find(".playlist-content-section").css({
        "border" : "1px solid #f6ca5a",
        "backgroundColor" : "transparent"
    });
}

/*
 * Change Styling of album that is hovered into
 */
function albumHoverIn () {
    $(this).find(".album-cover-section").css({
        "border": "1px solid #222b2f",
        "backgroundColor" : "#222b2f"
    });
    $(this).find(".album-content-section").css({
        "border" : "1px solid #222b2f",
        "backgroundColor" : "#222b2f"
    });
}

/*
 * Change Styling of album that is hovered out of
 */
function albumHoverOut () {
    $(this).find(".album-cover-section").css("border", "1px solid #f6ca5a");
    $(this).find(".album-content-section").css({
        "border" : "1px solid #f6ca5a",
        "backgroundColor" : "transparent"
    });
}


/*
 * Adds links to PARTY, SEARCH, and LOGOUT buttons
 */
function setHeaderLinks(partyToken) {
    $("#header-menu-party").attr("href", "/party/" + partyToken);
    $("#header-menu-search").attr("href", "/party/" + partyToken + "/search");
    $("#header-menu-sign-out").attr("href", "/logout");
}

/* -------------------------------------------------------------------------- */
/* ---------------------------- LOADING FUNCTIONS --------------------------- */
/* -------------------------------------------------------------------------- */

var bar1, bar2, bar3, bar4, bar5;

function closeSearchLoadingScreen () {
    $(".search-loading-box").hide();
    clearInterval(bar1);
    clearInterval(bar2);
    clearInterval(bar3);
    clearInterval(bar4);
    clearInterval(bar5);
}

function openSearchLoadingScreen () {
    $(".search-loading-box").show();
    moveBar($("#bar1"), 1600, 250, 30);
    moveBar($("#bar2"), 700, 250, 55);
    moveBar($("#bar3"), 1000, 190, 25);
    moveBar($("#bar4"), 1300, 250, 60);
    moveBar($("#bar5"), 900, 250, 100);

    bar1 = setInterval(function() {
        moveBar($("#bar1"), 1600, 250, 30);
    }, 3200);

    bar2 = setInterval(function() {
        moveBar($("#bar2"), 700, 250, 55);
    }, 1400);

    bar3 = setInterval(function() {
        moveBar($("#bar3"), 1000, 190, 25);
    }, 2000);

    bar4 = setInterval(function() {
        moveBar($("#bar4"), 1300, 250, 60);
    }, 2600);

    bar5 = setInterval(function() {
        moveBar($("#bar5"), 900, 250, 100);
    }, 1800);
}

/*
 * Hides the loading screen and stops intervals
 */
function closeLoadingScreen () {
    $("body").removeClass("body-cover");
    $(".loading-screen").hide();
    clearInterval(bar1);
    clearInterval(bar2);
    clearInterval(bar3);
    clearInterval(bar4);
    clearInterval(bar5);
}

/*
 * Starts the loading screen
 */
function openLoadingScreen () {
    $("body").addClass("body-cover");

    moveBar($("#bar1"), 1600, 250, 30);
    moveBar($("#bar2"), 700, 250, 55);
    moveBar($("#bar3"), 1000, 190, 25);
    moveBar($("#bar4"), 1300, 250, 60);
    moveBar($("#bar5"), 900, 250, 100);

    bar1 = setInterval(function() {
        moveBar($("#bar1"), 1600, 250, 30);
    }, 3200);

    bar2 = setInterval(function() {
        moveBar($("#bar2"), 700, 250, 55);
    }, 1400);

    bar3 = setInterval(function() {
        moveBar($("#bar3"), 1000, 190, 25);
    }, 2000);

    bar4 = setInterval(function() {
        moveBar($("#bar4"), 1300, 250, 60);
    }, 2600);

    bar5 = setInterval(function() {
        moveBar($("#bar5"), 900, 250, 100);
    }, 1800);

}

/**
 * Redirects to album page with the album id taken from the data binded
 * @param {jQuery-Object} $bar : the bar to edit
 * @param {Integer} speed : the speed of the bar to move
 * @param {Integer} max : the maximium size of the box
 * @param {Integer} min : the minimium size of the box
 */
function moveBar($bar, speed, max, min) {
    var randomMax = Math.floor((max - min) / 2 * Math.random()) + min + (max - min) / 2;
    var randomMin = Math.floor(((max - min) / 3 * Math.random())) + min;
    $bar.animate({
            maxHeight: randomMin + "px"
        }, speed, "swing", function() {
    $bar.animate({
            maxHeight: randomMax + "px"
        }, speed, "swing");
    });
}
