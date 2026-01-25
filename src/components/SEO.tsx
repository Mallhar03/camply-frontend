import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_CONFIG, getSEOForRoute, getCanonicalURL } from "@/utils/seo";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  structuredData?: Record<string, any>;
}

export const SEO = ({
  title,
  description,
  image,
  type,
  structuredData,
}: SEOProps) => {
  const location = useLocation();
  const routeSEO = getSEOForRoute(location.pathname);

  const seoTitle = title || routeSEO.title || SITE_CONFIG.title;
  const seoDescription = description || routeSEO.description || SITE_CONFIG.description;
  const seoImage = image || routeSEO.ogImage || SITE_CONFIG.ogImage;
  const seoType = type || routeSEO.ogType || "website";
  const canonicalURL = getCanonicalURL(location.pathname);
  const keywords = routeSEO.keywords || SITE_CONFIG.keywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={canonicalURL} />

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={seoType} />
      <meta property="og:url" content={canonicalURL} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
