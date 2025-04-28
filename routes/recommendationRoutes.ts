import { Request, Response } from 'express'
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware'; // Import the auth middleware
import { supabase } from '../config/supabaseClient';
import { type RequestWithUser } from '../middlewares/authMiddleware';
import { supabaseAuthClientMiddleware } from '../middlewares/authRLSMiddleware';
import {optionalAuthMiddleware} from '../middlewares/optionalAuthMiddleware'
import {getUserSuggestions} from '../controllers/recommendationController'


const router = express.Router();

router.get('', optionalAuthMiddleware, getUserSuggestions);

export default router;

