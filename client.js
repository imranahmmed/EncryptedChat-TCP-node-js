const net = require('net');
const readline = require('readline');
const { Transform } = require('stream');

// Encryption transform stream
class Encrypt extends Transform {
  _transform(chunk, encoding, callback) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) chunk[i] += 2;
    }
    callback(null, chunk);
  }
}

// Decryption transform stream
class Decrypt extends Transform {
  _transform(chunk, encoding, callback) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) chunk[i] -= 2;
    }
    callback(null, chunk);
  }
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Enter your message: '
});

let clientId = null;

// Connect to the server
const socket = net.createConnection({ port: 3000, host: '127.0.0.1' }, () => {
  console.log('Connected to server');
});

// Handle connection errors
socket.on('error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1); // Exit the process on connection error
});

// Handle incoming data from the server
socket.on('data', (data) => {
  const message = data.toString('utf-8');

  if (message.startsWith('id')) {
    clientId = message.split(' ')[1];
    console.log(`Your id is ${clientId}`);
    rl.prompt();
  } else {
    const [header, ...rest] = message.split(' ');
    const encryptedData = Buffer.from(rest.join(' '), 'utf-8');

    const decryptStream = new Decrypt();
    let decryptedMessage = '';

    decryptStream
      .on('data', (chunk) => {
        decryptedMessage += chunk.toString('utf-8');
      })
      .on('end', () => {
        console.log(`${header}: ${decryptedMessage.trim()}`);
        rl.prompt();
      });

    decryptStream.end(encryptedData);
  }
});

// Handle user input
rl.on('line', (input) => {
  if (clientId) {
    const encryptStream = new Encrypt();
    let encryptedMessage = '';

    encryptStream
      .on('data', (chunk) => {
        encryptedMessage += chunk.toString('utf-8');
      })
      .on('end', () => {
        socket.write(`${clientId} -message- ${encryptedMessage}`);
      });

    encryptStream.end(Buffer.from(input, 'utf-8'));
  } else {
    console.log('You are not yet assigned an ID by the server');
  }
});
