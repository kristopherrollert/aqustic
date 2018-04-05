//working on the queue, I am trying to just write one that stores
//a number(the song id) and that can have pieces of the queue move

//id = song id
//prev = song before it in the queue
//next = song after it in the queue
//spot = spot in queue (i'm not sure if this is necessary yet)
function Node(id, prev, next, spot){
    this.id = id;
    this.prev = prev;
    this.next = next;
}

//queue: want to push stuff to the bottom of the queue and pop
//stuff from the top
function Queue(){
    this.top = null;
    this.bottom = null;
    this.size = 0;

    this.push = function(id) {
        let node = new Node(id, this.bottom, null, 0);
        if (this.bottom){
            this.bottom.next = node;
        }
        this.bottom = node;
        if (this.size == 0){
            this.top = node;
        }
        this.size++;
        return
    }

    this.pop = function(){
        let node = this.top;
        this.top = node.next;
        this.top.prev = null;
        this.size--;
        return node;
    }
}

var myQueue = new Queue;

console.log(myQueue);
myQueue.push(1234);
myQueue.push(34345);
console.log(myQueue);
console.log(myQueue.pop());
console.log(myQueue);