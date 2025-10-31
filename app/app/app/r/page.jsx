'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function DetailInner() {
  const sp = useSearchParams();
  const id = useMemo(() => sp.get('id') || '', [sp]);
  const router = useRouter();

  const [r, setR]   = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      if (!id) { setErr('Chybí parametr id'); setBusy(false); return; }
      try {
        const res = await fetch(`/api/recipes/${id}`, { cache: 'no-store' });
        const txt = await res.text();
        const data = (() => { try { return JSON.parse(txt); } catch { return null; } })();
        if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status} ${txt || ''}`);
        if (on) setR(data);
      } catch (e) {
        if (on) setErr(e.message || 'Chyba načtení');
      } finally {
        if (on) setBusy(false);
      }
    })();
    return () => { on = false; };
  }, [id]);

  async function del() {
    if (!r) return;
    if (!confirm(`Smazat „${r.title || id}“?`)) return;
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert(`Smazání selhalo (HTTP ${res.status})`);
    router.push('/');
  }

  if (busy) return <p>Načítám…</p>;
  if (err)  return <><a href="/">&larr; Zpět</a><h1>Chyba</h1><p style={{color:'#b00'}}>{err}</p></>;

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <a href="/">&larr; Zpět</a>
        <button onClick={del} style={{ background:'#fff', border:'1px solid #e33', color:'#e33', borderRadius:8, padding:'6px 10px' }}>Smazat</button>
      </div>
      <h1>{r.title}</h1>
      {r.image && <div style={{aspectRatio:'16/9', background:'#f2f2f2', borderRadius:12, overflow:'hidden', margin:'12px 0'}}>
        <img src={r.image} alt={r.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
      </div>}
      {r.description && <p style={{color:'#444'}}>{r.description}</p>}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:24}}>
        <section>
          <h2>Ingredience</h2>
          {r.ingredients?.length ? <ul>{r.ingredients.map((x,i)=><li key={i}>{x}</li>)}</ul> : <p style={{color:'#777'}}>Nenalezeno</p>}
        </section>
        <section>
          <h2>Postup</h2>
          {r.steps?.length ? <ol>{r.steps.map((x,i)=><li key={i} style={{marginBottom:6}}>{x}</li>)}</ol> : <p style={{color:'#777'}}>Nenalezeno</p>}
        </section>
      </div>
      <div style={{marginTop:16, color:'#666'}}>{r.time && <>⏱ {r.time} &nbsp;</>}{r.servings && <>🍽 {r.servings}</>}</div>
      {r.source && <p style={{marginTop:18}}>Zdroj: <a href={r.source} target="_blank" rel="noreferrer">{r.source}</a></p>}
    </>
  );
}

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <Suspense fallback={<p>Načítám…</p>}>
        <DetailInner />
      </Suspense>
    </main>
  );
}
