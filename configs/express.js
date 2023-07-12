const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const cors = require('cors'); //For cross domain error
const fs = require('file-system');
const timeout = require('connect-timeout');
const glob = require('glob');

const config = require('./configs');


module.exports = function () {
  console.log('env - ' + process.env.NODE_ENV)
  const app = express();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } 

  app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  }));

  app.use(bodyParser.json());
 
  app.use(methodOverride());
  app.use(cors());

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.use(timeout(120000));
  app.use(haltOnTimedout);

  function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
  }

  app.use((err, req, res, next) => {
    return res.send({
      status: 0,
      statusCode: 500,
      message: err.message,
      error: err
    });
  })

  app.use(session({
    cookie: { maxAge: 30000 },
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret
  }));

  app.use(express.json());

  const modules = '/../app/modules';
  glob(__dirname + modules + '/**/*Routes.js', {}, (err, files) => {
    files.forEach((route) => {
      const stats = fs.statSync(route);
      const fileSizeInBytes = stats.size;
      if (fileSizeInBytes) {
        require(route)(app, express);
      }
    });
  });

  return app;
};
