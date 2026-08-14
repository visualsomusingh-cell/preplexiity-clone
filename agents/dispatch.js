import { handleAcademicSearch } from "./academicSearchAgent.js";
import { handleImageSearch } from "./imageSearchAgent.js";
import { handleRedditSearch } from "./redditSearchAgent.js";
import { handleWebSearch } from "./webSearchAgent.js";
import { handleYoutubeSearch } from "./youtubeSearchAgent.js";
import { handleVideoSearch } from "./videoSearchAgent.js";
import { handleWritingAssistant } from "./writingAssistantAgent.js";
import { generateSuggestions } from "./suggestionGeneratorAgent.js";

/**
 * Single lookup table: focusMode string -> handler function.
 * Group A/C agents (streamed) return an eventEmitter.
 * Group B agents (list) and suggestionGenerator return a Promise directly.
 */
const streamedAgents = {
  academic: handleAcademicSearch,
  reddit: handleRedditSearch,
  web: handleWebSearch,
  youtube: handleYoutubeSearch,
  writingAssistant: handleWritingAssistant,
};

const invokeAgents = {
  image: handleImageSearch,
  video: handleVideoSearch,
};

export const isStreamedMode = (focusMode) => focusMode in streamedAgents;
export const isInvokeMode = (focusMode) => focusMode in invokeAgents;

export const getStreamedHandler = (focusMode) => streamedAgents[focusMode];
export const getInvokeHandler = (focusMode) => invokeAgents[focusMode];

export { generateSuggestions };