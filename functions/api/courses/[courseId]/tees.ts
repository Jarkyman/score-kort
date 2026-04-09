import type { Env } from "../../_shared";
import { jsonResponse, errorResponse, cacheKey, getCached, setCached } from "../../_shared";

/**
 * GET /api/courses/:courseId/tees
 * Returns all tees for a course with their length data.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const courseIdNum = parseInt(params["courseId"] as string, 10);
    if (isNaN(courseIdNum)) return errorResponse("Invalid course ID", 400);

    const reqUrl = new URL(request.url);
    const key = cacheKey(reqUrl.pathname, reqUrl.searchParams);
    const cached = await getCached(env.SCORE_CACHE, key);
    if (cached !== null) {
        return jsonResponse(cached, 200, 3600, request.headers.get("Origin"), env.ENVIRONMENT);
    }

    try {
        const tees = await env.DB.prepare(
            `SELECT * FROM tees WHERE course_id = ?1 ORDER BY tee_name`
        )
            .bind(courseIdNum)
            .all();

        const responseData = {
            course_id: courseIdNum,
            tees: tees.results || []
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
