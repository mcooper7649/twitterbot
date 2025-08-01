const { TwitterApi } = require("twitter-api-v2");
const cron = require("node-cron");
const axios = require("axios");
const stringSimilarity = require("string-similarity");
const { createCanvas } = require("canvas");
const config = require("./config");
const utils = require("./utils");
const interactive = require("./interactive");
const community = require("./community");
const analytics = require("./analytics");
require("dotenv").config();

// Initialize analytics
analytics.initializeAnalytics();

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Topic rotation system
const TOPICS = {
  PYTHON: {
    name: "Python",
    prompts: [
      "Generate a compact Python tip with code example. Focus on: list comprehensions, decorators, context managers, or modern Python features. Include a short code snippet.",
      "Create a Python optimization tip. Topics: performance, memory usage, async programming, or best practices. Include code example.",
      "Share a Python debugging or testing tip. Include practical code example."
    ],
    hashtags: ["#Python", "#PythonDev", "#Coding", "#Programming"]
  },
  JAVASCRIPT: {
    name: "JavaScript",
    prompts: [
      "Generate a compact JavaScript tip with code example. Focus on: ES6+ features, async/await, functional programming, or modern JS patterns.",
      "Create a JavaScript optimization tip. Topics: performance, memory, DOM manipulation, or best practices. Include code example.",
      "Share a JavaScript debugging or testing tip. Include practical code example."
    ],
    hashtags: ["#JavaScript", "#JS", "#WebDev", "#Coding"]
  },
  REACT: {
    name: "React",
    prompts: [
      "Generate a compact React tip with code example. Focus on: hooks, performance, state management, or modern React patterns.",
      "Create a React optimization tip. Topics: rendering optimization, custom hooks, or best practices. Include code example.",
      "Share a React debugging or testing tip. Include practical code example."
    ],
    hashtags: ["#React", "#ReactJS", "#Frontend", "#WebDev"]
  },
  NODEJS: {
    name: "Node.js",
    prompts: [
      "Generate a compact Node.js tip with code example. Focus on: async programming, streams, performance, or best practices.",
      "Create a Node.js optimization tip. Topics: memory management, clustering, or debugging. Include code example.",
      "Share a Node.js security or deployment tip. Include practical code example."
    ],
    hashtags: ["#NodeJS", "#Node", "#Backend", "#JavaScript"]
  },
  DOCKER: {
    name: "Docker",
    prompts: [
      "Generate a compact Docker tip with code example. Focus on: Dockerfile optimization, multi-stage builds, or best practices.",
      "Create a Docker optimization tip. Topics: image size, security, or performance. Include code example.",
      "Share a Docker debugging or deployment tip. Include practical example."
    ],
    hashtags: ["#Docker", "#DevOps", "#Containers", "#Deployment"]
  },
  GIT: {
    name: "Git",
    prompts: [
      "Generate a compact Git tip with command example. Focus on: advanced commands, workflow optimization, or best practices.",
      "Create a Git optimization tip. Topics: branching strategies, commit messages, or collaboration. Include command example.",
      "Share a Git debugging or workflow tip. Include practical command example."
    ],
    hashtags: ["#Git", "#VersionControl", "#DevOps", "#Coding"]
  }
};

// Create visual content (code snippet image)
async function createCodeImage(code, topic) {
  try {
    const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    
    // Header - Use system fonts that are more likely to be available
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillText(`${topic.name} Tip`, 20, 40);
    
    // Code background
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(20, 60, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 80);
    
    // Code text - Use monospace font that's more reliable
    ctx.fillStyle = "#d4d4d4";
    ctx.font = "16px 'Courier New', monospace, Arial";
    
    const lines = code.split('\n');
    const maxLines = config.IMAGE.MAX_CODE_LINES;
    const displayLines = lines.slice(0, maxLines);
    
    displayLines.forEach((line, index) => {
      const y = 85 + (index * 20);
      if (y < config.IMAGE.HEIGHT - 30) {
        ctx.fillText(line.substring(0, config.IMAGE.MAX_LINE_LENGTH), 30, y);
      }
    });
    
    if (lines.length > maxLines) {
      ctx.fillStyle = "#888888";
      ctx.fillText("...", 30, 85 + (maxLines * 20));
    }
    
    // Footer
    ctx.fillStyle = "#888888";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("Follow for more dev tips! 👨‍💻", 20, config.IMAGE.HEIGHT - 20);
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error("Error creating code image:", error);
    // Return null if image creation fails, bot will post text-only
    return null;
  }
}

// Generate a high-quality dev tip with topic rotation
async function generateProgrammingTip(maxRetries = config.OPENAI.MAX_RETRIES) {
  const topic = utils.getRandomTopic(TOPICS);
  utils.logTopicSelection(topic);
  
  const prompt = topic.prompts[Math.floor(Math.random() * topic.prompts.length)];
  
  const messages = [
    {
      role: "user",
      content: `${prompt}
      
Requirements:
- Must be under ${config.MAX_CONTENT_LENGTH} characters (leaving room for hashtags)
- Include a practical code example
- Make it engaging and actionable
- Focus on ${topic.name} specifically
- Be concise but informative
- Keep the explanation brief - focus on the code example

Format: Brief explanation + code example
Example: "Use list comprehensions for cleaner code: numbers = [x*2 for x in range(10)]"`
    },
  ];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: config.OPENAI.MODEL,
          messages,
          max_tokens: config.OPENAI.MAX_TOKENS,
          temperature: config.OPENAI.TEMPERATURE,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tip = response.data?.choices?.[0]?.message?.content?.trim();
      utils.logTweetGeneration(attempt + 1, topic, tip?.length || 0);

      if (tip && tip.length <= config.MAX_CONTENT_LENGTH) {
        // Extract code from the tip
        const code = utils.extractCodeFromText(tip);
        
        // Generate hashtags
        const hashtags = utils.generateHashtags(topic, tip);
        const hashtagString = hashtags.join(' ');
        
        const fullTweet = `${tip} ${hashtagString}`;
        
        // Validate the tweet
        const validation = utils.validateTweetContent(fullTweet, code);
        if (validation.valid) {
          return {
            text: fullTweet,
            code: code,
            topic: topic,
            hashtags: hashtags,
            contentType: "tips"
          };
        } else {
          console.warn(`⚠️ Validation failed: ${validation.reason}`);
        }
      }

      console.warn("⚠️ Tip too long. Retrying...");
    } catch (err) {
      utils.logError("OpenAI API", err);
    }
  }

  // Fallback
  const fallback = {
    text: `// Python tip: Use list comprehensions\nnumbers = [x*2 for x in range(10)] #Python #Coding #Programming`,
    code: "numbers = [x*2 for x in range(10)]",
    topic: TOPICS.PYTHON,
    hashtags: ["#Python", "#Coding", "#Programming"],
    contentType: "tips"
  };
  
  console.warn("🚨 All retries failed. Using fallback tip.");
  return fallback;
}

// Generate interactive content
async function generateInteractiveContent(topic) {
  const interactiveData = interactive.generateInteractiveContent(topic);
  
  return {
    text: `${interactiveData.content} ${interactiveData.hashtags.join(' ')}`,
    code: "",
    topic: topic,
    hashtags: interactiveData.hashtags,
    contentType: "interactive",
    interactiveType: interactiveData.type,
    options: interactiveData.options || null
  };
}

// Generate community content
async function generateCommunityContent(topic) {
  const communityData = community.generateCommunityContent(topic);
  
  return {
    text: `${communityData.content} ${communityData.hashtags.join(' ')}`,
    code: "",
    topic: topic,
    hashtags: communityData.hashtags,
    contentType: "community",
    communityType: communityData.type
  };
}

// Post tweet with media and wait for rate limit reset if needed
async function postWithRateLimitWait(tweetData) {
  try {
    let mediaId = null;
    
    // Create and upload image if we have code
    if (tweetData.code && tweetData.code.length > 0) {
      try {
        const imageBuffer = await createCodeImage(tweetData.code, tweetData.topic);
        if (imageBuffer) {
          const media = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });
          mediaId = media;
          console.log("📸 Image uploaded successfully");
        }
      } catch (imageError) {
        console.warn("⚠️ Could not create image, posting text only:", imageError.message);
      }
    }
    
    // Post tweet with or without media
    const tweetOptions = mediaId ? { media: { media_ids: [mediaId] } } : {};
    await client.v2.tweet(tweetData.text, tweetOptions);
    
    utils.logTweetPosted(tweetData);
    
    // Track the post
    analytics.trackPost(tweetData.topic, tweetData.contentType, tweetData.hashtags);
    
  } catch (err) {
    const isRateLimit = err.code === 429 || err.response?.status === 429;

    if (isRateLimit && err.response?.headers) {
      const resetUnix =
        parseInt(err.response.headers["x-rate-limit-reset"], 10) * 1000;
      const now = Date.now();
      const waitTime = resetUnix - now;

      if (waitTime > 0) {
        const resetTime = new Date(resetUnix).toLocaleTimeString();
        console.warn(
          `⏳ Rate limited. Waiting until ${resetTime} (${Math.ceil(
            waitTime / 1000
          )}s)...`
        );
        await new Promise((res) => setTimeout(res, waitTime + 1000));
      }

      try {
        let mediaId = null;
        if (tweetData.code && tweetData.code.length > 0) {
          try {
            const imageBuffer = await createCodeImage(tweetData.code, tweetData.topic);
            if (imageBuffer) {
              const media = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });
              mediaId = media;
            }
          } catch (imageError) {
            console.warn("⚠️ Could not create image on retry");
          }
        }
        
        const tweetOptions = mediaId ? { media: { media_ids: [mediaId] } } : {};
        await client.v2.tweet(tweetData.text, tweetOptions);
        utils.logTweetPosted(tweetData);
        
        // Track the post
        analytics.trackPost(tweetData.topic, tweetData.contentType, tweetData.hashtags);
        
      } catch (retryErr) {
        utils.logError("Retry after rate limit", retryErr);
        throw retryErr;
      }
    } else {
      utils.logError("Twitter API", err);
      throw err;
    }
  }
}

// Main function
async function postProgrammingTip() {
  try {
    // Check analytics limits
    if (!analytics.shouldPostBasedOnAnalytics()) {
      return;
    }
    
    const recent = utils.loadRecentTweets();
    const topic = utils.getRandomTopic(TOPICS);
    
    // Decide content type based on probabilities
    const contentType = decideContentType();
    let tweetData;
    
    switch (contentType) {
      case "interactive":
        tweetData = await generateInteractiveContent(topic);
        break;
      case "community":
        tweetData = await generateCommunityContent(topic);
        break;
      default:
        tweetData = await generateProgrammingTip();
        break;
    }

    if (!tweetData || !tweetData.text) {
      throw new Error("Generated content is empty — skipping tweet.");
    }

    // Check for exact duplicate
    if (recent.includes(tweetData.text)) {
      console.warn("⚠️ Duplicate content detected. Skipping post.");
      return;
    }

    // Check for near-duplicate (similarity > threshold)
    const isSimilar = recent.some(
      (prev) =>
        stringSimilarity.compareTwoStrings(tweetData.text, prev) > config.SIMILARITY_THRESHOLD
    );
    if (isSimilar) {
      console.warn(
        `⚠️ Near-duplicate content detected (similarity > ${config.SIMILARITY_THRESHOLD * 100}%). Skipping post.`
      );
      return;
    }

    await postWithRateLimitWait(tweetData);
    recent.push(tweetData.text);
    utils.saveRecentTweets(recent);
    
  } catch (err) {
    utils.logError("Posting tweet", err);
  }
}

// Decide content type based on probabilities
function decideContentType() {
  const rand = Math.random();
  
  // 65% tips, 20% interactive, 15% community
  if (rand < 0.65) {
    return "tips";
  } else if (rand < 0.85) {
    return "interactive";
  } else {
    return "community";
  }
}

// Schedule to run based on config
cron.schedule(config.SCHEDULE, () => {
  console.log("🕒 Scheduled post triggered");
  postProgrammingTip();
});

// Run immediately for testing
(async () => {
  console.log("🔁 Running test post...");
  await postProgrammingTip();
  
  // Generate performance report
  analytics.generatePerformanceReport();
})();
