// Step 1: Install the required packages
// Run these commands in your terminal:
// npm install socket.io-client
// or
// yarn add socket.io-client

// Step 2: Create a socket.js file in your project root
// socket.js
import { io } from "socket.io-client";

// Replace this URL with your actual Socket.IO server URL
const SOCKET_URL = "https://your-socket-server-url.com";

let socket;

export const initializeSocket = (userId) => {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: {
      userId
    }
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const joinChallengeRoom = (challengeId) => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  socket.emit('join-challenge', { challengeId });
};

export const leaveChallengeRoom = (challengeId) => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  socket.emit('leave-challenge', { challengeId });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};