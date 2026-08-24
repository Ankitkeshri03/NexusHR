import { useState } from "react";
import type { FormEvent } from "react";
import { Building2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";

const LoginPage = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isSuccess =
        mode === "login"
          ? await login(email, password)
          : await signup({ username, email, password, phoneNumber });

      if (!isSuccess) {
        toast.error(
          mode === "login"
            ? "Invalid email or password"
            : "Unable to create account"
        );
        return;
      }

      toast.success(
        mode === "login"
          ? "Login successful"
          : "Account created successfully"
      );
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1120] via-[#111827] to-[#1E1B4B] p-6">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl"></div>

      <Card className="relative w-full max-w-5xl p-0 overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.25)] rounded-3xl">
        <div className="grid md:grid-cols-2 ">
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-violet-600 to-purple-900 p-10 text-white">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-white/20">
                  <Building2 size={28} />
                </div>

                <h1 className="text-3xl font-bold tracking-wide">
                  NexusHR
                </h1>
              </div>

              <h2 className="text-4xl font-bold leading-tight mb-4">
                Manage Your Workforce Smarter
              </h2>

              <p className="text-white/80 text-lg leading-relaxed">
                Streamline employee management, attendance, payroll,
                departments, and more with a modern HR solution.
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                Secure HR Management Platform
              </div>
            </div>
          </div>

          <CardContent className="p-8 md:p-12 bg-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome Back 👋
              </h2>

              <p className="text-slate-500 mt-2">
                {mode === "login"
                  ? "Login to continue managing your organization."
                  : "Create your account to start using NexusHR."}
              </p>
            </div>

            <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label className="text-slate-700">Username</Label>
                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-violet-500"
                      required={mode === "signup"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-700">Email Address</Label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-violet-500"
                    required
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label className="text-slate-700">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="Optional phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-violet-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700">Password</Label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-violet-600 hover:text-violet-700"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-violet-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold text-base shadow-lg"
              >
                {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
              © 2025 NexusHR. All rights reserved.
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
