const express = require('express');
const Post = require('../models/post.js');
const authentication = require('../middleware/authentication.js');
const router = new express.Router();

/**********************************************
 public endpoints
 **********************************************/
//list posts
router.get('/posts', async (req, res) => {
  try {
    let match = {};
    if (req.query.term) {
      match = {
        $or : [
          {title: {$regex: req.query.term, $options : 'i'}},
          {body: {$regex: req.query.term, $options : 'i'}}
        ]
      }
    }
    console.log('match', req.query.term, match)
    res.status(200).send(await Post.find(match));
  } catch (e) {
    console.log('e', e)
    res.status(400).send(e.message);
  }
});

//get post by id
router.get('/posts/:id', async (req, res) => {
  try{
    const post = await Post.findOne({_id: req.params.id});
    if(!post){
      res.status(404).send('post not found');
    } else {
      res.status(200).send(post);
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

/**********************************************
 private endpoints (need user to be authenticated)
 **********************************************/
//create post
router.post('/posts', authentication, async (req, res) => {
  try{
    //add owner's id to the post
    const post = new Post({
      ...req.body,
      owner: req.user._id
    });
    await post.save();
    res.status(201).send(post);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//update post
router.patch('/posts/:id', authentication, async (req, res) => {
  try{
    //check if post exists and if current user is the owner of the post
    const post = await Post.findOne({_id: req.params.id, owner: req.user._id});
    if(!post){
      res.status(404).send('post not found');
      return
    }

    //prevent users from trying to update not valid fields
    const updates = Object.keys(req.body);
    const validFields = ['title', 'body'];
    if(updates.some(x => validFields.indexOf(x)===-1)){
      res.status(400).send('invalid operation');
      return;
    }

    updates.forEach(field => post[field] = req.body[field]);
    await post.save();
    res.status(200).send(post);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//delete post
router.delete('/posts/:id', authentication, async (req, res) => {
  try{
    //check if post exists and if current user is the owner of the post
    const post = await Post.findOne({_id: req.params.id, owner: req.user._id});
    if(!post){
      res.status(404).send('post not found');
      return;
    }

    await post.remove();
    res.status(200).send(post);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;

