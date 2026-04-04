import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";

type RequestType = "correction" | "missing_club" | "other";

interface ClubOption {
    club_id: number;
    club_name: string;
}

interface CourseOption {
    course_id: number;
    course_name: string;
}

export default function RequestPage() {
    const [searchParams] = useSearchParams();
    const initialClubId = searchParams.get("clubId") ? parseInt(searchParams.get("clubId")!) : null;
    const initialCourseId = searchParams.get("courseId") ? parseInt(searchParams.get("courseId")!) : null;

    const [type, setType] = useState<RequestType>("correction");
    const [selectedClubId, setSelectedClubId] = useState<number | null>(initialClubId);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(initialCourseId);
    const [clubs, setClubs] = useState<ClubOption[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);

    const [message, setMessage] = useState("");
    const [contact, setContact] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState(""); // Honeypot field
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all clubs on mount
    useEffect(() => {
        fetch("/api/clubs?limit=1000")
            .then(res => res.json())
            .then((data: any) => setClubs(data.clubs || []))
            .catch(err => console.error("Failed to fetch clubs:", err));
    }, []);

    // Fetch courses when a club is selected
    useEffect(() => {
        if (!selectedClubId) {
            setCourses([]);
            if (selectedClubId !== initialClubId) { // Only reset if user manually changed club
                 setSelectedCourseId(null);
            }
            return;
        }

        fetch(`/api/clubs/${selectedClubId}`)
            .then(res => res.json())
            .then((data: any) => {
                setCourses(data.courses || []);
                // If the selected course doesn't belong to the newly selected club, clear it (unless it's the initial load match)
                if (selectedCourseId && data.courses && !data.courses.some((c: any) => c.course_id === selectedCourseId)) {
                    if (selectedClubId === initialClubId) {
                         setSelectedCourseId(initialCourseId);
                    } else {
                         setSelectedCourseId(null);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch courses:", err));
    }, [selectedClubId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    club_id: selectedClubId,
                    course_id: selectedCourseId,
                    user_message: message.trim(),
                    user_contact: contact.trim() || undefined,
                    website_url: websiteUrl, // Honeypot payload
                }),
            });

            if (!res.ok) {
                const data = await res.json() as { error: string };
                throw new Error(data.error ?? "Noget gik galt");
            }

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noget gik galt");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="animate-in text-center py-20">
                <SEO title="Tak for din indberetning | Score-kort.dk" description="Tak for at hjælpe med at forbedre siden." />
                <div className="w-16 h-16 rounded-full bg-brand-600/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Tak for din indberetning!</h2>
                <p className="text-text-secondary mb-6">Vi kigger på det hurtigst muligt.</p>
                <Link to={selectedClubId ? `/klub/${selectedClubId}` : "/"} className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-semibold transition-all">
                    ← {selectedClubId ? "Tilbage til klubben" : "Tilbage til forsiden"}
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-lg mx-auto">
            <SEO title="Indberet fejl eller tilføj klub | Score-kort.dk" description="Har du fundet en fejl? Mangler der et scorekort? Indberet det her." url="/indberetning" />
            <h1 className="text-2xl font-bold mb-2">Indberet en rettelse</h1>
            <p className="text-text-secondary text-sm mb-6">
                Har du fundet fejl i banedata, mangler der en klub, eller har du anden feedback?
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type */}
                <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { value: "correction" as const, label: "Rettelse" },
                            { value: "missing_club" as const, label: "Manglende klub" },
                            { value: "other" as const, label: "Andet" },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setType(opt.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${type === opt.value
                                        ? "bg-brand-600/15 text-brand-400 border border-brand-600/30"
                                        : "bg-surface-card border border-border text-text-secondary hover:text-text-primary hover:bg-surface-3"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Club & Course Selection */}
                {type !== "other" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Golfklub <span className="text-text-muted font-normal">(valgfri)</span>
                            </label>
                            <select
                                value={selectedClubId || ""}
                                onChange={(e) => {
                                    setSelectedClubId(e.target.value ? parseInt(e.target.value) : null);
                                    setSelectedCourseId(null);
                                }}
                                className="w-full px-4 py-2.5 bg-surface-card border border-border rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                            >
                                <option value="">-- Vælg klub --</option>
                                {clubs.map(c => (
                                    <option key={c.club_id} value={c.club_id}>{c.club_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Bane <span className="text-text-muted font-normal">(valgfri)</span>
                            </label>
                            <select
                                value={selectedCourseId || ""}
                                onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : null)}
                                disabled={!selectedClubId || courses.length === 0}
                                className="w-full px-4 py-2.5 bg-surface-card border border-border rounded-xl text-sm disabled:opacity-50 disabled:bg-surface-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                            >
                                <option value="">-- Vælg bane --</option>
                                {courses.map(c => (
                                    <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium mb-2">Besked *</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        placeholder="Beskriv hvad der skal rettes eller tilføjes..."
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm
              placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30
              resize-y transition-all"
                    />
                </div>

                {/* Contact (optional) */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Kontakt <span className="text-text-muted font-normal">(valgfri)</span>
                    </label>
                    <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Email eller telefon, hvis du ønsker svar"
                        className="w-full px-4 py-2.5 bg-surface-card border border-border rounded-xl text-sm
              placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                    />
                </div>

                {/* Honeypot field - visually hidden to catch bots that fill out all inputs */}
                <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
                    <label htmlFor="website_url">Website URL</label>
                    <input
                        type="text"
                        id="website_url"
                        name="website_url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-semibold transition-all
            shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Sender..." : "Send indberetning"}
                </button>
            </form>
        </div>
    );
}
