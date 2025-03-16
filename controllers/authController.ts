import createClient from "../config/supabaseAuthClient";
import { Request, Response } from "express";

interface ConfirmAuthRequest extends Request {
    query: {
        token_hash?: string;
        type?: string;
        next?: string;
    };
}

const ConfirmAuth = async function (req: ConfirmAuthRequest, res: Response): Promise<void> {
    console.log("ConfirmAuth", req);
    const token_hash = req.query.token_hash;
    const type = req.query.type;
    const next = req.query.next ?? "/";
    if (!token_hash || !type) {
        return res.redirect(303, "/auth/auth-code-error");
    }
    const supabase = createClient({ req, res });
    const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
    });
    if (!error) {
        console.log("ConfirmAuth success", req.query);
        res.redirect(303, `${next}`);
    }

    // return the user to an error page with some instructions
    res.redirect(303, "/auth/auth-code-error");
};

export { ConfirmAuth };
