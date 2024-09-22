const { supabase } = require('../config/supabaseClient');
import { Request, Response, NextFunction } from 'express';

//ss auth

exports.authMiddleware = async (req:Request & {
  user: string}, res:Response, next:NextFunction) => {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const { user, error } = await supabase.auth.api.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
};
