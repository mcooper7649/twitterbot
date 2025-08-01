#!/bin/bash

echo "🚀 Enhanced Twitter Bot - Phase 1 Deployment"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create a .env file with the following variables:"
    echo ""
    echo "API_KEY=your_twitter_api_key"
    echo "API_SECRET=your_twitter_api_secret"
    echo "ACCESS_TOKEN=your_twitter_access_token"
    echo "ACCESS_SECRET=your_twitter_access_secret"
    echo "OPENAI_API_KEY=your_openai_api_key"
    echo ""
    echo "💡 You can get these from:"
    echo "   - Twitter API: https://developer.twitter.com/"
    echo "   - OpenAI API: https://platform.openai.com/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install nodejs -y
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available!"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run security audit
echo ""
echo "🔒 Running security audit..."
npm audit fix

# Test the bot
echo ""
echo "🧪 Running tests..."
node test.js

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Verify your .env file has all required API keys"
echo "2. Run 'node index.js' to start the bot"
echo "3. The bot will post every hour automatically"
echo ""
echo "⚙️ Configuration:"
echo "- Edit config.js to customize settings"
echo "- Modify posting schedule in config.js"
echo "- Adjust topic weights as needed"
echo ""
echo "📊 Features implemented:"
echo "✅ Topic rotation (6 programming topics)"
echo "✅ Visual content generation"
echo "✅ Smart hashtag optimization"
echo "✅ Duplicate detection"
echo "✅ Rate limit handling"
echo "✅ Error recovery"
echo ""
echo "🚀 Ready to deploy!" 