export function aggregateViews(rows: Record<string,unknown>[]) {
 const totals = new Map<number,{views:number;viewers:Set<string>}>();
 const seen = new Set<string>();
 for(const row of rows){
  const id=Number(row.content_id);
  if(!Number.isSafeInteger(id)||id<=0||Number(row.progress_percentage)<=0||!Number.isFinite(Number(row.progress_percentage)))continue;
  const key=String(row.history_id);if(seen.has(key))continue;seen.add(key);
  const entry=totals.get(id)||{views:0,viewers:new Set<string>()};entry.views++;
  if(row.user_id!=null)entry.viewers.add(String(row.user_id));totals.set(id,entry);
 }
 return [...totals].map(([content_id,entry])=>({content_id,views:entry.views,unique_viewers:entry.viewers.size})).sort((a,b)=>b.views-a.views||b.unique_viewers-a.unique_viewers||a.content_id-b.content_id);
}
