"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingComponent, OnboardingFormValues } from "./onboarding.component";
import { useCreateOrg } from "./hooks/useCreateOrg.hook";
import { useValidatePromo } from "./hooks/useValidatePromo.hook";
import { useTimezone } from "./hooks/useTimezone.hook";
import { PageLoader } from "@/components/PageLoader";
import type { PromoState } from "./steps/PromoConfirmStep.component";

const INITIAL_FORM: OnboardingFormValues = {
  orgName: "",
  orgType: "",
  orgTypeOther: "",
  orgPhone: "",
  orgWebsite: "",
  locationName: "",
  locationAddress: "",
  locationCity: "",
  locationState: "",
  inviteEmails: [],
  promoInput: "",
  promoId: null,
  promoMaxMembers: null,
  promoCode: null,
};

export function OnboardingContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams.get("mode") === "add";

  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");
  const [formValues, setFormValues] = useState<OnboardingFormValues>(INITIAL_FORM);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [promoApplied, setPromoApplied] = useState<PromoState | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orgNameCreated, setOrgNameCreated] = useState("");
  const [user, setUser] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const { mutate: createOrg, isPending: isSubmitting } = useCreateOrg();
  const { mutate: validatePromo, isPending: isValidatingPromo } = useValidatePromo();
  const { data: timezoneData } = useTimezone(formValues.locationState);

  const timezoneLabel = timezoneData?.label ?? "";
  const timezoneIana = timezoneData?.timezone ?? "";

  useEffect(() => {
    const raw = localStorage.getItem("rosta_session");
    if (!raw) {
      router.replace("/");
      setIsChecking(false);
      return;
    }
    const session = JSON.parse(raw);
    setUser(session);
    setIsChecking(false);
  }, [router]);

  if (isChecking || !user) return <PageLoader />;

  const handleFieldChange = (field: keyof OnboardingFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (stepErrors[field]) {
      setStepErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleAddEmail = (email: string) => {
    setFormValues((prev) => ({ ...prev, inviteEmails: [...prev.inviteEmails, email] }));
  };

  const handleRemoveEmail = (email: string) => {
    setFormValues((prev) => ({ ...prev, inviteEmails: prev.inviteEmails.filter((e) => e !== email) }));
  };

  const handlePromoInputChange = (val: string) => {
    setFormValues((prev) => ({ ...prev, promoInput: val }));
    if (promoError) setPromoError(null);
  };

  const handleApplyPromo = () => {
    const code = formValues.promoInput.trim();
    if (!code) return;
    setPromoError(null);
    validatePromo(
      { code },
      {
        onSuccess: (data) => {
          if (data.valid && data.promoId && data.maxMembers) {
            setPromoApplied({ id: data.promoId, maxMembers: data.maxMembers, code });
            setFormValues((prev) => ({
              ...prev,
              promoId: data.promoId!,
              promoMaxMembers: data.maxMembers!,
              promoCode: code,
            }));
          } else {
            setPromoError(data.message ?? "Invalid promo code");
          }
        },
        onError: (err) => {
          const msg = err.response?.data?.message || err.message || "Failed to validate promo code";
          setPromoError(typeof msg === "string" ? msg : "Failed to validate promo code");
        },
      }
    );
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setFormValues((prev) => ({ ...prev, promoId: null, promoMaxMembers: null, promoCode: null, promoInput: "" }));
  };

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formValues.orgName.trim()) errors.orgName = "Organization name is required";
      if (!formValues.orgType) errors.orgType = "Please select your industry type";
    }
    if (currentStep === 2) {
      if (!formValues.locationName.trim()) errors.locationName = "Location name is required";
      if (formValues.locationState && !/^[A-Za-z]{2}$/.test(formValues.locationState)) {
        errors.locationState = "State must be a 2-letter abbreviation";
      }
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    setSlideDirection("forward");
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setSlideDirection("backward");
    setCurrentStep((s) => s - 1);
    setStepErrors({});
  };

  const handleSkip = () => {
    setSlideDirection("forward");
    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = () => {
    if (!user) return;
    setSubmitError(null);
    createOrg(
      {
        userId: user.id,
        name: formValues.orgName,
        type: formValues.orgType,
        typeOther: formValues.orgTypeOther || undefined,
        phone: formValues.orgPhone || undefined,
        website: formValues.orgWebsite || undefined,
        locationName: formValues.locationName,
        address: formValues.locationAddress || undefined,
        city: formValues.locationCity || undefined,
        state: formValues.locationState || undefined,
        timezone: timezoneIana || undefined,
        inviteEmails: formValues.inviteEmails.length > 0 ? formValues.inviteEmails : undefined,
        promoId: formValues.promoId ?? undefined,
      },
      {
        onSuccess: (data) => {
          setOrgNameCreated(data.name);
          if (isAddMode) {
            // Signal OrgContext to activate this org when the dashboard loads
            sessionStorage.setItem("rosta_pending_org", data.id);
          }
          setSlideDirection("forward");
          setCurrentStep(5);
        },
        onError: (err) => {
          const msg = err.response?.data?.message || err.message || "Failed to create organization";
          setSubmitError(typeof msg === "string" ? msg : "Failed to create organization");
        },
      }
    );
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <OnboardingComponent
      currentStep={currentStep}
      slideDirection={slideDirection}
      formValues={formValues}
      stepErrors={stepErrors}
      timezoneLabel={timezoneLabel}
      promoApplied={promoApplied}
      promoError={promoError}
      isValidatingPromo={isValidatingPromo}
      isSubmitting={isSubmitting}
      submitError={submitError}
      orgNameCreated={orgNameCreated}
      user={user}
      isAddMode={isAddMode}
      onFieldChange={handleFieldChange}
      onAddEmail={handleAddEmail}
      onRemoveEmail={handleRemoveEmail}
      onPromoInputChange={handlePromoInputChange}
      onApplyPromo={handleApplyPromo}
      onRemovePromo={handleRemovePromo}
      onContinue={handleContinue}
      onBack={handleBack}
      onSkip={handleSkip}
      onSubmit={handleSubmit}
      onGoToDashboard={handleGoToDashboard}
    />
  );
}
