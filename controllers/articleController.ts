
import { Request, Response } from 'express';
import { sanitizeHTML } from '../utils/sanitizer';
import { saveArticleToDatabase } from '../services/supabaseService';
import { Article } from '../types'; // Import the Article type
import { type RequestWithUser } from '../middlewares/authMiddleware';

export const submitArticle = async (req: RequestWithUser, res: Response) => {

  const { htmlContent, title, rating } = req.body;
  
  if (!htmlContent || !title) {
    return res.status(400).json({ error: 'Title or content missing' });
  }
  if(!req.user) return res.status(500).json({error: 'There has been an error, we apologize!'})
  // Sanitize the HTML content
  const sanitizedHTML = sanitizeHTML(htmlContent);

  const article: Article = {
    post_id: '', // Supabase will auto-generate this in the database
    title,
    userId: req.user.id, // Pull the user ID from the request
    content: sanitizedHTML,
    rating: rating || 0,
    updated_at: new Date(),
    created_at: new Date(),
  };

  try {
    // Save the article to the database
    const result = await saveArticleToDatabase(article);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save article' });
  }
};

