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
    "What's your approach to Python metaprogramming?",
    "How do you handle Python performance bottlenecks?",
    "What's your Python architecture pattern?",
    "How do you scale Python applications?"
  ],
  JAVASCRIPT: [
    "How do you handle JavaScript performance optimization?",
    "What's your approach to JavaScript architecture?",
    "How do you scale JavaScript applications?",
    "What's your JavaScript debugging strategy?"
  ],
  REACT: [
    "How do you handle React performance optimization?",
    "What's your React architecture pattern?",
    "How do you scale React applications?",
    "What's your React debugging strategy?"
  ],
  NODEJS: [
    "How do you handle Node.js performance optimization?",
    "What's your Node.js architecture pattern?",
    "How do you scale Node.js applications?",
    "What's your Node.js debugging strategy?"
  ],
  DOCKER: [
    "How do you handle Docker performance optimization?",
    "What's your Docker architecture pattern?",
    "How do you scale Docker applications?",
    "What's your Docker debugging strategy?"
  ],
  GIT: [
    "How do you handle Git performance optimization?",
    "What's your Git architecture pattern?",
    "How do you scale Git workflows?",
    "What's your Git debugging strategy?"
  ],
  AI: [
    "How do you handle AI/ML performance optimization?",
    "What's your AI/ML architecture pattern?",
    "How do you scale AI/ML applications?",
    "What's your AI/ML debugging strategy?"
  ],
  FLUTTER: [
    "How do you handle Flutter performance optimization?",
    "What's your Flutter architecture pattern?",
    "How do you scale Flutter applications?",
    "What's your Flutter debugging strategy?"
  ],
  SECURITY: [
    "How do you handle security performance optimization?",
    "What's your security architecture pattern?",
    "How do you scale security applications?",
    "What's your security debugging strategy?"
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
  ],
  AI: [
    {
      question: "What does this code do?",
      code: "import numpy as np\nx = np.array([1, 2, 3])\nprint(x * 2)",
      answer: "[2, 4, 6]",
      explanation: "NumPy arrays support element-wise operations"
    },
    {
      question: "What's the output?",
      code: "from sklearn.model_selection import train_test_split\nX_train, X_test = train_test_split(X, test_size=0.2)",
      answer: "Splits data 80/20",
      explanation: "test_size=0.2 means 20% for testing"
    }
  ],
  FLUTTER: [
    {
      question: "What does this widget do?",
      code: "Container(\n  child: Text('Hello'),\n  padding: EdgeInsets.all(16),\n)",
      answer: "Text with 16px padding",
      explanation: "Container adds padding around Text widget"
    },
    {
      question: "What's the result?",
      code: "List<String> items = ['a', 'b'];\nitems.add('c');\nprint(items.length);",
      answer: "3",
      explanation: "add() appends item to list"
    }
  ],
  SECURITY: [
    {
      question: "What's wrong with this code?",
      code: "query = \"SELECT * FROM users WHERE id = \" + userInput",
      answer: "SQL Injection vulnerable",
      explanation: "Direct string concatenation allows SQL injection"
    },
    {
      question: "What does this do?",
      code: "import hashlib\nhash = hashlib.sha256(password.encode()).hexdigest()",
      answer: "Hashes password with SHA256",
      explanation: "Creates cryptographic hash of password"
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
    },
    "AI": {
      "What's your favorite AI/ML framework?": ["TensorFlow", "PyTorch", "Scikit-learn", "Hugging Face"],
      "Which AI model do you use most?": ["BERT", "GPT", "ResNet", "Custom Models"],
      "What's your go-to AI tool/library?": ["Pandas", "NumPy", "Matplotlib", "Jupyter"],
      "Which AI application are you building?": ["Chatbots", "Computer Vision", "NLP", "Recommendation Systems"]
    },
    "Flutter": {
      "What's your preferred Flutter state management?": ["Provider", "Bloc", "Riverpod", "GetX"],
      "Which Flutter widget do you use most?": ["Container", "ListView", "Column", "Row"],
      "What's your favorite Flutter package?": ["http", "shared_preferences", "provider", "flutter_bloc"],
      "Which Flutter architecture do you follow?": ["BLoC", "Provider", "MVC", "MVVM"]
    },
    "Security": {
      "What's your biggest security concern?": ["Authentication", "Data Encryption", "SQL Injection", "XSS"],
      "Which security tool do you use most?": ["OWASP ZAP", "Burp Suite", "Nmap", "Wireshark"],
      "What's your go-to security practice?": ["Input Validation", "HTTPS", "Regular Updates", "Code Review"],
      "Which security framework do you prefer?": ["OWASP", "NIST", "ISO 27001", "Custom"]
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