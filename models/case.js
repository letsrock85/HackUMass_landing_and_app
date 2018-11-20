const mongoose = require('mongoose');
// User Schema
const CaseSchema = mongoose.Schema({
	date: {
		type: String,
		lowercase: true,
		index:true
	},
	name: {
        type: String,
        lowercase: true
	},
	type: {
        type: String,
        lowercase: true
	},
	practice: {
		type: String,
		lowercase: true
	}
});

const Case = mongoose.model('Case', CaseSchema);
module.exports = {Case};

module.exports.createCase = function(newCase, callback){
	
    newCase.save(callback);
}


