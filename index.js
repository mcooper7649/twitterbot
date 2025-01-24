const { TwitterApi } = require("twitter-api-v2");
const cron = require("node-cron");
require("dotenv").config();

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// cron.schedule("0 9 * * *", () => {
//   client.v2.tweet("Good morning! This is your daily automated tweet. 🌞");
//   console.log("Tweet posted!");
// });

// Test the tweet function immediately
client.v2
  .tweet("This is a test tweet again! 🚀")
  .then(() => console.log("Tweet posted!"))
  .catch((err) => console.error("Error posting tweet:", err));
