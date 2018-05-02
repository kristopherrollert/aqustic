$(document).ready(function() {
    switch (window.location.pathname) {
        case "/src/client/index.html":
            indexPage();
            break
        case "/src/client/signup.html":
            signUpPage();
            break
        default:
            alert("Cannot find: " + window.location.pathname);
    }
});

function indexPage() {
    $("#login-button").click(function() {
        let userame = $("#username-section").val();
        let password = $("#password-section").val();
        if (password.length < 1 && username.length < 1){
            throwLoginError($("#username-section"), "Please enter a username!");
        }
        else if (username.length < 1)
            throwLoginError($("#username-section"), "Please enter a username!");
        else if (password.length < 1)
            throwLoginError($("#username-section"), "Please enter a password!");
    });
}

function throwLoginError(error) {

}

function signUpPage() {

}
