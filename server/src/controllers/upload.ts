import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { NextFunction, Request, Response } from "express";


export const uploadFile = async(req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }
  
    try {
        let transcript = '';
        for (let i = 0; i < files.length; i++) {
            const filePath = path.join(__dirname, `../result/temp_audio_${i + 1}.mp4`);
            fs.writeFileSync(filePath, files[i].buffer);
  
            const fileTranscript = await getTranscript(filePath);
            transcript += `Video ${i + 1}:\n${fileTranscript}\n\n`;
        }
  
        const transcriptFilePath = path.join(__dirname, '../result/transcript.txt');
        fs.writeFileSync(transcriptFilePath, transcript);
  
        res.status(200).json({ transcript, transcriptFilePath });
    } catch (error) {
      next(error);
      res.status(500).json({ error: 'Error processing files' });
    }
  };

async function getTranscript(audioFilePath: string) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'vtt');
  
      const response = await axios.post('https://api.openai.com/v1/audio/translations', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`,
          ...formData.getHeaders()
        }
      });
  
      return response.data;
    } catch (error) {
      console.error("Error in getTranscript:", error);
      throw new Error("Error in getTranscript");
    }
  }