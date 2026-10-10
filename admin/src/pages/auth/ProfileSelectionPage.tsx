import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import { ASSETS, DEFAULT_PROFILES } from "@/features/streamflix/data";
import { notify } from "@/features/streamflix/utils";
import type { ViewerProfile } from "@/features/streamflix/types";

type NewProfile = {
  name: string;
  deviceType: string;
  deviceName: string;
  avatarUrl: string;
};

const authBackground = {
  background:
    "radial-gradient(circle at 88% 12%, rgba(35, 72, 137, 0.48) 0%, rgba(20, 36, 78, 0.2) 28%, transparent 58%), radial-gradient(circle at 22% 100%, rgba(76, 24, 112, 0.55) 0%, rgba(38, 17, 68, 0.24) 34%, transparent 62%), linear-gradient(135deg, #07091b 0%, #090b24 48%, #050611 100%)",
};

type ProfileSelectionPageProps = {
  registeredName: string;
  profiles: ViewerProfile[];
  onAddProfile: (profile: NewProfile) => void;
  onDeleteProfile: (profile: ViewerProfile) => void;
  onSelectProfile: (profile: ViewerProfile) => void;
  onShowLogin: () => void;
};

export default function ProfileSelectionPage({ registeredName, profiles, onAddProfile, onDeleteProfile, onSelectProfile, onShowLogin }: ProfileSelectionPageProps) {
  const [manageProfiles, setManageProfiles] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState("adult");
  const [newDeviceType, setNewDeviceType] = useState("TV");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newProfileAvatar, setNewProfileAvatar] = useState(DEFAULT_PROFILES[1].image);

    const displayProfiles = profiles.map((profile, index) =>
      index === 0 && registeredName !== "Alex"
        ? {
            ...profile,
            name: registeredName.split(" ")[0],
            initials: registeredName.trim().slice(0, 1).toUpperCase() || "N",
          }
        : profile,
    );

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050711] px-6 py-20 text-white">
        <DeferredToaster richColors position="bottom-right" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_42%)]" />
        <img
          src={ASSETS.logo}
          alt="StreamFlix"
          width={256}
          height={256}
          loading="eager"
          decoding="async"
          className="absolute left-6 top-5 h-12 w-12 object-contain sm:left-10 sm:top-8"
        />
        <section className="relative w-full max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-violet-300">
            Choose a profile
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Who&apos;s watching?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
            Your recommendations, favorites, and watch history stay separate for
            every profile.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {displayProfiles.map((profile, index) => (
              <div key={profile.id} className="group relative text-center">
                <button
                  type="button"
                  onClick={() => !manageProfiles && onSelectProfile(profile)}
                  className="w-full text-center focus:outline-none"
                >
                <span
                  className="relative mx-auto block aspect-square w-full max-w-36 overflow-hidden rounded-2xl border-2 border-transparent bg-[#11172d] shadow-2xl shadow-black/30 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:border-white group-focus-visible:border-violet-300"
                >
                  <img
                    src={profile.image}
                    alt={`${profile.name} profile`}
                    width={256}
                    height={256}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5" />
                  {profile.isKids && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur">
                      Kids
                    </span>
                  )}
                </span>
                <span className="mt-3 block text-sm font-medium text-slate-400 transition group-hover:text-white sm:text-base">
                  {profile.name}
                </span>
                {manageProfiles && (
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    <span className="block text-slate-400">
                      {profile.deviceType} — {profile.deviceName}
                    </span>
                    <span className="block">Added {profile.addedAt}</span>
                  </span>
                )}
                </button>
                {manageProfiles && index > 0 && (
                  <button
                    type="button"
                    onClick={() => onDeleteProfile(profile)}
                    aria-label={`Delete ${profile.name} profile`}
                    className="absolute right-1 top-1 grid size-9 place-items-center rounded-full border border-white/15 bg-black/70 text-rose-300 backdrop-blur hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAddProfileOpen(true)}
              className="group text-center focus:outline-none"
            >
              <span className="mx-auto grid aspect-square w-full max-w-36 place-items-center rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.035] text-slate-400 transition group-hover:-translate-y-1 group-hover:border-violet-300 group-hover:text-white">
                <Plus className="size-12" />
              </span>
              <span className="mt-3 block text-sm font-medium text-slate-400 group-hover:text-white">
                Add profile
              </span>
            </button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setManageProfiles((value) => !value)}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              {manageProfiles ? "Done managing" : "Manage profiles"}
            </Button>
            <button
              type="button"
              onClick={onShowLogin}
              className="px-4 text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
            >
              Use a different account
            </button>
          </div>
        </section>
        <Dialog open={addProfileOpen} onOpenChange={setAddProfileOpen}>
          <DialogContent className="border-white/10 bg-[#0a0f23] text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add a profile</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a separate space for recommendations and watch history.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-200">
                Profile name
                <Input
                  value={newProfileName}
                  onChange={(event) => setNewProfileName(event.target.value)}
                  placeholder="Profile name"
                  className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white"
                />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                Profile type
                <Select value={newProfileType} onValueChange={setNewProfileType}>
                  <SelectTrigger className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-slate-200">
                  Device type
                  <Select value={newDeviceType} onValueChange={setNewDeviceType}>
                    <SelectTrigger className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TV">TV</SelectItem>
                      <SelectItem value="iPad">iPad</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="block text-sm font-medium text-slate-200">
                  Device name
                  <Input
                    required
                    value={newDeviceName}
                    onChange={(event) => setNewDeviceName(event.target.value)}
                    placeholder="Sony BRAVIA"
                    className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Choose avatar</p>
                <div className="mt-2 flex gap-3">
                  {DEFAULT_PROFILES.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setNewProfileAvatar(avatar.image)}
                      className={`overflow-hidden rounded-xl border-2 ${newProfileAvatar === avatar.image ? "border-violet-400" : "border-transparent"}`}
                    >
                      <img
                        src={avatar.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                disabled={!newProfileName.trim() || !newDeviceName.trim()}
                onClick={() => {
                  const cleanName = newProfileName.trim();
                  onAddProfile({
                    name: cleanName,
                    deviceType: newDeviceType,
                    deviceName: newDeviceName.trim(),
                    avatarUrl: newProfileAvatar,
                  });
                  setNewProfileName("");
                  setNewDeviceName("");
                  setAddProfileOpen(false);
                  void notify("success", `${cleanName} profile added`);
                }}
                className="bg-violet-600 text-white hover:bg-violet-500"
              >
                <Plus className="size-4" /> Add profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    );
}
