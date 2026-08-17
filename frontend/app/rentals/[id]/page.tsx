import SingleRoomPage from "@/features/rental/pages/SingleRoomPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Details | ROOM",
  description: "View details of the selected rental property.",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  // Next.js 15 requires awaiting dynamic route params
  const { id } = await params;

  // We pass the ID down to the client component,
  // to reuse the existing axios-based setup and client-side auth context smoothly.
  return <SingleRoomPage roomId={id} />;
}
