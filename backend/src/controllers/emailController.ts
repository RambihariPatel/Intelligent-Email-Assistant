import { Request, Response, NextFunction } from 'express';
import * as gmailService from '../services/gmailService';

export const getEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { maxResults, pageToken, q } = req.query;
    const data = await gmailService.listEmails(
      req.user._id,
      maxResults ? parseInt(maxResults as string) : 20,
      pageToken as string,
      q as string
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getEmailById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await gmailService.getEmail(req.user._id, req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const sendNewEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to, subject, body, threadId, messageId } = req.body;
    const data = await gmailService.sendEmail(req.user._id, to, subject, body, threadId, messageId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateEmailLabels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { addLabelIds, removeLabelIds } = req.body;
    const data = await gmailService.modifyEmail(req.user._id, req.params.id, addLabelIds || [], removeLabelIds || []);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
