"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle, Loader2, Lock, Mail } from "lucide-react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { EmailNotVerifiedError, useLogin } from "@/features/auth/hooks/useLogin";
import type { LoginPayload } from "@/features/auth/types";
import { postLoginPath } from "@/lib/session";
import { signInWithGoogle } from "../utils/google";
import { IconField, iconInputClass } from "./IconField";
import { ShowPasswordButton } from "./ShowPasswordButton";
import { ErrorBanner } from "./ErrorBanner";
import { OrDivider } from "./OrDivider";
import { GoogleButton } from "./GoogleButton";

const BAD_LOGIN = "Incorrect email or password. Please try again.";

export function LoginForm() {
  const router = useRouter();
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({ mode: "onSubmit" });
  const { mutate: loginUser, isPending } = useLogin();

  function onSubmit(data: LoginPayload) {
    setError(null);
    loginUser(data, {
      onSuccess: () => router.push(postLoginPath()),
      onError: (err) => {
        if (err instanceof EmailNotVerifiedError) {
          router.push(`/verify-email?email=${encodeURIComponent(err.email)}&send=1`);
          return;
        }
        console.error("Login failed:", err);
        setError(BAD_LOGIN);
      },
    });
  }

  async function handleGoogle() {
    const message = await signInWithGoogle();
    if (message) setError(message);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-[400px] animate-up">
      <Heading as="h1" variant="card" className="!text-[1.55rem] !mb-[5px]">Welcome back</Heading>
      <Text variant="default" className="!mb-[24px] !font-light">Log in to your NexShift account.</Text>

      <ErrorBanner message={error} />

      <div className="flex flex-col gap-[16px] mb-[16px]">
        <IconField label="Email address" icon={Mail} error={errors.email?.message}>
          <input
            type="email"
            placeholder="jane@clinic.com"
            {...register("email", {
              required: "Please enter a valid email",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
              onChange: () => setError(null),
            })}
            className={iconInputClass(!!errors.email)}
          />
        </IconField>

        <IconField
          label="Password"
          icon={Lock}
          error={errors.password?.message}
          labelAction={<Link href="/forgot-password" className="text-[0.75rem] text-acc font-medium hover:underline transition-all">Forgot password?</Link>}
          trailing={<ShowPasswordButton shown={showPw} onToggle={() => setShowPw(!showPw)} />}
        >
          <input
            type={showPw ? "text" : "password"}
            placeholder="Your password"
            {...register("password", {
              required: "Please enter your password",
              onChange: () => setError(null),
            })}
            className={iconInputClass(!!errors.password, true)}
          />
        </IconField>
      </div>

      <div className="flex items-center gap-[8px] mb-[20px] cursor-pointer" onClick={() => setRemember(!remember)}>
        <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center transition-all duration-200 ${remember ? "bg-acc-bg border-acc text-acc" : "bg-bg border-brd2"}`}>
          {remember && <CheckCircle className="w-[10px] h-[10px]" strokeWidth={3} />}
        </div>
        <span className="text-[0.8rem] text-tx2 select-none">Remember me for 30 days</span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center h-[48px]"
      >
        {isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span>Log in <ArrowRight className="inline-block w-[16px] h-[16px] ml-[2px]" /></span>}
      </button>

      <OrDivider label="or continue with" />
      <GoogleButton onClick={handleGoogle} className="py-[11px] mb-[10px]" />

      <p className="text-center text-[0.82rem] text-tx2 mt-[20px]">
        Don&apos;t have an account? <Link href="/signup" className="text-acc font-medium no-underline hover:underline">Sign up free</Link>
      </p>
    </form>
  );
}
