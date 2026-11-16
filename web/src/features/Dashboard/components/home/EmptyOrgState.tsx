"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";

/** Shown when the user doesn't belong to any organization yet. */
export function EmptyOrgState() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full animate-up">
      <div className="w-[80px] h-[80px] rounded-full bg-acc-bg text-acc flex items-center justify-center mb-[24px]">
        <Building2 className="w-[36px] h-[36px]" />
      </div>
      <h1 className="text-[1.8rem] font-[600] tracking-[-0.03em] text-tx mb-[12px] text-center max-w-[400px] leading-[1.2]">
        You haven&apos;t joined an organization
      </h1>
      <p className="text-[0.9rem] text-tx2 font-light mb-[32px] max-w-[480px] text-center leading-[1.6]">
        To jump into scheduling and workforce management, you need to set up
        your primary clinic or be invited to one.
      </p>
      <button
        type="button"
        onClick={() => router.push("/onboarding")}
        className="px-[24px] py-[13px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_14px_rgba(0,212,138,0.25)] flex justify-center items-center gap-[6px] border-none cursor-pointer"
      >
        Add your Organization <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </button>
    </div>
  );
}
