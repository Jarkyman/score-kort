import { useState } from "react";
import { Link } from "react-router-dom";

type RequestType = "correction" | "missing_club" | "other";

export default function RequestPage() {
    const [type, setType] = useState<RequestType>("correction");
    const [message, setMessage] = useState("");
    const [contact, setContact] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    user_message: message.trim(),
                    user_contact: contact.trim() || undefined,
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
                <div className="w-16 h-16 rounded-full bg-brand-600/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Tak for din indberetning!</h2>
                <p className="text-text-secondary mb-6">Vi kigger på det hurtigst muligt.</p>
                <Link to="/" className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-semibold transition-all">
                    ← Tilbage til forsiden
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-lg mx-auto">
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
