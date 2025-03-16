/**
 * Middleware to authenticate and authorize users using Supabase.
 * 
 * This module contains two middlewares:
 * 
 * 1. `authMiddleware`: Verifies the JWT token from the request headers and attaches the authenticated user to the request object.
 * 
 *    - Extracts the JWT token from the Authorization header.
 *    - Validates the token with Supabase.
 *    - Attaches the authenticated user to the request object.
 *    - Responds with a 401 status code if the token is invalid or missing.
 * 
 * 2. `supabaseAuthClientMiddleware`: Creates an authenticated Supabase client for requests that require Row Level Security (RLS).
 * 
 *    - Checks if the user is authenticated by the previous middleware.
 *    - Extracts the token from the Authorization header.
 *    - Creates an authenticated Supabase client using the token.
 *    - Attaches the authenticated Supabase client to the request object.
 *    - Responds with a 401 status code if the client creation fails.
 * 
 * Usage:
 * 
 * Apply `authMiddleware` to routes that require user authentication.
 * Apply `supabaseAuthClientMiddleware` to routes that require authenticated access to Supabase tables with RLS. Ensure that `authMiddleware` is applied before `supabaseAuthClientMiddleware` for proper authentication and client creation.
 */