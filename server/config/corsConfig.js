module.exports = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    // preflightContinue: false,
    optionsSuccessStatus: 200
}