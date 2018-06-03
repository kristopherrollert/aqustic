$(document).ready(function () {
    openLoadingScreen();
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
            setTimeout(closeLoadingScreen, 1000);
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

// LOADING JAVACRIPT
function closeLoadingScreen() {
    $("body").removeClass("body-cover");
    $(".loading-screen").hide();
}

function openLoadingScreen() {
    $("body").addClass("body-cover");
    moveBar($("#bar1"), 1600, 250, 30);
    moveBar($("#bar2"), 700, 250, 55);
    moveBar($("#bar3"), 1000, 190, 25);
    moveBar($("#bar4"), 1300, 250, 60);
    moveBar($("#bar5"), 900, 250, 100);

    setInterval(function() {
        moveBar($("#bar1"), 1600, 250, 30);
    }, 3200);

    setInterval(function() {
        moveBar($("#bar2"), 700, 250, 55);
    }, 1400);

    setInterval(function() {
        moveBar($("#bar3"), 1000, 190, 25);
    }, 2000);

    setInterval(function() {
        moveBar($("#bar4"), 1300, 250, 60);
    }, 2600);

    setInterval(function() {
        moveBar($("#bar5"), 900, 250, 100);
    }, 1800);


    function moveBar($bar, speed, max, min) {
        var randomMax = Math.floor((max - min) / 2 * Math.random()) + min + (max - min) / 2;
        var randomMin = Math.floor(((max - min) / 3 * Math.random())) + min;
        $bar.animate({
                maxHeight: randomMin + "px"
            }, speed, "swing", function() {
        $bar.animate({
                maxHeight: randomMax + "px"
            }, speed, "swing");
        });
    }

}
