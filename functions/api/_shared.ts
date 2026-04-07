/**
 * Shared Cloudflare env type for Pages Functions.
 */
export interface Env {
    DB: D1Database;
    API_KEYS: KVNamespace;
}

/**
 * JSON helper — returns a Response with JSON content-type and caching headers.
 */
export function jsonResponse(data: unknown, status = 200, cacheSecs = 300, requestOrigin?: string | null): Response {
    // Basic CORS handling - allow only localhost or the production domain
    let allowedOrigin = "";
    if (requestOrigin) {
        if (requestOrigin.startsWith("http://localhost") || requestOrigin.endsWith(".pages.dev") || requestOrigin === "https://score-kort.dk") {
            allowedOrigin = requestOrigin;
        }
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${cacheSecs}`,
    };

    if (allowedOrigin) {
        headers["Access-Control-Allow-Origin"] = allowedOrigin;
        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
        headers["Access-Control-Allow-Headers"] = "Content-Type";
    }

    return new Response(JSON.stringify(data), {
        status,
        headers,
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
            "Access-Control-Allow-Origin": "*", // Allow cross-origin for errors for debugging, or restrict similarly
        },
    });
}
