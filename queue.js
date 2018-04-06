//working on the queue, I am trying to just write one that stores
//a number(the song id) and that can have pieces of the queue move

//I tried to add a function to move a specific song id up the queue
//and one to move the id down the queue but I had trouble keeping track
//of what was moving where so I am not sure if it worked properly

//id = song id
//prev = song before it in the queue
//next = song after it in the queue
function Node(id, prev, next){
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
        let node = new Node(id, this.bottom, null);
        if (this.bottom){
            this.bottom.next = node;
        }
        this.bottom = node;
        if (this.size === 0){
            this.top = node;
        }
        this.size++;

    };

    this.pop = function(){
        let node = this.top;
        this.top = node.next;
        this.top.prev = null;
        this.size--;
        return node;
    };

    //moves a song up the queue by 1
    //I think the swapping is correct but I haven't tested it
    this.moveUp = function(id){
        let node = this.top;
        while(node.id !== id){
            node = node.next;
        }

        node.prev.next = node.next;
        node.prev = node.prev.prev;
        node.next = node.prev;
        node.next.prev = node;
        node.next.next.prev = node.next;
        node.prev.next = node;
    };

    //moves a song down the queue by 1
    this.moveDown = function(id){
        let node = this.top;
        while(node.id !== id){
            node = node.next;
        }

        node.next.prev = node.prev;
        node.prev = node.next;
        node.next = node.prev.next;
        node.prev.next = node;
        node.next.prev = node;
        node.prev.prev.next = node.prev;
    }
}

var myQueue = new Queue;

console.log(myQueue);
myQueue.push(1234);
myQueue.push(34345);
console.log(myQueue);
console.log(myQueue.pop());
console.log(myQueue);
