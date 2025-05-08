//maybe not needed, we'll see


import { User } from "@supabase/supabase-js";
import { supabase } from "../config/supabaseClient";
import { supabase as SSupebase } from "../config/supabaseSuperClient";
type profileRole = {
    ROLE:'USER' | 'MODERATOR'
}
const getProfileRole = async (id: string): Promise<profileRole | null> => {
    try {
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('ROLE')
            .eq('id', id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError.message);
            return null;
        }

        if (!userProfile) {
            console.warn('No user profile found for the given ID:', id);
            return null;
        }
        return { ROLE: userProfile.ROLE as 'USER' | 'MODERATOR' };
    } catch (error) {
        console.error('Unexpected error while fetching user profile:', error);
        return null;
    }
};

const getUserArticles = async (profileId: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "postid, title, content, created_at, updated_at, " +
        "article_ratings!left(postid, sum:rating)"
      )
      .eq("userid", profileId)
      .eq("deleted", false)
      .order("created_at", { ascending: false });
  
    if (error || !Array.isArray(data)) {
      console.error("Error fetching articles:", error?.message);
      return [];
    }
    return data
  };

  const AddUserHistory = async (user: User, postid: string) => {
    console.log("Adding user history:", user);
    if (!user || !user.id || !postid) {
      console.error("Invalid user data:", user);
      return null;
    }
    
    const { data, error } = await SSupebase
    .from("history")
    .upsert(
      [
        {
          postid: postid,
          userid: user.id,
          created_at: new Date(),
        },
      ],
      { onConflict: 'postid,userid' }
    );
  
    if (error) {
      console.error("Error adding history:", error.message);
      return null;
    }
       
    return data; 
  }
    
export {getProfileRole, getUserArticles, AddUserHistory}