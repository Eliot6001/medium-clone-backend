import { Request, Response } from "express";
import { sanitizeHTML } from "../utils/sanitizer";
import {
  getArticleFromDatabase,
  saveArticleToDatabase,
  getAllArticlesFromDatabase,
  updateArticleInDatabase,
  removeArticleFromDatabase,
  getModerationData,
  getProfileRole,
  AddUserHistory,
} from "../services/supabaseService";
import { Article } from "../types"; // Import the Article type
import { type RequestWithSupabase } from "../middlewares/authRLSMiddleware";
import { type RequestWithUser } from "../middlewares/authMiddleware";
import { supabase } from "../config/supabaseClient";
import {supabase as supabaseSuper} from '../config/supabaseSuperClient'
import NodeCache from 'node-cache';
import axios from "axios";
import { randomUUID, UUID } from "crypto";

const cache = new NodeCache({ stdTTL: 86400 });  // Cache expires in 24 hours
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8800";

function isValidArticleInput(body: any): body is { title: string; content: string; articleid?: UUID } {
  return (
    typeof body === "object" &&
    typeof body.title === "string" &&
    typeof body.content === "string" 
     &&
    (body.articleid === undefined || typeof body.articleid === "string")
  );
}

export const submitArticle = async (
  req: RequestWithSupabase,
  res: Response
) => {
   if (!isValidArticleInput(req.body)) {
    return res.status(400).json({ error: "Invalid article data" });
  }
  if (req.method !== "POST" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (req.method === "PUT" && !req.body.articleid) {
    return res.status(400).json({ error: "Article Id is missing or invalid" });
  }

  const { content, title } = req.body;

  if (!req.user)
    return res
      .status(500)
      .json({ error: "There has been an error, we apologize!" });

  if (!req.supabaseAuth)
    res.status(500).json({ error: "Failed to authenticate, Try again!" });

  const sanitizedHTML = sanitizeHTML(content);
  const article: Partial<Article> =
    req.method === "POST"
      ? {
          title: sanitizeHTML(title),
          userid: req.user.id, // Pull the user ID from the request
          content: sanitizedHTML,
          rating: 1,
          updated_at: new Date(),
          created_at: new Date(),
        }
      : {
          // If the request method is PUT
          postid: req.body?.articleid,
          title,
          userid: req.user.id, // Pull the user ID from the request
          content: sanitizedHTML,
          updated_at: new Date(),
        };
  try {
    // Save the article to the database
    const result =
      req.method === "POST"
        ? await saveArticleToDatabase({
            article: article,
            supabaseAuth: req.supabaseAuth,
          })
        : await updateArticleInDatabase({
            article: article,
            supabaseAuth: req.supabaseAuth,
          });

      //Notify suggestion system

    axios.post(`${FASTAPI_URL}/process`, { postid: req.user.id })
    .then(response => {
      console.log("Processing triggered:", response.data);
    })
    .catch(error => {
      console.error("Error triggering processing:", error);
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Failed to save article" });
  }
};

export const getArticle = async (req: RequestWithUser, res: Response) => {
  const { id } = req.params;
  console.log("Data received from a user", req.user);
  if (!uuidRegex.test(id)) {
   return res.status(400).json({ error: "Invalid article ID format" });
  }
  try {
    // Fetch article once, outside conditional blocks
    const article = await getArticleFromDatabase(id);

    // Handle case where article is not found
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Unauthenticated user logic
    if (!req.user) {
      if (article.deleted) {
        return res.status(410).json({ error: "Article has been previously deleted" });
      }

     
      return res.status(200).json(article);
    }

    // Authenticated user logic
    const { id: userid } = req.user;

    if (!article.deleted) {
      const response = await AddUserHistory(req.user, article.postid);
  
    
      // If article is not deleted, return it immediately
      return res.status(200).json(article);
    }

    //assigning History thingy
    
    // Article is deleted; check user permissions
    // Assuming article has a 'userid' field and req.user has a 'role' field
    const isAuthor = userid === article.userid;
    const isModerator = await getProfileRole(req.user.id); // Adjust based on your user object

    if (isAuthor || isModerator?.ROLE) {
      const moderationData = await getModerationData(article.postid as string);
      const resultData = {
        ...article,
        reason: moderationData?.reason,
        removalBy: moderationData?.moderatorProfile?.username,
        removalId: moderationData?.moderatorProfile?.id,
      };
      
      return res.status(200).json(resultData);
    } else {
      return res.status(403).json({ error: "Not authorized to view this article" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to retrieve article" });
  }
};

export const removeArticle = async (
  req: RequestWithSupabase,
  res: Response
) => {
  const { id } = req.params;
  if (!id || !uuidRegex.test(id)) {
   return res.status(400).json({ error: "Invalid article ID format" });
  }
  if (!req.user)
    return res
      .status(403)
      .json({ error: "There has been an error, we apologize!" });
  if (!req.supabaseAuth)
    return res.status(403).json({ error: "Failed to authenticate, Try again!" });
  try {
    // Save the article to the database
    await removeArticleFromDatabase({
      article: { postid: id, userid: req.user.id },
      supabaseAuth: req.supabaseAuth,
    });
    return res.status(200).json({ success: true, data: "Article was removed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Failed to save article" });
  }
};

export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await getAllArticlesFromDatabase();
    res.status(200).json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve articles" });
  }
};




const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const recoverArticle = async (
  req: RequestWithSupabase,
  res: Response
) => {
  try {
    const { id } = req.params; // article id
    if (!id || !uuidRegex.test(id)) {
   return res.status(400).json({ error: "Invalid article ID format" });
  }
    if (!req.user) {
      return res.status(403).json({ error: "User not authenticated" });
    }
    if (!req.supabaseAuth) {
      return res.status(500).json({ error: "Failed to authenticate, try again!" });
    }
    
    // Retrieve the article from the database
    const article = await getArticleFromDatabase(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    if (!article.deleted) {
      return res.status(400).json({ error: "Article is not deleted" });
    }

    // Fetch the user's role from the user_profiles table
   const ROLE = await getProfileRole(req.user.id)
    console.log(ROLE)
    if (ROLE?.ROLE !== "USER" && ROLE?.ROLE !== "MODERATOR" ) {
      return res.status(403).json({ error: "Could not fetch user profile" });
    }
    const userRole = ROLE; // "USER" or "MODERATOR"

    // Check if there's a moderator deletion record in the article_moderation table
    const moderationData = await getModerationData(article.postid as string);

    // If the article was removed by a moderator, only allow recovery if the current user is a moderator.
    if (moderationData && String(userRole) !== "MODERATOR") {
      return res.status(403).json({ error: "Article was removed by a moderator and cannot be republished by the author." });
    }

    // Update the article to mark it as recovered.
    const updatedArticle = await updateArticleInDatabase({
      article: {
        ...article,
        deleted: false,
        deleted_at: undefined,
        updated_at: new Date(),
      },
      supabaseAuth: req.supabaseAuth,
    });

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to Recover!" });
  }
};

export const getPopularArticles = async (req: Request, res: Response) => {
  const cachedPopularArticles = cache.get('popularArticles');

  if (
    cachedPopularArticles &&
    Array.isArray(cachedPopularArticles) &&
    cachedPopularArticles.length > 0
  ) {
   
    return res.json(cachedPopularArticles);
  }

  try {
    const { data, error } = await supabaseSuper.rpc('get_popular_articles');
   
    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: 'Failed to fetch popular articles from database.' });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(204).json({ message: 'No popular articles found.' }); // 204 = No Content
    }

    cache.set('popularArticles', data, 60 * 5); // Expire cache every 5 minutes
    return res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: 'An error occurred while fetching popular articles.' });
  }
};




export const exploreArticles = async (req: Request, res: Response) => {
  try {
    const { field } = req.query;
    if(field && typeof field !== 'string') {
      return res.status(400).json({ error: 'Field must be a string' });
    }
    const { data, error } = await supabase
      .rpc('get_random_posts_full', { field_input: field ?? null });
  
    if (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}


export const getSummaryByPostId = async (req: Request, res: Response) => {
  const { postid } = req.query; 

  if (!postid) {
    return res.status(400).json({ error: 'postid is required' });
  }
  if (!uuidRegex.test(postid as string)) {
   return res.status(400).json({ error: "Invalid article ID format" });
  }
  const {data} = await supabaseSuper.from("article_metadata").select("summary").eq("postid", postid).maybeSingle();
  if(!data) return res.status(501).json({ error: 'There was an error' });
  res.json({ summary: data.summary });
} 