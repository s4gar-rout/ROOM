import SingleRoomPage from "@/features/rental/pages/SingleRoomPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Details | ROOM",
  description: "View details of the selected rental property.",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  return <SingleRoomPage roomId={id} />;
}
