/* -------------------------------------------------------------------------- */
/* -------------------------- SIGN UP ON-LOAD CODE -------------------------- */
/* -------------------------------------------------------------------------- */

$(document).ready(function () {

    /* DESC: Remove the forms default submit action */
    $("#signup-form").submit( function (e) {
        e.preventDefault();
    });

    /*
     * DESC: Sends login information to server and redirects if success, otherwise
     * it sends and displays an error message
     */
    $("#signup-button").click(function() {
        $.ajax({
            type: "PUT",
            url: "/account/sign-up",
            data: {
                username: $("#username-section").val(),
                password: $("#password-section").val(),
                passwordConf: $("#password-confirm-section").val()
            }
        }).done( function (data) {
            if (data.hasOwnProperty('error')) {
                throwLoginError(data.error);
                $("#password-section").val('');
                $("#password-confirm-section").val('');
            }
            else if(data.hasOwnProperty ('loginCode'))
                $(location).attr('href', "/home");
            else
                $(location).attr('href', "/signup");
        });
    });
});

/* -------------------------------------------------------------------------- */
/* ----------------------- SIGN UP SPECIFIC FUNCTIONS ----------------------- */
/* -------------------------------------------------------------------------- */

/*
 * Displays the given error to the error section
 * @param String error : message to be displayed
 */
function throwLoginError(error) {
    var width =  $("#username-section").outerWidth() - 30;
    $(".client-error").css("width", width+"px");
    $(".client-error").css("max-width", width+"px");
    $("#error-text").text(error);
    $(".client-error").css("display", "block");
}
