import type { Env } from "../../_shared";
import { jsonResponse, errorResponse } from "../../_shared";

/**
 * GET /api/courses/:courseId/full_scorecard
 * Returns all data needed for a traditional scorecard view:
 * - Course info
 * - All available tees
 * - Holes 1-18 with par, hcp, and lengths for EVERY tee
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
    const courseIdNum = parseInt(params["courseId"] as string, 10);
    if (isNaN(courseIdNum)) return errorResponse("Invalid course ID", 400);

    try {
        // 1. Get Course Info
        const course = await env.DB.prepare(
            `SELECT c.*, cl.club_name
             FROM courses c
             JOIN clubs cl ON cl.club_id = c.club_id
             WHERE c.course_id = ?1`
        )
            .bind(courseIdNum)
            .first();

        if (!course) {
            return errorResponse("Course not found", 404);
        }

        // 2. Get All Tees for this course
        const teesVec = await env.DB.prepare(
            `SELECT tee_key, tee_name, tee_color, slope, cr, slope_women, cr_women
             FROM tees
             WHERE course_id = ?1
             ORDER BY tee_name` // You might want a better sort order (e.g. length) but name is okay for now
        )
            .bind(courseIdNum)
            .all();

        const tees = teesVec.results || [];

        // 3. Get All Holes (1-18)
        const holesVec = await env.DB.prepare(
            `SELECT hole_no, par, hcp, match_index, split_index
             FROM holes
             WHERE course_id = ?1
             ORDER BY hole_no`
        )
            .bind(courseIdNum)
            .all();

        const holes = (holesVec.results || []) as unknown as HoleData[];

        // 4. Get All Tee Lengths
        // We fetch all lengths for this course and pivot them in JS
        const lengthsVec = await env.DB.prepare(
            `SELECT tl.hole_no, tl.length, t.tee_key
             FROM tee_lengths tl
             JOIN tees t ON t.tee_key = tl.tee_key
             WHERE t.course_id = ?1`
        )
            .bind(courseIdNum)
            .all();

        const allLengths = (lengthsVec.results || []) as unknown as LengthData[];

        // 5. Structure the data: Hole -> { par, hcp, lengths: { tee_key: length } }
        const holeMap = new Map();

        interface HoleData {
            hole_no: number;
            par: number;
            hcp: number;
            match_index: number | null;
            split_index: number | null;
        }

        interface LengthData {
            hole_no: number;
            length: number;
            tee_key: string;
        }

        // Initialize with hole data
        holes.forEach((h: HoleData) => {
            holeMap.set(h.hole_no, {
                ...h,
                lengths: {} as Record<string, number> // map of tee_key -> length
            });
        });

        // Populate lengths
        allLengths.forEach((l: LengthData) => {
            const h = holeMap.get(l.hole_no);
            if (h) {
                h.lengths[l.tee_key] = l.length;
            }
        });

        // Convert map to array sorted by hole_no
        const holesWithLengths = Array.from(holeMap.values()).sort((a, b) => a.hole_no - b.hole_no);

        return jsonResponse({
            course,
            tees,
            holes: holesWithLengths
        }, 200, 300, request.headers.get("Origin"), env.ENVIRONMENT);
    } catch (e) {
        const errorMsg = env.ENVIRONMENT !== "production" 
            ? (e instanceof Error ? e.message : String(e))
            : "An unexpected database error occurred.";
        return errorResponse("Database error: " + errorMsg, 500);
    }
};
