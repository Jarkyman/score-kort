import { Link, Outlet, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/klubber", label: "Klubber" },
    { to: "/indberetning", label: "Indberetning" },
];

export default function Layout() {
    const { pathname } = useLocation();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-surface-2 border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20 group-hover:shadow-brand-500/30 transition-shadow">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                                <circle cx="12" cy="12" r="5" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            score-kort<span className="text-brand-500">.dk</span>
                        </span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === item.to
                                    ? "bg-brand-600/15 text-brand-400"
                                    : "text-text-secondary hover:text-text-primary hover:bg-surface-3"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className={`flex-1 w-full ${pathname === "/" ? "" : "max-w-5xl mx-auto px-4 py-6"}`}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6 text-center text-sm text-text-muted">
                <div className="max-w-5xl mx-auto px-4">
                    © {new Date().getFullYear()} score-kort.dk
                </div>
            </footer>
        </div>
    );
}
