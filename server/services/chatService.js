const wizardFlows = require('../flows/wizardFlows');
const SystemPrompt = require('../data/systemPrompt');
const axios = require('axios');


// Track Conversation State
let conversationHistory = [];
let currentStage = 'Welcome';
let selectedStream = null;


// If someHow user ask for human agent.
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
    return humanAgentPhrases.some(phrase => message.toLowerCase().includes(phrase));
}

//  Process user message against the wizard flow
function processWizardFlow(message) {

    // Handle response for human agent
    if (isAskingForHumanAgent(message)) {
        currentStage = 'needHumanAgent';
        return wizardFlows.needHumanAgent.message;
    }

    // Check if the current stage is a stream selection
    if (currentStage === 'welcome' || currentStage === 'streamSelection') {

        if (
            message.includes('Development') ||
            message.toLowerCase().includes('development')) {
            selectedStream = 'Development';
            currentStage = 'developmentType';
            return wizardFlows.streamSelection.Development.message;
        }
        else if (
            message.includes('UI/UX Design') ||
            message.toLowerCase().includes('design') ||
            message.toLowerCase().includes('ux') ||
            message.toLowerCase().includes('ui')) {
            selectedStream = 'UI/UX Design';
            currentStage = 'designType';
            return wizardFlows.streamSelection['UI/UX Design'].message;

        } else if (
            message.includes('Quality Assurance') ||
            message.toLowerCase().includes('qa') ||
            message.toLowerCase().includes('quality assurance')) {
            selectedStream = 'Quality Assurance';
            currentStage = 'qaType';
            return wizardFlows.streamSelection['Quality Assurance'].message;
        }
        else {
            return "Please choose a valid stream: Development, UI/UX Design, or Quality Assurance.";
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

    return "I'm not sure how to help with that. Could you please clarify your request?";
}

//  Process user message with LLM
async function processWithLLM(userMessage) {

    conversationHistory.push({
        role: 'user',
        content: userMessage
    });

    //  Prepend the system prompt to guide responses
    const promptMessage = [
        {
            role: 'system',
            content: SystemPrompt.base
        },
        ...conversationHistory
    ];

    //  Include  information about the current Wizard state
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

//  Reset the conversation state
function resetConversation() {
    conversationHistory = [];
    currentStage = 'welcome';
    selectedStream = null;
}

// Export methods
module.exports = {
    processWizardFlow,
    processWithLLM,
    resetConversation,
    addToHistory: (message) => conversationHistory.push(message)
  };