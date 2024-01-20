const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para la página de chat
app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Manejo de conexiones Socket.io
const users = {};

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('username', (username) => {
    socket.username = username;
    users[username] = socket.id;
  });

  // Manejar mensajes del chat
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Emitir mensaje a todos los usuarios
  });

  // Manejar mensajes privados
  socket.on('private message', (data) => {
    const targetSocketId = users[data.targetUsername];
    if (targetSocketId) {
      io.to(targetSocketId).emit('private message', data);
    } else {
      console.log(`Usuario ${data.targetUsername} no encontrado o no está conectado`);
    }
  });

  // Manejar desconexiones
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
    // Eliminar al usuario desconectado del objeto users
    const username = socket.username;
    if (username) {
      delete users[username];
    }
  });
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
