import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";

const llm = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function initPinecone() {
  const indexName = process.env.PINECONE_INDEX_NAME!;
  const { indexes } = await pinecone.listIndexes();

  const indexExists = Array.isArray(indexes) && indexes.some((idx) => idx.name === indexName);
  if (!indexExists) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1", // or your environment region
        },
      },
    });
    await new Promise((res) => setTimeout(res, 60000)); // wait for index creation
  }
}

export async function getAIResponse(query: string) {
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY! }),
    { pineconeIndex: index }
  );

  const results = await vectorStore.similaritySearch(query, 3);
  const context = results.map((r) => r.pageContent).join("\n");

  const prompt = `Given this context: ${context}\n\nAnswer the query: ${query}`;
  return await llm.invoke(prompt);
}
