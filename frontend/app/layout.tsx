import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import InitialLoader from "@/components/ui/InitialLoader";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import BottomNav from "@/components/layout/BottomNav";

const BASE_URL = "https://livansa.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Livansa — Find a Place to Belong",
    template: "%s | Livansa",
  },
  description:
    "Find verified rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners.",
  keywords: ["rooms for rent", "long-term rentals", "monthly rentals", "livansa", "rental listings", "find a room"],
  authors: [{ name: "Livansa", url: BASE_URL }],
  creator: "Livansa",
  publisher: "Livansa",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Livansa",
    title: "Livansa — Find a Place to Belong",
    description:
      "Find verified rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners.",
    url: BASE_URL,
    images: [
      {
        url: "/images/livansa-logo.png",
        width: 1200,
        height: 630,
        alt: "Livansa — Find a Place to Belong",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Livansa — Find a Place to Belong",
    description:
      "Find verified rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners.",
    images: ["/images/livansa-logo.png"],
    creator: "@livansa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Livansa",
        description: "Find verified rooms and monthly rentals. Discover spaces that feel like home.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/rentals?location={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Livansa",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/images/livansa-logo.png`,
          width: 512,
          height: 128,
        },
        sameAs: [],
      },
    ],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScrollProvider>
          <InitialLoader />
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}




// import type { Metadata } from "next";
// import "./globals.css";
// import { AuthProvider } from "@/features/auth/hooks/useAuth";
// import InitialLoader from "@/components/ui/InitialLoader";
// import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
// import BottomNav from "@/components/layout/BottomNav";
// import MaintenancePage from "./maintenance/page";

// const BASE_URL = "https://livansa.in";

// export const metadata: Metadata = {
//   metadataBase: new URL(BASE_URL),
//   title: {
//     default: "Livansa — Find a Place to Belong",
//     template: "%s | Livansa",
//   },
//   description:
//     "Find verified rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners.",
//   keywords: [
//     "rooms for rent",
//     "long-term rentals",
//     "monthly rentals",
//     "livansa",
//     "rental listings",
//     "find a room",
//   ],
//   authors: [{ name: "Livansa", url: BASE_URL }],
//   creator: "Livansa",
//   publisher: "Livansa",
//   icons: {
//     icon: "/favicon.png",
//     shortcut: "/favicon.png",
//     apple: "/favicon.png",
//   },
//   openGraph: {
//     type: "website",
//     siteName: "Livansa",
//     title: "Livansa — Find a Place to Belong",
//     description:
//       "Find verified rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners.",
//     url: BASE_URL,
//     images: [
//       {
//         url: "/images/livansa-logo.png",
//         width: 1200,
//         height: 630,
//         alt: "Livansa — Find a Place to Belong",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Livansa — Find a Place to Belong",
//     description:
//       "Find verified rooms and monthly rentals with Livansa. Discover spaces that feel like home and connect with local property owners.",
//     images: ["/images/livansa-logo.png"],
//     creator: "@livansa",
//   },
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-video-preview": -1,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//     },
//   },
//   alternates: {
//     canonical: BASE_URL,
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@graph": [
//       {
//         "@type": "WebSite",
//         "@id": `${BASE_URL}/#website`,
//         url: BASE_URL,
//         name: "Livansa",
//         description:
//           "Find verified rooms and monthly rentals. Discover spaces that feel like home.",
//         potentialAction: {
//           "@type": "SearchAction",
//           target: {
//             "@type": "EntryPoint",
//             urlTemplate: `${BASE_URL}/rentals?location={search_term_string}`,
//           },
//           "query-input": "required name=search_term_string",
//         },
//       },
//       {
//         "@type": "Organization",
//         "@id": `${BASE_URL}/#organization`,
//         name: "Livansa",
//         url: BASE_URL,
//         logo: {
//           "@type": "ImageObject",
//           url: `${BASE_URL}/images/livansa-logo.png`,
//           width: 512,
//           height: 128,
//         },
//         sameAs: [],
//       },
//     ],
//   };

//   return (
//     <html lang="en" data-scroll-behavior="smooth">
//       <body>
//         {!maintenanceMode && (
//           <script
//             type="application/ld+json"
//             dangerouslySetInnerHTML={{
//               __html: JSON.stringify(jsonLd),
//             }}
//           />
//         )}

//         {maintenanceMode ? (
//           <MaintenancePage />
//         ) : (
//           <SmoothScrollProvider>
//             <InitialLoader />

//             <AuthProvider>
//               {children}
//               <BottomNav />
//             </AuthProvider>
//           </SmoothScrollProvider>
//         )}
//       </body>
//     </html>
//   );
// }