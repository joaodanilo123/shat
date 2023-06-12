// Importar as dependências
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path')
const crypto = require('crypto')

// Configurar o servidor HTTP e o aplicativo Express
const app = express();
const server = http.createServer(app);

let mensagens = [];

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096
});

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

  socket.emit('CHAVE_PUBLICA', publicKey);
  socket.emit('CHAVE_PRIVADA', privateKey);
  socket.emit('RECUPERAR_CHAT', mensagens)

  // Manipulador de mensagens recebidas
  socket.on('NOVA_MENSAGEM', (message) => {
    console.log(`Mensagem recebida: ${message.nome}: ${message.message}`);

    mensagens.push(message)

    const mensagemEncriptada = crypto.publicEncrypt(publicKey, Buffer.from(message.message)).toString('base64');

    mensagens.push(mensagemEncriptada);

    // Enviar a mensagem recebida para todos os clientes conectados
    io.emit('NOVA_MENSAGEM', {nome: message.nome, message: mensagemEncriptada});
  });

  // Manipulador de desconexões
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });

});


const port = 3000;
server.listen(port, () => {
  console.log(`Servidor de chat em tempo real iniciado na porta ${port}`);
});
