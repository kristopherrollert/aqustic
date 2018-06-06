var assert = require('assert');
var request = require('request');

describe('Server', function() {
  describe('app.get(/account/sign-in)', function() {
    it('should return valid login code when correct info is given', function(done) {

        var signInData = {
            url : 'http://localhost:3000/account/sign-in',
            form : {
                username : "kris",
                password : "123456"
            }
        };

        request.put(signInData , function (error, response, body) {
            assert.equal(JSON.parse(body).loginCode, "pdGDMcqFIdlYeLnE");
            done();
        });
    });

    it('should return correct error message when inccorect password is given', function(done) {

        var signInData = {
            url : 'http://localhost:3000/account/sign-in',
            form : {
                username : "kris",
                password : "32142"
            }
        };

        request.put(signInData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Password is not correct!");
            done();
        });
    });

    it('should return correct error message when a uncreated username is given', function(done) {

        var signInData = {
            url : 'http://localhost:3000/account/sign-in',
            form : {
                username : "test-username-not-created",
                password : "123456"
            }
        };

        request.put(signInData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Username not found!");
            done();
        });
    });

    it('should return correct error message when no username is given', function(done) {

        var signInData = {
            url : 'http://localhost:3000/account/sign-in',
            form : {
                username : null,
                password : "123456"
            }
        };

        request.put(signInData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Username cannot be blank!");
            done();
        });
    });

    it('should return correct error message when no password is given', function(done) {

        var signInData = {
            url : 'http://localhost:3000/account/sign-in',
            form : {
                username : "kris",
                password : null
            }
        };

        request.put(signInData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Password cannot be blank!");
            done();
        });
    });

    it('should return correct error message when no information is given', function(done) {

        var signInData = {
            url : 'http://localhost:3000/account/sign-in',
            form : {
                username : null,
                password : null
            }
        };

        request.put(signInData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Enter a username and a password!");
            done();
        });
    });

  });
});
