const fs = require("fs");
const path = require("path");
const config = require("./config");

// File operations
function loadRecentTweets() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "recent_tweets.json"), "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveRecentTweets(tweets) {
  fs.writeFileSync(
    path.join(__dirname, "recent_tweets.json"),
    JSON.stringify(tweets.slice(-config.MAX_RECENT_TWEETS), null, 2)
  );
}

// Topic selection with weighted rotation
function getRandomTopic(TOPICS) {
  const topicKeys = Object.keys(TOPICS);
  const weights = Object.values(config.TOPIC_WEIGHTS);
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return TOPICS[topicKeys[i]];
    }
  }
  return TOPICS.PYTHON; // fallback
}

// Hashtag generation
function generateHashtags(topic, content) {
  const baseHashtags = topic.hashtags;
  const contentHashtags = [];
  
  // Extract relevant hashtags from content
  const contentLower = content.toLowerCase();
  const hashtagMap = {
    "react": "#React",
    "python": "#Python", 
    "javascript": "#JavaScript",
    "docker": "#Docker",
    "git": "#Git",
    "async": "#AsyncProgramming",
    "performance": "#Performance",
    "debug": "#Debugging",
    "testing": "#Testing",
    "security": "#Security",
    "deployment": "#Deployment",
    "optimization": "#Optimization"
  };
  
  Object.entries(hashtagMap).forEach(([keyword, hashtag]) => {
    if (contentLower.includes(keyword)) {
      contentHashtags.push(hashtag);
    }
  });
  
  // Add some trending hashtags
  const shuffled = config.TRENDING_HASHTAGS.sort(() => 0.5 - Math.random());
  const trendingHashtags = shuffled.slice(0, 2);
  
  const allHashtags = [...new Set([...baseHashtags, ...contentHashtags, ...trendingHashtags])];
  return allHashtags.slice(0, config.MAX_HASHTAGS_PER_TWEET);
}

// Code extraction from text
function extractCodeFromText(text) {
  const codeMatch = text.match(/```[\s\S]*?```|`[^`]+`/);
  return codeMatch ? codeMatch[0].replace(/```/g, '').replace(/`/g, '') : '';
}

// Content validation
function validateTweetContent(text, code) {
  if (!text || text.length === 0) {
    return { valid: false, reason: "Empty content" };
  }
  
  if (text.length > config.MAX_TWEET_LENGTH) {
    return { valid: false, reason: `Tweet too long (${text.length}/${config.MAX_TWEET_LENGTH})` };
  }
  
  // Allow a bit more flexibility for content length
  const maxContentLength = config.MAX_CONTENT_LENGTH + 20; // Allow 20 extra chars
  if (text.length > maxContentLength) {
    return { valid: false, reason: `Content too long for hashtags (${text.length}/${maxContentLength})` };
  }
  
  return { valid: true };
}

// Logging utilities
function logTopicSelection(topic) {
  console.log(`🎯 Selected topic: ${topic.name}`);
}

function logTweetGeneration(attempt, topic, length) {
  console.log(`💡 ${topic.name} Attempt ${attempt}: ${length} chars`);
}

function logTweetPosted(tweetData) {
  console.log(`✅ Tweet posted: ${tweetData.text.substring(0, 50)}...`);
  console.log(`🎯 Posted ${tweetData.topic.name} tip with ${tweetData.hashtags.length} hashtags`);
}

function logError(context, error) {
  console.error(`❌ ${context}:`, error.message || error);
}

module.exports = {
  loadRecentTweets,
  saveRecentTweets,
  getRandomTopic,
  generateHashtags,
  extractCodeFromText,
  validateTweetContent,
  logTopicSelection,
  logTweetGeneration,
  logTweetPosted,
  logError
}; 