const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//  for memory and conversation history
let conversationHistory = [];

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    //  for memory and conversation history
    conversationHistory.push({ role: 'user', content: userMessage });
    const fullPrompt = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model : 'mistral',
            prompt : userMessage,
            stream : true, // streaming response
        }, { responseType: 'stream' });

        // stream data to frontend
        res.setheader ('Content-Type', 'text/event-stream');  
        res.setheader ('Cache-Control', 'no-cache');
        res.setheader ('Connection', 'keep-alive');

        let fullBotReply = '';

        response.data.on('data', (chunk) => {
            const lines = chuunk.toString().split('\n');
            for(const line of lines) {
                if( line.trim() === '' ) continue;
                try {
                    const parsed = JSON.parse(line);
                    if(parsed.response) {
                        res.write(`data: ${parsed.response}\n\n`);
                        fullBotReply += parsed.response;
                    }
                }catch (error) {
                    console.error('Error parsing chunk:', error);
                }
            }
        });


        response.data.on('end', () => {
            conversationHistory.push({ role: 'assistant', content: fullBotReply });
            res.end();
        });
    
    }catch (error) {
        console.error('Error talking to Ollama:', error);
        res.status(500).json({ error: 'Error talking to Ollama' });
    }
});

//  to clear caht history
app.post('/clear', (req, res) => {
    conversationHistory = [];
    res.json({ message: 'Chat history cleared' });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});