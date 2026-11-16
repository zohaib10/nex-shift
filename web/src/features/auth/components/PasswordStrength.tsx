const LABELS = ["Weak", "Fair", "Good", "Strong"];

/** 0–4: one point each for length ≥ 8, an uppercase letter, a digit, a symbol. */
function strengthScore(val: string): number {
  if (!val) return 0;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = strengthScore(password);
  const barColor = score <= 1 ? "bg-red-500" : score === 2 ? "bg-orange-400" : "bg-acc";
  const textColor = score >= 3 ? "text-acc" : score === 2 ? "text-orange-400" : "text-red-500";

  return (
    <div className="mt-[8px]">
      <div className="flex gap-[3px] mb-[5px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex-1 h-[3px] rounded-[2px] transition-colors duration-300 ${i <= score ? barColor : "bg-brd2"}`} />
        ))}
      </div>
      {score > 0 && <div className={`text-[0.7rem] ${textColor}`}>{LABELS[score - 1]}</div>}
    </div>
  );
}
