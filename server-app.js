
const express = require('express'),
      path = require('path'),
      fs = require('fs'),
      formidable = require('express-formidable'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      busboyBodyParser = require('busboy-body-parser'),
      exphbs = require('express-handlebars'),
      expressValidator = require('express-validator'),
      flash = require('connect-flash'),
      session = require('express-session'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      mongo = require('mongodb'),
      mongoose = require('mongoose'),
      nconf  = require('nconf'),
      cors = require('cors'),
      //**  Mailing */
      mailer = require('express-mailer');

//Config file root
nconf.file(path.resolve(__dirname, 'configs/settings.json'));
//DB
// mongoose.connect(`mongodb://${nconf.get('mlab').login}:${nconf.get('mlab').pass}@ds161162.mlab.com:61162/db_1`);
const db = mongoose.connection;
const routes = require('./routes/index');
const homepage = require('./routes/home');
const users = require('./routes/users');

// Init App
const app = express();

Init Mailer
db.collection("specialusers").findOne({username: 'byserge@gmail.com'}, function(err,obj) { 
  if(!err){
    // Init Mailer
    mailer.extend(app, {
      from: 'team@hackumass.com',
      host: 'smtp.gmail.com', // hostname 
      secureConnection: true, // use SSL 
      port: 465, // port for secure SMTP 
      transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts 
      auth: {
        user: obj.username,
        pass: obj.password
      }
    });
  }//if
});

// Additional Helpers
const helpers = require('handlebars-helpers')();
// View Engine;
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'main', scripts: [{script: '/js/budnle.js'}], helpers: helpers, partialsDir: ['views/partials/']}));
app.set('view engine', 'handlebars');

//exphbs.registerPartial('registerform', '{{registerform}}');
app.use(cors());
// app.use(formidable());
// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(busboyBodyParser());
// app.use(busboyBodyParser({ multi: true }));
app.use(cookieParser());


// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg1');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', homepage);
app.use('/index', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || nconf.get('port')));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});