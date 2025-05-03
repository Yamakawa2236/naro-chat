// src/controllers/chatController.ts
import { Request, Response, NextFunction } from 'express';
import { bedrockService, ModelNotReadyError } from '../services/bedrockService';

export const chatController = {
  async processChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('Received chat request body:', req.body);

      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        console.log('Validation Error: Missing or invalid message in request body.');
        res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
        return;
      }

      console.log('Processing message:', message);
      const responseText = await bedrockService.generateResponse(message);
      console.log('Generated response:', responseText);
      res.status(200).json({ response: responseText });

    } catch (error) {
      if (error instanceof ModelNotReadyError) {
        console.warn('ModelNotReadyError caught, sending 503:', error.message);
        res.status(503).json({
          error: 'MODEL_NOT_READY',
          message: 'AIモデルが準備できていません。約1分後に再度お試しください。',
        });
      } else {
        console.error('Error in chatController.processChat:', error);
        next(error);
      }
    }
  }
};