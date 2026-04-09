import type { Env } from "../../_shared";
import { jsonResponse, errorResponse, cacheKey, getCached, setCached } from "../../_shared";

/**
 * GET /api/clubs/:clubId/courses
 * Lists all courses for a given club.
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
        const courses = await env.DB.prepare(
            `SELECT c.course_id, c.course_name, c.num_holes, c.measure_meters,
              COUNT(DISTINCT t.tee_key) as tee_count
       FROM courses c
       LEFT JOIN tees t ON t.course_id = c.course_id
       WHERE c.club_id = ?1
       GROUP BY c.course_id
       ORDER BY c.course_name`
        )
            .bind(clubIdNum)
            .all();

        const responseData = {
            club_id: clubIdNum,
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
