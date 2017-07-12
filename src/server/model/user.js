// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: { type: String} ,
  email: { type: String, unique: true} 
},{timestamps: true});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// User.Index({
//     name: 1,
//     email: 1
// })

// make this available to our users in our Node applications
module.exports = User;