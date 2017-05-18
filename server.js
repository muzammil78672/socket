var express = require('express');
var PORT = process.env.PORT || 8080;
var app = express();
var http = require('http').Server(app);
var moment = require('moment');
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

io.on('connection',function (socket){
	console.log('user conected via socket.io');

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

		// io.emit
		//socket.broadcast.emit('message', message);
		message.timestamp = moment().valueOf();
		io.to(clientInfo[socket.id].room).emit('message', message);
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