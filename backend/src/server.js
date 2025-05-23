const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const config = require('./config/config');
const ErrorResponse = require('./utils/errorResponse');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Define routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/proposals', require('./routes/proposals'));
app.use('/api/v1/stripe', require('./routes/stripe'));

// Serve static files from Frontend directory in all environments
app.use(express.static(path.join(__dirname, '..', '..', 'Frontend')));

// For SPA routing - serve index.html for any unmatched routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }
    
    res.sendFile(path.resolve(__dirname, '..', '..', 'Frontend', 'index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
});

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
