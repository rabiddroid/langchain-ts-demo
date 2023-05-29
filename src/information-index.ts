import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { promises as fsPromises } from 'fs';
import { join } from 'path';


const vectorStoreDirectory = "/Users/jeffrey.thomas/Development/personal/langchain-ts-demo/vector-store-db";


export const informationVectorStore = async () => {


    if (!process.env.INFORMATION_FILES_DIRECTORY) {
        throw new Error("INFORMATION_FILES_DIRECTORY environment variable not set");
    }

    const informationFiles = await readFilenamesFromDirectory(process.env.INFORMATION_FILES_DIRECTORY);

    if (!informationFiles.length) {
        throw new Error("No files found in directory");
    }
    // args.json file required in vectorStoreDirectory since we are creating the instance from a directory
    const loadedVectorStore = await HNSWLib.load(vectorStoreDirectory, new OpenAIEmbeddings());


    // splitpages helps or we go over token limits
    informationFiles
        .map((file) => new PDFLoader(file, { splitPages: true }))
        .map(async (loader) => loader.load())
        .map(async (docs) => loadedVectorStore.addDocuments(await docs));

    loadedVectorStore.save(vectorStoreDirectory);


    return loadedVectorStore;

};

async function readFilenamesFromDirectory(directoryPath: string): Promise<string[]> {
    try {
        const files = await fsPromises.readdir(directoryPath);
        const filePaths = files.map((file) => join(directoryPath, file));
        return filePaths;
    } catch (err) {
        console.error('Error reading directory:', err);
        return [];
    }
}
