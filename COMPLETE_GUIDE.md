# Perplexity Clone - Complete AI Search Engine

A modern, full-featured Perplexity-like AI search engine built with **LangChain**, **Groq LLM**, **Google Gemini Embeddings**, and **SearXNG**. Features 8 powerful focus modes for different search and content generation tasks.

## ✨ Features

### 8 Focus Modes Available

| Focus Mode | Purpose | Technology |
|---|---|---|
| **Web** | Search the entire web with citations | SearXNG (default engines) |
| **Academic** | Find scholarly papers and research | arXiv, Google Scholar, PubMed |
| **Reddit** | Discover discussions and opinions | Reddit discussions |
| **YouTube** | Find video content | YouTube videos |
| **Video** | Video search and discovery | YouTube API |
| **Image** | Image search across the web | Bing Images, Google Images |
| **Writing** | Writing assistance and editing | No search (local LLM only) |
| **Suggestion** | Follow-up question recommendations | Context-aware suggestions |

### Key Features

✅ **Real-time Streaming** - Token-by-token response streaming for fast user feedback
✅ **Source Attribution** - Every answer is cited with source links
✅ **Chat History** - Persistent conversation memory with localStorage
✅ **Smart Suggestions** - Context-aware follow-up question recommendations
✅ **Modern UI** - Dark/Light mode, responsive design inspired by Perplexity
✅ **No API Costs** - Uses free Groq, Google Gemini, and self-hosted SearXNG
✅ **Focus Modes** - Different agents optimized for different search types

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- `.env` file with API keys (see below)
- SearXNG instance (free Railway deployment link provided)

### Installation

```bash
# Clone or extract the project
cd Perplexity-clone

# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# Groq API Key (free tier available at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Google Gemini API Key (free tier at https://aistudio.google.com/apikey)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# SearXNG API URL (deploy for free on Railway using this template:)
# https://railway.app/template/SearXNG
SEARXNG_API_URL=https://your-instance.up.railway.app
```

### Running the Server

```bash
# Start the server
node index.js

# Server will be available at: http://localhost:3000
```

You'll see a beautiful startup banner showing all 8 agents are ready!

## 📖 How to Use

### Web Interface

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Select Focus Mode**: Click one of the 8 mode buttons at the top
3. **Ask a Question**: Type your query and press Enter or click the send button
4. **View Results**: See streamed response with source citations
5. **Follow Up**: Click suggested questions or ask a new question

### API Endpoints

All endpoints return streaming Server-Sent Events (SSE) or JSON responses:

#### Search Endpoints (Streaming)

```bash
# Web Search
curl -X POST http://localhost:3000/api/search/web \
  -H "Content-Type: application/json" \
  -d '{"message": "How does photosynthesis work?", "chat_history": []}'

# Academic Search
curl -X POST http://localhost:3000/api/search/academic \
  -H "Content-Type: application/json" \
  -d '{"message": "Latest AI research papers", "chat_history": []}'

# Reddit Search
curl -X POST http://localhost:3000/api/search/reddit \
  -H "Content-Type: application/json" \
  -d '{"message": "What do people think about...?", "chat_history": []}'

# YouTube Search
curl -X POST http://localhost:3000/api/search/youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "How to learn React", "chat_history": []}'

# Writing Assistant
curl -X POST http://localhost:3000/api/search/writing \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me write a professional email", "chat_history": []}'
```

#### List Endpoints (JSON Response)

```bash
# Video Search (returns list)
curl -X POST http://localhost:3000/api/search/video \
  -H "Content-Type: application/json" \
  -d '{"message": "Python tutorials", "chat_history": []}'

# Image Search (returns list)
curl -X POST http://localhost:3000/api/search/image \
  -H "Content-Type: application/json" \
  -d '{"message": "Sunset landscapes", "chat_history": []}'
```

#### Suggestions Endpoint

```bash
# Get follow-up suggestions
curl -X POST http://localhost:3000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{"chat_history": [...]}'
```

## 🏗️ Project Structure

```
Perplexity-clone/
├── public/                           # Frontend files
│   ├── index.html                   # Main UI
│   ├── css/
│   │   └── style.css                # Complete styling
│   └── js/
│       └── main.js                  # Frontend logic & state management
│
├── agents/                          # LangChain Agents (8 total)
│   ├── academicSearchAgent.js       # Academic paper search (Group A)
│   ├── webSearchAgent.js            # Web search (Group A)
│   ├── redditSearchAgent.js         # Reddit search (Group A)
│   ├── youtubeSearchAgent.js        # YouTube search (Group A)
│   ├── imageSearchAgent.js          # Image results list (Group B)
│   ├── videoSearchAgent.js          # Video results list (Group B)
│   ├── writingAssistantAgent.js     # Writing tasks (Group C)
│   ├── suggestionGeneratorAgent.js  # Follow-up suggestions
│   └── dispatch.js                  # Agent routing
│
├── lib/
│   ├── searxng.js                   # SearXNG search wrapper
│   └── outputParsers/
│       └── listLineOutputParser.js  # Custom output parser for suggestions
│
├── utils/
│   ├── handleStream.js              # Shared streaming handler
│   ├── computeSimilarity.js         # Cosine similarity calculation
│   └── formatHistory.js             # Chat history formatter
│
├── index.js                         # Express server & routes
├── package.json                     # Dependencies
├── .env                             # API Keys (create this)
└── README.md                        # This file
```

## 🔧 Agent Architecture

### Group A: Search-and-Answer Agents
**Pattern**: Rephrase query → Search → Rerank by similarity → Generate cited answer

- **academicSearchAgent**: Academic papers from arXiv, Google Scholar, PubMed
- **webSearchAgent**: General web results (all SearXNG engines)
- **redditSearchAgent**: Reddit discussions and opinions
- **youtubeSearchAgent**: Video descriptions from YouTube

**Features**:
- Streaming response via Server-Sent Events
- Automatic source detection and citation
- "not_needed" detection for greetings
- Embedding-based reranking (top 15 results)

### Group B: List-Based Agents
**Pattern**: Rephrase query → Search → Filter & format results → Return list

- **imageSearchAgent**: Image results from Bing and Google Images
- **videoSearchAgent**: Video results from YouTube

**Features**:
- Non-streaming (returns complete list at once)
- Thumbnail and metadata included
- Up to 10 results per query
- Frontend renders grid layout

### Group C: Specialized Agents
**Pattern**: Unique behavior per agent

- **writingAssistantAgent**: Streaming text generation without web search
- **suggestionGeneratorAgent**: Generates 4-5 follow-up questions (non-streaming)

## 🎨 Frontend Features

### Responsive Design
- Desktop-optimized sidebar with chat history
- Mobile-friendly collapsible interface
- Smooth animations and transitions

### Dark/Light Mode
- Toggle in settings
- Persisted in localStorage
- Smooth theme transitions

### Chat History
- Auto-saved to browser localStorage
- Recent conversations in sidebar
- Click to load previous chats

### Smart UI Elements
- Focus mode selector with icons
- Real-time streaming indicators
- Source cards with direct links
- Suggestion cards for quick follow-ups
- Video/Image grids with hover effects

## 🔑 API Keys Setup

### 1. Groq API Key (LLM)
```
1. Visit: https://console.groq.com
2. Sign up for free account
3. Create an API key
4. Add to .env: GROQ_API_KEY=gsk_...
```

**Model Used**: `llama-3.3-70b-versatile` (free, fast, high quality)

### 2. Google Gemini API Key (Embeddings)
```
1. Visit: https://aistudio.google.com/apikey
2. Click "Create API key"
3. Copy the key
4. Add to .env: GOOGLE_API_KEY=AIza...
```

**Model Used**: `gemini-embedding-001` (free tier included)

### 3. SearXNG URL (Search Engine)
```
Option A - Deploy on Railway (Recommended, FREE):
1. Go to: https://railway.app/template/SearXNG
2. Click "Deploy Now"
3. Wait for deployment
4. Copy instance URL
5. Add to .env: SEARXNG_API_URL=https://your-instance.up.railway.app

Option B - Self-host with Docker:
1. Install Docker
2. Run: docker run -p 8888:8080 searxng/searxng
3. Add to .env: SEARXNG_API_URL=http://localhost:8888
```

## 📝 Request/Response Format

### Streaming Response Format (Search Agents)
```
data: {"type": "sources", "data": [{...Document...}, ...]}
data: {"type": "response", "data": "First chunk of"}
data: {"type": "response", "data": " the response..."}
data: {"type": "response", "data": " [1][2]"}
```

### Non-Streaming Response Format (Images, Videos, Suggestions)
```json
{
  "success": true,
  "data": [
    {"img_src": "...", "url": "...", "title": "..."},
    ...
  ]
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

## 🧪 Testing Agents Manually

### Test a Streaming Agent
```javascript
const { handleWebSearch } = require('./agents/webSearchAgent.js');
const { ChatGroq } = require('@langchain/groq');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

const llm = new ChatGroq({...});
const embeddings = new GoogleGenerativeAIEmbeddings({...});

const emitter = handleWebSearch(
  "What is machine learning?",
  [],
  llm,
  embeddings
);

emitter.on("data", (d) => console.log(JSON.parse(d)));
emitter.on("error", (e) => console.error(e));
emitter.on("end", () => console.log("Done!"));
```

### Test a List Agent
```javascript
const { handleVideoSearch } = require('./agents/videoSearchAgent.js');

const results = await handleVideoSearch(
  "React tutorials",
  [],
  llm,
  embeddings
);
console.log(results);
```

## 🐛 Known Issues & Fixes

### Issue: Sort Direction Bug (Academic Agent)
The reference implementation sorts results in **ascending** order (keeping least-similar docs). This has been **fixed in all Group A agents** to use **descending** order (most-similar first).

**File**: `agents/academicSearchAgent.js` line ~125
```javascript
// FIXED: Changed from (a.similarity - b.similarity) to:
.sort((a, b) => b.similarity - a.similarity)
```

### Issue: Missing LLM Instances
If you get "Cannot read property 'invoke' of undefined", ensure you're passing `llm` and `embeddings` to agent functions from `index.js`.

### Issue: SearXNG Connection Errors
1. Verify `SEARXNG_API_URL` is correct and accessible
2. Check Railway deployment status
3. Try pinging the URL directly: `curl https://your-instance.up.railway.app`

## 🚀 Deployment

### Deploy to Railway
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Railway
# - Go to railway.app
# - Connect GitHub repo
# - Set environment variables
# - Deploy

# 3. Access
# Your app will be live at: your-app.up.railway.app
```

### Deploy to Vercel (Node.js)
```bash
npm install -g vercel
vercel
```

### Deploy to Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 📚 Learning Resources

- [LangChain Docs](https://docs.langchain.com)
- [Groq API Docs](https://console.groq.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [SearXNG Documentation](https://docs.searxng.org)

## 🤝 Contributing

This project implements all 8 agents from the Perplexity Clone assignment:

**Completed Features**:
- ✅ Web, Academic, Reddit, YouTube Search (Group A)
- ✅ Image, Video Search (Group B)
- ✅ Writing Assistant (Group C)
- ✅ Suggestion Generator
- ✅ Shared handleStream utility
- ✅ Correct rerank sort order (descending)
- ✅ Frontend UI with all features
- ✅ Chat history & persistence
- ✅ Dark/Light mode
- ✅ Responsive design

## 📄 License

MIT License - Feel free to use and modify

## 🎯 Next Steps

1. **Get API Keys** (5 min) - Follow section above
2. **Start Server** - `node index.js`
3. **Open Browser** - http://localhost:3000
4. **Try Each Mode** - Test all 8 focus modes
5. **Deploy** - Host on Railway or Vercel

---

**Made with ❤️ using LangChain, Groq, and Google Gemini**

Questions? Check the code comments for detailed explanations of each agent!
