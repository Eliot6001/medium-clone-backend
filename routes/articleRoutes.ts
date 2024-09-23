import { Request, Response } from 'express'
import express from 'express';
import { submitArticle } from '../controllers/articleController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Import the auth middleware
import { supabase } from '../config/supabaseClient';
import { type RequestWithUser } from '../middlewares/authMiddleware';
const router = express.Router();

// Protect the submit route with authentication
router.post('/submit', authMiddleware, submitArticle);

router.get('/api/submit', authMiddleware,
  async (req: RequestWithUser, res: Response) => {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*');

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data: posts });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
      return res.status(500).json({ success: false, error: errorMessage });
    }
  }

); export default router;

