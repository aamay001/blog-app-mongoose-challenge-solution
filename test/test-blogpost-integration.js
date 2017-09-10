'use strict';

const chai = require('chai');
const chaiHttp =  require('chai-http');
const should = chai.should();
chai.use(chaiHttp);
const assert = chai.assert;

const {BlogPost} = require('../models');
const TEST_DB_URL = require('../config').TEST_DB_URL;
const { app, runServer, closeServer } = require('../server');
const postFactory = require('../factories/posts.factory');
const mongoose = require('mongoose');

function seedDatabase(){
  console.info('Seeding database.');
  let seedData = [];
  for( let i = 0; i < 10; i++ ){
    seedData.push(postFactory.newPost());
  }
  return BlogPost.insertMany(seedData);
}

function dropDatabase(){
  console.warn('Dropping database.');
  return mongoose.connection.dropDatabase();
}

describe('Blog Posts API Integration Tests', function(){

  before(function(){
    return runServer(TEST_DB_URL);
  });

  after(function(){
    return closeServer();
  });

  beforeEach(function(){
    return seedDatabase();
  });

  afterEach(function(){
    return dropDatabase();
  });

  describe('GET endpoint', function(){
    it('should return all posts', function(){
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res){
          res = _res;
          res.should.have.status(200);
          res.body.posts.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count){
          res.body.posts.length.should.equal(count);
        });
    });

    it('should return a single post', function(){
      let res;
      return BlogPost.findOne()
        .then( post => {
          return chai.request(app)
            .get(`/posts/${post._id.toString()}`)
            .then(function(_res){
              res = _res;
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.include.keys('id', 'author', 'content', 'title', 'created');
              return BlogPost.findById(res.body.id);
            });
        })
        .then(function(post){
          res.body.id.should.equal(post.id);
          res.body.author.should.deep.equal(`${post.author.firstName} ${post.author.lastName}`.trim());
          res.body.title.should.deep.equal(post.title);
          res.body.content.should.deep.equal(post.content);
          assert(res.body.created, post.created);
        });
    });
  });
});