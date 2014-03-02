'use strict';

process.env.DBNAME = 'node-audio-test';
var app = require('../../app/app');
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
var Album;

describe('albums', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      Album = require('../../app/models/album');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/test*';
    var songdir = __dirname + '/../../app/static/audios/test*';
    var cmd = 'rm -rf ' + testdir;
    var cmd1 = 'rm -rf ' + songdir;

    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/test-album-cover.jpg';
      var copy1file = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      var copy2file = __dirname + '/../fixtures/test-album-cover-copy2.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copy1file));
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copy2file));
    });

    exec(cmd1, function(){
      var origsong = __dirname + '/../fixtures/test-song.mp3';
      var copy1song = __dirname + '/../fixtures/test-song-copy1.mp3';
      var copy2song = __dirname + '/../fixtures/test-song-copy2.mp3';
      fs.createReadStream(origsong).pipe(fs.createWriteStream(copy1song));
      fs.createReadStream(origsong).pipe(fs.createWriteStream(copy2song));
      global.nss.db.dropDatabase(function(err, result){
        done();
      });
    });

  });

  describe('GET /', function(){
    it('should display the album home page', function(done){
      request(app)
      .get('/')
      .expect(200, done);
    });
  });

  describe('GET /albums/3', function(){
    var a1, a2, a3;

    beforeEach(function(done){
      a1 = new Album({title:'Test A', artist:'Test Aimee', releaseyear:'2012-03-25'});
      a2 = new Album({title:'Test B', artist:'Test Sam', releaseyear:'2012-03-26'});
      a3 = new Album({title:'Test C', artist:'Test Drew', releaseyear:'2012-03-27'});

      a1.insert(function(){
        a2.insert(function(){
          a3.insert(function(){
            done();
          });
        });
      });
    });

    it('should display the album show page', function(done){
      request(app)
      .get('/albums/' + a1._id.toString())
      .expect(200, done);
    });
  });

  describe('GET /albums/new', function(){
    it('should display the new album html page', function(done){
      request(app)
      .get('/albums/new')
      .expect(200, done);
    });
  });

  describe('POST /albums', function(){
    it('should create a new album and send user back to home', function(done){
      var filename = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      request(app)
      .post('/albums')
      .attach('cover', filename)
      .field('title', 'Test Audio Album')
      .field('releaseyear', '2014-02-25')
      .field('artist', 'Test Person Who Sings')
      .expect(302, done);
    });
  });

  describe('POST /albums/id', function(){
    var a1;

    beforeEach(function(done){
      a1 = new Album({title:'Test A', artist:'Vincent and Carmine', releaseyear:'2012-03-25'});
      var oldname = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      a1.addCover(oldname);
      a1.insert(function(){
        done();
      });
    });

    it('should add a song to the album', function(done){
      var filename = __dirname + '/../fixtures/test-song-copy1.mp3';
      request(app)
      .post('/albums/' + a1._id.toString())
      .attach('song', filename)
      .expect(302, done);
    });
  });
});
