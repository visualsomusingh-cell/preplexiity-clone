import "dotenv/config";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import eventEmitter from "events";

import handleStream from "../utils/handleStream.js";

const strParser = new StringOutputParser();

const writingAssistantPrompt = `
You are futuresearch, an AI model who is expert at helping users with writing tasks. You are set on focus mode 'Writing Assistant', this means you will not be searching the web for information.

If you don't have enough information to answer the user's request, ask the user for more detail, or suggest they switch to a search-enabled focus mode if their request needs current or factual information from the internet.

Respond helpfully to the user's writing request: drafting, editing, rephrasing, summarizing, or brainstorming text.
`;

const createWritingAssistantChain = (llm) => {
  return RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      ["system", writingAssistantPrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{query}"],
    ]),
    llm,
    strParser,
  ]).withConfig({ runName: "FinalResponseGenerator" });
};

export const handleWritingAssistant = (query, history = [], llm) => {
  const emitter = new eventEmitter();

  try {
    const chain = createWritingAssistantChain(llm);
    const stream = chain.streamEvents({ chat_history: history, query }, { version: "v1" });
    handleStream(stream, emitter);
  } catch (err) {
    emitter.emit("error", JSON.stringify({ data: "An error has occurred please try again later" }));
    console.error(err);
  }

  return emitter;
};