/* jshint esversion: 6 */
let TEMP_LOCATION_ASSUMPTION = "US";
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

/* Constants to be changed before release */
const clientID = "1951f93df40942a59574ed5d17e5425a";
const clientSecret = "048262fe59c048e18ce94d18d5784078";
const port = 3000;
const baseUrl = `http://localhost:${port}`;
 // const baseUrl = 'https://aqustic-205720.appspot.com'

/*----------- Server Modules -----------*/
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
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const sessionSecret = "aqusticServer"; //TODO: should be hidden


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mongoClient = mongo.MongoClient;
const mongoUser = 'admin';
const mongoPass = 'aqustic115';


server.listen(8080);

let authStateKey = 'spotify_auth_state';
const debug = false; // this can be set to false to hide console.logs


/* -------------------------------------------------------------------------- */
/* ------------------------------ QUEUE FUNCTIONS --------------------------- */
/* -------------------------------------------------------------------------- */

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

    /* General Database Information */
    name: "aqusticDB",

    // the below line should replace the other url in final for the server
    // url: `mongodb://${mongoUser}:${mongoPass}@ds241570.mlab.com:41570/aqustic` || 'mongodb://localhost:27017/',
    url: 'mongodb://localhost:27017/' || `mongodb://${mongoUser}:${mongoPass}@ds241570.mlab.com:41570/aqustic` ,

    /**
     * Creates a database collection
     * @param {String} collectionName : name of the collection
     * @param {Function} calback : todo after database task completes
     */
    createCollection: function(collectionName, callback = null) {
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            let database = db.db(this.name);
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

    /**
     * Insert one element into the database
     * @param {String} collectionName : name of the collection
     * @param {Object} item : query of an item to add to database
     * @param {Function} calback : todo after database task completes
     */
    insertOne: function (collectionName, item, callback = null) {
        mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            let database = db.db(this.name);
            database.collection(collectionName).insertOne(item,
                function (err, result) {
                    if (err) throw err;
                    if (debug) console.log("Inserted One Element");
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },

    /**
     * Insert multiple elements into the database
     * @param {String} collectionName : name of the collection
     * @param {Object} items : query of the items to add to database
     * @param {Function} calback : todo after database task completes
     */
    insertMany: function (collectionName, items, callback = null) {
        mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            let database = db.db(this.name);
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

    /**
     * Finds an element in the database
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the item to find
     * @param {Function} calback : todo after database task completes
     */
    findOne: function (collectionName, query = {}, callback = null) {
        return mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            let database = db.db(this.name);
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

    /**
     * Finds a specific number of elements in the database
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the items to find
     * @param {Integer} limit : the max number of results to return
     * @param {Function} calback : todo after database task completes
     */
    find: function(collectionName, query = {}, limit = 0, callback = null){
        return mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            let database = db.db(this.name);
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

    /**
     * Finds all elements in the database
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the items to find
     * @param {Function} calback : todo after database task completes
     */
    findAll: function (collectionName, query = {}, callback = null) {
        return this.find(collectionName, query, 0, callback );
    },

    /**
     * Updates one element in the database
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the item to change
     * @param {Object} newValues : information on what to change
     * @param {Function} calback : todo after database task completes
     */
    updateOne: function (collectionName, query, newValues, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            let database = db.db(this.name);
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

    /**
     * Updates multiple elements in the database
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the items to change
     * @param {Object} newValues : information on what to change
     * @param {Function} calback : todo after database task completes
     */
    update: function (collectionName, query, newValues, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            let database = db.db(this.name);
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

    /**
     * Deletes one element in the database
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the item to delete
     * @param {Function} calback : todo after database task completes
     */
    deleteOne: function (collectionName, query, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            let database = db.db(this.name);
            database.collection(collectionName).deleteOne(query,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log("DELETED ELEMENT");
                    db.close();
                    if (callback) callback(result);
                });
        });
    },

    /**
     * Deletes all elements in the database matching the query
     * @param {String} collectionName : name of the collection
     * @param {Object} query : query of the items to delete
     * @param {Function} calback : todo after database task completes
     */
    delete: function (collectionName, query, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            let database = db.db(this.name);
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
 * Middleware that removes the browser from blocking certain
 * requests.
 */
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

/*
 * Middleware that parses cookies from the client folder.
 */
app.use(express.static(__dirname + '/client')).use(cookieParser());

// these allow us to support JSON-encoded bodies and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    cookieName: 'session',
    duration: (30 * 60 * 1000 * 100),
    activeDuration: (5 * 60 * 1000 * 100),
    store: new MongoStore({
        url: 'mongodb://localhost:27017/',
        // url: `mongodb://${mongoUser}:${mongoPass}@ds241570.mlab.com:41570/aqustic`,
        touchAfter: (24 * 24 * 36000) // time period in seconds
    }),
    secret: 'asdf',//make secrets secret
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    cookie: {
        secure: false,
        path: '/',
        httpOnly: true,
        maxAge: new Date(Date.now() + 36000000),
    }
}));

app.use(passport.initialize());
app.use(passport.session());

/* ------------------------------------------------------------------------- */
/* ------------------------------- ENDPOINTS ------------------------------- */
/* ------------------------------------------------------------------------- */

/**
 *  Endpoint to log out user
 */
app.get('/logout', function(req, res){
    req.logout();
    req.session.destroy();
    console.log("Logged Out!");
    res.redirect('/signin');
});

/**
 *  Endpoint that returns search results for an artist
 */
app.get('/search/artist/*', function (req, res) {
    let artistId = (req.path).split("/")[3];
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

/**
 *  Endpoint that returns search for album
 */
app.get('/search/album/*', function (req, res) {
    let albumId = (req.path).split("/")[3];
    if (albumId == null) {
        res.send({
            error: "NO ALBUM GIVEN"
        });
    }
    else {
        getAuthToken(req.query.partyToken, function (authToken) {
            searchAlbum(authToken, albumId).then(data => {
                res.send(data);
            });
        });
    }
});

/**
 *  Endpoint for searching playlists
 */
app.get('/search/playlist/*', function (req, res) {
    let playlistInfo = (req.path).split("/")[3].split("-");
    let playlistId = playlistInfo[0];
    let userId = playlistInfo[1];
    if (playlistId === null ||
        playlistId === "" ||
        userId === null ||
        userId === "") {
        res.send({
            error: "NO PLAYLIST GIVEN"
        });
    }
    else {
        getAuthToken(req.query.partyToken, function (authToken) {
            searchPlaylist(authToken, playlistId, userId).then(data => {
                res.send(data);
            });
        });
    }
});

/**
 *  Endpoint for searching songs
 */
app.get('/search', function(req,res) {
    let query = req.query.query || '';
    let type = req.query.type || 'all';
    let user = req.user;
    let userID = {
        username: user,
    };
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

/* ----------------------------------------------------------------------- */

/**
 *  Endpoint for signing in users, sends you to home after
 */
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

/**
 *  Endpoint for creating accounts, sends you to home after, logged in
 */
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
                    authenticateID: null,
                    refreshToken: null
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

/**
 *  Endpoint that returns info about an account
 */
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

/* ------------------------------------------------------------------------- */
/* ----------------------------- STORE SESSIONS ---------------------------- */
/* ------------------------------------------------------------------------- */

passport.serializeUser(function(userID, done) {
    done(null, userID);
});

passport.deserializeUser(function(userID, done) {
    done(null, userID);
});

/*
 * Checks if user is authenticated, if not redirects them back to the sign in page
 */
function authenticationMiddleware () {
    return (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect('/signin');
    };
}


/* ------------------------------------------------------------------------- */

/**
 * Endpoint to send you to the spotify authorization site
 */
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
 */
app.get('/settings', function(req, res){
    res.sendFile(__dirname+"/client/auth.html");
});


/**
 * Where the spotify authorization sends you after you approve access for this app
 */
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

                /*
                 *  Save authentication token and update token to the database
                 */
                 let updateAuthAndRefresh = {
                     $set: {
                         authenticateID: access_token,
                         refreshToken: refresh_token
                     }
                 };

                 database.update("ACCOUNTS", userID, updateAuthAndRefresh, function (result) {
                     res.redirect("/home");
                 });

            }
            else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    })
                );
            }
        });
    }
});

/**
 * Endpoint to create a party, needs party name and an admin for token
 */
app.put('/party/create-party', function(req, res) {
    let partyToken = generateRandomString(8);
    let admin = req.user;
    console.log("ADMIN", admin);
    let partyName = req.body.partyName;
    let authenticated = JSON.parse(req.body.authenticated);
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
            partyName : partyName,
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

/**
 *  Endpoint for non-party-owners to join a party
 */
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
            if (result === null) {
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

/**
 *  Endpoint that sends you to the search page
 */
app.get('/party/*/search', function(req, res){
    res.sendFile(__dirname+"/client/search.html");
});

/**
 *  Endpoint that sends you to testing page, only accessable through direct url
 */
app.get('/test/party', function(req, res){
    res.sendFile(__dirname+"/testing/testCreateParty.html");
});

/**
 *  Enpoint that adds a song to the song queue for a specific party
 */
app.put('/party/*/queue-song', function(req, res) {
    let partyToken = (req.path).split("/")[2];
    let songInfo = JSON.parse(req.body.songInfo);

    let query = {
        partyToken: partyToken,
    };

    database.findOne("PARTIES", query, function (partyResult) {

        if(partyResult == null)
            res.send({ error: 'Party not found' });
        else {
            let newSong = new Song();
            newSong.setSongId(songInfo.songId);
            newSong.setSongName(songInfo.songName);
            newSong.setSongArtists(songInfo.songArtists);
            newSong.setSongLength(songInfo.songLength);
            queuePush.call(partyResult.songQueue, newSong);

            let queue = partyResult.songQueue;
            let newSongIndex = queue.length - 1;

            while (newSongIndex > 0 && (queue[newSongIndex].score > queue[newSongIndex - 1].score)) {
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

            database.updateOne("PARTIES", query, updates, function(result) {
                if (partyResult.currentlyPlaying === null) {
                    playLoop(partyToken);
                }
                res.end();
            });

        }
    });
});

/**
 *  Endpoint that returns information about specific party
 */
app.get('/party/*/get-info', function(req, res){
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
            res.send({
                partyName : result.partyName,
                admin : result.admin,
                partyToken : result.partyToken
            });
        }
    });
});

/**
 *  Endpoint that returns the entire queue for that party
 */
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

/**
 *  Endpoint that returns the currentlyPlaying song in that party
 */
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

/**
 *  Endpoint that triggers playing from the start of the queue
 *
 *  Unused in current website, playLoop is triggered by queueing a song with a null currentlyPlaying
 */
app.get('/party/*/play', function(req, res) {
    let partyToken = (req.path).split("/")[2];
    let back = playLoop(partyToken);
    res.send(back);
});

/**
 *  Endpoint in charge of voting, req.body.vote must be either "like" or "dislike"
 */
app.put('/party/*/vote', function (req, res) {
    let partyToken = (req.path).split("/")[2];
    let queueIndex = parseInt(req.body.queueIndex);
    let user = req.user;
    // req.body.vote is either "like" or "dislike"
    let vote = req.body.vote;

    let query = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", query, function(result) {
        let queue = result.songQueue;
        let currSong = queue[queueIndex];
        let usersLikedList = currSong.usersLiked;
        let usersDislikedList = currSong.usersDisliked;
        let likeIndex = usersLikedList.indexOf(user);
        let dislikeIndex = usersDislikedList.indexOf(user);

        //Checks if like or dislike
        //Uhh for some reason the equals true is needed lol, or else its always true
        if (vote === "like") {
            //if the user is in usersLikedList
            if (likeIndex > -1) {
                res.end();
            }
            //if the user is in usersDislikedList
            else if (dislikeIndex > -1) {
                currSong.likes += 1;
                currSong.dislikes -= 1;
                currSong.score += 2;

                //removes user from dislikes and adds to likes
                usersDislikedList.splice(dislikeIndex, 1);
                usersLikedList.push(user);
            }
            //Only if user is not in either like or dislike list
            else {
                currSong.likes += 1;
                currSong.score += 1;

                usersLikedList.push(user);
            }

            while (queueIndex > 0 && (queue[queueIndex].score > queue[queueIndex - 1].score)) {
                let temp = queue[queueIndex];
                queue[queueIndex] = queue[queueIndex - 1];
                queue[queueIndex - 1] = temp;
                queueIndex -= 1;
            }
        }

        if (vote === "dislike") {
            if (dislikeIndex > -1) {
                res.end();
            }
            //if the user is in usersDislikedList
            else if (likeIndex > -1) {
                currSong.dislikes += 1;
                currSong.likes -= 1;
                currSong.score -= 2;

                //removes user from dislikes and adds to likes
                usersLikedList.splice(dislikeIndex, 1);
                usersDislikedList.push(user);
            }
            //Only if user is not in either like or dislike list
            else {
                currSong.dislikes += 1;
                currSong.score -= 1;

                usersDislikedList.push(user);
            }

            while (queueIndex < queue.length - 1 && (queue[queueIndex].score < queue[queueIndex + 1].score)) {
                let temp = queue[queueIndex];
                queue[queueIndex] = queue[queueIndex + 1];
                queue[queueIndex + 1] = temp;
                queueIndex += 1;
            }
        }

        currSong.usersLiked = usersLikedList;
        currSong.usersDisliked = usersDislikedList;

        queue[queueIndex] = currSong;

        //Update all the new info into the database
        query = {
            partyToken: partyToken
        };

        let newVals = {
            $set: {
                songQueue: queue
            }
        };

        database.updateOne('PARTIES', query, newVals, function () {
            io.to(partyToken).emit('updateQueue');
        });
    });

});



/* ------------------------------------------------------------------------- */
/* ---------------------------- SOCKET FUNCTIONS --------------------------- */
/* ------------------------------------------------------------------------- */

/**
 *  Socket.io functions to handle live updating of votes and currentlyPlaying
 */
io.on('connection', function(socket){
    // console.log('a user connected');
    socket.on('disconnect', function() {
        // console.log('user disconnected');
    });

    socket.on('join-party', function (partyToken) {
        socket.join(partyToken);
    });

    socket.on('updateQueuePing', function (partyToken) {
        io.in(partyToken).emit('updateQueue');
    });
});

/**
 *  Endpoint to send you to signin page
 */
app.get('/signin', function(req, res){
    res.sendFile(__dirname+"/client/signin.html");
});

/**
 *  Endpoint to send you to artist's page
 */
app.get('/party/*/search/artist/*', function(req, res){
    res.sendFile(__dirname+"/client/artist.html");
});

/**
 *  Endpoint to send you to album page
 */
app.get('/party/*/search/album/*', function(req, res){
    res.sendFile(__dirname+"/client/album.html");
});

/**
 *  Endpoint to send you to playlist page
 */
app.get('/party/*/search/playlist/*', function(req, res){
    res.sendFile(__dirname+"/client/playlist.html");
});

/**
 *  Endpoint to send you to sign up page
 */
app.get('/signup', function(req, res){
    res.sendFile(__dirname+"/client/signup.html");
});

/**
 *  Endpoint to send you to homepage
 */
app.get('/home', authenticationMiddleware() ,function(req, res){
    res.sendFile(__dirname+"/client/home.html");
});

/**
 *  Endpoint that sends you to the homepage of a specific party
 */
app.get('/party/*', authenticationMiddleware(), function(req, res){
    res.sendFile(__dirname+"/client/party.html");
});

/**
 *  Initialization of node.js
 */
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
 * @param {string} password : List of required fields.
 * @param {string} salt : Data to be validated.
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

/**
 * returns hashed password and salt
 * @param {string} userpassword : the user's password as a sting
 */
function saltHashPassword(userPassword) {
    let salt = generateRandomString(16);
    let passwordData = sha512(userPassword, salt);
    return { hashPassword: passwordData.passwordHash,
        salt: passwordData.salt };
}

/**
 * Hashes password with salt
 * @param {String} userPassword : the string of user's password
 * @param {String} salt : the salt given
 */
function hashPassword(userPassword, salt) {
    let passwordData = sha512(userPassword, salt);
    return passwordData.passwordHash;
}

/**
 * Returns true if string has special characters
 * @param {String} str : the string to check if valid
 */
function isValid(str){
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

/* -------------------------------------------------------------------------- */
/* ----------------------------- PLAY FUNCTIONS ----------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Calling the playLoop function causes songs to start playing from the queue,
 * with partyToken being the token of the party to start playing
 *
 * This function is called recursively by the setTimeout(), which calls this function after
 * the duration of the song to be played.
 *
 *  @param {String} partyToken : the string of the party indetification
 */
function playLoop(partyToken) {

    let query = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", query, function (result) {
        if (result === null) {
            return {error: "Party not found!"};
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
                    io.to(partyToken).emit('updateQueue');
                });
                return {error: "Queue is empty!"};
            }

            let nextSong = queuePop.call(queue);
            let songLength = nextSong.songLength;
            let songId = nextSong.songId;

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
                 // playTimeoutId: timeoutId,
                    currentlyPlaying: nextSong,
                }
            };
            database.update("PARTIES", query, newVals, function () {
                io.to(partyToken).emit('updateQueue');
            });
        }
    });
    return {message: "Playing Song..."};
}


/**
 * This function makes the spotify api call to play a song, using the spotify authentication token
 * and the song song uri (the one with track:spotify:... before it).
 *
 * @param {String} authToken : the authorization token given from spotify
 * @param {String} songURI : the spotify code for the song
 */
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
    fetch("https://api.spotify.com/v1/me/player/play", init)
        .then(function (res) {
            if (res.status === 204) {
                return "Playing Song...";
            }
            else {
                return res.status;
            }
        });


}

/* -------------------------------------------------------------------------- */
/* ---------------------------- AUTHORIZATION FUNCTIONS --------------------- */
/* -------------------------------------------------------------------------- */


/**
 * Gets an Authentication token from party host sends to
 * pingSpotify to check if the code is valid then if valid
 * uses it, if not updates the token in the user's database.
 *
 * @param {String} partyToken : the party identification string
 * @param {Function} callback : the function callback to run after completion
 */
function getAuthToken(partyToken, callback) {

    let prtyToken = {
        partyToken: partyToken
    };

    database.findOne("PARTIES", prtyToken, function (result) {
        if (result) {
            let userId = {
                username: result.admin
            };

            database.findOne("ACCOUNTS", userId, function (res) {
                let authToken = res.authenticateID;
                let refreshToken = res.refreshToken;
                let userID = {
                    username: res.username
                };

                pingSpotify(authToken, function () {
                    callback(authToken);
                }, function () {
                    var authOptions = {
                            url: 'https://accounts.spotify.com/api/token',
                            headers: { 'Authorization': 'Basic ' + (new Buffer(clientID + ':' + clientSecret).toString('base64')) },
                            form: {
                                grant_type: 'refresh_token',
                                refresh_token: refreshToken
                            },
                            json: true
                        };

                    request.post(authOptions, function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            var access_token = body.access_token;
                            let updateAccess = {
                                $set: {
                                    authenticateID: access_token
                                }
                            };
                            database.updateOne("ACCOUNTS", userID, updateAccess);
                            callback(access_token);
                        }
                        else {
                            console.log('ERROR: getting new refresh token');
                        }
                     });
                });
            });
        }

    });

}

/**
 * Makes a call to Spotify to check if authToken is valid.
 * @param {String} authToken : string of the spotify authorization token
 * @param {Function} callbackSuccess : the function to run if pinging succeeds
 * @param {Function} callbackFail : the function to run if pinging fails
 *
 */
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
            return callbackSuccess();
        }
        else {
            //console.log('Failed so false...');
            return callbackFail();
        }
    }).then(res => {return res;});
}
/* -------------------------------------------------------------------------- */
/* ---------------------------- SEARCH FUNCTIONS ---------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Makes spotify api call to search by albums
 * @param {String} authToken : spotify authorization token
 * @param {String} albumId : spotify album id
 * @param {Object} : album information
 */
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
                        track.setSongName(data.tracks.items[i].name);
                        track.setSongId(data.tracks.items[i].id);
                        track.setSongArtists(data.tracks.items[i].artists);
                        track.setSongLength(data.tracks.items[i].duration_ms);
                        track.setAlbumName(data.name);
                        track.setAlbumId(data.id);
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

/**
 * Makes spotify api call to find the top songs for certain artists
 * @param {String} authToken : spotify authorization token
 * @param {String} artistId : spotify artist id
 * @return {Array} : a list of song objects
 */
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

/**
 * Makes spotify api call for artists' basic information
 * @param {String} authToken : spotify authorization token
 * @param {String} artistId : spotify artist id
 * @return {Object} : basic artist informaton
 */
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
                    var artistImageData = data.images[0];
                    return {
                        name : data.name,
                        image : artistImageData != null ? artistImageData.url : null,
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

/**
 *  Makes spotify api call to search for an artist's albums
 * @param {String} authToken : spotify authorization token
 * @param {String} artistId : spotify artist id
 * @return {Array} : a list of the artist's album
 */
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
                        album.setAlbumImage(data.items[i].images[0].url);
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

/**
 *  Makes spotify api call to look for playlists for a certain user
 * @param {String} authToken : spotify authorization token
 * @param {String} playlistId : spotify playlist id
 * @param {String} userId : spotify user id for the playlist
 * @param {Array} : a list of tracks on the playlist
 */
function searchPlaylist(authToken, playlistId, userId) {

    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };

    var init = {
        method: 'GET',
        headers: header,
    };

    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`, init)
        .then(function (res) {
            if (res.status == 200) {
                return res.json().then(function(data) {
                    var tracks = [];
                    for (i = 0; i < data.tracks.items.length; i++) {
                        var track = new Song();
                        track.setSongName(data.tracks.items[i].track.name);
                        track.setSongId(data.tracks.items[i].track.id);
                        track.setSongArtists(data.tracks.items[i].track.artists);
                        track.setSongLength(data.tracks.items[i].track.duration_ms);
                        track.setAlbumName(data.tracks.items[i].track.album.name);
                        track.setAlbumId(data.tracks.items[i].track.album.id);
                        track.setAlbumImage(data.tracks.items[i].track.album.images[0].url);
                        tracks.push(track);
                    }
                    return {
                        name: data.name,
                        creator: data.owner.display_name || data.owner.id,
                        image: data.images[0].url,
                        tracks : tracks
                    };
                });
            }
            else {
                throw new Error(`Something went wrong on api server! ${res.status}`);
            }
        }).catch(error => {
            console.log(error);
        });
}



/**
 * A way to search for songs on spotify
 * @param {String} authToken : spotify authorization token
 * @param {Object} query : the search query
 * @param {String} type : what content you want returned
 * @return {Object} : a dictionary of the names of the top 20 results from
 *                    spotify, and song objects (still needs work)
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
                            album.setAlbumImage(data.albums.items[i].images[0].url);
                            album.setAlbumReleaseDate(data.albums.items[i].release_date);
                            dict.albums.push(album);
                        }
                    }
                    if (type.includes("playlist")) {
                        for (let i = 0; i < data.playlists.items.length; i++) {
                            var playlist = new Playlist();
                            playlist.setPlaylistName(data.playlists.items[i].name);
                            playlist.setPlaylistOwnerId(data.playlists.items[i].owner.id);
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
                            var artistImageData = data.artists.items[i].images[0];
                            artist.setArtistImage(artistImageData != null ? artistImageData.url : null );
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

/**
 * A way to parse a query from a user into something usable by the spotify API
 * @param {String} query : a search query from a user
 * @return : a usable string for the spotify API
 */
function parse_search(query) {
    return query.replace(/ /i, '%20');
}

/* -------------------------------------------------------------------------- */
/* ---------------------------- CREATE PLAYLIST ----------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * This function will create a playlist with the party name.
 * @param {String} authToken : spotify autherization token
 * @param {String} userId : the spotify id for the user
 * @param {String} partyName : the name of the party
 * @return : the id of the playlist created for the party
 * TODO: needs to be saved
 */
function createPlaylist(authToken, userId, partyName) {

    var header = {
        "Authorization": `Bearer ${authToken}`
    };

    var body = {
        "name": `aqustic_${partyName}`,
    };

    var init = {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
    };
    //TODO make the query "device_id" equal to the name of the player
    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, init)
        .then(function (res) {
            if (res.status == 201) {
                console.log("Creating Playlist...");
                res.json().then(function(data) {
                    console.log(data);
                });
            }
            else {
                console.log("ERROR: " + res.status);
            }
        });
}


//form of tracks - 'spotify:track:songId' in an array
//ex: ['spotify:track:1301WleyT98MSxVHPZCA6M']

/**
 * From the userId and playlistId, adds tracks to the playlist
 * @param {String} authToken : spotify autherization token
 * @param {String} userId : the spotify id for the user
 * @param {String} partyName : the name of the party
 * @param {Array} tracks : a list of tracks to be added to the playlist
 * TODO: needs to be saved
 */
function addToPlaylist(authToken, userId, playlistId, tracks) {

    var header = {
        'Authorization': `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    var body = {
        'uris': tracks
    };

    var init = {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body)
    };

    fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, init).then(function (res) {
        console.log(res);
        if (res.status == 201) {
            console.log('adding songs');
        }
        else {
            console.log('ERROR: ' + JSON.stringify(res));
        }
    });
}


/* -------------------------------------------------------------------------- */
/* ---------------------------- SONG OBJECT/INFO ---------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Song object to store in the database;
 * after a song is entered into the database, the getter functions no longer work
 */
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
    this.usersLiked = [];
    this.usersDisliked = [];

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

/**
 * Album object that holds info about albums so they can be sent to the user
 */
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

/**
 * Artist info, so that it can be sent to the user
 */
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

/**
 * Playlist info, so that it can be sent to the user
 */
function Playlist () {
    this.id = null;
    this.name = null;
    this.ownerName = null;
    this.ownerId = null;
    this.image = null;
    this.songCount = 0;

    this.getPlaylistOwnerId = function() {
        return this.ownerId;
    };

    this.setPlaylistOwnerId = function(id) {
        this.ownerId = id;
    };

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

exports.database = database;
