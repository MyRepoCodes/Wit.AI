const User = require('../model/user');
const Chat = require('../model/chat');

//Insert User in DB
const createUser = function (objToSave, callback) {
    new User(objToSave).save(callback)
};

const findUser = function(criteria,projection,options,callback){
    User.findOne(criteria,projection,options,callback)
}

const createChat = function(objToSave,callback){
    new Chat(objToSave).save(callback)
}

const findSession = function(criteria,projection,options,callback){
    Chat.find(criteria,projection,options,callback)
}

const updateChat =   function(criteria,dataToUpdate,options,callback){
    Chat.findOneAndUpdate(criteria,dataToUpdate,options,callback)
}

module.exports = {
    createUser : createUser,
    findUser : findUser,
    createChat : createChat,
    findSession: findSession,
    updateChat: updateChat

}