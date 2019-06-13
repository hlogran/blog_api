const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_URL;

mongoose.connect(
  mongoURL,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  }
);
