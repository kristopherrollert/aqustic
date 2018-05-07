/*jshint esversion: 6 */

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
 * DESCRIPTION: A queue system for songObjects
 * ARGUMENTS:
 *  head -> the first element in the queue
 *  tail -> last element in the queue
 *  size -> size of the queue
 */
module.exports = {
    head : null,
    tail : null,
    size : 0,

    /*
     * DESCRIPTION: adds the given songInfo object to the tail of the queue
     * ARGUEMENTS: takes a songInfo object
     * RETURN: none
     */
    push : function(song) {
        if (this.tail) {
            this.tail.next = song;
        }
        this.tail = song;
        if (this.size === 0) {
            this.head = song;
        }
        this.size++;
    },

    /*
     * DESCRIPTION: removes and returns an item from the head of the queue
     * ARGUEMENTS: none
     * RETURN: returns the songObject at the head of the queue
     */
    pop : function() {
        let song = this.head;
        if (this.size === 0){
            this.head = null;
            this.tail = null;
            this.size--;
            return song;
        }
        this.head = song.next;
        this.head.prev = null;
        this.size--;
        return song;
    },

    /*
     * DESCRIPTION: inserts an element into the queue between two elements
     * ARGUEMENTS: takes two songObjects to insert between
     * RETURN: none
     */
    insertAndAmend : function(insertSong, prevSong, nextSong) {

        // nothing in queue, just add it to queue
        if(prevSong == null && nextSong == null) {
            this.tail = insertSong;
            this.head = insertSong;
            this.size = 1;
        }
        // previous song is null, meaning it is being added to head of queue
        else if(prevSong == null) {
            this.head = insertSong;
            insertSong.next = nextSong;
            insertSong.prev = null;
            nextSong.prev = insertSong;
            this.size++;
        }
        // next Song is null, meaining it is being added to tail of queue
        else if(nextSong == null) {
            this.tail = insertSong;
            insertSong.next = null;
            insertSong.prev = prevSong;
            prevSong.next = insertSong;
            this.size++;
        }
        // adding to middle of queue
        else {
            insertSong.prev = prevSong;
            insertSong.next = nextSong;
            prevSong.next = insertSong;
            nextSong.prev = insertSong;
            this.size++;
        }
    },

    /*
     * DESCRIPTION: removes a songObject from the queue
     * ARGUEMENTS: takes a songInfo object to remove
     * RETURN: none
     */
    removeAndAmend : function(songToRemove) {
        //If the song is by itself
        if (songToRemove.prev == null && songToRemove.next == null){
            this.pop();
        }
        //If the song is the head
        if (songToRemove.prev == null) {
            this.pop();
        }
        //If the song is the tail
        if (songToRemove.next == null) {
            songToRemove.prev.next = null;
        }
        //If both sides are not null
        else {
            songToRemove.next.prev = songToRemove.prev;
            songToRemove.prev.next = songToRemove.next;
        }

        this.size--;
    },

    /*
     * DESCRIPTION: Takes a song and checks if that song needs to be moved to a
     * new spot. Assumes that it is only possible for this song to be moved up
     * in the queue.
     * ARGUEMENTS: takes a songInfo object to adjust
     * RETURN: false if the object isn't moved, true if it is
     */
    adjustSongUp : function(songToAdjust) {
        curr = songToAdjust.prev;
        while(curr != null) {
            // set to largerSong to the larger song, but if both are equal, then
            // getLargerSong returns null, so set it to curr.prev.
            let largerSong = getLargerSong(songToAdjust, curr) || curr;
            if(largerSong == curr)
                break;
            curr = curr.prev;
        }
        // curr represents the songObject that is larger than songToAdjust
        if (curr == songToAdjust.prev)
            return false; // this means that the songObject shouldn't move
        this.removeAndAmend(songToAdjust);
        this.insertAndAmend(songToAdjust, curr, curr.next);
        return true;
    },

    //moves a song up the queue by 1
    //I think the swapping is correct but I haven't tested it
    moveUp : function (id) {
        let song = this.head;
        while(song.id !== id) {
            song = song.next;
        }

        song.prev.next = song.next;
        song.prev = song.prev.prev;
        song.next = song.prev;
        song.next.prev = song;
        song.next.next.prev = song.next;
        song.prev.next = song;
    },

    //moves a song down the queue by 1
    moveDown: function (id) {
        let song = this.head;
        while(song.id !== id) {
            song = song.next;
        }
        song.next.prev = song.prev;
        song.prev = song.next;
        song.next = song.prev.next;
        song.prev.next = song;
        song.next.prev = song;
        song.prev.prev.next = song.prev;
    }

};
