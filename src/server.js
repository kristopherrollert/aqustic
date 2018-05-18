/*jshint esversion: 6 */
// ^ this is just for kris, please don't delete
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
 * Version: 1.0
 * Developers:
 *  Kristopher Rollert | Kai Schniedergers | Michelle Slaughter | Lorenzo Yabut
 *
 */

/* ------------------------------------------------------------------------- */
/* -------------------------------- GLOBALS -------------------------------- */
/* ------------------------------------------------------------------------- */

// KRIS: use events to prevent the database query from returning too early
//https://www.tutorialspoint.com/nodejs/nodejs_event_emitter.htm

/* Constants to be changed before release */
const clientID = "1951f93df40942a59574ed5d17e5425a";
const clientSecret = "048262fe59c048e18ce94d18d5784078";
const port = 3000;
const baseUrl = `http://localhost:${port}`;

/* Server Modules */
const http = require('http');
const crypto = require('crypto');
const events = require('events');
const mongo = require('mongodb');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fetch = require("node-fetch");


/* Local Modules */
const queue = require('./queue');

const mongoClient = mongo.MongoClient;
const app = express();

/* TODO : I am unsure what this does, but I feel like it shouldn't be a global
 *        varible. -kris */
var authStateKey = 'spotify_auth_state';
const debug = true; // this can be set to false to hide console.logs

/* ------------------------------------------------------------------------- */
/* ----------------------------- DATABASE CODE ----------------------------- */
/* ------------------------------------------------------------------------- */

var database = {
    /* General Databse Information */
    name: "aqusticDB",
    url: 'mongodb://localhost:27017/',
    createCollection: function(collectionName, callback = null) {
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.createCollection(collectionName,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log(`Created ${collectionName} collection!`);
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },
    insertOne: function (collectionName, item, callback = null) {
        mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).insertOne(item,
                function (err, result) {
                    if (err) throw err;
                    if (debug) console.log("Inserted One Element");
                    //console.log(result);
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },
    insertMany: function (collectionName, items, callback = null) {
        mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).insertOne(item,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log("Inserted Elements");
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },

    /* returns an array of */
    findOne: function (collectionName, query = {}, callback = null) {
        return mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            return database.collection(collectionName).findOne(query,
                function (err, result) {
                    if (err) throw err;
                    db.close();
                    if (debug) {
                        console.log("FIND ONE RESULT: ");
                        //console.log(result);
                    }
                    if (callback) callback(result);
                }
            );
        });
    },

    find: function(collectionName, query = {}, limit = 0, callback = null){
        return mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            return database.collection(collectionName).find(query).limit(limit).toArray(
                function (err, result) {
                    if (err) throw err;
                    if (debug) {
                        console.log("FIND RESULT: ");
                        console.log(result);
                    }
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },

    findAll: function (collectionName, query = {}, callback = null) {
        return this.find(collectionName, query, 0, callback );
    },

    updateOne: function (collectionName, query, newValues, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).updateOne(query, newValues,
                function(err, result) {
                    if (err) throw err;
                    if (debug) {
                        console.log("UPDATE ONE RESULT:");
                        console.log(result);
                    }
                    db.close();
                    if (callback) callback(result);
            });
        });
    },

    update: function (collectionName, query, newValues, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).updateMany(query, newValues,
                function(err, result) {
                    if (err) throw err;
                    if (debug) {
                        console.log("UPDATE RESULT:");
                        //console.log(result);
                    }
                    db.close();
                    if (callback) callback(result);
                });
        });
    },

    deleteOne: function (collectionName, query, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).deleteOne(query,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log("DELETED ELEMENT");
                    db.close();
                    if (callback) callback(result);
            });
        });
    },

    delete: function (collectionName, query, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).deleteMany(query,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log(`DELETED ${result.result.n} ELEMENT(S)`);
                    db.close();
                    if (callback) callback(result);
            });
        });
    },

};


database.createCollection("ACCOUNTS");

/* -------------------------------------------------------------------------- */
/* ---------------------------- SONG OBJECT/INFO ---------------------------- */
/* -------------------------------------------------------------------------- */

function Song (prev = null, next = null) {
    this.prev = prev;
    this.next = next;

    this.songName = null;
    this.songId = null;
    this.songArtists = [];
    this.songLength = 0;
    this.likes = 0;
    this.dislikes = 0;
    this.score = 0;

    this.getSongName = function() {
        return this.songName;
    };

    this.getSongArtists = function() {
        return this.songArtist;
    };

    this.setSongArtists = function(songArtists) {
        this.songArtists = songArtists;
    };

    this.setSongName = function(songName) {
        this.songName = songName;
    };

    this.getSongId = function() {
        return this.id;
    };

    this.setSongId = function(songId) {
        this.songId = songId;
    };

    this.getSongLength = function() {
        return this.songLength;
    };

    this.setSongLength = function(songLength) {
        this.songLength = songLength;
    }

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

    this.updateScore = function() {
        //TODO Better voting score algorithm goes here
        this.score = this.likes - this.dislikes;
    };
}

/* -------------------------------------------------------------------------- */
/* ------------------------------- MIDDLEWARE ------------------------------- */
/* -------------------------------------------------------------------------- */

/*
 * description: middleware thatremoves the browwer from blocking certain
 * requests.
 *
 * notes: When this project is completed, this should not be here, it should be
 * in the web.config file.
 */
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

/*
 * description: middleware that parses cookies from the client folder.
 */
app.use(express.static(__dirname + '/client')).use(cookieParser());

// these allow us to support JSON-encoded bodies and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ------------------------------------------------------------------------- */
/* ------------------------------- ENDPOINTS ------------------------------- */
/* ------------------------------------------------------------------------- */
app.get('/signin', function(req, res){
    res.sendFile(__dirname+"/client/signin.html");
});

app.get('/signup', function(req, res){
    res.sendFile(__dirname+"/client/signup.html");
});

app.get('/searchpage', function(req, res){
    res.sendFile(__dirname+"/client/search.html");
});

app.get('/search', function(req,res) {
    var authToken = 'BQBJTD5A0OtBnS7MNridTVfAroz94StNOOp5mvTsKHA1Q-vheDre80Uc43K0x8fpVDb8YAOURnyY9VhY4FR_iExFfw-aKdC1PHeLfI-V4l34RTfC8-J4MG8tcgnSNyGtq959ZqE3vc-p3m3SYQsvHb_wg9YAN9m5mij0KZ7Z';
    var query = req.query.query || '';
    var type = req.query.type || 'all';
    search(authToken, query, type).then(data => {
        res.send(data);
    });

});


app.put('/account/sign-in', function (req, res) {
    let username = req.body.username || '';
    let password = req.body.password || '';
    if (password.length < 1 && username.length < 1)
        res.send({error: "Enter a username and a password!"});
    else if (username.length < 1)
        res.send({error: "Username cannot be blank!"});
    else if (password.length < 1)
        res.send({error: "Password cannot be blank!"});
    else {
        database.findOne("ACCOUNTS", {username: username},
            function (result) {
                if (result == null)
                    res.send({error: "Username not found!"});
                else {
                    var hashPass = hashPassword(password, result.salt);
                    if (result.password != hashPass)
                        res.send({error: "Password is not correct!"});
                    else {
                        res.send({loginCode: result.loginCode });
                    }
                }
            });
    }
});


app.put('/account/sign-up', function (req, res) {
    let minUserLen = 4;
    let maxUserLen = 20;
    let maxPassLen = 128;
    let minPassLen = 5;

    let username = req.body.username || '';
    let password = req.body.password || '';
    let passwordConf = req.body.passwordConf || '';

    // CHECK IF USERNAME IS TAKEN
    // Create account if username not taken
    if (username.length < minUserLen)
        res.send({error : `Username should be at least ${minUserLen} characters!`});
    else if (username.length > maxUserLen )
        res.send({error : `Username is too long!`});
    else if (username.length > maxUserLen)
        res.send({error : `Username should not more than ${maxUserLen} characters!`});
    else if (!isValid(username))
        res.send({error : `Username cannot contain symbols!`});
    else if (password.length < minPassLen)
        res.send({error : `Password should be more than ${minPassLen} characters!`});
    else if (password.length > maxPassLen)
        res.send({error : `Password is too long!`});
    else if (password !== passwordConf)
        res.send({error : `Passwords do not match!`});
    else {
        var within = {
            username: username
        };
        var nameTaken = database.findOne("ACCOUNTS", within, function (result) {
            if (result == null) {
                var passwordData = saltHashPassword(password);
                var loginCode = generateRandomString(16);
                var query = {
                    username: username,
                    password: passwordData.hashPassword,
                    salt: passwordData.salt,
                    loginCode: loginCode
                };
                database.insertOne("ACCOUNTS", query);
                res.send({username: username, loginCode: loginCode});
            }
            else {
                res.send({error : `Username is already taken!`});
            }
        });
    }
});


app.get('/spotify-authorization', function(req, res){
    console.log("GOT SPOTIFY AUTH");

    // cookie to ensure browser/server connection is secure
    let state = servFunc.generateRandomString(16);
    res.cookie(authStateKey, state);

    // redirects to spotify authorization page, returns to the redirect_uri
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
             response_type: 'code',
             client_id: clientID,
             scope: 'streaming user-read-private user-read-email',
             redirect_uri: `${baseUrl}/callback/`,
             state: state
     }));
});

/*
 * description: puts the html from auth.html into the /settings page
 *
 */
app.get('/settings', function(req, res){
    res.sendFile(__dirname+"\\client\\auth.html");
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[authStateKey] : null;

    if (state === null || state !== storedState) {
        //TODO: make a better error report
        res.redirect('/#' +
            querystring.stringify({
            error: 'state_mismatch'
        }));
    }
    else {
        res.clearCookie(authStateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: `${baseUrl}/callback/`,
                grant_type: 'authorization_code'
                },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(clientID + ':' + clientSecret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                var refresh_token = body.refresh_token;

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
                    })
                );
            }
            else {
                // TODO better error handleing
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    })
                );
            }
        });
    }
});

app.put('/play-song', function(req, res) {
    let songURI = 'spotify:track:3ctoHckjyd13eBi2IDw2Ip';
    let songID = '3ctoHckjyd13eBi2IDw2Ip';

    //let songURI = req.songId;
    let authToken = 'BQCaMVlYJ-fj1kDePZshSrSckxapp16K48cB86LO2nqlXB4XVgUVxexseLi3ieB9AePt8mNsaC1sPWAOhOZj6M5TilXHHAQTIkNeUq1R9H62Kj1maMR84K05-I7Ct6nqeNy9hLs4imrnWnMHEVwsbLkRvd3xHvL16A'; //Still need to figure out
    getSongLength(authToken, songID);
    playSong(authToken, songURI);
});

/* ------------------------------------------------------------------------- */

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});


/* ------------------------------------------------------------------------- */
/* --------------------------- GENERAL FUNCTIONS --------------------------- */
/* ------------------------------------------------------------------------- */

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    console.log("SHA");
    console.log(value);
    return {
        salt:salt,
        passwordHash:value
    };
};

/**
 * returns hashed password and salt
 *
 */
function saltHashPassword(userpassword) {
    let salt = generateRandomString(16);
    let passwordData = sha512(userpassword, salt);
    console.log("SALT HASH PASS");
    console.log(passwordData);
    return { hashPassword: passwordData.passwordHash,
             salt: passwordData.salt };
}

function hashPassword(userpassword, salt) {
    let passwordData = sha512(userpassword, salt);
    return passwordData.passwordHash;
}

/*
 * Returns true if string has special characters
 */
function isValid(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

function getLargerSong(song1, song2) {
    let score1 = song1.getScore();
    let score2 = song2.getScore();
    if(score1 > score2)
        return song1;
    else if(score2 > score1)
        return song2;
    return null;
}

function playSong(authToken, songURI) {

    var header = {
        "Authorization": "Bearer " + authToken,
    };

    var body = {
        "uris": [songURI],
    };

    var init = {
        method: 'PUT',
        headers: header,
        body: JSON.stringify(body),
    };

    //TODO make the query "device_id" equal to the name of the player
    return fetch("https://api.spotify.com/v1/me/player/play", init)
        .then(function (res) {
            if (res.status === 204) {
                console.log("Playing Song...");
            }
            else {
                console.log(JSON.stringify(res.status));
            }
        });


}

function getSongLength (authToken, songID) {
    var header = {
        "Authorization": "Bearer " + authToken,
    };

    var init = {
        method: 'GET',
        headers: header,
    };

    let songLength = -1;
    fetch('https://api.spotify.com/v1/tracks/' + songID, init)
        .then(function (res) {
            if (res.status === 200) {
                console.log("got track data");
                songLength = 0;
                console.log(JSON.stringify(res));
            }
            else {
                console.log('ERROR: ' + res.status);
            }
        });
}


/* -------------------------------------------------------------------------- */
/* ---------------------------- SEARCH FUNCTIONS ---------------------------- */
/* -------------------------------------------------------------------------- */

/*
 * DESCRIPTION: A way to search for songs on spotify
 * ARGUMENTS:
 *  authorization -> authorization to work with spotify api
 *  query -> what we are searching
 *  type(optional) -> type of thing to search for. defaults to all. options: track, album, playlist, artist
 * Returns a dictionary of the names of the top 20 results from spotify, and song objects (still needs work)
 */
function search(authToken, query, type = 'all') {
    if (type == 'all')
        type = 'track,album,playlist,artist';

    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: headers
    };


    return fetch(`https://api.spotify.com/v1/search?q=${query}&type=${type}`, init)
        .then(response => {
        if (response.status === 200) {
            return response.json().then(function(data) {
                var dict = {
                    tracks: [],
                    albums: [],
                    playlists: [],
                    artists: []
                };
                var i;
                if (type.includes("track")) {
                    for (i = 0; i < data.tracks.items.length; i++) {
                        var track = new Song();
                        track.setSongName(data.tracks.items[i].name);
                        track.setSongId(data.tracks.items[i].id);
                        track.setSongArtists(data.tracks.items[i].artists);
                        track.setSongLength(data.tracks.items[i].duration_ms);
                        // var track = data.tracks.items[i].name;
                        dict.tracks.push(track);
                    }
                }

                if (type.includes("album")) {
                    var a;
                    var artists = [];
                    for (i = 0; i < data.albums.items.length; i++) {
                        var album = new Album();
                        album.setName(data.albums.items[i].name);
                        album.setId(data.albums.items[i].id);
                        for (a = 0; a < data.albums.items[i].artists.length; a++) {
                            artists.push(data.albums.items[i].artists[a]);    
                        }
                        album.setArtists(artists);
                        // var album = data.albums.items[i].name;
                        dict.albums.push(album);
                    }
                }

                if (type.includes("playlist")) {
                    for (i = 0; i < data.playlists.items.length; i++) {
                        // var playlist = new Playlist();
                        // playlist.setName(data.playlists.items[i].name);
                        // playlist.setId(data.playlists.items[i].id);
                        // playlist.setOwnerId(data.playlists.items[i].owner.id);
                        var playlist = data.playlists.items[i].name;
                        dict.playlists.push(playlist);
                    }
                }

                if (type.includes("artist")) {
                    for (i = 0; i < data.artists.items.length; i++) {
                        // var artist = new Artist();
                        // artist.setName(data.artists.items[i].name);
                        // artist.setId(data.artists.items[i].id);
                        var artist = data.artists.items[i].name;
                        dict.artists.push(artist);
                    }
                }
                return dict;
            });
            // console.log(dict);
            // console.log(d);
            // return dict;
        } else {
            throw new Error(`Something went wrong on api server! ${response.status}`);
        }
    })
    .then(response => {
        return response;
        // ...
    }).catch(error => {
        console.log(error);
    });
}

/*
 * DESCRIPTION: A way to parse a query from a user into something usable by the spotify API
 * ARGUMENTS:
 *  query -> a search query from a user
 * returns a usable string for the spotify API
 */
function parse_search(query) {
    return query.replace(/ /i, '%20');
}

function Album () {
    this.id = null;
    this.name = null;
    this.artists = [];

    this.getId = function() {
        return this.id;
    };
    
    this.setId = function(id) {
        this.id = id;
    };

    this.getArtists = function() {
        return this.artists;
    };

    this.setArtists = function(artists) {
        this.artists = artists;
    }

    this.getName = function() {
        return this.name;
    }

    this.setName = function(name) {
        this.name = name;
    }
}


/*
 * DESCRIPTION: A way to get the songs in an album on spotify
 * ARGUMENTS:
 *  authToken -> authorization to work with spotify api
 *  albumId -> album to get tracks from
 * returns a dictionary of the tracks, made into song objects
 */
function getAlbum(authToken, albumId) {

    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    }

    var init = {
        method: 'GET',
        headers: header,
    }

    return fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, init)
        .then(function (res) {
            if (res.status == 200) {
                var tracks = []
                return res.json().then(function(data) {
                    var tracks = [];
                    for (i = 0; i < data.items.length; i++) {
                        var track = new Song();
                        track.setName(data.items[i].name);
                        track.setId(data.items[i].id);
                        // var track = data.items[i].name;
                        tracks.push(track);
                    }
                    return tracks;
                });
            }
            else {
                throw new Error(`Something went wrong on api server! ${res.status}`);
            }
        })
        .then(response => {
        console.debug(response);
            // ...
        }).catch(error => {
            console.error(error);
        });
}
