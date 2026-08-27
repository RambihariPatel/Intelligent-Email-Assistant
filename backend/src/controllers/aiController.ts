import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService';

export const summarize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Email content is required' });
    }
    const summary = await aiService.summarizeEmail(content);
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

export const reply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, tone } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Email content is required' });
    }
    const generatedReply = await aiService.generateReply(content, tone);
    res.json({ success: true, reply: generatedReply });
  } catch (error) {
    next(error);
  }
};

export const actionItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Email content is required' });
    }
    const items = await aiService.extractActionItems(content);
    res.json({ success: true, actionItems: items });
  } catch (error) {
    next(error);
  }
};

export const spamCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, sender } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Email content is required' });
    }
    const result = await aiService.detectSpam(content, sender || 'Unknown');
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const categorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, snippet } = req.body;
    const category = await aiService.categorizeEmail(subject || '', snippet || '');
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};
