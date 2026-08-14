import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Import all agents
import { handleWebSearch } from "./agents/webSearchAgent.js";
import { handleAcademicSearch } from "./agents/academicSearchAgent.js";
import { handleRedditSearch } from "./agents/redditSearchAgent.js";
import { handleYoutubeSearch } from "./agents/youtubeSearchAgent.js";
import { handleVideoSearch } from "./agents/videoSearchAgent.js";
import { handleImageSearch } from "./agents/imageSearchAgent.js";
import { handleWritingAssistant } from "./agents/writingAssistantAgent.js";
import { generateSuggestions } from "./agents/suggestionGeneratorAgent.js";

const app = express();
const PORT = 3000;

// Get current directory for static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize LangChain models
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Route handlers
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/status", (req, res) => {
  res.json({ success: true, data: "Server is alive" });
});

// Search endpoints with streaming
app.post("/api/search/web", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const emitter = handleWebSearch(message, chat_history || [], llm, embeddings);
    
    emitter.on("data", (data) => {
      res.write(`data: ${data}\n\n`);
    });

    emitter.on("end", () => {
      res.end();
    });

    emitter.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error("Web search error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", data: err.message })}\n\n`);
    res.end();
  }
});

app.post("/api/search/academic", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const emitter = handleAcademicSearch(message, chat_history || [], llm, embeddings);
    
    emitter.on("data", (data) => {
      res.write(`data: ${data}\n\n`);
    });

    emitter.on("end", () => {
      res.end();
    });

    emitter.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error("Academic search error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", data: err.message })}\n\n`);
    res.end();
  }
});

app.post("/api/search/reddit", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const emitter = handleRedditSearch(message, chat_history || [], llm, embeddings);
    
    emitter.on("data", (data) => {
      res.write(`data: ${data}\n\n`);
    });

    emitter.on("end", () => {
      res.end();
    });

    emitter.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error("Reddit search error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", data: err.message })}\n\n`);
    res.end();
  }
});

app.post("/api/search/youtube", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const emitter = handleYoutubeSearch(message, chat_history || [], llm, embeddings);
    
    emitter.on("data", (data) => {
      res.write(`data: ${data}\n\n`);
    });

    emitter.on("end", () => {
      res.end();
    });

    emitter.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error("YouTube search error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", data: err.message })}\n\n`);
    res.end();
  }
});

// List-based endpoints (non-streaming)
app.post("/api/search/video", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  try {
    const results = await handleVideoSearch(message, chat_history || [], llm, embeddings);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Video search error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/search/image", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  try {
    const results = await handleImageSearch(message, chat_history || [], llm, embeddings);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Image search error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Writing assistant (streaming)
app.post("/api/search/writing", async (req, res) => {
  const { message, chat_history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: "message is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const emitter = handleWritingAssistant(message, chat_history || [], llm);
    
    emitter.on("data", (data) => {
      res.write(`data: ${data}\n\n`);
    });

    emitter.on("end", () => {
      res.end();
    });

    emitter.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", data: error.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error("Writing assistant error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", data: err.message })}\n\n`);
    res.end();
  }
});

// Suggestions endpoint
app.post("/api/suggestions", async (req, res) => {
  const { chat_history } = req.body;

  try {
    const suggestions = await generateSuggestions({ chat_history: chat_history || [] }, llm);
    res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error("Suggestions error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Perplexity Clone - Running        ║
║     http://localhost:${PORT}                 ║
║                                        ║
║  All 8 Agents Available:              ║
║  • Web Search                          ║
║  • Academic Search                     ║
║  • Reddit Search                       ║
║  • YouTube Search                      ║
║  • Video Search                        ║
║  • Writing Assistant                   ║
║  • Image Search                        ║
║  • Suggestion Generator                ║
╚════════════════════════════════════════╝
  `);
});