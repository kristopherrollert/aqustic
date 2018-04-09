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
 
function SongObject(songInfo, prev, next) {
    this.songInfo = songInfo;
    this.prev = prev;
    this.next = next;

    this.getSongInfo = function() {
        return this.songInfo;
    };

    this.setSongInfo = function(newSongInfo) {
        this.songInfo = newSongInfo;
    }
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
