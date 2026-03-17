import type { Env } from "./_shared";
import { jsonResponse, errorResponse } from "./_shared";

/**
 * GET /api/scorecard?tee_key=...
 * Returns the full scorecard for a specific tee:
 *   course info, holes (par/hcp), tee info (slope/cr), lengths per hole.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const teeKey = url.searchParams.get("tee_key");

    if (!teeKey) {
        return errorResponse("Missing required parameter: tee_key", 400);
    }

    try {
        // Get tee details
        const tee = await env.DB.prepare(
            `SELECT * FROM tees WHERE tee_key = ?1`
        )
            .bind(teeKey)
            .first();

        if (!tee) {
            return errorResponse("Tee not found", 404);
        }

        const courseId = tee.course_id;

        // Get course and club info
        const course = await env.DB.prepare(
            `SELECT c.*, cl.club_name, cl.club_id
       FROM courses c
       JOIN clubs cl ON cl.club_id = c.club_id
       WHERE c.course_id = ?1`
        )
            .bind(courseId)
            .first();

        // Get holes
        const holes = await env.DB.prepare(
            `SELECT * FROM holes WHERE course_id = ?1 ORDER BY hole_no`
        )
            .bind(courseId)
            .all();

        // Get lengths for this tee
        const lengths = await env.DB.prepare(
            `SELECT hole_no, length FROM tee_lengths WHERE tee_key = ?1 ORDER BY hole_no`
        )
            .bind(teeKey)
            .all();

        // Get all tees for this course (for switcher)
        const allTees = await env.DB.prepare(
            `SELECT tee_key, tee_name, tee_color, slope, cr, slope_women, cr_women
       FROM tees WHERE course_id = ?1 ORDER BY tee_name`
        )
            .bind(courseId)
            .all();

        return jsonResponse({
            course,
            tee,
            holes: holes.results,
            lengths: lengths.results,
            allTees: allTees.results,
        }, 200, 600);
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
