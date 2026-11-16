"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useInviteDetails, useAcceptInvite } from "@/hooks/invites/useInvite";
import {
  Loader2,
  MapPin,
  Building2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { clearPendingInvite, hasSession, savePendingInvite } from "@/lib/session";

// ─── view states ─────────────────────────────────────────────────────────────
type View = "loading" | "invalid" | "expired" | "already_accepted" | "ready" | "success";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { data: invite, isLoading, isError } = useInviteDetails(token);
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();
  const [acceptError, setAcceptError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>("loading");

  // Derive view from invite data
  React.useEffect(() => {
    if (!token) { setView("invalid"); return; }
    if (isLoading) { setView("loading"); return; }
    if (isError) { setView("invalid"); return; }
    if (!invite) return;

    if (invite.invalid) {
      clearPendingInvite();
      if (invite.reason === "expired") setView("expired");
      else if (invite.reason === "accepted") setView("already_accepted");
      else setView("invalid");
      return;
    }

    setView("ready");
  }, [token, isLoading, isError, invite]);

  async function handleAccept() {
    if (!token) return;
    setAcceptError(null);

    if (!(await hasSession())) {
      // Not logged in: remember the invite so signup/login brings them back here.
      savePendingInvite(token);
      router.push("/signup");
      return;
    }

    acceptInvite(
      { token },
      {
        onSuccess: (result) => {
          clearPendingInvite();
          // OrgContext opens this org first on the next dashboard load.
          try { sessionStorage.setItem("rosta_pending_org", result.orgId); } catch {}
          setView("success");
        },
        onError: (err) => {
          const msg = err.response?.data?.message || "Something went wrong. Please try again.";
          setAcceptError(msg);
        },
      }
    );
  }

  // ── loading ───────────────────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <main className="min-h-[100svh] flex items-center justify-center bg-bg text-tx">
        <PublicHeader variant="auth" />
        <Loader2 className="w-8 h-8 animate-spin text-acc" />
      </main>
    );
  }

  // ── no token / invalid ────────────────────────────────────────────────────
  if (view === "invalid") {
    return (
      <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] bg-bg text-tx transition-colors duration-300">
        <PublicHeader variant="auth" />
        <div className="bg-surf border border-brd rounded-[18px] p-[40px] w-full max-w-[420px] text-center animate-up shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-[56px] h-[56px] rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-[20px]">
            <AlertTriangle className="w-[26px] h-[26px] text-red-500" strokeWidth={2} />
          </div>
          <Heading as="h1" variant="card" className="!text-[1.4rem] !mb-[8px]">Invalid invitation</Heading>
          <Text variant="default" className="!font-light !mb-[28px] leading-[1.65]">
            This invite link is invalid or no longer exists. Please ask your admin to resend it.
          </Text>
          <Link
            href="/login"
            className="inline-flex items-center gap-[6px] px-[22px] py-[11px] rounded-[10px] bg-acc text-[#07090E] text-[0.9rem] font-[600] transition-opacity hover:opacity-85"
          >
            Go to login <ArrowRight className="w-[15px] h-[15px]" strokeWidth={2.5} />
          </Link>
        </div>
      </main>
    );
  }

  // ── expired ───────────────────────────────────────────────────────────────
  if (view === "expired") {
    return (
      <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] bg-bg text-tx transition-colors duration-300">
        <PublicHeader variant="auth" />
        <div className="bg-surf border border-brd rounded-[18px] p-[40px] w-full max-w-[420px] text-center animate-up shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-[56px] h-[56px] rounded-full bg-[rgba(255,176,0,0.1)] border border-[rgba(255,176,0,0.2)] flex items-center justify-center mx-auto mb-[20px]">
            <Clock className="w-[26px] h-[26px] text-[#FFB000]" strokeWidth={2} />
          </div>
          <Heading as="h1" variant="card" className="!text-[1.4rem] !mb-[8px]">Invitation expired</Heading>
          <Text variant="default" className="!font-light !mb-[8px] leading-[1.65]">
            This invite was for <strong className="text-tx">{invite?.locations?.map((l) => l.name).join(", ")}</strong> at <strong className="text-tx">{invite?.org?.name}</strong>.
          </Text>
          <Text variant="default" className="!font-light !mb-[28px] leading-[1.65]">
            Invitations expire after 7 days. Please ask your admin to send a new one.
          </Text>
          <Link
            href="/login"
            className="inline-flex items-center gap-[6px] px-[22px] py-[11px] rounded-[10px] bg-surf2 border border-brd2 text-tx text-[0.9rem] font-[600] transition-colors hover:bg-brd"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  // ── already accepted ──────────────────────────────────────────────────────
  if (view === "already_accepted") {
    return (
      <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] bg-bg text-tx transition-colors duration-300">
        <PublicHeader variant="auth" />
        <div className="bg-surf border border-brd rounded-[18px] p-[40px] w-full max-w-[420px] text-center animate-up shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-[56px] h-[56px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center mx-auto mb-[20px]">
            <CheckCircle className="w-[26px] h-[26px] text-acc" strokeWidth={2} />
          </div>
          <Heading as="h1" variant="card" className="!text-[1.4rem] !mb-[8px]">Already accepted</Heading>
          <Text variant="default" className="!font-light !mb-[28px] leading-[1.65]">
            You've already accepted this invitation. Head to your dashboard to get started.
          </Text>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-[6px] px-[22px] py-[11px] rounded-[10px] bg-acc text-[#07090E] text-[0.9rem] font-[600] transition-opacity hover:opacity-85"
          >
            Go to dashboard <ArrowRight className="w-[15px] h-[15px]" strokeWidth={2.5} />
          </Link>
        </div>
      </main>
    );
  }

  // ── success ───────────────────────────────────────────────────────────────
  if (view === "success") {
    return (
      <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] bg-bg text-tx transition-colors duration-300">
        <PublicHeader variant="auth" />
        <div className="bg-surf border border-brd rounded-[18px] p-[40px] w-full max-w-[420px] text-center animate-up shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-[64px] h-[64px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center mx-auto mb-[22px]">
            <CheckCircle className="w-[32px] h-[32px] text-acc" strokeWidth={1.5} />
          </div>
          <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">You're in!</Heading>
          <Text variant="default" className="!font-light !mb-[6px] leading-[1.65]">
            You've joined <strong className="text-tx">{invite?.locations?.map((l) => l.name).join(", ")}</strong> at{" "}
            <strong className="text-tx">{invite?.org?.name}</strong>.
          </Text>
          <Text variant="default" className="!font-light !mb-[28px] leading-[1.65]">
            You can now view your schedule and manage shifts from your dashboard.
          </Text>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] transition-all duration-200 hover:opacity-85 flex justify-center items-center gap-[6px] h-[48px]"
          >
            Go to dashboard <ArrowRight className="w-[16px] h-[16px]" strokeWidth={2.5} />
          </button>
        </div>
      </main>
    );
  }

  // ── ready — show invite card ───────────────────────────────────────────────
  const expiresDate = invite?.expiresAt
    ? new Date(invite.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] relative overflow-hidden bg-bg text-tx transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-acc-bg rounded-[50%] blur-[50px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-blu-bg rounded-[50%] blur-[60px] pointer-events-none" />

      <PublicHeader variant="auth" />

      <div className="bg-surf border border-brd rounded-[18px] p-[40px] w-full max-w-[440px] relative z-[2] animate-up shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

        {/* Icon */}
        <div className="w-[52px] h-[52px] rounded-[14px] bg-acc-bg border border-acc-brd flex items-center justify-center mb-[24px]">
          <Mail className="w-[24px] h-[24px] text-acc" strokeWidth={2} />
        </div>

        <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">You've been invited</Heading>
        <Text variant="default" className="!font-light !mb-[24px] leading-[1.65]">
          {invite?.role === "admin"
            ? "You've been invited to help run this organization as an admin."
            : <>You&apos;ve been invited to join the following {invite && invite.locations.length > 1 ? "locations" : "location"} as {invite?.role === "manager" ? "a manager" : "a staff member"}.</>}
        </Text>

        {/* Location / org details */}
        <div className="bg-bg border border-brd rounded-[12px] p-[16px] mb-[24px] space-y-[10px]">
          <div className="flex items-start gap-[10px]">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-acc-bg border border-acc-brd flex items-center justify-center shrink-0">
              <MapPin className="w-[14px] h-[14px] text-acc" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[0.7rem] font-[500] text-tx3 uppercase tracking-[0.06em]">
                {invite && invite.locations.length > 1 ? "Locations" : "Location"}
              </div>
              <div className="text-[0.92rem] font-[600] text-tx">
                {invite?.locations?.map((l) => l.name).join(", ")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-blu-bg border border-blu/20 flex items-center justify-center shrink-0">
              <Building2 className="w-[14px] h-[14px] text-blu" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[0.7rem] font-[500] text-tx3 uppercase tracking-[0.06em]">Organization</div>
              <div className="text-[0.92rem] font-[600] text-tx">{invite?.org?.name}</div>
            </div>
          </div>
        </div>

        {expiresDate && (
          <div className="flex items-center gap-[6px] text-[0.75rem] text-tx3 mb-[24px]">
            <Clock className="w-[13px] h-[13px] shrink-0" strokeWidth={2} />
            Invitation expires {expiresDate}
          </div>
        )}

        {/* Error */}
        {acceptError && (
          <div className="flex items-center gap-[8px] p-[11px_14px] bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-500 text-[0.82rem] mb-[16px]">
            <AlertTriangle className="w-[15px] h-[15px] shrink-0" strokeWidth={2} />
            {acceptError}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] transition-all duration-200 hover:opacity-85 hover:-translate-y-[1px] disabled:opacity-60 disabled:pointer-events-none flex justify-center items-center gap-[6px] h-[48px]"
        >
          {isAccepting
            ? <Loader2 className="w-[18px] h-[18px] animate-spin" />
            : <>Accept invitation <ArrowRight className="w-[16px] h-[16px]" strokeWidth={2.5} /></>
          }
        </button>

        <p className="text-[0.75rem] text-tx3 text-center mt-[14px]">
          New to NexShift?{" "}
          <Link href="/signup" onClick={() => token && savePendingInvite(token)} className="text-acc hover:opacity-75 transition-opacity">
            Sign up
          </Link>
          {" "}· Have an account?{" "}
          <Link href="/login" onClick={() => token && savePendingInvite(token)} className="text-acc hover:opacity-75 transition-opacity">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[100svh] flex items-center justify-center bg-bg text-tx">
          <Loader2 className="w-8 h-8 animate-spin text-acc" />
        </div>
      }
    >
      <InviteContent />
    </React.Suspense>
  );
}
