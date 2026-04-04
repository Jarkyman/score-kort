import { Link } from "react-router-dom";
import { useEffect } from "react";

const FEATURES = [
    {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V8l-4 4V21M15 21V4l4 4V21M9 8l6-4" />
            </svg>
        ),
        title: "187+ Golfklubber",
        description: "Komplet oversigt over alle danske golfklubber med adresser og baneoplysninger.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
        ),
        title: "Detaljerede Scorekort",
        description: "Se par, handicap-indeks, slope, CR og afstande for alle tee-farver på hver bane.",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
        ),
        title: "GPS Koordinater",
        description: "Find vej direkte til golfbanen med GPS-koordinater — kommer snart.",
        comingSoon: true,
    },
];

const STATS = [
    { value: "187+", label: "Golfklubber" },
    { value: "350+", label: "Baner" },
    { value: "100%", label: "Gratis" },
];

export default function HomePage() {
    useEffect(() => {
        document.title = "Score-kort.dk — Danske Golf Scorekort";
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg" />
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Alle danske golfbaner samlet ét sted
                    </div>
                    <h1 className="hero-title">
                        Dit digitale
                        <br />
                        <span className="hero-title-accent">scorekort</span>
                    </h1>
                    <p className="hero-subtitle">
                        Find scorekort, banedata, tee-oplysninger og meget mere for alle golfklubber i Danmark.
                    </p>

                    <div className="hero-actions">
                        <Link to="/klubber" className="hero-cta">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find Golfklub
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="hero-stats">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="hero-stat">
                                <span className="hero-stat-value">{stat.value}</span>
                                <span className="hero-stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="features-heading">
                    Alt du behøver — <span className="text-brand-600">samlet her</span>
                </h2>
                <p className="features-subheading">
                    Score-kort.dk giver dig hurtig adgang til banedata for alle danske golfklubber.
                </p>

                <div className="features-grid">
                    {FEATURES.map((feature, i) => (
                        <div
                            key={feature.title}
                            className="feature-card"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">
                                {feature.title}
                                {feature.comingSoon && (
                                    <span className="coming-soon-badge">Kommer snart</span>
                                )}
                            </h3>
                            <p className="feature-description">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bottom-cta-section">
                <div className="bottom-cta-card">
                    <h2 className="bottom-cta-title">Klar til at finde din bane?</h2>
                    <p className="bottom-cta-text">
                        Søg blandt 187+ danske golfklubber og find alle banedetaljer.
                    </p>
                    <Link to="/klubber" className="hero-cta">
                        Udforsk alle klubber
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}
