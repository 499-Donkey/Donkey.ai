import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { NextFunction, Request, Response } from "express";

const MAX_CHUNK_SIZE = 25 * 1024 * 1024;

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

      let datasize: number = fileSize;

      if (fileSize > MAX_CHUNK_SIZE) {
        const chunks = Math.ceil(fileSize / MAX_CHUNK_SIZE);
        const chunkSize = Math.ceil(fileSize / chunks);
        const tempFilePaths: string[] = [];

        for (let j = 0; j < chunks; j++) {
          const start = j * chunkSize;
          const end = Math.min(start + chunkSize, fileSize);
          console.log("start: " + start + " end: " + end);

          const chunkData = file.buffer.subarray(start, end);
          console.log("chunk size: " + chunkData.length);
          datasize = datasize - chunkData.length;
          console.log("datasize left: " + datasize);

          const tempFilePath = path.join(__dirname, `../result/temp_audio_${i + 1}_${j + 1}.mp4`);

          fs.writeFileSync(tempFilePath, chunkData);
          tempFilePaths.push(tempFilePath);
        }

        for (const tempFilePath of tempFilePaths) {
          console.log("getTranscript called");
          console.log("File path:", tempFilePath);
          const fileTranscript = await getTranscript(tempFilePath);
          transcript += fileTranscript;
          const transcriptFilePath = path.join(__dirname, "../result/transcript.txt");
          fs.writeFileSync(transcriptFilePath, transcript);
        }

        for (const tempFilePath of tempFilePaths) {
          fs.unlinkSync(tempFilePath);
        }
      } else {
        const filePath = path.join(__dirname, `../result/temp_audio_${i + 1}.mp4`);
        fs.writeFileSync(filePath, file.buffer);
        const fileTranscript = await getTranscript(filePath);
        transcript += fileTranscript;
      }
    }

    const transcriptFilePath = path.join(__dirname, "../result/transcript.txt");
    fs.writeFileSync(transcriptFilePath, transcript);

    const analysis = await getChatGPTAnalysis(transcript);

    res.status(200).json({ transcript, transcriptFilePath, analysis });
  } catch (error) {
    next(error);
    res.status(500).json({ error: "Error processing files" });
  }
};

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
        { role: "user", content: "Please answer the question based on the transcripts, which is form video or audio:" },
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
    res.status(500).json({ error: "Error passing chat" });
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

async function getChatGPTAnalysis(transcript: string) {
  try {
    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Please summarize the following transcript:" },
        { role: "user", content: transcript },
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

    const summary = response.data.choices[0].message.content;
    return summary;
  } catch (error) {
    console.error("Error in getChatGPTAnalysis:", error);
    throw new Error("Error in getChatGPTAnalysis");
  }
}
