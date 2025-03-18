import { supabase as supabaseInstance } from '../config/supabaseClient';
import { RequestWithSupabase } from '../middlewares/authRLSMiddleware';
import { type Article } from '../types';

///
//File to handle all the database operations for the articles
///

type ArticleWithClient =  {
  supabaseAuth: RequestWithSupabase["supabaseAuth"];
  article: Partial<Article>;
}


const saveArticleToDatabase = async (reqObject: ArticleWithClient): Promise<Article[] | []> => {
  const {article, supabaseAuth} = reqObject;
  //supabaseClient received from req.authRLSMiddleware
  if(!supabaseAuth) throw new Error('Failed to authenticate Supabase client');
  
  const { data, error } = await supabaseAuth
    .from('posts')
    .upsert(article, {
      onConflict: "userid,postid", 
    });

  if (error) throw new Error(error.message);

  return data ?? [];
};
const updateArticleInDatabase = async (reqObject: ArticleWithClient): Promise<Article[] | []> => {
  const {article, supabaseAuth} = reqObject;
  //supabaseClient received from req.authRLSMiddleware
  if(!supabaseAuth) throw new Error('Failed to authenticate Supabase client');
  
  const { data, error } = await supabaseAuth
  .from("posts")
  .update(article) // Specify fields to update
  .eq("postid", article.postid)
  .eq("userid", article.userid);  

  if (error) throw new Error(error.message);

  return data ?? [];
};


const getArticleFromDatabase = async (id: string): Promise<Article | null> => {
  const { data, error } = await supabaseInstance
    .from('posts')
    .select('*')
    .eq('postid', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error.message);
    return null;
  }

  return data;
};



//Get all articles
const getAllArticlesFromDatabase = async (): Promise<Article[] | []> => {
  try {
    const { data: posts, error } = await supabaseInstance
      .from('posts')
      .select('*')
      .eq('deleted', false)
      .limit(100);
    if (error) throw new Error(error.message);
    return posts ?? [];
  } catch (error: any) {
    console.error('Error fetching all articles:', error.message);
    return [];
  }
}

const removeArticleFromDatabase = async (reqObject: ArticleWithClient): Promise<Article[] | []> => {
  const {article, supabaseAuth} = reqObject;
  //supabaseClient received from req.authRLSMiddleware
  if(!supabaseAuth) throw new Error('Failed to authenticate Supabase client');
  
  const { data, error } = await supabaseAuth
  .from("posts")
  .update({
    postid: article.postid,
    userid: article.userid,
    deleted_at: new Date(),
    deleted: true
  }) // Specify fields to update
  .eq("postid", article.postid)
  .eq("userid", article.userid);  

  if (error) throw new Error(error.message);

  return data ?? [];
};

//IMPORTANT: All of these are being exported to ./supabaseService.ts
export { saveArticleToDatabase, getArticleFromDatabase,
   getAllArticlesFromDatabase, updateArticleInDatabase,
   removeArticleFromDatabase};
