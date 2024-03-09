import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import scriptRoutes from "./routes/scripts";
import userRoutes from "./routes/users";
//import uploadRoutes from "./routes/upload";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore  from "connect-mongo";
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const app = express();

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
    }),
}))

app.use("/api/users", userRoutes);
app.use("/api/scripts", scriptRoutes);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//app.use("/api/upload", upload.array('file'), uploadRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occurred";
    let statusCode = 500;
    if (isHttpError(error)){
        statusCode = error.status;
        errorMessage = error.message;
    } 
    res.status(statusCode).json({ error: errorMessage });
});

app.post('/api/upload', upload.array('file'), async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }
  
    try {
        let transcript = '';
        for (let i = 0; i < files.length; i++) {
            const filePath = path.join(__dirname, `../src/result/temp_audio_${i + 1}.mp4`);
            fs.writeFileSync(filePath, files[i].buffer);
  
            const fileTranscript = await getTranscript(filePath);
            transcript += `Video ${i + 1}:\n${fileTranscript}\n\n`;
        }
  
        const transcriptFilePath = path.join(__dirname, '../src/result/transcript.txt');
        fs.writeFileSync(transcriptFilePath, transcript);
  
        res.status(200).json({ transcript, transcriptFilePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing files' });
    }
  });
  
  
  
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

export default app;

//use for reference and testing purposes
app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint not found"));
});