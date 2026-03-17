import type { Env } from "../../_shared";
import { jsonResponse, errorResponse } from "../../_shared";

/**
 * GET /api/clubs/:clubId/courses
 * Lists all courses for a given club.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const clubId = params["clubId"];
    const parsedId = typeof clubId === "string" ? parseInt(clubId, 10) : Number(clubId);

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
            .bind(clubId)
            .all();

        return jsonResponse({
            club_id: parsedId,
            courses: courses.results || []
        }, 200, 300, request.headers.get("Origin"));
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
