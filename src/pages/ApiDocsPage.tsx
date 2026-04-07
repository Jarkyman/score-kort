import SEO from "../components/SEO";

export default function ApiDocsPage() {
    return (
        <div className="animate-in max-w-4xl mx-auto py-10 px-4">
            <SEO
                title="API Dokumentation | score-kort.dk"
                description="Læs hvordan du bruger score-kort.dk API'et til at hente golfklub- og banedata."
            />

            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/10 border border-brand-600/20 text-brand-400 text-xs font-bold uppercase tracking-wider mb-4">
                    Developer Portal
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">API Dokumentation</h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
                    Velkommen til vores åbne API. Her kan du tilgå data om danske golfklubber, baner og scorekort-data programmatisk.
                </p>
            </header>

            <div className="space-y-16">
                {/* Authentication Section */}
                <section id="auth">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-3 border border-border text-sm">1</span>
                        Autentificering
                    </h2>
                    <div className="card p-6 bg-surface-card border-border">
                        <p className="mb-4">
                            Alle kald til API'et (undtagen fra vores eget website) kræver en unik API-token.
                            Vi understøtter to måder at sende din token på:
                        </p>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold mb-2 text-text-primary">1. HTTP Header (Anbefalet)</h3>
                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm overflow-x-auto border border-slate-800">
                                    <code>Authorization: Bearer DIN_TOKEN_HER</code>
                                </pre>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold mb-2 text-text-primary">2. Custom Header</h3>
                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm overflow-x-auto border border-slate-800">
                                    <code>x-api-key: DIN_TOKEN_HER</code>
                                </pre>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <h3 className="font-bold mb-2">Hvordan får jeg en token?</h3>
                            <p className="text-text-secondary text-sm">
                                Kontakt os på <a href="mailto:admin@score-kort.dk" className="text-brand-400 hover:underline">admin@score-kort.dk</a> med en kort beskrivelse af dit projekt.
                                Vi udsteder Tokens manuelt for at sikre, at systemet ikke overbelastes. Det er p.t. gratis at bruge til ikke-kommercielle formål.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Response Format Section */}
                <section id="format">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-3 border border-border text-sm">2</span>
                        Respons Format
                    </h2>
                    <p className="mb-4 text-text-secondary">
                        Alle svar returneres som standard JSON. Vi benytter standard HTTP-fejlkoder.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                            <div className="font-bold text-green-400 mb-1">200 OK</div>
                            <div className="text-xs text-text-secondary">Forespørgslen lykkedes.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                            <div className="font-bold text-red-400 mb-1">401 Unauthorized</div>
                            <div className="text-xs text-text-secondary">Token mangler eller er ugyldig.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                            <div className="font-bold text-yellow-400 mb-1">429 Too Many Requests</div>
                            <div className="text-xs text-text-secondary">Rate limit er nået (60 req/min).</div>
                        </div>
                    </div>
                </section>

                {/* Endpoints Section */}
                <section id="endpoints">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-3 border border-border text-sm">3</span>
                        Endpoints
                    </h2>

                    <div className="space-y-8">
                        {/* Clubs List */}
                        <div className="border-l-4 border-brand-500 pl-6 py-2">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded uppercase">GET</span>
                                <code className="text-lg font-mono text-text-primary">/api/clubs</code>
                            </div>
                            <p className="text-text-secondary text-sm mb-4">Henter en liste over alle tilgængelige golfklubber.</p>
                            <h4 className="text-xs font-bold uppercase text-text-muted mb-2">Eksempel respons</h4>
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto">
                                {`{
  "clubs": [
    { "club_id": 1, "club_name": "Silkeborg Ry Golfklub", "city": "Silkeborg" },
    ...
  ]
}`}
                            </pre>
                        </div>

                        {/* Club Details */}
                        <div className="border-l-4 border-brand-500 pl-6 py-2">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded uppercase">GET</span>
                                <code className="text-lg font-mono text-text-primary">/api/clubs/:id</code>
                            </div>
                            <p className="text-text-secondary text-sm mb-4">Henter specifikke detaljer om en klub inklusiv dens baner.</p>
                        </div>

                        {/* Scorecard */}
                        <div className="border-l-4 border-blue-500 pl-6 py-2">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded uppercase">GET</span>
                                <code className="text-lg font-mono text-text-primary">/api/scorecard</code>
                            </div>
                            <p className="text-text-secondary text-sm mb-2">Henter fuld scorekort-data for en specifik bane og tee.</p>
                            <div className="bg-surface-2 p-3 rounded-lg border border-border text-xs mb-4">
                                <strong className="text-text-primary">Parametre:</strong>
                                <ul className="list-disc ml-4 mt-1 space-y-1 text-text-secondary">
                                    <li><code>courseId</code> (required)</li>
                                    <li><code>teeId</code> (required)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Note */}
                <footer className="pt-10 border-t border-border text-center">
                    <p className="text-sm text-text-muted italic">
                        Har du brug for hjælp til integrationen? Kontakt os via email.
                    </p>
                </footer>
            </div>
        </div>
    );
}
