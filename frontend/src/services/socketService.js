import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    this.activeRooms = new Set();
  }

  connect(token) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(this.url, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('📡 [SOCKET] Connected to server:', this.socket.id);
      // Re-join all active rooms on every reconnection
      this.activeRooms.forEach(roomId => {
        console.log('🔄 [SOCKET] Auto-rejoining room after reconnect:', roomId);
        this.socket.emit('join_room', roomId);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 [SOCKET] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('📡 [SOCKET] Connection error:', err.message);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log('📡 [SOCKET] Reconnected after', attempt, 'attempts');
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      console.log('📡 [SOCKET] Terminating connection');
      this.socket.disconnect();
      this.socket = null;
      this.activeRooms.clear();
    }
  }

  // Helper to join a specific room (e.g., consultation)
  joinRoom(roomId) {
    if (!roomId) return;
    const cleanId = roomId.toString().trim();
    this.activeRooms.add(cleanId);
    
    if (this.isConnected()) {
      console.log('📡 [SOCKET] Sending join_room for:', cleanId);
      this.socket.emit('join_room', cleanId);
    } else {
      console.warn('📡 [SOCKET] Cannot join room yet, socket not connected. Room added to persistence list.');
    }
  }

  leaveRoom(roomId) {
    if (!roomId) return;
    const cleanId = roomId.toString().trim();
    this.activeRooms.delete(cleanId);
    
    if (this.socket) {
      console.log('📡 [SOCKET] Sending leave_room for:', cleanId);
      this.socket.emit('leave_room', cleanId);
    }
  }
}

const socketService = new SocketService();
export default socketService;
