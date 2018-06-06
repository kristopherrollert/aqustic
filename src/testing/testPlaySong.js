var assert = require('assert');
var request = require('request');

describe('Server', function() {
    describe('/party/*/play endpoint', function () {
        it('returns party not found if trying to play from fake party', function() {

            request.get('http://localhost:3000/party/not-a-party/play', function(error, response, body) {
                assert.equal(JSON.parse(body).error, "Party not found!");
            })
        });

        it('returns message when queue is empty', function () {

            request.get('http://localhost:3000/party/SKczvnOb/play', function(error, response, body) {
                assert.equal(JSON.parse(body).error, "Queue is empty!");
            })
        });

        it('returns message when next song should be playing', function() {

            request.get('http://localhost:3000/party/VgyRRrtc/play', function(error, response, body) {
                assert.equal(JSON.parse(body).message, "Playing Song...");
            })
        });
    });
});