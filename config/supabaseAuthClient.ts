import { create } from "domain"

const { createServerClient, parseCookieHeader, serializeCookieHeader } = require('@supabase/ssr')

interface Cookie {
    name: string;
    value: string;
    options: Record<string, unknown>;
}

interface Context {
    req: {
        headers: {
            cookie?: string;
        };
    };
    res: {
        appendHeader: (name: string, value: string) => void;
    };
}

const createClient = (context: Context) => {
    return createServerClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string, {
        cookies: {
            getAll() {
                return parseCookieHeader(context.req.headers.cookie ?? '')
            },
            setAll(cookiesToSet: Cookie[]) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    context.res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options))
                )
            },
        },
    })
}

export default createClient