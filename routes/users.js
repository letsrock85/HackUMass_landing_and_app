const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//Usering
const userModels = require('../models/user');
const User = userModels.User;
const SpecialUser = userModels.SpecialUser;

// Register
router.get('/register', (req, res) => {
	res.render('register', {title:"Register"});
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){

	proceedRegistrartion(req,res);
});


function proceedRegistrartion(req, res){
	const name = req.body.name.toLowerCase();
	const email = req.body.email.toLowerCase();
	const practice = req.body.practice;
	const username = req.body.username.toLowerCase();
	const password = req.body.password;
	const password2 = req.body.password2;
	
	const parameter = req.query.her ? req.query.her : false;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('practice', 'practice is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();

	if(errors){
		if(parameter){
			res.render('register',{
				errors:errors,
				title:"Register"
			});
		}
		else{
			res.render('register',{
			errors:errors
		});
		}
	} else {
		let newUser = new User({
			name:name,
			email:email,
			practice:practice,
			username: username,
			password: password
		});

		userModels.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		if(!parameter) { req.flash('success_msg', 'You are registered and can now login'); res.redirect('/users/login'); }
		else { 
			//hadndle email message
			req.app.mailer.send('email', {
			to: 'sdesigndl@gmail.com', // REQUIRED. This can be a comma delimited string just like a normal email to field.  
			cc: 'byserge@gmail.com',
			from: email,
			subject: 'Register - Price list request!', // REQUIRED. 
			message: "This is request for price list sent by: "+ name + " from register email: "+ email, // All additional properties are also passed to the template as local variables. ',
			infotext: '' 
		}, function (err) {
		    if (err) {
		      // handle error 
		      console.log(err);
		      res.send('There was an error sending the email');
		      return;
		    }
		});

		req.flash('success_email', 'Request Sent');
		req.flash('success_msg', 'You are registered and can now login. We also will send you a price list shortly.'); 
		res.redirect('/users/login');
		
		}
	}
}

passport.use(new LocalStrategy(
  function(username, password, done) {
   userModels.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	userModels.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userModels.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;