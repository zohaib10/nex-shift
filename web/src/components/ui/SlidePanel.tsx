"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Full-height panel that slides in from the right edge of the window.
 *
 * Rendered into document.body through a portal: a `fixed` element inside a
 * parent with a transform (e.g. an entrance animation) or overflow-hidden
 * would otherwise be positioned and clipped by that parent.
 *
 * Children are the panel's body and optional footer; give the body
 * `flex-1 overflow-y-auto` so it scrolls between the header and footer.
 */
export function SlidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Close on Escape and stop the page behind from scrolling while open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[49] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
        className={`fixed top-0 right-0 bottom-0 w-[340px] max-w-full bg-surf border-l border-brd2 z-[50] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-brd shrink-0">
          <span className="text-[0.86rem] font-[600] text-tx">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-[26px] h-[26px] rounded-[6px] border border-brd2 bg-transparent flex items-center justify-center text-tx2 hover:bg-surf2 transition-colors cursor-pointer"
          >
            <X className="w-[13px] h-[13px]" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </>,
    document.body
  );
}
