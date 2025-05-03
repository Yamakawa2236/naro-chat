import express from 'express';
import { chatController } from '../controllers/chatController';

const router = express.Router();

router.post('/chat', chatController.processChat);

export { router as chatRoutes };