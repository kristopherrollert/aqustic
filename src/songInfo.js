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

/*
 *  This object holds info about a song that can be passed into a Node object for the queue
 *
 *  THIS ONLY SUPPORTS SPOTIFY SONGS FOR NOW!!!!!
 *
 *
 *  Most common use = new SongInfo(id); leave likes and dislikes equal to zero
 */

function SongInfo(id, likes = 0, dislikes = 0) {

    this.id = id;
    this.likes = likes;
    this.dislikes = dislikes;
    this.score = 0;
    this.updateScore();

    this.getId = function() {
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
    }

}
