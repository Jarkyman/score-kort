import type { Env } from "../_shared";
import { jsonResponse, errorResponse } from "../_shared";

/**
 * GET /api/courses/:courseId
 * Returns course details with holes and available tees.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const courseIdNum = parseInt(params["courseId"] as string, 10);
    if (isNaN(courseIdNum)) return errorResponse("Invalid course ID", 400);

    try {
        const course = await env.DB.prepare(
            `SELECT c.*, cl.club_name, cl.club_id
       FROM courses c
       JOIN clubs cl ON cl.club_id = c.club_id
       WHERE c.course_id = ?1`
        )
            .bind(courseIdNum)
            .first();

        if (!course) {
            return errorResponse("Course not found", 404);
        }

        const holes = await env.DB.prepare(
            `SELECT * FROM holes WHERE course_id = ?1 ORDER BY hole_no`
        )
            .bind(courseIdNum)
            .all();

        const tees = await env.DB.prepare(
            `SELECT tee_key, tee_name, tee_color, slope, cr, slope_women, cr_women
       FROM tees WHERE course_id = ?1 ORDER BY tee_name`
        )
            .bind(courseIdNum)
            .all();

        return jsonResponse({
            ...course,
            holes: holes.results || [],
            tees: tees.results || []
        }, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        const errorMsg = env.ENVIRONMENT !== "production" 
            ? (e instanceof Error ? e.message : String(e))
            : "An unexpected database error occurred.";
        return errorResponse("Database error: " + errorMsg, 500);
    }
};
