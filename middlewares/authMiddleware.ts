import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient'
import { Request, Response, NextFunction } from 'express';

//ss auth


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
  user?: User
}

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

  const JWT = getToken(req)

  switch (JWT) {
    case null:
      res.status(401).json({ 'error': 'no JWT parsed' })
      break;

    default: {
      //source of truth in supabase
      const { data: { user }, error } = await supabase.auth.getUser(JWT)

      if (error) {
        res.status(401).json({ error: "You need to login again." })
      }

      else {
        req.user = user as User;
        next();
      }

      break;
    }
  }
}
export { authMiddleware }
