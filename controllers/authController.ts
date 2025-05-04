import createClient from "../config/supabaseAuthClient";
import { createServerClient as initClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { Request, Response } from "express";

interface ConfirmAuthRequest extends Request {
    query: {
        token_hash?: string;
        type?: string;
        next?: string;
    };
}

const ConfirmAuth = async function (req: ConfirmAuthRequest, res: Response): Promise<void> {
  console.log("ConfirmAuth", req); // You confirmed this is getting valid data
  const token_hash = req.query.token_hash;
  const type = req.query.type;
  const next = req.query.next ?? "/";
  console.log(`Received token_hash: ${token_hash}\ntypeof ${type}`)
  if (!token_hash || !type) {
      return res.redirect(303, "/auth/auth-code-error"); // Handle missing params
  }

  const supabase = createClient({ req, res });

  try {
      const { error } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash,
      });

      if (error) {
          return res.redirect(303, "/auth/auth-code-error");
      }

      console.log("ConfirmAuth success", req.query);

      return res.redirect(303, `${next}`);
  } catch (error) {
      console.error("Error during OTP verification:", error);
      return res.redirect(303, "/auth/auth-code-error"); // Handle internal errors gracefully
  }
};


const oAuthSetup = async (req: Request, res: Response) => {
    // Cast code and next to string since they come from query parameters
    const code = req.query.code as string | undefined;
    const next = (req.query.next as string | undefined) ?? "/";
    
    if (code) {
      const supabase = createClient({ req, res })
      try {
        console.log("OAuth Code Received:", code);
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        console.log("Exchange Result:", data, error);
        if (error) throw error;
      } catch (err: any) {
        console.error("OAuth Exchange Failed:", err);
        return res.status(500).json({ error: "OAuth exchange failed: " + err.message });
      }
    }
    const redirectUrl = next && next !== "/" ? next : process.env.FRONTEND_URL!;
    // Safely slice the next parameter as a string
    res.redirect(303, redirectUrl);
  };

export { ConfirmAuth, oAuthSetup };
