import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F4EA]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          
          {/* Back Button Skeleton */}
          <div className="mb-6 h-4 w-24 animate-pulse rounded bg-[#E8E3D9]" />

          <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_450px]">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col">
              
              {/* Main Image */}
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-[2px] border border-[#1C1B18]/10 bg-[#E8E3D9]/40 sm:aspect-[16/9] animate-pulse" />

              {/* Title & Location */}
              <div className="mt-6">
                <div className="mb-3 h-8 w-3/4 animate-pulse rounded bg-[#E8E3D9]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#E8E3D9]" />
              </div>

              {/* Highlights */}
              <div className="mt-8 flex gap-6 border-y border-[#1C1B18]/10 py-6">
                <div className="h-6 w-24 animate-pulse rounded bg-[#E8E3D9]" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#E8E3D9]" />
                <div className="h-6 w-24 animate-pulse rounded bg-[#E8E3D9]" />
              </div>

              {/* Description */}
              <div className="mt-8">
                <div className="mb-4 h-5 w-32 animate-pulse rounded bg-[#E8E3D9]" />
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-[#E8E3D9]" />
                  <div className="h-4 w-[90%] animate-pulse rounded bg-[#E8E3D9]" />
                  <div className="h-4 w-[95%] animate-pulse rounded bg-[#E8E3D9]" />
                  <div className="h-4 w-[80%] animate-pulse rounded bg-[#E8E3D9]" />
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Sticky Owner Card) */}
            <div className="relative">
              <div className="sticky top-24 rounded-[2px] border border-[#1C1B18]/10 bg-white p-6 sm:p-8">
                
                <div className="mb-6 h-8 w-32 animate-pulse rounded bg-[#E8E3D9]" />
                
                <div className="mb-8 flex items-center gap-4 border-y border-[#1C1B18]/10 py-6">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#E8E3D9]" />
                  <div>
                    <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[#E8E3D9]" />
                    <div className="h-3 w-16 animate-pulse rounded bg-[#E8E3D9]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-12 w-full animate-pulse rounded-full bg-[#E8E3D9]" />
                  <div className="h-12 w-full animate-pulse rounded-full bg-[#E8E3D9]" />
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
