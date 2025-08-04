const axios = require("axios");
const config = require("./config");

// Trending topic analyzer with free API support
class TrendingAnalyzer {
  constructor() {
    this.trendingCache = {
      topics: [],
      lastUpdated: null,
      updateInterval: 2 * 60 * 60 * 1000 // 2 hours
    };
    
    // Common tech trending patterns
    this.trendingPatterns = {
      "AI/ML": {
        keywords: ["AI", "machine learning", "ML", "GPT", "ChatGPT", "OpenAI", "Claude", "LLM", "AGI"],
        hashtags: ["#AI", "#MachineLearning", "#GPT", "#OpenAI", "#TechTrends"],
        engagement: "high",
        contentTypes: ["tips", "discussions", "polls"]
      },
      "Web3/Blockchain": {
        keywords: ["Web3", "blockchain", "crypto", "NFT", "DeFi", "Ethereum", "Bitcoin"],
        hashtags: ["#Web3", "#Blockchain", "#Crypto", "#NFT", "#DeFi"],
        engagement: "medium",
        contentTypes: ["discussions", "polls", "tips"]
      },
      "Cloud Computing": {
        keywords: ["AWS", "Azure", "GCP", "cloud", "serverless", "Kubernetes", "Docker"],
        hashtags: ["#CloudComputing", "#AWS", "#Azure", "#DevOps", "#Kubernetes"],
        engagement: "high",
        contentTypes: ["tips", "tutorials", "discussions"]
      },
      "Cybersecurity": {
        keywords: ["security", "cybersecurity", "hacking", "penetration testing", "zero-day"],
        hashtags: ["#Cybersecurity", "#InfoSec", "#Security", "#Hacking"],
        engagement: "high",
        contentTypes: ["tips", "discussions", "polls"]
      },
      "Mobile Development": {
        keywords: ["iOS", "Android", "Flutter", "React Native", "mobile app"],
        hashtags: ["#MobileDev", "#iOS", "#Android", "#Flutter", "#ReactNative"],
        engagement: "medium",
        contentTypes: ["tips", "tutorials", "discussions"]
      },
      "Data Science": {
        keywords: ["data science", "analytics", "big data", "Python", "pandas", "numpy"],
        hashtags: ["#DataScience", "#BigData", "#Analytics", "#Python"],
        engagement: "high",
        contentTypes: ["tips", "tutorials", "discussions"]
      },
      "Remote Work": {
        keywords: ["remote work", "WFH", "work from home", "distributed teams"],
        hashtags: ["#RemoteWork", "#WFH", "#DigitalNomad", "#WorkFromHome"],
        engagement: "medium",
        contentTypes: ["discussions", "polls", "community"]
      },
      "Career Development": {
        keywords: ["career", "job search", "interview", "salary", "promotion"],
        hashtags: ["#TechCareer", "#JobSearch", "#Interview", "#DeveloperLife"],
        engagement: "high",
        contentTypes: ["discussions", "polls", "community"]
      }
    };
  }

  // Get trending tweets using free API (limited but effective)
  async getTrendingTweets(client) {
    try {
      // Free API limitations:
      // - Can search tweets from last 7 days
      // - Rate limited to 180 requests per 15 minutes
      // - Can't get trending topics directly, but can search popular hashtags
      
      const trendingHashtags = [
        "#TechTwitter", "#Developer", "#Programming", "#AI", "#MachineLearning",
        "#Web3", "#Blockchain", "#CloudComputing", "#Cybersecurity", "#DataScience"
      ];
      
      const trendingTweets = [];
      
      // Search for tweets with trending hashtags (free API)
      for (const hashtag of trendingHashtags.slice(0, 5)) { // Limit to avoid rate limits
        try {
          const tweets = await client.v2.search(`${hashtag} -is:retweet`, {
            'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'text'],
            'user.fields': ['username', 'name'],
            'expansions': ['author_id'],
            'max_results': 10
          });
          
          if (tweets.data) {
            trendingTweets.push(...tweets.data);
          }
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`Error fetching tweets for ${hashtag}:`, error.message);
        }
      }
      
      return trendingTweets;
      
    } catch (error) {
      console.error("Error getting trending tweets:", error);
      return [];
    }
  }

  // Analyze trending content and extract patterns
  async analyzeTrendingContent(client = null) {
    try {
      let trendingContent = [];
      
      if (client) {
        // Use real Twitter API if available
        const tweets = await this.getTrendingTweets(client);
        trendingContent = tweets.map(tweet => tweet.text);
      } else {
        // Fallback to simulated content
        trendingContent = await this.simulateTrendingContent();
      }
      
      const analysis = {
        topTrends: [],
        engagementOpportunities: [],
        contentSuggestions: [],
        originalPosters: [] // New: track original posters for engagement
      };

      // Analyze each trending topic
      Object.entries(this.trendingPatterns).forEach(([category, pattern]) => {
        const matches = this.findMatches(trendingContent, pattern.keywords);
        
        if (matches.length > 0) {
          analysis.topTrends.push({
            category,
            pattern,
            matches,
            engagement: pattern.engagement,
            contentTypes: pattern.contentTypes
          });
        }
      });

      // Generate engagement opportunities
      analysis.engagementOpportunities = this.generateEngagementOpportunities(analysis.topTrends);
      
      // Generate content suggestions
      analysis.contentSuggestions = this.generateContentSuggestions(analysis.topTrends);
      
      // Generate engagement with original posters
      if (client) {
        analysis.originalPosters = await this.generateOriginalPosterEngagement(client, trendingContent);
      }

      return analysis;
    } catch (error) {
      console.error("Error analyzing trending content:", error);
      return null;
    }
  }

  // Generate engagement with original posters of trending tweets
  async generateOriginalPosterEngagement(client, trendingTweets) {
    const engagements = [];
    
    try {
      // Find high-engagement tweets to engage with
      const highEngagementTweets = trendingTweets.filter(tweet => 
        tweet.public_metrics && 
        (tweet.public_metrics.like_count > 10 || tweet.public_metrics.retweet_count > 5)
      ).slice(0, 3); // Limit to 3 engagements to avoid spam
      
      for (const tweet of highEngagementTweets) {
        const engagement = this.generateEngagementForTweet(tweet);
        if (engagement) {
          engagements.push({
            tweetId: tweet.id,
            authorId: tweet.author_id,
            engagement: engagement,
            category: this.categorizeTweet(tweet.text)
          });
        }
      }
      
    } catch (error) {
      console.error("Error generating original poster engagement:", error);
    }
    
    return engagements;
  }

  // Generate appropriate engagement for a specific tweet
  generateEngagementForTweet(tweet) {
    const text = tweet.text.toLowerCase();
    
    // Different engagement strategies based on content
    if (text.includes('ai') || text.includes('machine learning')) {
      return {
        type: 'reply',
        content: `Great insights on AI! 🤖 What's your biggest challenge with machine learning? #AI #TechTwitter`,
        shouldLike: true,
        shouldRetweet: false
      };
    } else if (text.includes('web3') || text.includes('blockchain')) {
      return {
        type: 'reply',
        content: `Interesting take on Web3! 🔗 What's your biggest blockchain challenge? #Web3 #TechTwitter`,
        shouldLike: true,
        shouldRetweet: false
      };
    } else if (text.includes('cloud') || text.includes('aws') || text.includes('azure')) {
      return {
        type: 'reply',
        content: `Cloud computing insights! ☁️ What's your favorite cloud platform? #CloudComputing #TechTwitter`,
        shouldLike: true,
        shouldRetweet: false
      };
    } else if (text.includes('security') || text.includes('cyber')) {
      return {
        type: 'reply',
        content: `Security is crucial! 🔒 How do you stay updated with cybersecurity threats? #Cybersecurity #TechTwitter`,
        shouldLike: true,
        shouldRetweet: false
      };
    } else if (text.includes('career') || text.includes('job') || text.includes('promotion')) {
      return {
        type: 'reply',
        content: `Career growth is important! 💪 What's your next career goal? #TechCareer #DeveloperLife`,
        shouldLike: true,
        shouldRetweet: false
      };
    }
    
    // Generic engagement for other tweets
    return {
      type: 'reply',
      content: `Great content! 👏 What's your biggest challenge in tech right now? #TechTwitter #DeveloperLife`,
      shouldLike: true,
      shouldRetweet: false
    };
  }

  // Categorize a tweet based on its content
  categorizeTweet(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('ai') || lowerText.includes('machine learning')) return 'AI/ML';
    if (lowerText.includes('web3') || lowerText.includes('blockchain')) return 'Web3/Blockchain';
    if (lowerText.includes('cloud') || lowerText.includes('aws')) return 'Cloud Computing';
    if (lowerText.includes('security') || lowerText.includes('cyber')) return 'Cybersecurity';
    if (lowerText.includes('career') || lowerText.includes('job')) return 'Career Development';
    
    return 'General Tech';
  }

  // Simulate trending content (replace with real Twitter API calls)
  async simulateTrendingContent() {
    return [
      "Just deployed my first AI-powered app using GPT-4! The possibilities are endless 🚀 #AI #GPT #TechTrends",
      "Web3 is revolutionizing how we think about digital ownership. What's your take on the future of blockchain? #Web3 #Blockchain",
      "AWS Lambda just saved us 80% on infrastructure costs. Serverless is the future! #AWS #Serverless #CloudComputing",
      "New zero-day vulnerability discovered in popular framework. Security should be everyone's priority #Cybersecurity #InfoSec",
      "Flutter vs React Native: which one are you choosing for your next mobile app? #MobileDev #Flutter #ReactNative",
      "Data science salaries are skyrocketing! What's your experience with Python for ML? #DataScience #Python #MachineLearning",
      "Remote work is here to stay. How do you stay productive working from home? #RemoteWork #WFH #Productivity",
      "Just got promoted to Senior Developer! The grind never stops 💪 #TechCareer #DeveloperLife #Success"
    ];
  }

  // Find matches between trending content and keywords
  findMatches(content, keywords) {
    const matches = [];
    
    content.forEach((post, index) => {
      const postLower = post.toLowerCase();
      const matchedKeywords = keywords.filter(keyword => 
        postLower.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        matches.push({
          postIndex: index,
          post,
          keywords: matchedKeywords
        });
      }
    });

    return matches;
  }

  // Generate engagement opportunities based on trending topics
  generateEngagementOpportunities(topTrends) {
    const opportunities = [];

    topTrends.forEach(trend => {
      const { category, pattern, matches } = trend;
      
      // Generate different types of engagement based on category
      switch (category) {
        case "AI/ML":
          opportunities.push({
            type: "poll",
            content: `What's your experience with ${matches[0]?.keywords[0] || "AI"}?`,
            options: ["Love it!", "Still learning", "Not convinced", "Haven't tried"],
            hashtags: pattern.hashtags
          });
          break;
          
        case "Web3/Blockchain":
          opportunities.push({
            type: "discussion",
            content: `What's your biggest challenge with ${category.toLowerCase()}? Share your thoughts below!`,
            hashtags: pattern.hashtags
          });
          break;
          
        case "Cloud Computing":
          opportunities.push({
            type: "tip",
            content: `Pro tip: Use ${matches[0]?.keywords[0] || "cloud services"} for better scalability. What's your favorite cloud platform?`,
            hashtags: pattern.hashtags
          });
          break;
          
        case "Cybersecurity":
          opportunities.push({
            type: "question",
            content: `How do you stay updated with the latest ${category.toLowerCase()} threats?`,
            hashtags: pattern.hashtags
          });
          break;
          
        case "Career Development":
          opportunities.push({
            type: "community",
            content: `Congratulations to everyone leveling up their career! What's your next goal?`,
            hashtags: pattern.hashtags
          });
          break;
      }
    });

    return opportunities;
  }

  // Generate content suggestions that tie into trending topics
  generateContentSuggestions(topTrends) {
    const suggestions = [];

    topTrends.forEach(trend => {
      const { category, pattern, matches } = trend;
      
      // Create content that references the trending topic
      const trendingKeyword = matches[0]?.keywords[0] || category.split('/')[0];
      
      suggestions.push({
        category,
        trendingKeyword,
        content: this.generateTrendingContent(category, trendingKeyword, pattern),
        hashtags: pattern.hashtags,
        engagement: pattern.engagement
      });
    });

    return suggestions;
  }

  // Generate specific content for trending topics
  generateTrendingContent(category, keyword, pattern) {
    const contentTemplates = {
      "AI/ML": {
        tip: `🤖 ${keyword} Tip: Always validate your AI model outputs!\n\n\`\`\`python\n# Good practice\nresult = model.predict(data)\nif not validate_output(result):\n    raise ValueError("Invalid prediction")\n\`\`\`\n\nWhat's your ${keyword} validation strategy? ${pattern.hashtags.join(' ')}`,
        discussion: `💭 ${keyword} is everywhere! What's your biggest challenge with ${keyword.toLowerCase()}?\n\nShare your experience below! ${pattern.hashtags.join(' ')}`,
        poll: `🤖 What's your experience with ${keyword}?\n\nA) Love it!\nB) Still learning\nC) Not convinced\nD) Haven't tried\n\n${pattern.hashtags.join(' ')}`
      },
      "Web3/Blockchain": {
        tip: `🔗 ${keyword} Tip: Always verify smart contract code!\n\n\`\`\`solidity\n// Always include checks\nrequire(msg.value > 0, "Invalid amount");\nrequire(balance >= amount, "Insufficient balance");\n\`\`\`\n\nWhat's your ${keyword} security approach? ${pattern.hashtags.join(' ')}`,
        discussion: `🔗 ${keyword} is changing the game! What's your biggest ${keyword.toLowerCase()} challenge?\n\nLet's discuss! ${pattern.hashtags.join(' ')}`,
        poll: `🔗 What's your ${keyword} experience?\n\nA) Building actively\nB) Learning\nC) Skeptical\nD) Not interested\n\n${pattern.hashtags.join(' ')}`
      },
      "Cloud Computing": {
        tip: `☁️ ${keyword} Tip: Use auto-scaling for cost optimization!\n\n\`\`\`yaml\n# Auto-scaling config\nautoScaling:\n  minInstances: 2\n  maxInstances: 10\n  targetCPUUtilization: 70\n\`\`\`\n\nWhat's your ${keyword} strategy? ${pattern.hashtags.join(' ')}`,
        discussion: `☁️ ${keyword} is essential! What's your biggest ${keyword.toLowerCase()} challenge?\n\nShare your experience! ${pattern.hashtags.join(' ')}`,
        poll: `☁️ Which ${keyword} platform do you prefer?\n\nA) AWS\nB) Azure\nC) GCP\nD) Other\n\n${pattern.hashtags.join(' ')}`
      },
      "Cybersecurity": {
        tip: `🔒 ${keyword} Tip: Always use parameterized queries!\n\n\`\`\`python\n# Secure\ncursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))\n\n# Vulnerable\ncursor.execute(f"SELECT * FROM users WHERE id = {user_id}")\n\`\`\`\n\nWhat's your ${keyword} approach? ${pattern.hashtags.join(' ')}`,
        discussion: `🔒 ${keyword} is critical! What's your biggest ${keyword.toLowerCase()} concern?\n\nLet's discuss security! ${pattern.hashtags.join(' ')}`,
        poll: `🔒 How do you stay updated with ${keyword}?\n\nA) Security blogs\nB) Conferences\nC) Online courses\nD) News alerts\n\n${pattern.hashtags.join(' ')}`
      }
    };

    const templates = contentTemplates[category] || contentTemplates["AI/ML"];
    const contentTypes = ["tip", "discussion", "poll"];
    const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    return templates[randomType];
  }

  // Get optimal hashtags for trending topics
  getTrendingHashtags(trendingTopics) {
    const hashtags = [];
    
    trendingTopics.forEach(topic => {
      hashtags.push(...topic.pattern.hashtags);
    });
    
    // Add general trending hashtags
    hashtags.push("#TechTrends", "#DeveloperLife", "#TechTwitter");
    
    return [...new Set(hashtags)].slice(0, 4); // Limit to 4 hashtags
  }

  // Check if we should post trending content
  shouldPostTrendingContent() {
    const now = Date.now();
    
    // Update cache if needed
    if (!this.trendingCache.lastUpdated || 
        (now - this.trendingCache.lastUpdated) > this.trendingCache.updateInterval) {
      this.trendingCache.lastUpdated = now;
      return true;
    }
    
    return false;
  }
}

module.exports = new TrendingAnalyzer(); 