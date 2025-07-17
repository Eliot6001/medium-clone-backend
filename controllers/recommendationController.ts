import axios from "axios";
import { Request, Response } from "express";
import { RequestWithUser } from "../middlewares/optionalAuthMiddleware";
import { supabase } from "../config/supabaseClient";
import { Article } from "../types";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8800";

// Only the fields your Article interface actually demands
const POST_SELECT = `
  postid,
  title,
  userid,
  content,
  deleted,
  created_at,
  updated_at,
  deleted_at,
  user_profiles ( id, username, avatar_url ),
  article_ratings ( rating )
`;

export const getUserSuggestions = async (
  req: RequestWithUser,
  res: Response
) => {
  const userId = req.user?.id;

  try {
    // First try FastAPI suggestion if user is logged in
    if (userId) {
      try {
        const suggestions = await fetchSuggestedArticles(userId, 10);
        return res.status(200).json({ success: true, suggestions });
      } catch (fastapiErr) {
        console.warn("FastAPI suggestion failed, falling back:", fastapiErr);
      }
    }

    // Fallback to general suggestions
    const suggestions = await fetchGeneralArticles(10);
    return res.status(200).json({ success: true, suggestions });
  } catch (err) {
    console.error("Final fallback suggestion error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch any suggestions." });
  }
};


async function fetchGeneralArticles(limit: number): Promise<Article[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("deleted", false)
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<Article[]>();

  if (error || !data) return [];
  shuffle(data);
  return data.map(formatArticle);
}

async function fetchSuggestedArticles(
  userId: string,
  limit: number
): Promise<Article[]> {
  const recRes = await axios.get<{ recommendations: { postid: string }[] }>(
    `${FASTAPI_URL}/${userId}/suggest`,
    { params: { num_recommendations: limit, exploration_ratio: 0.25 } }
  );
  const ids = recRes.data.recommendations.map((r) => r.postid);
  if (!ids.length) return fetchGeneralArticles(limit);

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("postid", ids)
    .eq("deleted", false)
    .overrideTypes<Article[]>();

  if (error || !data) return fetchGeneralArticles(limit);

  const byId = new Map(data.map((p) => [p.postid, p]));
  return ids.map((id) => byId.get(id)).filter((a) => !!a).map(formatArticle);
}

function formatArticle(raw: any): Article {
  const rating =
    raw.article_ratings?.reduce(
      (sum: number, r: { rating?: number }) => sum + (r.rating || 0),
      0
    ) ?? 0;

  return {
    postid: raw.postid,
    title: raw.title,
    userid: raw.userid,
    content: raw.content,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    user_profiles: raw.user_profiles, // optional anyway
    rating,                               // single-number rating
  };
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
