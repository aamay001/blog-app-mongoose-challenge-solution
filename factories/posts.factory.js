'use strict';
const fakes = require('faker');

function newPost(){
  return {
    author: {
      firstName: fakes.name.findName(),
      lastName: fakes.name.lastName()
    },
    title: fakes.random.word(),
    content: fakes.lorem.paragraph(3),
    creatd: fakes.date.recent()
    }
}

module.exports = {
  newPost : newPost
}


