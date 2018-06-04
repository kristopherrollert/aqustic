/* -------------------------------------------------------------------------- */
/* -------------------------- SIGN IN ON-LOAD CODE -------------------------- */
/* -------------------------------------------------------------------------- */

$(document).ready(function () {

    /* DESC: Remove the forms default submit action */
    $("#login-form").submit(function(e) {
        e.preventDefault();
    });

    /*
     * DESC: Sends login information to server and redirects if success, otherwise
     * it sends and displays an error message
     */
    $("#login-button").click(function() {
        $.ajax({
            type: "PUT",
            url: "/account/sign-in",
            data: {
                username: $("#username-section").val(),
                password: $("#password-section").val()
            }
        }).done( function (data) {
            if (data.hasOwnProperty('error')) {
                throwLoginError(data.error);
                $("#password-section").val('');
            }
            else if(data.hasOwnProperty('loginCode'))
                $(location).attr('href', "/home");
            else
                $(location).attr('href', "/signin");
        });

    });
});

/* -------------------------------------------------------------------------- */
/* ----------------------- SIGN IN SPECIFIC FUNCTIONS ----------------------- */
/* -------------------------------------------------------------------------- */

/*
 * Displays the given error to the error section
 * @param String error : message to be displayed
 */
function throwLoginError (error) {
    var width =  $("#username-section").outerWidth() - 30;
    $(".client-error").css("width", width+"px");
    $(".client-error").css("max-width", width+"px");
    $("#error-text").text(error);
    $(".client-error").css("display", "block");
}
