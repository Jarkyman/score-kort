export interface Course {
    course_id: number;
    course_name: string;
    club_id: number;
    club_name: string;
    num_holes: number;
}

export interface Tee {
    tee_key: string;
    tee_name: string;
    tee_color: string | null;
    slope: number | null;
    cr: number | null;
    slope_women: number | null;
    cr_women: number | null;
}

export interface Hole {
    hole_no: number;
    par: number | null;
    hcp: number | null;
    match_index: number | null; // Often the same as hcp/index
    lengths: Record<string, number | null>; // Map of tee_key -> length
}

export interface FullScorecardData {
    course: Course;
    tees: Tee[];
    holes: Hole[];
}

export const api = {
    async getFullScorecard(courseId: string | number): Promise<FullScorecardData> {
        const res = await fetch(`/api/courses/${courseId}/full_scorecard`);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to fetch scorecard (${res.status}): ${text.substring(0, 100)}`);
        }
        return res.json();
    }
};
