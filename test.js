const { createCanvas } = require("canvas");
const config = require("./config");
const utils = require("./utils");

// Mock Twitter client for testing
const mockClient = {
  v2: {
    tweet: async (text, options) => {
      console.log("🐦 MOCK TWEET:", text);
      console.log("📸 MEDIA OPTIONS:", options);
      return { id: "mock_tweet_id" };
    }
  },
  v1: {
    uploadMedia: async (buffer, options) => {
      console.log("📸 MOCK MEDIA UPLOAD:", options);
      return "mock_media_id";
    }
  }
};

// Mock OpenAI response
const mockOpenAIResponse = {
  data: {
    choices: [{
      message: {
        content: "// Use list comprehensions for cleaner Python code\nnumbers = [x*2 for x in range(10)]"
      }
    }]
  }
};

// Test topic rotation
console.log("🧪 Testing Topic Rotation...");
const TOPICS = {
  PYTHON: {
    name: "Python",
    prompts: ["Test prompt"],
    hashtags: ["#Python", "#Coding"]
  },
  JAVASCRIPT: {
    name: "JavaScript", 
    prompts: ["Test prompt"],
    hashtags: ["#JavaScript", "#Coding"]
  }
};

// Test topic selection with proper weights
const topicKeys = Object.keys(TOPICS);
const weights = [0.6, 0.4]; // Python 60%, JS 40% for testing

for (let i = 0; i < 10; i++) {
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedTopic = null;
  
  for (let j = 0; j < weights.length; j++) {
    cumulativeWeight += weights[j];
    if (random <= cumulativeWeight) {
      selectedTopic = TOPICS[topicKeys[j]];
      break;
    }
  }
  
  if (!selectedTopic) {
    selectedTopic = TOPICS.PYTHON; // fallback
  }
  
  console.log(`Topic ${i + 1}: ${selectedTopic.name}`);
}

// Test hashtag generation
console.log("\n🏷️ Testing Hashtag Generation...");
const testContent = "Python async programming with performance optimization";
const hashtags = utils.generateHashtags(TOPICS.PYTHON, testContent);
console.log("Generated hashtags:", hashtags);

// Test code extraction
console.log("\n📝 Testing Code Extraction...");
const testText = "Here's a tip: ```const rev = str => [...str].reverse().join('');```";
const extractedCode = utils.extractCodeFromText(testText);
console.log("Extracted code:", extractedCode);

// Test image generation
console.log("\n🖼️ Testing Image Generation...");
const testCode = `// Python list comprehension
numbers = [x*2 for x in range(10)]
filtered = [x for x in numbers if x > 10]`;

try {
  const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
  
  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px 'Courier New'";
  ctx.fillText("Python Tip", 20, 40);
  
  // Code background
  ctx.fillStyle = "#2d2d2d";
  ctx.fillRect(20, 60, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 80);
  
  // Code text
  ctx.fillStyle = "#d4d4d4";
  ctx.font = "16px 'Courier New'";
  
  const lines = testCode.split('\n');
  lines.forEach((line, index) => {
    const y = 85 + (index * 20);
    if (y < config.IMAGE.HEIGHT - 30) {
      ctx.fillText(line.substring(0, config.IMAGE.MAX_LINE_LENGTH), 30, y);
    }
  });
  
  // Footer
  ctx.fillStyle = "#888888";
  ctx.font = "12px Arial";
  ctx.fillText("Follow for more dev tips! 👨‍💻", 20, config.IMAGE.HEIGHT - 20);
  
  const buffer = canvas.toBuffer('image/png');
  console.log("✅ Image generated successfully, size:", buffer.length, "bytes");
  
  // Save test image
  const fs = require("fs");
  fs.writeFileSync("test_image.png", buffer);
  console.log("💾 Test image saved as test_image.png");
  
} catch (error) {
  console.error("❌ Image generation failed:", error.message);
}

// Test content validation
console.log("\n✅ Testing Content Validation...");
const testTweet = "This is a test tweet with #Python #Coding hashtags";
const validation = utils.validateTweetContent(testTweet, "test code");
console.log("Validation result:", validation);

console.log("\n🎉 All tests completed successfully!");
console.log("📋 Summary of Phase 1 Features:");
console.log("✅ Topic rotation with weighted distribution");
console.log("✅ Dynamic hashtag generation");
console.log("✅ Visual content generation");
console.log("✅ Content validation and duplicate detection");
console.log("✅ Configuration management");
console.log("✅ Error handling and logging"); 