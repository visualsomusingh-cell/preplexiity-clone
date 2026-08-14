import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { searchSearxng } from "../lib/searxng.js";
import formatChatHistoryAsString from "../utils/formatHistory.js";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});

const strParser = new StringOutputParser();

const videoSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question suitable for searching Youtube for a relevant video. Word it like a short search query, not a full sentence.

Example:
1. Follow up question: How does a rocket engine work?
Rephrased: rocket engine working

2. Follow up question: Show me how to tie a tie
Rephrased: how to tie a tie

Conversation:
{chat_history}
Follow up question: {query}
Rephrased question:
`;

const createVideoSearchChain = (llm) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input) => formatChatHistoryAsString(input.chat_history),
      query: (input) => input.query,
    }),
    PromptTemplate.fromTemplate(videoSearchChainPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input) => {
      const res = await searchSearxng(input, { engines: ["youtube"] });

      const results = [];

      res.results.forEach((result) => {
        if (result.thumbnail && result.url && result.title && result.iframe_src) {
          results.push({
            img_src: result.thumbnail,
            url: result.url,
            title: result.title,
            iframe_src: result.iframe_src,
          });
        }
      });

      return results.slice(0, 10);
    }),
  ]);
};

export const handleVideoSearch = async (message, chat_history = [], llm, embeddings) => {
  const chain = createVideoSearchChain(llm);
  const videos = await chain.invoke({ chat_history, query: message });
  return videos;
};