'use strict';

process.env.DBNAME = 'node-audio-test';
var expect = require('chai').expect;
var fs = require('fs');
var exec = require('child_process').exec;
var Album;

describe('Album', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
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

  describe('new', function(){
    it('should create a new Album object', function(){
      var a1 = new Album({title:'Test Thriller', artist:'Test Michael Jackson', releaseyear:'1982-05-01'});
      expect(a1).to.be.instanceof(Album);
      expect(a1.title).to.equal('Test Thriller');
      expect(a1.releaseyear).to.be.instanceof(Date);
      expect(a1.songs).to.have.length(0);
    });
  });

  describe('#addCover', function(){
    it('should add a cover to the Album', function(){
      var a1 = new Album({title:'Test Thriller', artist:'Test Michael Jackson', releaseyear:'1982-05-01'});
      var oldname = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      a1.addCover(oldname);
      expect(a1.cover).to.equal('/img/testmichaeljackson-testthriller.jpg');
    });
  });

  describe('#addSong', function(){
    it('should add a song to the Album', function(done){
      var a1 = new Album({title:'Test Thriller', artist:'Test Michael Jackson', releaseyear:'1982-05-01'});
      var oldname = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      var oldname2 = __dirname + '/../fixtures/test-song-copy1.mp3';
      var fileName = 'mysong.mp3';
      a1.addCover(oldname);
      a1.parseTags(oldname2, fileName, function(tagObj){
        a1.addSong(tagObj);
        a1.insert(function(err){
          expect(a1._id.toString()).to.have.length(24);
          expect(a1.songs).to.have.length(1);
          done();
        });
      });
    });
  });

  describe('#insert', function(){
    it('should insert a new Album into Mongo', function(done){
      var a1 = new Album({title:'Test Thriller', artist:'Test Michael Jackson', releaseyear:'1982-05-01'});
      var oldname = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      a1.addCover(oldname);
      a1.insert(function(err){
        expect(a1._id.toString()).to.have.length(24);
        done();
      });
    });
  });

  describe('#update', function(){
    var a1;

    beforeEach(function(done){
      a1 = new Album({title:'Test Thriller', artist:'Test Michael Jackson', releaseyear:'1982-05-01'});
      var oldname = __dirname + '/../fixtures/test-album-cover-copy1.jpg';
      a1.addCover(oldname);
      a1.insert(function(){
        done();
      });
    });

    it('should update an existing music album', function(done){
      var id = a1._id.toString();
      Album.findById(id, function(album){
        album.releaseyear = new Date('2009-02-28');
        album.update(function(err, count){
          expect(count).to.equal(1);
          done();
        });
      });
    });
  });

  describe('Find Methods', function(){
    var a1, a2, a3;

    beforeEach(function(done){
      a1 = new Album({title:'Test Thriller', artist:'Test Drew', releaseyear:'1982-05-01'});
      a2 = new Album({title:'Test Beat It', artist:'Test Sam', releaseyear:'1962-05-01'});
      a3 = new Album({title:'Test Album', artist:'Test Aimee', releaseyear:'1989-05-01'});

      a1.insert(function(){
        a2.insert(function(){
          a3.insert(function(){
            done();
          });
        });
      });
    });

    describe('.findAll', function(){
      it('should find all the albums in the database', function(done){
        Album.findAll(function(albums){
          expect(albums).to.have.length(3);
          expect(albums[0].songs).to.have.length(0);
          done();
        });
      });
    });

    describe('.findById', function(){
      it('should find a specific album in the database', function(done){
        Album.findById(a1._id.toString(), function(album){
          expect(album._id).to.deep.equal(a1._id);
          expect(album).to.respondTo('addCover');
          done();
        });
      });
    });
  });
});
