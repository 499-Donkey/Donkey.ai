import { Pinecone } from '@pinecone-database/pinecone';

export async function initPinecone() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });
    
    // Check existing indices
    const result = await pinecone.listIndexes();
    const existingIndices = result.indexes; 
    const indexName = 'temp-index';

    // Check if the index exists and has the correct type
    if (Array.isArray(existingIndices) && existingIndices.some((index: { name: string }) => index.name === indexName)) {
      console.log(`Index ${indexName} already exists.`);
    } else {
      console.log('Creating new Pinecone index...');
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        metric: "cosine",
        spec: {
          pod: {
            environment: 'gcp-starter',
            pods: 1,
            podType: 'p1.x1'
          }
        },
        suppressConflicts: true,
        waitUntilReady: true,
      });
      console.log(`Successful Pinecone index creation for ${indexName}.`);
    }
    
    return pinecone;
  } catch (error) {
    console.error('Pinecone initialization error:', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}
