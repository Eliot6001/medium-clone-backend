import { type RequestWithUser } from "../middlewares/authMiddleware";
import { Request, Response } from "express";
import { ratingSubmit, getArticleRating } from "../services/supabaseService";
import { type RequestWithSupabase } from "../middlewares/authRLSMiddleware";
import { log } from "console";

const submitRating = async (req: RequestWithSupabase, res: Response) => {
  const { article_id, rating } = req.body;

  // Validate required fields
  if (!article_id || rating === undefined) {
    return res
      .status(400)
      .json({ error: "Article ID and rating are required" });
  }

  let actualRating = 0;
  if (rating > 0) actualRating = 1;
  else if (rating < 0) actualRating = -1;

  if (!req.user)
    return res
      .status(401)
      .json({ error: "There has been an error, we apologize!" });

  try {
    // Perform an upsert operation - insert if not exists, update if exists
    if (req.supabaseAuth === undefined) {
      return res.status(401).json({
        error: "Failed to authenticate Supabase client, Try again later!",
      });
    }

    const result = await ratingSubmit(req.supabaseAuth, {
      userid: req.user.id,
      postid: article_id,
      rating: actualRating,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error rating article:", error);
    res.status(500).json({ success: false, error: "Failed to save rating" });
  }
};

const fetchArticleRating = async (req: Request, res: Response) => {
  const { articleId, userId } = req.query;

  if (!articleId) {
    return res.status(400).json({ error: "Article ID is required" });
  }

  try {
    // Fetch the rating for the article
    const articleRating = await getArticleRating(
      articleId as string,
      userId as string
    );
    res.status(200).json(articleRating);
  } catch (error) {
    console.error("Error fetching article rating:", error);
    res.status(500).json({ error: "Failed to fetch article rating" });
  }
};
export { submitRating, fetchArticleRating };
