import "dotenv/config";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { searchSearxng } from "../lib/searxng.js";
import formatChatHistoryAsString from "../utils/formatHistory.js";

const strParser = new StringOutputParser();

const imageSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question suitable for searching for a relevant image. Word it like a short search query, not a full sentence.

Example:
1. Follow up question: What does the Eiffel Tower look like at night?
Rephrased: Eiffel Tower at night

2. Follow up question: Show me a golden retriever puppy
Rephrased: golden retriever puppy

Conversation:
{chat_history}
Follow up question: {query}
Rephrased question:
`;

const createImageSearchChain = (llm) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input) => formatChatHistoryAsString(input.chat_history),
      query: (input) => input.query,
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input) => {
      const res = await searchSearxng(input, {
        categories: ["images"],
        engines: ["bing images", "google images"],
      });

      const results = [];

      res.results.forEach((result) => {
        if (result.img_src && result.url && result.title) {
          results.push({
            img_src: result.img_src,
            url: result.url,
            title: result.title,
          });
        }
      });

      return results.slice(0, 10);
    }),
  ]);
  // NOTE: no `not_needed` branch, per section 2.2 -- every follow-up gets
  // searched, consistent with videoSearchAgent.
};

export const handleImageSearch = async (message, chat_history = [], llm, embeddings) => {
  const chain = createImageSearchChain(llm);
  const images = await chain.invoke({ chat_history, query: message });
  return images;
};