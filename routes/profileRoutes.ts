import { Request, Response } from 'express'
import express from 'express';
import { getUserPublishedArticles } from '../controllers/profileController';

import { authMiddleware } from '../middlewares/authMiddleware'; // Import the auth middleware
import { supabase } from '../config/supabaseClient';
import { type RequestWithUser } from '../middlewares/authMiddleware';
import { supabaseAuthClientMiddleware } from '../middlewares/authRLSMiddleware';
import {optionalAuthMiddleware} from '../middlewares/optionalAuthMiddleware'
import { submitHistory } from '../controllers/profileController';

const router = express.Router();

router.get('/:profileId/articles', getUserPublishedArticles);
router.post('/engagement', async (req, res) => {
    try {
      const { postid, userid, segments } = req.body;
      let segment = segments.length;
      if (!postid || segment === undefined || segment === null) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Step 1: Check if an engagement exists
    const { data: existingEngagement, error: fetchError } = await supabase
      .from("engagements")
      .select("id, segment")
      .eq("postid", postid)
      .eq("userid", userid)
      .single(); // Expecting only one row

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "PGRST116" (row not found) since that means no existing record
      throw fetchError;
    }

    if (existingEngagement) {
      // Step 2: If exists, check the segment value
      if (segment > existingEngagement.segment) {
        // Update segment only if new one is greater
        const { error: updateError } = await supabase
          .from("engagements")
          .update({ segment, updated_at: new Date().toISOString() })
          .eq("id", existingEngagement.id);

        if (updateError) throw updateError;
      }
    } else {
      // Step 3: Insert new engagement if no previous one exists
      const { error: insertError } = await supabase
        .from("engagements")
        .insert([{ postid, userid, segment, created_at: new Date().toISOString() }]);

      if (insertError) throw insertError;
    }

    res.status(200).json({ message: "Engagement recorded" });
    } catch (error) {
      console.log(error)
        res.status(500).json({ error: error });
      
    }
  })



export default router;
