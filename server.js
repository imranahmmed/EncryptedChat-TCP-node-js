const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected');

  // Assign a unique ID to each client
  const clientId = Math.floor(Math.random() * 10000);
  socket.write(`id ${clientId}\n`);

  // Handle client messages
  socket.on('data', (data) => {
    console.log(`Received from client ${clientId}:`, data.toString('utf-8'));
    socket.write(`User ${clientId} received: ${data}`);
  });

  // Handle client disconnect
  socket.on('end', () => {
    console.log(`Client ${clientId} disconnected`);
  });
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server listening on port 3000');
});
