import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import { ASSETS } from "@/features/streamflix/data";
import type { AuthStage, RegisteredAccount } from "@/features/streamflix/types";

const authBackground = {
  background:
    "radial-gradient(circle at 88% 12%, rgba(35, 72, 137, 0.48) 0%, rgba(20, 36, 78, 0.2) 28%, transparent 58%), radial-gradient(circle at 22% 100%, rgba(76, 24, 112, 0.55) 0%, rgba(38, 17, 68, 0.24) 34%, transparent 62%), linear-gradient(135deg, #07091b 0%, #090b24 48%, #050611 100%)",
};

type LoginPageProps = {
  stage: Extract<AuthStage, "login" | "register">;
  onLogin: () => void;
  onRegister: (details: RegisteredAccount) => void;
  onShowLogin: () => void;
  onShowRegister: () => void;
};

export default function LoginPage({ stage, onLogin, onRegister, onShowLogin, onShowRegister }: LoginPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const isRegistering = stage === "register";

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    onLogin();
  }

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setFormError("");
    onRegister({ name: name.trim() || "New viewer", email, phone, dateOfBirth });
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#07091b] text-white"
      style={authBackground}
    >
      <DeferredToaster richColors position="bottom-right" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.025),transparent_42%)]" />
      <header className="relative z-10 flex items-center gap-2 px-6 py-5 sm:px-10 sm:py-8">
        <img
          src={ASSETS.logo}
          alt="StreamFlix"
          width={256}
          height={256}
          loading="eager"
          decoding="async"
          className="h-12 w-12 object-contain"
        />
        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-xl font-black tracking-tight text-transparent">
          streamflix
        </span>
      </header>
      <div className="relative z-10 flex min-h-[calc(100vh-104px)] items-center justify-center px-5 pb-16 sm:px-10">
        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#090d20]/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">
          <Badge className="mb-5 border-violet-400/25 bg-violet-500/15 text-violet-200">
            {isRegistering ? "Create your account" : "Welcome back"}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isRegistering ? "Join StreamFlix" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {isRegistering
              ? "Create an account to build profiles and start watching."
              : "Continue to your profiles, watchlist, and recommendations."}
          </p>

          <form
            onSubmit={isRegistering ? submitRegistration : submitLogin}
            className="mt-7 space-y-4"
          >
            {isRegistering && (
              <label className="block text-sm font-medium text-slate-200">
                Full name
                <Input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                />
              </label>
            )}
            {isRegistering && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-200">
                  Phone number
                  <Input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+63 917 123 4567"
                    className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-200">
                  Date of birth
                  <Input
                    required
                    type="date"
                    autoComplete="bday"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    max="2013-12-31"
                    className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white [color-scheme:dark]"
                  />
                </label>
              </div>
            )}
            <label className="block text-sm font-medium text-slate-200">
              Email address
              <Input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <Input
                required
                minLength={6}
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
              />
            </label>
            {isRegistering && (
              <label className="block text-sm font-medium text-slate-200">
                Confirm password
                <Input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                />
              </label>
            )}
            {formError && (
              <p role="alert" className="text-sm text-rose-300">
                {formError}
              </p>
            )}
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-base font-semibold text-white shadow-lg shadow-violet-950/40"
            >
              {isRegistering ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isRegistering ? "Already have an account?" : "New to StreamFlix?"}{" "}
            <button
              type="button"
              onClick={isRegistering ? onShowLogin : onShowRegister}
              className="font-semibold text-violet-300 hover:text-violet-200"
            >
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="mt-5 text-center text-xs leading-5 text-slate-600">
            Prototype access only. Account details remain on this device.
          </p>
        </section>
      </div>
    </main>
  );
}
