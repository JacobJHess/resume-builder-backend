const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const uploadRoutes = require('./upload');
const formRoutes = require('./form');
const generateRoutes = require('./generate');
const resumesRoutes = require('./resumes');
const stripeRoutes = require('./stripe');
const webhookRoutes = require('./webhook');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Storage directory
const resumesDir = path.join(__dirname, 'storage', 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

// Serve generated resumes
app.use('/resumes', express.static(resumesDir));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/form', formRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/checkout', stripeRoutes);
app.use('/api/webhook', webhookRoutes);

// Root health check
app.get('/healthz', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
