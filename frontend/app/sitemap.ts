import type { MetadataRoute } from "next";

// Static public pages that are always indexable
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: "https://livansa.in",
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: "https://livansa.in/rentals",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: "https://livansa.in/about-us",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: "https://livansa.in/feedback",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
  {
    url: "https://livansa.in/report-issue",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  },
  {
    url: "https://livansa.in/privacy-policy",
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: "https://livansa.in/terms-and-conditions",
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Attempt to fetch dynamic room/rental pages from the API
  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/rentals?limit=500&page=1`, {
      next: { revalidate: 3600 }, // refresh every hour
    });

    if (res.ok) {
      const data = await res.json();
      const rooms: Array<{ _id: string; updatedAt?: string }> = data?.rooms ?? [];

      dynamicRoutes = rooms.map((room) => ({
        url: `https://livansa.in/rentals/${room._id}`,
        lastModified: room.updatedAt ? new Date(room.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // If API is unavailable at build time, fall back to static routes only
  }

  return [...staticRoutes, ...dynamicRoutes];
}
