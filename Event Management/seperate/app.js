// app.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/feedback', feedbackRoutes);

// Static and home route
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Club Event Management System</h1>');
});

module.exports = app;
