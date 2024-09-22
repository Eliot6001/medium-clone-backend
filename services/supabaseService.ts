const { supabaseInstance } = require('../config/supabaseClient');

interface Article {
  content: string;
}

exports.saveArticleToDatabase = async (sanitizedHTML:string): Promise<Article[]> => {
    const { data, error } = await supabaseInstance
        .from('articles')
        .insert([{  content: sanitizedHTML }]);

    if (error) throw new Error(error.message);
    return data;
};
