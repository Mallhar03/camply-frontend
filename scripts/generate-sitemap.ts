import { writeFileSync } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

const SITE_URL = "https://camply.live";

const routes = [
  {
    url: "/",
    changefreq: "daily",
    priority: 1.0,
  },
  {
    url: "/daily",
    changefreq: "daily",
    priority: 0.8,
  },
  {
    url: "/match",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    url: "/placements",
    changefreq: "daily",
    priority: 0.8,
  },
  {
    url: "/profile",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    url: "/login",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    url: "/signup",
    changefreq: "monthly",
    priority: 0.5,
  },
];

async function generateSitemap() {
  const stream = new SitemapStream({ hostname: SITE_URL });

  const links = routes.map((route) => ({
    url: route.url,
    changefreq: route.changefreq,
    priority: route.priority,
    lastmod: new Date().toISOString(),
  }));

  const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(
    (data) => data.toString()
  );

  writeFileSync("./public/sitemap.xml", xml);
  console.log("✅ Sitemap generated successfully at public/sitemap.xml");
}

generateSitemap().catch((error) => {
  console.error("❌ Error generating sitemap:", error);
  process.exit(1);
});
