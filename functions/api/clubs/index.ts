import type { Env } from "../_shared";
import { jsonResponse, errorResponse } from "../_shared";

/**
 * GET /api/clubs?q=...&page=1&limit=20
 * Lists clubs with optional search and pagination.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

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

        return jsonResponse({
            clubs: dataResult.results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }, 200, 300, request.headers.get("Origin"));
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
