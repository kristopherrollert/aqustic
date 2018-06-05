/* -------------------------------------------------------------------------- */
/* ---------------------------- HOME ON-LOAD CODE --------------------------- */
/* -------------------------------------------------------------------------- */

$(document).ready(function () {
    openLoadingScreen();

    /* DESC: Adjust button size */
    $("#join-button").css("width", parseInt($("#create-button").width()) + 26 + "px");

    /* DESC: Prevents form from doing default action */
    $("form").submit(function(e) {
        e.preventDefault();
    });


    /* DESC: Gets information about the user and generates HTML */
    $.ajax({
        type: "GET",
        url: "/account/get-info",
    }).done(function(data) {
        if (data.hasOwnProperty("error")) {
            // TODO make this a real error resonse
            console.log("ERROR");
        }
        else {
            generateUsernameHeader(data.username);
            displayAuthenticationContent(data.authenticated);
            $("#create-button").click(function () {
                createParty($("#party-name").val(), data.authenticated);
            });
            $("#join-button").click(function () {
                joinParty($("#party-token").val());
            });
            setTimeout(closeLoadingScreen, 1000);
        }
    });

});

/* -------------------------------------------------------------------------- */
/* ------------------------- HOME SPECIFIC FUNCTIONS ------------------------ */
/* -------------------------------------------------------------------------- */

/**
 * Attempts to join party, if it fails, it displays error message
 * @param {String} partyToken : a string of the partyToken to join
 */
function joinParty (partyToken) {
    $.ajax({
        type: "PUT",
        url : "/party/join-party",
        data : {
            partyToken : partyToken
        }
    }).done(function (data) {
        if (data.hasOwnProperty("error")) {
            $("#join-error-text").text(data.error);
            $("#join-error").show();
            $("#party-token").val("");
        }
        else if (data.hasOwnProperty("redirect")) {
            window.location.href = data.redirect;
        }
        else {
            $("#join-error-text").text("Unknown error, please try again later!");
            $("#join-error").show();
        }
    });
}

/**
 * Attempts to create party, if it fails, it displays error message
 * @param {String} partyName : a string of the party's name
 */
function createParty (partyName, authenticated) {
    $.ajax({
        type: "PUT",
        url: "/party/create-party",
        data: {
            partyName: partyName,
            authenticated: authenticated
        }
    }).done(function (data) {
        if (data.hasOwnProperty("error")) {
            $("#create-error-text").text(data.error);
            $("#create-error").show();
        }
        else if (data.hasOwnProperty("redirect")) {
            window.location.href = data.redirect;
        }
        else {
            $("#create-error-text").text("Unknown error, please try again later!");
            $("#create-error").show();
        }
    });
}

/**
 * Displays the correct authentication HTML depending on if they have been authenticated
 * @param {Boolean} authenticated : if the account has been authenticated
 */
function displayAuthenticationContent (authenticated) {
    (authenticated ? $(".auth-true") : $(".auth-false")).show();
}

/**
 * TODO
 * Displays the User's username the page
 * @param {String} username : the username of the user to be displayed
 */
function generateUsernameHeader (username) {

}
