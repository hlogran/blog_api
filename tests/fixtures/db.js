const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Post = require('../../src/models/post');

/**********************************
 Test users
 ***********************************/
const userOneId = mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'John',
  email: 'john@test.com',
  password: 'John12',
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.AUTH_SECRET_KEY)
  }]
};

const userTwoId = mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Peter',
  email: 'peter@test.com',
  password: 'Peter1',
  tokens: [{
    token: jwt.sign({_id: userTwoId}, process.env.AUTH_SECRET_KEY)
  }]
};


/**********************************
 Test posts
 ***********************************/
const postOne = {
  _id: mongoose.Types.ObjectId(),
  title: 'First post ',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  owner: userOneId
};
const postTwo = {
  _id: mongoose.Types.ObjectId(),
  title: 'Second post',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  owner: userOneId
};
const postThree = {
  _id: mongoose.Types.ObjectId(),
  title: 'Third post',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  owner: userTwoId
};


/**********************************
 db setup methods
 ***********************************/
const setupDatabase = async ()=>{
  //clear db
  await User.deleteMany();
  await Post.deleteMany();

  //add test documents to db
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Post(postOne).save();
  await new Post(postTwo).save();
  await new Post(postThree).save();
}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  postOne,
  postTwo,
  postThree,
  setupDatabase
}