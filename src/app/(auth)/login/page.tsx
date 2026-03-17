"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background — movie poster collage */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <Image
          src="/login-bg.png"
          alt="Cinema background"
          fill
          className="object-cover object-center scale-110 blur-[2px]"
          priority
          onError={() => { }}
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-zinc-950/40" />
      </div>

      {/* Floating Blobs for Liquid Feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[20%] -right-[10%] w-[35%] h-[35%] bg-zinc-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[440px] mx-4 py-12">
        {/* Logo */}
        <div className="mb-10 text-center scale-110">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 group-hover:from-red-500 group-hover:to-red-700 transition-all duration-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <Film className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
              CINEMA<span className="text-red-500">PASS</span>
            </span>
          </Link>
          <p className="text-zinc-400 font-medium tracking-wide text-xs uppercase opacity-80">Experience cinema like never before</p>
        </div>

        {/* Card */}
        <div className="glass-card liquid-border rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-400 text-sm mb-8 font-medium">Log in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 focus:ring-red-600/20 h-13 rounded-2xl text-white placeholder:text-zinc-600 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                  Password
                </label>
                <button type="button" className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-400 transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 focus:ring-red-600/20 h-13 rounded-2xl text-white placeholder:text-zinc-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-base font-black bg-red-600 hover:bg-red-700 rounded-2xl shadow-[0_8px_20px_-4px_rgba(220,38,38,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] whitespace-nowrap">Secure Login</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="flex items-center justify-center gap-3 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all duration-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.63 4.59 1.67l3.43-3.43A11.97 11.97 0 0 0 12 1C8.13 1 4.73 3.03 2.69 6.08l2.58 3.68Z" />
                <path fill="#34A853" d="M16.04 18.01A7.06 7.06 0 0 1 12 19.1c-2.84 0-5.28-1.67-6.48-4.12l-2.83 2.18A11.97 11.97 0 0 0 12 23c2.9 0 5.59-1.04 7.65-2.77l-3.61-2.22Z" />
                <path fill="#4A90D9" d="M19.65 20.23A11.96 11.96 0 0 0 23 13c0-.84-.09-1.65-.25-2.44H12v4.89h6.2a5.2 5.2 0 0 1-2.16 3.34l3.61 2.44Z" />
                <path fill="#FBBC05" d="M5.52 14.98A7.1 7.1 0 0 1 4.9 12c0-.69.1-1.36.27-2L2.59 6.32A11.93 11.93 0 0 0 1 12c0 1.96.47 3.82 1.3 5.46l3.22-2.48Z" />
              </svg>
              Google
            </button>
            <button
              className="flex items-center justify-center gap-3 h-12 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all duration-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.84 9.49.5.09.68-.22.68-.485v-1.698c-2.782.603-3.37-1.34-3.37-1.34-.455-1.157-1.11-1.464-1.11-1.464-.907-.62.07-.608.07-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.912.832.09-.647.35-1.087.636-1.338-2.22-.252-4.555-1.11-4.555-4.944 0-1.091.39-1.984 1.03-2.683-.104-.253-.448-1.27.096-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.91-1.294 2.748-1.026 2.748-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.308.678.916.678 1.846v2.738c0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-sm text-zinc-500 mt-10 font-medium">
            New to CinemaPass?{" "}
            <Link href="/register" className="text-red-500 hover:text-red-400 font-black transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-8 text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
          <button className="hover:text-zinc-400 transition-colors">Privacy</button>
          <button className="hover:text-zinc-400 transition-colors">Terms</button>
          <button className="hover:text-zinc-400 transition-colors">Support</button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse rounded-full h-10 w-10 bg-red-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
