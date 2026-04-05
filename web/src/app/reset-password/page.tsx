"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NexShiftLogo } from "@/components/NexShiftLogo";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

type ViewState = 'form' | 'success';

interface ResetFormData {
  newPassword: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [view, setView] = React.useState<ViewState>('form');
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirmPw, setShowConfirmPw] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({ mode: "onSubmit" });

  const passwordValue = watch("newPassword", "");

  const getStrengthScore = (val: string) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getStrengthScore(passwordValue);
  const levels = ['weak', 'fair', 'good', 'good'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const cls = score > 0 ? levels[score - 1] : 'weak';

  const onSubmit = (data: ResetFormData) => {
    if (!token) return;
    setApiError(null);

    resetPassword(
      { token, newPassword: data.newPassword },
      {
        onSuccess: () => setView('success'),
        onError: (err) => {
          const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
          setApiError(msg);
        },
      }
    );
  };

  const inputBase = "w-full bg-bg border rounded-[10px] py-[11px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc pr-[40px]`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500 pr-[40px]`;

  // No token in URL — invalid access
  if (!token) {
    return (
      <main className="min-h-[100svh] flex items-center justify-center p-[80px_24px_48px] bg-bg text-tx transition-colors duration-300">
        <PublicHeader variant="auth" />
        <div className="text-center animate-up">
          <AlertTriangle className="w-[48px] h-[48px] text-red-500 mx-auto mb-[16px]" />
          <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[8px]">Invalid reset link</Heading>
          <Text variant="default" className="!font-light !mb-[24px]">This link is missing a token. Please request a new password reset.</Text>
          <Link href="/forgot-password" className="inline-flex items-center gap-[4px] px-[24px] py-[11px] rounded-[10px] bg-acc text-[#07090E] text-[0.9rem] font-[600] transition-opacity duration-200 hover:opacity-[0.86]">
            Request new link <ArrowRight className="w-[16px] h-[16px]" />
          </Link>
        </div>
      </main>
    );
  }

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

        {/* ── STATE 1: NEW PASSWORD FORM ── */}
        {view === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-up">
            <div className="flex items-center gap-[9px] mb-[28px]">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-acc-bg border border-acc-brd flex items-center justify-center">
                <ShieldCheck strokeWidth={2} className="w-[20px] h-[20px] text-acc" />
              </div>
              <span className="font-geist text-[1.05rem] font-[700] tracking-[-0.03em] leading-none">
                <span className="text-tx">Nex</span><span className="text-acc">Shift</span>
              </span>
            </div>

            <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Create new password</Heading>
            <Text variant="default" className="!mb-[28px] !font-light leading-[1.65]">Enter a new password for your account. Make it strong!</Text>

            {/* API Error */}
            <div className={`overflow-hidden transition-all duration-300 ${apiError ? 'max-h-[100px] mb-[16px] opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
              <div className="flex items-center gap-[8px] p-[11px_14px] bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-500 text-[0.82rem]">
                <AlertTriangle className="w-[16px] h-[16px] shrink-0" />
                <span>{apiError}</span>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-[16px]">
              <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px] tracking-[0.01em]">New password</label>
              <div className="relative">
                <Lock className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  {...register("newPassword", {
                    required: "Password must be at least 8 characters",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                  className={errors.newPassword ? inputError : inputNormal}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-tx3 hover:text-tx2 transition-colors duration-150 flex items-center justify-center p-1"
                >
                  {showPw ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                </button>
              </div>
              {passwordValue.length > 0 && (
                <div className="mt-[8px]">
                  <div className="flex gap-[3px] mb-[5px]">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex-1 h-[3px] rounded-[2px] transition-colors duration-300 ${i <= score ? (cls === 'weak' ? 'bg-red-500' : cls === 'fair' ? 'bg-orange-400' : 'bg-acc') : 'bg-brd2'}`} />
                    ))}
                  </div>
                  {score > 0 && <div className={`text-[0.7rem] ${score >= 3 ? 'text-acc' : score === 2 ? 'text-orange-400' : 'text-red-500'}`}>{labels[score - 1]}</div>}
                </div>
              )}
              {errors.newPassword && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.newPassword.message}</div>}
            </div>

            {/* Confirm Password */}
            <div className="mb-[20px]">
              <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px] tracking-[0.01em]">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                <input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Re-enter your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => val === passwordValue || "Passwords do not match",
                  })}
                  className={errors.confirmPassword ? inputError : inputNormal}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-tx3 hover:text-tx2 transition-colors duration-150 flex items-center justify-center p-1"
                >
                  {showConfirmPw ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                </button>
              </div>
              {errors.confirmPassword && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.confirmPassword.message}</div>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center h-[48px]"
            >
              {isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span>Reset password <ArrowRight className="inline-block w-[16px] h-[16px] ml-[2px]" /></span>}
            </button>
          </form>
        )}

        {/* ── STATE 2: SUCCESS ── */}
        {view === 'success' && (
          <div className="text-center animate-up">
            <div className="w-[64px] h-[64px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center mx-auto mb-[22px] animate-[iconPop_0.5s_0.05s_cubic-bezier(0.22,1,0.36,1)_both]">
              <CheckCircle strokeWidth={1.5} className="w-[32px] h-[32px] text-acc" />
            </div>
            <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Password updated!</Heading>
            <Text variant="default" className="!font-light !mb-[24px] leading-[1.65]">Your password has been successfully reset. You can now log in with your new password.</Text>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 flex justify-center items-center h-[48px]"
            >
              Go to login <ArrowRight className="inline-block w-[16px] h-[16px] ml-[4px]" />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

export default function ResetPassword() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[100svh] flex items-center justify-center bg-bg text-tx transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-acc" />
      </div>
    }>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
