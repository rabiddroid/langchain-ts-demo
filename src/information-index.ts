
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";








export const loadInformationVectorStore = async () => {
    
    if (!process.env.VECTOR_STORE_DIRECTORY) {
        throw new Error("VECTOR_STORE_DIRECTORY environment variable not set");
    }

    // args.json file required in vectorStoreDirectory since we are creating the instance from a directory
    return HNSWLib.load(process.env.VECTOR_STORE_DIRECTORY, new OpenAIEmbeddings());

};



