import { profile } from "console";
import {supabase} from "../config/supabaseClient";
import { Request, Response } from "express";
import {getUserArticles} from '../services/supabaseService'

export const getUserPublishedArticles = async (req: Request, res: Response) => {
    const { profileId } = req.params;
    if (!profileId) return res.status(400).json({ error: "Profile ID is required" });
  
    try {
      const posts = await getUserArticles(profileId);
  
      if (!posts || posts.length === 0) {
        return res.status(200).json({ message: "User has never published anything!" });
      }
  
      res.status(200).json({ articles: posts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong!" });
    }
  };
  