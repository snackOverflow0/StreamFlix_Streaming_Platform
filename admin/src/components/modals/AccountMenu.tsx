import { useState } from "react";
import {
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Plus,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DEFAULT_PROFILES, PLANS } from "@/features/streamflix/data";
import { getProfileRole, notify } from "@/features/streamflix/utils";
import type { RegisteredAccount, ViewerProfile } from "@/features/streamflix/types";

export function AccountMenu({
  open,
  onOpenChange,
  profile,
  profiles,
  account,
  plan,
  onPlans,
  onFeedback,
  onSwitchProfiles,
  onSignOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ViewerProfile | null;
  profiles: ViewerProfile[];
  account: RegisteredAccount;
  plan: string;
  onPlans: () => void;
  onFeedback: () => void;
  onSwitchProfiles: () => void;
  onSignOut: () => void;
}) {
  const [subscriptionDetailsOpen, setSubscriptionDetailsOpen] = useState(false);
  const [settingsProfile, setSettingsProfile] = useState<ViewerProfile | null>(null);
  const subscription = {
    subscriptionUserId: "USR-2026-0828-ALEX",
    planId: plan.toLowerCase().replace(/\s+/g, "-"),
    startDate: "August 28, 2026",
    endDate: "September 27, 2026",
    status: "Active",
    createdAt: "August 28, 2026 at 6:42 PM",
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-white/10 bg-[#0a0f23] text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/8 p-6">
          <SheetTitle className="text-xl text-white">
            Account & profiles
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Manage members, your profile, and subscription.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex items-center gap-4">
            <img
              src={profile?.image ?? DEFAULT_PROFILES[0].image}
              alt={profile?.name ?? "Viewer"}
              width={128}
              height={128}
              loading="lazy"
              decoding="async"
              className="size-16 rounded-2xl object-cover"
            />
            <div>
              <p className="font-bold">{profile?.name ?? "Viewer"}</p>
              <p className="text-sm text-slate-400">
                {profile ? getProfileRole(profile) : "Main profile"}
              </p>
            </div>
          </div>
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Member profiles
            </h3>
            <div className="space-y-2">
              {profiles.map((memberProfile) => (
                <button
                  type="button"
                  onClick={() => setSettingsProfile(memberProfile)}
                  key={memberProfile.id}
                  className="rise-hover flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"
                >
                  <img
                    src={memberProfile.image}
                    alt={`${memberProfile.name} profile`}
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="size-10 rounded-lg object-cover"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      {memberProfile.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {getProfileRole(memberProfile)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-slate-600" />
                </button>
              ))}
            </div>
            <Button
              type="button"
              onClick={onSwitchProfiles}
              variant="outline"
              className="mt-3 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Plus className="size-4" /> Manage profiles
            </Button>
          </section>
          <section className="rounded-2xl border border-violet-400/20 bg-violet-500/8 p-4">
            <p className="text-xs uppercase tracking-widest text-violet-300">
              Subscription
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-bold">{plan}</p>
                <p className="text-xs text-slate-400">Renews September 27</p>
              </div>
              <CreditCard className="text-violet-300" />
            </div>
            <Button
              onClick={() => setSubscriptionDetailsOpen(true)}
              variant="outline"
              className="mt-4 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Manage subscription
            </Button>
          </section>
        </div>
        <SheetFooter className="border-t border-white/8">
          <Button
            onClick={onSwitchProfiles}
            variant="ghost"
            className="justify-start text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <UsersRound /> Switch profile
          </Button>
          <Button
            onClick={onFeedback}
            variant="ghost"
            className="justify-start text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <CircleHelp /> Help & feedback
          </Button>
          <Button
            onClick={onSignOut}
            variant="ghost"
            className="justify-start text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          >
            Sign out
          </Button>
        </SheetFooter>
      </SheetContent>
      <Dialog
        open={Boolean(settingsProfile)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSettingsProfile(null);
        }}
      >
        <DialogContent className="border-white/10 bg-[#0a0f23] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Profile settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Profile, device, and account information.
            </DialogDescription>
          </DialogHeader>
          {settingsProfile && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <img
                  src={settingsProfile.image}
                  alt={`${settingsProfile.name} profile`}
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  className="size-14 rounded-xl object-cover"
                />
                <div>
                  <p className="text-lg font-bold">{settingsProfile.name}</p>
                  <Badge className="mt-1 bg-violet-500/15 text-violet-200">
                    {getProfileRole(settingsProfile)}
                  </Badge>
                </div>
              </div>
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Profile information
                </p>
                <dl className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm">
                  {[
                    ["Profile type", getProfileRole(settingsProfile)],
                    ["Date added", settingsProfile.addedAt],
                    ["Device type", settingsProfile.deviceType],
                    ["Device name", settingsProfile.deviceName],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="text-right font-medium text-slate-200">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              {settingsProfile.id === "alex" && (
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Main account information
                  </p>
                  <dl className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm">
                    {[
                      ["Full name", account.name],
                      ["Email address", account.email],
                      ["Phone number", account.phone],
                      [
                        "Date of birth",
                        new Date(`${account.dateOfBirth}T00:00:00`).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }),
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="text-right font-medium text-slate-200">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettingsProfile(null)}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={subscriptionDetailsOpen} onOpenChange={setSubscriptionDetailsOpen}>
        <DialogContent className="border-white/10 bg-[#0a0f23] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Subscription details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Your current subscription record and billing period.
            </DialogDescription>
          </DialogHeader>
          <dl className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm">
            {[
              ["Subscription user ID", subscription.subscriptionUserId],
              ["Plan ID", subscription.planId],
              ["Start date", subscription.startDate],
              ["End date", subscription.endDate],
              ["Status", subscription.status],
              ["Created at", subscription.createdAt],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-4">
                <dt className="text-slate-500">{label}</dt>
                <dd className={`text-right font-medium ${label === "Status" ? "text-emerald-300" : "text-slate-200"}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubscriptionDetailsOpen(false)}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setSubscriptionDetailsOpen(false);
                onOpenChange(false);
                onPlans();
              }}
              className="bg-violet-600 text-white hover:bg-violet-500"
            >
              Change plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
