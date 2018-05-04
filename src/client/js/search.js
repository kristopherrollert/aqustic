const fetch = require('node-fetch');
const Request = require('request');

/*
 * DESCRIPTION: A way to search for songs on spotify
 * ARGUMENTS:
 *  authorization -> authorization to work with spotify api
 *  query -> what we are searching
 * Returns a dictionary of the names of the top 20 results from spotify
 */
 // We will probably want to change how we deal with the response that is returned
 // Right now it just gets the names of the top 20 results for tracks, albums, playlist and artists
 // I'm not sure how we want to get the query and how we want to show the results
function search(authorization, query) {
    var headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authorization}`
    }
    
    var init = {
        method: 'GET',
        headers: headers,
    }
    
    
    return fetch(`https://api.spotify.com/v1/search?q=${query}&type=track,album,playlist,artist`, init)
        .then(response => {
        if (response.status === 200) {
            return response.json().then(function(data) {
                // console.log(data);
                var dict = {
                    tracks: [],
                    albums: [],
                    playlists: [],
                    artists: []
                };
                var i;
                for (i = 0; i < data.tracks.items.length; i++){
                    dict.tracks.push(data.tracks.items[i].name);
                }
                for (i = 0; i < data.albums.items.length; i++){
                    dict.albums.push(data.albums.items[i].name);
                }
                for (i = 0; i < data.playlists.items.length; i++){
                    dict.playlists.push(data.playlists.items[i].name);
                }
                for (i = 0; i < data.artists.items.length; i++){
                    dict.artists = [data.playlists.items[i].name];
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

/*
 * DESCRIPTION: A way to parse a query from a user into something usable by the spotify API
 * ARGUMENTS:
 *  query -> a search query from a user
 * returns a usable string for the spotify API
 */
function parse_search(query) {
    return query.replace(/ /i, '%20')
}

search('BQA97lnQvtRufx2ktfzU9XJjvQ9jkX3x0nXMJWLI8htBRTj5dmvx6BUpb-solcuvGVfu9Cd_t_oDoRAVuq_O7jRIBZyX7O5WX84Er-g9_H9bMyKvjLmtJTYSOlwLQVmxd-RIHMuwaOhXlC55hXXXSlyk1Rdh4XpKmZS-q8kb2jvDI9zsEEO_kdierRzQIRtObg999_CYWjMxr5Uxr1tmM7spffpyTMM-1rh5zIx4utAUy-hdSpenlMtUJB1VuO0vHiQqew4p', parse_search('pop music'));
