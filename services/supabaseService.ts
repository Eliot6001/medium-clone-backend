import { supabase as supabaseInstance } from '../config/supabaseClient';
import { type Article } from '../types'; // Assuming the Article type is defined

const saveArticleToDatabase = async (article: Partial<Article>): Promise<Article[] | []> => {
  const { data, error } = await supabaseInstance
    .from('posts')
    .insert(article) // Inserting the full article object

  if (error) throw new Error(error.message);
//@ts-ignore
  return data;
};

const getArticleFromDatabase = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabaseInstance
    .from('posts')
    .select('*') // Selecting all fields
    .eq('post_id', id) // Filtering by the specific article ID
    .single(); // Ensures only one result is returned (since ID is unique)

  if (error) {
    console.error('Error fetching article:', error.message);
    return null;
  }

  return data;
};

export { saveArticleToDatabase, getArticleFromDatabase }
