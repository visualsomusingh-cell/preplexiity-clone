# Perplexity Clone — 8 Search & Chat Agents (LangChain, RunnableSequence)

A plain-LangChain (no LangGraph) rebuild of Perplexica's 8 focus-mode agents,
using `RunnableSequence` / `RunnableMap` / `RunnableLambda` composition
end-to-end, per the assignment spec.

## Provider choices (deviates from the given reference code)

The reference `academicSearchAgent.js` / `imageSearchAgent.js` use OpenAI
(`ChatOpenAI`, `OpenAIEmbeddings`). This project uses **free alternatives
instead**, so the repo runs with zero paid API cost for anyone who clones it:

| Purpose | Provider used | Why |
|---|---|---|
| Chat / LLM | **Groq** (`llama-3.3-70b-versatile`) | Free tier, fast inference |
| Embeddings | **Google Gemini** (`gemini-embedding-001`) | Free tier, no local model download needed |
| Search (SearXNG) | **Self-hosted on Railway** | No Docker/local virtualization required to run or review this project; JSON API pre-enabled via the `searxng-valkey-ai-search` Railway template |

Because `llm` and `embeddings` are only ever used via LangChain's shared
`BaseChatModel` / `Embeddings` interfaces inside every agent, swapping
providers required **zero changes** to the actual `RunnableSequence` logic —
only the two constructor calls at the top of each file changed.

### Required environment variables (`.env`)

```
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
SEARXNG_API_URL=https://your-instance.up.railway.app
```

Get a free Groq key at console.groq.com, a free Gemini key at
aistudio.google.com/apikey, and deploy your own SearXNG instance from the
Railway template linked above (or self-host with Docker if virtualization is
available on your machine).

## Known issue: rerank sort-direction bug (Section 1.3)

The given `academicSearchAgent.js` reference sorts reranked documents
**ascending** by similarity:

```js
.sort((a, b) => a.similarity - b.similarity)
```

This keeps the *least*-similar documents above the 0.5 threshold, not the
most relevant ones — the opposite of the intended behavior.

- **Fixed** in our own `redditSearchAgent.js`, `webSearchAgent.js`, and
  `youtubeSearchAgent.js` (changed to `(b.similarity - a.similarity)`,
  descending).
- **Left unfixed** in `academicSearchAgent.js`, per the assignment's
  instruction not to silently modify the given reference file — this is
  flagged here instead, as required.

## Architecture recap

Every agent is built from the same primitives, composed differently per
Section 0 of the assignment:

- **Group A** (reddit, web, youtube, academic): rephrase query →
  `RunnableLambda` search step → `rerankDocs` (embedding cosine similarity)
  → `processDocs` (numbered context string) → cited streamed answer.
  Streamed via `.streamEvents()` + the shared `utils/handleStream.js`,
  which watches for the `FinalSourceRetriever` and `FinalResponseGenerator`
  tagged runs.
- **Group B** (image, video): rephrase query → `RunnableLambda` search step
  → shape/guard/cap results. Plain `.invoke()`, no streaming, no reranking.
- **writingAssistantAgent**: no search step at all — single
  `ChatPromptTemplate` → `llm` → `strParser` chain, still tagged
  `FinalResponseGenerator` so it shares the exact same streaming contract as
  Group A (no frontend special-casing needed).
- **suggestionGeneratorAgent**: takes only `chat_history` (no `query`),
  uses a custom `ListLineOutputParser` to pull `<suggestions>` out of the
  LLM's raw text, forces `temperature = 0` for consistency, and returns a
  plain array via `.invoke()` — no streaming.

## Where `suggestionGeneratorAgent` is called (Section 4 decision)

**Decision:** called from the same route handler, immediately after the
main agent's stream emits `"end"`, using the chat history with the new AI
response appended. This avoids a second round-trip/endpoint from the
frontend and keeps suggestion generation tied to the same request lifecycle
as the answer it's based on.

## Single dispatch point

`agents/dispatch.js` maps a `focusMode` string to its handler function,
split into two lookup tables (`streamedAgents` for Group A/C,
`invokeAgents` for Group B), rather than branching per-route:

```js
import { getStreamedHandler, isStreamedMode, getInvokeHandler, isInvokeMode } from "./agents/dispatch.js";
```

## Manual testing performed (Section 5)

Each agent was tested standalone via a `test-*.js` script before any route
wiring, per Section 5's guidance to avoid debugging through the full
HTTP/WS stack first:

| Agent | Test file | Confirmed |
|---|---|---|
| redditSearchAgent | `test-reddit.js` | Real Reddit-flavored results reranked, streamed answer with citations |
| webSearchAgent, youtubeSearchAgent | (same pattern as reddit) | Provider swap verified, streaming contract intact |
| academicSearchAgent | (dispatch test) | Provider swap verified against given reference logic |
| videoSearchAgent | `test-video.js` | 10 results, all 4 required fields present |
| imageSearchAgent | `test-image.js` | 10 results, all 3 required fields present |
| writingAssistantAgent | `test-writing-suggestion.js` | No search performed, correctly asked for clarification when under-specified |
| suggestionGeneratorAgent | `test-writing-suggestion.js` | 4-5 relevant follow-ups generated from fake chat history |
| dispatch.js | `test-dispatch.js` | Correct routing for streamed/invoke modes, `false` for unknown mode |

## Setup

```
npm install
# add your .env keys (see above)
node test-dispatch.js   # sanity check that everything is wired correctly
```