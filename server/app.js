const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const corsOptions = require('./config/corsConfig');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(/^.*$/, cors(corsOptions));

app.use('/api', chatRoutes);

module.exports = app;