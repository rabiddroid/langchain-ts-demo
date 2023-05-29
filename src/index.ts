import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { BaseChain, ConversationalRetrievalQAChain } from "langchain/chains";

import { prompt } from './prompt.ts';
import { informationVectorStore } from "./information-index.ts";

dotenv.config();

const MODEL_NAME = "text-davinci-003";// "gpt-3.5-turbo";
// Save the vector store to a directory


export const run = async () => {
  // Initialize the LLM to use to answer the question.
  const model =
    new OpenAI({
      modelName: MODEL_NAME,
      openAIApiKey: process.env.OPENAI_API_KEY,
      cache: true,
    });


  const loadedVectorStore = await informationVectorStore();
  // Create a chain that uses the OpenAI LLM and HNSWLib vector store.
  const chain = ConversationalRetrievalQAChain.fromLLM(model, loadedVectorStore.asRetriever());

  await answerQuestion(chain);

};

async function answerQuestion(chain: BaseChain, chatHistory: string[] = []) {

  const question = await prompt('What is your question about the game - Risk?\n');
  if (question.trim().toLowerCase() === 'quit') {
    return;
  }

  const res = await chain.call({
    question,
    chat_history: [],
  });
  console.log({ res });

  chatHistory.push(question + res.text);
  await answerQuestion(chain, chatHistory);
}

await run();