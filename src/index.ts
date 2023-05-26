import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BaseChain, ConversationalRetrievalQAChain, RetrievalQAChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { prompt } from './prompt.ts';

dotenv.config();

const MODEL_NAME = "text-davinci-003";// "gpt-3.5-turbo";
// Save the vector store to a directory
const vectorStoreDirectory = "/Users/jeffrey.thomas/Development/personal/langchain-ts-demo/vector-store-db";


export const run = async () => {
  // Initialize the LLM to use to answer the question.
  const model =
    new OpenAI({
      modelName: MODEL_NAME,
      openAIApiKey: process.env.OPENAI_API_KEY,
      cache: true,
    });

  // args.json file required in vectorStoreDirectory since we are creating the instance from a directory
  const loadedVectorStore = await HNSWLib.load(vectorStoreDirectory, new OpenAIEmbeddings());

  // splitpages helps or we go over token limits
  const loader1 = new PDFLoader("/Users/jeffrey.thomas/Development/personal/langchain-ts-demo/resources/Risk-Wiki.pdf", { splitPages: true });
  const docs = await loader1.load();
  const loader2 = new PDFLoader("/Users/jeffrey.thomas/Development/personal/langchain-ts-demo/resources/Risk-Hashbro.pdf", { splitPages: true });
  const docs2 = await loader2.load();


  // Create a vector store from the documents.
  loadedVectorStore.addDocuments(docs);
  loadedVectorStore.addDocuments(docs2);
  loadedVectorStore.save(vectorStoreDirectory);

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