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

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Function to generate a programming tip using OpenAI
async function generateProgrammingTip() {
  const messages = [
  {
    role: "system",
    content: `You are a senior software engineer who is extremely knowledgeable about web development, backend architecture, AI, and modern tooling like Docker, CI/CD, and cloud infrastructure. You are also sarcastic, clever, and witty. Your job is to post advanced, useful, and sometimes funny one-liner tips that real developers will appreciate.`,
  },
  {
    role: "user",
    content: `Give me a concise, clever, and technical one-liner dev tip. Make it insightful, not beginner-level. Focus on a topic like Python tricks, React optimization, CI/CD best practices, obscure NPM utilities, AI integration tips, or debugging nightmares. Add 3-5 tech-relevant hashtags like #DevLife #Python #Docker #CI_CD.`,
  },
];


  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4-turbo",
        messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: Bearer ${OPENAI_API_KEY},
          "Content-Type": "application/json",
        },
      }
    );

    const tip = response.data?.choices?.[0]?.message?.content?.trim();
    console.log("Generated tip:", JSON.stringify(tip)); // 👈 Add this
    console.log("OpenAI raw response:", JSON.stringify(response.data, null, 2));
    if (!tip) throw new Error("Empty response from OpenAI");
    return tip;
  } catch (err) {
    console.error(
      "Error generating tip with OpenAI:",
      err.response?.data || err.message
    );
    throw err;
  }
}

// Function to post a programming tip
async function postProgrammingTip() {
  try {
    const tip = await generateProgrammingTip();

    if (!tip || tip.length === 0) {
      throw new Error("Generated tip is empty — skipping tweet.");
    }
    if (tip.length > 280) {
      throw new Error(Tip too long (${tip.length} chars) — not posting.);
    }

    await client.v2.tweet(tip);
    console.log(✅ Tweet posted: ${tip});
  } catch (err) {
    console.error("❌ Error posting tweet:", err.message || err);
  }
}

// Schedule the bot to post daily at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("🕘 Scheduled post at 9 AM");
  postProgrammingTip();
});

// Uncomment for immediate testing
(async () => {
  console.log("🔁 Posting a test tip...");
  await postProgrammingTip();
})();
