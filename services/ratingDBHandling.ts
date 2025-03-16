import { type ArticleRatings, type Rating } from "../types";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as supabaseInstance } from "../config/supabaseClient";

const ratingSubmit = async (
  authenticatedClient: SupabaseClient,
  rating: Rating
): Promise<Rating | null> => {

    if (rating.rating === 0) {
      const { data, error } = await authenticatedClient
        .from("article_ratings")
        .delete()
        .eq("postid", rating.postid)
        .eq("userid", rating.userid);

        if (error) throw error;
        return data ? data : null;
    } else {
      const { data, error } = await authenticatedClient.from("article_ratings")
      .upsert(rating, {
        onConflict: "userid,postid", // Maintain uniquess of rating
      });
      if (error) throw error;
      return data ? data : null;
    }
    

  // This avoids fetching all ratings again
  // Could be better for performance but less flexibility on service
  // await supabaseInstance.rpc('update_article_rating', { postId: article_id });


};

const getArticleRating = async (
  articleid: string,
  userid?: string
): Promise<ArticleRatings | null> => {
  console.log(articleid, userid);
  const { data, error } = await supabaseInstance.rpc(
    "get_article_rating_info",
    { article_id: articleid, user_id: userid }
);
  if (error) {
    console.error("Error fetching article rating:", error.message);
    return null;
  }

  return data[0];
};
export { ratingSubmit, getArticleRating };
