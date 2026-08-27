import express from 'express';
import { summarize, reply, actionItems, spamCheck, categorize } from '../controllers/aiController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect); // All AI routes require authentication

router.post('/summarize', summarize);
router.post('/reply', reply);
router.post('/action-items', actionItems);
router.post('/spam-check', spamCheck);
router.post('/categorize', categorize);

export default router;
