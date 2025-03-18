import { Request, Response } from 'express'
import express from 'express';

import { authMiddleware } from '../middlewares/authMiddleware'; // Import the auth middleware
import { supabase } from '../config/supabaseClient';
import { type RequestWithUser } from '../middlewares/authMiddleware';
import { ConfirmAuth, oAuthSetup } from '../controllers/authController';

const router = express.Router();

// Protect the submit route with authentication
router.get('/confirm', ConfirmAuth);
router.get('/callback', oAuthSetup);



export default router;


