module.exports = {
    welcome: {
      message: "Welcome to our IT Partnership Wizard! I can help you explore our services in Development, UI/UX Design, or Quality Assurance. Which area are you interested in?",
      nextStage: "streamSelection",
    },
    streamSelection: {
      Development: {
        message: "Great choice! What type of development services do you need? (Web, Mobile, Backend, Full-Stack, etc.)",
        nextStage: "developmentType"
      },
      "UI/UX Design": {
        message: "Excellent! Do you need UI prototyping, full-scale design, or usability testing?",
        nextStage: "designType"
      },
      "Quality Assurance": {
        message: "Perfect! What type of QA services do you need? (Manual Testing, Automation, Performance Testing, Security Testing, etc.)",
        nextStage: "qaType"
      }
    },
    developmentType: {
      message: "What technology stack are you interested in? (React, Node.js, Python, Java, etc.)",
      nextStage: "technologiesSelection"
    },
    designType: {
      message: "Do you have an existing design concept or need a new one from scratch?",
      nextStage: "designConcept"
    },
    qaType: {
      message: "What platforms are you testing for? (Web, Mobile, API, Desktop, etc.)",
      nextStage: "platformSelection"
    },
    needHumanAgent: {
      message: "I'd be happy to connect you with one of our specialists. Could you please provide your name and email so they can reach out to you?",
      nextStage: "collectContact"
    }
  };
  