import {Button} from '@/components/ui/button';
import {Check,Info,ListPlus,Play,Star,ArrowUpRight} from 'lucide-react';
import type {Content} from '@/features/streamflix/types';
import {TrailerPreview} from './TrailerPreview';
export function Hero({item,onPlay,onInfo,onWatchlist,isWatchlisted,category=false}:{category?:boolean;item:Content|null;onPlay:()=>void;onInfo:()=>void;onWatchlist?:()=>void;isWatchlisted?:boolean}){
 if(!item)return <section className="sf-hero sf-cinema-hero animate-pulse" aria-label="Loading featured title"/>;
 const Heading=category?"h2":"h1";
 return <section className={`sf-hero sf-cinema-hero ${category ? "sf-category-spotlight" : ""}`} aria-label={`${item.title} featured ${item.type === "Series" ? "series" : "movie"}`}>
  {category && <><div className="sf-feature-atmosphere" aria-hidden="true" style={{backgroundImage:`url(${JSON.stringify(item.hero??item.preview??item.poster)})`}}/><div className="sf-feature-ambient" aria-hidden="true"/></>}
  <TrailerPreview key={item.id} url={item.trailerUrl} poster={item.hero??item.preview??item.poster} title={item.title} delay={850} className="sf-hero-media"/>
  <div className="sf-hero-shade"/>

  <div className="sf-hero-inner">
   <div className="sf-hero-copy">
    <div className="sf-hero-eyebrow"><span className="sf-spotlight-dot"/>{category ? "THE STREAMFLIX SPOTLIGHT" : "IN THE SPOTLIGHT"}<span className="sf-hero-format">{item.type==='Series'?'SERIES':'FILM'}</span></div>
    <Heading className="sf-hero-title">{item.title}</Heading>
    <div className="sf-hero-metadata">{item.reviewCount>0&&<span className="sf-rating"><Star size={14} fill="currentColor"/>{item.rating.toFixed(1)}</span>}<span>{item.year}</span><span className="sf-maturity-label">{item.maturity}</span><span>{item.genre}</span><span>{item.type === "Series" && /feature film/i.test(item.duration) ? "TV series" : item.duration}</span></div>
    <p className="sf-hero-description">{item.description||item.synopsis}</p>
    <div className="sf-hero-actions"><Button onClick={onPlay} className="sf-primary-play"><Play fill="currentColor" size={18}/>{item.progress&&item.progress<100?'Resume trailer':'Play trailer'}</Button><Button onClick={onInfo} className="sf-glass-button"><Info size={18}/>More info</Button>{onWatchlist&&<Button onClick={onWatchlist} variant="outline" aria-label={isWatchlisted?'Remove from My List':'Add to My List'} aria-pressed={isWatchlisted} className="sf-save-button">{isWatchlisted?<Check size={18}/>:<ListPlus size={18}/>}</Button>}</div>
    <div className="sf-hero-footnote"><span>{category ? "YOUR NEXT OBSESSION STARTS HERE" : "DISCOVER SOMETHING GREAT"}</span><span className="sf-footnote-line"/><span>Trailer preview</span><ArrowUpRight size={12}/></div>
   </div>
  </div>
  {category && <div className="sf-feature-signature" aria-hidden="true"><span className="sf-feature-signature-line"/><span>STREAMFLIX SELECT</span><strong>{item.type === "Series" ? "One more episode." : "Make tonight a movie night."}</strong></div>}
 </section>;
}
