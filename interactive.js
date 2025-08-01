const config = require("./config");

// Interactive content types
const INTERACTIVE_TYPES = {
  POLL: "poll",
  CHALLENGE: "challenge",
  QUESTION: "question",
  QUIZ: "quiz"
};

// Poll questions for different topics
const POLL_QUESTIONS = {
  PYTHON: [
    "What's your favorite Python framework?",
    "Which Python feature do you use most?",
    "What's your go-to Python package?",
    "Which Python version are you using?"
  ],
  JAVASCRIPT: [
    "What's your preferred JS framework?",
    "Which ES6+ feature do you love most?",
    "What's your favorite JS testing library?",
    "Which JS runtime do you prefer?"
  ],
  REACT: [
    "What's your favorite React state management?",
    "Which React hook do you use most?",
    "What's your preferred React styling solution?",
    "Which React testing library do you use?"
  ],
  NODEJS: [
    "What's your favorite Node.js framework?",
    "Which database do you use with Node.js?",
    "What's your preferred Node.js testing tool?",
    "Which Node.js version are you using?"
  ],
  DOCKER: [
    "What's your preferred container orchestration?",
    "Which Docker base image do you use most?",
    "What's your favorite Docker tool?",
    "Which cloud platform do you deploy to?"
  ],
  GIT: [
    "What's your preferred Git workflow?",
    "Which Git GUI do you use?",
    "What's your favorite Git command?",
    "Which branching strategy do you follow?"
  ]
};

// Code challenges
const CODE_CHALLENGES = {
  PYTHON: [
    {
      question: "What does this code output?",
      code: "print([x*2 for x in range(3)])",
      answer: "[0, 2, 4]",
      explanation: "List comprehension doubles each number from 0-2"
    },
    {
      question: "What's the output?",
      code: "x = [1, 2, 3]\ny = x\ny[0] = 10\nprint(x)",
      answer: "[10, 2, 3]",
      explanation: "y references the same list as x"
    }
  ],
  JAVASCRIPT: [
    {
      question: "What does this output?",
      code: "console.log([1,2,3].map(x => x*2))",
      answer: "[2, 4, 6]",
      explanation: "map() doubles each array element"
    },
    {
      question: "What's the result?",
      code: "console.log(typeof null)",
      answer: "object",
      explanation: "JavaScript's typeof null returns 'object'"
    }
  ],
  REACT: [
    {
      question: "What happens when this runs?",
      code: "useEffect(() => {\n  console.log('mounted')\n}, [])",
      answer: "Logs 'mounted' once",
      explanation: "Empty dependency array runs only on mount"
    }
  ]
};

// Generate interactive content
function generateInteractiveContent(topic) {
  const contentTypes = Object.values(INTERACTIVE_TYPES);
  const selectedType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
  
  switch (selectedType) {
    case INTERACTIVE_TYPES.POLL:
      return generatePoll(topic);
    case INTERACTIVE_TYPES.CHALLENGE:
      return generateChallenge(topic);
    case INTERACTIVE_TYPES.QUESTION:
      return generateQuestion(topic);
    case INTERACTIVE_TYPES.QUIZ:
      return generateQuiz(topic);
    default:
      return generatePoll(topic);
  }
}

// Generate a poll
function generatePoll(topic) {
  const questions = POLL_QUESTIONS[topic.name.toUpperCase()] || POLL_QUESTIONS.PYTHON;
  const question = questions[Math.floor(Math.random() * questions.length)];
  
  const pollOptions = getPollOptions(topic.name, question);
  
  return {
    type: INTERACTIVE_TYPES.POLL,
    content: question,
    options: pollOptions,
    hashtags: [`#${topic.name}`, "#Poll", "#DevCommunity", "#TechTwitter"]
  };
}

// Get poll options based on topic and question
function getPollOptions(topicName, question) {
  const optionSets = {
    "Python": {
      "What's your favorite Python framework?": ["Django", "Flask", "FastAPI", "Other"],
      "Which Python feature do you use most?": ["List Comprehensions", "Decorators", "Context Managers", "Generators"],
      "What's your go-to Python package?": ["requests", "pandas", "numpy", "pytest"],
      "Which Python version are you using?": ["Python 3.8", "Python 3.9", "Python 3.10+", "Python 3.7"]
    },
    "JavaScript": {
      "What's your preferred JS framework?": ["React", "Vue", "Angular", "Svelte"],
      "Which ES6+ feature do you love most?": ["Arrow Functions", "Destructuring", "Async/Await", "Template Literals"],
      "What's your favorite JS testing library?": ["Jest", "Mocha", "Vitest", "Cypress"],
      "Which JS runtime do you prefer?": ["Node.js", "Deno", "Bun", "Browser"]
    },
    "React": {
      "What's your favorite React state management?": ["useState", "Redux", "Zustand", "Context API"],
      "Which React hook do you use most?": ["useState", "useEffect", "useContext", "useMemo"],
      "What's your preferred React styling solution?": ["CSS Modules", "Styled Components", "Tailwind", "Material-UI"],
      "Which React testing library do you use?": ["React Testing Library", "Jest", "Cypress", "Playwright"]
    }
  };
  
  const options = optionSets[topicName]?.[question] || ["Option 1", "Option 2", "Option 3", "Option 4"];
  return options;
}

// Generate a code challenge
function generateChallenge(topic) {
  const challenges = CODE_CHALLENGES[topic.name.toUpperCase()] || CODE_CHALLENGES.PYTHON;
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  
  return {
    type: INTERACTIVE_TYPES.CHALLENGE,
    content: `${challenge.question}\n\n\`\`\`${topic.name.toLowerCase()}\n${challenge.code}\n\`\`\``,
    answer: challenge.answer,
    explanation: challenge.explanation,
    hashtags: [`#${topic.name}`, "#CodeChallenge", "#Programming", "#TechTwitter"]
  };
}

// Generate a question
function generateQuestion(topic) {
  const questions = [
    `What's your biggest challenge with ${topic.name}?`,
    `What ${topic.name} tip would you share with a beginner?`,
    `What's your favorite ${topic.name} tool/library?`,
    `What ${topic.name} concept do you find most confusing?`
  ];
  
  const question = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    type: INTERACTIVE_TYPES.QUESTION,
    content: question,
    hashtags: [`#${topic.name}`, "#DevCommunity", "#TechTwitter", "#Programming"]
  };
}

// Generate a quiz
function generateQuiz(topic) {
  const quizQuestions = {
    "Python": [
      "What's the difference between list and tuple?",
      "How do you create a virtual environment?",
      "What's the purpose of __init__?",
      "How do you handle exceptions?"
    ],
    "JavaScript": [
      "What's the difference between == and ===?",
      "How do you handle async operations?",
      "What's closure in JavaScript?",
      "How do you prevent event bubbling?"
    ],
    "React": [
      "What's the difference between state and props?",
      "How do you optimize React performance?",
      "What's the purpose of useEffect?",
      "How do you handle forms in React?"
    ]
  };
  
  const questions = quizQuestions[topic.name] || quizQuestions.Python;
  const question = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    type: INTERACTIVE_TYPES.QUIZ,
    content: `Quick ${topic.name} quiz: ${question}`,
    hashtags: [`#${topic.name}`, "#Quiz", "#Programming", "#TechTwitter"]
  };
}

// Check if we should post interactive content (20% chance)
function shouldPostInteractive() {
  return Math.random() < 0.2; // 20% chance
}

module.exports = {
  generateInteractiveContent,
  shouldPostInteractive,
  INTERACTIVE_TYPES
}; 