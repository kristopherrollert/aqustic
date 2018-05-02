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
            throwLoginError("Please enter a username and a password!");
        }
        else if (username.length < 1) {
            throwLoginError("Please enter a username!");
          }
        else if (password.length < 1){
            throwLoginError("Please enter a password!");
          }
    });
}

function throwLoginError(error) {

}

//signup page: password length and username length control
function signUpPage() {
    let maxUserLen = 20;
    let maxPassLen = 128;
    let minPassLen = 5;

    $("#signup-button").click(function() {
        let username = $("#username-section").val();
        let password = $("#password-section").val();
        let confirmPass = $("#password-confirm-section").val();

        if (password.length < 1 && username.length < 1){
          throwLoginError("Please enter your username and your password!");
        }
        else if (username.length < 4 || username.length > maxUserLen ){
          throwLoginError("Username should be at least 4 characters!");
        }
        else if (username.length > maxUserLen){
          throwLoginError("Username should not more than 20 characters!");
        }
        else if (password.length < minPassLen || password.length > maxPassLen){
          throwLoginError("Password should be more than 4 characters!");
        }
        else if (if password.equals(confirmPass) == false){
          throwLoginError("These passwords do not match!");
        }
  });
}
