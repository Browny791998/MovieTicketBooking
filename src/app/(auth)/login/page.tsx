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
              DAT<span className="text-red-500">SHIN</span>
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

          <p className="text-center text-sm text-zinc-500 mt-8 font-medium">
            New to DatShin?{" "}
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
