declare function gtag(...args: unknown[]): void;

import { useState, useEffect } from "react";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        // If there's no consent saved, show the banner
        if (consent !== "all" && consent !== "necessary") {
            setIsVisible(true);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem("cookie_consent", "all");
        gtag("consent", "update", {
            ad_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
            analytics_storage: "granted",
        });
        setIsVisible(false);
    };

    const acceptNecessary = () => {
        localStorage.setItem("cookie_consent", "necessary");
        // gtag signals remain as 'denied' from the default set in index.html
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: "1.5rem",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", lineHeight: "1.5" }}>
                    Vi bruger cookies til at vise relevante annoncer. Du kan acceptere alle cookies eller vælge kun nødvendige.
                </p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <button
                        onClick={acceptAll}
                        style={{
                            backgroundColor: "#3b82f6", // tailwind blue-500
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                    >
                        Accepter alle
                    </button>
                    <button
                        onClick={acceptNecessary}
                        style={{
                            backgroundColor: "transparent",
                            color: "white",
                            border: "1px solid #4b5563", // tailwind gray-600
                            padding: "0.5rem 1rem",
                            borderRadius: "0.25rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#374151"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        Kun nødvendige
                    </button>
                </div>
            </div>
        </div>
    );
}
