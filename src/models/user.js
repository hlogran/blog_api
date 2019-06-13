const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Post = require('./post.js');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('Email is invalid')
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'owner'
});

userSchema.methods.generateAuthToken = async function(){
  const user = this;

  const token = jwt.sign(  {_id: user.id.toString()}, process.env.AUTH_SECRET_KEY, {expiresIn: '24 hours'}  );

  user.tokens.push({token});
  await user.save();

  return token;
};

userSchema.methods.toJSON = function(){
  const user = this;
  const obj = user.toObject();
  delete obj.tokens;
  delete obj.password;
  return obj;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email});

  const ON_FAIL_MESSAGE = 'Unable to login';

  if(!user){
    throw new Error(ON_FAIL_MESSAGE)
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if(isMatch){
      return user;
    } else {
      throw new Error(ON_FAIL_MESSAGE)
    }
  }
};

//hash the password before saving
userSchema.pre('save', async function(next){
  const user = this;

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//delete user's posts when user is removed
userSchema.pre('remove', async function(next){
  const user = this;

  await Post.deleteMany({owner: user._id});

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;