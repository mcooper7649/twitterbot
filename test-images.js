const { createCanvas } = require("canvas");
const fs = require("fs");

// Mock the config
const config = {
  IMAGE: {
    WIDTH: 800,
    HEIGHT: 400,
    MAX_CODE_LINES: 15,
    MAX_LINE_LENGTH: 80
  }
};

// Test the new image generation function
async function createCodeImage(code, topic, detailedExample = null) {
  try {
    const canvas = createCanvas(config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    const ctx = canvas.getContext("2d");
    
    // Background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, config.IMAGE.WIDTH, config.IMAGE.HEIGHT);
    
    // Header with branding
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
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
    
    // Code text
    ctx.fillStyle = "#d4d4d4";
    ctx.font = "16px monospace";
    
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
        ctx.fillText(truncatedLine, 30, y);
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
      ctx.font = "14px monospace";
      const exampleLines = detailedExample.split('\n');
      exampleLines.forEach((line, index) => {
        const y = codeEndY + 45 + (index * 18); // Increased line spacing
        if (y < config.IMAGE.HEIGHT - 50) { // Added 20px margin from bottom
          const truncatedLine = line.substring(0, config.IMAGE.MAX_LINE_LENGTH);
          ctx.fillText(truncatedLine, 30, y);
        }
      });
    }
    
    // Footer with branding
    ctx.fillStyle = "#888888";
    ctx.font = "12px Arial";
    ctx.fillText("Follow @dev_patterns for more tips!", 20, config.IMAGE.HEIGHT - 15);
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error("Error creating code image:", error);
    return null;
  }
}

// Test function
async function testImageGeneration() {
  console.log("🧪 Testing new image generation...");
  
  const testCases = [
    {
      topic: { name: "Python" },
      code: "numbers = [x*2 for x in range(10)]",
      detailedExample: "# Create list of even numbers\nnumbers = [x*2 for x in range(10)]\nprint(numbers)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]"
    },
    {
      topic: { name: "React" },
      code: "const [count, setCount] = useState(0);",
      detailedExample: "// Counter component\nconst [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(count + 1)}>{count}</button>;"
    },
    {
      topic: { name: "AI" },
      code: "import numpy as np\nx = np.array([1, 2, 3])",
      detailedExample: "# NumPy array operations\nx = np.array([1, 2, 3])\nprint(x * 2)  # [2, 4, 6]\nprint(x.mean())  # 2.0"
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📸 Generating image ${i + 1}: ${testCase.topic.name}`);
    
    const imageBuffer = await createCodeImage(testCase.code, testCase.topic, testCase.detailedExample);
    
    if (imageBuffer) {
      const filename = `test_image_${i + 1}.png`;
      fs.writeFileSync(filename, imageBuffer);
      console.log(`✅ Image saved as ${filename}`);
    } else {
      console.log(`❌ Failed to generate image ${i + 1}`);
    }
  }
  
  console.log("\n🎉 Image generation test completed!");
}

// Run the test
testImageGeneration().catch(console.error); 