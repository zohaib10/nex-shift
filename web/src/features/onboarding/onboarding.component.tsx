"use client";

import * as React from "react";
import { ChevronLeft, CheckCircle, Building, MapPin, Users, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/features/Dashboard/components/Header";
import { OrgDetailsStep, OrgDetailsValues, OrgDetailsErrors } from "./steps/OrgDetailsStep.component";
import { LocationStep, LocationValues, LocationErrors } from "./steps/LocationStep.component";
import { InviteTeamStep } from "./steps/InviteTeamStep.component";
import { PromoConfirmStep, PromoState } from "./steps/PromoConfirmStep.component";

export interface OnboardingFormValues extends OrgDetailsValues, LocationValues {
  inviteEmails: string[];
  promoInput: string;
  promoId: string | null;
  promoMaxMembers: number | null;
  promoCode: string | null;
}

export interface OnboardingComponentProps {
  currentStep: number;
  slideDirection: "forward" | "backward";
  formValues: OnboardingFormValues;
  stepErrors: OrgDetailsErrors & LocationErrors;
  timezoneLabel: string;
  promoApplied: PromoState | null;
  promoError: string | null;
  isValidatingPromo: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  orgNameCreated: string;
  user: { firstName: string; lastName: string } | null;
  isAddMode: boolean;
  onFieldChange: (field: keyof OnboardingFormValues, value: string) => void;
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
  onPromoInputChange: (val: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  onGoToDashboard: () => void;
}

const STEPS = [
  {
    icon: <Building className="w-[20px] h-[20px] text-acc" />,
    label: "Organization",
    title: "Your Organization",
    subtitle: "Tell us about your practice.",
  },
  {
    icon: <MapPin className="w-[20px] h-[20px] text-acc" />,
    label: "Location",
    title: "First Location",
    subtitle: "Where is your primary facility?",
  },
  {
    icon: <Users className="w-[20px] h-[20px] text-acc" />,
    label: "Invite team",
    title: "Invite Your Team",
    subtitle: "Add team members to get started.",
  },
  {
    icon: <CheckSquare className="w-[20px] h-[20px] text-acc" />,
    label: "Launch",
    title: "Review & Launch",
    subtitle: "Confirm your setup and go live.",
  },
];


export function OnboardingComponent({
  currentStep,
  slideDirection,
  formValues,
  stepErrors,
  timezoneLabel,
  promoApplied,
  promoError,
  isValidatingPromo,
  isSubmitting,
  submitError,
  orgNameCreated,
  user,
  isAddMode,
  onFieldChange,
  onAddEmail,
  onRemoveEmail,
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
  onContinue,
  onBack,
  onSkip,
  onSubmit,
  onGoToDashboard,
}: OnboardingComponentProps) {
  const router = useRouter();
  const isSuccess = currentStep === 5;
  const stepIndex = Math.min(currentStep - 1, 3);
  const stepInfo = STEPS[stepIndex];

  const slideAnim =
    slideDirection === "forward"
      ? "slideFromRight 0.32s ease both"
      : "slideFromLeft 0.32s ease both";

  return (
    <main className="min-h-[100svh] flex flex-col relative bg-bg text-tx transition-colors duration-300">
      <DashboardHeader user={user} />
      {isAddMode && (
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-[70px] left-[28px] flex items-center gap-[5px] text-[0.8rem] text-tx2 hover:text-tx transition-colors duration-150 bg-transparent border-none cursor-pointer z-20"
        >
          <ChevronLeft className="w-[14px] h-[14px]" strokeWidth={2} />
          Back to dashboard
        </button>
      )}

      {/* Page body */}
      <div className="flex-1 flex flex-col items-center pt-[80px] pb-[60px] px-[20px] relative z-10">
        {/* Atmospheric glow */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div
            className="w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,212,160,0.08) 0%, transparent 70%)" }}
          />
        </div>

        {/* Step progress indicator */}
        {!isSuccess && (
          <div className="flex items-center justify-center mb-[40px] mt-[8px] relative z-20">
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <React.Fragment key={i}>
                  {/* Step item */}
                  <div className="flex flex-col items-center gap-[8px] relative">
                    <div
                      className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[0.7rem] font-bold border-2 transition-all duration-300 ${
                        currentStep > i + 1
                          ? "bg-acc/10 border-acc text-acc"
                          : currentStep === i + 1
                          ? "bg-acc border-acc text-[#07090E] shadow-[0_0_0_4px_rgba(0,212,138,0.15)]"
                          : "bg-surface border-brd2 text-tx3"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span 
                      className={`text-[0.62rem] font-semibold tracking-wider uppercase whitespace-nowrap absolute top-[36px] transition-colors duration-300 ${
                        currentStep === i + 1 ? "text-acc" : "text-tx3"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Divider line */}
                  {i < 3 && (
                    <div className="w-[48px] h-[2px] bg-brd2 mx-[8px] relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-acc transition-all duration-500 ease-in-out"
                        style={{ width: currentStep > i + 1 ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <div
          className="w-full max-w-[480px] bg-surf border border-brd rounded-[18px] relative z-10"
          style={{ padding: "40px" }}
        >
          {isSuccess ? (
            /* Success screen */
            <div
              key="success"
              style={{ animation: "slideFromRight 0.32s ease both" }}
              className="flex flex-col items-center text-center py-[8px]"
            >
              <div className="w-[64px] h-[64px] rounded-full bg-acc-bg border border-acc-brd flex items-center justify-center mb-[20px]">
                <CheckCircle
                  className="w-[32px] h-[32px] text-acc"
                  style={{ animation: "successCheck 0.4s 0.1s ease both" }}
                />
              </div>
              <h2 className="font-geist text-[1.5rem] font-[600] tracking-[-0.03em] text-tx mb-[8px]">
                You&apos;re all set!
              </h2>
              <div className="inline-flex items-center gap-[6px] px-[12px] py-[5px] bg-acc-bg border border-acc-brd rounded-full mb-[16px]">
                <span className="text-[0.82rem] font-medium text-acc">{orgNameCreated}</span>
              </div>
              <p className="text-[0.85rem] text-tx2 mb-[28px] max-w-[300px] leading-[1.6]">
                Your organization is live. Head to your dashboard to start scheduling your team.
              </p>
              <button
                type="button"
                onClick={onGoToDashboard}
                className="px-[28px] py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] flex items-center gap-[6px]"
              >
                Go to dashboard →
              </button>
            </div>
          ) : (
            <div key={`step-${currentStep}-${slideDirection}`} style={{ animation: slideAnim }}>
              {/* Step icon + title */}
              <div className="mb-[24px]">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-acc-bg border border-acc-brd flex items-center justify-center text-[1.1rem] mb-[14px]">
                  {stepInfo.icon}
                </div>
                <h2 className="font-geist text-[1.35rem] font-[600] tracking-[-0.03em] text-tx mb-[4px]">
                  {currentStep === 1 && isAddMode ? "Add a new organization" : stepInfo.title}
                </h2>
                <p className="text-[0.84rem] text-tx2">
                  {currentStep === 1 && isAddMode
                    ? "This will be a separate workspace. You can switch between your organizations from the sidebar."
                    : stepInfo.subtitle}
                </p>
              </div>

              {/* Step content */}
              {currentStep === 1 && (
                <OrgDetailsStep
                  values={{
                    orgName: formValues.orgName,
                    orgType: formValues.orgType,
                    orgTypeOther: formValues.orgTypeOther,
                    orgPhone: formValues.orgPhone,
                    orgWebsite: formValues.orgWebsite,
                  }}
                  errors={{ orgName: stepErrors.orgName, orgType: stepErrors.orgType }}
                  onChange={(field, value) => onFieldChange(field as keyof OnboardingFormValues, value)}
                />
              )}
              {currentStep === 2 && (
                <LocationStep
                  values={{
                    locationName: formValues.locationName,
                    locationAddress: formValues.locationAddress,
                    locationCity: formValues.locationCity,
                    locationState: formValues.locationState,
                  }}
                  errors={{ locationName: stepErrors.locationName, locationState: stepErrors.locationState }}
                  timezoneLabel={timezoneLabel}
                  onChange={(field, value) => onFieldChange(field as keyof OnboardingFormValues, value)}
                />
              )}
              {currentStep === 3 && (
                <InviteTeamStep
                  emails={formValues.inviteEmails}
                  onAddEmail={onAddEmail}
                  onRemoveEmail={onRemoveEmail}
                />
              )}
              {currentStep === 4 && (
                <PromoConfirmStep
                  summary={{
                    orgName: formValues.orgName,
                    locationName: formValues.locationName,
                    timezoneLabel,
                    inviteCount: formValues.inviteEmails.length,
                    promoApplied,
                  }}
                  promoInput={formValues.promoInput}
                  promoError={promoError}
                  isValidatingPromo={isValidatingPromo}
                  onPromoInputChange={onPromoInputChange}
                  onApplyPromo={onApplyPromo}
                  onRemovePromo={onRemovePromo}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              )}

              {/* Navigation buttons */}
              {currentStep < 4 && (
                <div className="mt-[28px] flex flex-col gap-[10px]">
                  <button
                    type="button"
                    onClick={onContinue}
                    className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 h-[48px] flex items-center justify-center"
                  >
                    Continue →
                  </button>
                  {currentStep === 3 && (
                    <button
                      type="button"
                      onClick={onSkip}
                      className="text-[0.82rem] text-tx3 hover:text-tx2 transition-colors duration-150 text-center"
                    >
                      Skip for now →
                    </button>
                  )}
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex items-center justify-center gap-[4px] text-[0.82rem] text-tx3 hover:text-tx2 transition-colors duration-150"
                    >
                      <ChevronLeft className="w-[14px] h-[14px]" /> Back
                    </button>
                  )}
                </div>
              )}

              {/* Back on step 4 is above the create button in the PromoConfirmStep — add it here */}
              {currentStep === 4 && (
                <div className="mt-[14px] flex justify-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center justify-center gap-[4px] text-[0.82rem] text-tx3 hover:text-tx2 transition-colors duration-150"
                  >
                    <ChevronLeft className="w-[14px] h-[14px]" /> Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
