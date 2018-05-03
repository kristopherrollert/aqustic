$(document).ready(function() {
    switch (window.location.pathname) {
        case "/src/client/index.html":
            indexPage();
            break
        case "/src/client/signup.html":
            signUpPage();
            break
        case "/createaccount":
            signUpPage();
            break
        case "/signin":
            indexPage();
            break
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
function indexPage() {
    $("#login-form").submit(function(e) {
        e.preventDefault();
    });

    $("#login-button").click(function() {
        let username = $("#username-section").val();
        let password = $("#password-section").val();
        if (password.length < 1 && username.length < 1)
            throwLoginError("Enter a username and a password!");
        else if (username.length < 1)
            throwLoginError("Username cannot be blank!");
        else if (password.length < 1)
            throwLoginError("Password cannot be blank!");
        else {
            // HASH AND SEND INFO
            alert("NO ERROR")
        }
    });
}


/*
 * signup page: password length and username length control
 */
function signUpPage() {
    let minUserLen = 4;
    let maxUserLen = 20;
    let maxPassLen = 128;
    let minPassLen = 5;

    $("#signup-form").submit(function(e) {
        e.preventDefault();
    });

    $("#signup-button").click(function() {
        let username = $("#username-section").val();
        let password = $("#password-section").val();
        let confirmPass = $("#password-confirm-section").val();

        if (password.length < 1 && username.length < 1)
            throwLoginError("Please enter a username and a password!");
        else if (username.length < minUserLen)
            throwLoginError("Username should be at least "+minUserLen+" characters!");
        else if (username.length > maxUserLen )
            throwLoginError("Username is too long!");
        else if (username.length > maxUserLen)
            throwLoginError("Username should not more than "+maxPassLen+" characters!");
        else if (!isValid(username))
            throwLoginError("Username cannot contain symbols!");
        else if (password.length < minPassLen) {
            $("#password-section").val("");
            $("#password-confirm-section").val("");
            throwLoginError("Password should be more than "+minPassLen+" characters!");
        }
        else if (password.length > maxPassLen) {
            $("#password-section").val("");
            $("#password-confirm-section").val("");
            throwLoginError("Password is too long!");
        }
        else if (password !== confirmPass) {
            $("#password-section").val("");
            $("#password-confirm-section").val("");
            throwLoginError("Passwords do not match!");
        }
        else {
            $.ajax({
                type: "GET",
                url: "/account/signup",
                data: {
                    username: username,
                    password: password
                }
            }).done(function(data) {
                console.log("___DATA___");
                console.log(data);
            });
        }
  });
}


/* ----------------------------------------------------------------------- */
/* -------------------------- GENERAL FUNCTIONS -------------------------- */
/* ----------------------------------------------------------------------- */

/*
 * Used to throw errors on sign up
 */
function throwLoginError(error) {
    let width =  $(".sign-in-section").outerWidth();
    $(".client-error").css("width", width+"px");
    $(".client-error").css("max-width", width+"px")
    $("#error-text").text(error);
    $(".client-error").css("display", "block");
}

/*
 * Returns true if string has special characters
 */
function isValid(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
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
