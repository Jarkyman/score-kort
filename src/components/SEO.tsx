import { Helmet } from "react-helmet-async";

interface SEOProps {
    title: string;
    description: string;
    url?: string;
    image?: string;
    schemaMarkup?: object;
}

export default function SEO({ title, description, url, image, schemaMarkup }: SEOProps) {
    const siteUrl = "https://score-kort.dk";
    const finalUrl = url ? `${siteUrl}${url}` : siteUrl;
    // For now we will use a fallback image og-image.webp on the root
    const finalImage = image ? `${siteUrl}${image}` : `${siteUrl}/og-image.webp`;

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={finalUrl} />
            
            {/* Facebook / Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={finalImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={finalUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={finalImage} />

            {/* Structured Data (JSON-LD) */}
            {schemaMarkup && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaMarkup)}
                </script>
            )}
        </Helmet>
    );
}
