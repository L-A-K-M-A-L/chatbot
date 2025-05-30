const wizardFlows = require('../data/wizardFlows');
const systemPrompt = require('../data/systemPrompt');
const axios = require('axios');

let conversationHistory = [];
let currentStage = 'welcome';
let selectedStream = null;

function isAskingForHumanAgent(message) {
  const humanAgentKeywords = [
    "human agent",
    "human",
    "specialist",
    "contact",
    "representative",
    "speak to someone",
    "connect me",
    "help me with a person",
  ];
  
  return humanAgentKeywords.some(phrase => message.toLowerCase().includes(phrase));
}

function processWizardFlow(message) {
  if (isAskingForHumanAgent(message)) {
    currentStage = 'needHumanAgent';
    return wizardFlows.needHumanAgent.message;
  }
  
  if (currentStage === 'welcome' || currentStage === 'streamSelection') {
    if (message.includes('Development') || message.toLowerCase().includes('development')) {
      selectedStream = 'Development';
      currentStage = 'developmentType';
      return wizardFlows.streamSelection.Development.message;
    } else if (
      message.includes('UI/UX Design') ||
      message.toLowerCase().includes('design') ||
      message.toLowerCase().includes('ux') ||
      message.toLowerCase().includes('ui')
    ) {
      selectedStream = 'UI/UX Design';
      currentStage = 'designType';
      return wizardFlows.streamSelection['UI/UX Design'].message;
    } else if (
      message.includes('Quality Assurance') ||
      message.toLowerCase().includes('qa') ||
      message.toLowerCase().includes('quality assurance')
    ) {
      selectedStream = 'Quality Assurance';
      currentStage = 'qaType';
      return wizardFlows.streamSelection['Quality Assurance'].message;
    }else{
      return "Please select a stream of interest: Development, UI/UX Design, or Quality Assurance.";
    }
  }
  
  if (wizardFlows[currentStage] && wizardFlows[currentStage].message) {
    const nextStage = wizardFlows[currentStage].nextStage;
    const response = wizardFlows[currentStage].message;
    
    if (nextStage) {
      currentStage = nextStage;
    }
    
    return response;
  }
  
  return null;
}

async function processWithLLM(userMessage) {
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });
  
  const promptMessages = [
    {
      role: 'system',
      content: systemPrompt.base
    },
    ...conversationHistory
  ];
  
  if (selectedStream) {
    promptMessages.unshift({
      role: 'system',
      content: `The user has selected "${selectedStream}" as their area of interest. We are at the "${currentStage}" stage of the wizard flow.`
    });
  }
  
  return await axios.post('http://localhost:11434/api/generate', {
    model: 'mistral',
    prompt: promptMessages.map(m => `${m.role}: ${m.content}`).join('\n'),
    stream: true,
  }, {
    responseType: 'stream',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
  });
}

function resetConversation() {
  conversationHistory = [];
  currentStage = 'welcome';
  selectedStream = null;
}

module.exports = {
  processWizardFlow,
  processWithLLM,
  resetConversation,
  addToHistory: (message) => conversationHistory.push(message)
};
