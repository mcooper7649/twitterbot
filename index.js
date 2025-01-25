const { TwitterApi } = require("twitter-api-v2");
const cron = require("node-cron");
const axios = require("axios");
require("dotenv").config();

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Function to generate a programming tip with hashtags using DeepSeek
async function generateProgrammingTip() {
  const messages = [
    {
      role: "user",
      content: `Generate a unique and concise programming tip in one sentence. Include 3-5 relevant hashtags at the end, such as #ProgrammingTips, #JavaScript, or #Python.`,
    },
  ];

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-reasoner", // Use the correct model name
        messages: messages,
        max_tokens: 150, // Optional: Limit the response length
        temperature: 0.7, // Optional: Controls creativity
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const tip = response.data.choices[0].message.content.trim();
    return tip;
  } catch (err) {
    console.error(
      "Error generating tip with DeepSeek:",
      err.response ? err.response.data : err.message
    );
    throw err;
  }
}

// Function to post a programming tip
async function postProgrammingTip() {
  try {
    const tip = await generateProgrammingTip();

    // Post the tweet (AI already includes hashtags)
    await client.v2.tweet(tip);
    console.log(`Tweet posted: ${tip}`);
  } catch (err) {
    console.error("Error posting tweet:", err);
  }
}

// Schedule the bot to post daily at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("Posting daily programming tip...");
  postProgrammingTip();
});

// ============================================
// SECTION FOR IMMEDIATE POSTING (FOR TESTING)
// ============================================
// Uncomment the following lines to post a tip immediately for testing
(async () => {
  console.log("Posting a test tip...");
  await postProgrammingTip();
})();
// ============================================
// COMMENT THIS SECTION OUT IN PRODUCTION
// ============================================
