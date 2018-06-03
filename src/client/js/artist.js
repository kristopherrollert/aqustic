$(document).ready(function() {
    openLoadingScreen();
    var artistId = (window.location.pathname).split("/")[5];
    var partyToken = (window.location.pathname).split("/")[2];
    if (artistId == null || artistId == undefined) {
        $(".content-box").hide();
        $("#artist-error").text("NO ARTIST FOUND").show();
        setTimeout(closeLoadingScreen, 1000);
        return;
    }
    $.ajax({
        type: "GET",
        url: "/search/artist/" + artistId,
        data: {
            partyToken : partyToken
        }
    }).done(function(data) {
        if (data.hasOwnProperty("error")) {
            $(".content-box").hide();
            $("#artist-error").text(data.error).show();
            setTimeout(closeLoadingScreen, 1000);
        }
        else {
            var maxResults = 4;
            generateHeader(data.name, data.image);
            generateTopSongs(data.topSongs);
            generateAlbums(maxResults, data.albums);
            setTimeout(closeLoadingScreen, 1000);
        }
    });

});

function generateHeader(name, img) {
    var headerTemplate = Handlebars.compile($("#content-header-temp").html());
    var headerInfo = {
        NAME: name,
        IMG: img
    };
    var headerHtml = headerTemplate(headerInfo);
    $(".content-header-section").append(headerHtml);
}

function generateTopSongs (topSongsData) {
    var topSongTemplate = Handlebars.compile($("#top-song-temp").html());
    var m = 5 < topSongsData.length ? 5 : topSongsData.length;
    for ( var y = 0; y < m; y ++) {
        var currentSong = topSongsData[y];
        var topSongInfo = {
            NAME: currentSong.songName,
            NUMBER: (y + 1),
            SONG_ID: currentSong.songId
        };
        var topSongHtml = topSongTemplate(topSongInfo);
        $(".top-songs-content").append(topSongHtml);
        $("#song-" + topSongInfo.SONG_ID).bind('click', {songInfo: topSongsData[y]}, onSongClick);
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
};

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
        $(".song-cover").remove();
    });
}

function generateAlbums (maxResults, albumData) {
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
            generateAlbums(maxResults + 4, albumData);
        });
    }
}


// LOADING JAVACRIPT
function closeLoadingScreen() {
    $("body").removeClass("body-cover");
    $(".loading-screen").hide();
}

function openLoadingScreen() {
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

function artistsToText(artists) {
    var artistsText = artists[0].name.toUpperCase();
    for (var x = 1; x < artists.length; x++) {
        artistsText = artistsText + ', ' +  artists[x].name.toUpperCase() ;
    }
    return artistsText;
}
