$(document).ready(function() {
    switch (window.location.pathname) {
        case "/signup":
            signUpPage();
            break;
        case "/signin":
            signInPage();
            break;
        default:
            alert("Cannot find: " + window.location.pathname);
            break;
    }
});

/* ------------------------------------------------------------------------ */
/* -------------------------- PAGE SPECIFIC CODE -------------------------- */
/* ------------------------------------------------------------------------ */

/*
 * signup page: password length and username length control
 */
function signInPage() {
    console.log("SIGN IN PAGE");
    $("#login-form").submit(function(e) {
        e.preventDefault();
    });

    $("#login-button").click(function() {
        var username = $("#username-section").val();
        var password = $("#password-section").val();

        $.ajax({
            type: "PUT",
            url: "/account/sign-in",
            data: {
                username: username,
                password: password
            }
        }).done(function(data) {
            if (data.hasOwnProperty('error')){
                console.log("ERROR");
                console.log(data.error);
                throwLoginError(data.error);
                $("#password-section").val('');
            }
            else {
                console.log("SUCCESS");
                console.log(data);
                sessionStorage.setItem("username", data.username);
                sessionStorage.setItem("loginCode", data.loginCode);
            }
        });

    });
}


/*
 * signup page: password length and username length control
 */
function signUpPage() {
    console.log("SIGN UP PAGE");

    $("#signup-form").submit(function(e) {
        e.preventDefault();
    });

    $("#signup-button").click(function() {
        var username = $("#username-section").val();
        var password = $("#password-section").val();
        var passwordConf = $("#password-confirm-section").val();
        $.ajax({
            type: "PUT",
            url: "/account/sign-up",
            data: {
                username: username,
                password: password,
                passwordConf: passwordConf
            }
        }).done(function(data) {
            if (data.hasOwnProperty('error')){
                console.log("ERROR");
                console.log(data.error);
                throwLoginError(data.error);
                $("#password-section").val('');
                $("#password-confirm-section").val('');
            }
            else {
                console.log("SUCCESS");
                console.log(data);
                sessionStorage.setItem("username", data.username);
                sessionStorage.setItem("loginCode", data.loginCode);
            }
        });
  });
}


/* ----------------------------------------------------------------------- */
/* -------------------------- GENERAL FUNCTIONS -------------------------- */
/* ----------------------------------------------------------------------- */

/*
 * Used to throw errors on sign up
 */
function throwLoginError(error) {
    var width =  $("#username-section").outerWidth() - 30;
    $(".client-error").css("width", width+"px");
    $(".client-error").css("max-width", width+"px");
    $("#error-text").text(error);
    $(".client-error").css("display", "block");
}


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
/* -------------------------- Playing Songs! ----------------------------- */
/* ----------------------------------------------------------------------- */
/*
window.onSpotifyWebPlaybackSDKReady = function() {

    var player = new Spotify.Player({
        name: 'aqustic Spotify Web Player',
        getOAuthToken: function(callback) {
            //TODO the token must be put in the args for callback()
            //Also outdated token, was just temporary one for testing
            callback("your mom");
        }
    }); */

/*
 *  THE FOLLOWING CODE IS COPIED OFF OF https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#
 */

/*
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();





}
*/
