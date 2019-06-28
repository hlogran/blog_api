const request = require('supertest');
const app = require('../src/app');
const Post = require('../src/models/post');
const {
  postOne,
  postTwo,
  postThree,
  userTwoId,
  userTwo,
  userOneId,
  userOne,
  setupDatabase
} = require('./fixtures/db');

jest.setTimeout(30000);

beforeEach(setupDatabase);

test('Users can list posts', async ()=>{
  const response = await request(app).get('/posts')
    .send()
    .expect(200);
  expect(response.body.length).toBe(3);
})

test('Users can search posts by text', async ()=>{
  const response = await request(app).get('/posts')
    .send()
    .query({term: 'econd'})
    .expect(200);
  expect(response.body.length).toBe(1);
  expect(response.body[0]._id.toString()).toBe(postTwo._id.toString());
})

test('Users can fetch single post', async ()=>{
  const response = await request(app).get('/posts/' + postOne._id)
    .send()
    .expect(200);
  expect(response.body._id.toString()).toBe(postOne._id.toString());
});

test('User can create post', async()=>{
  const response = await request(app).post('/posts')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send({
      title: 'my test post',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    })
    .expect(201);
  const postId = response.body._id;
  const post = await Post.findById(postId);
  expect(post).not.toBeNull();
});

test('Unauthenticated user cannot create post', async()=>{
  const response = await request(app).post('/posts')
    .send({
      title: 'my test post',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    })
    .expect(401);
});

test('User can update post', async()=>{
  const NEW_TITLE = 'UPDATED TITLE';
  await request(app).patch('/posts/' + postOne._id)
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send({title: NEW_TITLE})
    .expect(200);
  const post = await Post.findById(postOne._id);
  expect(post.title).toBe(NEW_TITLE);
});

test('User cannot update unowned post', async()=>{
  const NEW_TITLE = 'UPDATED TITLE';
  await request(app).patch('/posts/' + postOne._id)
    .set('Authorization', 'Bearer ' + userTwo.tokens[0].token)
    .send({title: NEW_TITLE})
    .expect(404);
  const post = await Post.findById(postOne._id);
  expect(post).not.toBe(NEW_TITLE);
});

test('User can delete post', async()=>{
  await request(app).delete('/posts/' + postOne._id)
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .expect(200);
  const post = await Post.findById(postOne._id);
  expect(post).toBeNull();
});

test('User cannot delete unowned post', async()=>{
  await request(app).delete('/posts/' + postOne._id)
    .set('Authorization', 'Bearer ' + userTwo.tokens[0].token)
    .expect(404);
  const post = await Post.findById(postOne._id);
  expect(post).not.toBeNull();
});