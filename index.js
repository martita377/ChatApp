const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require('./UsersService');
const userService = new UsersService();

//serwowanie plików z folderu public.
app.use(express.static(__dirname + '/public'));

//routing na adres / który odsyła do index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + './client/index.html'); // __dirname zmienna globalna node
});

// klient nasłuchuje na wiadomość wejścia do czatu

io.on('connection', socket => {
    socket.on('join', name => {
       // użytkownika, który pojawił się w aplikacji zapisujemy do serwisu trzymającego listę osób w czacie
        userService.addUser({
            id: socket.id,
            name
        });
        // aplikacja emituje zdarzenie update, które aktualizuje informację na temat listy użytkowników każdemu nasłuchującemu na wydarzenie 'update'
        io.emit('update', {
            users: userService.getAllUsers()
        });
    });
    //nasłuchiwanie na rozłączenie któregoś z użytkowników
    socket.on('disconnect', () => {
        userService.removeUser(socket.id);
        socket.broadcast.emit('update', {
            users: userService.getAllUsers()
        });
    });
    //nasłuchiwanie na otrzymanie wiadomości
    socket.on('message', message => {
        const {name} = userService.getUserById(socket.id);
        socket.broadcast.emit('message', {
            text: message.text,
            from: name
        });
    });
});

//nasłuchiwanie na porcie 3000.
server.listen(3000, function(){
  console.log('listening on *:3000');
});