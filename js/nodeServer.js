const http = require('http');
const events = require('events');

var eventEmitter = new events.EventEmitter();

const server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("hello");
    console.log('test');
    eventEmitter.on('spook', () => {res.write('aaah')});
    res.end();
}).listen(8080);

console.log("f u");
