/*
 *                               _    _
 *                              | |  (_)
 *      __ _   __ _  _   _  ___ | |_  _   ___
 *     / _` | / _` || | | |/ __|| __|| | / __|
 *    | (_| || (_| || |_| |\__ \| |_ | || (__
 *     \__,_| \__, | \__,_||___/ \__||_| \___|
 *               | |
 *               |_|
 *
 * Version: 0.0
 * Website:
 * Developers:
 *  Kristopher Rollert
 *  Kai Schniedergers
 *  Michelle Slaughter
 *  Lorenzo Yabut
 *
 */

function Song(songId, prev, next) {
    this.prev = prev;
    this.next = next;

    this.songId = songId;
    this.likes = 0;
    this.dislikes = 0;
    this.score = 0;

    this.getSongId = function() {
        return this.id;
    };

    this.getLikes = function() {
        return this.likes;
    };

    this.getDislikes = function() {
        return this.dislikes;
    };

    this.getScore = function() {
        return this.score;
    };

    this.addLike = function() {
        this.likes++;
        this.updateScore();
    };

    this.addDislike = function() {
        this.dislikes++;
        this.updateScore();
    };

    this.updateScore = function() {
        //TODO Better voting score algorithm goes here
        this.score = this.likes - this.dislikes;
    };
}


/*
 * returns the larger song object
 * if both are equal, returns null
 */
function getLargerSongObject(songObject1, songObject2) {
    let score1 = songObject1.getSongInfo().getScore();
    let score2 = songObject2.getSongInfo().getScore();
    if(score1 > score2)
        return songObject1;
    else if(score2 > score1)
        return songObject2;
    return null;
}
