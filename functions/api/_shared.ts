/**
 * Shared Cloudflare env type for Pages Functions.
 */
export interface Env {
    DB: D1Database;
}

/**
 * JSON helper — returns a Response with JSON content-type and caching headers.
 */
export function jsonResponse(data: unknown, status = 200, cacheSecs = 300): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": `public, max-age=${cacheSecs}`,
            "Access-Control-Allow-Origin": "*",
        },
    });
}

/**
 * Error response helper.
 */
export function errorResponse(message: string, status = 400): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
