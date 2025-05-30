module.exports = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization',
      'X-Requested-With'
    ],
    credentials: true, // Required for Safari
    optionsSuccessStatus: 200
  };
  