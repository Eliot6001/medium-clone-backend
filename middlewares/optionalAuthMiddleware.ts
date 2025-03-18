import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';
import { Request, Response, NextFunction } from 'express';

function getToken(req: Request) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

export type RequestWithUser = Request & {
  user?: User | null;
};

const optionalAuthMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const JWT = getToken(req);
  console.log("JWT from optional auth:", JWT);

  // If there's no token, proceed as unauthenticated.
  if (!JWT) {
    req.user = null;
    return next();
  }

  // Validate the JWT with Supabase.
  const { data: { user }, error } = await supabase.auth.getUser(JWT);

  if (error) {
    req.user = null;
    return next();

  } else {
    req.user = user as User;
    return next();
  }
};

export { optionalAuthMiddleware };
