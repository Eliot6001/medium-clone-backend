const expressInstance = require('express');
const articleRoutes = require('./routes/articleRoutes');
const { authMiddleware } = require('./middlewares/authMiddleware');
const app = expressInstance();

import bodyParser from "body-parser";
import morgan from 'morgan'

app.use(morgan('combined'));
// Middleware to parse JSON
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Authentication middleware (if needed)
app.use(authMiddleware);

// Routes
app.use('/articles', articleRoutes);

module.exports = app;
