const express = require('express');

require('./db/mongoose.js');

const postRouter = require('./routers/post.js');
const userRouter = require('./routers/user.js');

const app = express();

app.use(express.json());
app.use(postRouter);
app.use(userRouter);

app.get('/', async (req, res) => {
    res.json({say: 'hi there!'});
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
	console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown();
})

// shut down server
function shutdown() {
  app.close(function onServerClosed (err) {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  })
}

module.exports = app;