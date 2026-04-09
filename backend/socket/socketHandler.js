const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const onlineUsers = new Map();

const setupSocket = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userAvatar = user.avatar;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🟢 User connected: ${socket.userName} (${socket.userId})`);

    // Set user online
    onlineUsers.set(socket.userId, socket.id);
    await User.findByIdAndUpdate(socket.userId, { isOnline: true, socketId: socket.id });

    // Broadcast online status
    io.emit('user_status', { userId: socket.userId, isOnline: true });

    // Join consultation room
    socket.on('join_room', (roomId) => {
      const consultationId = roomId.toString();
      socket.join(consultationId);
      console.log(`📌 [SOCKET] User ${socket.userName} joined room: ${consultationId}`);
      console.log(`📋 [SOCKET] Current rooms for ${socket.userId}:`, Array.from(socket.rooms));
    });

    // Leave room
    socket.on('leave_room', (consultationId) => {
      socket.leave(consultationId);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { consultationId, receiverId, content, messageType = 'text', fileUrl } = data;

        const message = new Message({
          consultation: consultationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType,
          fileUrl
        });

        // Save to DB in background (don't await for the broadcast)
        message.save().catch(err => console.error('DB Save Error:', err));

        const roomName = consultationId.toString();
        
        // Construct basic message object for immediate broadcast
        const immediateMessage = {
          _id: message._id,
          consultation: roomName,
          sender: { _id: socket.userId, name: socket.userName, avatar: socket.userAvatar },
          content,
          messageType,
          fileUrl,
          createdAt: new Date()
        };

        console.log(`🚀 [SOCKET] Instant broadcast to room: ${roomName}`);
        io.to(roomName).emit('new_message', immediateMessage);

        // Send notification to receiver if they're not in the room
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message_notification', {
            consultationId,
            message: populatedMessage
          });
        }
      } catch (error) {
        socket.emit('message_error', { error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const room = data.consultationId?.toString();
      if (!room) return;
      socket.to(room).emit('user_typing', {
        userId: socket.userId?.toString(),
        userName: socket.userName,
        isTyping: data.isTyping
      });
    });

    // WebRTC Signaling
    socket.on('call_user', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming_call', {
          from: socket.userId,
          callerName: socket.userName,
          signal: data.signal,
          consultationId: data.consultationId,
          callType: data.callType // 'audio' or 'video'
        });
      }
    });

    socket.on('answer_call', (data) => {
      const callerSocketId = onlineUsers.get(data.callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_accepted', {
          signal: data.signal,
          answeredBy: socket.userId
        });
      }
    });

    socket.on('reject_call', (data) => {
      const callerSocketId = onlineUsers.get(data.callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call_rejected', {
          rejectedBy: socket.userId
        });
      }
    });

    socket.on('end_call', (data) => {
      const otherSocketId = onlineUsers.get(data.userId);
      if (otherSocketId) {
        io.to(otherSocketId).emit('call_ended', {
          endedBy: socket.userId
        });
      }
    });

    socket.on('ice_candidate', (data) => {
      const targetSocketId = onlineUsers.get(data.targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice_candidate', {
          candidate: data.candidate,
          from: socket.userId
        });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${socket.userName}`);
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
      io.emit('user_status', { userId: socket.userId, isOnline: false });
    });
  });
};

module.exports = setupSocket;
