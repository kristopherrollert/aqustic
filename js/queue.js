//working on the queue, I am trying to just write one that stores
//a number(the song id) and that can have pieces of the queue move

//I tried to add a function to move a specific song id up the queue
//and one to move the id down the queue but I had trouble keeping track
//of what was moving where so I am not sure if it worked properly

//id = song id
//prev = songObject before it in the queue
//next = songObject after it in the queue


//queue: want to push stuff to the tail of the queue and pop
//stuff from the head
function Queue() {
    this.head = null;
    this.tail = null;
    this.size = 0;

    this.push = function(id) {
        let song = new SongObject(id, this.tail, null);
        if (this.tail) {
            this.tail.next = song;
        }
        this.tail = song;
        if (this.size === 0) {
            this.head = song;
        }
        this.size++;
    };

    this.pop = function() {
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
    };

    this.insertAndAmmend = function(insertSong, prevSong, nextSong) {

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
            insertSong.next = null
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
    };

    //fixes Songs around Song to remove or move
    this.removeAndAmmend = function(songToRemove) {
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
    };

    /*
     * Takes a song and checks if that song needs to be moved to a new spot.
     * Assumes that it is only possible for this song to be moved up in the
     * queue.
     *
     * Return: true if moved, false if it stays in place
     */
    this.adjustSongUp = function(songToAdjust) {
        curr = songToAdjust.prev;
        while(curr != null) {
            // set to largerSong to the larger song, but if both are equal, then
            // getLargerSongObject returns null, so set it to curr.prev.
            let largerSong = getLargerSongObject(songToAdjust, curr) || curr;
            if(largerSong == curr)
                break;
            curr = curr.prev;
        }
        // curr represents the songObject that is larger than songToAdjust
        if (curr == songToAdjust.prev)
            return false; // this means that the songObject shouldn't move
        this.removeAndAmmend(songToAdjust);
        this.insertAndAmmend(songToAdjust, curr, curr.next);
        return true;
    };

    //moves a song up the queue by 1
    //I think the swapping is correct but I haven't tested it
    this.moveUp = function(id) {
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
    };

    //moves a song down the queue by 1
    this.moveDown = function(id) {
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
}


var myQueue = new Queue;

myQueue.push(1);
myQueue.push(2);
myQueue.push(3);
myQueue.push(4);
