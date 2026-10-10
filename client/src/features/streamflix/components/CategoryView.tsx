import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScrollFade from "@/components/ScrollFade";
import LazySection from "@/components/LazySection";
import { Hero, MediaRow } from "./Content";
import type { StreamFlixController } from "../hooks/useStreamFlix";
export default function CategoryView({ state }: { state: StreamFlixController }) {
 const [genre, setGenre] = useState("");
 const [headingVisible, setHeadingVisible] = useState(true);
 useEffect(() => {
  let previousY = window.scrollY;
  let frame = 0;
  const update = () => {
   frame = 0;
   const y = window.scrollY;
   if (y < 24) { setHeadingVisible(true); previousY = y; }
   else if (Math.abs(y - previousY) > 4) { setHeadingVisible(y < previousY); previousY = y; }
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
 }, []);
 const type = state.view === "shows" ? "Series" : "Movie";
 const title = type === "Series" ? "TV Shows" : "Movies";
 const catalog = state.catalog.filter(item => item.type === type);
 const genres = [...new Set(catalog.map(item => item.genre).filter(Boolean))].sort();
 const items = catalog.filter(item => !genre || item.genre === genre);
 const featured = items.find(item => item.isFeatured) ?? items.find(item => item.hero) ?? items[0] ?? null;
 const rows = genre ? [{title:genre,items}] : genres.map(name => ({title:name,items:items.filter(item => item.genre === name)}));
 return <div className="sf-category-page">
  <ScrollFade>
   <div className="sf-category-feature">
    <div className="sf-category-heading flex flex-wrap items-center gap-5" data-visible={headingVisible} inert={!headingVisible}>
     <div className="sf-category-title-group"><p className="sf-category-kicker">THE STREAMFLIX COLLECTION</p><h1 className="text-2xl font-bold sm:text-3xl">{title}<span className="sf-category-total">{catalog.length}</span></h1></div>
     <Select value={genre || "all"} onValueChange={value => setGenre(value === "all" ? "" : value)}>
      <SelectTrigger aria-label={`Filter ${title} by genre`} className="sf-genre-trigger"><SelectValue placeholder="Genres">{genre || "Genres"}</SelectValue></SelectTrigger>
      <SelectContent position="popper" align="start" sideOffset={8} className="sf-genre-menu">
       <SelectItem value="all">All genres</SelectItem>{genres.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
      </SelectContent>
     </Select>
    </div>
    {featured && <Hero category item={featured} onPlay={()=>state.play(featured)} onInfo={()=>state.openTitle(featured)} onWatchlist={()=>void state.toggleWatchlist(featured.id)} isWatchlisted={state.watchlist.includes(featured.id)} />}
   </div>
  </ScrollFade>
  <div className="space-y-10 pb-16">{rows.map(row=><LazySection key={row.title} minHeight={320}><MediaRow title={row.title} items={row.items} onSelect={state.openTitle} onPlay={state.play} onFavorite={item=>void state.toggleFavorite(item.id)} onWatchlist={item=>void state.toggleWatchlist(item.id)} favorites={state.favorites} watchlist={state.watchlist} /></LazySection>)}</div>
  {!items.length && <p className="px-6 py-16 text-slate-400">No titles available in this genre.</p>}
 </div>;
}
