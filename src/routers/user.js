const express = require('express');
const User = require('../models/user.js');
const authentication = require('../middleware/authentication.js');
const router = new express.Router();

/**********************************************
 public endpoints
 **********************************************/
//create new user (sign up)
router.post('/users', async (req, res) => {
  try{
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//user login
router.post('/users/login', async (req, res) => {
  try{
    const {
      email,
      password
    } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (e) {
    res.status(400).send(e.message);
  }
});

/**********************************************
 private endpoints (need user to be authenticated)
 **********************************************/
//user logout
router.post('/users/logout', authentication, async (req, res) => {
  try{
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();
    res.status(200).send('Logged out successfully');
  } catch (e) {
    res.status(500).send(e.message);
  }
});

//list users
router.get('/users', authentication, async (req, res) => {
  try{
    res.status(200).send(await User.find());
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//get current user
router.get('/users/me', authentication, async (req, res) => {
  try{
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//update current user
router.patch('/users/me', authentication, async (req, res) => {
  try{
    const updates = Object.keys(req.body);
    const validFields = ['name', 'email', 'password'];
    if(updates.some(x => validFields.indexOf(x)===-1)){
      res.status(400).send('invalid operation');
      return;
    }
    const user = req.user;
    if(!user){
      res.status(404).send('user not found');
    } else {
      updates.forEach(field => user[field] = req.body[field]);
      await user.save();
      res.status(200).send(user);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//delete current user
router.delete('/users/me', authentication, async (req, res) => {
  try{
    await req.user.remove();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});


module.exports = router;

