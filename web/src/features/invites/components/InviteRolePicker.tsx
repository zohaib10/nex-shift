import { INVITE_ROLE_HINT, INVITE_ROLE_LABEL, type InviteRole } from "@/lib/roles";

export function InviteRolePicker({
  options,
  value,
  onChange,
}: {
  options: InviteRole[];
  value: InviteRole;
  onChange: (role: InviteRole) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-[0.78rem] font-[500] text-tx2 mb-[6px]">Role</legend>
      <div className="border border-brd2 rounded-[10px] overflow-hidden">
        {options.map((r, i) => {
          const checked = value === r;
          return (
            <label
              key={r}
              className={`flex items-start gap-[9px] px-[13px] py-[10px] cursor-pointer transition-colors duration-150 ${i > 0 ? "border-t border-brd" : ""} ${checked ? "bg-acc-bg" : "hover:bg-surf2"}`}
            >
              <input
                type="radio"
                name="invite-role"
                value={r}
                checked={checked}
                onChange={() => onChange(r)}
                className="w-[14px] h-[14px] accent-acc shrink-0 cursor-pointer mt-[2px]"
              />
              <span className="flex-1 min-w-0">
                <span className={`block text-[0.84rem] ${checked ? "font-[600] text-tx" : "font-[500] text-tx2"}`}>
                  {INVITE_ROLE_LABEL[r]}
                </span>
                <span className="block text-[0.72rem] text-tx3 leading-[1.45]">{INVITE_ROLE_HINT[r]}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
