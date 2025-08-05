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
const trendingAnalyzer = require("./trending-analyzer");
require("dotenv").config();

// Handle fontconfig errors by setting environment variables
process.env.FONTCONFIG_PATH = '/etc/fonts';
process.env.FONTCONFIG_FILE = '/etc/fonts/fonts.conf';

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
      "Generate an advanced Python tip for senior developers. Focus on: metaprogramming, advanced decorators, context managers, type hints, or performance optimization. Include sophisticated code example.",
      "Create a Python architecture tip. Topics: dependency injection, SOLID principles, design patterns, or system design. Include enterprise-level code example.",
      "Share a Python debugging tip for complex systems. Include advanced debugging techniques, profiling, or performance analysis."
    ],
    hashtags: ["#Python", "#SeniorDev", "#Architecture", "#Performance"]
  },
  JAVASCRIPT: {
    name: "JavaScript",
    prompts: [
      "Generate an advanced JavaScript tip for senior developers. Focus on: advanced async patterns, functional programming, metaprogramming, or performance optimization. Include sophisticated code example.",
      "Create a JavaScript architecture tip. Topics: microservices, event-driven architecture, design patterns, or system design. Include enterprise-level code example.",
      "Share a JavaScript debugging tip for complex applications. Include advanced debugging, profiling, or performance analysis."
    ],
    hashtags: ["#JavaScript", "#SeniorDev", "#Architecture", "#Performance"]
  },
  REACT: {
    name: "React",
    prompts: [
      "Generate an advanced React tip for senior developers. Focus on: advanced hooks, performance optimization, state management patterns, or complex component architecture. Include sophisticated code example.",
      "Create a React architecture tip. Topics: micro-frontends, design patterns, state machines, or system design. Include enterprise-level code example.",
      "Share a React debugging tip for complex applications. Include advanced debugging, profiling, or performance analysis."
    ],
    hashtags: ["#React", "#SeniorDev", "#Architecture", "#Performance"]
  },
  NODEJS: {
    name: "Node.js",
    prompts: [
      "Generate an advanced Node.js tip for senior developers. Focus on: advanced async patterns, performance optimization, memory management, or system architecture. Include sophisticated code example.",
      "Create a Node.js architecture tip. Topics: microservices, event-driven architecture, design patterns, or system design. Include enterprise-level code example.",
      "Share a Node.js debugging tip for complex applications. Include advanced debugging, profiling, or performance analysis."
    ],
    hashtags: ["#NodeJS", "#SeniorDev", "#Architecture", "#Performance"]
  },
  DOCKER: {
    name: "Docker",
    prompts: [
      "Generate an advanced Docker tip for senior developers. Focus on: advanced Dockerfile patterns, multi-stage builds, security hardening, or performance optimization. Include sophisticated code example.",
      "Create a Docker architecture tip. Topics: container orchestration, microservices, design patterns, or system design. Include enterprise-level code example.",
      "Share a Docker debugging tip for complex applications. Include advanced debugging, profiling, or performance analysis."
    ],
    hashtags: ["#Docker", "#SeniorDev", "#Architecture", "#DevOps"]
  },
  GIT: {
    name: "Git",
    prompts: [
      "Generate an advanced Git tip for senior developers. Focus on: advanced Git workflows, branching strategies, or enterprise practices. Include sophisticated command example.",
      "Create a Git architecture tip. Topics: monorepo strategies, CI/CD integration, or team collaboration. Include enterprise-level command example.",
      "Share a Git debugging tip for complex workflows. Include advanced debugging, troubleshooting, or performance analysis."
    ],
    hashtags: ["#Git", "#SeniorDev", "#Architecture", "#DevOps"]
  },
  AI: {
    name: "AI",
    prompts: [
      "Generate an advanced AI/ML tip for senior developers. Focus on: advanced model architectures, production deployment, or performance optimization. Include sophisticated code example.",
      "Create an AI architecture tip. Topics: MLOps, system design, or enterprise AI patterns. Include enterprise-level code example.",
      "Share an AI debugging tip for complex models. Include advanced debugging, profiling, or performance analysis."
    ],
    hashtags: ["#AI", "#SeniorDev", "#MLOps", "#Architecture"]
  },
  FLUTTER: {
    name: "Flutter",
    prompts: [
      "Generate an advanced Flutter tip for senior developers. Focus on: advanced state management, performance optimization, or complex UI patterns. Include sophisticated code example.",
      "Create a Flutter architecture tip. Topics: clean architecture, design patterns, or system design. Include enterprise-level code example.",
      "Share a Flutter debugging tip for complex applications. Include advanced debugging, profiling, or performance analysis."
    ],
    hashtags: ["#Flutter", "#SeniorDev", "#Architecture", "#MobileDev"]
  },
  SECURITY: {
    name: "Security",
    prompts: [
      "Generate an advanced security tip for senior developers. Focus on: advanced authentication patterns, encryption algorithms, or enterprise security. Include sophisticated code example.",
      "Create a security architecture tip. Topics: zero-trust architecture, security patterns, or system design. Include enterprise-level code example.",
      "Share a security debugging tip for complex systems. Include advanced debugging, threat analysis, or security testing."
    ],
    hashtags: ["#Security", "#SeniorDev", "#Architecture", "#CyberSecurity"]
  }
};

// Create aesthetic text image for non-code posts
async function createAestheticTextImage(text, contentType = "text") {
  try {
    const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    canvas.width = config.IMAGE.WIDTH;
    canvas.height = config.IMAGE.HEIGHT;
    
    const ctx = canvas.getContext("2d");
    
    // Test font availability
    ctx.font = getReliableFont(24, 'bold');
    const testText = "Test";
    const testMetrics = ctx.measureText(testText);
    
    // If font rendering fails, use a simpler font
    if (testMetrics.width === 0) {
      console.warn("⚠️ Font rendering issue detected, using fallback fonts");
      // Try different font options
      const fontOptions = [
        "24px sans-serif",
        "24px Arial",
        "24px Helvetica",
        "24px system-ui"
      ];
      
      for (const font of fontOptions) {
        ctx.font = font;
        const metrics = ctx.measureText(testText);
        if (metrics.width > 0) {
          console.log(`✅ Using font: ${font}`);
          break;
        }
      }
    }
    
    // Wait a moment for fonts to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create dynamic gradient backgrounds based on content type
    let gradient;
    const gradientDirection = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    
    if (contentType === "poll") {
      // Darker blue gradient for polls with better contrast
      if (gradientDirection === 'horizontal') {
        gradient = ctx.createLinearGradient(0, 0, config.IMAGE.WIDTH, 0);
      } else {
        gradient = ctx.createLinearGradient(0, 0, 0, config.IMAGE.HEIGHT);
      }
      gradient.addColorStop(0, "#1976d2"); // Darker blue
      gradient.addColorStop(0.5, "#42a5f5"); // Medium blue
      gradient.addColorStop(1, "#1976d2"); // Darker blue
    } else {
      // Dynamic gradient for normal text posts
      const colors = [
        ["#f3e5f5", "#e1bee7", "#ce93d8"], // Purple theme
        ["#e8f5e8", "#c8e6c9", "#a5d6a7"], // Green theme
        ["#fff3e0", "#ffe0b2", "#ffcc80"], // Orange theme
        ["#e3f2fd", "#bbdefb", "#90caf9"], // Light blue theme
        ["#fce4ec", "#f8bbd9", "#f48fb1"]  // Pink theme
      ];
      const colorTheme = colors[Math.floor(Math.random() * colors.length)];
      
      if (gradientDirection === 'horizontal') {
        gradient = ctx.createLinearGradient(0, 0, config.IMAGE.WIDTH, 0);
      } else {
        gradient = ctx.createLinearGradient(0, 0, 0, config.IMAGE.HEIGHT);
      }
      gradient.addColorStop(0, colorTheme[0]);
      gradient.addColorStop(0.5, colorTheme[1]);
      gradient.addColorStop(1, colorTheme[2]);
    }
    
    // Fill background with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    
    // Add subtle overlay for better text readability
    const overlay = ctx.createLinearGradient(0, 0, 0, config.IMAGE.HEIGHT);
    overlay.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    overlay.addColorStop(1, "rgba(255, 255, 255, 0.05)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    
    // Set text color based on content type
    if (contentType === "poll") {
      ctx.fillStyle = "#ffffff"; // WHITE text for polls
    } else {
      ctx.fillStyle = "#000000"; // Black text for normal posts
    }
    
    // Clean the text (remove hashtags for cleaner look)
    const cleanText = sanitizeForTwitter(text.replace(/#\w+/g, '').trim());
    
    // Split text into lines that fit the canvas width
    const maxWidth = config.IMAGE.WIDTH - 80; // 40px margin on each side
    const words = cleanText.split(' ');
    const lines = [];
    let currentLine = '';
    
    // Use Twitter-friendly monospace font with better fallbacks
    ctx.font = getReliableFont(24, 'bold');
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Center the text vertically and horizontally
    const lineHeight = 32;
    const totalHeight = lines.length * lineHeight;
    const startY = (config.IMAGE.HEIGHT - totalHeight) / 2;
    
    // Render text with emoji support
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight) + 24; // +24 for font baseline
      
      // Split line into text and emoji parts
      const parts = line.split(/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);
      
      let currentX = (config.IMAGE.WIDTH - ctx.measureText(line).width) / 2;
      
      parts.forEach(part => {
        if (part.trim() === '') return;
        
        // Check if this part is an emoji
        const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(part);
        
        if (isEmoji) {
          // For emojis, use a larger font and different color to make them stand out
          ctx.font = getReliableFont(32, 'bold');
          
          // Use a contrasting color for emojis based on content type
          if (contentType === "poll") {
            ctx.fillStyle = "#ffd700"; // Gold for polls
          } else {
            ctx.fillStyle = "#ff6b35"; // Orange for normal posts
          }
        } else {
          // For regular text, use the standard font and color
          ctx.font = getReliableFont(24, 'bold');
          ctx.fillStyle = contentType === "poll" ? "#ffffff" : "#000000";
        }
        
        // Sanitize the part for Twitter compatibility
        const sanitizedPart = sanitizeForTwitter(part);
        if (sanitizedPart.trim() !== '') {
          ctx.fillText(sanitizedPart, currentX, y);
          currentX += ctx.measureText(sanitizedPart).width;
        }
      });
    });
    
    // Add subtle branding at bottom with Twitter-friendly monospace font
    ctx.fillStyle = contentType === "poll" ? "#ffffff" : "#666666";
    ctx.font = "14px 'DejaVu Sans Mono', 'Courier New', monospace";
    ctx.fillText("@dev_patterns", 20, config.IMAGE.HEIGHT - 20);
    
    // Ensure all drawing is complete before converting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert to buffer with Twitter-optimized settings
    const buffer = canvas.toBuffer('image/png', {
      compressionLevel: 9, // Maximum compression for smaller file size
      filters: canvas.PNG_FILTER_NONE,
      resolution: 72, // Standard web resolution
      background: gradient ? undefined : '#ffffff' // Use gradient or solid background
    });
    
    return buffer;
  } catch (error) {
    console.error("Error creating aesthetic text image:", error);
    return null;
  }
}

// Create visual content (code snippet image)
async function createCodeImage(code, topic, detailedExample = null) {
  try {
    // Explicitly set canvas size
    const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    canvas.width = config.IMAGE.WIDTH;
    canvas.height = config.IMAGE.HEIGHT;
    
    const ctx = canvas.getContext("2d");
    
    // Test font availability with a simple text render
    ctx.font = getReliableFont(16);
    const testText = "Test";
    const testMetrics = ctx.measureText(testText);
    
    // If font rendering fails (width is 0), use a simpler font
    if (testMetrics.width === 0) {
      console.warn("⚠️ Font rendering issue detected, using fallback fonts");
      // Try different font options
      const fontOptions = [
        "16px sans-serif",
        "16px Arial",
        "16px Helvetica",
        "16px system-ui"
      ];
      
      for (const font of fontOptions) {
        ctx.font = font;
        const metrics = ctx.measureText(testText);
        if (metrics.width > 0) {
          console.log(`✅ Using font: ${font}`);
          break;
        }
      }
    }
    
    // Wait a moment for fonts to load (if needed)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    
    // Header with branding
    ctx.fillStyle = "#ffffff";
    ctx.font = getReliableFont(20, 'bold');
    ctx.fillText(sanitizeForTwitter(`${topic.name} Tip`), 20, 30);
    
    // Branding
    ctx.fillStyle = "#00d4ff";
    ctx.font = getReliableFont(14);
    ctx.fillText(sanitizeForTwitter("@dev_patterns"), config.IMAGE.WIDTH - 120, 30);
    
    // Code background with border
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(20, 45, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 90);
    
    // Code border
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 45, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 90);
    
    // Code text with reliable monospace font
    ctx.fillStyle = "#d4d4d4";
    ctx.font = getReliableFont(16, 'normal');
    
    const lines = code.split('\n');
    const maxLines = config.IMAGE.MAX_CODE_LINES;
    const displayLines = lines.slice(0, maxLines);
    
    // Calculate available space for code with equal margins
    const codeStartY = 70; // 25px from top border (45 + 25)
    const codeEndY = detailedExample ? config.IMAGE.HEIGHT - 160 : config.IMAGE.HEIGHT - 50;
    
    displayLines.forEach((line, index) => {
      const y = codeStartY + (index * 18); // Slightly tighter spacing for more content
      if (y < codeEndY) {
        const truncatedLine = line.substring(0, config.IMAGE.MAX_LINE_LENGTH);
        // Clean the line for better rendering and Twitter compatibility
        const cleanLine = truncatedLine
          .replace(/[^\x20-\x7E]/g, ' ') // Replace non-printable chars
          .replace(/`/g, "'") // Replace backticks
          .replace(/"/g, "'") // Replace quotes
          .replace(/[^\w\s\-_.,;:(){}[\]=+<>!@#$%^&*|\\/]/g, ' ') // Replace any other problematic chars
          .replace(/[^\x20-\x7E]/g, ' ') // Double-check for any remaining non-ASCII
          .trim(); // Remove leading/trailing whitespace
        ctx.fillText(sanitizeForTwitter(cleanLine), 30, y);
      }
    });
    
    // Add detailed example if provided
    if (detailedExample && detailedExample.length > 0) {
      // Example title
      ctx.fillStyle = "#4a9eff";
      ctx.font = getReliableFont(16, 'bold');
      ctx.fillText(sanitizeForTwitter("Advanced Implementation:"), 30, codeEndY + 20);
      
      // Example code
      ctx.fillStyle = "#e6e6e6";
      ctx.font = getReliableFont(13, 'normal');
      const exampleLines = detailedExample.split('\n');
      exampleLines.forEach((line, index) => {
        const y = codeEndY + 45 + (index * 16); // Tighter spacing for more content
        if (y < config.IMAGE.HEIGHT - 50) { // Added 20px margin from bottom
          const truncatedLine = line.substring(0, config.IMAGE.MAX_LINE_LENGTH);
          // Clean the line for better rendering and Twitter compatibility
          const cleanLine = truncatedLine
            .replace(/[^\x20-\x7E]/g, ' ') // Replace non-printable chars
            .replace(/`/g, "'") // Replace backticks
            .replace(/"/g, "'") // Replace quotes
            .replace(/[^\w\s\-_.,;:(){}[\]=+<>!@#$%^&*|\\/]/g, ' ') // Replace any other problematic chars
            .replace(/[^\x20-\x7E]/g, ' ') // Double-check for any remaining non-ASCII
            .trim(); // Remove leading/trailing whitespace
          ctx.fillText(sanitizeForTwitter(cleanLine), 30, y);
        }
      });
    }
    
    // Footer with branding
    ctx.fillStyle = "#888888";
    ctx.font = getReliableFont(12, 'normal');
    ctx.fillText(sanitizeForTwitter("Follow @dev_patterns for more tips!"), 20, config.IMAGE.HEIGHT - 15);
    
    // Ensure all drawing is complete before converting
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Convert to buffer with Twitter-optimized settings
    const buffer = canvas.toBuffer('image/png', {
      compressionLevel: 9, // Maximum compression for smaller file size
      filters: canvas.PNG_FILTER_NONE,
      resolution: 72, // Standard web resolution
      background: '#1e1e1e' // Ensure background is solid
    });
    
    return buffer;
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
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Adjust prompt based on previous failures
      let adjustedPrompt = prompt;
      if (attempt > 0) {
        adjustedPrompt = `${prompt}
        
IMPORTANT: Previous attempts were too long. Make this MUCH shorter:
- Keep under ${Math.floor(maxLength * 0.8)} characters
- Use only 1 line of code maximum
- Be extremely concise`;
      }
      
      const messages = [
        {
          role: "user",
          content: `${adjustedPrompt}
          
Requirements:
- Must be under ${maxLength} characters (STRICT LIMIT - including code)
- Include a BRIEF code example (1-2 lines max)
- Make it concise but insightful
- Focus on ${topic.name} specifically
- Target experienced developers
- Keep it short and punchy

Format: Brief tip + short code example
Example: "Use list comprehensions for cleaner code: [x*2 for x in range(10)]"`
        },
      ];

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

      // Early validation - if tip is way too long, skip processing
      if (tip && tip.length > maxLength * 1.2) {
        console.warn(`⚠️ Tip way too long (${tip.length} chars). Retrying...`);
        continue;
      }

      if (tip && tip.length <= maxLength) {
        // Extract code from the tip
        const code = utils.extractCodeFromText(tip);
        
        // Generate detailed example for image (if enabled)
        let detailedExample = null;
        if (config.OPENAI.GENERATE_DETAILED_EXAMPLES) {
          detailedExample = await generateDetailedExample(topic, code);
        }
        
        // Create simple tweet text that references the detailed image
        const tweetText = `How to ${topic.name.toLowerCase()}: Advanced patterns for senior developers`;
        
        // Generate hashtags with optimization
        const hashtags = utils.generateHashtags(topic, tip).slice(0, optimization.hashtagCount);
        const hashtagString = hashtags.join(' ');
        
        const fullTweet = `${tweetText} ${hashtagString}`;
        
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

  // Fallback with more variety
  const fallbacks = [
    {
      text: `// ${topic.name} tip: Use list comprehensions\nnumbers = [x*2 for x in range(10)] #${topic.name} #Coding #Programming`,
      code: "numbers = [x*2 for x in range(10)]",
      hashtags: [`#${topic.name}`, "#Coding", "#Programming"]
    },
    {
      text: `// ${topic.name} best practice\nresult = [item for item in data if condition] #${topic.name} #DevTips #Code`,
      code: "result = [item for item in data if condition]",
      hashtags: [`#${topic.name}`, "#DevTips", "#Code"]
    },
    {
      text: `// ${topic.name} optimization\nfiltered = list(filter(lambda x: x > 0, data)) #${topic.name} #Optimization #Tech`,
      code: "filtered = list(filter(lambda x: x > 0, data))",
      hashtags: [`#${topic.name}`, "#Optimization", "#Tech"]
    }
  ];
  
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  fallback.topic = topic;
  fallback.contentType = "tips";
  fallback.optimization = optimization;
  
  console.warn("🚨 All retries failed. Using fallback tip.");
  return fallback;
}

// Ensure text is Twitter-compatible (ASCII only)
function sanitizeForTwitter(text) {
  return text
    .replace(/[^\x20-\x7E]/g, ' ') // Replace all non-ASCII with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Get reliable font stack that works without fontconfig
function getReliableFont(size, weight = 'normal') {
  try {
    // Use only system fonts that don't require fontconfig
    const fonts = [
      `${weight} ${size}px system-ui`,
      `${weight} ${size}px sans-serif`,
      `${weight} ${size}px Arial`,
      `${weight} ${size}px Helvetica`,
      `${weight} ${size}px monospace`
    ];
    return fonts.join(', ');
  } catch (error) {
    console.warn("⚠️ Font configuration error, using fallback:", error.message);
    return `${weight} ${size}px sans-serif`;
  }
}

// Generate comprehensive advanced example for image
async function generateDetailedExample(topic, code) {
  try {
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, config.OPENAI.DETAILED_EXAMPLE_DELAY));
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: config.OPENAI.MODEL,
        messages: [
          {
            role: "user",
            content: `Based on this ${topic.name} tip: "${code}", create a comprehensive, advanced example for senior developers.

            Requirements:
            - Expand the simple tip into a complete, production-ready example
            - Include advanced patterns and best practices
            - Show enterprise-level architecture
            - Include error handling, validation, and edge cases
            - Make it 15-20 lines of sophisticated code
            - Target senior/staff level developers
            - Include comments explaining the advanced concepts
            
            Format: Complete, sophisticated code example with detailed comments
            Base your example on the tip provided above.`
          }
        ],
        max_tokens: 400, // Increased for more detailed examples
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
    // Return a fallback detailed example based on the topic
    return generateFallbackDetailedExample(topic, code);
  }
}

// Generate fallback detailed example when API fails
function generateFallbackDetailedExample(topic, code) {
  const fallbackExamples = {
    PYTHON: {
      "list comprehension": `# Advanced List Comprehension with Error Handling
from typing import List, Optional
import logging

def process_data_safely(data: List[Optional[int]]) -> List[int]:
    """Advanced list comprehension with error handling and logging."""
    try:
        # Filter out None values and apply transformation
        processed = [
            x * 2 for x in data 
            if x is not None and isinstance(x, (int, float))
        ]
        logging.info(f"Processed {len(processed)} items successfully")
        return processed
    except Exception as e:
        logging.error(f"Error processing data: {e}")
        return []

# Usage example
data = [1, None, 3, "invalid", 5]
result = process_data_safely(data)  # [2, 6, 10]`
    },
    JAVASCRIPT: {
      "async": `// Advanced Async Pattern with Error Boundaries
class AsyncProcessor {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async processWithRetry(data) {
        try {
            const result = await this.processData(data);
            return { success: true, data: result };
        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.warn(\`Retry \${this.retryCount}/\${this.maxRetries}\`);
                return this.processWithRetry(data);
            }
            throw new Error(\`Failed after \${this.maxRetries} retries\`);
        }
    }

    async processData(data) {
        // Simulate async processing
        return new Promise((resolve) => {
            setTimeout(() => resolve(data.map(x => x * 2)), 100);
        });
    }
}`
    },
    REACT: {
      "hooks": `// Advanced React Hook with Performance Optimization
import React, { useState, useEffect, useCallback, useMemo } from 'react';

const useAdvancedDataProcessor = (initialData) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Memoized expensive computation
    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            processed: item.value * 2,
            timestamp: new Date().toISOString()
        }));
    }, [data]);

    // Optimized callback to prevent unnecessary re-renders
    const updateData = useCallback(async (newData) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                body: JSON.stringify(newData)
            });
            
            if (!response.ok) throw new Error('Processing failed');
            
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data: processedData, loading, error, updateData };
};`
    }
  };

  // Find the best matching fallback example
  const topicExamples = fallbackExamples[topic.name.toUpperCase()] || fallbackExamples.PYTHON;
  const codeLower = code.toLowerCase();
  
  for (const [key, example] of Object.entries(topicExamples)) {
    if (codeLower.includes(key)) {
      return example;
    }
  }
  
  // Default fallback
  return topicExamples[Object.keys(topicExamples)[0]] || fallbackExamples.PYTHON["list comprehension"];
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

// Generate trending content that ties into current hot topics
async function generateTrendingContent() {
  try {
    console.log("🔍 Analyzing trending content...");
    
    const analysis = await trendingAnalyzer.analyzeTrendingContent(client);
    
    if (!analysis || analysis.contentSuggestions.length === 0) {
      console.log("No trending content suggestions available");
      return null;
    }
    
    // Select a random trending suggestion
    const suggestion = analysis.contentSuggestions[Math.floor(Math.random() * analysis.contentSuggestions.length)];
    
    console.log(`📈 Selected trending topic: ${suggestion.category} (${suggestion.trendingKeyword})`);
    
    // Handle original poster engagement
    if (analysis.originalPosters && analysis.originalPosters.length > 0) {
      console.log(`🤝 Found ${analysis.originalPosters.length} original posters to engage with`);
      
      // Engage with original posters (limited to avoid spam)
      for (const poster of analysis.originalPosters.slice(0, 2)) {
        try {
          await engageWithOriginalPoster(poster);
        } catch (error) {
          console.error("Error engaging with original poster:", error);
        }
      }
    }
    
    return {
      content: suggestion.content,
      hashtags: suggestion.hashtags,
      category: suggestion.category,
      engagement: suggestion.engagement,
      type: "trending"
    };
  } catch (error) {
    console.error("Error generating trending content:", error);
    return null;
  }
}

// Engage with original poster of trending tweet
async function engageWithOriginalPoster(poster) {
  try {
    const { tweetId, authorId, engagement } = poster;
    
    console.log(`🤝 Engaging with tweet ${tweetId} by user ${authorId}`);
    
    // Like the tweet if configured
    if (engagement.shouldLike) {
      try {
        await client.v2.like(tweetId);
        console.log(`✅ Liked tweet ${tweetId}`);
      } catch (error) {
        console.log(`❌ Failed to like tweet: ${error.message}`);
      }
    }
    
    // Reply to the tweet
    if (engagement.type === 'reply') {
      try {
        await client.v2.reply(engagement.content, tweetId);
        console.log(`✅ Replied to tweet ${tweetId}: ${engagement.content.substring(0, 50)}...`);
      } catch (error) {
        console.log(`❌ Failed to reply to tweet: ${error.message}`);
      }
    }
    
    // Wait between engagements to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error("Error in engageWithOriginalPoster:", error);
  }
}

// Post tweet with media and wait for rate limit reset if needed
async function postWithRateLimitWait(tweetData) {
  try {
    let mediaId = null;
    
    // Create and upload image if images are enabled
    if (config.IMAGE.ENABLED) {
      try {
        let imageBuffer = null;
        
        // If we have code, create code image
        if (tweetData.code && tweetData.code.length > 0) {
          imageBuffer = await createCodeImage(tweetData.code, tweetData.topic, tweetData.detailedExample);
          console.log("📸 Code image created");
        } 
        // If no code but we have text content, create aesthetic text image
        else if (tweetData.text && tweetData.text.length > 0) {
          // Determine content type for styling
          let contentType = "text";
          if (tweetData.contentType === "interactive" && tweetData.interactiveType === "poll") {
            contentType = "poll";
          } else if (tweetData.contentType === "community") {
            contentType = "text"; // Community posts use normal text styling
          } else if (tweetData.contentType === "trending") {
            contentType = "text"; // Trending posts use normal text styling
          }
          
          imageBuffer = await createAestheticTextImage(tweetData.text, contentType);
          console.log(`📸 Aesthetic ${contentType} image created`);
        }
        
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
        
        // Retry image creation with same logic as main flow
        if (config.IMAGE.ENABLED) {
          try {
            let imageBuffer = null;
            
            // If we have code, create code image
            if (tweetData.code && tweetData.code.length > 0) {
              imageBuffer = await createCodeImage(tweetData.code, tweetData.topic);
            } 
            // If no code but we have text content, create aesthetic text image
            else if (tweetData.text && tweetData.text.length > 0) {
              // Determine content type for styling
              let contentType = "text";
              if (tweetData.contentType === "interactive" && tweetData.interactiveType === "poll") {
                contentType = "poll";
              } else if (tweetData.contentType === "community") {
                contentType = "text";
              } else if (tweetData.contentType === "trending") {
                contentType = "text";
              }
              
              imageBuffer = await createAestheticTextImage(tweetData.text, contentType);
            }
            
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
        tweetData = await generateTrendingContent();
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
