const chatService = require('../services/chatService');

const handleChatMessage = async (req, res) => {
  const userMessage = req.body.message;
  
  const wizardResponse = chatService.processWizardFlow(userMessage);
  
  if (wizardResponse) {
    setupStreamHeaders(res);
    
    const words = wizardResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      res.write(`data: ${words[i]} `);
      res.write('\n\n');
    }
    
    chatService.addToHistory({
      role: 'assistant',
      content: wizardResponse
    });
    
    res.end();
    return;
  }
  
  try {
    const response = await chatService.processWithLLM(userMessage);
    setupStreamHeaders(res);
    
    let fullReply = '';
    
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for(const line of lines) {
        if(!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if(parsed.response) {
            res.write(`data: ${parsed.response}\n\n`);
            fullReply += parsed.response;
          }
        } catch (error) {
          console.error('Error parsing line:', line, error.message);
        }
      }
    });
    
    response.data.on('end', () => {
      fullReply = fullReply.trim();
      chatService.addToHistory({
        role: 'assistant',
        content: fullReply
      });
      res.write('\n');
      res.end();
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).send('Internal Server Error');
  }
};

function setupStreamHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}

module.exports = {
  handleChatMessage
};
