const app = require('./app');

// start listening
app.listen(process.env.PORT, ()=>{
  console.log('listening on ' + process.env.PORT);
});