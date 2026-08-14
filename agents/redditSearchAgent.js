import "dotenv/config";
import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from "@langchain/core/runnables";
import {
  PromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import eventEmitter from "events";

import { searchSearxng } from "../lib/searxng.js";
import formatChatHistoryAsString from "../utils/formatHistory.js";
import computeSimilarity from "../utils/computeSimilarity.js";
import handleStream from "../utils/handleStream.js";

const strParser = new StringOutputParser();

const basicRedditSearchRetrieverPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question if needed so it is a standalone question that can be used to search Reddit for information.
If it is a writing task or a simple hi, hello rather than a question, you need to return \`not_needed\` as the response.

Example:
1. Follow up question: What do people think about the new iPhone?
Rephrased: New iPhone opinions

2. Follow up question: Is renting better than buying a house?
Rephrased: Renting vs buying a house

Conversation:
{chat_history}
Follow up question: {query}
Rephrased question:
`;

const basicRedditSearchResponsePrompt = `
You are futuresearch, an AI model who is expert at searching the web and answering user's queries. You are set on focus mode 'Reddit', this means you will be searching for information, opinions and discussions on Reddit and providing the answer based on the information retrieved by Reddit.

Generate a response that is informative and relevant to the user's query based on provided context. Use an unbiased and journalistic tone. Do not repeat the text.
You must not tell the user to open any link or visit any website. Provide the answer in the response itself.
You have to cite the answer using [number] notation, citing the relevant context number at the end of each sentence.

<context>
{context}
</context>

If there's nothing relevant in the search results, say 'Hmm, sorry I could not find any relevant information on this topic. Would you like me to search again or ask something else?'.
Today's date is ${new Date().toISOString()}
`;

const createBasicRedditSearchRetrieverChain = (llm) => {
  return RunnableSequence.from([
    PromptTemplate.fromTemplate(basicRedditSearchRetrieverPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input) => {
      if (input === "not_needed") {
        return { query: "", docs: [] };
      }

      const res = await searchSearxng(input, {
        language: "en",
        engines: ["reddit"],
      });

      const documents = res.results.map(
        (result) =>
          new Document({
            pageContent: result.content ? result.content : result.title,
            metadata: {
              title: result.title,
              url: result.url,
              ...(result.img_src && { img_src: result.img_src }),
            },
          })
      );

      return { query: input, docs: documents };
    }),
  ]);
};

const createBasicRedditSearchAnsweringChain = (llm, embeddings) => {
  const retrieverChain = createBasicRedditSearchRetrieverChain(llm);

  const processDocs = async (docs) => {
    return docs.map((_, index) => `${index + 1}. ${docs[index].pageContent}`).join("\n");
  };

  const rerankDocs = async ({ query, docs }) => {
    if (docs.length === 0) return docs;

    const docsWithContent = docs.filter((doc) => doc.pageContent && doc.pageContent.length > 0);

    const [docEmbeddings, queryEmbedding] = await Promise.all([
      embeddings.embedDocuments(docsWithContent.map((doc) => doc.pageContent)),
      embeddings.embedQuery(query),
    ]);

    const similarity = docEmbeddings.map((docEmbedding, i) => ({
      index: i,
      similarity: computeSimilarity(queryEmbedding, docEmbedding),
    }));

    return similarity
      .sort((a, b) => b.similarity - a.similarity) // most-similar first (bug fixed)
      .filter((sim) => sim.similarity > 0.5)
      .slice(0, 15)
      .map((sim) => docsWithContent[sim.index]);
  };

  return RunnableSequence.from([
    RunnableMap.from({
      query: (input) => input.query,
      chat_history: (input) => input.chat_history,
      context: RunnableSequence.from([
        (input) => ({
          query: input.query,
          chat_history: formatChatHistoryAsString(input.chat_history),
        }),
        retrieverChain
          .pipe(rerankDocs)
          .withConfig({ runName: "FinalSourceRetriever" })
          .pipe(processDocs),
      ]),
    }),
    ChatPromptTemplate.fromMessages([
      ["system", basicRedditSearchResponsePrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{query}"],
    ]),
    llm,
    strParser,
  ]).withConfig({ runName: "FinalResponseGenerator" });
};

export const handleRedditSearch = (query, history = [], llm, embeddings) => {
  const emitter = new eventEmitter();

  try {
    const chain = createBasicRedditSearchAnsweringChain(llm, embeddings);
    const stream = chain.streamEvents({ chat_history: history, query }, { version: "v1" });
    handleStream(stream, emitter);
  } catch (err) {
    emitter.emit("error", JSON.stringify({ data: "An error has occurred please try again later" }));
    console.error(err);
  }

  return emitter;
};