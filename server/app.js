const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/corsConfig');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api', chatRoutes);

app.use((req, res) => {
    res.status(404).send('Route not found');
  });
  

module.exports = app;
