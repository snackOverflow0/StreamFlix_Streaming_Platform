import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Content } from "@/features/streamflix/types";

const MAX_SEARCH_LENGTH = 55;
const DEBOUNCE_MS = 300;
const RECENT_KEY = "streamflix-recent-searches";

export function SearchBox({ open, query, catalog, onOpenChange, onQueryChange }: { open: boolean; query: string; catalog: Content[]; onOpenChange: (open: boolean) => void; onQueryChange: (value: string) => void }) {
  const [draft, setDraft] = useState(query);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => setDraft(query), [query]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as unknown;
      if (Array.isArray(saved)) setRecent(saved.filter((value): value is string => typeof value === "string").slice(0, 5));
    } catch { /* ignore unavailable storage */ }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => onQueryChange(draft.trim().slice(0, MAX_SEARCH_LENGTH)), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, onQueryChange]);

  const suggestions = useMemo(() => {
    const needle = draft.trim().toLowerCase();
    if (!needle) return catalog.slice(0, 5);
    return catalog.filter((item) => `${item.title} ${item.genre}`.toLowerCase().includes(needle)).slice(0, 5);
  }, [catalog, draft]);

  const choose = (value: string) => {
    const normalized = value.trim().slice(0, MAX_SEARCH_LENGTH);
    if (!normalized) return;
    setDraft(normalized);
    onQueryChange(normalized);
    setRecent((current) => {
      const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 5);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <div className={`relative transition-all duration-300 ${open ? "w-[calc(100vw-5.5rem)] sm:w-[320px]" : "w-10"}`}>
      {open ? (
        <div className="relative">
          <div className="flex h-10 items-center rounded-full border border-white/15 bg-black/70 px-3 shadow-xl backdrop-blur-xl focus-within:border-violet-400/60">
            <Search className="mr-2 size-4 shrink-0 text-violet-300" />
            <input autoFocus value={draft} maxLength={MAX_SEARCH_LENGTH} onChange={(event) => setDraft(event.target.value.slice(0, MAX_SEARCH_LENGTH))} onKeyDown={(event) => { if (event.key === "Enter" && draft.trim()) choose(draft); if (event.key === "Escape") onOpenChange(false); }} placeholder="Search titles, genres..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" aria-label="Search titles and genres" />
            <span className="mr-1 hidden text-[10px] text-slate-600 sm:block">{draft.length}/{MAX_SEARCH_LENGTH}</span>
            <button type="button" onClick={() => { setDraft(""); onQueryChange(""); onOpenChange(false); }} aria-label="Close search" className="rounded-full p-1 hover:bg-white/10"><X className="size-4" /></button>
          </div>
          {(suggestions.length || recent.length) > 0 && !draft.trim() && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1024]/95 p-2 shadow-2xl backdrop-blur-xl">
              {recent.length > 0 && <><p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-600">Recent searches</p>{recent.map((value) => <button key={value} type="button" onClick={() => choose(value)} className="block w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/5">{value}</button>)}</>}
              {!recent.length && suggestions.length > 0 && <p className="px-2 py-1 text-[10px] text-slate-600">Start typing to search the catalog</p>}
            </div>
          )}
          {draft.trim() && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1024]/95 p-2 shadow-2xl backdrop-blur-xl">
              {suggestions.map((item) => <button key={item.id} type="button" onClick={() => choose(item.title)} className="block w-full rounded-lg px-2 py-2 text-left text-sm text-slate-200 hover:bg-white/5"><span className="font-semibold">{item.title}</span><span className="ml-2 text-xs text-slate-500">{item.genre}</span></button>)}
            </div>
          )}
        </div>
      ) : <button type="button" onClick={() => onOpenChange(true)} className="grid size-10 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Open search"><Search className="size-5" /></button>}
    </div>
  );
}
