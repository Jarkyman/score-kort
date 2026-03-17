import type { Env } from "../_shared";
import { jsonResponse, errorResponse } from "../_shared";

/**
 * GET /api/courses/:courseId
 * Returns course details with holes and available tees.
 */
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
    const courseId = params["courseId"];

    try {
        const course = await env.DB.prepare(
            `SELECT c.*, cl.club_name, cl.club_id
       FROM courses c
       JOIN clubs cl ON cl.club_id = c.club_id
       WHERE c.course_id = ?1`
        )
            .bind(courseId)
            .first();

        if (!course) {
            return errorResponse("Course not found", 404);
        }

        const holes = await env.DB.prepare(
            `SELECT * FROM holes WHERE course_id = ?1 ORDER BY hole_no`
        )
            .bind(courseId)
            .all();

        const tees = await env.DB.prepare(
            `SELECT tee_key, tee_name, tee_color, slope, cr, slope_women, cr_women
       FROM tees WHERE course_id = ?1 ORDER BY tee_name`
        )
            .bind(courseId)
            .all();

        return jsonResponse({
            ...course,
            holes: holes.results,
            tees: tees.results,
        });
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
