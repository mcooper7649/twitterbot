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
      content: `You are a witty, senior-level full stack developer with a focus on real-world, high-level dev advice. Your tone is clever, insightful, and occasionally sarcastic. Avoid beginner content.`,
    },
    {
      role: "user",
      content: `Give me an example of code that real devs will appreciate. Include 3-5 relevant hashtags like #DevLife #NodeJS #Docker.`,
    },
  ];
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4-turbo",
        messages,
        max_tokens: 150,
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const tip = response.data?.choices?.[0]?.message?.content?.trim();
    console.log("Generated tip:", JSON.stringify(tip));
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

// Function to split long tips into chunks of <=280 characters
function splitTip(tip) {
  const parts = [];
  let remaining = tip;
  while (remaining.length > 0) {
    let chunk = remaining.substring(0, 280);
    // If not the last part, append ellipsis and prepare next part
    if (remaining.length > 280) {
      chunk = chunk.substring(0, 277) + "...";
    }
    parts.push(chunk);
    remaining = remaining.substring(chunk.length);
  }
  return parts;
}

// Function to post a thread (multi-part tweet)
async function postThread(tip) {
  const parts = splitTip(tip);
  let replyToId = null;
  for (let i = 0; i < parts.length; i++) {
    const status =
      parts[i] + (i < parts.length - 1 ? ` (${i + 1}/${parts.length})` : "");
    try {
      const response = await client.v2.tweet(
        status,
        replyToId ? { reply: { in_reply_to_tweet_id: replyToId } } : {}
      );
      replyToId = response.data.id;
      console.log(`Posted part ${i + 1}/${parts.length}: ${status}`);
    } catch (err) {
      console.error(`Error posting part ${i + 1}:`, err);
      break; // stop if error occurs
    }
  }
}

// Function to generate and post large tip
async function postProgrammingTip() {
  try {
    const tip = await generateProgrammingTip();
    if (!tip || tip.length === 0) {
      throw new Error("Generated tip is empty — skipping.");
    }
    if (tip.length <= 280) {
      // small enough, just post
      await client.v2.tweet(tip);
      console.log(`✅ Tweet posted: ${tip}`);
    } else {
      // split and post as thread
      await postThread(tip);
    }
  } catch (err) {
    console.error("❌ Error posting tip:", err.message || err);
  }
}

// Schedule the bot to post 6 times a day
cron.schedule("0 4,8,12,16,20,0 * * *", () => {
  console.log("Scheduled post 6 times a day");
  postProgrammingTip();
});

// Immediately test
(async () => {
  console.log("🔁 Posting a test tip...");
  await postProgrammingTip();
})();
