const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const authentication = async (req, res, next) => {
  try{
    //decode de json web token to get the current user's id
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.AUTH_SECRET_KEY);

    //check if the id exists in db, and if the token is registered
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    });

    if(!user){
      throw new Error();
    } else {
      //add user to request, so the following process won't need to fetch the user's information from db again
      req.user = user;
      req.token = token;
      next();
    }
  } catch (e) {
    res.status(401).send({error: 'Please authenticate.'});
  }
};

module.exports = authentication;