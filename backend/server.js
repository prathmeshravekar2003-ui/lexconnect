const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const setupSocket = require('./socket/socketHandler');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const app = express();
const server = http.createServer(app);

// Dynamic CORS origin function to handle Vercel previews and localhost
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOriginFn = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // Dynamically allow any vercel deployment
  if (origin.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  
  return callback(new Error('Not allowed by CORS'));
};

const corsOptions = {
  origin: corsOriginFn,
  credentials: true
};

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
});

// Attach io to app and pass to routes via middleware
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup socket handlers
setupSocket(io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lawyers', require('./routes/lawyerRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LexConnect API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 LexConnect Server running on ${HOST}:${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
