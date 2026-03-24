"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export default function Signup() {
  const [showPw, setShowPw] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [form, setForm] = React.useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
  });

  const getStrengthScore = (val: string) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getStrengthScore(password);
  const levels = ['weak', 'fair', 'good', 'good'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const cls = score > 0 ? levels[score - 1] : 'weak';

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => v.replace(/\D/g, '').length >= 10;

  const handleSubmit = () => {
    const newErrs: Record<string, boolean> = {
      fname: !form.fname.trim(),
      lname: !form.lname.trim(),
      email: !validateEmail(form.email),
      phone: !validatePhone(form.phone),
      pass: password.length < 8,
    };
    setErrors(newErrs);
    if (!Object.values(newErrs).some(Boolean)) {
      setIsSuccess(true);
    }
  };

  return (
    <main className="min-h-[100svh] flex flex-col relative bg-bg text-tx transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-[40px] h-[58px] bg-nav backdrop-blur-[18px] saturate-[140%] border-b border-brd transition-all duration-300">
        <Link href="/" className="font-geist font-[600] text-[1.15rem] tracking-[-0.03em] text-tx transition-colors duration-300 no-underline">
          Rosta<span className="text-acc">·</span>
        </Link>
        <div className="flex gap-[8px] items-center">
          <ThemeToggle />
          <Link href="/login" className="text-tx2 no-underline text-[0.84rem] font-medium transition-colors duration-150 hover:text-tx hidden sm:block mr-2">
            Already have an account?
          </Link>
          <Link href="/login" className="px-[16px] py-[6px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.84rem] font-medium transition-colors duration-200 hover:bg-surf2 focus:outline-none flex items-center justify-center">
            Log in
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col justify-start items-center p-6 md:p-[40px_24px_60px] pt-[84px] md:pt-[100px] relative z-10 w-full min-h-[100svh]">
        <div className="w-full max-w-[400px] my-auto relative z-20 animate-up">
          <div className="flex items-center gap-[8px] mb-[28px]">
            <div className="w-[36px] h-[36px] bg-acc rounded-[9px] flex items-center justify-center text-[0.8rem] font-[700] text-[#07090E]">R·</div>
            <span className="font-geist text-[1.1rem] font-[600] tracking-[-0.03em] text-tx">Rosta<span className="text-acc">·</span></span>
          </div>

          {!isSuccess ? (
            <>
              <Heading as="h1" variant="card" className="!text-[1.5rem] !mb-[6px]">Create your account</Heading>
              <Text variant="default" className="!mb-[28px] !font-light">Get your team scheduled in minutes.</Text>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mb-[16px]">
                <div>
                  <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">First name</label>
                  <div className="relative">
                    <User className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      value={form.fname}
                      onChange={e => { setForm({...form, fname: e.target.value}); setErrors({...errors, fname: false}); }}
                      className={`w-full bg-bg border ${errors.fname ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                    />
                  </div>
                  {errors.fname && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter your first name</div>}
                </div>
                <div>
                  <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Last name</label>
                  <div className="relative">
                    <User className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                    <input 
                      type="text" 
                      placeholder="Smith" 
                      value={form.lname}
                      onChange={e => { setForm({...form, lname: e.target.value}); setErrors({...errors, lname: false}); }}
                      className={`w-full bg-bg border ${errors.lname ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                    />
                  </div>
                  {errors.lname && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter your last name</div>}
                </div>
              </div>

              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input 
                    type="email" 
                    placeholder="jane@clinic.com" 
                    value={form.email}
                    onChange={e => { setForm({...form, email: e.target.value}); setErrors({...errors, email: false}); }}
                    className={`w-full bg-bg border ${errors.email ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                  />
                </div>
                {errors.email && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter a valid email</div>}
              </div>

              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    value={form.phone}
                    onChange={e => { setForm({...form, phone: e.target.value}); setErrors({...errors, phone: false}); }}
                    className={`w-full bg-bg border ${errors.phone ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-brd2 focus:border-acc'} rounded-[10px] py-[11px] pr-[13px] pl-[38px] text-[0.88rem] text-tx outline-none transition-all duration-200 focus:ring-[3px] focus:ring-acc-brd`}
                  />
                </div>
                {errors.phone && <div className="text-[0.72rem] text-red-500 mt-[5px]">Please enter a valid phone number</div>}
              </div>

              <div className="mb-[16px]">
                <label className="block text-[0.78rem] font-medium text-tx2 mb-[6px] tracking-[0.01em]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-tx3" />
                  <input 
                    type={showPw ? "text" : "password"} 
                    placeholder="Min. 8 characters" 
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors({...errors, pass: false}); }}
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
                {password.length > 0 && (
                  <div className="mt-[8px]">
                    <div className="flex gap-[3px] mb-[5px]">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 h-[3px] rounded-[2px] transition-colors duration-300 ${i <= score ? (cls === 'weak' ? 'bg-red-500' : cls === 'fair' ? 'bg-orange-400' : 'bg-acc') : 'bg-brd2'}`} />
                      ))}
                    </div>
                    {score > 0 && <div className={`text-[0.7rem] ${score >= 3 ? 'text-acc' : score === 2 ? 'text-orange-400' : 'text-red-500'}`}>{labels[score - 1]}</div>}
                  </div>
                )}
                {errors.pass && <div className="text-[0.72rem] text-red-500 mt-[5px]">Password must be at least 8 characters</div>}
              </div>

              <div className="flex items-center gap-[12px] my-[20px]">
                <div className="flex-1 h-[1px] bg-brd" />
                <div className="text-[0.72rem] text-tx3">or sign up with</div>
                <div className="flex-1 h-[1px] bg-brd" />
              </div>

              <button className="w-full py-[10px] rounded-[10px] border border-brd2 bg-transparent text-tx text-[0.85rem] font-medium flex items-center justify-center gap-[9px] transition-all duration-200 hover:bg-surf2 hover:border-tx3 mb-[20px]">
                <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button 
                onClick={handleSubmit}
                className="w-full py-[12px] rounded-[10px] bg-acc text-[#07090E] text-[0.95rem] font-[600] tracking-[-0.01em] transition-all duration-200 hover:opacity-[0.86] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-[4px]"
              >
                Create account <ArrowRight className="w-[17px] h-[17px]" />
              </button>

              <p className="text-[0.72rem] text-tx3 text-center mt-[16px] leading-[1.6]">
                By signing up you agree to our <Link href="#" className="text-tx2 underline underline-offset-2 hover:text-tx">Terms of Service</Link> and <Link href="#" className="text-tx2 underline underline-offset-2 hover:text-tx">Privacy Policy</Link>.
              </p>
              
              <p className="text-center text-[0.82rem] text-tx2 mt-[20px]">
                Already have an account? <Link href="/login" className="text-acc font-medium no-underline hover:underline">Log in</Link>
              </p>
            </>
          ) : (
            <div className="text-center py-[16px] animate-up">
              <div className="w-[64px] h-[64px] bg-acc-bg border border-acc-brd rounded-full flex items-center justify-center text-acc mx-auto mb-[20px]">
                <CheckCircle className="w-[32px] h-[32px]" />
              </div>
              <div className="text-[1.3rem] font-[600] tracking-[-0.03em] text-tx mb-[8px]">Account created!</div>
              <div className="text-[0.88rem] text-tx2 font-light max-w-[280px] mx-auto mb-[24px]">Welcome to Rosta. Let's get your team set up.</div>
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
