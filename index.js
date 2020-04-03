const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', function (socket) {
    // socket.emit('connection', 'A user joined the chat');

    socket.on('join', function(data){
        socket.join(data.room);
        console.group(data.user + ' joined the room : ' + data.room);
        socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.'})
    })
    console.log('A user connected');
    socket.on('disconnect', function () {
        io.emit('disconnect', 'A user left the chat');
    });
//When server receive a chat message, send it to front
    socket.on('message', function(msg){
        io.emit('message', msg);
    });

});
http.listen(3000, function () {
    console.log('listening on *:3000');
});