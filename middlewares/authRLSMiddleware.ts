import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "./authMiddleware"; // Import your existing type

// Extend the RequestWithUser type to include the authenticated client
export type RequestWithSupabase = RequestWithUser & {
  supabaseAuth?: SupabaseClient<any, "public", any>;
};

// Middleware to create an authenticated Supabase client
// This is needed for when you are handling a table protected by RLS & Requires you to be authenticated
async function supabaseAuthClientMiddleware(
  req: RequestWithSupabase,
  res: Response,
  next: NextFunction
) {
  // Check if we have a validated user from the previous middleware
  if (!req.user) {
    return next();
  }

  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  // Create an authenticated Supabase client
  const supabaseAuth = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
  if (!supabaseAuth) {
    return res
      .status(401)
      .json({ error: "Failed to authenticate Supabase client" });
  }

  // Attach the authenticated client to the request
  req.supabaseAuth = supabaseAuth;

  next();
}

export { supabaseAuthClientMiddleware };
