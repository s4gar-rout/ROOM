import { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#F8F4EA] text-[#1C1B18] min-h-[calc(100svh-64px)] md:min-h-[calc(100svh-80px)] py-10 px-6 sm:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl w-full">
        {children}
      </div>
    </div>
  );
}
