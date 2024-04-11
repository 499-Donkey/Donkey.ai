import { Pinecone } from '@pinecone-database/pinecone';

export async function initPinecone() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });
    console.log('pinecore api check');
    
    await pinecone.createIndex({
      name: 'temp-index',
      dimension: 1536,
      metric:"cosine",
      spec: {
        pod: {
          environment: 'us-east1-gcp',
          pods: 1,
          podType: 's1.x1'
        }
      },
      suppressConflicts: true,
      waitUntilReady: true,
    });
    console.log('sucessful pinecone index creation');
    
    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}