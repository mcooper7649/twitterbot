const fs = require("fs");
const path = require("path");

// Analytics data structure
const ANALYTICS_FILE = path.join(__dirname, "analytics.json");

// Initialize analytics
function initializeAnalytics() {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) {
      const initialData = {
        totalPosts: 0,
        topicsPosted: {},
        contentTypes: {
          tips: 0,
          interactive: 0,
          community: 0
        },
        dailyStats: {},
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error("Error initializing analytics:", error);
  }
}

// Load analytics data
function loadAnalytics() {
  try {
    const data = fs.readFileSync(ANALYTICS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading analytics:", error);
    return {
      totalPosts: 0,
      topicsPosted: {},
      contentTypes: {
        tips: 0,
        interactive: 0,
        community: 0
      },
      dailyStats: {},
      lastUpdated: new Date().toISOString()
    };
  }
}

// Save analytics data
function saveAnalytics(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving analytics:", error);
  }
}

// Track a post
function trackPost(topic, contentType, hashtags = []) {
  const analytics = loadAnalytics();
  
  // Update total posts
  analytics.totalPosts++;
  
  // Update topic stats
  if (!analytics.topicsPosted[topic.name]) {
    analytics.topicsPosted[topic.name] = 0;
  }
  analytics.topicsPosted[topic.name]++;
  
  // Update content type stats
  if (analytics.contentTypes[contentType]) {
    analytics.contentTypes[contentType]++;
  }
  
  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = {
      posts: 0,
      topics: {},
      contentTypes: {}
    };
  }
  analytics.dailyStats[today].posts++;
  
  if (!analytics.dailyStats[today].topics[topic.name]) {
    analytics.dailyStats[today].topics[topic.name] = 0;
  }
  analytics.dailyStats[today].topics[topic.name]++;
  
  if (!analytics.dailyStats[today].contentTypes[contentType]) {
    analytics.dailyStats[today].contentTypes[contentType] = 0;
  }
  analytics.dailyStats[today].contentTypes[contentType]++;
  
  saveAnalytics(analytics);
  
  // Log the post
  console.log(`📊 Analytics: Posted ${contentType} about ${topic.name} (Total: ${analytics.totalPosts})`);
}

// Get analytics summary
function getAnalyticsSummary() {
  const analytics = loadAnalytics();
  
  const summary = {
    totalPosts: analytics.totalPosts,
    topTopics: Object.entries(analytics.topicsPosted)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count })),
    contentTypes: analytics.contentTypes,
    lastUpdated: analytics.lastUpdated
  };
  
  return summary;
}

// Get daily stats
function getDailyStats(days = 7) {
  const analytics = loadAnalytics();
  const today = new Date();
  const stats = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayStats = analytics.dailyStats[dateStr] || {
      posts: 0,
      topics: {},
      contentTypes: {}
    };
    
    stats.unshift({
      date: dateStr,
      posts: dayStats.posts,
      topics: dayStats.topics,
      contentTypes: dayStats.contentTypes
    });
  }
  
  return stats;
}

// Generate performance report
function generatePerformanceReport() {
  const summary = getAnalyticsSummary();
  const dailyStats = getDailyStats(7);
  
  console.log("\n📊 Bot Performance Report");
  console.log("==========================");
  console.log(`Total Posts: ${summary.totalPosts}`);
  console.log(`Last Updated: ${new Date(summary.lastUpdated).toLocaleString()}`);
  
  console.log("\n🏆 Top Topics:");
  summary.topTopics.forEach(({ topic, count }, index) => {
    console.log(`${index + 1}. ${topic}: ${count} posts`);
  });
  
  console.log("\n📝 Content Types:");
  Object.entries(summary.contentTypes).forEach(([type, count]) => {
    console.log(`- ${type}: ${count} posts`);
  });
  
  console.log("\n📅 Last 7 Days:");
  dailyStats.forEach(day => {
    console.log(`${day.date}: ${day.posts} posts`);
  });
  
  return {
    summary,
    dailyStats
  };
}

// Check if we should post based on analytics (avoid overposting)
function shouldPostBasedOnAnalytics() {
  const analytics = loadAnalytics();
  const today = new Date().toISOString().split('T')[0];
  const todayStats = analytics.dailyStats[today];
  
  // Don't post more than 8 times per day
  if (todayStats && todayStats.posts >= 8) {
    console.log("⚠️ Daily post limit reached, skipping...");
    return false;
  }
  
  return true;
}

// Get optimal posting time based on analytics
function getOptimalPostingTime() {
  const dailyStats = getDailyStats(7);
  const hourStats = {};
  
  // This is a simplified version - in a real implementation,
  // you'd track hour-by-hour engagement
  return {
    recommendedHours: [9, 12, 15, 18, 21], // 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
    reason: "Based on typical developer activity patterns"
  };
}

module.exports = {
  initializeAnalytics,
  trackPost,
  getAnalyticsSummary,
  getDailyStats,
  generatePerformanceReport,
  shouldPostBasedOnAnalytics,
  getOptimalPostingTime
}; 