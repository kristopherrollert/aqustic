var fetch = require("node-fetch");
var request = require("request");

/*
 * DESCRIPTION: Plays a song by uri; Made because web playback appears not to have a play song feature
 * ARGUMENTS:
 *  authToken -> authToken for account that wants to play song
 *  songID -> uri of the song to play
 *  RETURNS:
 */

function playSong(authToken, songID) {

    var header = {
        "Authorization": 'Bearer ${authToken}'
    };

    var body = {
        "context_uri": songID,
    };

    var init = {
        method: 'PUT',
        headers: header,
        body: body,
    };

    //TODO make the query "device_id" equal to the name of the player
    return fetch('https://api.spotify.com/v1/me/player/play', init)
        .then(function (res) {
            if (res.status == 200) {
                console.log("Playing Song...")
            }
            else {
                console.log("ERROR: " + res.status);
            }
        })
}