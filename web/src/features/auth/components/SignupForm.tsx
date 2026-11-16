"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRight, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useRouter } from "next/navigation";
import type { SignupPayload } from "../types";
import { useSignup } from "../hooks/useSignup";
import { signInWithGoogle } from "../utils/google";
import { IconField, iconInputClass } from "./IconField";
import { ShowPasswordButton } from "./ShowPasswordButton";
import { PasswordStrength } from "./PasswordStrength";
import { ErrorBanner } from "./ErrorBanner";
import { OrDivider } from "./OrDivider";
import { GoogleButton } from "./GoogleButton";

const SIGNUP_FAILED = "An error occurred during signup.";

export function SignupForm() {
  const router = useRouter();
  const [showPw, setShowPw] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [googleError, setGoogleError] = React.useState<string | null>(null);
  const { register, handleSubmit, control, formState: { errors } } = useForm<SignupPayload>({ mode: "onSubmit" });
  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });
  const { mutate: signup, isPending } = useSignup();

  // The account is created unverified; the user enters the emailed code next.
  function onSubmit(data: SignupPayload) {
    setApiError(null);
    signup(data, {
      onSuccess: (response) => router.push(`/verify-email?email=${encodeURIComponent(response.email)}`),
      onError: (err) => {
        const msg: unknown = err.response?.data?.message || err.message;
        setApiError(typeof msg === "string" ? msg : Array.isArray(msg) ? String(msg[0]) : SIGNUP_FAILED);
      },
    });
  }

  async function handleGoogle() {
    setGoogleError(null);
    setGoogleError(await signInWithGoogle());
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Create your account</Heading>
      <Text variant="default" className="!mb-[28px] !font-light">Get your team scheduled in minutes.</Text>

      <ErrorBanner message={apiError || googleError} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mb-[16px]">
        <IconField label="First name" icon={User} error={errors.firstName?.message}>
          <input
            type="text"
            placeholder="Jane"
            {...register("firstName", { required: "Please enter your first name" })}
            className={iconInputClass(!!errors.firstName)}
          />
        </IconField>
        <IconField label="Last name" icon={User} error={errors.lastName?.message}>
          <input
            type="text"
            placeholder="Smith"
            {...register("lastName", { required: "Please enter your last name" })}
            className={iconInputClass(!!errors.lastName)}
          />
        </IconField>
      </div>

      <div className="flex flex-col gap-[16px]">
        <IconField label="Email address" icon={Mail} error={errors.email?.message}>
          <input
            type="email"
            placeholder="jane@clinic.com"
            {...register("email", {
              required: "Please enter a valid email",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email" },
            })}
            className={iconInputClass(!!errors.email)}
          />
        </IconField>

        <IconField label="Phone number" icon={Phone} error={errors.phoneNumber?.message}>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register("phoneNumber", {
              required: "Please enter a valid phone number",
              validate: (v) => v.replace(/\D/g, "").length >= 10 || "Please enter a valid phone number",
            })}
            className={iconInputClass(!!errors.phoneNumber)}
          />
        </IconField>

        <div>
          <IconField
            label="Password"
            icon={Lock}
            trailing={<ShowPasswordButton shown={showPw} onToggle={() => setShowPw(!showPw)} />}
          >
            <input
              type={showPw ? "text" : "password"}
              placeholder="Min. 8 characters"
              {...register("password", {
                required: "Password must be at least 8 characters",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              })}
              className={iconInputClass(!!errors.password, true)}
            />
          </IconField>
          <PasswordStrength password={passwordValue} />
          {errors.password && <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.password.message}</div>}
        </div>
      </div>

      <OrDivider label="or sign up with" />
      <GoogleButton onClick={handleGoogle} className="py-[10px] mb-[20px]" />

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
  );
}
