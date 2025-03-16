import { Request, Response } from "express";
import { sanitizeHTML } from "../utils/sanitizer";
import {
  getArticleFromDatabase,
  saveArticleToDatabase,
  getAllArticlesFromDatabase,
  updateArticleInDatabase,
  removeArticleFromDatabase,
} from "../services/supabaseService";
import { Article } from "../types"; // Import the Article type
import { type RequestWithSupabase } from "../middlewares/authRLSMiddleware";

export const submitArticle = async (
  req: RequestWithSupabase,
  res: Response
) => {
  const { content, title } = req.body;

  if (!content || !title) {
    return res.status(400).json({ error: "Title or content missing" });
  }

  console.log(req.user);

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
          title,
          userid: req.user.id, // Pull the user ID from the request
          content: sanitizedHTML,
          rating: 1,
          updated_at: new Date(),
          created_at: new Date(),
        }
      : {
          // If the request method is PUT
          postid: req.body.articleid,
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

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Failed to save article" });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(req.params);

  try {
    const article = await getArticleFromDatabase(id);

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.status(200).json(article);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve article" });
  }
};
export const removeArticle = async (
  req: RequestWithSupabase,
  res: Response
) => {
  const { id } = req.params;
  if (!req.user)
    return res
      .status(500)
      .json({ error: "There has been an error, we apologize!" });
  if (!req.supabaseAuth)
    res.status(500).json({ error: "Failed to authenticate, Try again!" });
  try {
    // Save the article to the database
    await removeArticleFromDatabase({
      article: { postid: id, userid: req.user.id },
      supabaseAuth: req.supabaseAuth,
    });
    res.status(200).json({ success: true, data: "Article was removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Failed to save article" });
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
