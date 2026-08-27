import { Request, Response, NextFunction } from 'express';
import { generateAuthUrl, getTokens, getUserProfile } from '../services/googleAuthService';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const googleAuth = (req: Request, res: Response) => {
  const url = generateAuthUrl();
  res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    const tokens = await getTokens(code);
    const profile = await getUserProfile(tokens.access_token!);

    // Find or create user
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.picture as string | undefined,
        refreshToken: tokens.refresh_token,
      });
    } else {
      // Update tokens
      if (tokens.refresh_token) {
        user.refreshToken = tokens.refresh_token;
      }
      user.accessToken = tokens.access_token;
    }
    
    await user.save();

    // Issue JWT
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    // Redirect to frontend with token (or set as cookie)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);

  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Requires authMiddleware to set req.user
    const user = req.user; 
    res.json(user);
  } catch (error) {
    next(error);
  }
};
