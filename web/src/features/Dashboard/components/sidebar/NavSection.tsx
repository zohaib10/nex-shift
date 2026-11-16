"use client";

import { usePathname, useRouter } from "next/navigation";
import type { NavEntry } from "../../nav";
import { NavItem } from "./NavItem";

/** A labelled group of sidebar links. Renders nothing when empty. */
export function NavSection({ title, items, first = false }: { title: string; items: NavEntry[]; first?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  if (items.length === 0) return null;

  return (
    <>
      <div className={`text-[0.58rem] font-[600] tracking-[0.09em] uppercase text-tx3 px-[9px] pb-[4px] ${first ? "pt-[6px]" : "pt-[10px]"}`}>
        {title}
      </div>
      {items.map((item) => (
        <NavItem
          key={item.href}
          label={item.label}
          icon={item.icon}
          active={pathname === item.href}
          onClick={item.ready ? () => router.push(item.href) : undefined}
        />
      ))}
    </>
  );
}
