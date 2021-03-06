//wit starts
const server = require('../../../index')
const lib = require('../lib/lib');
const Wit = require('node-wit').Wit;
const interactive = require('node-wit').interactive;
const uuid = require('uuid');
const sessionId = uuid.v1();
const Services = require('../service/userServices')
const emailNotification = require('../lib/emailNotification');

exports.connectSocket = function (server) {
	const io = require('socket.io')(server);



	let chatbotResponse = {};
	let chatbotHistory = [{
		"text": "Hello"
	}];
	let rooms = [];

	const accessToken = (() => {
		return "*********************************************";
	})();

	let usernames = {};
	//var rooms=[];
	let roomsObjArr = [];

	io.on('connection', function (socket) {
		const actions = {
			send(request, response) {
				const {
					sessionId,
					context,
					entities
				} = request;
				const {
					text,
					quickreplies
				} = response;
				let criteria = {
						userId: socket.room
					},
					projection = {},
					options = {
						lean: true
					}
				let ObjToSave = {
					conversition: {
						text: request.text,
						sender_type: 'USER'
					}

				}
				Services.findSession(criteria, projection, options, function (err, dbResult)
					if (err) {
						throw new Error(err)
					} else {
						if ((Array.isArray(dbResult)) && (dbResult.length > 0)) {

							Services.updateChat(criteria, {
								$addToSet: ObjToSave
							}, options, function (err, dbResult) {
								if (err) {
									throw new Error(err)
								}
							})

						} else {
							Services.createChat(Object.assign(ObjToSave, {
								userId: socket.room,
								sessionId: socket.id,
								status: 'PROCESS'
							}), function (err, dbResult) {

							});


						}
					}
				})


				chatbotHistory[chatbotHistory.length - 1].userAnswer = request.text;
				chatbotHistory.push(response);
				chatbotResponse = response;
			},
			getTechnology({
				context,
				entities
			}) {
				return new Promise(function (resolve, reject) {
					const technology = lib.firstEntityValue(entities, 'technology');
					if (technology) {
						context.technology = technology;
					} else {
						context.technology = "this technology"
					}
					//call the API here
					return resolve(context);
				});
			},
			invokeChat({
				context,
				entities
			}) {
				let criteria = {
					userId: socket.room
				}

				Services.updateChat(criteria, {
					$set: {
						status: 'BOTCOMPLETED'
					}
				}, options, function (err, dbResult) {
					if (err) {
						throw new Error(err)
					} else {
						rooms.push(socket.username);
						socket.rooms = rooms;
						io.emit('updaterooms', rooms);
						emailNotification.sendEmail(socket.name,dbResult.userId, function (err, reuslt) {


						})
						return false;
					}
				})

			},

			endofchat({
				context
			}) {
				Services.updateChat({
					userId: socket.room
				}, {
					$set: {
						status: 'COMPLETED'
					}
				}, {
					lean: true
				}, function (err, dbResult) {
					if (err) {
						throw new Error(err)
					}
				})

			}
		};

		const client = new Wit({
			accessToken,
			actions
		});

		var initContext;
		var context = (typeof initContext === 'undefined' ? 'undefined' : _typeof(initContext)) === 'object' ? initContext : {};


		socket.on('adduser', function (userObj, status) {

			// store the username in the socket session for this client
			var userData = null;

			if (userObj.name && userObj.email) {
				//find if user in database
				Services.findUser({
					email: userObj.email

				}, {}, {
					lean: true
				}, function (err, dbResult) {
					if (err) {
						throw new Error(err)
					} else {
						if (dbResult) {
							userData = dbResult;
							_r(userData, status, userObj)
						} else {
							Services.createUser(userObj, function (err, dbResult) {
								if (err) {
									throw new Error(err)
								} else {
									userData = dbResult;
									_r(userData, status, userObj)

								}
							})
						}

					}
				})
			} else { //HR joining User's room without storing HR creds into DB
				if (userObj.room) {
					usernames[userObj.name] = userObj.name;
					socket.usernames = [];
					socket.usernames = userObj.name;
					socket.username = userObj.name;
					socket.name = userObj.name
					socket.room = userObj.room;
					socket.join(socket.room);
				}
			}

		});

		function _r(userData, status, userObj) {
			socket.username = userData.name;

			if (status) {
				var room = userObj.name.split(':')[1];
				username = userObj.name.split(':')[0];
				socket.username = userData._id;
				socket.room = userData._id;
				socket.name = userObj.name
			}
			socket.name = userObj.name
			socket.sessionId = userData._id;

			// rooms.push(socket.sessionId);
			// store the room name in the socket session for this client
			// add the client's username to the global list

			usernames[userObj.name] = userObj.name;
			socket.usernames = [];
			socket.usernames = userObj.name;
			// send client to room 1
			socket.join(socket.room);



			// echo to client they've connected
			//socket.emit('updatechat', 'SERVER', 'you have connected to '+socket.room);
			// echo to room 1 that a person has connected to their room
			//socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', username + ' has connected to this room');
			//socket.emit('updaterooms', rooms, 'room1');
		}

		socket.on('show rooms', function () {
			io.emit('updaterooms', socket.rooms);
		})


		socket.on('bot message', function (msg) {
			Services.findSession({
				$and: [{
					userId: socket.room
				}]
			}, {}, {
				lean: true
			}, function (err, dbResult) {
				if (err) {
					throw new Error(err)
				} else {
					//if(dbResult.status
					if (Array.isArray(dbResult) && (dbResult.length > 0)) {

						if (dbResult[0].status === 'COMPLETED') {
							//if()
							return
						} else {

							if (dbResult[0].status !== 'BOTCOMPLETED') {
								var flag = 0;
								if (rooms[i].toString() == socket.room.toString()) {
										flag = 1;
									}
								}
								if (flag == 0) {
									//io.in(socket.username).emit('chat message', msg);
									client.runActions(socket.sessionId, msg, context).then(function (ctx) {
										context = ctx;
										io.in(socket.room).emit('bot message', chatbotResponse, 'botasdasdasdasdasdasdasd');
										let criteria = {
												userId: socket.room
											},
											dataToUpdate = {
												conversition: {
													text: chatbotResponse.text,
													sender_type: 'BOT'
												}

											}
										options = {
											lean: true
										}
										Services.updateChat(criteria, {
											$addToSet: dataToUpdate
										}, options, function (err, dbResult) {

										})

										//res.send({"chatbotResponse":chatbotResponse,"chatbotHistory":chatbotHistory});
										chatbotResponse = {};
									}).catch(function (err) {
										return err;
									});
								}

							} else {
								let criteria = {
									userId: socket.room
								}
								if (socket.room == socket.username) {
									let ObjToSave = {
										conversition: {
											text: msg,
											sender_type: 'USER'
										}
									}

									Services.updateChat(criteria, {
										$addToSet: ObjToSave
									}, options, function (err, dbResult) {
										if (err) {
											throw new Error(err)
										}
									})
								} else {
									let ObjToSave = {
										conversition: {
											text: msg,
											sender_type: 'HR ' + socket.username
										}

									}

									Services.updateChat(criteria, {
										$addToSet: ObjToSave
									}, options, function (err, dbResult) {
										if (err) {
											throw new Error(err)
										}
									})
								}
								io.in(socket.room).emit('bot message', msg, socket.name);
							}
						}
					} else {
						var flag = 0;
						for (var i = 0; i < rooms.length; i++) {
							if (rooms[i].toString() == socket.room.toString()) {
								flag = 1;
							}
						}
						if (flag == 0) {
							//io.in(socket.username).emit('chat message', msg);
							client.runActions(socket.sessionId, msg, context).then(function (ctx) {
								context = ctx;
								io.in(socket.room).emit('bot message', chatbotResponse, 'botasdasdasdasdasdasdasd');

								let criteria = {
										userId: socket.room
									},
									dataToUpdate = {
										conversition: {
											text: chatbotResponse.text,
											sender_type: 'BOT'
										}

									}
								options = {
									lean: true
								}


								Services.updateChat(criteria, {
									$addToSet: dataToUpdate
								}, options, function (err, dbResult) {

								})

								//res.send({"chatbotResponse":chatbotResponse,"chatbotHistory":chatbotHistory});
								chatbotResponse = {};
							}).catch(function (err) {
								return err;
							});
						}

					}


				}
			})


		});
		socket.on('chat message', function (msg) {
			io.in(socket.username).emit('chat message', msg);
		});

		socket.on('reconnect_attempt', (attemptNumber) => {

		});
	});

}
