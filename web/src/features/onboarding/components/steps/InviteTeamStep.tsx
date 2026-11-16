"use client";

import * as React from "react";
import { X, Mail } from "lucide-react";

interface InviteTeamStepProps {
  emails: string[];
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function InviteTeamStep({ emails, onAddEmail, onRemoveEmail }: InviteTeamStepProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const tryAdd = (raw: string) => {
    const trimmed = raw.trim().replace(/,$/, "").trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) return;
    if (emails.includes(trimmed)) return;
    onAddEmail(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      tryAdd(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "" && emails.length > 0) {
      onRemoveEmail(emails[emails.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      tryAdd(inputValue);
      setInputValue("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.endsWith(",")) {
      tryAdd(val.slice(0, -1));
      setInputValue("");
    } else {
      setInputValue(val);
    }
  };

  return (
    <div>
      <p className="text-[0.82rem] text-tx2 mb-[16px] leading-[1.6]">
        Enter email addresses one at a time. Press <kbd className="px-[5px] py-[1px] bg-surf2 border border-brd2 rounded-[4px] text-[0.72rem] font-mono text-tx3">Enter</kbd> or <kbd className="px-[5px] py-[1px] bg-surf2 border border-brd2 rounded-[4px] text-[0.72rem] font-mono text-tx3">,</kbd> to add each one.
      </p>

      {/* Pills */}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mb-[12px]">
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-[6px] px-[10px] py-[5px] bg-acc-bg border border-acc-brd rounded-full text-[0.78rem] text-acc font-medium"
              style={{ animation: "pillPop 0.2s ease both" }}
            >
              <span>{email}</span>
              <button
                type="button"
                onClick={() => onRemoveEmail(email)}
                className="text-acc hover:text-tx transition-colors duration-150 flex items-center justify-center rounded-full w-[14px] h-[14px] hover:bg-acc-brd"
              >
                <X className="w-[10px] h-[10px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Mail className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3 pointer-events-none" />
        <input
          ref={inputRef}
          type="email"
          placeholder="teammate@clinic.com"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full bg-bg border border-brd2 rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd focus:border-acc"
        />
      </div>

      {emails.length > 0 && (
        <p className="text-[0.72rem] text-tx3 mt-[10px]">
          {emails.length} {emails.length === 1 ? "person" : "people"} will receive an invite email.
        </p>
      )}
    </div>
  );
}
