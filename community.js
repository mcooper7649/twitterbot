const config = require("./config");

// Community engagement features that work with free API
const ENGAGEMENT_TYPES = {
  ENCOURAGEMENT: "encouragement",
  TIP_REQUEST: "tip_request",
  DISCUSSION: "discussion",
  CELEBRATION: "celebration"
};

// Encouraging messages for developers
const ENCOURAGEMENT_MESSAGES = [
  "Keep coding, keep learning! 💻✨",
  "Every bug is a learning opportunity! 🐛➡️✨",
  "You're doing great, dev! Keep pushing forward! 🚀",
  "Remember: the best code is readable code! 📖",
  "Debugging is like being a detective! 🔍",
  "Your code is making the world better! 🌍",
  "Stack Overflow is your friend! 📚",
  "Take breaks, stay hydrated, keep coding! 💧💻"
];

// Tip request messages
const TIP_REQUEST_MESSAGES = {
  PYTHON: [
    "What's your favorite Python tip? Share below! 🐍",
    "Pythonistas: what's your go-to debugging trick? 🔍",
    "What Python package can't you live without? 📦",
    "Share your best Python list comprehension! 📝"
  ],
  JAVASCRIPT: [
    "What's your favorite JS trick? Drop it below! ⚡",
    "JavaScript devs: what's your debugging secret? 🕵️",
    "What's the most useful JS library you've used? 📚",
    "Share your best async/await pattern! 🔄"
  ],
  REACT: [
    "React devs: what's your favorite hook pattern? 🎣",
    "What's your go-to React performance tip? ⚡",
    "Share your best React component structure! 🧩",
    "What's your favorite React library? 📚"
  ],
  NODEJS: [
    "Node.js devs: what's your deployment secret? 🚀",
    "What's your favorite npm package? 📦",
    "Share your best error handling pattern! 🛡️",
    "What's your go-to Node.js debugging tool? 🔍"
  ],
  DOCKER: [
    "Docker users: what's your favorite base image? 🐳",
    "Share your best Dockerfile optimization! ⚡",
    "What's your go-to Docker debugging command? 🔍",
    "What's your favorite container orchestration tool? 🎯"
  ],
  GIT: [
    "Git users: what's your favorite command? 📝",
    "Share your best Git workflow! 🔄",
    "What's your go-to Git troubleshooting tip? 🛠️",
    "What's your favorite Git GUI tool? 🖥️"
  ]
};

// Discussion starters
const DISCUSSION_TOPICS = {
  PYTHON: [
    "What's the most challenging Python concept you've learned?",
    "Which Python framework do you prefer and why?",
    "What's your experience with Python async programming?",
    "How do you handle Python package management?"
  ],
  JAVASCRIPT: [
    "What's your biggest JavaScript challenge?",
    "Which JS framework ecosystem do you prefer?",
    "How do you handle JavaScript performance optimization?",
    "What's your experience with TypeScript?"
  ],
  REACT: [
    "What's your biggest React challenge?",
    "How do you handle state management in large apps?",
    "What's your experience with React performance?",
    "Which React testing strategy do you prefer?"
  ],
  NODEJS: [
    "What's your biggest Node.js challenge?",
    "How do you handle Node.js scaling?",
    "What's your experience with microservices?",
    "How do you handle Node.js security?"
  ],
  DOCKER: [
    "What's your biggest Docker challenge?",
    "How do you handle container security?",
    "What's your experience with Kubernetes?",
    "How do you optimize Docker builds?"
  ],
  GIT: [
    "What's your biggest Git challenge?",
    "How do you handle merge conflicts?",
    "What's your branching strategy?",
    "How do you handle Git security?"
  ]
};

// Celebration messages
const CELEBRATION_MESSAGES = [
  "Happy Friday, devs! 🎉 What are you building this weekend?",
  "TGIF! Time to code something awesome! 💻✨",
  "Weekend coding session anyone? 🚀",
  "Happy coding weekend! What's your project? 🎯",
  "Friday vibes: time to refactor that code! 🔧",
  "Weekend hackathon mode activated! 💪",
  "TGIF! Let's build something amazing! 🌟",
  "Happy Friday! What are you learning today? 📚"
];

// Generate community engagement content
function generateCommunityContent(topic, engagementType = null) {
  if (!engagementType) {
    const types = Object.values(ENGAGEMENT_TYPES);
    engagementType = types[Math.floor(Math.random() * types.length)];
  }
  
  switch (engagementType) {
    case ENGAGEMENT_TYPES.ENCOURAGEMENT:
      return generateEncouragement();
    case ENGAGEMENT_TYPES.TIP_REQUEST:
      return generateTipRequest(topic);
    case ENGAGEMENT_TYPES.DISCUSSION:
      return generateDiscussion(topic);
    case ENGAGEMENT_TYPES.CELEBRATION:
      return generateCelebration();
    default:
      return generateEncouragement();
  }
}

// Generate encouragement message
function generateEncouragement() {
  const message = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
  
  return {
    type: ENGAGEMENT_TYPES.ENCOURAGEMENT,
    content: message,
    hashtags: ["#DevCommunity", "#Coding", "#Programming", "#TechTwitter"]
  };
}

// Generate tip request
function generateTipRequest(topic) {
  const messages = TIP_REQUEST_MESSAGES[topic.name.toUpperCase()] || TIP_REQUEST_MESSAGES.PYTHON;
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    type: ENGAGEMENT_TYPES.TIP_REQUEST,
    content: message,
    hashtags: [`#${topic.name}`, "#DevCommunity", "#TechTwitter", "#Programming"]
  };
}

// Generate discussion starter
function generateDiscussion(topic) {
  const topics = DISCUSSION_TOPICS[topic.name.toUpperCase()] || DISCUSSION_TOPICS.PYTHON;
  const discussion = topics[Math.floor(Math.random() * topics.length)];
  
  return {
    type: ENGAGEMENT_TYPES.DISCUSSION,
    content: discussion,
    hashtags: [`#${topic.name}`, "#DevCommunity", "#TechTwitter", "#Programming"]
  };
}

// Generate celebration message
function generateCelebration() {
  const message = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
  
  return {
    type: ENGAGEMENT_TYPES.CELEBRATION,
    content: message,
    hashtags: ["#TGIF", "#DevCommunity", "#Coding", "#TechTwitter"]
  };
}

// Check if we should post community content (15% chance)
function shouldPostCommunity() {
  return Math.random() < 0.15; // 15% chance
}

// Check if it's Friday for celebration posts
function isFriday() {
  const today = new Date();
  return today.getDay() === 5; // Friday is day 5
}

// Get appropriate engagement type based on context
function getEngagementType() {
  if (isFriday()) {
    return ENGAGEMENT_TYPES.CELEBRATION;
  }
  
  const types = Object.values(ENGAGEMENT_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

module.exports = {
  generateCommunityContent,
  shouldPostCommunity,
  getEngagementType,
  ENGAGEMENT_TYPES
}; 