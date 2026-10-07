import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, Pencil, Plus, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import type { AuthStage, BackendPlan, RegisteredAccount, SubscriptionReceipt, ViewerProfile } from "../types";
import { detectDevice } from "@/features/profiles/utils";
// import { AvatarPicker } from "@/features/profiles/components/AvatarPicker";
import { AvatarPicker } from "@/features/profiles/components/AvatarPicker";
import { backendAsset } from "@/lib/backend-asset";
import SubscriptionPaymentPage from "@/features/subscriptions/components/SubscriptionPayment";

export default function AuthFlow({ stage, authBusy, authError, setAuthError, registeredName, profiles, plans, currentPlan, maxProfiles, onLogin, onGoogle, onRegister, onSelectPlan, onSubscriptionPaid, onAddProfile, onDeleteProfile, onEditProfile, onShowLogin, onShowRegister, onBackToPlans, onSelectProfile }: { stage: AuthStage; authBusy: boolean; authError: string; setAuthError: (value: string) => void; registeredName: string; profiles: ViewerProfile[]; plans: BackendPlan[]; currentPlan: string; maxProfiles: number; onLogin: (email: string, password: string) => Promise<void>; onGoogle: () => Promise<void>; onRegister: (details: RegisteredAccount, password: string) => Promise<boolean>; onSelectPlan: (id: string) => Promise<void>; onSubscriptionPaid: (receipt: SubscriptionReceipt) => void; onAddProfile: (data: { name: string; deviceType: string; deviceName: string; avatarUrl: string | null }) => Promise<void>; onDeleteProfile: (profile: ViewerProfile) => Promise<void>; onEditProfile: (profile: ViewerProfile, data: { profile_name?: string; avatar_url?: string | null; device?: string | null }) => Promise<unknown>; onShowLogin: () => void; onShowRegister: () => void; onBackToPlans: () => void; onSelectProfile: (profile: ViewerProfile) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || plans[0]?.id || "");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const detectedDevice = detectDevice();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<ViewerProfile | null>(null);
  const [editProfileName, setEditProfileName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const background = { background: "radial-gradient(circle at 88% 12%, rgba(35,72,137,.48) 0%, rgba(20,36,78,.2) 28%, transparent 58%), radial-gradient(circle at 22% 100%, rgba(76,24,112,.55) 0%, rgba(38,17,68,.24) 34%, transparent 62%), linear-gradient(135deg,#07091b 0%,#090b24 48%,#050611 100%)" };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    if (!email.trim() || !password || email.trim().length > 254 || password.length > 128) { setAuthError("Enter a valid email and password."); return; }
    try {
      await onLogin(email, password);
    } catch {}
  };

  const submitRegister = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    if (name.trim().length < 2 || name.trim().length > 50 || email.trim().length > 254 || password.length < 8 || password.length > 128) {
      setAuthError("Check your name, email, and password length.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    try {
      await onRegister({ name: name.trim(), email: email.trim(), phone: phone.trim(), dateOfBirth }, password);
    } catch {}
  };

  const submitPlan = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await onSelectPlan(selectedPlan);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to activate plan");
    }
  };

  const openEditProfile = (profile: ViewerProfile) => {
    setEditingProfile(profile);
    setEditProfileName(profile.name);
    setEditAvatarUrl(profile.image);
    setAuthError("");
  };

  const submitEditProfile = async () => {
    if (!editingProfile || editProfileName.trim().length < 2) return;
    try {
      setEditSaving(true);
      setAuthError("");
      await onEditProfile(editingProfile, {
        profile_name: editProfileName.trim(),
        avatar_url: editAvatarUrl.trim() || null,
        device: `${editingProfile.deviceType} • ${editingProfile.deviceName}`,
      });
      setEditingProfile(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setEditSaving(false);
    }
  };

  const submitProfile = async () => {
    try {
      await onAddProfile({
        name: profileName.trim(),
        deviceType: detectedDevice.type,
        deviceName: detectedDevice.name,
        avatarUrl
      });
      setProfileDialogOpen(false);
      setProfileName("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to create profile");
    }
  };

  if (stage === "login") return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07091b] px-5 text-white" style={background}><DeferredToaster richColors position="bottom-right" /><section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#090d20]/90 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9"><div className="text-center"><img src={backendAsset("/streamflix/logo-optimized.webp")} alt="StreamFlix" className="mx-auto size-16 object-contain" /><p className="mt-3 text-xs font-semibold uppercase tracking-[.3em] text-violet-300">StreamFlix</p><h1 className="mt-2 text-3xl font-black">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in with your Supabase account.</p></div><form className="mt-8 space-y-4" onSubmit={submitLogin}><label className="block text-sm">Email<Input type="email" autoComplete="email" required value={email} maxLength={254} onChange={(e) => setEmail(e.target.value.slice(0, 254))} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label><label className="block text-sm">Password<div className="relative mt-2"><Input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} maxLength={128} onChange={(e) => setPassword(e.target.value.slice(0, 128))} className="h-12 border-white/10 bg-white/[.05] pr-12 text-white" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>{authError && <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{authError}</p>}<Button disabled={authBusy} type="submit" className="h-12 w-full bg-violet-600 text-white hover:bg-violet-500">{authBusy ? "Signing in…" : "Sign in"}</Button><div className="relative py-1 text-center text-xs text-slate-600"><span className="relative z-10 bg-[#090d20] px-2">or</span><span className="absolute inset-x-0 top-1/2 h-px bg-white/8" /></div><Button disabled={authBusy} type="button" onClick={() => void onGoogle()} variant="outline" className="h-12 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">Continue with Google</Button></form><div className="mt-6 flex items-center justify-between gap-4 text-sm"><span className="text-slate-500">New to StreamFlix?</span><button type="button" onClick={onShowRegister} className="font-semibold text-violet-300 hover:text-violet-200">Create account</button></div><div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600"><ShieldCheck className="size-4" /> Authentication is handled by Supabase</div></section></main>;

  if (stage === "register") return <main className="relative min-h-screen overflow-hidden bg-[#07091b] px-5 py-8 text-white" style={background}><DeferredToaster richColors position="bottom-right" /><div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-lg items-center"><section className="w-full rounded-3xl border border-white/10 bg-[#090d20]/90 p-7 shadow-2xl shadow-black/50 sm:p-9"><div className="text-center"><img src={backendAsset("/streamflix/logo-optimized.webp")} alt="StreamFlix" className="mx-auto size-14 object-contain" /><h1 className="mt-3 text-3xl font-black">Create your account</h1><p className="mt-2 text-sm text-slate-400">The account is created by Supabase Auth. Your StreamFlix profile is bootstrapped by the backend.</p></div><form className="mt-7 space-y-4" onSubmit={submitRegister}><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm sm:col-span-2">Full name<Input required value={name} maxLength={50} onChange={(e) => setName(e.target.value.slice(0, 50))} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label><label className="block text-sm sm:col-span-2">Email<Input required type="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value.slice(0, 254))} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label><label className="block text-sm">Phone<Input value={phone} maxLength={30} onChange={(e) => setPhone(e.target.value.slice(0, 30))} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label><label className="block text-sm">Date of birth<Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label><label className="block text-sm">Password<Input required minLength={8} maxLength={128} type="password" value={password} onChange={(e) => setPassword(e.target.value.slice(0, 128))} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label><label className="block text-sm">Confirm password<Input required minLength={8} type="password" value={confirmPassword} maxLength={128} onChange={(e) => setConfirmPassword(e.target.value.slice(0, 128))} className="mt-2 h-12 border-white/10 bg-white/[.05] text-white" /></label></div>{authError && <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{authError}</p>}<Button disabled={authBusy} type="submit" className="h-12 w-full bg-violet-600 text-white hover:bg-violet-500">{authBusy ? "Creating account…" : "Create account"}</Button></form><button type="button" onClick={onShowLogin} className="mt-5 w-full text-center text-sm text-slate-500 hover:text-slate-300">Already have an account? Sign in</button></section></div></main>;

  if (stage === "subscription-payment") {
    return (
      <SubscriptionPaymentPage
        currentPlan={currentPlan}
        plans={plans}
        onBackToPlans={onBackToPlans}
        onSubscriptionPaid={onSubscriptionPaid}
      />
    );
  }

  if (stage === "plans") return <main className="relative min-h-screen overflow-hidden bg-[#07091b] px-5 py-8 text-white" style={background}><DeferredToaster richColors position="bottom-right" /><section className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl flex-col justify-center"><div className="text-center"><Badge className="border-violet-400/25 bg-violet-500/15 text-violet-200">Subscription</Badge><h1 className="mt-4 text-3xl font-black sm:text-5xl">Choose your StreamFlix plan</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">{registeredName || "Your account"}, plans and prices below come directly from the backend.</p></div><form onSubmit={submitPlan} className="mt-9 grid gap-4 md:grid-cols-3">{plans.map((item) => <button key={item.id} type="button" onClick={() => setSelectedPlan(item.id)} className={`rounded-3xl border p-6 text-left ${selectedPlan === item.id ? "border-violet-400 bg-violet-500/10" : "border-white/10 bg-white/[.03] hover:border-white/20"}`}><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{item.name}</h2>{selectedPlan === item.id && <Badge className="bg-violet-600 text-white">Selected</Badge>}</div><p className="mt-5 text-4xl font-black">₱{item.price.toLocaleString()}<span className="text-sm font-normal text-slate-500">/mo</span></p><div className="mt-5 space-y-3 text-sm text-slate-300"><p className="flex gap-2"><Check className="size-4 text-emerald-400" />{item.quality} streaming</p><p className="flex gap-2"><UsersRound className="size-4 text-violet-300" />{item.memberText}</p><p className="flex gap-2"><Check className="size-4 text-emerald-400" />Backend subscription record</p></div></button>)}<div className="md:col-span-3 mx-auto w-full max-w-md"><Button disabled={authBusy || !selectedPlan} className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white">Continue with selected plan</Button><button type="button" onClick={onShowLogin} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-300">Use a different account</button></div></form>{authError && <p className="mx-auto mt-4 max-w-md rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{authError}</p>}</section></main>;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07091b] px-5 py-8 text-white" style={background}>
      <DeferredToaster richColors position="bottom-right" />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl flex-col justify-center">
        <div className="text-center">
          <Badge className="border-violet-400/25 bg-violet-500/15 text-violet-200">Choose profile</Badge>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">Who’s watching?</h1>
          <p className="mt-2 text-sm text-slate-400">Signed in as {registeredName}</p>
        </div>
        {authError && <p className="mx-auto mt-5 max-w-lg rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{authError}</p>}
        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="group">
              <button type="button" onClick={() => onSelectProfile(profile)} className="w-full text-left">
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/[.04] transition group-hover:-translate-y-1 group-hover:border-violet-400/60">
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                  {profile.isKids && <Badge className="absolute left-3 top-3 bg-amber-500/90 text-slate-950">Kids</Badge>}
                </div>
                <p className="mt-3 font-semibold">{profile.name}</p>
                <p className="mt-1 text-xs text-slate-500">{profile.deviceName}</p>
              </button>
              <div className="mt-2 flex items-center gap-3">
                <button type="button" onClick={() => openEditProfile(profile)} className="text-xs font-medium text-violet-300 hover:text-violet-200"><Pencil className="mr-1 inline size-3" />Edit</button>
                <button type="button" onClick={() => onDeleteProfile(profile)} className="text-xs text-slate-600 hover:text-rose-300"><Trash2 className="mr-1 inline size-3" />Delete</button>
              </div>
            </div>
          ))}
          <button type="button" disabled={profiles.length >= maxProfiles} onClick={() => setProfileDialogOpen(true)} className={`flex aspect-square flex-col items-center justify-center rounded-3xl border border-dashed bg-white/[.02] ${profiles.length >= maxProfiles ? "cursor-not-allowed border-white/10 text-slate-600" : "border-white/15 text-slate-400 hover:border-violet-400/50 hover:text-violet-300"}`}>
            <Plus className="size-8" />
            <span className="mt-2 text-sm font-semibold">{profiles.length >= maxProfiles ? "Profile limit reached" : "Add profile"}</span>
          </button>
        </div>
        <button type="button" onClick={onShowLogin} className="mx-auto mt-8 text-sm text-slate-500 hover:text-white">Use a different account</button>
      </section>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="border-white/10 bg-[#0a0f23] text-white">
          <DialogHeader>
            <DialogTitle>Add a profile</DialogTitle>
            <DialogDescription className="text-slate-400">The new profile will be created in the backend profiles table.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm">
              Profile name
              <Input minLength={2} maxLength={20} value={profileName} onChange={(e) => setProfileName(e.target.value.slice(0, 20))} className="mt-2 border-white/10 bg-white/5 text-white" />
              <span className="mt-1 block text-right text-[10px] text-slate-600">{profileName.length}/20</span>
            </label>
            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">Detected device</p>
              <p className="mt-2 text-sm font-semibold text-white">{detectedDevice.name}</p>
              <p className="mt-1 text-xs text-slate-500">Automatically detected • not editable</p>
            </div>
            <div>
              <p className="text-sm">Choose avatar</p>
              <p className="mt-1 text-xs text-slate-500">Select one of the available StreamFlix avatars. Hover an avatar to preview that specific card.</p>
              <div className="mt-3"><AvatarPicker value={avatarUrl} onChange={setAvatarUrl} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)} className="border-white/15 bg-white/5 text-white">Cancel</Button>
            <Button disabled={profileName.trim().length < 2 || !avatarUrl} onClick={() => void submitProfile()} className="bg-violet-600 text-white">Create profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingProfile)} onOpenChange={(open) => { if (!open) setEditingProfile(null); }}>
        <DialogContent className="border-white/10 bg-[#0a0f23] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription className="text-slate-400">Update the profile name or avatar. Changes are saved to your StreamFlix profile.</DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-5">
              <label className="block text-sm">
                Profile name
                <Input minLength={2} maxLength={20} value={editProfileName} onChange={(e) => setEditProfileName(e.target.value.slice(0, 20))} className="mt-2 border-white/10 bg-white/5 text-white" />
                <span className="mt-1 block text-right text-[10px] text-slate-600">{editProfileName.trim().length}/20</span>
              </label>
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                <p className="text-xs uppercase tracking-widest text-slate-500">Device</p>
                <p className="mt-2 text-sm font-semibold text-white">{editingProfile.deviceName}</p>
                <p className="mt-1 text-xs text-slate-500">{editingProfile.deviceType} • detected automatically</p>
              </div>
              <div>
                <p className="text-sm">Choose avatar</p>
                <div className="mt-3"><AvatarPicker value={editAvatarUrl} onChange={setEditAvatarUrl} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)} disabled={editSaving} className="border-white/15 bg-white/5 text-white">Cancel</Button>
            <Button disabled={editSaving || editProfileName.trim().length < 2 || !editAvatarUrl} onClick={() => void submitEditProfile()} className="bg-violet-600 text-white">{editSaving ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}