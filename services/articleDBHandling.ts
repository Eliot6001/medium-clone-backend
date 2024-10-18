import { supabase as supabaseInstance } from '../config/supabaseClient';
import { type Article } from '../types';

const saveArticleToDatabase = async (article: Partial<Article>): Promise<Article[] | []> => {
  const { data, error } = await supabaseInstance
    .from('posts')
    .insert(article);

  if (error) throw new Error(error.message);
//@ts-ignore
  return data;
};

const getArticleFromDatabase = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabaseInstance
    .from('posts')
    .select('*')
    .eq('post_id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error.message);
    return null;
  }

  return data;
};
const getArticleFromDatabase = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabaseInstance
    .from('posts')
    .select('*')
    .eq('post_id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error.message);
    return null;
  }

  return data;
};
export { saveArticleToDatabase, getArticleFromDatabase };
