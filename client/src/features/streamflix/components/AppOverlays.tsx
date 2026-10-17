import {usePlatform} from '@/services/platform';
import { lazy, Suspense, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Smartphone } from "lucide-react";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { AccountMenu } from "@/components/modals/AccountMenu";
import { PlanDialog } from "@/components/modals/PlanDialog";
const VideoPlayer = lazy(() => import("@/features/player/components/VideoPlayer").then(module=>({default:module.VideoPlayer})));

export default function AppOverlays({ state }: { state: StreamFlixController }) {
  const platform=usePlatform();
  const { currentUserId, selected, watchOpen, setWatchOpen, updatePlaybackProgress, selectedEpisodeId, plansOpen, setPlansOpen, plan, plans, accountOpen, setAccountOpen, cartOpen, activeProfile, profiles, account, setAuthStage, loadTransactions, currentPlan, editProfile } = state;

  useEffect(() => {
    if (!watchOpen && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [watchOpen, selected?.id]);
  useEffect(() => { void loadTransactions(); }, [currentUserId, activeProfile?.backendId, cartOpen]);

  return <>
    <DeferredToaster theme="dark" richColors closeButton position="bottom-right" />

    {watchOpen && selected && selected.trailerUrl && (
      <Suspense fallback={<div className="fixed inset-0 z-[200] grid place-items-center bg-[#070b1a] text-white">Opening trailer…</div>}><VideoPlayer
        item={selected}
        episodeId={selectedEpisodeId}
        onClose={() => setWatchOpen(false)}
        onBack={() => setWatchOpen(false)}
        onProgress={(percentage, ended) => void updatePlaybackProgress(selected.id, ended ? 100 : percentage, selectedEpisodeId, state.playbackProfileId)}
      /></Suspense>
    )}

    {watchOpen && selected && !selected.trailerUrl && (
      <Dialog open={watchOpen} onOpenChange={setWatchOpen}>
        <DialogContent className="border-white/10 bg-[#0c1127] text-white">
          <DialogHeader>
            <DialogTitle>Playback unavailable</DialogTitle>
            <DialogDescription className="text-slate-400">No trailer URL is stored for this title yet.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden sf-glass-panel rounded-2xl border border-white/10 bg-black">
            <img src={selected.poster} alt={selected.title} className="aspect-video w-full object-cover opacity-60" />
          </div>
          <DialogFooter><Button onClick={() => setWatchOpen(false)} className="bg-violet-600 text-white">Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    <PlanDialog open={plansOpen} onOpenChange={setPlansOpen} current={plan} plans={plans} onSelect={(id) => void state.selectPlan(id)} />
    <AccountMenu open={accountOpen} onOpenChange={setAccountOpen} profile={activeProfile} profiles={profiles} account={account} currentPlan={currentPlan} onPlans={() => { setAccountOpen(false); window.setTimeout(() => setPlansOpen(true), 200); }} onFeedback={() => { setAccountOpen(false); state.navigate("feedback"); }} onSwitchProfiles={() => { setAccountOpen(false); setAuthStage("profiles"); }} onSignOut={() => { void state.logout(); }} onEditProfile={editProfile} />

    <Dialog open={state.footerPanel !== null} onOpenChange={(open) => { if (!open) state.setFooterPanel(null); }}><DialogContent className="border-white/10 bg-[#0a0f23] text-white"><DialogHeader><DialogTitle>{state.footerPanel === "devices" ? "Profile device labels" : state.footerPanel === "help" ? "Help center" : state.footerPanel === "accessibility" ? "Accessibility" : "Legal"}</DialogTitle><DialogDescription className="text-slate-400">Information from your StreamFlix account and interface.</DialogDescription></DialogHeader>{state.footerPanel === "devices" ? <div className="space-y-2">{profiles.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"><Smartphone className="size-5 text-violet-300" /><div className="flex-1"><p className="text-sm font-semibold">{item.deviceName}</p><p className="text-xs text-slate-500">{item.name} • {item.deviceType}</p></div><Badge className="bg-emerald-500/10 text-emerald-300">Profile label</Badge></div>)}</div> : <div className="space-y-3 sf-glass-panel rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300"><p>{state.footerPanel === "help" ? "For account or payment help, send a message using Feedback. Include your order or payment reference so support can find the record." : state.footerPanel === "accessibility" ? "Use Tab to reach controls and Enter to activate them. Press Escape to close dialogs. Browser zoom can increase text size." : "Terms and privacy documents have not been published yet. Contact support through Feedback for account or data questions."}</p>{platform.supportEmail && <a className="block text-violet-300" href={`mailto:${platform.supportEmail}`}>Contact support: {platform.supportEmail}</a>}</div>}<DialogFooter><Button variant="outline" onClick={() => state.setFooterPanel(null)} className="border-white/15 bg-white/5 text-white hover:bg-white/10">Close</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
