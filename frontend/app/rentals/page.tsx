import { Suspense } from "react";
import AllRoomsPage from "@/features/rental/pages/AllRoomsPage";

export default function RoomsRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F4EA] flex items-center justify-center">Loading...</div>}>
      <AllRoomsPage />
    </Suspense>
  );
}
