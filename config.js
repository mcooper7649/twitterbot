// Bot Configuration
module.exports = {
  // Posting schedule (cron format)
  SCHEDULE: "0 * * * *", // Every hour
  
  // Content settings
  MAX_TWEET_LENGTH: 280,
  MAX_CONTENT_LENGTH: 120, // Shorter tweets for detailed images
  MAX_RECENT_TWEETS: 300,
  
  // Topic weights (must sum to 1.0)
  TOPIC_WEIGHTS: {
    PYTHON: 0.20,
    JAVASCRIPT: 0.20,
    REACT: 0.15,
    NODEJS: 0.12,
    DOCKER: 0.08,
    GIT: 0.05,
    AI: 0.10,
    FLUTTER: 0.05,
    SECURITY: 0.05
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
    TIPS: 0.55,        // 55% programming tips (reduced from 65%)
    INTERACTIVE: 0.20,  // 20% polls, challenges, questions
    COMMUNITY: 0.15,    // 15% community engagement
    TRENDING: 0.10      // 10% trending topics (new in Phase 3)
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
  },
  
  // Phase 3: Advanced Analytics & A/B Testing
  ADVANCED_ANALYTICS: {
    ENABLED: true,
    TRACKING_INTERVAL: 6 * 60 * 60 * 1000, // 6 hours
    MIN_SAMPLE_SIZE: 10,        // Minimum samples for A/B test results
    CONFIDENCE_LEVEL: 0.95,     // Statistical confidence level
    AUTO_OPTIMIZATION: true      // Automatically apply best performing variants
  },
  
  // Phase 3: A/B Test Settings
  AB_TESTING: {
    CONTENT_LENGTH: {
      ENABLED: true,
      VARIANTS: {
        A: { maxLength: 150, weight: 0.33 },
        B: { maxLength: 180, weight: 0.34 },
        C: { maxLength: 200, weight: 0.33 }
      }
    },
    HASHTAG_COUNT: {
      ENABLED: true,
      VARIANTS: {
        A: { maxHashtags: 3, weight: 0.33 },
        B: { maxHashtags: 4, weight: 0.34 },
        C: { maxHashtags: 5, weight: 0.33 }
      }
    },
    POSTING_TIME: {
      ENABLED: true,
      VARIANTS: {
        A: { hours: [9, 15, 21], weight: 0.33 },
        B: { hours: [12, 18], weight: 0.34 },
        C: { hours: [6, 10, 14, 18, 22], weight: 0.33 }
      }
    }
  },
  
  // Phase 3: Trending Topics
  TRENDING_TOPICS: {
    ENABLED: true,
    UPDATE_INTERVAL: 6 * 60 * 60 * 1000, // 6 hours
    MAX_TOPICS: 5,
    TECH_TRENDS: [
      "AI/ML", "Web3", "Cloud Computing", "Cybersecurity", 
      "DevOps", "Mobile Development", "Data Science", "Blockchain",
      "IoT", "Edge Computing", "Serverless", "Microservices"
    ]
  },
  
  // Phase 3: Thread Creation
  THREAD_CREATION: {
    ENABLED: true,
    CHANCE: 0.10,              // 10% chance to create a thread
    MAX_THREAD_LENGTH: 6,      // Maximum tweets per thread
    TOPICS_WITH_THREADS: ["Python", "JavaScript", "React"], // Topics that have thread templates
    TRENDING_THREAD_CHANCE: 0.3 // 30% chance to use trending topics in threads
  },
  
  // Phase 3: Seasonal Awareness
  SEASONAL_AWARENESS: {
    ENABLED: true,
    EVENTS: {
      "1": ["New Year's Resolution Coding", "January Learning Goals"],
      "2": ["Valentine's Day Code Love", "February Framework Focus"],
      "3": ["Spring Cleaning Code", "March Madness Programming"],
      "4": ["April Fools Debugging", "Spring Framework Season"],
      "5": ["May the Code Be With You", "Cinco de Code"],
      "6": ["Summer Coding Camp", "June JavaScript"],
      "7": ["Independence Day Code", "July Python"],
      "8": ["August Algorithm Month", "Summer Hackathon"],
      "9": ["Back to School Coding", "September Startup"],
      "10": ["October Hacktoberfest", "Halloween Code"],
      "11": ["November Node.js", "Thanksgiving Tech"],
      "12": ["December Debugging", "Holiday Code"]
    },
    CHANCE: 0.4 // 40% chance to use seasonal content when available
  },
  
  // Phase 3: Performance Optimization
  PERFORMANCE_OPTIMIZATION: {
    ENABLED: true,
    AUTO_ADJUST: true,         // Automatically adjust based on performance
    OPTIMIZATION_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    MIN_PERFORMANCE_THRESHOLD: 0.05, // 5% engagement rate minimum
    MAX_OPTIMIZATION_ATTEMPTS: 3
  }
}; 