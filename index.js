const express = require('express')
const app = express();
const server = app.listen(3000);
const chat = require('./src/server/chatController/chat')
const Services = require('./src/server/service/userServices')
//require mongoose node module
var mongoose = require('mongoose');

//connect to local mongodb database
var db = mongoose.connect('mongodb://127.0.0.1:27017/smartChat');

//attach lister to connected event
mongoose.connection.once('connected', function() {
	console.log("Connected to database")
});

// Index file 
app.get('/', function(req, res){
  res.sendFile(__dirname + '/src/client/index.html');
});

app.get('/hrTeam/:hr/:room', function(req, res){
  res.sendFile(__dirname + '/src/client/index.html');
});

app.get('/hrTeam/:room', function(req, res){
  Services.findSession({userId:req.params.room},{},{},function(err,chats){
  	if(err){
  		res.jsonp({});
  	}else{
  		res.jsonp(chats);
  	}
  })  
});

app.get('/user/:email', function(req, res){
  Services.findUser({email:req.params.email},{_id:1},{},function(err,user){
		if(err){
			res.jsonp([]);
		}else{
			if(user){
				Services.findSession({userId:user._id},{},{},function(err,chats){
					if(err){
						res.jsonp([]);
					}else{
						res.jsonp(chats);
					}
				})
			}
			else{
				res.jsonp([]);
			}	
		}		  
	})	
});

//inti socket 
chat.connectSocket(server);

