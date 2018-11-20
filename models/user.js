const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = mongoose.Schema({
	username: {
		type: String,
		lowercase: true,
		index:true
	},
	practice: {
		type: String
	},
	password: {
		type: String
	},
	email: {
		type: String,
		lowercase: true
	},
	name: {
		type: String,
		lowercase: true
	}
});
// User Schema
const MailerUserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true,
		lowercase: true
	},
	
	password: {
		type: String
	}
});

const User = mongoose.model('User', UserSchema);
const SpecialUser = mongoose.model('SpecialUser', MailerUserSchema);
module.exports = {User, SpecialUser,};

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	let query = {username: username};
	User.findOne(query, callback);
}
module.exports.getSpecialUserByUsername = function(username, callback){
	let query = {username: username};
	SpecialUser.findOne(query, callback);
}
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

