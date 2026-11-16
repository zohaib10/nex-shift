"use client";

import * as React from "react";
import { Building, Loader2, Map, MapPin, Plus } from "lucide-react";
import api from "@/lib/api";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { useTimezone } from "@/features/onboarding/hooks/useTimezone";

const inputBase =
  "w-full bg-bg border rounded-[10px] py-[10px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd";
const inputNormal = `${inputBase} border-brd2 focus:border-acc`;
const inputError = `${inputBase} border-red-500 bg-red-500/10 focus:border-red-500`;

export function AddLocationPanel({
  open,
  onClose,
  onSaved,
  orgId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (loc: { id: string; name: string }) => void;
  orgId: string | null;
}) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [nameError, setNameError] = React.useState("");
  const [stateError, setStateError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const { data: tzData } = useTimezone(state);

  React.useEffect(() => {
    if (open) {
      setName(""); setAddress(""); setCity(""); setState("");
      setNameError(""); setStateError(""); setApiError("");
    }
  }, [open]);

  async function handleSave() {
    let valid = true;
    if (!name.trim()) { setNameError("Location name is required"); valid = false; }
    else setNameError("");
    if (state && (state.length !== 2 || !/^[A-Za-z]{2}$/.test(state))) {
      setStateError("Enter a 2-letter state code"); valid = false;
    } else setStateError("");
    if (!valid || !orgId) return;

    setSaving(true);
    setApiError("");
    try {
      const { data } = await api.post(`/organizations/${orgId}/locations`, {
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.toUpperCase() || undefined,
        timezone: tzData?.timezone || undefined,
      });
      onSaved(data);
      onClose();
    } catch {
      setApiError("Failed to save location. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SlidePanel open={open} onClose={onClose} title="Add Location">
      <div className="flex-1 overflow-y-auto p-[18px] space-y-[16px]">
        <div>
          <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
            Location name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
            <input
              type="text"
              placeholder="e.g. Main Clinic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={nameError ? inputError : inputNormal}
            />
          </div>
          {nameError && <p className="text-[0.72rem] text-red-500 mt-[5px]">{nameError}</p>}
        </div>

        <div>
          <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
            Street address <span className="text-tx3 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
            <input
              type="text"
              placeholder="123 Main St"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputNormal}
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_80px] gap-[12px]">
          <div>
            <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">
              City <span className="text-tx3 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Map className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-tx3" strokeWidth={2} />
              <input
                type="text"
                placeholder="San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputNormal}
              />
            </div>
          </div>
          <div>
            <label className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">State</label>
            <input
              type="text"
              placeholder="CA"
              maxLength={2}
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className={`w-full bg-bg border rounded-[10px] py-[10px] px-[13px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd uppercase ${stateError ? "border-red-500 bg-red-500/10" : "border-brd2 focus:border-acc"}`}
            />
            {stateError && <p className="text-[0.68rem] text-red-500 mt-[4px]">{stateError}</p>}
          </div>
        </div>

        {/* Timezone indicator */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: tzData ? "48px" : "0px", opacity: tzData ? 1 : 0 }}
        >
          <div className="flex items-center gap-[8px] py-[8px] px-[12px] bg-acc-bg border border-acc-brd rounded-[8px]">
            <div className="w-[6px] h-[6px] rounded-full bg-acc shrink-0" />
            <span className="text-[0.78rem] text-acc font-[500]">Time zone detected: {tzData?.label}</span>
          </div>
        </div>

        {apiError && <p className="text-[0.78rem] text-red-500">{apiError}</p>}
      </div>

      <div className="p-[14px_18px] border-t border-brd shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-[42px] rounded-[10px] bg-acc text-[#07090E] text-[0.88rem] font-[600] flex items-center justify-center gap-[6px] hover:opacity-85 transition-opacity disabled:opacity-60 cursor-pointer border-none"
        >
          {saving ? (
            <Loader2 className="w-[15px] h-[15px] animate-spin" strokeWidth={2} />
          ) : (
            <>
              <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />
              Save Location
            </>
          )}
        </button>
      </div>
    </SlidePanel>
  );
}
