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

// Generate a high-quality dev tip under 280 chars
async function generateProgrammingTip(maxRetries = 5) {
  const messages = [
    {
      role: "user",
      content:
        "Generate a unique, advanced one-sentence programming tip (topics can include Python, React, Node.js, CI/CD, AI, DevOps, Docker, etc.) with a witty tone or humor. Must be under 280 characters, including hashtags. End with 3–5 relevant hashtags like #DevTips, #AI, #ReactJS, #NodeJS.",
    },
  ];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-4",
          messages,
          max_tokens: 150,
          temperature: 0.85,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const tip = response.data?.choices?.[0]?.message?.content?.trim();
      console.log(`💡 Attempt ${attempt + 1}: ${tip?.length || 0} chars`);
      console.log("🧠 Generated tip:", tip);

      if (tip && tip.length <= 280) {
        return tip;
      }

      console.warn("⚠️ Tip too long. Retrying...");
    } catch (err) {
      console.error("❌ OpenAI error:", err.response?.data || err.message);
    }
  }

  // Fallback tip if GPT fails or all retries exhausted
  const fallback =
    "Always commit before pulling — unless you enjoy resolving merge conflicts while questioning your life choices. #GitTips #DevLife #CodingHumor";
  console.warn("🚨 All retries failed. Using fallback tip.");
  return fallback;
}

// Post tweet with exponential backoff
async function postWithBackoff(tweet, retries = 5, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.v2.tweet(tweet);
      console.log(`✅ Tweet posted on attempt ${attempt}: ${tweet}`);
      return;
    } catch (err) {
      const isRateLimit = err.code === 429 || err.response?.status === 429;

      if (isRateLimit) {
        const reset = err.response?.headers?.["x-rate-limit-reset"];
        const resetTime = reset
          ? new Date(parseInt(reset, 10) * 1000).toLocaleTimeString()
          : "unknown";

        console.warn(
          `⏳ Rate limited (429). Attempt ${attempt} of ${retries}. Retrying in ${delay}ms...`
        );
        console.log(`🔧 Rate limit resets at: ${resetTime}`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error("❌ Twitter error:", err.message || err);
        throw err;
      }
    }
  }

  throw new Error(
    "🚫 Failed to post tweet after multiple retries due to rate limits."
  );
}

// Full process
async function postProgrammingTip() {
  try {
    const tip = await generateProgrammingTip();

    if (!tip || tip.length === 0) {
      throw new Error("Generated tip is empty — skipping tweet.");
    }

    await postWithBackoff(tip);
  } catch (err) {
    console.error("❌ Error posting tweet:", err.message || err);
  }
}

// Schedule hourly
cron.schedule("0 * * * *", () => {
  console.log("🕒 Scheduled post every hour");
  postProgrammingTip();
});

// Uncomment to test immediately
(async () => {
  console.log("🔁 Running test post...");
  await postProgrammingTip();
})();
