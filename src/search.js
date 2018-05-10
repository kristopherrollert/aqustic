const fetch = require('node-fetch');
const Request = require('request');

/*
 * DESCRIPTION: A way to search for songs on spotify
 * ARGUMENTS:
 *  authorization -> authorization to work with spotify api
 *  query -> what we are searching
 *  type -> type of thing to search for. Optional and will default to all. options: track, album, playlist, artist
 * Returns a dictionary of the names of the top 20 results from spotify
 */
 // We will probably want to change how we deal with the response that is returned
 // Right now it just gets the names of the top 20 results for tracks, albums, playlist and artists
 // I'm not sure how we want to get the query and how we want to show the results
function search(authorization, query, type = "track,album,playlist,artist") {
    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authorization}`
    }

    var init = {
        method: 'GET',
        headers: headers
    }


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
                        // var track = new Song();
                        // track.setName(data.tracks.items[i].name);
                        // track.setId(data.tracks.items[i].id);
                        var track = data.tracks.items[i].name;
                        dict.tracks.push(track);
                    }
                }

                if (type.includes("album")) {
                    for (i = 0; i < data.albums.items.length; i++) {
                        var album = new Album();
                        album.setName(data.albums.items[i].name);
                        album.setId(data.albums.items[i].id);
                        // var album = data.albums.items[i].name
                        dict.albums.push(album);
                    }
                }

                if (type.includes("playlist")) {
                    for (i = 0; i < data.playlists.items.length; i++) {
                        var playlist = new Playlist();
                        playlist.setName(data.playlists.items[i].name);
                        playlist.setId(data.playlists.items[i].id);
                        playlist.setOwnerId(data.playlists.items[i].owner.id);
                        dict.playlists.push(playlist);
                    }
                }

                if (type.includes("artist")) {
                    for (i = 0; i < data.artists.items.length; i++) {
                        var artist = new Artist();
                        artist.setName(data.artists.items[i].name);
                        artist.setId(data.artists.items[i].id);
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
        console.debug(response);
        // ...
    }).catch(error => {
        console.error(error);
    });
}

function Album () {
    this.id = null;
    this.name = null;

    this.getId = function() {
        return this.id;
    }
    
    this.setId = function(id) {
        this.id = id;
    }

    this.getName = function() {
        return this.name;
    }

    this.setName = function(name) {
        this.name = name;
    }
}

function Playlist () {
    this.id = null;
    this.name = null;
    this.ownerId = null;

    this.getId = function() {
        return this.id;
    }
    
    this.setId = function(id) {
        this.id = id;
    }

    this.getName = function() {
        return this.name;
    }

    this.setName = function(name) {
        this.name = name;
    }

    this.getOwnerId = function(){
        return this.ownerId;
    }

    this.setOwnerId = function(ownerId){
        this.ownerId = ownerId;
    }
}

function Artist () {
    this.id = null;
    this.name = null;

    this.getId = function() {
        return this.id;
    }
    
    this.setId = function(id) {
        this.id = id;
    }

    this.getName = function() {
        return this.name;
    }

    this.setName = function(name) {
        this.name = name;
    }
}

function Song () {
    this.id = null;
    this.name = null;

    this.getId = function() {
        return this.id;
    }
    
    this.setId = function(id) {
        this.id = id;
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


/*
 * DESCRIPTION: A way to get the top songs and albums from an artist on spotify
 * ARGUMENTS:
 *  authToken -> authorization to work with spotify api
 *  artistId -> artist to be looked up
 * Returns a dictionary of the top tracks and albums from the artist
 */
 function getArtist(authToken, artistId, country = 'US') {

    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    }

    var init = {
        method: 'GET',
        headers: header,
    }

    var artist = {
        tracks: [],
        albums: []
    };

    artist.tracks = fetch(` https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=${country}`, init)
        .then(function (res) {
            if (res.status == 200) {
                return res.json().then(function(data) {
                    var tracks = [];
                    for (i = 0; i < data.tracks.length; i++) {
                        var track = new Song();
                        track.setName(data.tracks[i].name);
                        track.setId(data.tracks[i].id);
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

    artist.albums = fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, init)
        .then(function (res) {
            if (res.status == 200) {
                return res.json().then(function(data) {
                    var albums = [];
                    for (i = 0; i < data.items.length; i++) {
                        var album = new Album();
                        album.setName(data.items[i].name);
                        album.setId(data.items[i].id);
                        // var track = data.items[i].name;
                        albums.push(album);
                    }
                    return albums;
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
    return artist;
}


function getPlaylist(authToken, playlistId, userId) {

    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    }

    var init = {
        method: 'GET',
        headers: header,
    }

    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, init)
        .then(function (res) {
            if (res.status == 200) {
                return res.json().then(function(data) {
                    var tracks = [];
                    for (i = 0; i < data.items.length; i++) {
                        var track = new Song();
                        track.setName(data.items[i].track.name);
                        track.setId(data.items[i].track.id);
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


/*
 * DESCRIPTION: A way to parse a query from a user into something usable by the spotify API
 * ARGUMENTS:
 *  query -> a search query from a user
 * returns a usable string for the spotify API
 */
function parse_search(query) {
    return query.replace(/ /i, '%20')
}

var authToken = "BQAQ6VmjbMwYnV5gH_vS1XINzbSN3ex616UsLIWQdCx0Sj0lUdnwbvU71cmQoltbyhieCgeRbDrGROEahEaBEfQ1CMWzMlp9hVV29q2yZc9bW8eIQ_q7Kvhi9bMeJ7IB4m1fLe3W6m_QkGDoi355hoXweCT8zPkNd_-MDFACGhXeldFiLy7bDaa6ExroZ6nDQTj8dgouOhSKiVeOI7PDLVdOWVQNsMWp1vEA5elAI9CWBkqGa7sW6i2--8ARAITkxQ3O9vPk";
// var tracks = getAlbum(authToken, "2zcx8cMjC0zHU94PrIZZd0")
// tracks.then(function(data) {
//     console.log(data);
// });

// getArtist(authToken, '06HL4z0CvFAxyc27GXpf02');

// getPlaylist(authToken, '37i9dQZF1DX5KpP2LN299J', 'spotify');
search(authToken, parse_search('taylor swift'));
