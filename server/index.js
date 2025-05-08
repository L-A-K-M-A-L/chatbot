const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.options(/^.*$/, cors(corsOptions)); 


let conversationHistory = [];

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n'),
      stream: true,
    }, {
      responseType: 'stream',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
    });

    // Required for streaming CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullReply = '';
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            res.write(`data: ${parsed.response}\n\n`);
            fullReply += parsed.response + ' ';
          }
        } catch (err) {
          console.error('Error parsing stream:', err.message);
        }
      }
    });

    response.data.on('end', () => {
      fullReply = fullReply.trim();
      conversationHistory.push({ role: 'assistant', content: fullReply });
      res.end();
    });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Error from Ollama');
  }
});

app.listen(5001, () => {
  console.log('Backend running on http://localhost:5001');
});
