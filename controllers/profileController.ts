import { profile } from "console";
import {supabase} from "../config/supabaseClient";
import { Request, Response } from "express";
import {getUserArticles} from '../services/supabaseService'
import { type RequestWithSupabase } from "../middlewares/authRLSMiddleware";
import { supabase as Ssupabase } from "../config/supabaseSuperClient";
export const getUserPublishedArticles = async (req: Request, res: Response) => {
    const { profileId } = req.params;
    if (!profileId) return res.status(400).json({ error: "Profile ID is required" });
  
    try {
      const posts = await getUserArticles(profileId);
  
      if (!posts || posts.length === 0) {
        return res.status(200).json({ message: "User has never published anything!" });
      }
  
      res.status(200).json({ articles: posts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong!" });
    }
  };

export const getUserDeletedArticles = async (req: RequestWithSupabase, res: Response) => {
  const supabase = req.supabaseAuth;  
  const { profileId } = req.params;
  if(!supabase)       return res.status(500).json({ error: "Not Authenticated, Try again later!" });
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('userid', profileId)
      .eq('deleted', true).limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ deletedArticles: data });
  } catch (err) {
    return res.status(500).json({ error: "Something has occured on our end, We apologize." });

  }
};

export const getUserWatchedArticles = async (req: RequestWithSupabase, res: Response) => {
  const supabase = req.supabaseAuth;  
  const { profileId } = req.params;
  
  if(!supabase)       return res.status(500).json({ error: "Not Authenticated, Try again later!" });
  try {
    //This Implementation isn't full, Yet it works
    //To spit out a 100 history articles
    // A desired approach would be to create a cursor param that sets from what date you fetch it
    const { data, error } = await Ssupabase.rpc('fetch_history_article_contents', {p_userid: req.user?.id} );

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ historyArticles: data });
  } catch (err) {
    return res.status(500).json({ error: "Something has occured on our end, We apologize." });

  }
};

export const submitHistory = async (req: RequestWithSupabase, res: Response) => {
  const { postid } = req.body;

  if (!postid) {
    return res.status(400).json({ error: "There was an error!" });
  }
  
  if (!req.user)
    return res
      .status(500)
      .json({ error: "There has been an error, we apologize!" });

 
  try {
    // Save the article to the database
    if (!req.supabaseAuth)
      return res.status(500).json({ error: "Failed to authenticate, Try again!" });
  
    const result = await req.supabaseAuth
      .from("history")
      .upsert({
        postid: postid,
        userid: req.user.id,
        created_at: new Date(),
      });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Failed to save rating" });
  }
}

export const getIfUserHasInterestsPicked = async (req: RequestWithSupabase, res: Response) => {
  const supabase = req.supabaseAuth
  const user = req.user;
  const id = user?.id;
  
  if(!supabase || !id) return res.status(501).json({success: false, error: 'Login again!'});
  try {
    const {data} = await supabase.from("user_profile_interests").select('preferred_fields').eq('userid', id).single();
    if(data && data.preferred_fields.length == 0 || data === null){
      res.status(200).json({ success: true, data: "CHOOSE" });
    } 
    
  } catch (error) {
    return res.status(500).json({success: false, error: 'There was an error'});
  }

}
  

export const postUserHasInterests = async (req: RequestWithSupabase, res: Response) => {
  const supabase = req.supabaseAuth;
  const user = req.user;
  const id = user?.id;

  if (!supabase || !id) return res.status(401).json({ success: false, error: 'Login again!' });
  const selected = req.body.selected;

  if (!Array.isArray(selected) || selected.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid selection." });
  }

  try {
    const { error } = await supabase
      .from("user_profile_interests")
      .upsert({
        userid: id,
        preferred_fields: selected.slice(0, 3), // only store top 3 Also, i might have needed to check for the fields but who cares?
        last_updated: new Date().toISOString()
      }, { onConflict: 'userid' });

    if (error) throw error;

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Couldn't update preferences." });
  }

}



export const getProfileInformation = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  console.log("Received ", profileId)
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('username, website, avatar_url, created_at')
      .eq('id', profileId)
      .single();
    console.log(profileError, "ERROR HERERER")
    const posts = await getUserArticles(profileId);

    return res.json({
      ...profile,
      posts: posts || []
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getOwnProfileInfo = async (req: RequestWithSupabase, res: Response) => {

  const {user} = req;
  if(!req.supabaseAuth || !user) return res.status(500).json({ error: 'Server error' });
  
  try {
    const { data } = await supabase
    .from('user_profiles')
    .select('username, website, avatar_url, created_at')
    .eq('id', user.id)
    .single();

    return res.status(200).json(data);
  } catch (err) {
    console.error('getUserProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfileInformation = async (req: RequestWithSupabase, res: Response) => {
  const supabase = req.supabaseAuth;
  const user = req.user;
  const { profileId } = req.params;

  if (!user || !user.id || !supabase) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { username, website, avatar_url } = req.body;

  const { error } = await supabase
    .from('user_profiles')
    .update({
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    })
    .eq('id', profileId);

  if (error) {
    console.error('updateProfileInformation error:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }

  return res.json({ message: 'Profile updated successfully.' });
};