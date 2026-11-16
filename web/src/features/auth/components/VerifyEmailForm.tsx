"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, ArrowRight, MailCheck } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useVerifyEmail, useResendVerification } from "@/features/auth/hooks/useVerifyEmail";
import { postLoginPath } from "@/lib/session";

const RESEND_COOLDOWN_S = 60;

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  // send=1: arriving from login (or a blocked request), so no code was sent yet.
  const shouldSend = searchParams.get("send") === "1";

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(shouldSend ? 0 : RESEND_COOLDOWN_S);

  const { mutate: verify, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  const sendCode = React.useCallback(() => {
    if (!email) return;
    resend({ email }, {
      onSuccess: () => {
        setNotice(`We sent a new code to ${email}.`);
        setCooldown(RESEND_COOLDOWN_S);
      },
      onError: () => setError("We couldn't send a code. Try again in a minute."),
    });
  }, [email, resend]);

  const sentOnLoad = React.useRef(false);
  React.useEffect(() => {
    if (shouldSend && !sentOnLoad.current) {
      sentOnLoad.current = true;
      sendCode();
    }
  }, [shouldSend, sendCode]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    verify({ email, code }, {
      onSuccess: ({ loggedIn }) => {
        router.replace(loggedIn ? postLoginPath() : `/login?verified=1`);
      },
      onError: (err) => {
        const msg = err.response?.data?.message;
        setError(Array.isArray(msg) ? msg[0] : msg || "Something went wrong. Please try again.");
      },
    });
  };

  const inputClass =
    "w-full bg-bg border rounded-[10px] py-[11px] px-[13px] text-center text-[1.4rem] tracking-[0.5em] font-[600] tabular-nums text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd " +
    (error ? "border-red-500 bg-red-500/10 focus:border-red-500" : "border-brd2 focus:border-acc");

  return (
    <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] relative overflow-hidden bg-bg text-tx transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-acc-bg rounded-[50%] blur-[50px] pointer-events-none animate-[breathe_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-blu-bg rounded-[50%] blur-[60px] pointer-events-none" />

      <PublicHeader
        variant="auth"
        authAction={
          <Link href="/login" className="px-[16px] py-[6px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.84rem] font-medium transition-colors duration-200 hover:bg-surf2 focus:outline-none flex items-center justify-center">
            ← Back to login
          </Link>
        }
      />

      <div className="bg-card border border-brd rounded-[18px] p-[40px] w-full max-w-[420px] relative z-[2] transition-colors duration-300 animate-up shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {!email ? (
          <div>
            <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Verify your email</Heading>
            <Text variant="default" className="!mb-[22px] !font-light leading-[1.65]">
              This link is missing your email address. Log in and we&apos;ll send you a new code.
            </Text>
            <Link href="/login" className="text-acc font-[500] hover:underline">Go to login</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="animate-up">
            <div className="w-[64px] h-[64px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center mb-[22px]">
              <MailCheck strokeWidth={1.5} className="w-[30px] h-[30px] text-acc" />
            </div>
            <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Check your inbox</Heading>
            <Text variant="default" className="!mb-[0px] !font-light leading-[1.65]">Enter the 6-digit code we sent to</Text>

            <div className="inline-flex items-center gap-[7px] bg-bg1 border border-brd2 rounded-[8px] p-[8px_14px] text-[0.82rem] font-[500] text-tx mb-[22px] mt-[12px] max-w-full">
              <Mail strokeWidth={2} className="w-[14px] h-[14px] opacity-55 shrink-0" />
              <span className="truncate">{email}</span>
            </div>

            <label htmlFor="code" className="block text-[0.78rem] font-[500] text-tx2 mb-[6px] tracking-[0.01em]">Verification code</label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={inputClass}
              placeholder="000000"
            />
            {error && <div className="text-[0.72rem] text-red-500 mt-[6px]">{error}</div>}
            {notice && !error && <div className="text-[0.72rem] text-tx2 mt-[6px]">{notice}</div>}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full mt-[18px] py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center h-[48px]"
            >
              {isVerifying ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span>Verify email <ArrowRight className="inline-block w-[16px] h-[16px] ml-[2px]" /></span>}
            </button>

            <div className="flex items-center justify-center gap-[6px] text-[0.78rem] text-tx2 mt-[18px]">
              <span>Didn&apos;t get it?</span>
              {cooldown > 0 ? (
                <span className="text-tx3">Resend in {cooldown}s</span>
              ) : (
                <button type="button" onClick={sendCode} disabled={isResending} className="bg-transparent border-none font-inherit text-[0.78rem] text-acc font-[500] cursor-pointer transition-opacity duration-150 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isResending ? "Sending..." : "Send a new code"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
