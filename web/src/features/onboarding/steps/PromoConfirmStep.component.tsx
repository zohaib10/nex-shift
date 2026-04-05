"use client";

import * as React from "react";
import { ChevronDown, Loader2, AlertTriangle, ArrowRight } from "lucide-react";

export interface PromoState {
  id: string;
  maxMembers: number;
  code: string;
}

interface SummaryData {
  orgName: string;
  locationName: string;
  timezoneLabel: string;
  inviteCount: number;
  promoApplied: PromoState | null;
}

interface PromoConfirmStepProps {
  summary: SummaryData;
  promoInput: string;
  promoError: string | null;
  isValidatingPromo: boolean;
  onPromoInputChange: (val: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export function PromoConfirmStep({
  summary,
  promoInput,
  promoError,
  isValidatingPromo,
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
  onSubmit,
  isSubmitting,
  submitError,
}: PromoConfirmStepProps) {
  const [accordionOpen, setAccordionOpen] = React.useState(false);

  return (
    <div className="space-y-[20px]">
      {/* Promo applied banner */}
      {summary.promoApplied ? (
        <div className="flex items-center justify-between p-[12px_16px] bg-acc-bg border border-acc-brd rounded-[10px]">
          <span className="text-[0.84rem] text-acc font-medium">
            🎉 Promo applied! You get 20 free staff members.
          </span>
          <button
            type="button"
            onClick={onRemovePromo}
            className="text-[0.75rem] text-tx3 hover:text-tx transition-colors duration-150 ml-[12px] shrink-0"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Promo accordion */
        <div className="border border-brd2 rounded-[12px] overflow-hidden">
          {/* Toggle row */}
          <button
            type="button"
            onClick={() => setAccordionOpen((o) => !o)}
            className="w-full flex items-center justify-between p-[14px_16px] text-left hover:bg-surf2 transition-colors duration-150"
          >
            <div className="flex items-center gap-[10px]">
              <span className="text-[1rem]">🎟️</span>
              <div>
                <div className="text-[0.84rem] font-medium text-tx">Use a promo code</div>
                <div className="text-[0.72rem] text-tx3">Get 20 free staff members</div>
              </div>
            </div>
            <ChevronDown
              className={`w-[16px] h-[16px] text-tx3 transition-transform duration-200 ${accordionOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Accordion body */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: accordionOpen ? "120px" : "0px" }}
          >
            <div className="px-[16px] pb-[16px] pt-[4px]">
              <div className="flex gap-[8px]">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={promoInput}
                  onChange={(e) => onPromoInputChange(e.target.value.toUpperCase().slice(0, 20))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onApplyPromo(); } }}
                  className={`flex-1 bg-bg border rounded-[8px] py-[9px] px-[12px] text-[0.85rem] font-mono uppercase tracking-[0.05em] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd ${
                    promoError ? "border-red-500 bg-red-500/10 focus:border-red-500" : "border-brd2 focus:border-acc"
                  }`}
                />
                <button
                  type="button"
                  onClick={onApplyPromo}
                  disabled={isValidatingPromo || !promoInput.trim()}
                  className="px-[16px] py-[9px] rounded-[8px] bg-acc text-[#07090E] text-[0.84rem] font-[600] transition-all duration-200 hover:opacity-[0.86] disabled:opacity-[0.5] disabled:pointer-events-none flex items-center gap-[6px]"
                >
                  {isValidatingPromo ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : "Apply"}
                </button>
              </div>
              {promoError && (
                <div className="flex items-center gap-[6px] mt-[8px] text-red-500 text-[0.75rem]">
                  <AlertTriangle className="w-[12px] h-[12px] shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary card */}
      <div className="bg-surf2 border border-brd rounded-[12px] overflow-hidden">
        <div className="px-[16px] py-[12px] border-b border-brd">
          <span className="text-[0.72rem] font-[600] tracking-[0.08em] uppercase text-tx3">Summary</span>
        </div>
        {[
          { label: "Organization", value: summary.orgName || "—" },
          { label: "Location", value: summary.locationName || "—" },
          { label: "Time zone", value: summary.timezoneLabel || "Not detected" },
          {
            label: "Invites",
            value: summary.inviteCount > 0 ? `${summary.inviteCount} ${summary.inviteCount === 1 ? "person" : "people"}` : "None yet",
          },
          {
            label: "Plan",
            value: summary.promoApplied
              ? "Free · up to 20 members (promo)"
              : "Free · up to 5 members",
            accent: !!summary.promoApplied,
          },
        ].map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-[16px] py-[11px] text-[0.83rem] ${
              i > 0 ? "border-t border-brd" : ""
            }`}
          >
            <span className="text-tx3">{row.label}</span>
            <span className={(row as any).accent ? "text-acc font-medium" : "text-tx font-medium"}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-[8px] p-[11px_14px] bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-500 text-[0.82rem]">
          <AlertTriangle className="w-[16px] h-[16px] shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Create org button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center gap-[6px] h-[48px]"
      >
        {isSubmitting ? (
          <Loader2 className="w-[18px] h-[18px] animate-spin" />
        ) : (
          <span className="flex items-center gap-[4px]">
            Create organization <ArrowRight className="w-[17px] h-[17px]" />
          </span>
        )}
      </button>
    </div>
  );
}
