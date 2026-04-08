import type { Env } from "../../_shared";
import { jsonResponse, errorResponse } from "../../_shared";

/**
 * GET /api/clubs/:clubId/courses
 * Lists all courses for a given club.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const clubIdNum = parseInt(params["clubId"] as string, 10);
    if (isNaN(clubIdNum)) return errorResponse("Invalid club ID", 400);

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

        return jsonResponse({
            club_id: clubIdNum,
            courses: courses.results || []
        }, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
