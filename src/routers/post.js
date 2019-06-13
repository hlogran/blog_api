const express = require('express');
const Post = require('../models/post.js');
const authentication = require('../middleware/authentication.js');
const router = new express.Router();

/**********************************************
 public endpoints
 **********************************************/
//list posts
router.get('/posts', async (req, res) => {
  try{
    res.status(200).send(await Post.find());
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//search posts by text
router.get('/search/posts/:term?', async (req, res) => {
  const term = req.params.term;
  if(!term || term.trim()===''){
    res.status(400).send('Search term is not valid');
    return;
  }

  try{
    const posts = await Post.find({
      $or : [
        {title: {$regex: req.params.term, $options : 'i'}},
        {body: {$regex: req.params.term, $options : 'i'}}
      ]
    });
    res.status(200).send(posts);
  } catch (e) {
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
  //add owner's id to the post
  const post = new Post({
    ...req.body,
    owner: req.user._id
  });

  try{
    await post.save();
    res.status(201).send(post);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//update post
router.patch('/posts/:id', authentication, async (req, res) => {
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

  //do update the post
  try{
    updates.forEach(field => post[field] = req.body[field]);
    await post.save();
    res.status(200).send(post);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//delete post
router.delete('/posts/:id', authentication, async (req, res) => {
  //check if post exists and if current user is the owner of the post
  const post = await Post.findOne({_id: req.params.id, owner: req.user._id});
  if(!post){
    res.status(404).send('post not found');
    return
  }

  //do delete the post
  try{
    await post.remove();
    res.status(200).send(post);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;

