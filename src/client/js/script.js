/*
 * Connect song object to have album and artist objects
 */

$(document).ready(function() {
    var urlArray = (window.location.pathname).split("/");
    switch (urlArray[1]) {
        case "signup":
            signUpPage();
            break;
        case "signin":
            signInPage();
            break;
        case "home":
            homePage();
            break;
        case "party":
            // if you are in a party
            var partyToken = urlArray[2];
            switch (urlArray[3]) {
                case undefined:
                    partyHomePage(partyToken);
                    break;
                case "search":
                    searchPage(partyToken);
                    break;
                default:
                    alert("cannot find this page!");
                    break;
            }
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

}

/*
 * signup page: password length and username length control
 */
function signUpPage() {

}

/* Home Page */
function homePage() {
    console.log("HOME PAGE");


}

/* Search Page */
function searchPage(partyToken) {

}
