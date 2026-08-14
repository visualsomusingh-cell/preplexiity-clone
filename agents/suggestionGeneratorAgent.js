import "dotenv/config";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";

import formatChatHistoryAsString from "../utils/formatHistory.js";
import ListLineOutputParser from "../lib/outputParsers/listLineOutputParser.js";

const outputParser = new ListLineOutputParser({ key: "suggestions" });

const suggestionGeneratorPrompt = `
Based on the conversation below, generate 4-5 relevant, medium-length follow-up questions the user might want to ask next. Wrap your list in <suggestions></suggestions> tags, one question per line, with no numbering or bullets.

Conversation:
{chat_history}
`;

const createSuggestionGeneratorChain = (llm) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input) => formatChatHistoryAsString(input.chat_history),
    }),
    PromptTemplate.fromTemplate(suggestionGeneratorPrompt),
    llm,
    outputParser,
  ]);
};

export const generateSuggestions = (input, llm) => {
  // Force temperature = 0 for consistent, less repetitive suggestions
  llm.temperature = 0;
  return createSuggestionGeneratorChain(llm).invoke(input);
};