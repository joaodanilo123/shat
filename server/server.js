// Importar as dependências
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path')

// Configurar o servidor HTTP e o aplicativo Express
const app = express();
const server = http.createServer(app);

let mensagens = [];
let numUsers = 0;

// Inicializar o Socket.IO e definir a origem permitida (opcional)
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

// Rota raiz do aplicativo
app.get('/', (req, res) => {
  const clientFilePath = path.join(__dirname, "../client/index.html")
  res.sendFile(clientFilePath);
});

// Manipulador de conexões de socket
io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  numUsers += 1
  io.emit("NUM_USERS", numUsers)

  socket.emit('RECUPERAR_CHAT', mensagens)

  // Manipulador de mensagens recebidas
  socket.on('NOVA_MENSAGEM', (message) => {
    console.log(`Mensagem recebida: ${message.nome}: ${message.conteudo}`);
    mensagens.push(message)
    // Enviar a mensagem recebida para todos os clientes conectados
    io.emit('NOVA_MENSAGEM', message);
  });

  // Manipulador de desconexões
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
    numUsers -= 1
    io.emit("NUM_USERS", numUsers)
  });

});


const port = 3000;
server.listen(port, () => {
  console.log(`Servidor de chat em tempo real iniciado na porta ${port}`);
});
