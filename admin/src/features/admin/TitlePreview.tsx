import { Ic } from './proto-icons';
import { B, Modal, Poster, fmtDate, str } from './proto-ui';

/* "Title preview" drawer from the prototype: how a title reads in the client app, with a shortcut to edit. */
type Row = Record<string, unknown>;
export default function TitlePreview({ row, media, onClose, onEdit }: { row: Row; media: (u: unknown) => string; onClose: () => void; onEdit: (r: Row) => void }) {
  const series = /series|show/i.test(str(row.type));
  return <Modal drawer title="Title preview" onClose={onClose} bodyStyle={{ padding: 0, gap: 0 }} foot={<><button type="button" className="btn btn-g" onClick={onClose}>Close</button><button type="button" className="btn btn-p" onClick={() => onEdit(row)}><Ic n="edit" s={15} />Edit</button></>}>
    <div className="poster-hero" style={{ background: 'radial-gradient(400px 200px at 0 0,rgba(124,92,255,.28),transparent 70%)' }}>
      <Poster src={row.poster_url ? media(row.poster_url) : undefined} />
      <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>{str(row.title)}</h3>
        <span style={{ color: 'var(--t2)', fontSize: 12.5 }}>{[str(row.release_date).slice(0, 4), str(row.age_rating), str(row.genre_name), str(row.duration_label)].filter(Boolean).join(' · ')}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{row.is_active === false ? <B tone="warn">Hidden</B> : <B tone="ok">Live</B>}{!row.poster_url && <B tone="warn">No poster</B>}{row.is_kids_suitable === true && <B tone="info">Kids</B>}</div>
      </div>
    </div>
    <p style={{ padding: 20, color: 'var(--t2)', lineHeight: 1.65 }}>{str(row.synopsis || row.description) || 'No synopsis yet.'}</p>
    <dl className="dl" style={{ borderTop: '1px solid var(--line)' }}>
      <dt>Type</dt><dd>{series ? 'TV Series' : 'Movie'}</dd>
      <dt>Licensor</dt><dd>{str(row.licensor_name) || '—'}</dd>
      {row.director ? <><dt>Director</dt><dd>{str(row.director)}</dd></> : null}
      {row.cast ? <><dt>Cast</dt><dd>{str(row.cast)}</dd></> : null}
      <dt>Added</dt><dd>{fmtDate(row.created_at)}</dd>
      <dt>Visible to users</dt><dd>{row.is_active === false ? 'No' : 'Yes'}</dd>
    </dl>
  </Modal>;
}
