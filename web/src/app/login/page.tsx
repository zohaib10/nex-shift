"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, Eye, EyeOff, Loader2, KeyRound, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

type ViewState = 'login' | 'forgot' | 'success';

export default function Login() {
  const router = useRouter();
  
  const [view, setView] = React.useState<ViewState>('login');
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  const [errBanner, setErrBanner] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const clearErrors = () => {
    setErrors({});
    setErrBanner(false);
  };

  const handleLoginSubmit = () => {
    const newErrs: Record<string, boolean> = {
      email: !validateEmail(email),
      pass: !password.trim(),
    };
    
    setErrors(newErrs);
    setErrBanner(false);
    
    if (Object.values(newErrs).some(Boolean)) return;

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Demo logic: if password matches specific test condition throw error
      if (password.length < 4) {
        setErrBanner(true);
        setErrors({ ...errors, pass: true });
      } else {
        setView('success');
      }
    }, 1200);
  };

  const handleResetSubmit = () => {
    const newErrs = { email: !validateEmail(email) };
    setErrors(newErrs);
    if (newErrs.email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 1000);
  };

  return (
    <main className="min-h-[100svh] flex flex-col pt-[58px] relative bg-bg text-tx transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-[40px] h-[58px] bg-nav backdrop-blur-[18px] saturate-[140%] border-b border-brd transition-all duration-300">
        <Link href="/" className="font-geist font-[600] text-[1.15rem] tracking-[-0.03em] text-tx transition-colors duration-300 no-underline">
          Rosta<span className="text-acc">·</span>
        </Link>
        <div className="flex gap-[10px] items-center">
          <ThemeToggle />
          <span className="text-tx2 text-[0.84rem] hidden sm:inline">Don't have an account?</span>
          <Link href="/signup" className="px-[16px] py-[6px] rounded-[10px] bg-acc text-[#07090E] font-geist font-[600] text-[0.84rem] tracking-[-0.01em] transition-opacity duration-150 hover:opacity-[0.84]">
            Sign up free
          </Link>
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-center px-[56px] py-[64px] bg-bg2 relative overflow-hidden border-r border-brd transition-colors duration-300 z-10">
          <div className="absolute rounded-full blur-[120px] pointer-events-none w-[500px] h-[500px] bg-acc-bg top-[-80px] left-[-80px] animate-[var(--animate-od1)]" />
          <div className="absolute rounded-full blur-[120px] pointer-events-none w-[400px] h-[400px] bg-blu-bg bottom-[-60px] right-[-60px] animate-[var(--animate-od2)]" />
          
          <div className="relative z-20 max-w-[480px]">
            <div className="text-[0.68rem] font-[600] tracking-[0.1em] uppercase text-acc mb-[18px]">Welcome back</div>
            <h2 className="font-geist text-[2.6rem] font-[600] tracking-[-0.04em] leading-[1.1] text-tx mb-[16px]">
              Your team is<br/><span className="text-acc">on the clock.</span>
            </h2>
            <p className="text-[0.9rem] text-tx2 font-light max-w-[380px] leading-[1.7] mb-[40px] transition-colors duration-300">
              Log in to view schedules, manage your facilities, and keep your staff coordinated — all in one place.
            </p>

            {/* Mini Schedule */}
            <div className="bg-surf border border-brd rounded-[14px] p-6 max-w-[400px] shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-center mb-[14px]">
                <div className="text-[0.85rem] font-[600] tracking-[-0.02em] text-tx transition-colors duration-300">This Week — Main Clinic</div>
                <div className="flex items-center gap-[5px] text-[0.62rem] text-acc font-medium transition-colors duration-300">
                  <div className="w-[5px] h-[5px] bg-acc rounded-full animate-[var(--animate-blink)]" />Live
                </div>
              </div>
              <div className="grid grid-cols-[72px_repeat(5,1fr)] gap-[3px] mb-[5px]">
                <div />
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map(d => (
                  <div key={d} className="text-[0.58rem] font-[600] uppercase tracking-[0.06em] text-tx3 text-center transition-colors duration-300">{d}</div>
                ))}
              </div>
              <div className="flex flex-col gap-[3px]">
                {[
                  { n: "Dr. Patel", s: ["am", "am", "off", "am", "pm"] },
                  { n: "RN Torres", s: ["pm", "pm", "am", "am", "off"] },
                  { n: "XR Tech", s: ["am", "off", "pm", "pm", "am"] },
                  { n: "Front Desk", s: ["am", "am", "am", "am", "am"] },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-[72px_repeat(5,1fr)] gap-[3px] items-center">
                    <div className="text-[0.62rem] text-tx2 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-300">{row.n}</div>
                    {row.s.map((shift, j) => {
                      let mc = "h-[22px] rounded-[4px] flex items-center justify-center text-[0.52rem] font-[600] tracking-[0.03em] ";
                      if (shift === "am") mc += "bg-[rgba(0,212,160,0.13)] dark:bg-[rgba(0,212,160,0.22)] text-acc";
                      else if (shift === "pm") mc += "bg-[rgba(59,130,246,0.13)] dark:bg-[rgba(59,130,246,0.22)] text-[#3b82f6] dark:text-[#7aa8ff]";
                      else mc += "bg-brd text-tx3 dark:bg-[rgba(255,255,255,0.04)]";

                      return <div key={j} className={mc}>{shift.toUpperCase() === "OFF" ? "—" : shift.toUpperCase()}</div>;
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 p-4 md:p-[16px_18px] bg-acc-bg border border-acc-brd rounded-[10px] transition-colors duration-300">
              <div className="text-[0.82rem] text-tx italic leading-[1.6] mb-[8px] transition-colors duration-300">"Rosta cut our scheduling time in half. Our team always knows exactly where to be."</div>
              <div className="text-[0.72rem] text-tx2 font-medium transition-colors duration-300">— Dr. Okonkwo, ER Lead · CityMed</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-center items-center py-12 px-6 sm:px-10 bg-bg transition-colors duration-300 relative z-20">
          
          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="w-full max-w-[400px] animate-up">
              <div className="flex items-center gap-[8px] mb-[28px]">
                <div className="w-[36px] h-[36px] bg-acc rounded-[9px] flex items-center justify-center text-[0.8rem] font-[700] text-[#07090E]">R·</div>
                <span className="font-geist text-[1.05rem] font-[600] tracking-[-0.03em] text-tx">Rosta<span className="text-acc">·</span></span>
              </div>
              <Heading as="h1" variant="card" className="!text-[1.55rem] !mb-[5px]">Welcome back</Heading>
              <Text variant="default" className="!mb-[28px] !font-light">Log in to your Rosta account.</Text>

              <div className={`overflow-hidden transition-all duration-300 ${errBanner ? 'max-h-[100px] mb-[16px] opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
                <div className="flex items-center gap-[8px] p-[11px_14px] bg-red-500/10 border border-red-500/25 rounded-[10px] text-red-500 text-[0.82rem]">
                  <AlertTriangle className="w-[16px] h-[16px] shrink-0" />
                  <span>Incorrect email or password. Please try again.</span>
                </div>
              </div>

              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input 
                    type="email" 
                    placeholder="jane@clinic.com" 
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearErrors(); }}
                    onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                    className={`w-full bg-bg border ${errors.email ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                  />
                </div>
                {errors.email && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter a valid email</div>}
              </div>

              <div className="mb-[16px]">
                <div className="flex justify-between items-center mb-[6px]">
                  <label className="text-[0.78rem] font-medium text-tx2 tracking-[0.01em] m-0">Password</label>
                  <button onClick={() => { setView('forgot'); clearErrors(); setResetSent(false); }} className="text-[0.75rem] text-acc font-medium hover:underline transition-all">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input 
                    type={showPw ? "text" : "password"} 
                    placeholder="Your password" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearErrors(); }}
                    onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                    className={`w-full bg-bg border ${errors.pass ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[40px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-tx3 hover:text-tx2 transition-colors duration-150 flex items-center justify-center p-1"
                  >
                    {showPw ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                  </button>
                </div>
                {errors.pass && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter your password</div>}
              </div>

              <div className="flex items-center gap-[8px] mb-[20px] cursor-pointer" onClick={() => setRemember(!remember)}>
                <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center transition-all duration-200 ${remember ? 'bg-acc-bg border-acc text-acc' : 'bg-bg border-brd2'}`}>
                  {remember && <CheckCircle className="w-[10px] h-[10px]" strokeWidth={3} />}
                </div>
                <span className="text-[0.8rem] text-tx2 select-none">Remember me for 30 days</span>
              </div>

              <button 
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center h-[48px]"
              >
                {isLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span>Log in <ArrowRight className="inline-block w-[16px] h-[16px] ml-[2px]" /></span>}
              </button>

              <div className="flex items-center gap-[12px] my-[20px]">
                <div className="flex-1 h-[1px] bg-line" />
                <div className="text-[0.72rem] text-tx3">or continue with</div>
                <div className="flex-1 h-[1px] bg-line" />
              </div>

              <button className="w-full py-[11px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.85rem] font-medium flex items-center justify-center gap-[9px] transition-all duration-200 hover:bg-surf2 hover:border-tx3 mb-[10px]">
                <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-[0.82rem] text-tx2 mt-[20px]">
                Don't have an account? <Link href="/signup" className="text-acc font-medium no-underline hover:underline">Sign up free</Link>
              </p>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <div className="w-full max-w-[400px] animate-up">
              <button onClick={() => setView('login')} className="inline-flex items-center gap-[6px] text-tx2 hover:text-tx text-[0.82rem] font-medium transition-colors mb-[24px]">
                ← Back to login
              </button>
              
              <div className="flex items-center gap-[8px] mb-[28px]">
                <div className="w-[36px] h-[36px] bg-surf border border-brd rounded-[9px] flex items-center justify-center text-[0.95rem] font-[700] text-tx">
                  <KeyRound className="w-[18px] h-[18px] text-acc" />
                </div>
                <span className="font-geist text-[1.05rem] font-[600] tracking-[-0.03em] text-tx">Rosta<span className="text-acc">·</span></span>
              </div>
              <Heading as="h1" variant="card" className="!text-[1.55rem] !mb-[5px]">Reset password</Heading>
              <Text variant="default" className="!mb-[28px] !font-light">Enter your email and we'll send you a reset link.</Text>

              {resetSent ? (
                <div className="p-[13px_15px] bg-acc-bg border border-acc-brd rounded-[10px] text-tx2 font-light text-[0.85rem] leading-[1.6] animate-up">
                  <CheckCircle className="inline-block w-[14px] h-[14px] text-acc mr-1" />
                  Reset link sent! Check your inbox — it may take a minute.
                </div>
              ) : (
                <>
                  <div className="mb-[16px]">
                    <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                      <input 
                        type="email" 
                        placeholder="jane@clinic.com" 
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearErrors(); }}
                        onKeyDown={e => e.key === 'Enter' && handleResetSubmit()}
                        className={`w-full bg-bg border ${errors.email ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                      />
                    </div>
                    {errors.email && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter a valid email</div>}
                  </div>

                  <button 
                    onClick={handleResetSubmit}
                    disabled={isLoading}
                    className="w-full mt-[4px] py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-[0.7] disabled:pointer-events-none flex justify-center items-center h-[48px]"
                  >
                    {isLoading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <span>Send reset link <ArrowRight className="inline-block w-[16px] h-[16px] ml-[2px]" /></span>}
                  </button>
                </>
              )}

              <p className="text-center text-[0.82rem] text-tx2 mt-[24px]">
                Remembered it? <button onClick={() => setView('login')} className="text-acc font-medium hover:underline">Log in</button>
              </p>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {view === 'success' && (
            <div className="text-center py-[24px] animate-up">
              <div className="w-[68px] h-[68px] bg-acc-bg border border-acc-brd rounded-full flex items-center justify-center text-acc mx-auto mb-[20px]">
                 <CheckCircle className="w-[34px] h-[34px]" />
              </div>
              <div className="text-[1.4rem] font-[600] tracking-[-0.035em] text-tx mb-[7px]">You're logged in!</div>
              <div className="text-[0.88rem] text-tx2 font-light max-w-[280px] mx-auto mb-[24px]">Welcome back. Your schedule is ready and your team is waiting.</div>
              <Link href="/dashboard" className="inline-flex justify-center items-center px-[28px] py-[11px] rounded-[10px] bg-acc text-[#07090E] text-[0.9rem] font-[600] transition-opacity duration-200 hover:opacity-[0.86]">
                Go to dashboard <ArrowRight className="w-[16px] h-[16px] ml-[4px]" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
