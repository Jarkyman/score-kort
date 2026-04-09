import { errorResponse, type Env } from "./_shared";

const MAX_REQUESTS = 60; // 60 requests
const WINDOW_MS = 60000; // per 1 minute

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // Only apply logic to /api/* routes
    if (!url.pathname.startsWith("/api/")) {
        return await context.next();
    }

    // Handle CORS preflight before auth and rate limiting
    if (request.method === "OPTIONS") {
        const origin = request.headers.get("origin");
        const isProduction = env.ENVIRONMENT === "production";
        let allowedOrigin = "";

        if (origin) {
            if (
                (!isProduction && origin.startsWith("http://localhost")) ||
                origin.endsWith(".pages.dev") ||
                origin === "https://score-kort.dk"
            ) {
                allowedOrigin = origin;
            }
        }

        const headers: Record<string, string> = {
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
            "Access-Control-Max-Age": "86400",
        };

        if (allowedOrigin) {
            headers["Access-Control-Allow-Origin"] = allowedOrigin;
        }

        return new Response(null, {
            status: 204,
            headers,
        });
    }

    // 1. Same-Origin Bypass: If the request comes from the website itself, we allow it without a token.
    // This ensures the current website doesn't break.
    const secFetchSite = request.headers.get("sec-fetch-site");
    const origin = request.headers.get("origin");
    const isDocsRequest = request.headers.get("X-Docs-Request") === "true";
    const isSameOrigin = !isDocsRequest && (
        secFetchSite === "same-origin" ||
        secFetchSite === "same-site" ||
        (origin && (
            origin === "https://score-kort.dk" ||
            origin.endsWith(".score-kort.dk") ||
            (env.ENVIRONMENT !== "production" && origin.includes("localhost"))
        ))
    );

    if (!isSameOrigin) {
        // 2. Token Validation: Require a valid token for external API calls
        const authHeader = request.headers.get("Authorization");
        const xApiKey = request.headers.get("x-api-key");

        let token = "";
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (xApiKey) {
            token = xApiKey;
        }

        if (!token) {
            return errorResponse("Authentication required.", 401);
        }

        // Check if token exists in Cloudflare KV
        const tokenStatus = await env.API_KEYS.get(token);
        if (!tokenStatus || tokenStatus === "expired") {
            return errorResponse("Authentication required.", 401);
        }
    }

    // 3. Global rate limiting via KV (key prefix "rl:" distinguishes from API tokens)
    // NOTE: KV has eventual consistency — minor over-counting under high concurrency is acceptable for this use case.
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rlKey = `rl:${ip}`;
    const now = Date.now();

    let count = 1;
    let windowStart = now;

    const stored = await env.API_KEYS.get(rlKey);
    if (stored) {
        const parsed = JSON.parse(stored) as { count: number; windowStart: number };
        if (now - parsed.windowStart < WINDOW_MS) {
            // Still within the window
            count = parsed.count + 1;
            windowStart = parsed.windowStart;
        }
        // else: window expired, start fresh
    }

    await env.API_KEYS.put(rlKey, JSON.stringify({ count, windowStart }), {
        expirationTtl: 65, // seconds; KV min is 60, +5 for clock skew buffer
    });

    if (count > MAX_REQUESTS) {
        return errorResponse("Too many requests from this IP. Please try again later.", 429);
    }

    // Add rate limit headers to all API responses
    const response = await context.next();

    // Create a new response to modify headers since context.next() response might be immutable
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-RateLimit-Limit", MAX_REQUESTS.toString());
    newResponse.headers.set("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - count).toString());

    return newResponse;
};
