import axios from "axios";
import {
  optionalAuthMiddleware,
  RequestWithUser,
} from "../middlewares/optionalAuthMiddleware";

import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { Article, ArticleRatings } from "../types";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8800";

interface Rec {
  postid: string;
}
type Post = Article & { article_ratings: ArticleRatings[] };

export const getUserSuggestions = async (
  req: RequestWithUser,
  res: Response
) => {
  const user = req.user;
  const id = user?.id;
  console.log(user, id, "reached user id?");
  if (!id) {
    const generalSuggestions = await getGeneralSuggestions(10);
    console.log("Reached first!", generalSuggestions);
    return res
      .status(200)
      .json({ success: true, suggestions: generalSuggestions });
  }

  try {
    const selected = req.body.selected; // Ensure the frontend is sending the necessary data
    const userSuggestions = await getUserSpecificSuggestions(id, {
      num_recommendations: 20,
      exploration_ratio: 0.2,
    });
    if (!userSuggestions.length) {
      console.log("User hasn't interacted with anything!");
      const generalSuggestions = await getGeneralSuggestions(10);
      return res
        .status(200)
        .json({ success: true, suggestions: generalSuggestions });
    }
    // Remove duplicate suggestions based on postid
    const uniqueSuggestionsMap = new Map<string, Post>();
    userSuggestions.forEach((suggestion) => {
      if (suggestion && !uniqueSuggestionsMap.has(suggestion.postid)) {
      uniqueSuggestionsMap.set(suggestion.postid, suggestion);
      }
    });
    const userSuggestionsUnique = Array.from(uniqueSuggestionsMap.values());
    return res
      .status(200)
      .json({ success: true, suggestions: userSuggestionsUnique });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch suggestions." });
  }
};

export async function getGeneralSuggestions(
  count: number = 5
): Promise<Post[]> {
  const { data: pool, error } = await supabase
    .from("posts")
    .select(
      `postid,
      title,
      content,
      created_at,
      updated_at,
      field,
      user_profiles (
        id,
        username,
        avatar_url
      ),
      article_ratings!left (
        rating)
     `
    )
    .order("created_at", { ascending: false })
    .limit(50)
    .overrideTypes<Post[]>(); // describe to TypeScript what `data` really is

  if (error) {
    console.error("Error fetching general pool:", error);
    return [];
  }
  if (!pool || pool.length === 0) {
    return [];
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

// Helper function to get user-specific suggestions based on the user ID
const getUserSpecificSuggestions = async (
  userId: string,
  params: { num_recommendations?: number; exploration_ratio?: number }
) => {
  // Logic to fetch user-specific suggestions, e.g., filter based on the user’s profile or preferences

  try {
    const response = await axios.get<{ recommendations: Rec[] }>(
      `${FASTAPI_URL}/${userId}/suggest`,
      { params }
    );
    console.log("Received data from recommendation :", response);
    const recs = response.data.recommendations;
    if (!recs.length) return [];

    const postids = recs.map((r) => r.postid);
    const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      postid,
      title,
      content,
      created_at,
      updated_at,
      field,
      user_profiles (
        id,
        username,
        avatar_url
      ),
      article_ratings!left (
        rating
      )
    `)
    .in("postid", postids);

    const formattedPosts = posts?.map(post => ({
      ...post,
      rating_score: post.article_ratings
        ? post.article_ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0)
        : 0,
    }));
      

    if (!posts) return [];

    const postsById = new Map<string, any>(
      (formattedPosts || []).map((p) => [p.postid, p])
    );

    return recs.map((r) => postsById.get(r.postid)).filter(Boolean); // drop any missing
  } catch (error) {
    console.log("User has the following error", error);
    console.log("going back to general suggestions!");
    return await getGeneralSuggestions(10);
  }
};
