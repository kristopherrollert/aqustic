const http = require('http');
const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const app = express();
const port = 3000;

// THESE ARE KRIS'
const clientID = "1951f93df40942a59574ed5d17e5425a";
const clientSecret = "048262fe59c048e18ce94d18d5784078";
const redirectUri = 'http://localhost:3000/callback/'; //TODO CHANGE WHEN ACTUALLY ON SERVER


// JUST FOR TESTING, MIGHT NOT BE NEEDED IN FINAL PRODUCT
// because of security reasons

// app.use(cors({origin: 'null'}));

app.use(cors());
app.options('*', cors());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/spotify-authorization', function(req, res){
    console.log("GOT MESSAGE");
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
         response_type: 'code',
         client_id: clientID,
         scope: scope,
         redirect_uri: redirectUri
   }));
});

app.get('/login-page', function(req, res){
    // console.log(__dirname+"\\client\\auth.html");
    //console.log(path.join(__dirname, '/client/auth.html'));
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // res.setHeader('Access-Control-Allow-Credentials', true);
    res.sendFile(__dirname+"\\client\\auth.html");
});

app.get('/login-success', function(req, res){
    res.send("<h1>SUCCESSFUL LOGIN MY DUDE</h1>");
});

app.put('/endpoint', function(req, res){
	var obj = {};
    console.log(req);
    console.log(res);
	// console.log('body: ' + JSON.stringify(req.body));
	// res.send(req.body);
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    // COMMENT FUCNTIONS
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err)
 }
  console.log(`server is listening on ${port}`);
});
