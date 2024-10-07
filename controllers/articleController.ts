
import { Request, Response } from 'express';
import { sanitizeHTML } from '../utils/sanitizer';
import { getArticleFromDatabase, saveArticleToDatabase } from '../services/supabaseService';
import { Article } from '../types'; // Import the Article type
import { type RequestWithUser } from '../middlewares/authMiddleware';

export const submitArticle = async (req: RequestWithUser, res: Response) => {

  const { content, title } = req.body;
  console.log(content, title)
  if (!content || !title) {
    return res.status(400).json({ error: 'Title or content missing' });
  }

  if(!req.user) return res.status(500).json({error: 'There has been an error, we apologize!'})

  const sanitizedHTML = sanitizeHTML(content);

  const article: Partial<Article>= {
    title,
    userId: req.user.id, // Pull the user ID from the request
    content: sanitizedHTML,
    rating: 1,
    updated_at: new Date(),
    created_at: new Date(),
  };

  try {
    // Save the article to the database
    const result = await saveArticleToDatabase(article);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Failed to save article' });
  }
};

export const getArticle = async (req: Request, res: Response) => {

  const { id } = req.params;
  console.log(req.params)

  try {
    const article = await getArticleFromDatabase(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.status(200).json(article);
  } catch (error) {

    console.log(error);
    res.status(500).json({ error: 'Failed to retrieve article' });
  }
};
