import express from 'express';
import { getEmails, getEmailById, sendNewEmail, updateEmailLabels } from '../controllers/emailController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect); // All email routes require authentication

router.get('/', getEmails);
router.post('/send', sendNewEmail);
router.get('/:id', getEmailById);
router.post('/:id/modify', updateEmailLabels);

export default router;
