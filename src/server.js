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

/* Constants to be changed before release */
const clientID = "1951f93df40942a59574ed5d17e5425a";
const clientSecret = "048262fe59c048e18ce94d18d5784078";
const port = 3000;
const baseUrl = `http://localhost:${port}`;

/* Server Modules */
const http = require('http');
const mongo = require('mongodb');
const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const mongoClient = mongo.MongoClient;
const app = express();

/* TODO : I am unsure what this does, but I feel like it shouldn't be a global
 *        varible. -kris */
var authStateKey = 'spotify_auth_state';


/* ------------------------------------------------------------------------- */
/* ----------------------------- DATABASE CODE ----------------------------- */
/* ------------------------------------------------------------------------- */

var database = {
    /* General Databse Information */
    name: "aqusticDB",
    url: 'mongodb://localhost:27017/',
    createCollection: function(collectionName) {
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.createCollection(collectionName, function(err, res) {
                if (err) throw err;
                console.log(`Created ${collectionName} collection!`);
                db.close();
            });
        });
    },
    insertOne: function (collectionName, item) {
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).insertOne(item, function(err, res) {
                if (err) throw err;
                console.log("Inserted One Element");
                db.close();
            });
        });
    },
    insertMany: function(collectionName, items) {
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).insertOne(item, function(err, res) {
                if (err) throw err;
                console.log("Inserted One Element");
                db.close();
            });
        });
    },

    /* returns an array of */
    findOne: function(collectionName, query = {}){
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            return database.collection(collectionName).findOne(query, function(err, result) {
                if (err) throw err;
                db.close();
                return result;
            });
        });
    },

    find: function(collectionName, query = {}){
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            return database.collection(collectionName).find(query, function(err, result) {
                if (err) throw err;
                db.close();
                return result;
            });
        });
    },

    findAll: function(collectionName) {
        return this.find(collectionName, {});
    },
};

database.createCollection("PARTIES");
database.insertOne("PARTIES",  {name: "Kristopher Rollert", title: "orange grapes"});
console.log(database.findAll("PARTIES"));

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


/* ------------------------------------------------------------------------- */
/* ------------------------------- ENDPOINTS ------------------------------- */
/* ------------------------------------------------------------------------- */

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


/* ----------------------------------------------------------------------- */

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});
