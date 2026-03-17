import type { Env } from "./_shared";
import { jsonResponse, errorResponse } from "./_shared";

/**
 * POST /api/requests
 * Submit a change request / correction / missing club report.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const body = await request.json() as {
            type?: string;
            club_id?: number;
            course_id?: number;
            tee_key?: string;
            user_message?: string;
            user_contact?: string;
            website_url?: string;
        };

        // --- Honeypot Bot Protection ---
        // If the visually hidden field is filled out, 
        // it's a bot. We return success to fool them.
        if (body.website_url) {
            console.log("Bot caught by honeypot field. Ignoring request.");
            return jsonResponse({ success: true, message: "Tak for din indberetning!" }, 201, 0, request.headers.get("Origin"));
        }

        if (!body.type || !body.user_message) {
            return errorResponse("Missing required fields: type, user_message", 400);
        }

        const validTypes = ["correction", "missing_club", "other"];
        if (!validTypes.includes(body.type)) {
            return errorResponse(`Invalid type. Must be one of: ${validTypes.join(", ")}`, 400);
        }

        await env.DB.prepare(
            `INSERT INTO change_requests (type, club_id, course_id, tee_key, user_message, user_contact)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
        )
            .bind(
                body.type,
                body.club_id ?? null,
                body.course_id ?? null,
                body.tee_key ?? null,
                body.user_message,
                body.user_contact ?? null,
            )
            .run();

        return jsonResponse({ success: true, message: "Tak for din indberetning!" }, 201, 0, request.headers.get("Origin"));
    } catch (e) {
        return errorResponse("Server error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
};
