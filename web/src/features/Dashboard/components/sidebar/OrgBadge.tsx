import { getInitials } from "../../utils/initials";

/** The square with an organization's initials. */
export function OrgBadge({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const box = size === "sm" ? "w-[22px] h-[22px] rounded-[5px] text-[0.52rem]" : "w-[30px] h-[30px] rounded-[7px] text-[0.6rem]";
  return (
    <div className={`${box} bg-gradient-to-br from-acc to-blu flex items-center justify-center font-[700] text-[#07090E] shrink-0`}>
      {getInitials(name)}
    </div>
  );
}
