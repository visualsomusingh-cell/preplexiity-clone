# 🚀 Quick Start Guide - Perplexity Clone

## What You Get

A complete, production-ready Perplexity clone with:
- 🎯 8 different AI search & content agents
- 💬 Modern chat interface with streaming responses
- 🔗 Source citations with direct links
- 💡 Smart follow-up suggestions
- 🎨 Dark/Light mode UI
- 📱 Fully responsive design
- 💰 Zero API costs (free Groq + Google Gemini)

---

## 5-Minute Setup

### Step 1: Get Free API Keys (3 minutes)

**Groq LLM** (AI Model):
```
1. Go to: https://console.groq.com
2. Sign up → Create API key
3. Copy your key
```

**Google Gemini** (Embeddings):
```
1. Go to: https://aistudio.google.com/apikey
2. Click "Create API key"
3. Copy your key
```

**SearXNG** (Search Engine):
```
1. Go to: https://railway.app/template/SearXNG
2. Click "Deploy Now"
3. Wait ~1 minute for deployment
4. Copy your instance URL
```

### Step 2: Create .env File (1 minute)

In the project root, create `.env`:

```env
GROQ_API_KEY=gsk_YourKeyHere
GOOGLE_API_KEY=AIzaYourKeyHere
SEARXNG_API_URL=https://your-instance.up.railway.app
```

### Step 3: Start Server (1 minute)

```bash
npm install
node index.js
```

You'll see:
```
╔════════════════════════════════════════╗
║     Perplexity Clone - Running        ║
║     http://localhost:3000             ║
║                                        ║
║  All 8 Agents Available:              ║
║  • Web Search                          ║
║  • Academic Search                     ║
│  • Reddit Search                       ║
│  ... and 5 more                        ║
╚════════════════════════════════════════╝
```

### Step 4: Open in Browser (immediate)

Visit: **http://localhost:3000**

---

## Try It Out!

### Web Search
```
Question: "What is machine learning?"
Focus Mode: Web
```
→ Get instant web results with sources

### Academic Search
```
Question: "Latest transformer architectures"
Focus Mode: Academic
```
→ Search arXiv, Google Scholar, PubMed

### Reddit Insights
```
Question: "What do people think about Remote Work?"
Focus Mode: Reddit
```
→ Find Reddit discussions & opinions

### YouTube Videos
```
Question: "How to learn Python"
Focus Mode: YouTube
```
→ Find YouTube video tutorials

### Writing Help
```
Question: "Write a professional email..."
Focus Mode: Writing
```
→ AI writing assistant (no search needed)

### Image Search
```
Question: "Beautiful sunset landscapes"
Focus Mode: Image
```
→ Browse images from web

### Video Discovery
```
Question: "Motivational speeches"
Focus Mode: Video
```
→ Find YouTube videos

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Browser - index.html)           │
│  • 8 Focus Mode Buttons                             │
│  • Chat Input & History                             │
│  • Real-time Streaming Display                      │
│  • Dark/Light Theme Toggle                          │
└────────────────────┬────────────────────────────────┘
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────┐
│       EXPRESS SERVER (Node.js - index.js)           │
│  • Routes for 8 agent endpoints                     │
│  • Streaming SSE responses                          │
│  • Static file serving                              │
└────────────────────┬────────────────────────────────┘
         ┌───────────┼──────────────────────┐
         ↓           ↓                       ↓
    ┌────────────────────────┐    ┌──────────────────┐
    │  LANGCHAIN AGENTS      │    │   EXTERNAL APIs  │
    │  (8 Total)            │    │                  │
    │                        │    │ • Groq (LLM)    │
    │ Group A:               │    │ • Google Gemini │
    │ • Web Search           │───→│ • SearXNG       │
    │ • Academic Search      │    │                  │
    │ • Reddit Search        │    └──────────────────┘
    │ • YouTube Search       │
    │                        │
    │ Group B:               │
    │ • Image Search         │
    │ • Video Search         │
    │                        │
    │ Group C:               │
    │ • Writing Assistant    │
    │ • Suggestions Generator│
    └────────────────────────┘
```

---

## Key Features Explained

### 🔍 Real-Time Streaming
Every response streams word-by-word for instant feedback, just like ChatGPT.

### 🔗 Source Citations
All information is cited with direct links to sources. Click to verify.

### 💬 Chat Memory
All conversations saved locally in your browser. Load previous chats anytime.

### 🧠 Smart Suggestions
After each response, get 4-5 follow-up questions relevant to your search.

### 🎨 Modern UI
Inspired by Perplexity, with smooth animations, responsive design, and dark mode.

### ⚡ Fast Inference
Uses Groq cloud for ultra-fast LLM inference (~50ms vs seconds elsewhere).

### 💰 Cost-Effective
- Groq: Free tier includes 10k API calls/day
- Google Gemini: Free tier unlimited
- SearXNG: Self-hosted, completely free
- **Total Monthly Cost: $0** 🎉

---

## Common Issues & Solutions

### ❌ "Cannot find module" errors
```bash
# Solution: Install dependencies
npm install
```

### ❌ "GROQ_API_KEY is undefined"
```bash
# Make sure .env file is in root directory:
# Perplexity-clone/
#   ├── .env  ← Should be here
#   ├── index.js
#   └── ...
```

### ❌ "Failed to fetch from SearXNG"
```
1. Verify your Railway instance is deployed
2. Check URL is correct
3. Test: curl https://your-instance.up.railway.app
4. Redeploy if needed
```

### ❌ "Streaming not working"
```
- Check browser DevTools (F12) → Network tab
- Look for POST request to /api/search/*
- Should see 200 status with SSE data
```

---

## Deployment (5-10 minutes)

### Option 1: Railway (Recommended)
```bash
1. Push to GitHub
2. Go to railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your repo
5. Add .env variables
6. Deploy!
```

### Option 2: Vercel
```bash
npm install -g vercel
vercel
# Follow prompts
```

### Option 3: Heroku
```bash
heroku login
heroku create your-app
git push heroku main
```

---

## File Structure (What's What)

```
📦 Perplexity-clone
├── 📄 index.js                      ← Main server file
├── 📄 .env                          ← API keys (create this)
├── 📁 public/                       ← Frontend files
│   ├── 📄 index.html                ← Main page
│   ├── 📁 css/
│   │   └── 📄 style.css             ← All styling
│   └── 📁 js/
│       └── 📄 main.js               ← Frontend logic
├── 📁 agents/                       ← 8 LangChain agents
│   ├── 📄 webSearchAgent.js
│   ├── 📄 academicSearchAgent.js
│   ├── 📄 redditSearchAgent.js
│   ├── 📄 youtubeSearchAgent.js
│   ├── 📄 imageSearchAgent.js
│   ├── 📄 videoSearchAgent.js
│   ├── 📄 writingAssistantAgent.js
│   └── 📄 suggestionGeneratorAgent.js
├── 📁 lib/
│   ├── 📄 searxng.js                ← SearXNG wrapper
│   └── 📁 outputParsers/
├── 📁 utils/
│   ├── 📄 handleStream.js           ← Streaming handler
│   ├── 📄 computeSimilarity.js
│   └── 📄 formatHistory.js
└── 📄 package.json                  ← Dependencies
```

---

## API Endpoints (For Developers)

### POST /api/search/web
```bash
curl -X POST http://localhost:3000/api/search/web \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is AI?",
    "chat_history": []
  }'
```

Similar endpoints:
- `/api/search/academic` - Academic search
- `/api/search/reddit` - Reddit search
- `/api/search/youtube` - YouTube search
- `/api/search/writing` - Writing help

### POST /api/search/image
```bash
curl -X POST http://localhost:3000/api/search/image \
  -H "Content-Type: application/json" \
  -d '{
    "message": "sunset landscape",
    "chat_history": []
  }'
```

Returns: List of 10 images with thumbnails

### POST /api/suggestions
```bash
curl -X POST http://localhost:3000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "chat_history": [...]
  }'
```

Returns: Array of 4-5 follow-up questions

---

## What's Inside Each Agent

### Group A: Search & Answer (with streaming)
- Rephrase user query
- Search via SearXNG
- Rank results by embedding similarity
- Generate cited answer
- Stream token-by-token

### Group B: List Results
- Rephrase query
- Search via SearXNG
- Format as list (images/videos)
- Return 10 results
- No streaming

### Group C: Special Modes
- **Writing**: No search, just LLM assistance
- **Suggestions**: Generate follow-up questions

---

## Next Steps

1. ✅ Setup complete?
2. 🌐 Open http://localhost:3000
3. 🔍 Try each focus mode
4. 📚 Read COMPLETE_GUIDE.md for advanced usage
5. 🚀 Deploy to production!

---

## Need Help?

Check the comments in the code for explanations!
- `index.js` - Route handlers
- `agents/*.js` - Agent logic
- `public/js/main.js` - Frontend code
- `COMPLETE_GUIDE.md` - Full documentation

---

**Happy searching! 🎉**

Made with ❤️ using LangChain, Groq, and Google Gemini
