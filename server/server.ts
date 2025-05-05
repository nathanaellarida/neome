import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, replace with your app's domain
    methods: ["GET", "POST"]
  }
});

interface ChallengeRoom {
  [challengeId: string]: {
    timeLeft: number;
    participants: string[];
    isActive: boolean;
  };
}

const challengeRooms: ChallengeRoom = {};

io.on('connection', (socket) => {
  const { userId, challengeId } = socket.handshake.query;

  console.log(`User ${userId} connected to challenge ${challengeId}`);

  if (typeof challengeId === 'string') {
    socket.join(challengeId);

    // Initialize challenge room if it doesn't exist
    if (!challengeRooms[challengeId]) {
      challengeRooms[challengeId] = {
        timeLeft: 0,
        participants: [],
        isActive: true
      };
    }

    // Add participant to the room
    if (userId && !challengeRooms[challengeId].participants.includes(userId.toString())) {
      challengeRooms[challengeId].participants.push(userId.toString());
    }

    // Timer update handler
    socket.on('timer-update', ({ challengeId, timeLeft }) => {
      if (challengeRooms[challengeId]) {
        challengeRooms[challengeId].timeLeft = timeLeft;
        // Broadcast timer update to all participants in the challenge
        io.to(challengeId).emit('timer-sync', timeLeft);
      }
    });

    // Pause request handler
    socket.on('pause-request', ({ challengeId }) => {
      if (challengeRooms[challengeId]) {
        challengeRooms[challengeId].isActive = false;
        io.to(challengeId).emit('pause-challenge');
      }
    });

    // Resume request handler
    socket.on('resume-request', ({ challengeId }) => {
      if (challengeRooms[challengeId]) {
        challengeRooms[challengeId].isActive = true;
        io.to(challengeId).emit('resume-challenge');
      }
    });

    // Stop request handler
    socket.on('stop-request', ({ challengeId }) => {
      if (challengeRooms[challengeId]) {
        io.to(challengeId).emit('stop-challenge');
        // Clean up the challenge room
        delete challengeRooms[challengeId];
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      if (userId && challengeId) {
        // Remove participant from the room
        if (challengeRooms[challengeId]) {
          challengeRooms[challengeId].participants = challengeRooms[challengeId].participants
            .filter(id => id !== userId.toString());

          // If no participants left, clean up the room
          if (challengeRooms[challengeId].participants.length === 0) {
            delete challengeRooms[challengeId];
          }
        }
      }
      console.log(`User ${userId} disconnected from challenge ${challengeId}`);
    });
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 