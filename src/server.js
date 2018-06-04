/* jshint esversion: 6 */
console.log("using temp auth token");
let TEMP_AUTH_TOKEN = 'BQAW5AerHwoiabOaFE-ms-ShjxkTxa8q1V1OyLaCsp9QrjhJXIp6pP-LTs5OHe2HkiV5vddVKs3_K7QXFEEd-G8A6tIc7ZLxBYsnfkp-NcZXJ5IVnOgAolVy0gS-yOk5cFlHLawio8HVZdo1IQdcKbkkfow4cHUiZMEFLVoV';
let TEMP_LOCATION_ASSUMPTION = "US";
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
// const baseUrl = 'https://aqustic-20'

/* Server Modules */
const http = require('http');
const crypto = require('crypto');
const events = require('events');
const mongo = require('mongodb');
const express = require('express');
const request = require('request');
const fetch = require("node-fetch");
const bodyParser = require('body-parser');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const passport = require("passport");
const sessionSecret = "aqusticServer"; //TODO: should be hidden

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongoClient = mongo.MongoClient;
const mongoUser = 'admin';
const mongoPass = 'aqustic115';

server.listen(8080);

/* TODO : I am unsure what this does, but I feel like it shouldn't be a global
 *        varible. -kris */
var authStateKey = 'spotify_auth_state';
const debug = false; // this can be set to false to hide console.logs


/* -------------------------------------------------------------------------- */
/* ------------------------------ QUEUE FUNCTIONS --------------------------- */
/* -------------------------------------------------------------------------- */

//If anyone is reading this, queuepop does not remove songs be
function queuePop () {
    return this.shift();
}

function queuePush (song) {
    this.push(song);
}


/* ------------------------------------------------------------------------- */
/* ----------------------------- DATABASE CODE ----------------------------- */
/* ------------------------------------------------------------------------- */

var database = {
    /* General Databse Information */
    name: "aqusticDB",
    // the below line should replace the other url in final
    url: `mongodb://${mongoUser}:${mongoPass}@ds241570.mlab.com:41570/aqustic` || 'mongodb://localhost:27017/',
    // url: 'mongodb://localhost:27017/' || `mongodb://${mongoUser}:${mongoPass}@ds241570.mlab.com:41570/aqustic` ,
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
            database.collection(collectionName).insertMany(items,
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
database.createCollection("PARTIES");

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
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
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

/* Save login cookies */
app.use(session({
    secret: "asdf",
    resave: true,
    saveUninitialized: true
    //cookie: {secure: true}
}));
app.use(passport.initialize());
app.use(passport.session());


/* ------------------------------------------------------------------------- */
/* ------------------------------- TESTING ------------------------------- */
/* ------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------- */
/* ------------------------------- ENDPOINTS ------------------------------- */
/* ------------------------------------------------------------------------- */
app.get('/signin', function(req, res){
    res.sendFile(__dirname+"/client/signin.html");
});

app.get('/party/*/search/artist/*', function(req, res){
    res.sendFile(__dirname+"/client/artist.html");
});

app.get('/party/*/search/album/*', function(req, res){
    res.sendFile(__dirname+"/client/album.html");
});

app.get('/signup', function(req, res){
    res.sendFile(__dirname+"/client/signup.html");
});


// , authenticationMiddleware() add when done
app.get('/home', function(req, res){

    // TODO THIS SHOULD REDIRECT TO LOGIN PAGE
    res.sendFile(__dirname+"/client/home.html");
});

// Needs: artist name, photo, album names, album images, album id, top songs name,
//        top songs id,
app.get('/search/artist/*', function (req, res) {
    let artistId = (req.path).split("/")[3];
    // let authToken = TEMP_AUTH_TOKEN;
    if (artistId == null || artistId == undefined) {
        res.send({
            error: "NO ARTIST GIVEN"
        });
    }
    else {
        let artistInfo = {};
        let error = false;
        let artistFunctionsComplete = 0;
        // Only sends after all async methods are called
        let checkArtistInfoFinished = function () {
            if (artistFunctionsComplete == 3){
                res.send(artistInfo);
            }
        };

        getAuthToken(req.query.partyToken, function (authToken) {
            searchArtistInfo(authToken, artistId).then(data => {
                if (data == undefined || data.hasOwnProperty("error")) {
                    if (!error) {
                        error = true;
                        res.send(data);
                    }
                }
                else {
                    artistInfo.name = data.name;
                    artistInfo.image = data.image;
                    artistFunctionsComplete++;
                    checkArtistInfoFinished();
                }
            });

            searchArtistAlbums(authToken, artistId).then(data => {
                if (data == undefined || data.hasOwnProperty("error")) {
                    if (!error) {
                        error = true;
                        res.send(data);
                    }
                }
                else {
                    artistInfo.albums = data;
                    artistFunctionsComplete++;
                    checkArtistInfoFinished();
                }
            });

            searchArtistTopSongs(authToken, artistId).then(data => {
                if (data.hasOwnProperty("error")) {
                    if (!error) {
                        error = true;
                        res.send(data);
                    }
                }
                else {
                    artistInfo.topSongs = data;
                    artistFunctionsComplete++;
                    checkArtistInfoFinished();
                }
            });
        });
    }
});

app.get('/search/album/*', function (req, res) {
    // var authToken = TEMP_AUTH_TOKEN;
    let albumId = (req.path).split("/")[3];
    if (albumId == null) {
        res.send({
            error: "NO ALBUM GIVEN"
        });
    }
    else {
        console.log(req.query.partyToken);
        getAuthToken(req.query.partyToken, function (authToken) {
            searchAlbum(authToken, albumId).then(data => {
                res.send(data);
            });
        });
    }
});

app.get('/search', function(req,res) {
    var query = req.query.query || '';
    var type = req.query.type || 'all';
    var user = req.user;
    let userID = {
        username: user,
    }
    //console.log("=============");
    //console.log(user);
    //console.log("=============");
    getAuthToken(req.query.partyToken, function (authToken) {
        search(authToken, query, type).then(data => {
            //console.log('got here!');
            res.send(data);
        });
    });

});

/* ------------------------------------------------------------------------- */

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
                        /* Login + Session Authentication */
                        const userID = username;
                        req.login(userID, function(err){
                            console.log("Logged In!");
                            res.send({loginCode: result.loginCode });
                        });
                    }
                }
            });
    }
});


app.put('/account/sign-up', function (req, res) {
    let minUserLen = 3;
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
                    loginCode: loginCode,
                    authenticateID: null
                };
                database.insertOne("ACCOUNTS", query);
                const userID = username;
                req.login(userID, function(err){
                    console.log("Logged In!");
                    res.send({username: username, loginCode: loginCode});
                });
            }
            else {
                res.send({error : `Username is already taken!`});
            }
        });
    }
});


app.get('/account/get-info', function (req, res) {
    var user = req.user;
    let userID = {
        username: user,
    };
    database.findOne("ACCOUNTS", userID, function (result) {
        if (result == null) {
            res.send({error : "ACCOUNT NOT FOUND"});
        }
        else {
            res.send({
                username : result.username,
                authenticated : result.authenticateID !== null
            });
        }
    });
});

/*------------Store Sessions------------*/
passport.serializeUser(function(userID, done) {
    done(null, userID);
});

passport.deserializeUser(function(userID, done) {
    done(null, userID);
});

function authenticationMiddleware () {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
        if (req.isAuthenticated()) return next();
        res.redirect('/signin');
    };
}


/* ------------------------------------------------------------------------- */

app.get('/spotify-authorization', function(req, res){
    console.log("GOT SPOTIFY AUTH");
    // cookie to ensure browser/server connection is secure
    let state = generateRandomString(16);
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
    res.sendFile(__dirname+"/client/auth.html");
});




app.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[authStateKey] : null;
    var user = req.user;
    let userID = {
        username: user,
    };

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
            let access_token;
            let refresh_token;

            if (!error && response.statusCode === 200) {
                access_token = body.access_token;
                refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                /*
                 *  Save authentication token and update token to the database
                 */
                 let updateAuth = {
                     $set: {
                         authenticateID: access_token
                     }
                 }

                 database.updateOne("ACCOUNTS", userID, updateAuth, function (result) {
                     if (result != null){
                         console.log("Updated Authtoken");
                     }
                 });

                 let updateRefresh = {
                     $set: {
                         refreshToken: refresh_token
                     }
                 }

                 database.updateOne("ACCOUNTS", userID, updateRefresh, function (result) {
                     if (result != null){
                         console.log("Updated Refresh");
                     }
                 });

                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                });
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
    res.redirect("/home");
});

app.put('/party/create-party', function(req, res) {
    let partyToken = generateRandomString(8);
    let admin = req.user;
    let partyName = req.body.partyName;
    let authenticated = req.body.authenticated;
    if (!authenticated) {
        res.send({
            error: "YOU ARE NOT AUTHENTICATED"
        });
    }
    else if (partyName == undefined || partyName.length == 0) {
        res.send({
            error : "PARTY NAME CANNOT BE EMPTY"
        });
    }
    else if (admin == null || admin == undefined) {
        console.log("error");
    }
    else {
        let dbObject = {
            partyToken: partyToken,
            admin: admin,
            currentlyPlaying: null,
            partyGoers: [],
            spotifyToken: "",
            playTimeoutId : "implement in the future",
            songQueue: []
        };
        database.insertOne("PARTIES", dbObject, function (result) {
            res.send({ redirect : `/party/${partyToken}`});
        });
    }
});

app.put('/party/join-party', function(req, res) {
    var partyToken = req.body.partyToken;
    if ( partyToken == undefined  || partyToken == null) {
        res.send({
            error : "NO PARTY TOKEN GIVEN"
        });
    }
    else if (partyToken == null || partyToken == "" ) {
        res.send({
            error: "PARTY TOKEN CANNOT BE EMPTY"
        });
    }
    else {
        let query = {
            partyToken: req.body.partyToken
        };
        database.findOne("PARTIES", query, function (result) {
            if (result == null) {
                res.send({
                    error: "PARTY NOT FOUND"
                });
            }
            else {
                res.send({
                    redirect : `/party/${partyToken}`,
                });
            }
        });
    }
});

app.get('/party/*/search', function(req, res){
    res.sendFile(__dirname+"/client/search.html");
});

app.get('/test/party', function(req, res){
    res.sendFile(__dirname+"/testing/testCreateParty.html");
});

app.put('/party/*/queue-song', function(req, res) {
    let partyToken = (req.path).split("/")[2];
    let songInfo = JSON.parse(req.body.songInfo);

    let user = req.body.user;
    let query = {
        partyToken: partyToken,
    };

    database.findOne("PARTIES", query, function (partyResult) {

        if(partyResult == null)
            res.send({ error: 'Party not found' });
        else {
            console.log('Party Found!');
            let newSong = new Song();
            newSong.setSongId(songInfo.songId);
            newSong.setSongName(songInfo.songName);
            newSong.setSongArtists(songInfo.songArtists);
            newSong.setSongLength(songInfo.songLength);
            queuePush.call(partyResult.songQueue, newSong);

            let queue = partyResult.songQueue;
            let newSongIndex = queue.length - 1;

            while (newSongIndex > 0 && (queue[newSongIndex].score > queue[newSongIndex - 1])) {
                let temp = queue[newSongIndex];
                queue[newSongIndex] = queue[newSongIndex - 1];
                queue[newSongIndex - 1] = temp;
                newSongIndex -= 1;
            }


            let updates = {
                $set: {
                    songQueue: partyResult.songQueue
                }
            };

            database.updateOne("PARTIES", query, updates, function () {
//                res.end();
            });

            if (partyResult.currentlyPlaying === null) {
                console.log("going into playLoop");
                playLoop(partyToken);
            }
            res.end();

        }
    });
});

app.get('/party/*/queue', function(req, res){
    let partyToken = (req.path).split("/")[2];

    let query = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", query, function (result) {
        // could not find pary
        if(result == null) {
            res.send({
                error: 'Party not found'
            });
        }
        else {
            res.send(result.songQueue);
        }
    });
});

app.get('/party/*/now-playing', function(req, res){
    let partyToken = (req.path).split("/")[2];

    let query = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", query, function (result) {
        // could not find pary
        if(result == null) {
            res.send({
                error: 'Party not found'
            });
        }
        else {
//            console.log(result.currentlyPlaying);
            res.send(result.currentlyPlaying);
        }
    });
});


app.get('/party/*/play', function(req, res) {
    let partyToken = (req.path).split("/")[2];
    playLoop(partyToken, res);
});

app.put('/party/*/vote', function (req, res) {
    let partyToken = (req.path).split("/")[2];
    let queueIndex = parseInt(req.body.queueIndex);
    //should be true if a like is being added, false if dislike
    let vote = req.body.vote;

    let query = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", query, function(result) {
        let queue = result.songQueue;

        let currSong = queue[queueIndex];

        //Checks if like or dislike
        //Uhh for some reason the equals true is needed lol, or else its always true
        if (vote === "like") {
            currSong.likes += 1;
            currSong.score += 1;

            while (queueIndex > 0 && (queue[queueIndex].score > queue[queueIndex - 1].score)) {
                let temp = queue[queueIndex];
                queue[queueIndex] = queue[queueIndex - 1];
                queue[queueIndex - 1] = temp;
                queueIndex -= 1;
            }
        }

        if (vote === "dislike") {
            currSong.dislikes += 1;
            currSong.score -= 1;

            while (queueIndex < queue.length - 1 && (queue[queueIndex].score < queue[queueIndex + 1].score)) {
                let temp = queue[queueIndex];
                queue[queueIndex] = queue[queueIndex + 1];
                queue[queueIndex + 1] = temp;
                queueIndex += 1;
            }
        }



        query = {
            partyToken: partyToken
        };

        let newVals = {
            $set: {
                songQueue: queue
            }
        };

        database.updateOne('PARTIES', query, newVals, function(result) {});
    });

});

app.get('/party/*', authenticationMiddleware(), function(req, res){
    res.sendFile(__dirname+"/client/party.html");
});



/* ------------------------------------------------------------------------- */

io.on('connection', function(socket){
    // console.log('a user connected');
    socket.on('disconnect', function(){
        // console.log('user disconnected');
    });

    socket.on('updateQueuePing', function (partyToken, toUpdate) {
        let query = { partyToken: partyToken };
        switch (toUpdate) {
            case "Queued Song":
                database.findOne("PARTIES", query, function (partyResult) {
                    io.emit('appendToQueue', partyResult);
                });
                break;
            default:
                console.log("ERROR");
            //TODO deal with this error
        }
    });
});

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
    return {
        salt:salt,
        passwordHash:value
    };
};

/*
 * returns hashed password and salt
 */
function saltHashPassword(userpassword) {
    let salt = generateRandomString(16);
    let passwordData = sha512(userpassword, salt);
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


/* -------------------------------------------------------------------------- */
/* ----------------------------- PLAY FUNCTIONS ----------------------------- */
/* -------------------------------------------------------------------------- */

function playLoop(partyToken) {

    let query = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", query, function (result) {

        if (result === null) {
            return "Party not found!";
        }
        else {

            let queue = result.songQueue;

            if (queue.length <= 0) {

                let query = {
                    partyToken: partyToken
                };

                let newVals = {
                    $set: {
                        currentlyPlaying: null
                    }
                };

                database.updateOne("PARTIES", query, newVals, function (result) {

                });
                return;
            }

            let nextSong = queuePop.call(queue);

            let songLength = nextSong.songLength;
            let songId = nextSong.songId;

            //Using temp spotify auth token
            let spotifyAuthToken = TEMP_AUTH_TOKEN;

            //second arg is the spotify uri, not the spotify song ID
            getAuthToken(partyToken, function (authToken) {
                playSong(authToken, "spotify:track:" + songId);
            });


            //callback function must be surrounded by function(){}
            let timeoutId = setTimeout(function () {
                playLoop(partyToken);
            }, songLength);

            //test later, below might look cleaner
            //let timeoutId = setTimeout(playLoop.bind(partyToken), songLength);

            query = {
                partyToken: partyToken,
            };

            //Only seperately putting the $sets worked, change it at your own risk
            let newVals = {
                $set: {
                    songQueue: queue,
//                  vv The below line causes the server to crash vv
//                  playTimeoutId: timeoutId,
                    currentlyPlaying: nextSong,
                }
            };

            database.update("PARTIES", query, newVals, function (result) {

            });

        }
    });
    return "Playing Songs...";
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

//Unecessary and doesn't work
/*
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
*/



/* -------------------------------------------------------------------------- */
/* ---------------------------- Authorization FUNCTIONS --------------------- */
/* -------------------------------------------------------------------------- */
function pingSpotify(authToken, callbackSuccess, callbackFail) {

    let header = {
        "Authorization": `Bearer ${authToken}`
    };

    let init = {
        method: 'GET',
        headers: header
    };

    return fetch("https://api.spotify.com/v1/me", init).then(function (response) {
        if (response.status == 200){
            //console.log('Got response so true...');
            //console.log(response);
            return callbackSuccess();
        }
        else {
            //console.log('Failed so false...');
            return callbackFail();
        }
    }).then(res => {return res});
};
/*
* Gets an Authentication token from party host sends to
* pingSpotify to check if the code works then uses it
* if working. If token is experied it refresh token and
* updates the token in the user's database.
*/
function getAuthToken(partyToken, callback) {
    //console.log("yyyypartyyyy");
    //console.log('partyToken:' + partyToken);
    //console.log("yyyypartyyyy");

    let prtyToken = {
        partyToken: partyToken
    }

    database.findOne("PARTIES", prtyToken, function (result) {
        if (result) {
            let userId = {
                username: result.admin
            };

            // console.log('----------');
            // console.log("user: " + result.admin);
            // console.log('----------');

            database.findOne("ACCOUNTS", userId, function (res) {
                let authToken = res.authenticateID;
                let refreshToken = res.refreshToken;
                let userID = {
                    username: res.username
                };
                //console.log("username of user: " + res.username);
                pingSpotify(authToken, function () {
                    // console.log('----');
                    // console.log('The authToken should be working!!');
                    // console.log('----');
                    callback(authToken);
                }, function () {
                    console.log("Token is broken/expired please get new token");
                    var authOptions = {
                            url: 'https://accounts.spotify.com/api/token',
                            headers: { 'Authorization': 'Basic ' + (new Buffer(clientID + ':' + clientSecret).toString('base64')) },
                            form: {
                                grant_type: 'refresh_token',
                                refresh_token: refreshToken
                            },
                            json: true
                        };

                    return request.post(authOptions, function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            console.log('its working I think?');
                            var access_token = body.access_token;
                            let updateAccess = {
                                $set: {
                                    authenticateID: access_token
                                }
                            }
                            database.updateOne("ACCOUNTS", userID, updateAccess, function (result) {
                                if (result != null){
                                    console.log("Updated Refresh");
                                }
                            });
                            callback(access_token);
                        }
                        else console.log('its not working I think? :( ');
                     });
                })
            })
        }

    });

};


/* -------------------------------------------------------------------------- */
/* ---------------------------- SEARCH FUNCTIONS ---------------------------- */
/* -------------------------------------------------------------------------- */

function searchAlbum(authToken, albumId) {
    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: headers
    };

    return fetch(`https://api.spotify.com/v1/albums/${albumId}`, init)
        .then(response => {
            if (response.status === 200) {
                return response.json().then(function(data) {
                    var albumInfo = {
                        albumName : data.name,
                        artists : data.artists,
                        tracks : [],
                        image : data.images[0].url
                    };
                    for (let i = 0; i < data.tracks.items.length; i++) {
                        var track = new Song();
                        // console.log("______________________________");
                        // console.log(data.tracks.items[i]);
                        track.setSongName(data.tracks.items[i].name);
                        track.setSongId(data.tracks.items[i].id);
                        track.setSongArtists(data.tracks.items[i].artists);
                        track.setSongLength(data.tracks.items[i].duration_ms);
                        track.setAlbumName(data.name);
                        track.setAlbumId(data.tracks.id);
                        track.setAlbumImage(data.images[0].url);
                        albumInfo.tracks.push(track);
                    }
                    return albumInfo;
                });
            }
            else if (response.status === 400) {
                return {
                    error: "ALBUM NOT FOUND"
                };
            }
            else {
                console.log("ERROR FROM SPOTIFY : " + response.status);
                return {
                    error: "ERROR FROM SPOTIFY"
                };
            }
        });
}

function searchArtistTopSongs(authToken, artistId) {
    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: headers
    };


    return fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`, init)
        .then(response => {
            if (response.status === 200) {
                return response.json().then(function(data) {
                    var artistTopSongs = [];
                    for (let i = 0; i < data.tracks.length; i++) {
                        var track = new Song();
                        track.setSongName(data.tracks[i].name);
                        track.setSongId(data.tracks[i].id);
                        track.setSongArtists(data.tracks[i].artists);
                        track.setSongLength(data.tracks[i].duration_ms);
                        track.setAlbumName(data.tracks[i].album.name);
                        track.setAlbumId(data.tracks[i].album.id);
                        track.setAlbumImage(data.tracks[i].album.images[0].url);
                        artistTopSongs.push(track);
                    }
                    return artistTopSongs;
                });
            }
            else if (response.status === 400) {
                return {
                    error: "ARTIST NOT FOUND"
                };
            }
            else {
                console.log("ERROR FROM SPOTIFY : " + response.status);
                return {
                    error: "ERROR FROM SPOTIFY"
                };            }
        });
}

function searchArtistInfo(authToken, artistId) {
    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: headers
    };


    return fetch(`https://api.spotify.com/v1/artists/${artistId}`, init)
        .then(response => {
            if (response.status === 200) {
                return response.json().then(function(data) {
                    return {
                        name : data.name,
                        image : data.images[0].url,
                    };
                });
            }
            else if (response.status === 400) {
                return {
                    error: "ARTIST NOT FOUND"
                };
            }
            else {
                console.log("ERROR FROM SPOTIFY : " + response.status);
                return {
                    error: "ERROR FROM SPOTIFY"
                };            }
        });
}

function searchArtistAlbums(authToken, artistId) {
    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: headers
    };


    return fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?market=${TEMP_LOCATION_ASSUMPTION}&limit=50`, init)
        .then(response => {
            if (response.status === 200) {
                return response.json().then(function(data) {
                    var artistAlbums = [];
                    var previousAlbumName = "";
                    for (let i = 0; i < data.items.length; i++) {
                        if (previousAlbumName == data.items[i].name)
                            continue;
                        previousAlbumName = data.items[i].name;
                        var album = new Album();
                        album.setAlbumName(data.items[i].name);
                        album.setAlbumId(data.items[i].id);
                        album.setAlbumArtists(data.items[i].artists);
                        album.setAlbumImage(data.items[i].images[0]);
                        album.setAlbumReleaseDate(data.items[i].release_date);
                        artistAlbums.push(album);
                    }
                    return artistAlbums;
                });
            }
            else if (response.status === 400) {
                return {
                    error: "ARTIST NOT FOUND"
                };
            }
            else {
                console.log("ERROR FROM SPOTIFY : " + response.status);
                return {
                    error: "ERROR FROM SPOTIFY"
                };            }
        });
}

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
                    if (type.includes("track")) {
                        for (let i = 0; i < data.tracks.items.length; i++) {
                            var track = new Song();
                            track.setSongName(data.tracks.items[i].name);
                            track.setSongId(data.tracks.items[i].id);
                            track.setSongArtists(data.tracks.items[i].artists);
                            track.setSongLength(data.tracks.items[i].duration_ms);
                            track.setAlbumName(data.tracks.items[i].album.name);
                            track.setAlbumId(data.tracks.items[i].album.id);
                            track.setAlbumImage(data.tracks.items[i].album.images[0].url);
                            dict.tracks.push(track);
                        }
                    }

                    if (type.includes("album")) {
                        var artists = [];
                        for (let i = 0; i < data.albums.items.length; i++) {
                            var album = new Album();

                            album.setAlbumName(data.albums.items[i].name);
                            album.setAlbumId(data.albums.items[i].id);
                            album.setAlbumArtists(data.albums.items[i].artists);
                            album.setAlbumImage(data.albums.items[i].images[0]);
                            album.setAlbumReleaseDate(data.albums.items[i].release_date);
                            dict.albums.push(album);
                        }
                    }
                    if (type.includes("playlist")) {
                        for (let i = 0; i < data.playlists.items.length; i++) {
                            var playlist = new Playlist();
                            playlist.setPlaylistName(data.playlists.items[i].name);
                            playlist.setPlaylistId(data.playlists.items[i].id);
                            playlist.setPlaylistSongCount(data.playlists.items[i].tracks.total);
                            playlist.setPlaylistImage(data.playlists.items[i].images[0].url);

                            if(data.playlists.items[i].owner.display_name == null )
                                playlist.setPlaylistOwnerName(data.playlists.items[i].owner.id);
                            else
                                playlist.setPlaylistOwnerName(data.playlists.items[i].owner.display_name);

                            dict.playlists.push(playlist);
                        }
                    }

                    if (type.includes("artist")) {
                        for (let i = 0; i < data.artists.items.length; i++) {
                            var artist = new Artist();
                            artist.setArtistName(data.artists.items[i].name);
                            artist.setArtistId(data.artists.items[i].id);
                            artist.setArtistImage(data.artists.items[i].images[0]);
                            dict.artists.push(artist);
                        }
                    }
                    return dict;
                });
            } else {
                console.log(response);
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

function searchPlaylist(authToken, playlistId) {

    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: header,
    };

    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, init)
        .then(function (res) {
            if (res.status == 200) {
                return res.json().then(function(data) {
                    var tracks = [];
                    for (i = 0; i < data.items.length; i++) {
                        var track = new Song();
                        track.setSongName(data.items[i].track.name);
                        track.setSongId(data.items[i].track.id);
                        track.setSongArtists(data.items[i].track.artists);
                        track.setSongLength(data.items[i].track.duration_ms);
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
        }).catch(error => {
            console.error(error);
        });
}

/* -------------------------------------------------------------------------- */
/* ---------------------------- SONG OBJECT/INFO ---------------------------- */
/* -------------------------------------------------------------------------- */

function Song () {
    this.songName = null;
    this.albumName = null;
    this.albumId = null;
    this.albumImage = null;
    this.songId = null;
    this.songArtists = [];
    this.songLength = 0;
    this.likes = 0;
    this.dislikes = 0;
    this.score = 0;

    this.getSongName = function() {
        return this.songName;
    };

    this.setSongName = function(songName) {
        this.songName = songName;
    };

    this.getAlbumId = function() {
        return this.albumId;
    };

    this.setAlbumId = function(songAlbumId) {
        this.albumId = songAlbumId;
    };

    this.getAlbumName = function() {
        return this.albumName;
    };

    this.setAlbumName = function(songAlbumName) {
        this.albumName = songAlbumName;
    };

    this.getAlbumImage = function() {
        return this.albumImage;
    };

    this.setAlbumImage = function(songAlbumImage) {
        this.albumImage = songAlbumImage;
    };

    this.getSongArtists = function() {
        return this.songArtist;
    };

    this.setSongArtists = function(songArtists) {
        this.songArtists = songArtists;
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
    };

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

function Album () {
    this.id = null;
    this.name = null;
    this.artists = [];
    this.image = null;
    this.songs = [];
    this.releaseDate = null;

    this.getAlbumReleaseDate = function() {
        return this.releaseDate;
    };

    this.setAlbumReleaseDate = function(releaseDate) {
        this.releaseDate = releaseDate;
    };

    this.getAlbumSongs = function() {
        return this.songs;
    };

    this.setAlbumSongs = function(songList) {
        this.songs = songList;
    };

    this.getAlbumId = function() {
        return this.id;
    };

    this.setAlbumId = function(id) {
        this.id = id;
    };

    this.getAlbumArtists = function() {
        return this.artists;
    };

    this.setAlbumArtists = function(artists) {
        this.artists = artists;
    };

    this.getAlbumName = function() {
        return this.name;
    };

    this.setAlbumName = function(name) {
        this.name = name;
    };

    this.getAlbumImage = function() {
        return this.image;
    };

    this.setAlbumImage = function(image) {
        this.image = image;
    };
}

function Artist () {
    this.id = null;
    this.name = null;
    this.image = null;

    this.getArtistImage = function() {
        return this.image;
    };

    this.setArtistImage = function(image) {
        this.image = image;
    };

    this.getArtistId = function() {
        return this.id;
    };

    this.setArtistId = function(id) {
        this.id = id;
    };

    this.getArtistId = function() {
        return this.id;
    };

    this.setArtistId = function(id) {
        this.id = id;
    };

    this.getArtistName = function() {
        return this.name;
    };

    this.setArtistName = function(name) {
        this.name = name;
    };
}

function Playlist () {
    this.id = null;
    this.name = null;
    this.ownerName = null;
    this.image = null;
    this.songCount = 0;

    this.getPlaylistSongCount = function() {
        return this.songCount;
    };

    this.setPlaylistSongCount = function(songCount) {
        this.songCount = songCount;
    };

    this.getPlaylistImage = function() {
        return this.image;
    };

    this.setPlaylistImage = function(image) {
        this.image = image;
    };

    this.getPlaylistId = function() {
        return this.id;
    };

    this.setPlaylistId = function(id) {
        this.id = id;
    };

    this.getPlaylistName = function() {
        return this.name;
    };

    this.setPlaylistName = function(name) {
        this.name = name;
    };

    this.getPlaylistOwnerName = function(){
        return this.ownerName;
    };

    this.setPlaylistOwnerName = function(ownerName){
        this.ownerName = ownerName;
    };
}
