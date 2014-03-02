'use strict';

module.exports = Album;

var albums = global.nss.db.collection('albums');
var fs = require('fs');
var path = require('path');
var Mongo = require('mongodb');
var _ = require('lodash');
var id3 = require('id3js');

function Album(album){
  this.title = album.title;
  this.artist = album.artist;
  this.releaseyear = new Date(album.releaseyear);
  this.songs = [];
}

Album.prototype.addCover = function(oldpath){
  var albumTitle = this.title.replace(/\s/g, '').toLowerCase();
  var artistTitle = this.artist.replace(/\s/g, '').toLowerCase();
  var abspath = __dirname + '/../static';
  var relpath = '/img/' + artistTitle + '-' + albumTitle;

  var extension = path.extname(oldpath);
  relpath += extension;
  fs.renameSync(oldpath, abspath + relpath);

  this.cover = relpath;
};

Album.prototype.addSong = function(tagObj){
  console.log(tagObj);
  this.songs.push(tagObj);
};

Album.prototype.parseTags = function(oldpath, fileName, fn){
  var songTitle = fileName.replace(/\s/g, '').toLowerCase();
  var albumTitle = this.title.replace(/\s/g, '').toLowerCase();
  var abspath = __dirname + '/../static';
  var relpath = '/audios/';
  relpath += albumTitle + '-' + songTitle;

  fs.renameSync(oldpath, abspath + relpath);

  id3({file:abspath + relpath, type:id3.OPEN_LOCAL}, function(err, tags){
    fn({songfile:relpath, title:tags.title, artist:tags.artist});
  });
};

Album.prototype.insert = function(fn){
  albums.insert(this, function(err, records){
    fn(err);
  });
};

Album.prototype.update = function(fn){
  albums.update({_id:this._id}, this, function(err, count){
    fn(err, count);
  });
};

Album.findAll = function(fn){
  albums.find().toArray(function(err, records){
    fn(records);
  });
};

Album.findById = function(id, fn){
  var _id = new Mongo.ObjectID(id);

  albums.findOne({_id:_id}, function(err, record){
    fn(_.extend(record, Album.prototype));
  });
};

