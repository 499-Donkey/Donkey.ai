import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { NextFunction, Request, Response } from "express";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import openaiTokenCounter from 'openai-gpt-token-counter';
import { initPinecone } from '../util/pinecone_connect';
import { PineconeStore  } from '@langchain/pinecone';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '../models/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Document } from "langchain/document";
import { makeChain } from '../util/chain';


const MAX_TOKENS = 4096;

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  try {
    let transcript = "";
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSize = file.size;

      console.log("size is: " + fileSize);
      const filePath = path.join(__dirname, `../result/temp_audio_${i + 1}.mp4`);
      fs.writeFileSync(filePath, file.buffer);
      const convertedFilePath = await convertToOpus(filePath);
      const fileTranscript = await getTranscript(convertedFilePath);
      transcript += `Video ${i + 1}:\n${fileTranscript}\n\n`;
    }

    const transcriptFilePath = path.join(__dirname, "../result/transcript.txt");
    fs.writeFileSync(transcriptFilePath, transcript);

    const model = "gpt-3.5-turbo";
    const transcriptTokens:number = openaiTokenCounter.text(transcript, model);
    console.log("length of transcriptTokens: ", transcriptTokens);

    let analysis: string = "";
    let sumAnalysis: string = "";
    let contentToWrite: string = "";
    
    if (transcriptTokens > MAX_TOKENS) {
      console.log("The tokens are bigger than 4096, processing large transcript");
      ({ analysis, sumAnalysis } = await processLargeTranscript(transcript));
      contentToWrite = sumAnalysis;
      fs.writeFileSync(path.join(__dirname, "../result/chatAnalysis.txt"), contentToWrite);
    } else {
      console.log("The tokens are smaller than 4096, processing transcript");
      analysis = await getFinalAnalysis(transcript);
      contentToWrite = transcript;
      fs.writeFileSync(path.join(__dirname, "../result/chatAnalysis.txt"), contentToWrite);
    }

    
  
    res.status(200).json({ transcript, transcriptFilePath, analysis, sumAnalysis});
  } catch (error) {
    next(error);
  }
};

const tokenPartSize = 500 * 4;
async function processLargeTranscript(transcript: string):  Promise<{ analysis: string, sumAnalysis: string }> {
  const transcriptChunks = chunkTranscript(transcript, tokenPartSize);
  let analysis = '';
  let i = 0;
  let sumAnalysis = '';
  for (const chunk of transcriptChunks) {
    const transcriptFilePath = path.join(__dirname, `../result/transcript_${i + 1}.txt`);
    i++;
    fs.writeFileSync(transcriptFilePath, chunk);
    const chunkAnalysis = await getChunksAnalysis(chunk);
    sumAnalysis += chunkAnalysis + '\n';
    console.log(chunkAnalysis, "=>>")
    removeFile(transcriptFilePath);
  }
  const analysisCombine = await getFinalAnalysis(sumAnalysis);
  analysis += analysisCombine + '\n';
  return {analysis, sumAnalysis};
}

function chunkTranscript(transcript: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < transcript.length; i += chunkSize) {
		chunks.push(transcript.slice(i, i + chunkSize));
	}
  return chunks;
}

function removeFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
      fs.unlink(filePath, (error) => {
          if (error) {
              reject(error);
          } else {
              resolve();
          }
      });
  });
}

async function convertToOpus(inputFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFilePath = inputFilePath.replace('.mp4', '.ogg');
    const ffmpegProcess = spawn(ffmpegPath!, [
      '-y',
      '-i', inputFilePath,
      '-vn',
      '-map_metadata', '-1',
      '-ac', '1',
      '-c:a', 'libopus',
      '-b:a', '12k',
      '-application', 'voip',
      outputFilePath
    ]);

    ffmpegProcess.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputFilePath);
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
  });
}


export const chatWithUser = async (req: Request, res: Response, next: NextFunction) =>  {
  try {
    console.log("trying to chat");
    const analysisFilePath = path.join(__dirname, "../result/chatAnalysis.txt");
    let analysis = fs.readFileSync(analysisFilePath, "utf8");

    const analysisTokens = openaiTokenCounter.text(analysis, "gpt-3.5-turbo");
    if (analysisTokens > MAX_TOKENS) {
      console.log("Analysis exceeds token limit, chunking for processing");
      const chunks = chunkTranscript(analysis, tokenPartSize); 
      analysis = ""; 

      for (const chunk of chunks) {
        const chunkResponse = await askQuestion(chunk, req.body.question);
        analysis += chunkResponse + "\n";  
      }
    } else {
      analysis = await askQuestion(analysis, req.body.question);
    }

    res.status(200).json({ answer: analysis });
  } catch (error) {
    next(error);
  }
}

async function askQuestion(analysis: string, question: string): Promise<string> {
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Please answer the question based on the analysis, which is from videos or audios:" },
      { role: "user", content: analysis },
      { role: "user", content: question },
    ],
  };

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    data,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}


async function getTranscript(audioFilePath: string) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFilePath));
    formData.append("model", "whisper-1");
    formData.append("response_format", "vtt");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/translations",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in getTranscript:", error);
    throw new Error("Error in getTranscript");
  }
}


function getChunksAnalysis(transcript: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      const data = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "I need a structured timeline of a speech transcript organized by topics. Please format it as follows: For each segment of the speech, specify the start and end times, list the key words, and provide a concise summary. Use this template for each topic: [xx:xx:xx - xx:xx:xx]: [Topic]: [summary]; [xx:xx:xx - xx:xx:xx]: [Topic]: [summary]; and so on. Ensure that each topic is clearly separated, include relevant search-friendly keywords that capture the essence of each section, and make sure the summaries are detailed yet succinct. The entire timeline should be concise, ideally not exceeding 500 words, capturing all significant points from the speech." },
          { role: "user", content: transcript },
        ],
      };
      
      axios.post(
        "https://api.openai.com/v1/chat/completions",
        data,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => resolve(response.data.choices[0].message.content))
      .catch(error => {
        console.error("Error in getChunksAnalysis:", error);
        reject(new Error("Error in getChunksAnalysis"));
      });
    }, 3000);
  });
}

function getFinalAnalysis(transcript: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      const data = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "I need you to generate a timeline to help me understand the analysis clearly. Format the timeline as follows: For each topic, specify the start and end times, and provide a concise summary. Use this format:  [xx:xx:xx - xx:xx:xx]: [Topic]: [summary]; [xx:xx:xx - xx:xx:xx]: [Topic]: [summary];... Make sure to clearly demarcate different topics and ensure the summaries capture the key details." },
          { role: "user", content: transcript },
        ],
      };
      
      axios.post(
        "https://api.openai.com/v1/chat/completions",
        data,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(response => resolve(response.data.choices[0].message.content))
      .catch(error => {
        console.error("Error in getFinalAnalysis:", error);
        reject(new Error("Error in getFinalAnalysis"));
      });
    }, 3000);
  });
}

type SessionId = string;

// Simulated in-memory chat history storage
const chatHistoryStore: Record<SessionId, { role: string, content: string }[]> = {};

export const extractVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("trying to Extract video");
  const filePath = path.join(__dirname, "../result/transcript.txt");
  
  const transcript = fs.readFileSync(filePath, "utf8");

  try {
    const sessionId = req.body.sessionId as SessionId;  
    const chatHistory = chatHistoryStore[sessionId] || [];

    const userQuery = req.body.userEnter.trim().replaceAll('\n', ' ');
    chatHistory.push({ role: 'user', content: userQuery });

    console.log("User enter: " + req.body.userEnter);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments([new Document({ pageContent: transcript }),]);

    // console.log('split docs', docs);

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPEN_AI_KEY ?? '',
      modelName: "text-embedding-ada-002",
    }
    );
    const pinecone = await initPinecone();
    
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    console.log('success create vector store');

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    const sanitizedQuestion = req.body.userEnter.trim().replaceAll('\n', ' ');

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({openAIApiKey: process.env.OPEN_AI_KEY}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    );

    console.log("VectorStore:" + vectorStore);

    const chain = makeChain(vectorStore);

    const response = await chain.invoke({
      question: sanitizedQuestion,
      chat_history: chatHistory.map(entry => `${entry.role}: ${entry.content}`).join('\n')
    });

    chatHistoryStore[sessionId] = chatHistory;

    console.log('success create response');
    console.log('response', response);

    const output = response.text;
    console.log('type of output: ' + typeof output);

    const [start, end] = extractTimes(output);

    console.log("starting time: " + start);
    console.log("ending time: " + end);

    const inputFilePath = path.join(__dirname, `../result/temp_audio_1.mp4`);
    
    const outputFilePath = path.join(__dirname, `../result/clip.mp4`);

    const finalpath = await extractClip(inputFilePath, start, end, outputFilePath);
    
    console.log("finalpath: " + finalpath);

    res.status(200).json({ response: response, chatHistory: chatHistory.map(entry => `${entry.role}: ${entry.content}`).join('\n') });
    //await pinecone.deleteIndex(PINECONE_INDEX_NAME);
  } catch (error) {
    next(error);
  }
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

async function extractClip(inputFilePath: string, startTime: number, endTime: number, outputFilePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
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
        resolve();
      } else {
        console.error(`Error extracting clip. ffmpeg process exited with code ${code}`);
        reject(new Error(`Error extracting clip. ffmpeg process exited with code ${code}`));
      }
    });
  });
}