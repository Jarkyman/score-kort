import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ScorecardView from "../components/ScorecardView";

interface ClubDetail {
    club_id: number;
    club_name: string;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
    website: string | null;
    email: string | null;
    telephone: string | null;
    courses: { course_id: number; course_name: string; num_holes: number }[];
}

export default function ClubDetailPage() {
    const { clubId } = useParams();
    const [club, setClub] = useState<ClubDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/clubs/${clubId}`);
                if (!res.ok) throw new Error(`Not found (${res.status})`);

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await res.text();
                    console.error("Received non-JSON response:", text.substring(0, 100));
                    throw new Error("Invalid response format");
                }

                const data = await res.json() as ClubDetail;
                setClub(data);
            } catch (err) {
                console.error("Failed to load club:", err);
                setClub(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [clubId]);

    useEffect(() => {
        if (club && club.courses.length > 0) {
            const isValid = club.courses.some(c => c.course_id === selectedCourseId);
            if (!isValid) {
                setSelectedCourseId(club.courses[0]?.course_id ?? null);
            }
        }
    }, [club, selectedCourseId]);

    useEffect(() => {
        if (club) {
            document.title = `${club.club_name} - Scorekort | Score-kort.dk`;
        } else {
            document.title = "Golfklub | Score-kort.dk";
        }
    }, [club]);

    if (loading) {
        return (
            <div className="animate-in space-y-4">
                <div className="skeleton h-8 w-64 rounded-lg" />
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-40 rounded-xl mt-6" />
            </div>
        );
    }

    if (!club) {
        return (
            <div className="text-center py-20 text-text-muted animate-in">
                <p className="text-xl mb-2">Klubben blev ikke fundet</p>
                <Link to="/" className="text-brand-400 hover:underline text-sm">← Tilbage til oversigten</Link>
            </div>
        );
    }

    return (
        <div className="animate-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-6 print:hidden">
                <Link to="/" className="hover:text-brand-400 transition-colors">Klubber</Link>
                <span>/</span>
                <span className="text-text-secondary">{club.club_name}</span>
            </div>

            {/* Club info card */}
            <div className="bg-surface-card border border-border rounded-2xl p-6 mb-8 print:hidden">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{club.club_name}</h1>
                        {club.city && (
                            <p className="text-text-secondary">
                                {club.address && <>{club.address}, </>}
                                {club.postal_code && <>{club.postal_code} </>}{club.city}
                            </p>
                        )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-600/15 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-brand-400" fill="currentColor">
                            <circle cx="12" cy="12" r="5" />
                        </svg>
                    </div>
                </div>

                {/* Contact info */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {club.website && (
                        <a href={club.website.startsWith("http") ? club.website : `https://${club.website}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Hjemmeside
                        </a>
                    )}
                    {club.email && (
                        <a href={`mailto:${club.email}`} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {club.email}
                        </a>
                    )}
                    {club.telephone && (
                        <a href={`tel:${club.telephone}`} className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {club.telephone}
                        </a>
                    )}
                </div>
            </div>

            {/* Courses */}
            <h2 className="text-lg font-bold mb-4 print:hidden">
                Baner <span className="text-text-muted font-normal text-sm">({club.courses.length})</span>
            </h2>

            {club.courses.length === 0 ? (
                <p className="text-text-muted text-sm">Ingen baner registreret</p>
            ) : (
                <>
                    {/* Course Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 print:hidden">
                        {club.courses.map((course) => (
                            <button
                                key={course.course_id}
                                onClick={() => setSelectedCourseId(course.course_id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${selectedCourseId === course.course_id
                                    ? "bg-brand-600 text-white border-brand-600"
                                    : "bg-surface-card text-text-secondary border-border hover:bg-surface-3 hover:border-brand-300"
                                    }`}
                            >
                                {course.course_name}
                            </button>
                        ))}
                    </div>

                    {/* Scorecard View */}
                    {selectedCourseId && (
                        <div className="mt-4">
                            <ScorecardView courseId={selectedCourseId} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
