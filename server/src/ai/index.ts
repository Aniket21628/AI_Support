import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI } from "@langchain/openai";

const llm = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new PineconeClient();

export async function initPinecone() {
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!, // e.g., "us-east-1-aws"
  });

  const indexName = process.env.PINECONE_INDEX_NAME!;
  const existingIndexes = await pinecone.listIndexes();

  if (!existingIndexes.includes(indexName)) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    await new Promise((res) => setTimeout(res, 60000));
  }
}

export async function getAIResponse(query: string) {
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY }),
    { pineconeIndex: index }
  );

  const results = await vectorStore.similaritySearch(query, 3);
  const context = results.map((r) => r.pageContent).join("\n");

  const prompt = `Given this context: ${context}\n\nAnswer the query: ${query}`;
  return await llm.invoke(prompt);
}
