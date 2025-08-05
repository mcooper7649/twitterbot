const { createCanvas, loadImage } = require("canvas");
const config = require("./config");
const fs = require("fs");

// Test the new functionality
async function testShortTweetWithDetailedImage() {
  console.log("🧪 Testing short tweet with detailed image...");
  
  // Simulate a short tweet
  const shortTweet = "Use list comprehensions for cleaner code: [x*2 for x in range(10)]";
  const code = "[x*2 for x in range(10)]";
  const topic = { name: "Python" };
  
  console.log(`📝 Short tweet: "${shortTweet}"`);
  console.log(`📊 Tweet length: ${shortTweet.length} characters`);
  
  // Generate detailed example (simulated)
  const detailedExample = `# Advanced List Comprehension with Error Handling
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
result = process_data_safely(data)  # [2, 6, 10]`;
  
  console.log(`📖 Detailed example length: ${detailedExample.length} characters`);
  console.log(`📖 Detailed example lines: ${detailedExample.split('\n').length}`);
  
  // Create the image
  const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
  const ctx = canvas.getContext("2d");
  
  // Test font rendering first
  ctx.font = "16px monospace";
  const testText = "Test";
  const testMetrics = ctx.measureText(testText);
  console.log(`🔤 Font test - Text width: ${testMetrics.width}px`);
  
  if (testMetrics.width === 0) {
    console.warn("⚠️ Font rendering issue detected, using fallback");
    ctx.font = "16px sans-serif";
  }
  
  // Background
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
  
  // Title
  ctx.fillStyle = "#4a9eff";
  ctx.font = "bold 24px sans-serif, Arial, 'Helvetica Neue', Helvetica";
  ctx.fillText("Python Tip: List Comprehensions", 30, 40);
  
  // Code border
  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 45, config.IMAGE.WIDTH - 40, config.IMAGE.HEIGHT - 90);
  
  // Simple code (from tweet)
  ctx.fillStyle = "#d4d4d4";
  ctx.font = "16px monospace, 'DejaVu Sans Mono', 'Liberation Mono', 'Courier New', Arial, sans-serif";
  ctx.fillText("numbers = [x*2 for x in range(10)]", 30, 70);
  
  // Detailed example title
  ctx.fillStyle = "#4a9eff";
  ctx.font = "bold 16px sans-serif, Arial, 'Helvetica Neue', Helvetica";
  ctx.fillText("Advanced Implementation:", 30, 120);
  
  // Detailed example code
  ctx.fillStyle = "#e6e6e6";
  ctx.font = "13px monospace, 'DejaVu Sans Mono', 'Liberation Mono', 'Courier New', Arial, sans-serif";
  const exampleLines = detailedExample.split('\n');
  exampleLines.forEach((line, index) => {
    const y = 145 + (index * 16);
    if (y < config.IMAGE.HEIGHT - 50) {
      const truncatedLine = line.substring(0, config.IMAGE.MAX_LINE_LENGTH);
      ctx.fillText(truncatedLine, 30, y);
    }
  });
  
  // Footer
  ctx.fillStyle = "#888888";
  ctx.font = "12px sans-serif, Arial, 'Helvetica Neue', Helvetica";
  ctx.fillText("Follow @dev_patterns for more tips!", 20, config.IMAGE.HEIGHT - 15);
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('test-short-tweet-detailed-image.png', buffer);
  
  console.log("✅ Test completed! Check 'test-short-tweet-detailed-image.png'");
  console.log(`📊 Tweet: ${shortTweet.length} chars | Image: ${detailedExample.length} chars`);
  console.log("🔤 Font rendering should now work properly with fallback fonts");
}

// Run the test
testShortTweetWithDetailedImage().catch(console.error); 