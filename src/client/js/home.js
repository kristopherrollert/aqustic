$(document).ready(function () {
    $("#join-button").css("width", parseInt($("#create-button").width()) + 26 + "px");
    $("form").submit(function(e) {
        e.preventDefault();
    });


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
            $("#create-button").click(function () {
                $.ajax({
                    type: "PUT",
                    url: "/party/create-party",
                    data: {
                        partyName: $("#party-name").val(),
                        authenticated: data.authenticated
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
                        console.log("BIG ERROR HOURS");
                        console.log(data);
                    }
                });
            });

            $("#join-button").click(function () {
                $.ajax({
                    type: "PUT",
                    url : "/party/join-party",
                    data : {
                        partyToken : $("#party-token").val()
                    }
                }).done(function (data) {
                    if (data.hasOwnProperty("error")) {
                        $("#join-error-text").text(data.error);
                        $("#join-error").show();
                    }
                    else if (data.hasOwnProperty("redirect")) {
                        window.location.href = data.redirect;
                    }
                    else {
                        console.log("BIG ERROR HOURS");
                        console.log(data);
                    }
                });
            });
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
