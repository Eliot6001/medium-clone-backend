-- This function, get_article_rating_info, retrieves rating information for a specific article.
-- It takes two parameters: article_id (UUID) and user_id (UUID).
-- The function returns a table with three columns:
-- 1. total_count (BIGINT): The total number of ratings for the article.
-- 2. total_rating (INT): The sum of all ratings for the article.
-- 3. user_rating (INT): The rating given by the specified user for the article.
-- Note: This function is used in ratingDBHandling for fetching rating information using an RPC function in Supabase.

```sql
CREATE FUNCTION get_article_rating_info(
  article_id UUID, 
  user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_count BIGINT, 
  total_rating INT, 
  user_rating INT
) 
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    COALESCE(COUNT(*), 0)::BIGINT AS total_count,
    COALESCE(SUM(rating), 0)::INT AS total_rating,
    CASE 
      WHEN user_id IS NOT NULL THEN 
        COALESCE((SELECT rating FROM article_ratings WHERE postid = article_id AND userid = user_id LIMIT 1), 0)
      ELSE NULL 
    END AS user_rating
  FROM article_ratings 
  WHERE postid = article_id;
END;
$$ LANGUAGE plpgsql;
```