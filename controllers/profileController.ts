import { profile } from "console";
import {supabase} from "../config/supabaseClient";
import { Request, Response } from "express";
import {getUserArticles} from '../services/supabaseService'
import { type RequestWithSupabase } from "../middlewares/authRLSMiddleware";

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


export const submitHistory = async (req: RequestWithSupabase, res: Response) => {
  const { postid } = req.body;

  if (!postid) {
    return res.status(400).json({ error: "There was an error!" });
  }
  
  if (!req.user)
    return res
      .status(500)
      .json({ error: "There has been an error, we apologize!" });

 
  try {
    // Save the article to the database
    if (!req.supabaseAuth)
      return res.status(500).json({ error: "Failed to authenticate, Try again!" });
  
    const result = await req.supabaseAuth
      .from("history")
      .upsert({
        postid: postid,
        userid: req.user.id,
        created_at: new Date(),
      });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Failed to save rating" });
  }
}
  