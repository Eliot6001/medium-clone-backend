
interface Article {
  post_id: string;
  title: string;
  userId: string;
  content: string;
  rating?: number; 
  updated_at: Date;
  created_at: Date;
}

export {Article}
