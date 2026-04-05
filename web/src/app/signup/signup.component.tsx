"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { NexShiftLogo } from "@/components/NexShiftLogo";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import type { SignupPayload } from "@/hooks/auth/types";

export interface SignupComponentProps {
  onSubmit: (data: SignupPayload) => void;
  isPending: boolean;
  apiError: string | null;
}

export function SignupComponent({ onSubmit, isPending, apiError }: SignupComponentProps) {
  const [showPw, setShowPw] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupPayload>({ mode: "onSubmit" });

  const passwordValue = watch("password", "");

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

  const inputBase = "w-full bg-bg border rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;

  return (
    <main className="min-h-[100svh] flex flex-col relative bg-bg text-tx transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-[40px] h-[58px] bg-nav backdrop-blur-[18px] saturate-[140%] border-b border-brd transition-all duration-300">
        <Link href="/" className="flex items-center no-underline shrink-0">
          <NexShiftLogo size="sm" />
        </Link>
        <div className="flex gap-[8px] items-center">
          <ThemeToggle />
          <Link href="/login" className="text-tx2 no-underline text-[0.84rem] font-medium transition-colors duration-150 hover:text-tx hidden sm:block mr-2">
            Already have an account?
          </Link>
          <Link href="/login" className="px-[16px] py-[6px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.84rem] font-medium transition-colors duration-200 hover:bg-surf2 focus:outline-none flex items-center justify-center">
            Log in
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col justify-start items-center p-6 md:p-[40px_24px_60px] pt-[84px] md:pt-[100px] relative z-10 w-full min-h-[100svh]">
        <div className="w-full max-w-[400px] my-auto relative z-20 animate-up">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Create your account</Heading>
              <Text variant="default" className="!mb-[28px] !font-light">Get your team scheduled in minutes.</Text>

              <div className={`overflow-hidden transition-all duration-300 ${apiError ? 'max-h-[100px] mb-[16px] opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
                <div className="flex items-center gap-[8px] p-[11px_14px] bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-500 text-[0.82rem]">
                  <AlertTriangle className="w-[16px] h-[16px] shrink-0" />
                  <span>{apiError}</span>
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mb-[16px]">
                <div>
                  <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">First name</label>
                  <div className="relative">
                    <User className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                    <input
                      type="text"
                      placeholder="Jane"
                      {...register("firstName", { required: "Please enter your first name" })}
                      className={errors.firstName ? inputError : inputNormal}
                    />
                  </div>
                  {errors.firstName && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.firstName.message}</div>}
                </div>
                <div>
                  <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Last name</label>
                  <div className="relative">
                    <User className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                    <input
                      type="text"
                      placeholder="Smith"
                      {...register("lastName", { required: "Please enter your last name" })}
                      className={errors.lastName ? inputError : inputNormal}
                    />
                  </div>
                  {errors.lastName && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.lastName.message}</div>}
                </div>
              </div>

              {/* Email */}
              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input
                    type="email"
                    placeholder="jane@clinic.com"
                    {...register("email", {
                      required: "Please enter a valid email",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
                    })}
                    className={errors.email ? inputError : inputNormal}
                  />
                </div>
                {errors.email && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.email.message}</div>}
              </div>

              {/* Phone */}
              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register("phoneNumber", {
                      required: "Please enter a valid phone number",
                      validate: (v) => v.replace(/\D/g, "").length >= 10 || "Please enter a valid phone number",
                    })}
                    className={errors.phoneNumber ? inputError : inputNormal}
                  />
                </div>
                {errors.phoneNumber && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.phoneNumber.message}</div>}
              </div>

              {/* Password */}
              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    {...register("password", {
                      required: "Password must be at least 8 characters",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                    })}
                    className={`${errors.password ? inputError : inputNormal} !pr-[40px]`}
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
                {errors.password && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.password.message}</div>}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-[12px] my-[20px]">
                <div className="flex-1 h-[1px] bg-brd" />
                <div className="text-[0.72rem] text-tx3">or sign up with</div>
                <div className="flex-1 h-[1px] bg-brd" />
              </div>

              {/* Google OAuth */}
              <button type="button" className="w-full py-[10px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.85rem] font-medium flex items-center justify-center gap-[9px] transition-all duration-200 hover:bg-surf2 hover:border-tx3 mb-[20px]">
                <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center gap-[4px] h-[48px]"
              >
                {isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span className="flex items-center gap-[4px]">Create account <ArrowRight className="w-[17px] h-[17px]" /></span>}
              </button>

              <p className="text-[0.72rem] text-tx3 text-center mt-[16px] leading-[1.6]">
                By signing up you agree to our <Link href="#" className="text-tx2 underline underline-offset-2 hover:text-tx">Terms of Service</Link> and <Link href="#" className="text-tx2 underline underline-offset-2 hover:text-tx">Privacy Policy</Link>.
              </p>

              <p className="text-center text-[0.82rem] text-tx2 mt-[20px]">
                Already have an account? <Link href="/login" className="text-acc font-medium no-underline hover:underline">Log in</Link>
              </p>
            </form>
        </div>
      </div>
    </main>
  );
}
