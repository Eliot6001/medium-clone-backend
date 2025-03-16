
interface Article {
  postid: string;
  title: string;
  userid: string;
  content: string;
  rating?: number; 
  updated_at: Date;
  created_at: Date;
}

interface Rating {
  userid: string;
  postid: string;
  rating: number;
}

interface ArticleRatings {
  count: number;
  total_rating: number | null;
  user_rating: number | null;
}

export {Article, Rating, ArticleRatings}
