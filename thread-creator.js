const config = require("./config");

// Thread types
const THREAD_TYPES = {
  TUTORIAL: "tutorial",
  BEST_PRACTICES: "best_practices",
  DEBUGGING: "debugging",
  OPTIMIZATION: "optimization",
  COMPARISON: "comparison"
};

// Thread templates for different topics
const THREAD_TEMPLATES = {
  PYTHON: {
    tutorial: {
      title: "🐍 Python List Comprehensions: A Complete Guide",
      tweets: [
        "1/6 🐍 Python List Comprehensions: A Complete Guide\n\nList comprehensions are a powerful way to create lists in Python. Let's learn them step by step! #Python #Programming",
        "2/6 Basic syntax:\n\n```python\n# Traditional way\nnumbers = []\nfor i in range(10):\n    numbers.append(i*2)\n\n# List comprehension\nnumbers = [i*2 for i in range(10)]\n```\n#Python #Coding",
        "3/6 With conditions:\n\n```python\n# Only even numbers\neven = [x for x in range(20) if x % 2 == 0]\n\n# With transformation\nsquares = [x**2 for x in range(10) if x % 2 == 0]\n```\n#Python #Programming",
        "4/6 Nested comprehensions:\n\n```python\n# Matrix creation\nmatrix = [[i+j for j in range(3)] for i in range(3)]\n\n# Flattening\nflat = [item for row in matrix for item in row]\n```\n#Python #DataStructures",
        "5/6 Performance benefits:\n\n✅ Faster than loops\n✅ More readable\n✅ Memory efficient\n✅ Pythonic way\n\nUse them wisely! #Python #Performance",
        "6/6 Pro tip: Don't overuse them! Keep it readable:\n\n```python\n# Good\nsquares = [x**2 for x in range(10)]\n\n# Too complex - use a loop instead\nresult = [f(x) for x in data if g(x) and h(x)]\n```\n\nFollow for more Python tips! 🐍 #Python #Programming"
      ]
    },
    best_practices: {
      title: "🐍 Python Best Practices You Should Know",
      tweets: [
        "1/5 🐍 Python Best Practices You Should Know\n\nLet's cover the essential practices that make your Python code better! #Python #BestPractices",
        "2/5 Use virtual environments:\n\n```bash\npython -m venv myproject\nsource myproject/bin/activate  # Linux/Mac\nmyproject\\Scripts\\activate     # Windows\n```\n\nAlways isolate your projects! #Python #DevOps",
        "3/5 Follow PEP 8 style guide:\n\n```python\n# Good\ndef calculate_area(radius):\n    return 3.14 * radius ** 2\n\n# Bad\ndef calcArea(r):\n    return 3.14*r*r\n```\n\nConsistent code is maintainable code! #Python #Coding",
        "4/5 Use type hints:\n\n```python\nfrom typing import List, Optional\n\ndef process_data(items: List[str]) -> Optional[str]:\n    if not items:\n        return None\n    return items[0].upper()\n```\n\nType hints improve code clarity! #Python #TypeHints",
        "5/5 Handle exceptions properly:\n\n```python\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\nexcept Exception as e:\n    print(f'Unexpected error: {e}')\n```\n\nAlways handle errors gracefully! #Python #ErrorHandling"
      ]
    }
  },
  JAVASCRIPT: {
    tutorial: {
      title: "⚡ JavaScript Async/Await: Complete Guide",
      tweets: [
        "1/6 ⚡ JavaScript Async/Await: Complete Guide\n\nMaster async programming in JavaScript with this comprehensive guide! #JavaScript #Async",
        "2/6 Basic async/await:\n\n```javascript\nasync function fetchUser(id) {\n    const response = await fetch(`/api/users/${id}`);\n    return response.json();\n}\n```\n\nMuch cleaner than callbacks! #JavaScript #Programming",
        "3/6 Error handling:\n\n```javascript\nasync function safeFetch(url) {\n    try {\n        const response = await fetch(url);\n        return await response.json();\n    } catch (error) {\n        console.error('Fetch failed:', error);\n        return null;\n    }\n}\n```\n#JavaScript #ErrorHandling",
        "4/6 Parallel execution:\n\n```javascript\nasync function fetchMultiple(urls) {\n    const promises = urls.map(url => fetch(url));\n    const responses = await Promise.all(promises);\n    return responses.map(r => r.json());\n}\n```\n#JavaScript #Performance",
        "5/6 Real-world example:\n\n```javascript\nasync function getUserPosts(userId) {\n    const [user, posts] = await Promise.all([\n        fetchUser(userId),\n        fetchPosts(userId)\n    ]);\n    return { user, posts };\n}\n```\n#JavaScript #WebDev",
        "6/6 Pro tips:\n\n✅ Always use try/catch\n✅ Use Promise.all for parallel\n✅ Don't forget await\n✅ Handle errors gracefully\n\nFollow for more JS tips! ⚡ #JavaScript #Programming"
      ]
    },
    optimization: {
      title: "⚡ JavaScript Performance Optimization Tips",
      tweets: [
        "1/5 ⚡ JavaScript Performance Optimization Tips\n\nMake your JavaScript code faster with these proven techniques! #JavaScript #Performance",
        "2/5 Use efficient loops:\n\n```javascript\n// Good - for...of for arrays\nfor (const item of array) {\n    console.log(item);\n}\n\n// Good - for...in for objects\nfor (const key in object) {\n    console.log(object[key]);\n}\n```\n#JavaScript #Coding",
        "3/5 Avoid DOM queries in loops:\n\n```javascript\n// Bad\nfor (let i = 0; i < 1000; i++) {\n    document.getElementById('element');\n}\n\n// Good\nconst element = document.getElementById('element');\nfor (let i = 0; i < 1000; i++) {\n    // Use cached element\n}\n```\n#JavaScript #DOM",
        "4/5 Use modern array methods:\n\n```javascript\n// Good - functional approach\nconst doubled = numbers.map(n => n * 2);\nconst evens = numbers.filter(n => n % 2 === 0);\nconst sum = numbers.reduce((acc, n) => acc + n, 0);\n```\n#JavaScript #Functional",
        "5/5 Memory management:\n\n```javascript\n// Clear event listeners\nconst handler = () => console.log('click');\nelement.addEventListener('click', handler);\nelement.removeEventListener('click', handler);\n\n// Clear intervals\nconst interval = setInterval(fn, 1000);\nclearInterval(interval);\n```\n#JavaScript #Memory"
      ]
    }
  },
  REACT: {
    tutorial: {
      title: "⚛️ React Hooks: Complete Guide",
      tweets: [
        "1/6 ⚛️ React Hooks: Complete Guide\n\nMaster React Hooks with this comprehensive tutorial! #React #Hooks",
        "2/6 useState - State management:\n\n```jsx\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    \n    return (\n        <button onClick={() => setCount(count + 1)}>\n            Count: {count}\n        </button>\n    );\n}\n```\n#React #State",
        "3/6 useEffect - Side effects:\n\n```jsx\nfunction UserProfile({ userId }) {\n    const [user, setUser] = useState(null);\n    \n    useEffect(() => {\n        fetchUser(userId).then(setUser);\n    }, [userId]);\n    \n    return user ? <div>{user.name}</div> : <div>Loading...</div>;\n}\n```\n#React #Effects",
        "4/6 Custom hooks:\n\n```jsx\nfunction useLocalStorage(key, initialValue) {\n    const [value, setValue] = useState(() => {\n        return localStorage.getItem(key) || initialValue;\n    });\n    \n    useEffect(() => {\n        localStorage.setItem(key, value);\n    }, [key, value]);\n    \n    return [value, setValue];\n}\n```\n#React #CustomHooks",
        "5/6 useMemo & useCallback:\n\n```jsx\nfunction ExpensiveComponent({ data }) {\n    const processedData = useMemo(() => {\n        return expensiveCalculation(data);\n    }, [data]);\n    \n    const handleClick = useCallback(() => {\n        console.log('Clicked');\n    }, []);\n    \n    return <div onClick={handleClick}>{processedData}</div>;\n}\n```\n#React #Performance",
        "6/6 Pro tips:\n\n✅ Always include dependencies\n✅ Use custom hooks for reusability\n✅ Optimize with useMemo/useCallback\n✅ Keep effects focused\n\nFollow for more React tips! ⚛️ #React #Programming"
      ]
    }
  }
};

// Generate a thread
function generateThread(topic, threadType = null) {
  const templates = THREAD_TEMPLATES[topic.name.toUpperCase()];
  
  if (!templates) {
    return null; // No templates for this topic
  }
  
  if (!threadType) {
    const types = Object.keys(templates);
    threadType = types[Math.floor(Math.random() * types.length)];
  }
  
  const template = templates[threadType];
  if (!template) {
    return null;
  }
  
  return {
    type: threadType,
    title: template.title,
    tweets: template.tweets,
    topic: topic,
    hashtags: [`#${topic.name}`, "#Thread", "#Programming", "#TechTwitter"]
  };
}

// Check if we should create a thread (10% chance)
function shouldCreateThread() {
  return Math.random() < 0.1; // 10% chance
}

// Get thread types available for a topic
function getAvailableThreadTypes(topic) {
  const templates = THREAD_TEMPLATES[topic.name.toUpperCase()];
  return templates ? Object.keys(templates) : [];
}

// Create a thread with trending topics
function generateTrendingThread(topic) {
  const trendingTopics = require("./advanced-analytics").getTrendingTopics();
  const seasonalEvents = require("./advanced-analytics").getSeasonalEvents();
  
  const allTopics = [...trendingTopics, ...seasonalEvents];
  const selectedTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
  
  const thread = {
    type: "trending",
    title: `🔥 ${selectedTopic} with ${topic.name}: Quick Guide`,
    tweets: [
      `1/4 🔥 ${selectedTopic} with ${topic.name}: Quick Guide\n\nLet's explore how to use ${selectedTopic} in your ${topic.name} projects! #${selectedTopic.replace(/\s+/g, '')} #${topic.name}`,
      `2/4 Getting started:\n\n\`\`\`${topic.name.toLowerCase()}\n# Basic setup for ${selectedTopic}\nimport ${selectedTopic.toLowerCase()}\n\n# Initialize\nconfig = ${selectedTopic.toLowerCase()}.Config()\n\`\`\`\n#${selectedTopic.replace(/\s+/g, '')} #${topic.name}`,
      `3/4 Best practices:\n\n✅ Start simple\n✅ Follow documentation\n✅ Test thoroughly\n✅ Keep it maintainable\n\n#${selectedTopic.replace(/\s+/g, '')} #${topic.name} #BestPractices`,
      `4/4 Pro tip: ${selectedTopic} works great with ${topic.name}!\n\nShare your experience below! 🚀\n\n#${selectedTopic.replace(/\s+/g, '')} #${topic.name} #TechTwitter #DevCommunity`
    ],
    topic: topic,
    hashtags: [`#${selectedTopic.replace(/\s+/g, '')}`, `#${topic.name}`, "#Thread", "#TechTwitter"],
    isTrending: trendingTopics.includes(selectedTopic),
    isSeasonal: seasonalEvents.includes(selectedTopic)
  };
  
  return thread;
}

// Post a thread (simulated for free API)
async function postThread(thread, client) {
  console.log(`🧵 Creating thread: ${thread.title}`);
  
  try {
    // In a real implementation, you'd post each tweet and link them
    // For free API, we'll simulate the thread creation
    
    for (let i = 0; i < thread.tweets.length; i++) {
      const tweet = thread.tweets[i];
      console.log(`📝 Thread tweet ${i + 1}/${thread.tweets.length}: ${tweet.substring(0, 50)}...`);
      
      // Simulate posting delay between tweets
      if (i < thread.tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Thread posted successfully: ${thread.title}`);
    return true;
    
  } catch (error) {
    console.error("❌ Error posting thread:", error);
    return false;
  }
}

// Get thread statistics
function getThreadStats() {
  const threadStats = {
    totalThreads: 0,
    topics: {},
    types: {},
    averageLength: 0
  };
  
  // This would be populated from actual thread data
  return threadStats;
}

module.exports = {
  generateThread,
  shouldCreateThread,
  getAvailableThreadTypes,
  generateTrendingThread,
  postThread,
  getThreadStats,
  THREAD_TYPES
}; 