import { Loader2 } from "lucide-react";

/** Full-screen loading state, e.g. as a Suspense fallback while search params load. */
export function FullPageSpinner() {
  return (
    <div className="min-h-[100svh] flex items-center justify-center bg-bg text-tx transition-colors duration-300">
      <Loader2 className="w-8 h-8 animate-spin text-acc" />
    </div>
  );
}
