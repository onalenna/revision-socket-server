/**
 * Socket.IO Server for Video Streaming - cPanel Optimized
 * 
 * Optimized version for cPanel hosting with environment variables
 * and production-ready configuration
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Environment configuration for cPanel
const PORT = process.env.PORT || process.env.NODE_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

console.log('Environment:', NODE_ENV);
console.log('Port:', PORT);
console.log('Allowed Origins:', ALLOWED_ORIGINS);

// Enable CORS for production
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"],
  credentials: true
}));

// Serve static files if needed
app.use(express.static(path.join(__dirname, 'public')));

// Create Socket.IO instance with production settings
const io = socketIo(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowEIO3: true // Compatibility with older clients
});

// Store active calls with cleanup
const activeCalls = new Map();
const userSockets = new Map();

// Cleanup inactive calls every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [callId, call] of activeCalls.entries()) {
    if (now - call.lastActivity > maxAge) {
      console.log(`Cleaning up inactive call: ${callId}`);
      activeCalls.delete(callId);
    }
  }
}, 5 * 60 * 1000);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'at', new Date().toISOString());

  // Handle joining a call
  socket.on('join_call', (data) => {
    try {
      const { callId, userId, timestamp } = data;
      console.log(`User ${userId} joining call ${callId}`);
      
      // Validate input
      if (!callId || !userId) {
        socket.emit('error', { message: 'Invalid call data' });
        return;
      }
      
      // Leave previous call if any
      if (socket.callId) {
        socket.leave(socket.callId);
      }
      
      // Join the call room
      socket.join(callId);
      
      // Store user info
      socket.callId = callId;
      socket.userId = userId;
      userSockets.set(userId, socket.id);
      
      // Initialize call if it doesn't exist
      if (!activeCalls.has(callId)) {
        activeCalls.set(callId, {
          participants: new Map(),
          createdAt: timestamp || Date.now(),
          lastActivity: Date.now()
        });
      }
      
      const call = activeCalls.get(callId);
      call.participants.set(userId, {
        socketId: socket.id,
        joinedAt: timestamp || Date.now()
      });
      call.lastActivity = Date.now();
      
      // Notify others in the call
      socket.to(callId).emit('user_joined', {
        userId: userId,
        timestamp: timestamp || Date.now()
      });
      
      // Confirm join to user
      socket.emit('joined_call', {
        callId: callId,
        participantCount: call.participants.size
      });
      
      console.log(`Call ${callId} now has ${call.participants.size} participants`);
    } catch (error) {
      console.error('Error in join_call:', error);
      socket.emit('error', { message: 'Failed to join call' });
    }
  });

  // Handle video frames with rate limiting
  const frameRateLimits = new Map();
  socket.on('video_frame', (data) => {
    try {
      const { callId, userId, frameData, timestamp } = data;
      
      // Rate limiting (max 20 FPS per user)
      const now = Date.now();
      const userLimit = frameRateLimits.get(userId) || { count: 0, resetTime: now + 1000 };
      
      if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + 1000;
      }
      
      if (userLimit.count >= 20) {
        return; // Skip frame if rate limit exceeded
      }
      
      userLimit.count++;
      frameRateLimits.set(userId, userLimit);
      
      // Update call activity
      if (activeCalls.has(callId)) {
        activeCalls.get(callId).lastActivity = now;
      }
      
      // Forward frame to other participants in the call
      socket.to(callId).emit('video_frame', {
        userId: userId,
        frameData: frameData,
        timestamp: timestamp || now
      });
    } catch (error) {
      console.error('Error in video_frame:', error);
    }
  });

  // Handle call status updates
  socket.on('call_status', (data) => {
    try {
      const { callId, userId, status, timestamp } = data;
      console.log(`Call ${callId} - User ${userId} status: ${status}`);
      
      // Update call activity
      if (activeCalls.has(callId)) {
        activeCalls.get(callId).lastActivity = Date.now();
      }
      
      // Forward status to other participants
      socket.to(callId).emit('call_status_update', {
        userId: userId,
        status: status,
        timestamp: timestamp || Date.now()
      });
    } catch (error) {
      console.error('Error in call_status:', error);
    }
  });

  // Handle ending a call
  socket.on('end_call', (data) => {
    try {
      const { callId, userId } = data;
      console.log(`User ${userId} ending call ${callId}`);
      
      // Notify all participants
      io.to(callId).emit('call_ended', {
        callId: callId,
        endedBy: userId,
        timestamp: Date.now()
      });
      
      // Clean up call data
      activeCalls.delete(callId);
    } catch (error) {
      console.error('Error in end_call:', error);
    }
  });

  // Handle leaving a call
  socket.on('leave_call', (data) => {
    try {
      const { callId, userId } = data;
      console.log(`User ${userId} leaving call ${callId}`);
      
      // Remove from call data
      const call = activeCalls.get(callId);
      if (call) {
        call.participants.delete(userId);
        
        // Notify others
        socket.to(callId).emit('user_left', {
          userId: userId,
          timestamp: Date.now()
        });
        
        // Clean up if no participants left
        if (call.participants.size === 0) {
          activeCalls.delete(callId);
          console.log(`Call ${callId} cleaned up - no participants left`);
        } else {
          call.lastActivity = Date.now();
        }
      }
      
      socket.leave(callId);
    } catch (error) {
      console.error('Error in leave_call:', error);
    }
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    
    if (socket.callId && socket.userId) {
      const call = activeCalls.get(socket.callId);
      if (call) {
        call.participants.delete(socket.userId);
        
        // Notify others in the call
        socket.to(socket.callId).emit('user_left', {
          userId: socket.userId,
          timestamp: Date.now()
        });
        
        // Clean up if no participants left
        if (call.participants.size === 0) {
          activeCalls.delete(socket.callId);
          console.log(`Call ${socket.callId} cleaned up - no participants left`);
        }
      }
    }
    
    // Clean up user socket mapping
    userSockets.delete(socket.userId);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    port: PORT,
    activeCalls: activeCalls.size,
    connectedSockets: io.engine.clientsCount,
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Get active calls info
app.get('/calls', (req, res) => {
  const callsInfo = Array.from(activeCalls.entries()).map(([callId, call]) => ({
    callId: callId,
    participantCount: call.participants.size,
    participants: Array.from(call.participants.keys()),
    createdAt: call.createdAt,
    lastActivity: call.lastActivity
  }));
  
  res.json({
    activeCalls: callsInfo,
    totalCalls: activeCalls.size,
    connectedSockets: io.engine.clientsCount
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'ReVision Socket.IO Video Streaming Server',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      calls: '/calls'
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Active calls: http://localhost:${PORT}/calls`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Socket.IO server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
