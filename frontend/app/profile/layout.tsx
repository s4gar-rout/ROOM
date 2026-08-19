import { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#F8F4EA] text-[#1C1B18] min-h-[calc(100svh-64px)] md:min-h-[calc(100svh-80px)] pt-10 pb-24 px-6 sm:px-10 md:py-12">
      <div className="mx-auto max-w-3xl w-full">
        {children}
      </div>
    </div>
  );
}
