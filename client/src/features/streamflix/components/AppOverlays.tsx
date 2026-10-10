import {usePlatform} from '@/services/platform';
const TitleDetails = lazy(() => import("./TitleDetails"));
import { lazy, Suspense, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Heart, ListPlus, MessageSquareText, Play, Send, Smartphone, Star } from "lucide-react";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { AccountMenu } from "@/components/modals/AccountMenu";
import { PlanDialog } from "@/components/modals/PlanDialog";
import { CartDrawer } from "@/components/modals/CartDrawer";
const VideoPlayer = lazy(() => import("@/features/player/components/VideoPlayer").then(module=>({default:module.VideoPlayer})));

export default function AppOverlays({ state }: { state: StreamFlixController }) {
  const platform=usePlatform();
  const { currentUserId, detailOpen, setDetailOpen, selected, play, watchOpen, setWatchOpen, reviewOpen, setReviewOpen, reviewRating, setReviewRating, reviewComment, setReviewComment, feedbackOpen, setFeedbackOpen, submitFeedback, plansOpen, setPlansOpen, plan, plans, accountOpen, setAccountOpen, cartOpen, activeProfile, profiles, account, setAuthStage, favorites, watchlist, toggleFavorite, toggleWatchlist, selectedSeason, setSelectedSeason, selectedSeasons, selectedEpisodes, selectedEpisodeId, updatePlaybackProgress, myReviews, transactions, cartItems, cart, setCartOpen, total, checkout, setLocalCartQuantity, loadTransactions, currentPlan, editProfile } = state;
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    if (!watchOpen && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [watchOpen, selected?.id]);
  useEffect(() => { void loadTransactions(); }, [currentUserId, activeProfile?.backendId, cartOpen]);

  return <>
    <DeferredToaster richColors position="bottom-right" />
    <Suspense fallback={null}><TitleDetails state={state} /></Suspense>

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

    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent className="border-white/10 bg-[#0c1127] text-white"><DialogHeader><DialogTitle>Review {selected?.title}</DialogTitle><DialogDescription className="text-slate-400">Share your thoughts and help other viewers find their next favorite.</DialogDescription></DialogHeader><div className="flex gap-1">{[1,2,3,4,5].map((star) => <button type="button" key={star} disabled={reviewSubmitting} onClick={() => setReviewRating(star)} className={`rounded-md p-1 ${star <= reviewRating ? "text-amber-300" : "text-slate-600 hover:text-amber-200"}`}><Star className={`size-8 ${star <= reviewRating ? "fill-current" : "fill-transparent"}`} /></button>)}</div><Textarea maxLength={2000} value={reviewComment} disabled={reviewSubmitting} onChange={(event) => setReviewComment(event.target.value)} className="min-h-28 border-white/10 bg-white/5" placeholder="What did you think?" /><div className="flex items-center justify-between text-[11px] text-slate-600"><span>{reviewSubmitting ? "Submitting review…" : "Rate this title and add an optional comment."}</span><span>{reviewComment.length}/2000</span></div><DialogFooter><Button disabled={!selected || reviewRating === 0 || reviewSubmitting} onClick={async () => { setReviewSubmitting(true); try { await state.submitReview(); } finally { setReviewSubmitting(false); } }} className="bg-violet-600 text-white">{reviewSubmitting ? "Submitting…" : <><Send /> Save review</>}</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}><DialogContent className="border-white/10 bg-[#0c1127] text-white"><DialogHeader><DialogTitle>Send feedback</DialogTitle><DialogDescription className="text-slate-400">Tell us what could make your StreamFlix experience better.</DialogDescription></DialogHeader><Input maxLength={120} value={feedbackSubject} disabled={feedbackSubmitting} onChange={(e) => setFeedbackSubject(e.target.value)} className="border-white/10 bg-white/5" placeholder="Subject" /><Textarea maxLength={2000} value={feedbackMessage} disabled={feedbackSubmitting} onChange={(e) => setFeedbackMessage(e.target.value)} className="min-h-32 border-white/10 bg-white/5" placeholder="Your message" /><div className="flex items-center justify-between text-[11px] text-slate-600"><span>{feedbackSubmitting ? "Sending feedback…" : "We’ll show a confirmation when it is accepted."}</span><span>{feedbackMessage.length}/2000</span></div><DialogFooter><Button disabled={!feedbackSubject.trim() || !feedbackMessage.trim() || feedbackSubmitting} onClick={async () => { setFeedbackSubmitting(true); try { const sent = await submitFeedback(feedbackSubject, feedbackMessage); if (sent) { setFeedbackSubject(""); setFeedbackMessage(""); } } finally { setFeedbackSubmitting(false); } }} className="bg-violet-600 text-white">{feedbackSubmitting ? "Sending…" : <><Send /> Send feedback</>}</Button></DialogFooter></DialogContent></Dialog>

    <PlanDialog open={plansOpen} onOpenChange={setPlansOpen} current={plan} plans={plans} onSelect={(id) => void state.selectPlan(id)} />
    <AccountMenu open={accountOpen} onOpenChange={setAccountOpen} profile={activeProfile} profiles={profiles} account={account} currentPlan={currentPlan} onPlans={() => { setAccountOpen(false); window.setTimeout(() => setPlansOpen(true), 200); }} onFeedback={() => { setAccountOpen(false); setFeedbackOpen(true); }} onSwitchProfiles={() => { setAccountOpen(false); setAuthStage("profiles"); }} onSignOut={() => { void state.logout(); }} onEditProfile={editProfile} />
    <CartDrawer key={`${currentUserId}:${activeProfile?.backendId}`} profileName={activeProfile?.name ?? ""} open={cartOpen} onOpenChange={setCartOpen} items={cartItems} quantities={cart} total={total} transactions={transactions} updateQuantity={setLocalCartQuantity} remove={(id) => setLocalCartQuantity(id, 0)} checkout={checkout} />

    <Dialog open={state.footerPanel !== null} onOpenChange={(open) => { if (!open) state.setFooterPanel(null); }}><DialogContent className="border-white/10 bg-[#0a0f23] text-white"><DialogHeader><DialogTitle>{state.footerPanel === "devices" ? "Profile device labels" : state.footerPanel === "help" ? "Help center" : state.footerPanel === "accessibility" ? "Accessibility" : "Legal"}</DialogTitle><DialogDescription className="text-slate-400">Information from your StreamFlix account and interface.</DialogDescription></DialogHeader>{state.footerPanel === "devices" ? <div className="space-y-2">{profiles.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"><Smartphone className="size-5 text-violet-300" /><div className="flex-1"><p className="text-sm font-semibold">{item.deviceName}</p><p className="text-xs text-slate-500">{item.name} • {item.deviceType}</p></div><Badge className="bg-emerald-500/10 text-emerald-300">Profile label</Badge></div>)}</div> : <div className="space-y-3 sf-glass-panel rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300"><p>{state.footerPanel === "help" ? "For account or payment help, send a message using Feedback. Include your order or payment reference so support can find the record." : state.footerPanel === "accessibility" ? "Use Tab to reach controls and Enter to activate them. Press Escape to close dialogs. Browser zoom can increase text size." : "Terms and privacy documents have not been published yet. Contact support through Feedback for account or data questions."}</p>{platform.supportEmail && <a className="block text-violet-300" href={`mailto:${platform.supportEmail}`}>Contact support: {platform.supportEmail}</a>}</div>}<DialogFooter><Button variant="outline" onClick={() => state.setFooterPanel(null)} className="border-white/15 bg-white/5 text-white hover:bg-white/10">Close</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
