import "dotenv/config";
import express from "express";
import cors from 'cors';
import * as UploadController from "../controllers/upload";
import multer from 'multer';

const router = express.Router();
router.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.array('file'), UploadController.uploadFile);

router.post('/chat',  UploadController.chatWithUser);

export default router;