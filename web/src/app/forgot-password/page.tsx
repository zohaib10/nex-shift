"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { Mail, Loader2, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

type ViewState = 'form' | 'sent';

interface ForgotFormData {
  email: string;
}

export default function ForgotPassword() {
  const [view, setView] = React.useState<ViewState>('form');
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const { mutate: sendResetEmail, isPending: isSending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<ForgotFormData>({ mode: "onSubmit" });

  const onSubmit = (data: ForgotFormData) => {
    sendResetEmail(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
        setView('sent');
      },
      onError: (err) => {
        console.error("Failed to generate reset link:", err);
      }
    });
  };

  const useOtherEmail = () => {
    setView('form');
    setValue('email', '');
    setTimeout(() => setFocus('email'), 50);
  };

  const handleResend = () => {
    sendResetEmail({ email: submittedEmail }, {
      onSuccess: () => {
        setResendCooldown(30);
      }
    });
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const inputBase = "w-full bg-bg border rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;

  return (
    <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] relative overflow-hidden bg-bg text-tx transition-colors duration-300">
      
      {/* Background glow effects */}
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

        {/* ── STATE 1: ENTER EMAIL ── */}
        {view === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-up">
            <div className="flex items-center gap-[9px] mb-[28px]">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-acc-bg border border-acc-brd flex items-center justify-center">
                <KeyRound strokeWidth={2.5} className="w-[18px] h-[18px] text-acc" />
              </div>
              <span className="font-geist text-[1.05rem] font-[700] tracking-[-0.03em] leading-none">
                <span className="text-tx">Nex</span><span className="text-acc">Shift</span>
              </span>
            </div>
            
            <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Forgot your password?</Heading>
            <Text variant="default" className="!mb-[28px] !font-light leading-[1.65]">No worries. Enter your email and we&apos;ll send you a link to reset it.</Text>

            <div className="mb-[16px]">
              <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px] tracking-[0.01em]">Email address</label>
              <div className="relative">
                <span className="absolute left-[13px] top-[48%] -translate-y-1/2 opacity-40 pointer-events-none">
                  <Mail className="w-[16px] h-[16px]" />
                </span>
                <input
                  type="email"
                  placeholder="jane@clinic.com"
                  autoComplete="email"
                  {...register("email", {
                    required: "Please enter a valid email address",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
                  })}
                  className={errors.email ? inputError : inputNormal}
                />
              </div>
              {errors.email && <div className="text-[0.72rem] text-red-500 mt-[5px] block">{errors.email.message}</div>}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full mt-[4px] py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center h-[48px]"
            >
              {isSending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span>Send reset link <ArrowRight className="inline-block w-[16px] h-[16px] ml-[2px]" /></span>}
            </button>

            <p className="text-center text-[0.82rem] text-tx2 mt-[18px]">
              Remembered it? <Link href="/login" className="text-acc font-[500] no-underline hover:underline">Log in</Link>
            </p>
          </form>
        )}

        {/* ── STATE 2: EMAIL SENT ── */}
        {view === 'sent' && (
          <div className="animate-up">
            <div className="w-[64px] h-[64px] rounded-full bg-[rgba(47,111,255,0.10)] border border-[rgba(47,111,255,0.2)] flex items-center justify-center mb-[22px] animate-[iconPop_0.5s_0.05s_cubic-bezier(0.22,1,0.36,1)_both]">
              <Mail strokeWidth={1.5} className="w-[32px] h-[32px] text-[#3B82F6]" />
            </div>
            <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Check your inbox</Heading>
            <Text variant="default" className="!mb-[0px] !font-light leading-[1.65]">We sent a reset link to</Text>

            <div className="inline-flex items-center gap-[7px] bg-bg1 border border-brd2 rounded-[8px] p-[8px_14px] text-[0.82rem] font-[500] text-tx mb-[22px] mt-[12px] transition-colors duration-300">
              <Mail strokeWidth={2} className="w-[14px] h-[14px] opacity-55" />
              <span>{submittedEmail}</span>
            </div>

            <div className="flex flex-col gap-[10px] p-[16px] bg-bg1 border border-brd rounded-[10px] mb-[22px] transition-colors duration-300">
              <div className="flex items-start gap-[10px]">
                <div className="w-[18px] h-[18px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center text-[0.58rem] font-[700] text-acc shrink-0 mt-[2px]">1</div>
                <div className="text-[0.78rem] text-tx2 leading-[1.55]">Open the email from <strong className="text-tx font-[500]">NexShift</strong> — check spam if you don&apos;t see it</div>
              </div>
              <div className="flex items-start gap-[10px]">
                <div className="w-[18px] h-[18px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center text-[0.58rem] font-[700] text-acc shrink-0 mt-[2px]">2</div>
                <div className="text-[0.78rem] text-tx2 leading-[1.55]">Click <strong className="text-tx font-[500]">&quot;Reset my password&quot;</strong> in the email</div>
              </div>
              <div className="flex items-start gap-[10px]">
                <div className="w-[18px] h-[18px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center text-[0.58rem] font-[700] text-acc shrink-0 mt-[2px]">3</div>
                <div className="text-[0.78rem] text-tx2 leading-[1.55]">You&apos;ll be taken to a page to create your new password</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-[6px] text-[0.78rem] text-tx2">
              <span>Didn&apos;t get it?</span>
              {resendCooldown > 0 ? (
                <span className="text-tx3">Resend in {resendCooldown}s</span>
              ) : (
                <button onClick={handleResend} disabled={isSending} className="bg-transparent border-none font-inherit text-[0.78rem] text-acc font-[500] cursor-pointer transition-opacity duration-150 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSending ? "Resending..." : "Resend email"}
                </button>
              )}
            </div>

            <p className="text-center text-[0.82rem] text-tx2 mt-[18px]">
              <button type="button" onClick={useOtherEmail} className="text-tx2 font-[500] hover:underline transition-colors">
                ← Use a different email
              </button>
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
