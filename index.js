const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

io.on('connection', function (socket) {

    socket.on('join', function(data){
        socket.join(data.room);
        // console.log(data.user + ' joined the room : ' + data.room);
        socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:' has joined this room.'});
    });

    console.log('A user connected');
    socket.on('disconnect', function () {
        io.emit('disconnect', 'A user left the chat');
    });
//When server receive a chat message, send it to front
    socket.on('message', function(msg){
        io.emit('message', msg);
    });
});
http.listen(port, function () {
    console.log('Server is listening');
});