/*jshint esversion: 6 */

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
 * Version: 0.0
 * Website:
 * Developers:
 *  Kristopher Rollert
 *  Kai Schniedergers
 *  Michelle Slaughter
 *  Lorenzo Yabut
 *
 */

const fetch = require('node-fetch');
const Request = require('request');


module.exports = {
    /*
    * DESCRIPTION: A way to search for songs on spotify
    * ARGUMENTS:
    *  authorization -> authorization to work with spotify api
    *  query -> what we are searching
    *  type(optional) -> type of thing to search for. defaults to all. options: track, album, playlist, artist
    * Returns a dictionary of the names of the top 20 results from spotify, and song objects (still needs work)
    */
    search : function(authToken, query, type = 'all') {
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
                            track.setAlbumImage(data.tracks.items[i].album.images[0]);
                            dict.tracks.push(track);
                        }
                    }

                    if (type.includes("album")) {
                        var artists = [];
                        for (let i = 0; i < data.albums.items.length; i++) {
                            var album = new Album();
                            album.setAlbumName(data.albums.items[i].name);
                            album.setAlbumId(data.albums.items[i].id);
                            for (var a = 0; a < data.albums.items[i].artists.length; a++) {
                                artists.push(data.albums.items[i].artists[a]);
                            }
                            album.setAlbumArtists(artists);
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
                            playlist.setOwnerId(data.playlists.items[i].owner.id);
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
        }).catch(error => {
            console.log(error);
        });
    },

    /*
     * DESCRIPTION: A way to parse a query from a user into something usable by the spotify API
     * ARGUMENTS:
     *  query -> a search query from a user
     * returns a usable string for the spotify API
     */
    parse_search : function(query) {
        return query.replace(/ /i, '%20');
    },

    /*
     * DESCRIPTION: A way to get the songs in an album on spotify
     * ARGUMENTS:
     *  authToken -> authorization to work with spotify api
     *  albumId -> album to get tracks from
     * returns a dictionary of the tracks, made into song objects
     */
    getAlbum : function(authToken, albumId) {

        var header = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }

        var init = {
            method: 'GET',
            headers: header,
        }

        return fetch(`https://api.spotify.com/v1/albums/${albumId}`, init)
            .then(function (res) {
                if (res.status == 200) {
                    var album = new Album();
                    return res.json().then(function(data) {
                        var tracks = [];
                        for (i = 0; i < data.tracks.items.length; i++) {
                            var track = new Song();
                            track.setSongName(data.tracks.items[i].name);
                            track.setSongId(data.tracks.items[i].id);
                            track.setSongArtists(data.tracks.items[i].artists);
                            track.setSongLength(data.tracks.items[i].duration_ms);
                            tracks.push(track);
                        }
                        album.setSongs(tracks);
                        album.setAlbumId(data.id);
                        var artists = [];
                        for(j = 0; j < data.artists.length; j++) {
                            var artist = new Artist();
                            artist.setArtistId(data.artists[j].id);
                            artist.setArtistName(data.artists[j].name);
                            artists.push(artist);
                        }
                        album.setAlbumArtists(artists);
                        return album;
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
    },

    /*
     * DESCRIPTION: A way to get the top songs and albums from an artist on spotify
     * ARGUMENTS:
     *  authToken -> authorization to work with spotify api
     *  artistId -> artist to be looked up
     * Returns a dictionary of the top tracks and albums from the artist
     */
     getArtist : function(authToken, artistId) {

        var header = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        };

        var init = JSON.stringify({
            method: 'GET',
            headers: header,
        });

        var artist = fetch(` https://api.spotify.com/v1/artists/${artistId}`, init)
            .then(function (res) {
                if (res.status == 200) {
                    return res.json().then(function(data) {
                        var artist = new Artist();
                        artist.setArtistId(data.id);
                        artist.setArtistName(data.name);
                        return artist;
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
    },

    /*
     * DESCRIPTION: A way to get the songs from a spotify playlist
     * ARGUMENTS:
     *  authToken -> authorization to work with spotify api
     *  playlistId -> id of the playlist
     *  userId -> userId of the playlist owner
     * Returns a dictionary of the top tracks and albums from the artist
     */
    getPlaylist : function(authToken, playlistId, userId) {

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
                // ...
            }).catch(error => {
                console.error(error);
            });
    },
};

function Song (prev = null, next = null) {
    this.prev = prev;
    this.next = next;

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
    this.ownerId = null;

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

    this.getOwnerId = function(){
        return this.ownerId;
    };

    this.setOwnerId = function(ownerId){
        this.ownerId = ownerId;
    };
}