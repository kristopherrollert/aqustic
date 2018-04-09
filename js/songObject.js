function SongObject(id, prev, next){
    this.songInfo = new SongInfo(id, 0, 0);
    this.prev = prev;
    this.next = next;

    this.getSongInfo(){
        return this.songInfo;
    }

    this.setSongInfo(newSongInfo){
        this.songInfo = newSongInfo;
    }
}


/*
 * returns the larger song object
 * if both are equal, returns null
 */
function getLargerSongObject(songObject1, songObject2){
    let score1 = songObject1.getSongInfo().getScore();
    let score2 = songObject2.getSongInfo().getScore();
    if(score1 > score2)
        return songObject1;
    else if(score2 > score1)
        return songObject2;
    return null;
}
