/* -------------------------------------------------------------------------- */
/* -------------------------- SIGN UP ON-LOAD CODE -------------------------- */
/* -------------------------------------------------------------------------- */

/*
 * Used to throw errors on sign up
 */
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

function closeSongCover(event) {
    if (event.target.className == "song-cover" ||
        event.target.id == "sc-close") {
            $("body").removeClass("body-cover");
            $(".song-cover").remove();
    }
}

function getPartyToken () {
    return (window.location.pathname).split("/")[2];
}

function eventGetPartyToken (event) {
    return (event.view.window.location.pathname).split("/")[2];
}

function closeLoadingScreen () {
    $("body").removeClass("body-cover");
    $(".loading-screen").hide();
}

function openLoadingScreen () {
    $("body").addClass("body-cover");
    moveBar($("#bar1"), 1600, 250, 30);
    moveBar($("#bar2"), 700, 250, 55);
    moveBar($("#bar3"), 1000, 190, 25);
    moveBar($("#bar4"), 1300, 250, 60);
    moveBar($("#bar5"), 900, 250, 100);

    setInterval(function() {
        moveBar($("#bar1"), 1600, 250, 30);
    }, 3200);

    setInterval(function() {
        moveBar($("#bar2"), 700, 250, 55);
    }, 1400);

    setInterval(function() {
        moveBar($("#bar3"), 1000, 190, 25);
    }, 2000);

    setInterval(function() {
        moveBar($("#bar4"), 1300, 250, 60);
    }, 2600);

    setInterval(function() {
        moveBar($("#bar5"), 900, 250, 100);
    }, 1800);


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

}

function closeSongCover(event) {
    if (event.target.className == "song-cover" ||
        event.target.id == "sc-close") {
            $("body").removeClass("body-cover");
            $(".song-cover").remove();
    }
}

function queueSong (event) {
    var partyToken = eventGetPartyToken(event);
    $.ajax({
        type: "PUT",
        url: "/party/" + partyToken + "/queue-song",
        data: {
            songInfo: JSON.stringify(event.data.songInfo)
        }
    }).done(function(data) {
        var socket = io.connect('http://localhost:8080');
        socket.emit('updateQueuePing', partyToken, "Queued Song");
        $(".song-cover").remove();
    });
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
};
