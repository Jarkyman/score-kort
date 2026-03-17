import type { Env } from "./api/_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    // Determine base URL depending on the environment (e.g. from request url)
    // Cloudflare pages often has request.url with the current domain.
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.hostname}`;
    
    // Get all clubs to generate dynamic URLs
    let clubs: { club_id: number }[] = [];
    try {
        const clubsResult = await env.DB.prepare("SELECT club_id FROM clubs").all<{ club_id: number }>();
        clubs = clubsResult.results || [];
    } catch (e) {
        // If DB query fails, we just don't include dynamic pages
        console.error("Failed to fetch clubs for sitemap:", e);
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = [
        { path: "", priority: "1.0", changefreq: "weekly" },
        { path: "/klubber", priority: "0.8", changefreq: "weekly" },
        { path: "/indberetning", priority: "0.5", changefreq: "monthly" }
    ];

    for (const page of staticPages) {
        sitemap += `  <url>\n    <loc>${baseUrl}${page.path}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    // Dynamic pages (clubs)
    for (const club of clubs) {
        sitemap += `  <url>\n    <loc>${baseUrl}/klub/${club.club_id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400"
        }
    });
};
