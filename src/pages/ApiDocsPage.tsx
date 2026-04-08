import { useState } from "react";
import SEO from "../components/SEO";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Param {
    type: "path" | "query" | "body";
    name: string;
    required: boolean;
    description: string;
}

interface LiveResponse {
    status: number;
    statusText: string;
    data: unknown;
    timeMs: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getType(value: unknown): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
        if (value.length === 0) return "array";
        const first = value[0];
        if (typeof first === "object" && first !== null && !Array.isArray(first)) return "array[object]";
        return `array[${getType(first)}]`;
    }
    if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "string") return "string";
    if (typeof value === "object") return "object";
    return typeof value;
}

function buildUrl(template: string, params: Param[], values: Record<string, string>): string {
    let url = template;
    const queryParts: string[] = [];
    for (const param of params) {
        if (param.type === "body") continue;
        const val = values[param.name];
        if (!val) continue;
        if (param.type === "path") {
            url = url.replace(`:${param.name}`, encodeURIComponent(val));
        } else {
            queryParts.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(val)}`);
        }
    }
    if (queryParts.length > 0) url += "?" + queryParts.join("&");
    return url;
}

// ─── Primitive components ─────────────────────────────────────────────────────

function MethodBadge({ method }: { method: "GET" | "POST" }) {
    const color = method === "GET" ? "bg-green-700 text-white" : "bg-blue-700 text-white";
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${color}`}>
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
                                {p.required ? <span className="text-red-400 font-semibold">ja</span> : <span className="text-text-muted">nej</span>}
                            </td>
                            <td className="p-2 text-text-secondary">{p.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Schema view ──────────────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
    string: "text-green-700",
    integer: "text-blue-700",
    number: "text-blue-700",
    boolean: "text-purple-700",
    null: "text-slate-500",
    object: "text-orange-700",
};

function typeColor(t: string): string {
    if (t.startsWith("array")) return "text-orange-700";
    return typeColors[t] ?? "text-text-secondary";
}

function SchemaRow({ name, value, indent = 0 }: { name: string; value: unknown; indent?: number }) {
    const type = getType(value);
    const isNestedObject = typeof value === "object" && value !== null && !Array.isArray(value);
    const isArrayOfObjects =
        Array.isArray(value) && value.length > 0 &&
        typeof value[0] === "object" && value[0] !== null && !Array.isArray(value[0]);

    return (
        <>
            <tr className="border-b border-border last:border-b-0">
                <td className="p-2 font-mono text-xs" style={{ paddingLeft: `${8 + indent * 16}px` }}>
                    {indent > 0 && <span className="text-text-muted mr-1">└</span>}
                    <span className="text-brand-600">{name}</span>
                </td>
                <td className="p-2">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded bg-surface-2 ${typeColor(type)}`}>
                        {type}
                    </span>
                </td>
                <td className="p-2 text-xs text-text-muted italic">
                    {value === null ? "kan være null" : ""}
                </td>
            </tr>
            {isNestedObject &&
                Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                    <SchemaRow key={`${name}.${k}`} name={k} value={v} indent={indent + 1} />
                ))}
            {isArrayOfObjects &&
                Object.entries((value as unknown[])[0] as Record<string, unknown>).map(([k, v]) => (
                    <SchemaRow key={`${name}[].${k}`} name={k} value={v} indent={indent + 1} />
                ))}
        </>
    );
}

function SchemaView({ json }: { json: string }) {
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch {
        return <p className="text-xs text-text-muted p-3">Kunne ikke parse schema.</p>;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return <p className="text-xs text-text-muted p-3">Schema ikke tilgængeligt.</p>;
    }
    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-surface-3 text-text-muted text-left">
                        <th className="p-2 border-b border-border font-semibold">Felt</th>
                        <th className="p-2 border-b border-border font-semibold">Type</th>
                        <th className="p-2 border-b border-border font-semibold">Note</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(parsed as Record<string, unknown>).map(([key, value]) => (
                        <SchemaRow key={key} name={key} value={value} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── JSON viewer (syntax highlighted) ────────────────────────────────────────

function JsonViewer({ data }: { data: unknown }) {
    const json = JSON.stringify(data, null, 2)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) return `<span style="color:#b392f0">${match}</span>`;
                    return `<span style="color:#9ecbff">${match}</span>`;
                }
                if (/true|false/.test(match)) return `<span style="color:#79b8ff">${match}</span>`;
                if (/null/.test(match)) return `<span style="color:#6a737d">${match}</span>`;
                return `<span style="color:#f8c555">${match}</span>`;
            }
        );
    return (
        <pre
            className="bg-slate-900 text-slate-100 p-4 text-xs overflow-x-auto max-h-80 overflow-y-auto font-mono leading-relaxed"
            dangerouslySetInnerHTML={{ __html: json }}
        />
    );
}

// ─── Endpoint card ────────────────────────────────────────────────────────────

interface EndpointCardProps {
    method: "GET" | "POST";
    path: string;
    description: string;
    params?: Param[];
    curlExample: string;
    responseExample: string;
    defaultBody?: string;
    token: string;
}

function EndpointCard({
    method, path, description, params = [], curlExample, responseExample, defaultBody = "", token,
}: EndpointCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"schema" | "example" | "curl">("schema");
    const [paramValues, setParamValues] = useState<Record<string, string>>({});
    const [bodyValue, setBodyValue] = useState(defaultBody);
    const [isLoading, setIsLoading] = useState(false);
    const [liveResponse, setLiveResponse] = useState<LiveResponse | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showToken, setShowToken] = useState(false);

    const previewUrl = buildUrl(path, params, paramValues);

    const handleSend = async () => {
        setIsLoading(true);
        setFetchError(null);
        setLiveResponse(null);
        try {
            const t0 = Date.now();
            const headers: Record<string, string> = { "X-Docs-Request": "true" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            if (method === "POST") headers["Content-Type"] = "application/json";

            const res = await fetch(previewUrl, {
                method,
                headers,
                ...(method === "POST" && bodyValue ? { body: bodyValue } : {}),
            });

            let data: unknown;
            try { data = await res.json(); } catch { data = await res.text(); }

            setLiveResponse({ status: res.status, statusText: res.statusText, data, timeMs: Date.now() - t0 });
        } catch (e) {
            setFetchError(e instanceof Error ? e.message : "Netværksfejl");
        } finally {
            setIsLoading(false);
        }
    };

    const statusBadgeClass = (status: number) => {
        if (status >= 200 && status < 300) return "bg-green-500/10 text-green-400 border border-green-500/20";
        if (status >= 400) return "bg-red-500/10 text-red-400 border border-red-500/20";
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    };

    const nonBodyParams = params.filter((p) => p.type !== "body");

    return (
        <div className="border border-border rounded-2xl overflow-hidden bg-surface-card">
            {/* Header */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors text-left"
            >
                <MethodBadge method={method} />
                <code className="font-mono text-sm text-text-primary flex-1 min-w-0 truncate">{path}</code>
                <span className="text-text-secondary text-xs hidden sm:block truncate max-w-[240px]">{description}</span>
                <svg
                    className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Collapsible body via CSS grid trick */}
            <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
                <div className="overflow-hidden">
                    <div className="p-6 border-t border-border space-y-6">
                        {/* Description */}
                        <p className="text-sm text-text-secondary">{description}</p>

                        {/* Params table */}
                        {params.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold uppercase text-text-muted mb-2 tracking-wider">Parametre</h4>
                                <ParamsTable params={params} />
                            </div>
                        )}

                        {/* Schema / Eksempel / Curl tabs */}
                        <div>
                            <div className="flex gap-1 mb-3 bg-surface-2 rounded-lg p-1 w-fit">
                                {(["schema", "example", "curl"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                            activeTab === tab
                                                ? "bg-surface-card text-text-primary shadow-sm"
                                                : "text-text-muted hover:text-text-secondary"
                                        }`}
                                    >
                                        {tab === "schema" ? "Schema" : tab === "example" ? "Eksempel" : "Curl"}
                                    </button>
                                ))}
                            </div>
                            {activeTab === "schema" && <SchemaView json={responseExample} />}
                            {activeTab === "example" && <CodeBlock>{responseExample}</CodeBlock>}
                            {activeTab === "curl" && <CodeBlock>{curlExample}</CodeBlock>}
                        </div>

                        {/* Try it out */}
                        <div className="border border-border rounded-xl overflow-hidden">
                            <div className="bg-surface-3 px-4 py-2 border-b border-border flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Prøv det selv</span>
                                {!token && (
                                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        Indsæt token øverst for at teste udefra
                                    </span>
                                )}
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Path & query param inputs */}
                                {nonBodyParams.length > 0 && (
                                    <div className="space-y-2">
                                        {nonBodyParams.map((p) => (
                                            <div key={p.name} className="flex items-center gap-3">
                                                <label className="text-xs font-mono text-brand-600 w-28 shrink-0">
                                                    {p.name}
                                                    {p.required && <span className="text-red-400 ml-0.5">*</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paramValues[p.name] ?? ""}
                                                    onChange={(e) =>
                                                        setParamValues((v) => ({ ...v, [p.name]: e.target.value }))
                                                    }
                                                    placeholder={p.description}
                                                    className="flex-1 bg-surface-card border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Body textarea for POST */}
                                {method === "POST" && (
                                    <div>
                                        <label className="text-xs font-bold uppercase text-text-muted tracking-wider mb-2 block">
                                            Request body (JSON)
                                        </label>
                                        <textarea
                                            value={bodyValue}
                                            onChange={(e) => setBodyValue(e.target.value)}
                                            rows={6}
                                            spellCheck={false}
                                            className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-500 transition-colors"
                                        />
                                    </div>
                                )}

                                {/* Token display (if set) */}
                                {token && (
                                    <div className="flex items-center gap-2 text-xs text-text-muted">
                                        <span>Token:</span>
                                        <span className="font-mono">
                                            {showToken ? token : "•".repeat(Math.min(token.length, 24))}
                                        </span>
                                        <button
                                            onClick={() => setShowToken((s) => !s)}
                                            className="text-brand-600 hover:underline"
                                        >
                                            {showToken ? "skjul" : "vis"}
                                        </button>
                                    </div>
                                )}

                                {/* URL preview + send */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex-1 min-w-0 flex items-center gap-2 bg-surface-2 border border-border rounded-lg px-3 py-1.5">
                                        <span className="text-xs text-text-muted shrink-0 font-mono">{method}</span>
                                        <span className="text-xs font-mono text-text-secondary truncate">
                                            https://score-kort.dk{previewUrl}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading}
                                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                                    >
                                        {isLoading ? "Sender…" : "Send forespørgsel →"}
                                    </button>
                                </div>

                                {/* Network error */}
                                {fetchError && (
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                                        {fetchError}
                                    </div>
                                )}

                                {/* Live response */}
                                {liveResponse && (
                                    <div className="border border-border rounded-xl overflow-hidden">
                                        <div className={`px-3 py-2 flex items-center gap-3 ${statusBadgeClass(liveResponse.status)}`}>
                                            <span className="font-bold text-xs font-mono">
                                                {liveResponse.status} {liveResponse.statusText}
                                            </span>
                                            <span className="text-xs opacity-70">{liveResponse.timeMs} ms</span>
                                        </div>
                                        <JsonViewer data={liveResponse.data} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page layout helpers ──────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
    const [token, setToken] = useState("");
    const [tokenVisible, setTokenVisible] = useState(false);

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
                        <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold mb-1 text-text-primary">Base URL</h3>
                                <p className="text-sm text-text-secondary">
                                    Alle endpoints er relative til{" "}
                                    <code className="font-mono text-brand-400">https://score-kort.dk</code>
                                </p>
                            </div>
                            <div className="border-t border-border pt-5">
                                <h3 className="text-sm font-semibold mb-1 text-text-primary">Hent en token</h3>
                                <p className="text-sm text-text-secondary mb-2">
                                    Send en kort beskrivelse af dit projekt til{" "}
                                    <a href="mailto:admin@score-kort.dk" className="text-brand-400 hover:underline">
                                        admin@score-kort.dk
                                    </a>
                                    {" "}— vi udsteder tokens manuelt. Gratis til ikke-kommercielle formål.
                                </p>
                            </div>
                            <div className="border-t border-border pt-5">
                                <h3 className="text-sm font-semibold mb-2 text-text-primary">Hurtig test</h3>
                                <p className="text-sm text-text-secondary mb-3">
                                    Når du har din token, kan du teste direkte fra terminalen:
                                </p>
                                <CodeBlock>{`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/clubs?limit=5"`}</CodeBlock>
                            </div>
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
                                        1. Authorization header{" "}
                                        <span className="text-xs text-brand-400 font-normal ml-1">(anbefalet)</span>
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
                                API'et er begrænset til{" "}
                                <strong className="text-text-primary">60 forespørgsler per minut</strong> per IP-adresse.
                                Ved overskridelse returneres en{" "}
                                <code className="font-mono text-amber-700">429 Too Many Requests</code>-fejl.
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

                        {/* Token input */}
                        <div className="mb-8 bg-surface-2 border border-border rounded-xl p-4">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                                Din API Token
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type={tokenVisible ? "text" : "password"}
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.trim())}
                                    placeholder="Indsæt din token for at aktivere live-kald…"
                                    className="flex-1 bg-surface-card border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 transition-colors"
                                />
                                <button
                                    onClick={() => setTokenVisible((v) => !v)}
                                    className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-2 shrink-0"
                                >
                                    {tokenVisible ? "Skjul" : "Vis"}
                                </button>
                                {token && (
                                    <span className="text-xs text-brand-600 font-semibold shrink-0">✓ Klar</span>
                                )}
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                Bruges i "Prøv det selv" på hvert endpoint. Fra score-kort.dk virker kald også uden token.
                            </p>
                        </div>

                        {/* Klubber */}
                        <GroupHeading id="klubber">Klubber</GroupHeading>
                        <div className="space-y-3">
                            <EndpointCard
                                token={token}
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
                                token={token}
                                method="GET"
                                path="/api/clubs/:clubId"
                                description="Henter detaljer om en enkelt klub inklusiv en liste over dens baner."
                                params={[
                                    { type: "path", name: "clubId", required: true, description: "Klubbens unikke ID" },
                                ]}
                                curlExample={`curl -H "Authorization: Bearer DIN_TOKEN" \\
  "https://score-kort.dk/api/clubs/50"`}
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
                        <div className="space-y-3">
                            <EndpointCard
                                token={token}
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
                                token={token}
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
                                token={token}
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
                        <div className="space-y-3">
                            <EndpointCard
                                token={token}
                                method="GET"
                                path="/api/scorecard"
                                description="Henter et komplet scorekort for én specifik tee — inklusiv baneinformation, huldata, længder og alle øvrige tees på banen. tee_key findes via /api/courses/:courseId/tees eller /full_scorecard."
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
                        <div className="space-y-3">
                            <EndpointCard
                                token={token}
                                method="POST"
                                path="/api/requests"
                                description="Send en anmodning om at tilføje en manglende klub/bane eller rette fejl i eksisterende data."
                                params={[
                                    { type: "body", name: "type", required: true, description: "Anmodningstype, f.eks. \"missing_club\" eller \"correction\"" },
                                    { type: "body", name: "user_message", required: true, description: "Beskrivelse af anmodningen" },
                                    { type: "body", name: "club_id", required: false, description: "ID på den relevante klub (hvis kendt)" },
                                    { type: "body", name: "course_id", required: false, description: "ID på den relevante bane (hvis kendt)" },
                                    { type: "body", name: "tee_key", required: false, description: "Tee-nøgle (hvis relevant)" },
                                    { type: "body", name: "user_contact", required: false, description: "Kontaktoplysninger (e-mail), hvis du ønsker svar" },
                                ]}
                                defaultBody={`{\n  "type": "missing_club",\n  "user_message": "Beskriv din anmodning her",\n  "user_contact": "din@email.dk"\n}`}
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
