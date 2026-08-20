import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/rentals", "/rentals/", "/about-us", "/feedback", "/report-issue", "/privacy-policy", "/terms-and-conditions"],
        disallow: [
          "/login",
          "/register",
          "/forgot-password",
          "/profile",
          "/profile/edit",
          "/messages",
          "/messages/",
          "/owner-dashboard",
          "/owner-dashboard/",
          "/admin",
          "/admin/",
          "/complete-profile",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://livansa.in/sitemap.xml",
    host: "https://livansa.in",
  };
}
