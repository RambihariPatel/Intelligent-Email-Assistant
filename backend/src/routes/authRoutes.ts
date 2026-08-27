import express from 'express';
import { googleAuth, googleAuthCallback, getMe, getGoogleAuthUrl } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/google', googleAuth);
router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', googleAuthCallback);
router.get('/me', protect, getMe);

export default router;
