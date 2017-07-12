// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var conversition = new Schema({
  text: { type: String, trim:true},
  sender_type: { type: String,trim:true}
},{timestamps: true});

// create a schema
var chatSchema = new Schema({
 userId: { type: Schema.Types.ObjectId, ref:'User'},
 sessionId: { type: String },
 status: { type: String },
 conversition: [conversition],
},{timestamps: true});

// the schema is useless so far
// we need to create a model using it
var Chat = mongoose.model('Chat', chatSchema);

// make this available to our users in our Node applications
module.exports = Chat;