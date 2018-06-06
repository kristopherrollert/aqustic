var assert = require('assert');
var request = require('request');

describe('Server', function() {
  describe('app.get(/account/sign-up)', function() {
    it('should return correct error messege when username is at less than 3 characters', function(done) {
        let minUserLen = 3;
        var signUpData = {
            url : 'http://localhost:3000/account/sign-up',
            form : {
                username : "Kr",
                password : "12345",
                passwordConf : "12345"
            }
        };

        request.put(signUpData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, `Username should be at least ${minUserLen} characters!`);
            done();
        });
    });

    it('should return correct error message when passwords do not match', function(done) {

        var signUpData = {
            url : 'http://localhost:3000/account/sign-up',
            form : {
                username : "Kris",
                password : "32142",
                passwordConf : "11111"
            }
        };

        request.put(signUpData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Passwords do not match!");
            done();
        });
    });

    it('should return correct error message when a username has symbols', function(done) {

        var signUpData = {
            url : 'http://localhost:3000/account/sign-up',
            form : {
                username : "Kris!",
                password : "123456",
                passwordConf : "123456"
            }
        };

        request.put(signUpData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Username cannot contain symbols!");
            done();
        });
    });
    //Needs valid unique username and valid passowrds evertime for test to pass
    it('should return valid if user is created', function(done) {
        var signUpData = {
            url : 'http://localhost:3000/account/sign-up',
            form : {
                username : "UniqueUsername2",
                password : "12345",
                passwordConf : "12345"
            }
        };

        request.put(signUpData , function (error, response, body) {
            assert.equal(JSON.parse(body).username, "UniqueUsername2");
            done();
        });
    });

    it('should return correct error messege if username is in database', function(done) {
        var signUpData = {
            url : 'http://localhost:3000/account/sign-up',
            form : {
                username : "Kris",
                password : "12345",
                passwordConf : "12345"
            }
        };

        request.put(signUpData , function (error, response, body) {
            assert.equal(JSON.parse(body).error, "Username is already taken!");
            done();
        });
    });
  });
});
