import { Request, Response } from 'express'
import express from 'express';
import { getArticle, submitArticle, getAllArticles, removeArticle} from '../controllers/articleController';
import { submitRating, fetchArticleRating } from '../controllers/ratingController';
import { authMiddleware } from '../middlewares/authMiddleware'; // Import the auth middleware
import { supabase } from '../config/supabaseClient';
import { type RequestWithUser } from '../middlewares/authMiddleware';
import { supabaseAuthClientMiddleware } from '../middlewares/authRLSMiddleware';

const router = express.Router();

// Protect the submit route with authentication
router.post('/submit', authMiddleware,supabaseAuthClientMiddleware, submitArticle);
router.put('/edit/:id', authMiddleware, supabaseAuthClientMiddleware, submitArticle);
router.post('/rate-article', authMiddleware, supabaseAuthClientMiddleware, submitRating);
router.delete("/:id", authMiddleware, supabaseAuthClientMiddleware, removeArticle);

router.get('/api/', getAllArticles);
router.get('/rate-article', fetchArticleRating);
router.get('/:id', getArticle);




export default router;


