/*
 *  This object holds info about a song that can be passed into a Node object for the queue
 *
 *  THIS ONLY SUPPORTS SPOTIFY SONGS FOR NOW!!!!!
 *
 *
 *  Most common use = new SongInfo(id); leave likes and dislikes blank
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

    //Better voting score algorithm goes here
    this.updateScore = function() {
        this.score = this.likes - this.dislikes;
    }

}
