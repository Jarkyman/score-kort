import type { Env } from "../api/_shared";

// List of common social media and messaging bots that look for Open Graph tags
const BOT_AGENTS = [
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "whatsapp",
    "skypeuripreview",
    "telegrambot",
    "slackbot",
    "discordbot",
    "pinterest",
    "vkshare",
    "bingbot"
];

export const onRequestGet: PagesFunction<Env> = async ({ request, env, next, params }) => {
    // We always fetch the underlying index.html from Cloudflare Pages static assets
    const response = await next();

    // Check if the request is coming from a known bot
    const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();
    const isBot = BOT_AGENTS.some(bot => userAgent.includes(bot));

    // If it's a normal browser (Google Chrome, Safari, etc.) or Googlebot (who runs JS perfectly),
    // we don't do anything because React Helmet handles it perfectly on the client!
    if (!isBot) {
        return response;
    }

    const clubId = params.id as string;
    if (!clubId) return response;

    let clubName = "Golfklub";
    let city = "";

    try {
        const club = await env.DB.prepare("SELECT club_name, city FROM clubs WHERE club_id = ?")
            .bind(parseInt(clubId, 10))
            .first<{ club_name: string; city: string | null }>();

        if (club) {
            clubName = club.club_name;
            city = club.city ? ` i ${club.city}` : "";
        }
    } catch (e) {
        console.error("DB error in frontend bot proxy", e);
    }

    const title = `${clubName} - Scorekort | Score-kort.dk`;
    const description = `Se scorekort, par, slope, og CR for ${clubName}${city}.`;
    const url = `https://score-kort.dk/klub/${clubId}`;

    // Rewrite the static index.html with the dynamically injected values
    return new HTMLRewriter()
        .on("title", {
            element(element) {
                element.setInnerContent(title);
            }
        })
        .on("meta[name='description']", {
            element(element) {
                element.setAttribute("content", description);
            }
        })
        .on("meta[property='og:title']", {
            element(element) {
                element.setAttribute("content", title);
            }
        })
        .on("meta[property='og:description']", {
            element(element) {
                element.setAttribute("content", description);
            }
        })
        .on("meta[property='og:url']", {
            element(element) {
                element.setAttribute("content", url);
            }
        })
        .on("meta[property='twitter:title']", {
            element(element) {
                element.setAttribute("content", title);
            }
        })
        .on("meta[property='twitter:description']", {
            element(element) {
                element.setAttribute("content", description);
            }
        })
        .transform(response);
};
