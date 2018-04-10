const http = require('http');

const hostname = '127.0.0.1';
const port = 8080;

const server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('booop');
    res.end();
}).listen(8080);

console.log("f u");
