$(document).ready(function () {
    $("#join-button").css("width", parseInt($("#create-button").width()) + 26 + "px");

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
            checkAuthentication(data.authenticated);
        }
    });
});


function checkAuthentication (authenticated) {
    if (authenticated) {
        $(".auth-true").show();
    }
    else {
        $(".auth-false").show();
    }
}

function generateUsernameHeader (username) {

}
