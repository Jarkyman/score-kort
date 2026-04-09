import type { Env } from "../_shared";
import { jsonResponse, errorResponse, cacheKey, getCached, setCached } from "../_shared";

/**
 * GET /api/clubs?q=...&page=1&limit=20
 * Lists clubs with optional search and pagination.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const pageRaw = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limitRaw = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const page = Math.max(1, isNaN(pageRaw) ? 1 : pageRaw);
    const limit = Math.min(1000, Math.max(1, isNaN(limitRaw) ? 20 : limitRaw));
    const offset = (page - 1) * limit;

    const key = cacheKey(url.pathname, url.searchParams);
    const cached = await getCached(env.SCORE_CACHE, key);
    if (cached !== null) {
        return jsonResponse(cached, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    }

    try {
        let countQuery: string;
        let dataQuery: string;
        const params: string[] = [];

        if (q) {
            const pattern = `%${q}%`;
            countQuery = `SELECT COUNT(*) as total FROM clubs WHERE club_name LIKE ?1 OR city LIKE ?1`;
            dataQuery = `SELECT club_id, club_name, city, postal_code FROM clubs WHERE club_name LIKE ?1 OR city LIKE ?1 ORDER BY club_name LIMIT ?2 OFFSET ?3`;
            params.push(pattern);
        } else {
            countQuery = `SELECT COUNT(*) as total FROM clubs`;
            dataQuery = `SELECT club_id, club_name, city, postal_code FROM clubs ORDER BY club_name LIMIT ?1 OFFSET ?2`;
        }

        const countResult = await env.DB.prepare(countQuery)
            .bind(...(q ? [params[0]!] : []))
            .first<{ total: number }>();

        const total = countResult?.total ?? 0;

        const dataResult = await env.DB.prepare(dataQuery)
            .bind(...(q ? [params[0]!, limit, offset] : [limit, offset]))
            .all();

        const responseData = {
            clubs: dataResult.results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
        await setCached(env.SCORE_CACHE, key, responseData, 300);
        return jsonResponse(responseData, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        const errorMsg = env.ENVIRONMENT !== "production" 
            ? (e instanceof Error ? e.message : String(e))
            : "An unexpected database error occurred.";
        return errorResponse("Database error: " + errorMsg, 500);
    }
};
