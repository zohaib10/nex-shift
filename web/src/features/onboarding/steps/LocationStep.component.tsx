"use client";

import * as React from "react";
import { MapPin, Building, Map } from "lucide-react";

export interface LocationValues {
  locationName: string;
  locationAddress: string;
  locationCity: string;
  locationState: string;
}

export interface LocationErrors {
  locationName?: string;
  locationState?: string;
}

interface LocationStepProps {
  values: LocationValues;
  errors: LocationErrors;
  timezoneLabel: string;
  onChange: (field: keyof LocationValues, value: string) => void;
}

export function LocationStep({ values, errors, timezoneLabel, onChange }: LocationStepProps) {
  const inputBase =
    "w-full bg-bg border rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
  const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
  const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;

  const showTimezone = timezoneLabel.length > 0;

  return (
    <div className="space-y-[16px]">
      {/* Location Name */}
      <div>
        <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
          Location name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
          <input
            type="text"
            placeholder="e.g. Main Clinic"
            value={values.locationName}
            onChange={(e) => onChange("locationName", e.target.value)}
            className={errors.locationName ? inputError : inputNormal}
          />
        </div>
        {errors.locationName && (
          <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.locationName}</div>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
          Street address <span className="text-tx3 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
          <input
            type="text"
            placeholder="123 Main St"
            value={values.locationAddress}
            onChange={(e) => onChange("locationAddress", e.target.value)}
            className={inputNormal}
          />
        </div>
      </div>

      {/* City + State row */}
      <div className="grid grid-cols-[1fr_80px] gap-[12px]">
        <div>
          <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
            City <span className="text-tx3 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Map className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
            <input
              type="text"
              placeholder="San Francisco"
              value={values.locationCity}
              onChange={(e) => onChange("locationCity", e.target.value)}
              className={inputNormal}
            />
          </div>
        </div>
        <div>
          <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">
            State
          </label>
          <input
            type="text"
            placeholder="CA"
            maxLength={2}
            value={values.locationState}
            onChange={(e) => onChange("locationState", e.target.value.toUpperCase())}
            className={`w-full bg-bg border rounded-[10px] py-[11px] px-[13px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd uppercase ${
              errors.locationState
                ? "border-red-500 bg-red-500/10 focus:border-red-500"
                : "border-brd2 focus:border-acc"
            }`}
          />
          {errors.locationState && (
            <div className="text-[0.72rem] text-red-500 mt-[5px]">{errors.locationState}</div>
          )}
        </div>
      </div>

      {/* Timezone indicator — animated */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: showTimezone ? "48px" : "0px", opacity: showTimezone ? 1 : 0 }}
      >
        <div className="flex items-center gap-[8px] py-[8px] px-[12px] bg-acc-bg border border-acc-brd rounded-[8px]">
          <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
          <span className="text-[0.78rem] text-acc font-medium">
            Time zone detected: {timezoneLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
