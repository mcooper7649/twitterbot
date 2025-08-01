// Bot Configuration
module.exports = {
  // Posting schedule (cron format)
  SCHEDULE: "0 * * * *", // Every hour
  
  // Content settings
  MAX_TWEET_LENGTH: 280,
  MAX_CONTENT_LENGTH: 180, // Reduced from 200 to leave more room for hashtags
  MAX_RECENT_TWEETS: 300,
  
  // Topic weights (must sum to 1.0)
  TOPIC_WEIGHTS: {
    PYTHON: 0.25,
    JAVASCRIPT: 0.25,
    REACT: 0.20,
    NODEJS: 0.15,
    DOCKER: 0.10,
    GIT: 0.05
  },
  
  // Image generation settings
  IMAGE: {
    WIDTH: 800,
    HEIGHT: 400,
    MAX_CODE_LINES: 15,
    MAX_LINE_LENGTH: 80
  },
  
  // Similarity threshold for duplicate detection
  SIMILARITY_THRESHOLD: 0.85,
  
  // OpenAI settings
  OPENAI: {
    MODEL: "gpt-4",
    MAX_TOKENS: 120, // Reduced from 150
    TEMPERATURE: 0.8,
    MAX_RETRIES: 5
  },
  
  // Hashtag settings
  MAX_HASHTAGS_PER_TWEET: 4, // Reduced from 5
  TRENDING_HASHTAGS: [
    "#TechTwitter", "#Developer", "#Coding", "#Programming", "#SoftwareEngineering",
    "#WebDevelopment", "#FullStack", "#OpenSource", "#TechCommunity", "#CodeNewbie"
  ],
  
  // Phase 2: Content distribution
  CONTENT_DISTRIBUTION: {
    TIPS: 0.65,        // 65% programming tips
    INTERACTIVE: 0.20,  // 20% polls, challenges, questions
    COMMUNITY: 0.15     // 15% community engagement
  },
  
  // Phase 2: Interactive content settings
  INTERACTIVE: {
    POLL_CHANCE: 0.4,      // 40% chance of polls
    CHALLENGE_CHANCE: 0.3,  // 30% chance of code challenges
    QUESTION_CHANCE: 0.2,   // 20% chance of questions
    QUIZ_CHANCE: 0.1        // 10% chance of quizzes
  },
  
  // Phase 2: Community engagement settings
  COMMUNITY: {
    ENCOURAGEMENT_CHANCE: 0.4,  // 40% chance of encouragement
    TIP_REQUEST_CHANCE: 0.3,    // 30% chance of tip requests
    DISCUSSION_CHANCE: 0.2,     // 20% chance of discussions
    CELEBRATION_CHANCE: 0.1     // 10% chance of celebrations
  },
  
  // Phase 2: Analytics settings
  ANALYTICS: {
    MAX_DAILY_POSTS: 8,         // Maximum posts per day
    PERFORMANCE_REPORT_DAYS: 7,  // Days to include in reports
    TRACK_ENGAGEMENT: true,      // Track engagement metrics
    OPTIMAL_POSTING_HOURS: [9, 12, 15, 18, 21] // Recommended posting hours
  }
}; 