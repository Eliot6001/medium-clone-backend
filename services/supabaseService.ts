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

export { saveArticleToDatabase }
