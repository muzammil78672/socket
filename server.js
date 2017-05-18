var express = require('express');
var PORT = process.env.PORT || 8080;
var app = express();
var http = require('http').Server(app);
var moment = require('moment');
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

//sends current users to provided socket

function sendCurrentUsers (socket){
	var info = clientInfo[socket.id];
	var users = [];

	if (typeof info === 'undefined') {
		return ;
	}

	Object.keys(clientInfo).forEach(function(socketId){
		var userinfo = clientInfo[socketId];

		if (info.room === userinfo.room) {
			users.push(userinfo.name);
		}
	});

	socket.emit('message',{
		name: 'System',
		text: 'current users: '  + users.join(', '),
		timestamp: moment().valueOf()
	});
}

io.on('connection',function (socket){
	console.log('user conected via socket.io');

	socket.on('disconnect',function(){
		var userData = clientInfo[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message',{
				name: 'System',
				text: userData.name + ' has left! ',
				timestamp: moment().valueOf()
			});
			delete userData;
		}
	});

	socket.on('joinRoom',function (req){
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message',{
			name: 'System',
			text: req.name + ' has joined! ',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function (message){
		console.log('message recieved: ' + message.text);

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		}else{
			
			// io.emit
		//socket.broadcast.emit('message', message);
		message.timestamp = moment().valueOf();
		io.to(clientInfo[socket.id].room).emit('message', message);
		
		}

	});

	socket.emit('message',{
		name: 'System',
		text: 'welcome to the chat application',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function(){
	console.log('server started');
});