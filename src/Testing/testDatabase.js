var assert = require('assert');
var database = require('../server.js').database;


describe('Database Tests', function() {
    describe('Test insertOne', function() {
        it('should add one entry to the database', function(done) {
            database.insertOne('ACCOUNTS', {username:'morty'});
            database.findOne('ACCOUNTS', {username:'morty'}, function(result) {
                assert.equal(result.username, 'morty');
            });
            done();
        });
    });

    describe('Test insertMany', function() {
        it('should add multiple entries to the database', function(done) {
            database.insertMany('ACCOUNTS', [{username:'rick', password:'yo'}, {username:'rick', password:'sup'}]);
            database.find('ACCOUNTS', {username:'rick'}, 2, function(result) {
                assert.equal(result[0].password, 'yo');
                assert.equal(result[1].password, 'sup')
            });
            done();
        });   
    });

    describe('Test findOne', function() {
        it('should find one entry in the database', function(done) {
            database.findOne('ACCOUNTS', {username:'morty'}, function (result) {
                assert.equal(result.username, 'morty');
            });
            done();
        });
        it('should not find an entry in the data', function(done) {
            database.findOne('ACCOUNTS', {username:'alksdjhreg'}, function (result) {
                assert(result == null);
            });
            done();
        });
    });

    describe('Test find', function() {
        it('should find no more than 2 entries in the database', function(done) {
            database.find('ACCOUNTS', {username:'rick'}, 2, function(result) {
                assert.equal(result[0].username, 'rick');
                assert.equal(result[1].username, 'rick');
                assert(result.length <= 2);
            });
            done();
        });
        it('should not find any entries in the database because username does not exist', function(done) {
            database.find('ACCOUNTS', {username:'kldjoiwguh'}, 2, function(result) {
                assert(result == null);
            });
            done();
        });
    });

    describe('Test deleteOne', function() {
        it('should delete one element in the database', function(done) {
            database.delete('ACCOUNTS', {username:'morty'});
            database.findOne('ACCOUNTS', {username:'morty'}, function(result) {
                assert(result == null);
            });
            done();
        });
    });

    describe('Test delete', function() {
        it('should delete multiple elements in the database', function(done) {
            database.delete('ACCOUNTS', {username:'rick'});
            database.findOne('ACCOUNTS', {username:'rick'}, function(result) {
                assert(result == null);
            });
            done();
        });
    });
});
