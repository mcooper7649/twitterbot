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
const advancedAnalytics = require("./advanced-analytics");
const threadCreator = require("./thread-creator");
require("dotenv").config();

// Initialize analytics
analytics.initializeAnalytics();
advancedAnalytics.initializeAdvancedAnalytics();

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
  },
  AI: {
    name: "AI",
    prompts: [
      "Generate a compact AI/ML tip with code example. Focus on: model training, data preprocessing, or practical AI applications. Include code example.",
      "Create an AI optimization tip. Topics: model performance, deployment, or best practices. Include code example.",
      "Share an AI debugging or implementation tip. Include practical code example."
    ],
    hashtags: ["#AI", "#MachineLearning", "#DataScience", "#TechTwitter"]
  },
  FLUTTER: {
    name: "Flutter",
    prompts: [
      "Generate a compact Flutter tip with code example. Focus on: widgets, state management, or UI optimization. Include code example.",
      "Create a Flutter optimization tip. Topics: performance, app architecture, or best practices. Include code example.",
      "Share a Flutter debugging or development tip. Include practical code example."
    ],
    hashtags: ["#Flutter", "#MobileDev", "#Dart", "#AppDevelopment"]
  },
  SECURITY: {
    name: "Security",
    prompts: [
      "Generate a compact security tip with code example. Focus on: authentication, encryption, or secure coding practices. Include code example.",
      "Create a security optimization tip. Topics: vulnerability prevention, secure deployment, or best practices. Include code example.",
      "Share a security debugging or implementation tip. Include practical code example."
    ],
    hashtags: ["#Security", "#CyberSecurity", "#SecureCoding", "#TechTwitter"]
  }
};

// Create visual content (code snippet image)
async function createCodeImage(code, topic, detailedExample = null) {
  try {
    // Explicitly set canvas size
    const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    canvas.width = config.IMAGE.WIDTH;
    canvas.height = config.IMAGE.HEIGHT;
    
    const ctx = canvas.getContext("2d");
    
    // Wait a moment for fonts to load (if needed)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    
    // Header with branding
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText(`${topic.name} Tip`, 20, 30);
    
    // Branding
    ctx.fillStyle = "#00d4ff";
    ctx.font = "14px Arial";
    ctx.fillText("@dev_patterns", config.IMAGE.WIDTH - 120, 30);
    
    // Code background with border
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(20, 45, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 90);
    
    // Code border
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 45, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 90);
    
    // Code text with font fallback
    ctx.fillStyle = "#d4d4d4";
    ctx.font = "16px Arial, monospace";
    
    const lines = code.split('\n');
    const maxLines = config.IMAGE.MAX_CODE_LINES;
    const displayLines = lines.slice(0, maxLines);
    
    // Calculate available space for code with equal margins
    const codeStartY = 70; // 25px from top border (45 + 25)
    const codeEndY = detailedExample ? config.IMAGE.HEIGHT - 140 : config.IMAGE.HEIGHT - 50;
    
    displayLines.forEach((line, index) => {
      const y = codeStartY + (index * 20); // Increased line spacing
      if (y < codeEndY) {
        const truncatedLine = line.substring(0, config.IMAGE.MAX_LINE_LENGTH);
        // Clean the line for better rendering
        const cleanLine = truncatedLine
          .replace(/[^\x20-\x7E]/g, ' ') // Replace non-printable chars
          .replace(/`/g, "'") // Replace backticks
          .replace(/"/g, "'"); // Replace quotes
        ctx.fillText(cleanLine, 30, y);
      }
    });
    
    // Add detailed example if provided
    if (detailedExample && detailedExample.length > 0) {
      // Example title
      ctx.fillStyle = "#4a9eff";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Example Usage:", 30, codeEndY + 20);
      
      // Example code
      ctx.fillStyle = "#e6e6e6";
      ctx.font = "14px Arial, monospace";
      const exampleLines = detailedExample.split('\n');
      exampleLines.forEach((line, index) => {
        const y = codeEndY + 45 + (index * 18); // Increased line spacing
        if (y < config.IMAGE.HEIGHT - 50) { // Added 20px margin from bottom
          const truncatedLine = line.substring(0, config.IMAGE.MAX_LINE_LENGTH);
          // Clean the line for better rendering
          const cleanLine = truncatedLine
            .replace(/[^\x20-\x7E]/g, ' ') // Replace non-printable chars
            .replace(/`/g, "'") // Replace backticks
            .replace(/"/g, "'"); // Replace quotes
          ctx.fillText(cleanLine, 30, y);
        }
      });
    }
    
    // Footer with branding
    ctx.fillStyle = "#888888";
    ctx.font = "12px Arial";
    ctx.fillText("Follow @dev_patterns for more tips!", 20, config.IMAGE.HEIGHT - 15);
    
    // Ensure all drawing is complete before converting
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error("Error creating code image:", error);
    return null;
  }
}

// Generate a high-quality dev tip with topic rotation and A/B testing
async function generateProgrammingTip(maxRetries = config.OPENAI.MAX_RETRIES) {
  const topic = utils.getRandomTopic(TOPICS);
  utils.logTopicSelection(topic);
  
  // Get A/B test optimization
  const optimization = advancedAnalytics.optimizeContent(topic, "tips");
  const maxLength = optimization.maxLength;
  
  const prompt = topic.prompts[Math.floor(Math.random() * topic.prompts.length)];
  
  const messages = [
    {
      role: "user",
      content: `${prompt}
      
Requirements:
- Must be under ${maxLength} characters (leaving room for hashtags)
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

      if (tip && tip.length <= maxLength) {
        // Extract code from the tip
        const code = utils.extractCodeFromText(tip);
        
        // Generate detailed example for image
        const detailedExample = await generateDetailedExample(topic, code);
        
        // Create shorter tweet text (just the key point)
        const shortText = extractKeyPoint(tip);
        
        // Generate hashtags with optimization
        const hashtags = utils.generateHashtags(topic, tip).slice(0, optimization.hashtagCount);
        const hashtagString = hashtags.join(' ');
        
        const fullTweet = `${shortText} ${hashtagString}`;
        
        // Validate the tweet
        const validation = utils.validateTweetContent(fullTweet, code);
        if (validation.valid) {
          return {
            text: fullTweet,
            code: code,
            topic: topic,
            hashtags: hashtags,
            contentType: "tips",
            optimization: optimization,
            detailedExample: detailedExample
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
    contentType: "tips",
    optimization: optimization
  };
  
  console.warn("🚨 All retries failed. Using fallback tip.");
  return fallback;
}

// Generate detailed example for image
async function generateDetailedExample(topic, code) {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: config.OPENAI.MODEL,
        messages: [
          {
            role: "user",
            content: `Create a detailed practical example using this ${topic.name} code: "${code}"
            
            Requirements:
            - Show real-world usage
            - Include input/output examples
            - Keep it concise (max 4 lines)
            - Make it educational
            
            Format: Just the example code with comments`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const example = response.data?.choices?.[0]?.message?.content?.trim();
    return example || "";
  } catch (error) {
    console.error("Error generating detailed example:", error);
    return "";
  }
}

// Extract key point for shorter tweet
function extractKeyPoint(tip) {
  // Extract the main point (first sentence or key phrase)
  const sentences = tip.split(/[.!?]/);
  const keyPoint = sentences[0].trim();
  
  // If it's too long, take just the first part
  if (keyPoint.length > 100) {
    return keyPoint.substring(0, 100) + "...";
  }
  
  return keyPoint;
}

// Generate interactive content with trending topics
async function generateInteractiveContent(topic) {
  // Check if we should use trending topics
  const shouldUseTrending = Math.random() < 0.3; // 30% chance
  
  if (shouldUseTrending) {
    const trendingContent = advancedAnalytics.generateTrendingContent(topic);
    return {
      text: `${trendingContent.content} ${trendingContent.hashtags.join(' ')}`,
      code: "",
      topic: topic,
      hashtags: trendingContent.hashtags,
      contentType: "interactive",
      interactiveType: "trending",
      isTrending: trendingContent.isTrending,
      isSeasonal: trendingContent.isSeasonal
    };
  }
  
  const interactiveData = interactive.generateInteractiveContent(topic);
  
  // Extract code from interactive content if it exists
  let code = "";
  let detailedExample = "";
  
  if (interactiveData.type === "challenge") {
    code = utils.extractCodeFromText(interactiveData.content);
    if (code) {
      detailedExample = await generateDetailedExample(topic, code);
    }
  }
  
  return {
    text: `${interactiveData.content} ${interactiveData.hashtags.join(' ')}`,
    code: code,
    topic: topic,
    hashtags: interactiveData.hashtags,
    contentType: "interactive",
    interactiveType: interactiveData.type,
    options: interactiveData.options || null,
    detailedExample: detailedExample
  };
}

// Generate community content with seasonal awareness
async function generateCommunityContent(topic) {
  const seasonalEvents = advancedAnalytics.getSeasonalEvents();
  const shouldUseSeasonal = seasonalEvents.length > 0 && Math.random() < 0.4; // 40% chance if seasonal events exist
  
  if (shouldUseSeasonal) {
    const seasonalEvent = seasonalEvents[Math.floor(Math.random() * seasonalEvents.length)];
    return {
      text: `🎉 ${seasonalEvent} is here! What are you building with ${topic.name} this month? Share your projects below! 🚀 #${seasonalEvent.replace(/\s+/g, '')} #${topic.name} #DevCommunity`,
      code: "",
      topic: topic,
      hashtags: [`#${seasonalEvent.replace(/\s+/g, '')}`, `#${topic.name}`, "#DevCommunity"],
      contentType: "community",
      communityType: "seasonal",
      isSeasonal: true
    };
  }
  
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

// Generate trending content
async function generateTrendingContent(topic) {
  const trendingData = advancedAnalytics.generateTrendingContent(topic);
  
  return {
    text: `${trendingData.content} ${trendingData.hashtags.join(' ')}`,
    code: "",
    topic: topic,
    hashtags: trendingData.hashtags,
    contentType: "trending",
    isTrending: trendingData.isTrending,
    isSeasonal: trendingData.isSeasonal
  };
}

// Post tweet with media and wait for rate limit reset if needed
async function postWithRateLimitWait(tweetData) {
  try {
    let mediaId = null;
    
    // Create and upload image if we have code and images are enabled
    if (tweetData.code && tweetData.code.length > 0 && config.IMAGE.ENABLED) {
      try {
        const imageBuffer = await createCodeImage(tweetData.code, tweetData.topic, tweetData.detailedExample);
        if (imageBuffer && imageBuffer.length > 0) {
          // Ensure proper encoding for Twitter API
          const media = await client.v1.uploadMedia(imageBuffer, { 
            mimeType: 'image/png',
            target: 'tweet'
          });
          mediaId = media;
          console.log("📸 Image uploaded successfully");
        } else {
          console.warn("⚠️ Image buffer is empty, posting text only");
        }
      } catch (imageError) {
        console.warn("⚠️ Could not create image, posting text only:", imageError.message);
      }
    }
    
    // Post tweet with or without media
    const tweetOptions = mediaId ? { media: { media_ids: [mediaId] } } : {};
    await client.v2.tweet(tweetData.text, tweetOptions);
    
    utils.logTweetPosted(tweetData);
    
    // Track the post with advanced analytics
    analytics.trackPost(tweetData.topic, tweetData.contentType, tweetData.hashtags);
    
    // Track performance metrics
    const metrics = advancedAnalytics.simulateEngagementMetrics(
      tweetData.contentType, 
      tweetData.topic, 
      tweetData.hashtags
    );
    advancedAnalytics.trackPerformanceMetrics(
      tweetData.contentType, 
      tweetData.topic, 
      tweetData.hashtags, 
      metrics
    );
    
    // Track A/B tests if applicable
    if (tweetData.optimization) {
      advancedAnalytics.trackABTest(
        "Content Length Test", 
        tweetData.optimization.maxLength <= 150 ? "A" : tweetData.optimization.maxLength <= 180 ? "B" : "C",
        "engagement_rate",
        metrics.engagement_rate
      );
      
      advancedAnalytics.trackABTest(
        "Hashtag Count Test",
        tweetData.optimization.hashtagCount <= 3 ? "A" : tweetData.optimization.hashtagCount <= 4 ? "B" : "C",
        "reach",
        metrics.reach
      );
    }
    
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
        
        // Track performance metrics
        const metrics = advancedAnalytics.simulateEngagementMetrics(
          tweetData.contentType, 
          tweetData.topic, 
          tweetData.hashtags
        );
        advancedAnalytics.trackPerformanceMetrics(
          tweetData.contentType, 
          tweetData.topic, 
          tweetData.hashtags, 
          metrics
        );
        
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

// Main function with Phase 3 features
async function postProgrammingTip() {
  try {
    // Check analytics limits
    if (!analytics.shouldPostBasedOnAnalytics()) {
      return;
    }
    
    const recent = utils.loadRecentTweets();
    const topic = utils.getRandomTopic(TOPICS);
    
    // Check if we should create a thread (10% chance)
    if (threadCreator.shouldCreateThread()) {
      const thread = threadCreator.generateThread(topic);
      if (thread) {
        console.log("🧵 Creating thread instead of single tweet");
        await threadCreator.postThread(thread, client);
        return;
      }
    }
    
    // Decide content type based on probabilities with Phase 3 adjustments
    const contentType = decideContentType();
    let tweetData;
    
    switch (contentType) {
      case "trending":
        tweetData = await generateTrendingContent(topic);
        break;
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

// Decide content type based on probabilities with Phase 3 features
function decideContentType() {
  const rand = Math.random();
  
  // Phase 3 distribution: 55% tips, 20% interactive, 15% community, 10% trending
  if (rand < 0.55) {
    return "tips";
  } else if (rand < 0.75) {
    return "interactive";
  } else if (rand < 0.90) {
    return "community";
  } else {
    return "trending";
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
  
  // Generate performance reports
  analytics.generatePerformanceReport();
  advancedAnalytics.generateAdvancedPerformanceReport();
})();
