import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { prompt } from './prompt.ts';

dotenv.config();

const MODEL_NAME = "text-davinci-003";// "gpt-3.5-turbo";



export const run = async () => {
  // Initialize the LLM to use to answer the question.
  const model = 
  new OpenAI({
    modelName: MODEL_NAME,
    openAIApiKey: process.env.OPENAI_API_KEY,
    cache: true,
  });


  const loader = new PDFLoader("/Users/jeffrey.thomas/Development/personal/langchain-ts-demo/resources/Risk-Wiki.pdf", { splitPages: true });
  // Load one document per file
  const docs = await loader.load();

  // const text = fs.readFileSync("state_of_the_union.txt", "utf8");
  // const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  // const docs = await textSplitter.createDocuments([text]);

  // Create a vector store from the documents.
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  // Create a chain that uses the OpenAI LLM and HNSWLib vector store.
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());


  const question = await prompt('What is your question about the game - Risk?\n');
  
  const res = await chain.call({
    query: question,
  });

  console.log({ res });

};


await run();