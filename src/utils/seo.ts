// SEO Configuration and Utilities

export const SITE_CONFIG = {
  name: "Camply",
  title: "Camply - Campus Social Network for Students",
  description: "Connect with fellow students, find hackathon teams, discover campus opportunities, and build your university network on Camply.",
  url: "https://camply.live",
  ogImage: "https://camply.live/og-image.svg",
  twitterImage: "https://camply.live/twitter-image.svg",
  twitterHandle: "@camply_live",
  keywords: [
    "campus social network",
    "university networking",
    "student collaboration",
    "hackathon teams",
    "campus events",
    "student networking",
    "university community",
    "campus jobs",
    "student opportunities",
  ],
};

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  twitterImage?: string;
  keywords?: string[];
  structuredData?: Record<string, any>;
}

// Route-specific SEO data
export const ROUTE_SEO: Record<string, SEOData> = {
  "/": {
    title: "Camply - Campus Social Network for Students",
    description: "Connect with fellow students, find hackathon teams, discover campus opportunities, and build your university network on Camply. Join the premier campus networking platform.",
    ogType: "website",
    keywords: ["camply", "campus social network", "university networking", "student collaboration"],
  },
  "/daily": {
    title: "Explore & Discover | Camply",
    description: "Explore daily challenges, discover new connections, and stay updated with campus activities. Find what's trending in your university community.",
    ogType: "website",
    keywords: ["campus exploration", "daily challenges", "university activities", "student engagement"],
  },
  "/match": {
    title: "Find Teammates & Match | Camply",
    description: "Find the perfect teammates for hackathons, projects, and collaborations. Match with students who share your interests and skills.",
    ogType: "website",
    keywords: ["find hackathon teams", "teammate matching", "project collaboration", "student teams"],
  },
  "/placements": {
    title: "Campus Jobs & Opportunities | Camply",
    description: "Discover internships, job opportunities, and career resources for students. Connect with recruiters and build your professional network.",
    ogType: "website",
    keywords: ["campus jobs", "student internships", "university placements", "career opportunities"],
  },
  "/profile": {
    title: "Your Profile | Camply",
    description: "Manage your profile, showcase your skills, and connect with your campus community on Camply.",
    ogType: "profile",
    keywords: ["student profile", "campus networking", "university portfolio"],
  },
};

// Generate Organization structured data
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/og-image.svg`,
  description: SITE_CONFIG.description,
  sameAs: [
    // Add social media profiles here when available
  ],
});

// Generate WebSite structured data
export const generateWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  description: SITE_CONFIG.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_CONFIG.url}/?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

// Generate BreadcrumbList structured data
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Get SEO data for a specific route
export const getSEOForRoute = (pathname: string): SEOData => {
  return ROUTE_SEO[pathname] || ROUTE_SEO["/"];
};

// Generate canonical URL
export const getCanonicalURL = (pathname: string): string => {
  return `${SITE_CONFIG.url}${pathname}`;
};
