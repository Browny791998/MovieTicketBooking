"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Mail, Lock, User, Eye, EyeOff, Check, Phone } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "At least 2 characters"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await axios.post("/api/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data?.error;
        if (typeof errData === "object" && errData?.email) {
          setError(errData.email[0]);
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <Image
          src="/register-bg.png"
          alt="Cinema background"
          fill
          className="object-cover object-center scale-110 blur-[1px]"
          priority
          onError={() => { }}
        />
        <div className="absolute inset-0 bg-zinc-950/20" />
      </div>

      {/* Floating Blobs for Liquid Feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -right-[5%] w-[45%] h-[45%] bg-red-600/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-zinc-600/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-7s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] mx-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <Film className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
              CINEMA<span className="text-red-500">PASS</span>
            </span>
          </Link>
          <p className="text-zinc-400 font-medium tracking-widest text-[10px] uppercase opacity-70">Join the ultimate cinematic experience</p>
        </div>

        {/* Card */}
        <div className="glass-card liquid-border rounded-[32px] p-8 lg:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <Input {...register("name")} placeholder="John Doe" className="pl-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 h-12 rounded-2xl text-white placeholder:text-zinc-600" />
                </div>
                {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name.message}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <Input {...register("phone")} placeholder="+1 (555) 000-0000" className="pl-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 h-12 rounded-2xl text-white placeholder:text-zinc-600" />
                </div>
                {errors.phone && <p className="text-xs text-red-400 ml-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                <Input {...register("email")} type="email" placeholder="name@example.com" className="pl-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 h-12 rounded-2xl text-white placeholder:text-zinc-600" />
              </div>
              {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <Input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-12 pr-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 h-12 rounded-2xl text-white placeholder:text-zinc-600" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <Input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="••••••••" className="pl-12 pr-12 bg-white/[0.03] border-white/10 focus:border-red-600/50 h-12 rounded-2xl text-white placeholder:text-zinc-600" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password.message}</p>}
            {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>}

            {/* Terms */}
            <div className="flex items-center gap-3 py-2 px-1">
              <input type="checkbox" required id="terms" className="h-5 w-5 rounded-lg border-white/10 bg-white/5 accent-red-600 cursor-pointer transition-all" />
              <label htmlFor="terms" className="text-[11px] text-zinc-400 cursor-pointer font-medium leading-tight">
                I agree to the <span className="text-red-500 font-bold hover:underline">Terms & Privacy</span>
              </label>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">{error}</div>
            )}

            <Button type="submit" className="w-full h-14 text-base font-black bg-red-600 hover:bg-red-700 rounded-2xl shadow-[0_8px_20px_-4px_rgba(220,38,38,0.5)] transition-all hover:scale-[1.01] uppercase tracking-widest" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Start Experience"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-8 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-red-500 hover:text-red-400 font-black transition-colors">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} CinemaPass Ent. All rights reserved.
        </div>
      </div>
    </div>
  );
}
