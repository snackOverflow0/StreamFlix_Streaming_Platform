import { useEffect, useMemo, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { TrailerPreview } from "@/features/movies/components/TrailerPreview";
import { getReviewsByContent, type Review } from "@/features/reviews/services/review.service";
import { hasProfanity, maskProfanity } from "@/lib/profanity";
import type { StreamFlixController } from "../hooks/useStreamFlix";
import { Crumbs, FavButton, ListButton, Meta, PosterCard, Stars, backdropOf, isSeries } from "./ui";

const fmt = (d: string) => { const x = new Date(d); return isNaN(x.getTime()) ? "" : x.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }); };

/* Title detail sheet: trailer, actions, facts, star rating + written review (saved to Supabase via /reviews), episodes, more like this. */
export default function Detail({ state }: { state: StreamFlixController }) {
  const item = state.selected;
  const open = state.detailOpen && !!item;
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [rvError, setRvError] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const mine = item ? state.myReviews.find(r => r.content_id === item.id) : undefined;

  // Load community reviews and prefill the viewer's own rating/review whenever a new title opens.
  useEffect(() => {
    if (!open || !item) return;
    state.setReviewRating(mine?.rating_value ?? 0);
    state.setReviewComment(mine?.review_comment ?? "");
    setReviews(null);
    let live = true;
    getReviewsByContent(item.id).then(r => { if (live) setReviews(r); }).catch(() => { if (live) setReviews([]); });
    return () => { live = false; };
  }, [open, item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape" && !state.watchOpen) state.setDetailOpen(false); };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", key); };
  }, [open, state.watchOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const more = useMemo(() => item ? state.catalog.filter(x => x.id !== item.id && x.genre === item.genre).slice(0, 6) : [], [item, state.catalog]);
  if (!open || !item) return null;

  async function save() {
    if (!item) return;
    if (state.reviewRating < 1) { setRvError('Pick a star rating first.'); return; }
    if (hasProfanity(state.reviewComment)) { setRvError('Please remove offensive words before posting your review.'); return; }
    setRvError(''); setSaving(true);
    try {
      if (await state.submitReview()) getReviewsByContent(item.id).then(setReviews).catch(() => undefined);
    } finally { setSaving(false); }
  }
  const changed = !mine || mine.rating_value !== state.reviewRating || (mine.review_comment ?? "") !== state.reviewComment;

  return <div className="v-backdrop" onClick={e => { if (e.target === e.currentTarget) state.setDetailOpen(false); }}>
    <article className="v-detail" role="dialog" aria-modal="true" aria-labelledby="d-title">
      <div className="v-d-hero">
        <div className="v-d-media"><TrailerPreview key={item.id} url={item.trailerUrl} poster={backdropOf(item)} title={item.title} active={open && !state.watchOpen} delay={700} className="absolute inset-0" /></div>
        <button ref={closeRef} type="button" className="v-d-close" aria-label="Close" onClick={() => state.setDetailOpen(false)}><X size={20} /></button>
        <div className="v-d-copy">
          <Crumbs onGo={() => { state.setDetailOpen(false); state.navigate("home"); }} items={[[isSeries(item) ? "TV Shows" : "Movies", () => { state.setDetailOpen(false); state.navigate(isSeries(item) ? "shows" : "movies"); }], [item.title, null]]} />
          <h2 id="d-title">{item.title}</h2>
          <div className="v-actions" style={{ marginTop: 16 }}>
            <button type="button" className="v-btn v-play" disabled={state.playbackBusy} onClick={() => void state.play(item)}><Play size={20} fill="currentColor" />{state.playbackBusy ? "Opening…" : item.progress && item.progress < 100 ? "Resume" : "Play"}</button>
            <ListButton state={state} item={item} /><FavButton state={state} item={item} />
          </div>
        </div>
      </div>

      <div className="v-d-body">
        <div style={{ display: "grid", gap: 14 }}>
          <Meta item={item} />
          {item.progress ? <div className="v-prog" style={{ position: "static", height: 5 }}><i style={{ width: `${Math.min(100, item.progress)}%` }} /></div> : null}
          <p className="lead">{item.synopsis || item.description}</p>
        </div>
        <div className="v-facts">
          {item.cast?.length ? <div><b>Cast</b>{item.cast.join(", ")}</div> : null}
          {item.director && <div><b>Director</b>{item.director}</div>}
          <div><b>Genre</b>{item.genre}</div>
          <div><b>Released</b>{item.year}</div>
          <div><b>Maturity</b>{item.maturity}{item.kidsApproved ? " · OK for Kids profiles" : ""}</div>
          {item.license && <div><b>Licensed by</b>{item.license}</div>}
          <div className="v-review-strip"><span className="v-label">{mine ? 'Your rating' : 'Rate it'}</span><Stars value={state.reviewRating} onChange={n => { if (!saving) { state.setReviewRating(n); setRvError(''); } }} size={20} /></div>
        </div>
      </div>

      {isSeries(item) && <section className="v-d-sec">
        <div className="v-d-sec-h"><h3>Episodes</h3>{state.selectedSeasons.length > 0 && <select className="v-sel" aria-label="Season" value={state.selectedSeason} onChange={e => state.setSelectedSeason(Number(e.target.value))}>{state.selectedSeasons.map(s => <option key={s.season_id} value={s.season_number}>Season {s.season_number}</option>)}</select>}</div>
        {state.selectedEpisodes.length ? <div className="v-eps">{state.selectedEpisodes.map(ep => <button type="button" key={ep.episode_id} className="v-ep" disabled={state.playbackBusy} onClick={() => void state.play(item, ep.episode_id)}><span className="n">{ep.episode_number}</span><span><b>{ep.episode_title}</b><small>{ep.duration} min</small></span><Play size={17} /></button>)}</div>
          : <p className="v-row-empty" style={{ margin: 0 }}>Episodes will appear here once they’re added.</p>}
      </section>}

      <section className="v-d-sec" aria-label="Reviews">
        <h3>Reviews{item.reviewCount ? <span className="v-sub">★ {item.rating.toFixed(1)} · {item.reviewCount} review{item.reviewCount > 1 ? 's' : ''}</span> : null}</h3>
        <form className="v-rv-form" onSubmit={e => { e.preventDefault(); void save(); }}>
          <textarea className="v-text" style={{ minHeight: 84 }} maxLength={2000} value={state.reviewComment} disabled={saving} onChange={e => { state.setReviewComment(e.target.value); setRvError(''); }} placeholder={state.reviewRating ? 'Share what you thought (optional)' : 'Pick a star rating above, then write your review'} aria-label="Your review" />
          {rvError && <p className="v-err" role="alert">{rvError}</p>}
          <button type="submit" className="v-btn v-glass sm" disabled={saving || !changed}>{saving ? 'Saving…' : mine ? 'Update review' : 'Post review'}</button>
        </form>
        {reviews === null ? <div className="v-sk" style={{ height: 70 }} /> : reviews.length ? <div className="v-rv-list">{reviews.slice(0, 10).map(r => {
          const me = r.user_id === state.currentUserId;
          return <div key={r.rev_id} className="v-rv"><div className="v-rv-h"><span className="pav">{me ? (state.activeProfile?.name?.[0] ?? 'Y') : 'S'}</span><b>{me ? `${state.activeProfile?.name ?? 'You'} · You` : 'StreamFlix member'}</b><span className="v-rv-st" aria-label={`${r.rating_value} of 5 stars`}>{'★'.repeat(Math.round(r.rating_value))}<i>{'★'.repeat(5 - Math.round(r.rating_value))}</i></span><small>{fmt(r.review_date)}</small></div>{r.review_comment ? <p>{maskProfanity(r.review_comment)}</p> : <p style={{ color: 'var(--t3)' }}>Rated without a comment.</p>}</div>;
        })}</div> : <p style={{ color: 'var(--t3)' }}>No reviews yet. Be the first.</p>}
      </section>

      {more.length > 0 && <section className="v-d-sec"><h3>More like this</h3><div className="v-more">{more.map(x => <PosterCard key={x.id} item={x} onOpen={state.openTitle} />)}</div></section>}
    </article>
  </div>;
}
