require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',        require('./src/routes/auth'));
app.use('/api/courses',     require('./src/routes/courses'));
app.use('/api/teachers',    require('./src/routes/teachers'));
app.use('/api/live-classes',require('./src/routes/liveClasses'));
app.use('/api/enrollments', require('./src/routes/enrollments'));
app.use('/api/invoices',    require('./src/routes/invoices'));
app.use('/api/admin',       require('./src/routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'SS Coaching API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
