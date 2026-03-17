import type { Env } from "../_shared";
import { jsonResponse, errorResponse } from "../_shared";

/**
 * GET /api/clubs/:clubId
 * Returns a single club with all its details.
 */
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
    const clubId = params["clubId"];

    try {
        const club = await env.DB.prepare(
            `SELECT * FROM clubs WHERE club_id = ?1`
        )
            .bind(clubId)
            .first();

        if (!club) {
            return errorResponse("Club not found", 404);
        }

        // Also fetch courses for this club
        const courses = await env.DB.prepare(
            `SELECT course_id, course_name, num_holes FROM courses WHERE club_id = ?1 ORDER BY course_name`
        )
            .bind(clubId)
            .all();

        return jsonResponse({ ...club, courses: courses.results });
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
