const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

let clients = {};

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

io.on('connection', function (socket) {
    console.log('A user connected');
    let currentUser;
    let currentRoom;
    socket.on('join', function(data){
        
        currentUser = data.user;
        currentRoom = data.room;
        socket.join(data.room);
        //create array of clients of each room add current user
        if (clients[data.room] == undefined) {
            clients[data.room] = [];
            clients[data.room].push(data.user);
        } else {
            clients[data.room].push(data.user);
        }
        
        //console.log('clients', io.sockets.adapter.rooms[data.room]);
        console.log(data.user + ' joined the room : ' + data.room);
        io.in(data.room).emit('new user joined', {user:data.user, message:' has joined the room.', clients:clients[data.room]});
    });

    socket.on('leave', function(data){
        
        console.log(data.user + ' left the room : ' + data.room);

        if(clients[currentRoom]){
            let index = clients[currentRoom].indexOf(currentUser);
            if (index !== -1) {
                clients[currentRoom].splice(index, 1);
            };
        }

        socket.broadcast.to(data.room).emit('left room', {user:data.user, message:' has left the room.', clients:clients[data.room]});
        socket.leave(data.room);
        
    });
    //When server receive a chat message, send it to front
    socket.on('message', function(data){
        //console.log(data);
        io.in(data.room).emit('message', data);
    });
    socket.on('typing', function(data){
        //console.log(data);
        io.in(data.room).emit('typing', data);
    });
    socket.on('disconnect', function () {
        if(clients[currentRoom]){
            let index = clients[currentRoom].indexOf(currentUser);
            if (index !== -1) {
                clients[currentRoom].splice(index, 1);
            };
        }
        console.log('A user diconnected');
        io.emit('disconnect', 'A user left the chat');
    });

});
http.listen(port, function () {
    console.log('Server is listening');
});