import { OpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";


const llm = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// No need for initPinecone function anymore

export async function getAIResponse(query: string) {
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
  const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), { pineconeIndex: index });

  // Perform semantic search
  const results = await vectorStore.similaritySearch(query, 3);
  const context = results.map((r) => r.pageContent).join("\n");

  // Generate response
  const prompt = `Given this context: ${context}\n\nAnswer the query: ${query}`;
  const response = await llm.call(prompt);
  return response;
}