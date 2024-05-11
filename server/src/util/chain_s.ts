import {OpenAIEmbeddings} from '@langchain/openai';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import {OpenAI} from '@langchain/openai';
import {loadQAStuffChain} from 'langchain/chains';
import {Document} from 'langchain/document';
import type { QueryResponse} from '@pinecone-database/pinecone';
import { PromptTemplate } from '@langchain/core/prompts';
import path from "path";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const insertDocument = async (index:any, doc: Document) => {
  const text = doc.pageContent;
  const documentName = doc.metadata.documentName;

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });

  const chunks = await textSplitter.createDocuments([text]);

  const embeddingsArrays = await new OpenAIEmbeddings( {openAIApiKey: process.env.OPEN_AI_KEY ?? '' }).embedDocuments(
    chunks.map((chunk) => chunk.pageContent.replace(/\n/g, ' ')),
  );

  console.log("embed created");

  const batchSize = 100;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  let batch: any = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = {
      id: `${documentName}_${i}`,
      values: embeddingsArrays[i],
      metadata: {
        ...chunk.metadata,
        loc: JSON.stringify(chunk.metadata.loc),
        pageContent: chunk.pageContent,
        documentName,
      },
    };
    batch.push(vector);

    if (batch.length === batchSize || i === chunks.length - 1) {
      await index.upsert(batch);

      batch = [];
    }
  }
};

export async function queryPinecone(
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  index:any,
  question: string,
  documentName: string,
) {
  const queryEmbedding = await new OpenAIEmbeddings({openAIApiKey: process.env.OPEN_AI_KEY ?? '' }).embedQuery(question);

  const queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,
    filter: {documentName: {$eq: documentName}},
  });

  return queryResponse;
}

type Source = {
  pageContent: string;
  score: number;
};
export type LLMResponse = {
  result: string;
  sources: Source[];
};

export async function queryLLM(
  queryResponse: QueryResponse,
  question: string,
): Promise<LLMResponse> {

  const llm = new OpenAI({
    openAIApiKey: process.env.OPEN_AI_KEY ?? '' ,
    temperature: 0.4,
    modelName: 'gpt-4-turbo',
  });

  const promptTemplate = `Use the following pieces of context to answer the question at the end. I only want the answer have to be in this format: xx:xx:xx.xxx --> xx:xx:xx.xxx.

{context}

Question: {question}
`;

const prompt = PromptTemplate.fromTemplate(promptTemplate);

  const chain = loadQAStuffChain(llm,  { prompt });

  const concatenatedPageContent = queryResponse.matches
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    .map((match: any) => match.metadata.pageContent)
    .join('');

  const result = await chain.invoke({
    input_documents: [new Document({pageContent: concatenatedPageContent})],
    question: question,
  });

  console.log('success create response');
  console.log('response', result);

  const output = result.text;
  console.log('type of output: ' + typeof output);

  const [start, end] = extractTimes(output);

  console.log("starting time: " + start);
  console.log("ending time: " + end);

  const inputFilePath = path.join(__dirname, `../result/temp_audio_1.mp4`);
  
  const outputFilePath = path.join(__dirname, `../result/clip.mp4`);

  await extractClip(inputFilePath, start, end, outputFilePath);

  console.log("Output file: " + outputFilePath);
  

  return {
    result: result.text,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    sources: queryResponse.matches.map((x) => ({
      pageContent: x.metadata!.pageContent,
      score: x.score,
    })),
  };
}

async function extractClip(inputFilePath: string, startTime: number, endTime: number, outputFilePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath!, [
      '-y',
      '-i', inputFilePath,
      '-ss', startTime.toString(),
      '-to', endTime.toString(),
      '-c', 'copy',
      outputFilePath
    ]);

    ffmpegProcess.stderr.on('data', (data) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Clip extracted successfully');
        resolve(outputFilePath);
      } else {
        console.error(`Error extracting clip. ffmpeg process exited with code ${code}`);
        reject(new Error(`Error extracting clip. ffmpeg process exited with code ${code}`));
      }
    });
  });
}

function timeToSeconds(time: string): number {
  const [hoursStr, minutesStr, secondsStr] = time.split(':');
  const secondsParts = secondsStr.split('.');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  const seconds = parseInt(secondsParts[0]);
  const milliseconds = secondsParts.length > 1 ? parseInt(secondsParts[1]) : 0;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

function extractTimes(timestamp: string): [number, number] {
  const [time1, time2] = timestamp.split(' --> ');
  const startTimeInSeconds = timeToSeconds(time1);
  const endTimeInSeconds = timeToSeconds(time2);
  return [Math.round(startTimeInSeconds), Math.round(endTimeInSeconds)];
}