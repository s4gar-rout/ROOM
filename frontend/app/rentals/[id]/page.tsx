import SingleRoomPage from "@/features/rental/pages/SingleRoomPage";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BASE_URL = "https://livansa.in";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/rentals/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("Not found");

    const data = await res.json();
    const room = data?.room ?? data;

    const title = room?.title
      ? `${room.title}`
      : "Rental Property";

    const description = room?.description
      ? room.description.slice(0, 155)
      : `View this ${room?.roomType ?? "rental"} listing on Livansa. ${room?.location ? `Located in ${room.location}.` : ""}`.trim();

    const image = room?.images?.[0]?.url;
    const canonical = `${BASE_URL}/rentals/${id}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${title} | Livansa`,
        description,
        url: canonical,
        type: "website",
        ...(image && {
          images: [{ url: image, alt: title }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Livansa`,
        description,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return {
      title: "Rental Property",
      description: "View this rental listing on Livansa and connect directly with the property owner.",
      alternates: { canonical: `${BASE_URL}/rentals/${id}` },
    };
  }
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  return <SingleRoomPage roomId={id} />;
}
