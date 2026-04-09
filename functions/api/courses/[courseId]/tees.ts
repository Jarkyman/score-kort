import type { Env } from "../../_shared";
import { jsonResponse, errorResponse } from "../../_shared";

/**
 * GET /api/courses/:courseId/tees
 * Returns all tees for a course with their length data.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const courseIdNum = parseInt(params["courseId"] as string, 10);
    if (isNaN(courseIdNum)) return errorResponse("Invalid course ID", 400);

    try {
        const tees = await env.DB.prepare(
            `SELECT * FROM tees WHERE course_id = ?1 ORDER BY tee_name`
        )
            .bind(courseIdNum)
            .all();

        return jsonResponse({
            course_id: courseIdNum,
            tees: tees.results || []
        }, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        const errorMsg = env.ENVIRONMENT !== "production" 
            ? (e instanceof Error ? e.message : String(e))
            : "An unexpected database error occurred.";
        return errorResponse("Database error: " + errorMsg, 500);
    }
};
