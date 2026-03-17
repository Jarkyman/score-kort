import { errorResponse } from "./_shared";

// In-memory rate limiting map for basic protection
// WARNING: In Cloudflare Workers/Pages, this map is localized to each V8 isolate.
// It is not a global rate limit, but it provides basic defense against spam/dDOS from a single IP per local edge node.
const rateLimitMap = new Map<string, { count: number; expires: number }>();

const MAX_REQUESTS = 60; // 60 requests
const WINDOW_MS = 60000; // per 1 minute

export const onRequest: PagesFunction = async (context) => {
    // Only apply rate limiting to /api/* routes
    const url = new URL(context.request.url);
    if (!url.pathname.startsWith("/api/")) {
        return await context.next();
    }

    const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
    const now = Date.now();
    let record = rateLimitMap.get(ip);

    // Clean up expired records to prevent unbounded memory growth
    // Note: for a very high traffic site, a periodic cleanup interval might be better.
    if (!record || record.expires < now) {
        record = { count: 1, expires: now + WINDOW_MS };
    } else {
        record.count++;
    }
    rateLimitMap.set(ip, record);

    if (record.count > MAX_REQUESTS) {
        return errorResponse("Too many requests from this IP. Please try again later.", 429);
    }

    // Add security and CORS headers to all API responses
    const response = await context.next();
    
    // Create a new response to modify headers since context.next() response might be immutable
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("X-RateLimit-Limit", MAX_REQUESTS.toString());
    newResponse.headers.set("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - record.count).toString());
    
    return newResponse;
};
