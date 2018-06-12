/* -------------------------------------------------------------------------- */
/* --------------------------- PARTY ON-LOAD CODE --------------------------- */
/* -------------------------------------------------------------------------- */

$(document).ready(function () {

    openLoadingScreen();

    /*
     * DESC: Pull the queue and currently playing song from server and generates
     * templates from data.
     */
    var partyToken = getPartyToken();

    setHeaderLinks(partyToken);
    pullQueueAndUpdate(partyToken);
    pullCurrentlyPlayingAndUpdated(partyToken);
    pullHeaderAndGenerate(partyToken);

    /* DESC: Connectes to the socket.io port and joins the party */
    var socket = io.connect();
    socket.emit("join-party", partyToken);

    /* DESC: Regenerates the display of the queue from the updateQueue ping */
    socket.on('updateQueue', function () {
        pullQueueAndUpdate(partyToken);
        pullCurrentlyPlayingAndUpdated(partyToken);
    });

    $("#add-more-songs-button").click(function () {
        $(location).attr('href', "/party/" + partyToken + "/search");
    });


});

/* -------------------------------------------------------------------------- */
/* ------------------------ PARTY SPECIFIC FUNCTIONS ------------------------ */
/* -------------------------------------------------------------------------- */

/* -- GLOBALS -- */
var completedTasks = 0;

/*
 * Tracks genreated content, when all is complete it closes the loadng screen
 */
function completedTask () {
    completedTasks++;
    if (completedTasks == 3)
        closeLoadingScreen();
}

/**
 * Pulls basic party information from the server and geneartes header
 * @param {String} partyToken : the token for the party-to-join
 */
function pullHeaderAndGenerate (partyToken) {
    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/get-info"
    }).done(function (data) {
        generatePartyInfoContent(data);
        completedTask();
    });
}

/**
 * Pulls the updated queue from the server, deletes old queue display
 * and rebuilds it with new queue.
 * @param {String} partyToken : the token for the party-to-join
 */
function pullQueueAndUpdate (partyToken) {
    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/queue"
    }).done(function (queue) {
        $(".song-queue-item").remove();
        generateQueueContent(queue);
        completedTask();
    });
}

/**
 * Pulls the updated currently playing song from the server, deletes
 * old song display and rebuilds the new currently playing song.
 * @param {String} partyToken : the token for the party-to-join
 */
function pullCurrentlyPlayingAndUpdated (partyToken) {
    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/now-playing"
    }).done(function (currentlyPlayingSong) {
        $(".now-playing-section > .song-item").remove();
        generateNowPlayingContent(currentlyPlayingSong);
        completedTask();
    });
}

/**
 * Given data about the party, displays it using templates
 * @param {Object} headerData : information about the party from the server
 */
function generatePartyInfoContent (headerData) {
    var partyInfoTemplate = Handlebars.compile($("#party-info-template").html());
    var partyInfo = {
        PARTY_NAME : headerData.partyName,
        PARTY_OWNER : headerData.admin,
        PARTY_TOKEN : headerData.partyToken
    };
    var partyInfoHtml = partyInfoTemplate(partyInfo);
    $(".party-info-section").append(partyInfoHtml);
}

/**
 * Given data about the currently playing song, displays it using templates
 * @param {Object} currentlyPlayingSong : information about the currently playing
 *               song pulled from the server.
 */
function generateNowPlayingContent (currentlyPlayingSong) {
    if (currentlyPlayingSong == undefined ||
        currentlyPlayingSong == null ||
        currentlyPlayingSong === "") {
            $("#no-currently-playing-section").show();
            return;
        }
    $("#no-currently-playing-section").hide();
    var songWidth =  $(".content-party-connect").outerWidth();
    var nowPlayingTemplate = Handlebars.compile($("#now-playing-template").html());
    var artists = artistsToText(currentlyPlayingSong.songArtists);
    var nowPlayingInfo = {
        NAME: currentlyPlayingSong.songName,
        ARTIST: artists,
        WIDTH: songWidth
    };

    var nowPlayingHtml = nowPlayingTemplate(nowPlayingInfo);
    $(".now-playing-section").append(nowPlayingHtml);
}


/**
 * Given data about the queue, displays it using templates
 * @param {Array} queueInfo : a list of song objects from the server representing a queue
 *
 */
function generateQueueContent(queueInfo) {
    if (queueInfo == undefined ||
        queueInfo == null)
        return;
    else if (queueInfo.length == 0) {
        $("#no-queue-section").show();
        return;
    }
    else {
        $("#no-queue-section").hide();
    }

    /*
     * DESC: discrepancy is the sum of the box size, songs default padding,
     * padding between boxes, and the border
     */
    var songWidth =  $(".content-party-connect").outerWidth();
    var boxSize = (78.22 - 10) / 2;
    var discrepancy = boxSize + 15 + 10 + 2;
    var songInfoWidth = songWidth - discrepancy;
    var songTemplate = Handlebars.compile($("#song-template").html());

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

        /*
         * DESC: adds function to like button that increments likes when clicked
         */
        $("#vote-song-" + songInfo.SONG_ID+" > .like-button").bind('click', {queueIndex: i}, function (event){
            var partyToken = eventGetPartyToken(event);
            $.ajax({
                type: "PUT",
                url: "/party/" + partyToken + "/vote",
                data: {
                    queueIndex: event.data.queueIndex,
                    vote: "like",
                }
            }).done(function(data) {
                // TODO change styling for this, prevent from clicking multiple times
            });
        });

        /*
         * DESC: adds function to dislike button that increments dislikes when clicked
         */
        $("#vote-song-" + songInfo.SONG_ID+" > .dislike-button").bind('click', {queueIndex: i}, function (event){
            var partyToken = eventGetPartyToken(event);
            $.ajax({
                type: "PUT",
                url: "/party/" + partyToken + "/vote",
                data: {
                    queueIndex: event.data.queueIndex,
                    vote: "dislike",
                }
            }).done(function(data) {
                // TODO change styling for this, prevent from clicking multiple times
            });
        });

    }
}
