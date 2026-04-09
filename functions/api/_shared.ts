/**
 * Shared Cloudflare env type for Pages Functions.
 */
export interface Env {
    DB: D1Database;
    API_KEYS: KVNamespace;
    SCORE_CACHE: KVNamespace;
    ENVIRONMENT?: string;
}

/**
 * JSON helper — returns a Response with JSON content-type and caching headers.
 */
export function jsonResponse(data: unknown, status = 200, cacheSecs = 300, requestOrigin?: string | null, environment?: string): Response {
    // Basic CORS handling - allow only localhost (non-production only) or the production domain
    let allowedOrigin = "";
    if (requestOrigin) {
        const isProduction = environment === "production";
        if (
            (!isProduction && requestOrigin.startsWith("http://localhost")) ||
            requestOrigin.endsWith(".pages.dev") ||
            requestOrigin === "https://score-kort.dk"
        ) {
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

const CACHE_VERSION = "v1";

export async function getCached(kv: KVNamespace, key: string): Promise<unknown | null> {
    const raw = await kv.get(key, "json");
    return raw ?? null;
}

export async function setCached(
    kv: KVNamespace,
    key: string,
    data: unknown,
    ttlSeconds: number
): Promise<void> {
    await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
}

export function cacheKey(urlPath: string, searchParams: URLSearchParams): string {
    const sorted = new URLSearchParams([...searchParams.entries()].sort());
    const qs = sorted.toString();
    return `${CACHE_VERSION}:${urlPath}${qs ? "?" + qs : ""}`;
}
