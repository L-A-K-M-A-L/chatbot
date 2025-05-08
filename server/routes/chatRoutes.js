const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatController');

router.options('/chat', (req, res) => res.sendStatus(200));
router.post('/chat', handleChatMessage);

module.exports = router;
