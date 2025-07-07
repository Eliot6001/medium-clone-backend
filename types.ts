
interface Article {
  postid: string;
  title: string;
  userid: string;
  content: string;
  rating?: number; 
  updated_at: Date;
  created_at: Date;
  deleted?: boolean;
  deleted_at?: Date;
  user_profiles?: { id?: string, username?: string, avatar_url?:string },
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
