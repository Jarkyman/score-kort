import type { Env } from "../_shared";
import { jsonResponse, errorResponse, cacheKey, getCached, setCached } from "../_shared";

/**
 * GET /api/clubs/:clubId
 * Returns a single club with all its details.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const clubIdNum = parseInt(params["clubId"] as string, 10);
    if (isNaN(clubIdNum)) return errorResponse("Invalid club ID", 400);

    const reqUrl = new URL(request.url);
    const key = cacheKey(reqUrl.pathname, reqUrl.searchParams);
    const cached = await getCached(env.SCORE_CACHE, key);
    if (cached !== null) {
        return jsonResponse(cached, 200, 3600, request.headers.get("Origin"), env.ENVIRONMENT);
    }

    try {
        const club = await env.DB.prepare(
            `SELECT * FROM clubs WHERE club_id = ?1`
        )
            .bind(clubIdNum)
            .first();

        if (!club) {
            return errorResponse("Club not found", 404);
        }

        // Also fetch courses for this club
        const courses = await env.DB.prepare(
            `SELECT course_id, course_name, num_holes FROM courses WHERE club_id = ?1 ORDER BY course_name`
        )
            .bind(clubIdNum)
            .all();

        const responseData = {
            ...club,
            courses: courses.results || []
        };
        await setCached(env.SCORE_CACHE, key, responseData, 3600);
        return jsonResponse(responseData, 200, 3600, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        const errorMsg = env.ENVIRONMENT !== "production" 
            ? (e instanceof Error ? e.message : String(e))
            : "An unexpected database error occurred.";
        return errorResponse("Database error: " + errorMsg, 500);
    }
};
