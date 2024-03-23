import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { NextFunction, Request, Response } from "express";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

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

    const transcriptTokens:number = countTokensInFile(transcript);
    console.log("length of transcriptTokens: ", transcriptTokens);

    let analysis;
    
    if (transcriptTokens > MAX_TOKENS) {
      console.log("The tokens is bigger than 4096, processing large transcript");
      analysis = await processLargeTranscript(transcript);

      } else {
        console.log("The tokens is smaller than 4096, processing large transcript");
      analysis = await getChatGPTAnalysis(transcript, false);
      }
  
    res.status(200).json({ transcript, transcriptFilePath, analysis });
  } catch (error) {
    next(error);
  }
};

const tokenPartSize = 3500;
async function processLargeTranscript(transcript: string): Promise<string> {
  const transcriptChunks = chunkTranscript(transcript, tokenPartSize);
  let analysis = '';
  let i = 0;
  for (const chunk of transcriptChunks) {
    const transcriptFilePath = path.join(__dirname, `../result/transcript_${i + 1}.txt`);
    i++;
    fs.writeFileSync(transcriptFilePath, chunk);
    const chunkAnalysis = await getChatGPTAnalysis(chunk, true);
    analysis += chunkAnalysis + '\n';
    removeFile(transcriptFilePath);
  }
  return analysis;
}

function chunkTranscript(transcript: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  while (startIndex < transcript.length) {
      const chunk = transcript.substring(startIndex, chunkSize);
      chunks.push(chunk);
      startIndex += chunkSize;
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

function countTokensInFile(transcript: string): number {
  const tokens = transcript.split(/\s+|\b/);
  const filteredTokens = tokens.filter(token => token.trim() !== '');
  return filteredTokens.length;
}

export const chatWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  console.log("trying to chat")
  try{
    const transcriptFilePath = path.join(__dirname, "../result/transcript.txt");
    const transcript = fs.readFileSync(transcriptFilePath, "utf8");

    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Please answer the question based on the data, which is from videos or audios:" },
        { role: "user", content: transcript },
        { role: "user", content: req.body.question },
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

    const answer = response.data.choices[0].message.content;
    res.status(200).json({ answer })
  }
  catch(error){
    next(error);
  }


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



function getChatGPTAnalysis(transcript: string, LongTranscriptOrNot: boolean) {
  let data;
  if(LongTranscriptOrNot == true){
    data = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "if video is more than 1, then summarize transcript separately; if not, then ignore this content/message." },
        { role: "user", content: "start from 'video i'(i is natural numbers), Please continue summarize transcript from last content with following transcript if it exist:" },
        { role: "user", content: transcript },
      ],
    };
  }else{
    data = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Please summarize the following transcript:" },
        { role: "user", content: "if video is more than 1, then summarize transcript separately; if not, then ignore this content/message." },
        { role: "user", content: "The answer should start form 'The data ...'" },
        { role: "user", content: transcript },
      ],
    };
  }

  return axios.post(
    "https://api.openai.com/v1/chat/completions",
    data,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
  .then(response => response.data.choices[0].message.content)
  .catch(error => {
    console.error("Error in getChatGPTAnalysis:", error);
    throw new Error("Error in getChatGPTAnalysis");
  });
}
