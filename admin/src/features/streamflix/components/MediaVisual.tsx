export default function MediaVisual({src,alt='',className='',poster}:{src?:string;alt?:string;className?:string;poster?:string}){
 return /\.(mp4|webm|mov)(\?|$)/i.test(src||'')?<video src={src} poster={poster} className={className} muted autoPlay loop playsInline preload="metadata" aria-label={alt}/>:<img src={src} alt={alt} className={className} loading="lazy" decoding="async"/>;
}
