"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState("attendee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.set("role", role);

    try {
      const result =
        mode === "login" ? await signIn(formData) : await signUp(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happened (success)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-[#0A0D15] border border-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-600 to-primary" />
          
          <div className="text-center space-y-4 mb-10">
            {/* Minimal Logo */}
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(255,0,122,0.2)]">
                <span className="text-3xl font-cursive font-bold text-primary leading-none mt-2">M</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">
                {mode === "login" ? "Welcome Back" : "Join the Movement"}
              </h1>
              <p className="mt-3 text-sm text-gray-400 font-medium">
                {mode === "login"
                  ? "Sign in to your account and ignite the stage"
                  : "Create an account to discover and host events"}
              </p>
            </div>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {/* Name (signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  required
                  className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white placeholder:text-gray-600 py-6"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white placeholder:text-gray-600 py-6"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white placeholder:text-gray-600 py-6 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection (signup only) */}
            {mode === "signup" && (
              <div className="space-y-2 pb-2">
                <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">I want to join as</Label>
                <Select value={role} onValueChange={(v) => setRole(v ?? "attendee")}>
                  <SelectTrigger className="bg-[#050505] border-gray-800 h-12 text-sm focus:ring-primary/50 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0D15] border-gray-800 text-white">
                    <SelectItem value="attendee" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">
                      🎫 Attendee — Discover & book events
                    </SelectItem>
                    <SelectItem value="organizer" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">
                      🎪 Organizer — Create & manage events
                    </SelectItem>
                    <SelectItem value="artist" className="focus:bg-[#111] focus:text-white cursor-pointer py-3">
                      🎭 Artist — Showcase & perform
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-500 text-center uppercase tracking-wider">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(255,0,122,0.3)] mt-2"
            >
              {loading
                ? "[ Processing ]"
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest">
            <span className="text-gray-500">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-primary hover:text-white transition-colors ml-2"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
