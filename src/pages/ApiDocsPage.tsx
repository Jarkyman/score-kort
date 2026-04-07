import SEO from "../components/SEO";

interface Param {
    type: "path" | "query" | "body";
    name: string;
    required: boolean;
    description: string;
}

function MethodBadge({ method }: { method: "GET" | "POST" }) {
    const color = method === "GET"
        ? "bg-green-700 text-white"
        : "bg-blue-700 text-white";
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${color}`}>
            {method}
        </span>
    );
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto border border-slate-800">
            <code>{children}</code>
        </pre>
    );
}

function ParamsTable({ params }: { params: Param[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-surface-3 text-text-muted text-left">
                        <th className="p-2 border-b border-border font-semibold">Type</th>
                        <th className="p-2 border-b border-border font-semibold">Navn</th>
                        <th className="p-2 border-b border-border font-semibold">Krævet</th>
                        <th className="p-2 border-b border-border font-semibold">Beskrivelse</th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((p) => (
                        <tr key={p.name} className="border-b border-border last:border-b-0">
                            <td className="p-2">
                                <span className="px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-mono">{p.type}</span>
                            </td>
                            <td className="p-2 font-mono text-brand-600">{p.name}</td>
                            <td className="p-2">
                                {p.required
                                    ? <span className="text-red-400 font-semibold">ja</span>
                                    : <span className="text-text-muted">nej</span>}
                            </td>
                            <td className="p-2 text-text-secondary">{p.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface EndpointCardProps {
    method: "GET" | "POST";
    path: string;
    description: string;
    params?: Param[];
    curlExample: string;
    responseExample: string;
}

function EndpointCard({ method, path, description, params, curlExample, responseExample }: EndpointCardProps) {
    return (
        <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
                <MethodBadge method={method} />
                <code className="font-mono text-base text-text-primary">{path}</code>
            </div>
            <p className="text-sm text-text-secondary">{description}</p>
            {params && params.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase text-text-muted mb-2 tracking-wider">Parametre</h4>
                    <ParamsTable params={params} />
                </div>
            )}
            <div>
                <h4 className="text-xs font-bold uppercase text-text-muted mb-2 tracking-wider">Curl-eksempel</h4>
                <CodeBlock>{curlExample}</CodeBlock>
            </div>
            <div>
                <h4 className="text-xs font-bold uppercase text-text-muted mb-2 tracking-wider">Eksempel på svar</h4>
                <CodeBlock>{responseExample}</CodeBlock>
            </div>
        </div>
    );
}

const navItems = [
    { href: "#quickstart", label: "Kom godt i gang" },
    { href: "#auth", label: "Autentificering" },
    { href: "#rate-limit", label: "Hastighedsbegrænsning" },
    { href: "#status-codes", label: "HTTP-statuskoder" },
    { href: "#endpoints", label: "Endpoints" },
    { href: "#klubber", label: "↳ Klubber", indent: true },
    { href: "#baner", label: "↳ Baner", indent: true },
    { href: "#scorekort", label: "↳ Scorekort", indent: true },
    { href: "#anmodninger", label: "↳ Anmodninger", indent: true },
];

function SectionHeading({ num, id, children }: { num: number; id: string; children: React.ReactNode }) {
    return (
        <h2 id={id} className="text-2xl font-bold mb-6 flex items-center gap-3 scroll-mt-20">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-3 border border-border text-sm shrink-0">
                {num}
            </span>
            {children}
        </h2>
    );
}

function GroupHeading({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h3 id={id} className="text-lg font-bold mb-4 mt-10 first:mt-0 flex items-center gap-2 scroll-mt-20">
            <span className="w-1 h-5 rounded-full bg-brand-500 inline-block shrink-0" />
            {children}
        </h3>
    );
}

export default function ApiDocsPage() {
    return (
        <div className="animate-in max-w-5xl mx-auto py-10 px-4">
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
                    Åbent REST API til programmatisk adgang til danske golfklubber, baner, tees og scorekort-data.
                    Gratis til ikke-kommercielle formål.
                </p>
            </header>

            <div className="flex gap-10">
                {/* Sticky sidebar */}
                <aside className="hidden md:block w-44 shrink-0">
                    <div className="sticky top-20 space-y-0.5">
                        <p className="text-xs font-bold uppercase text-text-muted mb-3 tracking-wider">Indhold</p>
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`block py-1.5 px-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors text-sm ${item.indent ? "pl-5 text-xs" : ""}`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-16">

                    {/* 1. Kom godt i gang */}
                    <section>
                        <SectionHeading num={1} id="quickstart">Kom godt i gang</SectionHeading>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-surface-card border border-border rounded-2xl p-5">
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <span className="text-brand-400">①</span> Hent en token
                                </h3>
                                <p className="text-sm text-text-secondary mb-3">
                                    Tokens udstedes manuelt. Send en kort beskrivelse af dit projekt til:
                                </p>
                                <a
                                    href="mailto:admin@score-kort.dk"
                                    className="text-brand-400 hover:underline text-sm font-mono"
                                >
                                    admin@score-kort.dk
                                </a>
                                <p className="text-xs text-text-muted mt-3">
                                    Gratis til ikke-kommercielle formål. Vi udsteder tokens manuelt for at undgå misbrug.
                                </p>
                            </div>
                            <div className="bg-surface-card border border-border rounded-2xl p-5">
                                <h3 className="font-bold mb-2 flex items-center gap-2">
                                    <span className="text-brand-400">②</span> Test med det samme
                                </h3>
                                <p className="text-sm text-text-secondary mb-3">
                                    Når du har din token, kan du teste API'et direkte fra terminalen:
                                </p>
                                <CodeBlock>{`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/clubs?limit=5"`}</CodeBlock>
                            </div>
                        </div>
                        <div className="bg-surface-2 border border-border rounded-xl p-4 text-sm text-text-secondary">
                            <strong className="text-text-primary">Base URL:</strong>{" "}
                            <code className="font-mono text-brand-400">https://score-kort.dk</code>
                            {" "}— alle endpoints er relative til denne adresse.
                        </div>
                    </section>

                    {/* 2. Autentificering */}
                    <section>
                        <SectionHeading num={2} id="auth">Autentificering</SectionHeading>
                        <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-5">
                            <p className="text-sm text-text-secondary">
                                Alle kald til API'et kræver en gyldig token. Du kan sende den på to måder:
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 text-text-primary">
                                        1. Authorization header <span className="text-xs text-brand-400 font-normal ml-1">(anbefalet)</span>
                                    </h3>
                                    <CodeBlock>{`Authorization: Bearer DIN_TOKEN_HER`}</CodeBlock>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-2 text-text-primary">2. Custom header</h3>
                                    <CodeBlock>{`x-api-key: DIN_TOKEN_HER`}</CodeBlock>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border text-xs text-text-muted">
                                Requests fra <code className="font-mono">score-kort.dk</code> omgår token-kravet automatisk via same-origin validering.
                            </div>
                        </div>
                    </section>

                    {/* 3. Hastighedsbegrænsning */}
                    <section>
                        <SectionHeading num={3} id="rate-limit">Hastighedsbegrænsning</SectionHeading>
                        <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-4">
                            <p className="text-sm text-text-secondary">
                                API'et er begrænset til <strong className="text-text-primary">60 forespørgsler per minut</strong> per IP-adresse.
                                Ved overskridelse returneres en <code className="font-mono text-amber-700">429 Too Many Requests</code>-fejl.
                            </p>
                            <div>
                                <h4 className="text-xs font-bold uppercase text-text-muted mb-2 tracking-wider">Svar-headers</h4>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-surface-3 text-text-muted text-left">
                                                <th className="p-2 border-b border-border font-semibold">Header</th>
                                                <th className="p-2 border-b border-border font-semibold">Beskrivelse</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-border">
                                                <td className="p-2 font-mono text-brand-600">X-RateLimit-Limit</td>
                                                <td className="p-2 text-text-secondary">Maksimalt antal forespørgsler per minut</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono text-brand-600">X-RateLimit-Remaining</td>
                                                <td className="p-2 text-text-secondary">Antal tilbageværende forespørgsler i det aktuelle vindue</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. HTTP-statuskoder */}
                    <section>
                        <SectionHeading num={4} id="status-codes">HTTP-statuskoder</SectionHeading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { code: "200 OK", color: "border-green-500/20 bg-green-500/5 text-green-400", desc: "Forespørgslen lykkedes." },
                                { code: "400 Bad Request", color: "border-orange-500/20 bg-orange-500/5 text-orange-400", desc: "Ugyldig forespørgsel — typisk manglende eller forkert parameter." },
                                { code: "401 Unauthorized", color: "border-red-500/20 bg-red-500/5 text-red-400", desc: "Token mangler eller er ugyldig." },
                                { code: "403 Forbidden", color: "border-red-500/20 bg-red-500/5 text-red-400", desc: "Token er udløbet eller har ikke adgang." },
                                { code: "404 Not Found", color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400", desc: "Den forespurgte ressource findes ikke." },
                                { code: "429 Too Many Requests", color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400", desc: "Hastighedsgrænsen er nået (60 req/min)." },
                                { code: "500 Server Error", color: "border-red-500/20 bg-red-500/5 text-red-400", desc: "Intern serverfejl." },
                            ].map(({ code, color, desc }) => (
                                <div key={code} className={`p-4 rounded-xl border ${color}`}>
                                    <div className="font-bold mb-1">{code}</div>
                                    <div className="text-xs text-text-secondary">{desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 5. Endpoints */}
                    <section>
                        <SectionHeading num={5} id="endpoints">Endpoints</SectionHeading>

                        {/* Klubber */}
                        <GroupHeading id="klubber">Klubber</GroupHeading>
                        <div className="space-y-6">
                            <EndpointCard
                                method="GET"
                                path="/api/clubs"
                                description="Henter en pagineret liste over alle golfklubber. Understøtter fritekst-søgning på navn og by."
                                params={[
                                    { type: "query", name: "q", required: false, description: "Søgetekst — filtrerer på klubnavn eller by" },
                                    { type: "query", name: "page", required: false, description: "Sidenummer (standard: 1)" },
                                    { type: "query", name: "limit", required: false, description: "Antal resultater per side (standard: 20, maks: 1000)" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/clubs?q=silkeborg&page=1&limit=20"`}
                                responseExample={`{
  "clubs": [
    {
      "club_id": 42,
      "club_name": "Silkeborg Ry Golfklub",
      "city": "Silkeborg",
      "postal_code": "8600"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}`}
                            />
                            <EndpointCard
                                method="GET"
                                path="/api/clubs/:clubId"
                                description="Henter detaljer om en enkelt klub inklusiv en liste over dens baner."
                                params={[
                                    { type: "path", name: "clubId", required: true, description: "Klubbens unikke ID" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/clubs/42"`}
                                responseExample={`{
  "club_id": 50,
  "club_name": "Hedeland Golfklub",
  "address": "Stærkendevej 232A",
  "city": "Hedehusene",
  "postal_code": "2640",
  "state": null,
  "country": "Denmark",
  "latitude": 55.616266,
  "longitude": 12.172451,
  "website": "http://www.hedeland-golf.dk/",
  "email": "klub@hedeland-golf.dk",
  "telephone": "46136188",
  "continent": "Europe",
  "courses": [
    { "course_id": 503, "course_name": "Hedeland", "num_holes": 18 },
    { "course_id": 506, "course_name": "Hedeland - Maglehøj 18H", "num_holes": 18 }
  ]
}`}
                            />
                        </div>

                        {/* Baner */}
                        <GroupHeading id="baner">Baner</GroupHeading>
                        <div className="space-y-6">
                            <EndpointCard
                                method="GET"
                                path="/api/courses/:courseId"
                                description="Henter detaljerede oplysninger om en bane inklusiv alle huller og tilgængelige tees."
                                params={[
                                    { type: "path", name: "courseId", required: true, description: "Banens unikke ID" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/courses/101"`}
                                responseExample={`{
  "course_id": 101,
  "club_id": 10,
  "course_name": "Fanø",
  "num_holes": 9,
  "measure_meters": 1,
  "timestamp_updated": 1775373519337,
  "club_name": "Fanø Vesterhavsbads Golfklub",
  "holes": [
    {
      "course_id": 101,
      "hole_no": 1,
      "par": 5,
      "hcp": 3,
      "par_w": 5,
      "hcp_w": 3,
      "match_index": null,
      "split_index": null
    },
    {
      "course_id": 101,
      "hole_no": 2,
      "par": 3,
      "hcp": 13,
      "par_w": 3,
      "hcp_w": 13,
      "match_index": null,
      "split_index": null
    },
    {
      "course_id": 101,
      "hole_no": 3,
      "par": 4,
      "hcp": 5,
      "par_w": 4,
      "hcp_w": 5,
      "match_index": null,
      "split_index": null
    }
  ],
  "tees": [
    {
      "tee_key": "101_1012",
      "tee_name": "Red",
      "tee_color": "#FF5050",
      "slope": 113,
      "cr": 31.8,
      "slope_women": 118,
      "cr_women": 33.9
    },
    {
      "tee_key": "101_1011",
      "tee_name": "Yellow",
      "tee_color": "#CCCC00",
      "slope": 121,
      "cr": 33.8,
      "slope_women": 130,
      "cr_women": 36.4
    }
  ]
}`}
                            />
                            <EndpointCard
                                method="GET"
                                path="/api/courses/:courseId/tees"
                                description="Henter alle tees for en bane med slope, course rating og farve."
                                params={[
                                    { type: "path", name: "courseId", required: true, description: "Banens unikke ID" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/courses/101/tees"`}
                                responseExample={`{
  "course_id": 101,
  "tees": [
    {
      "tee_key": "101_1012",
      "course_id": 101,
      "tee_external_id": "1012",
      "tee_name": "Red",
      "tee_color": "#FF5050",
      "slope": 113,
      "slope_front9": 113,
      "slope_back9": 113,
      "cr": 31.8,
      "cr_front9": 31.8,
      "cr_back9": 31.8,
      "slope_women": 118,
      "slope_women_front9": 118,
      "slope_women_back9": 118,
      "cr_women": 33.9,
      "cr_women_front9": 33.9,
      "cr_women_back9": 33.9,
      "measure_unit": "1"
    },
    {
      "tee_key": "101_1011",
      "course_id": 101,
      "tee_external_id": "1011",
      "tee_name": "Yellow",
      "tee_color": "#CCCC00",
      "slope": 121,
      "slope_front9": 121,
      "slope_back9": 121,
      "cr": 33.8,
      "cr_front9": 33.8,
      "cr_back9": 33.8,
      "slope_women": 130,
      "slope_women_front9": 130,
      "slope_women_back9": 130,
      "cr_women": 36.4,
      "cr_women_front9": 36.4,
      "cr_women_back9": 36.4,
      "measure_unit": "1"
    }
  ]
}`}
                            />
                            <EndpointCard
                                method="GET"
                                path="/api/courses/:courseId/full_scorecard"
                                description="Returnerer alle data til en traditionel scorekorttabel — alle tees og alle huller med længder for hver tee samlet i ét kald."
                                params={[
                                    { type: "path", name: "courseId", required: true, description: "Banens unikke ID" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/courses/101/full_scorecard"`}
                                responseExample={`{
  "course": {
    "course_id": 101,
    "club_id": 10,
    "course_name": "Fanø",
    "num_holes": 9,
    "measure_meters": 1,
    "timestamp_updated": 1775373519337,
    "club_name": "Fanø Vesterhavsbads Golfklub"
  },
  "tees": [
    {
      "tee_key": "101_1012",
      "tee_name": "Red",
      "tee_color": "#FF5050",
      "slope": 113,
      "cr": 31.8,
      "slope_women": 118,
      "cr_women": 33.9
    },
    {
      "tee_key": "101_1011",
      "tee_name": "Yellow",
      "tee_color": "#CCCC00",
      "slope": 121,
      "cr": 33.8,
      "slope_women": 130,
      "cr_women": 36.4
    }
  ],
  "holes": [
    {
      "hole_no": 1,
      "par": 5,
      "hcp": 3,
      "match_index": null,
      "split_index": null,
      "lengths": { "101_1011": 504, "101_1012": 411 }
    },
    {
      "hole_no": 2,
      "par": 3,
      "hcp": 13,
      "match_index": null,
      "split_index": null,
      "lengths": { "101_1011": 155, "101_1012": 128 }
    },
    {
      "hole_no": 3,
      "par": 4,
      "hcp": 5,
      "match_index": null,
      "split_index": null,
      "lengths": { "101_1011": 317, "101_1012": 264 }
    }
  ]
}`}
                            />
                        </div>

                        {/* Scorekort */}
                        <GroupHeading id="scorekort">Scorekort</GroupHeading>
                        <div className="space-y-6">
                            <EndpointCard
                                method="GET"
                                path="/api/scorecard"
                                description="Henter et komplet scorekort for én specifik tee — inklusiv baneinformation, huldata, længder og alle øvrige tees på banen (til tee-skift). tee_key findes via /api/courses/:courseId/tees eller /full_scorecard."
                                params={[
                                    { type: "query", name: "tee_key", required: true, description: "Den unikke nøgle for en tee — hentes fra /tees eller /full_scorecard, f.eks. \"101_1012\"" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/scorecard?tee_key=101_1012"`}
                                responseExample={`{
  "course": {
    "course_id": 101,
    "club_id": 10,
    "course_name": "Fanø",
    "num_holes": 9,
    "measure_meters": 1,
    "timestamp_updated": 1775373519337,
    "club_name": "Fanø Vesterhavsbads Golfklub"
  },
  "tee": {
    "tee_key": "101_1012",
    "course_id": 101,
    "tee_external_id": "1012",
    "tee_name": "Red",
    "tee_color": "#FF5050",
    "slope": 113,
    "slope_front9": 113,
    "slope_back9": 113,
    "cr": 31.8,
    "cr_front9": 31.8,
    "cr_back9": 31.8,
    "slope_women": 118,
    "slope_women_front9": 118,
    "slope_women_back9": 118,
    "cr_women": 33.9,
    "cr_women_front9": 33.9,
    "cr_women_back9": 33.9,
    "measure_unit": "1"
  },
  "holes": [
    {
      "course_id": 101, "hole_no": 1,
      "par": 5, "hcp": 3, "par_w": 5, "hcp_w": 3,
      "match_index": null, "split_index": null
    },
    {
      "course_id": 101, "hole_no": 2,
      "par": 3, "hcp": 13, "par_w": 3, "hcp_w": 13,
      "match_index": null, "split_index": null
    },
    {
      "course_id": 101, "hole_no": 3,
      "par": 4, "hcp": 5, "par_w": 4, "hcp_w": 5,
      "match_index": null, "split_index": null
    }
  ],
  "lengths": [
    { "hole_no": 1, "length": 411 },
    { "hole_no": 2, "length": 128 },
    { "hole_no": 3, "length": 264 }
  ],
  "allTees": [
    {
      "tee_key": "101_1012", "tee_name": "Red",
      "tee_color": "#FF5050", "slope": 113, "cr": 31.8,
      "slope_women": 118, "cr_women": 33.9
    },
    {
      "tee_key": "101_1011", "tee_name": "Yellow",
      "tee_color": "#CCCC00", "slope": 121, "cr": 33.8,
      "slope_women": 130, "cr_women": 36.4
    }
  ]
}`}
                            />
                        </div>

                        {/* Anmodninger */}
                        <GroupHeading id="anmodninger">Anmodninger</GroupHeading>
                        <div className="space-y-6">
                            <EndpointCard
                                method="POST"
                                path="/api/requests"
                                description="Send en anmodning om at tilføje en manglende klub/bane eller rette fejl i eksisterende data. Bruges af vores eget website og kan bruges af integrationer til at rapportere mangler."
                                params={[
                                    { type: "body", name: "type", required: true, description: "Anmodningstype, f.eks. \"missing_club\" eller \"correction\"" },
                                    { type: "body", name: "user_message", required: true, description: "Beskrivelse af anmodningen" },
                                    { type: "body", name: "club_id", required: false, description: "ID på den relevante klub (hvis kendt)" },
                                    { type: "body", name: "course_id", required: false, description: "ID på den relevante bane (hvis kendt)" },
                                    { type: "body", name: "tee_key", required: false, description: "Tee-nøgle (hvis relevant)" },
                                    { type: "body", name: "user_contact", required: false, description: "Kontaktoplysninger (e-mail), hvis du ønsker svar" },
                                ]}
                                curlExample={`curl -X POST \\
  -H "Authorization: Bearer DIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "missing_club",
    "user_message": "Aarhus Golfklub mangler i databasen",
    "user_contact": "mit@email.dk"
  }' \\
  "https://score-kort.dk/api/requests"`}
                                responseExample={`{
  "success": true,
  "message": "Tak for din indberetning!"
}`}
                            />
                        </div>
                    </section>

                    <footer className="pt-10 border-t border-border text-center">
                        <p className="text-sm text-text-muted italic">
                            Har du spørgsmål til integrationen?{" "}
                            <a href="mailto:admin@score-kort.dk" className="text-brand-400 hover:underline not-italic">
                                Kontakt os på admin@score-kort.dk
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
