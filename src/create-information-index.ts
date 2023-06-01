import { promises as fsPromises } from "fs";
import { join } from "path";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import * as dotenv from "dotenv";

dotenv.config();

export const createInformationVectorStore = async () => {
  if (!process.env.VECTOR_STORE_DIRECTORY) {
    throw new Error("VECTOR_STORE_DIRECTORY environment variable not set");
  }

  if (!process.env.INFORMATION_FILES_DIRECTORY) {
    throw new Error("INFORMATION_FILES_DIRECTORY environment variable not set");
  }

  const informationFiles = await readFilenamesFromDirectory(
    process.env.INFORMATION_FILES_DIRECTORY
  );

  if (!informationFiles.length) {
    throw new Error("No files found in directory");
  }
  // args.json file required in vectorStoreDirectory since we are creating the instance from a directory
  const loadedVectorStore = new HNSWLib(new OpenAIEmbeddings(), {
    space: "cosine",
    numDimensions: 1536,
  });

  // splitpages helps or we go over token limits
  const addDocuments = informationFiles
    .map((file) => new PDFLoader(file, { splitPages: true }))
    .map(async (loader) => {
      const docs = await loader.load();
      await loadedVectorStore.addDocuments(docs);
    });

  await Promise.all(addDocuments);

  loadedVectorStore.save(process.env.VECTOR_STORE_DIRECTORY);

  return loadedVectorStore;
};

async function readFilenamesFromDirectory(
  directoryPath: string
): Promise<string[]> {
  try {
    const files = await fsPromises.readdir(directoryPath);
    const filePaths = files.map((file) => join(directoryPath, file));
    return filePaths;
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
}

await createInformationVectorStore();
