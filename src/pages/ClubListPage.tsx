import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

interface Club {
    club_id: number;
    club_name: string;
    city: string | null;
    postal_code: string | null;
}

export default function ClubListPage() {
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        document.title = "Find Golfklub | Score-kort.dk";
    }, []);

    useEffect(() => {
        const fetchClubs = async () => {
            setLoading(true);
            try {
                // Fetch all clubs (limit 1000 covers all Danish clubs)
                const res = await fetch(`/api/clubs?limit=1000`);
                const data = await res.json() as { clubs: Club[] };
                setAllClubs(data.clubs);
            } catch (e) {
                console.error("Failed to fetch clubs:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchClubs();
    }, []);

    const filteredClubs = useMemo(() => {
        if (!searchInput) return allClubs;
        const lowerQ = searchInput.toLowerCase();
        return allClubs.filter(club =>
            club.club_name.toLowerCase().includes(lowerQ) ||
            (club.city && club.city.toLowerCase().includes(lowerQ))
        );
    }, [allClubs, searchInput]);

    return (
        <div className="animate-in">
            {/* Hero */}
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                    Danske <span className="text-brand-400">Golfklubber</span>
                </h1>
                <p className="text-text-secondary max-w-lg mx-auto">
                    Find scorekort, banedata og tee-oplysninger for alle golfklubber i Danmark
                </p>
            </div>

            {/* Instant Search */}
            <div className="mb-6 max-w-md mx-auto relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Søg efter klub eller by..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-border rounded-xl text-sm
          placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-text-muted mb-4 text-center">
                    {filteredClubs.length} klub{filteredClubs.length !== 1 ? "ber" : ""} fundet
                </p>
            )}

            {/* Club list */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 rounded-xl" />
                    ))}
                </div>
            ) : filteredClubs.length === 0 ? (
                <div className="text-center py-16 text-text-muted">
                    <p className="text-lg mb-1">Ingen klubber fundet</p>
                    <p className="text-sm">Prøv et andet søgeord</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredClubs.map((club, i) => (
                        <Link
                            key={club.club_id}
                            to={`/klub/${club.club_id}`}
                            className="flex items-center justify-between p-4 bg-surface-card border border-border rounded-xl
                hover:border-brand-600/40 hover:bg-surface-3 transition-all group"
                            style={i < 20 ? { animationDelay: `${i * 30}ms` } : {}}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-brand-600/15 flex items-center justify-center shrink-0">
                                    <span className="text-brand-400 font-bold text-sm">
                                        {club.club_name.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm truncate group-hover:text-brand-400 transition-colors">
                                        {club.club_name}
                                    </h3>
                                    {club.city && (
                                        <p className="text-xs text-text-muted truncate">
                                            {club.postal_code && `${club.postal_code} `}{club.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
