const { createCanvas } = require("canvas");
const fs = require("fs");

// Debug image generation
async function debugImageGeneration() {
  console.log("🔍 Debugging image generation...");
  
  try {
    // Test 1: Basic canvas creation
    console.log("📸 Test 1: Basic canvas creation");
    const canvas = createCanvas(800, 400);
    canvas.width = 800;
    canvas.height = 400;
    
    const ctx = canvas.getContext("2d");
    
    // Test 2: Basic drawing
    console.log("📸 Test 2: Basic drawing");
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, 800, 400);
    
    // Test 3: Text rendering
    console.log("📸 Test 3: Text rendering");
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText("Test Text", 20, 30);
    
    // Test 4: Code text
    console.log("📸 Test 4: Code text");
    ctx.fillStyle = "#d4d4d4";
    ctx.font = "16px Arial, monospace";
    ctx.fillText("const test = 'hello world';", 30, 70);
    
    // Test 5: Buffer conversion
    console.log("📸 Test 5: Buffer conversion");
    const buffer = canvas.toBuffer('image/png');
    
    if (buffer && buffer.length > 0) {
      fs.writeFileSync('debug_test.png', buffer);
      console.log("✅ Debug image saved as debug_test.png");
      console.log(`📊 Buffer size: ${buffer.length} bytes`);
    } else {
      console.log("❌ Buffer is empty or null");
    }
    
    // Test 6: Check if image is valid
    console.log("📸 Test 6: Image validation");
    const testCanvas = createCanvas(10, 10);
    const testCtx = testCanvas.getContext("2d");
    testCtx.fillStyle = '#ffffff';
    testCtx.fillRect(0, 0, 10, 10);
    testCtx.fillStyle = '#000000';
    testCtx.font = '10px Arial';
    testCtx.fillText('A', 0, 8);
    
    const testBuffer = testCanvas.toBuffer('image/png');
    console.log(`📊 Test buffer size: ${testBuffer.length} bytes`);
    
  } catch (error) {
    console.error("❌ Error in debug:", error);
  }
}

// Run debug
debugImageGeneration().catch(console.error); 