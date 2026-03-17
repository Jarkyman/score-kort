import type { Env } from "../../_shared";
import { jsonResponse, errorResponse } from "../../_shared";

/**
 * GET /api/courses/:courseId/tees
 * Returns all tees for a course with their length data.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const courseId = params["courseId"];
    const parsedId = typeof courseId === "string" ? parseInt(courseId, 10) : Number(courseId);

    try {
        const tees = await env.DB.prepare(
            `SELECT * FROM tees WHERE course_id = ?1 ORDER BY tee_name`
        )
            .bind(courseId)
            .all();

        return jsonResponse({
            course_id: parsedId,
            tees: tees.results || []
        }, 200, 300, request.headers.get("Origin"));
    } catch (e) {
        return errorResponse("Database error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
