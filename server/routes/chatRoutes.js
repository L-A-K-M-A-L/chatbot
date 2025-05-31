const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatController');

router.options('/chat', (req, res) => res.sendStatus(200));
router.post('/chat', handleChatMessage);

router.post('/chat/reset', (req, res) => {
  chatService.resetConversation();
  res.sendStatus(200);
});

module.exports = router;
