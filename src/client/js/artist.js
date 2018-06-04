/* -------------------------------------------------------------------------- */
/* -------------------------- SIGN UP ON-LOAD CODE -------------------------- */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* ----------------------- SIGN UP SPECIFIC FUNCTIONS ----------------------- */
/* -------------------------------------------------------------------------- */

function generateHeader(name, img) {
    var headerTemplate = Handlebars.compile($("#content-header-temp").html());
    var headerInfo = {
        NAME: name,
        IMG: img || "https://i.imgur.com/Q04jr6Q.png"
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
            IMG: currentAlbum.image
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
