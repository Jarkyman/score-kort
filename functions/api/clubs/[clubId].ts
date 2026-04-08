import type { Env } from "../_shared";
import { jsonResponse, errorResponse } from "../_shared";

/**
 * GET /api/clubs/:clubId
 * Returns a single club with all its details.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const clubIdNum = parseInt(params["clubId"] as string, 10);
    if (isNaN(clubIdNum)) return errorResponse("Invalid club ID", 400);

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

        return jsonResponse({
            ...club,
            courses: courses.results || []
        }, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
