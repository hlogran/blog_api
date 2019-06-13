const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

jest.setTimeout(30000);

beforeEach(setupDatabase);

test('User can sign up', async ()=>{
  await request(app).post('/users').send({
    name: 'Michael',
    email: 'michael@test.com',
    password: 'michael123'
  }).expect(201);
});

test('User can sign in', async ()=>{
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(201);

  const token = response.body.token;
  const user = await User.findById(userOneId);

  expect(user.tokens[1].token).toBe(token);
});

test('Non existing user can\'t sign in', async ()=>{
  await request(app).post('/users/login').send({
    email: userOne.email + 'EXTRA_UNEXISTING_DATA',
    password: userOne.password
  }).expect(400);
});

test('User can get its own profile', async ()=>{
  await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send()
    .expect(200);
});

test('Unauthenticated user cannot get profile', async ()=>{
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('User can delete its profile', async ()=>{
  await request(app)
    .delete('/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send()
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Unauthenticated user cannot delete profile', async ()=>{
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('User can update valid fields', async ()=>{
  await request(app)
    .patch('/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send({name: 'Mike'})
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.name).toBe('Mike');
});

test('User cannot update invalid fields', async ()=>{
  await request(app)
    .patch('/users/me')
    .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
    .send({location: 'Buenos Aires'})
    .expect(400);
});
