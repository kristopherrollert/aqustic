const http = require('http');
const express = require('express');
const app = express();
const port = 8080;

app.get('/login', (request, response) => {
    response.send('Hello World!');
});

app.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err)
 }
  console.log(`server is listening on ${port}`);
});
