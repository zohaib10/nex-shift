"use client";

import * as React from "react";
import { Building2, Phone, Globe } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "Medical Clinic",
  "Hospital / Health System",
  "Urgent Care",
  "Dental Practice",
  "Physical Therapy",
  "Mental Health Practice",
  "Home Health Agency",
  "Other Healthcare",
];

export interface OrgDetailsValues {
  orgName: string;
  orgType: string;
  orgTypeOther: string;
  orgPhone: string;
  orgWebsite: string;
}

export interface OrgDetailsErrors {
  orgName?: string;
  orgType?: string;
}

interface OrgDetailsStepProps {
  values: OrgDetailsValues;
  errors: OrgDetailsErrors;
  onChange: (field: keyof OrgDetailsValues, value: string) => void;
}

export function OrgDetailsStep({ values, errors, onChange }: OrgDetailsStepProps) {
  const inputBase =
    "w-full bg-bg border rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;
  const inputNoIcon =
    "w-full bg-bg border rounded-[10px] py-[11px] px-[13px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd border-brd2 focus:border-acc";

  const showOtherField = values.orgType === "Other Healthcare";

  return (
    <div className="space-y-[16px]">
      {/* Org Name */}
      <div>
        <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
          Organization name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
          <input
            type="text"
            placeholder="e.g. Greenfield Medical Center"
            value={values.orgName}
            onChange={(e) => onChange("orgName", e.target.value)}
            className={errors.orgName ? inputError : inputNormal}
          />
        </div>
        {errors.orgName && (
          <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.orgName}</div>
        )}
      </div>

      {/* Industry / Type */}
      <div>
        <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
          Industry / Type <span className="text-red-500">*</span>
        </label>
        <select
          value={values.orgType}
          onChange={(e) => onChange("orgType", e.target.value)}
          className={`w-full bg-bg border rounded-[10px] py-[11px] px-[13px] text-[0.88rem] outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd cursor-pointer appearance-none ${
            errors.orgType
              ? "border-red-500 bg-red-500/10 text-tx focus:border-red-500"
              : "border-brd2 focus:border-acc text-tx"
          } ${!values.orgType ? "text-tx3" : "text-tx"}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238896A8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 13px center",
            paddingRight: "36px",
          }}
        >
          <option value="" disabled hidden>
            Select your type
          </option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-bg text-tx">
              {opt}
            </option>
          ))}
        </select>
        {errors.orgType && (
          <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.orgType}</div>
        )}
      </div>

      {/* Other Healthcare — animated reveal */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: showOtherField ? "80px" : "0px", opacity: showOtherField ? 1 : 0 }}
      >
        <div className="pt-[2px]">
          <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
            Describe your type of healthcare
          </label>
          <input
            type="text"
            placeholder="e.g. Pediatric Sports Medicine"
            value={values.orgTypeOther}
            onChange={(e) => onChange("orgTypeOther", e.target.value)}
            className={inputNoIcon}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
          Phone number <span className="text-tx3 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={values.orgPhone}
            onChange={(e) => onChange("orgPhone", e.target.value)}
            className={inputNormal}
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
          Website <span className="text-tx3 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Globe className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
          <input
            type="url"
            placeholder="https://yourclinic.com"
            value={values.orgWebsite}
            onChange={(e) => onChange("orgWebsite", e.target.value)}
            className={inputNormal}
          />
        </div>
      </div>
    </div>
  );
}
