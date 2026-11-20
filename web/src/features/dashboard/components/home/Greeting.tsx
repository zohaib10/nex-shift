import { getGreeting } from "../../utils/dates";

export function Greeting({ firstName, details }: { firstName?: string; details: string }) {
  return (
    <div className="mb-[20px] animate-up">
      <div className="text-[1.3rem] font-[600] tracking-[-0.04em] text-tx leading-[1.2]">
        {getGreeting(new Date())}, {firstName || "there"}
      </div>
      <div className="text-[0.8rem] text-tx2 mt-[3px]">{details}</div>
    </div>
  );
}
