(function(){
'use strict';

/* ---------- utilidades ---------- */
const CFG = window.CONFIG || {};
const $ = s => document.querySelector(s);
const VIEW = $('#view');
const DIAS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const DIAS_F = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON = {
  l: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  r: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
const EXAMES = ['Hematócrito','Hemoglobina','Testosterona total','Testosterona livre','Estradiol','PSA','TGO','TGP','Colesterol total','LDL','HDL','Triglicerídeos','Glicemia','Creatinina','Vitamina D','Ferritina'];

const uid = () => Math.random().toString(36).slice(2,10);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad2 = n => String(n).padStart(2,'0');
const ymd = d => d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate());
const parse = s => { const p = s.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]); };
const idxOf = d => (d.getDay() + 6) % 7;
const hoje = () => ymd(new Date());
const fmtD = s => { const d = parse(s); return pad2(d.getDate()) + '/' + pad2(d.getMonth()+1); };
const fmtLong = d => d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
const num = v => { if (v == null || v === '') return null; const n = parseFloat(String(v).replace(',','.')); return isNaN(n) ? null : n; };
const fmtN = n => n == null ? '–' : String(Math.round(n*10)/10).replace('.',',');
const numReps = r => { const m = String(r || '').match(/\d+/); return m ? m[0] : ''; };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate()+n); return ymd(d); };
const horaAgora = () => { const d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); };

/* ---------- dados iniciais ---------- */
function ex(nome, series, reps, obs){ return { id: uid(), nome, series: String(series), reps: String(reps), obs: obs || '' }; }
function seedPlano(){
  return {
    treinos: {
      0: { nome:'Perna', cardio:'', atividades:[], itens:[
        ex('Leg press',4,10), ex('Cadeira extensora',3,12), ex('Mesa flexora',4,10),
        ex('Cadeira adutora',4,15,'MUITO LEVE'), ex('Prancha abdominal',4,'40 s') ]},
      1: { nome:'Costas e bíceps', cardio:'', atividades:[], itens:[
        ex('Remada neutra máquina articulada',4,12), ex('Puxada alta com triângulo',4,12),
        ex('Remada baixa com triângulo',3,10), ex('Bíceps barra W',3,10), ex('Bíceps martelo',3,10) ]},
      2: { nome:'Ombro', cardio:'', atividades:[], itens:[
        ex('Elevação lateral halteres',4,12), ex('Elevação lateral polia',3,10), ex('Elevação frontal',4,12),
        ex('Desenvolvimento máquina',3,10), ex('Prancha abdominal',4,'40 s'), ex('Cadeira adutora',4,15,'MUITO LEVE') ]},
      3: { nome:'Cardio e futsal', cardio:'Cardio 30 min', atividades:['Futebol de quinta (futsal)'], itens:[] },
      4: { nome:'Costas, posterior e bíceps', cardio:'', atividades:[], itens:[
        ex('Remada baixa com triângulo',4,12), ex('Remada neutra máquina articulada',3,12),
        ex('Puxada alta aberta',3,12), ex('Posterior de ombro, cabo cruzado na polia',4,10),
        ex('Bíceps máquina scott',3,10) ]},
      5: { nome:'Peito e tríceps', cardio:'', atividades:[], itens:[
        ex('Supino reto máquina articulada',4,10), ex('Supino declinado máquina articulada',3,12),
        ex('Fly',3,12), ex('Tríceps corda',3,12), ex('Tríceps máquina banco',4,10), ex('Prancha abdominal',4,'40 s') ]},
      6: { nome:'Cardio', cardio:'Cardio 30 min', atividades:[], itens:[] }
    },
    obs: 'Alongamento dinâmico antes do treino e estático somente depois.',
    refeicoes: [
      { id:uid(), nome:'Café da manhã', hora:'', itens:['3 ovos','Café preto','2 pães'] },
      { id:uid(), nome:'Almoço', hora:'', itens:['180 g de proteína','150 g de carbo (arroz ou massa)','Salada à vontade'] },
      { id:uid(), nome:'Lanche', hora:'', itens:['100 g de whey','15 g de pasta de amendoim','1 pudim diet'] },
      { id:uid(), nome:'Pós-treino', hora:'', itens:['30 g de albumina'] },
      { id:uid(), nome:'Jantar', hora:'', itens:['180 g de proteína','150 g de carbo (arroz ou massa)','Salada à vontade'] }
    ],
    suplementos: [
      { id:uid(), nome:'Polivitamínico', dose:'1 comprimido', hora:'No café da manhã', dias:[0,1,2,3,4,5,6] },
      { id:uid(), nome:'Ômega 3', dose:'2 cápsulas (1 g cada)', hora:'No café da manhã', dias:[0,1,2,3,4,5,6] },
      { id:uid(), nome:'Acnever Black', dose:'1 cápsula', hora:'No almoço (com comida)', dias:[0,1,2,3,4,5,6] },
      { id:uid(), nome:'Silimarina', dose:'1 cápsula (200 mg)', hora:'No café da manhã', dias:[0,1,2,3,4,5,6] },
      { id:uid(), nome:'NAC', dose:'2 cápsulas (500 mg cada)', hora:'1 de manhã e 1 à noite', dias:[0,1,2,3,4,5,6] },
      { id:uid(), nome:'Ioimbina', dose:'10 mg', hora:'30 min antes do treino, sem café junto', dias:[0,1,2,3,4,5,6] },
      { id:uid(), nome:'Testosterona', dose:'0,5 ml', hora:'', dias:[0,3] }
    ],
    metaAgua: 3500
  };
}
const SEED_NOTAS = 'LCA do joelho direito rompido (operado em 2018)\n5º metacarpo da mão direita fraturado\n3 tendões do tornozelo direito rompidos\nPubalgia em tratamento com fisio às sextas (out/2026)';

/* ---------- estado ---------- */
let sb = null, user = null, S = {};
let tab = 'hoje', cur = hoje(), planDay = idxOf(new Date()), planSeg = 'treino', progEx = '';
const openEx = {};
let pickOpen = false;
let pendRender = false;
let agendaForm = false;
const barraAnt = {};
const P = () => S.plano;

function dia(date){
  const k = 'dia:' + date;
  if (!S[k]) S[k] = { treino:{}, cardio:false, ativ:{}, ref:{}, supl:{}, agua:0, nota:'' };
  const L = S[k];
  ['treino','ativ','ref','supl'].forEach(f => { if (!L[f]) L[f] = {}; });
  return L;
}
function tIdx(date){ const L = S['dia:' + date]; return L && L.treinoDia != null ? L.treinoDia : idxOf(parse(date)); }
function treinoDo(date){ return P().treinos[tIdx(date)]; }
function touch(date){
  const L = dia(date);
  const t = treinoDo(date);
  L.tnome = t ? t.nome : '';
  save('dia:' + date);
}
function hasContent(L){
  if (!L) return false;
  if (L.cardio || L.agua || L.nota || L.inicio) return true;
  if (Object.values(L.ativ||{}).some(Boolean) || Object.values(L.ref||{}).some(Boolean) || Object.values(L.supl||{}).some(Boolean)) return true;
  return Object.values(L.treino||{}).some(r => (r.series||[]).some(s => s.ok || s.kg || s.reps));
}

/* ---------- sincronização ---------- */
const pend = {}; let timer = null;
function cacheKey(){ return 'meu-treino-cache-' + (user ? user.id : ''); }
function cache(){ try { localStorage.setItem(cacheKey(), JSON.stringify(S)); } catch(e){} }
function save(k){ pend[k] = 1; cache(); clearTimeout(timer); timer = setTimeout(flush, 600); }
async function flush(){
  const ks = Object.keys(pend);
  if (!ks.length || !sb || !user) return;
  ks.forEach(k => delete pend[k]);
  const now = new Date().toISOString();
  const rows = ks.map(k => ({ user_id:user.id, chave:k, dados:S[k], atualizado_em:now }));
  const { error } = await sb.from('registros').upsert(rows, { onConflict:'user_id,chave' });
  if (error){
    ks.forEach(k => pend[k] = 1);
    status('Sem conexão. Seus dados ficam salvos aqui e sobem quando a internet voltar.', true);
    clearTimeout(timer); timer = setTimeout(flush, 8000);
  } else status('');
}
async function removeKey(k){
  delete S[k]; cache();
  await sb.from('registros').delete().eq('chave', k);
}
async function fetchAll(){
  let all = [], from = 0;
  for (;;){
    const { data, error } = await sb.from('registros').select('chave,dados').range(from, from + 999);
    if (error) throw error;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}
function status(msg, isErr){
  const el = $('#status');
  if (!msg){ el.hidden = true; return; }
  el.textContent = msg; el.className = 'status' + (isErr ? ' err' : ''); el.hidden = false;
}

/* ---------- autenticação ---------- */
async function boot(){
  if (!CFG.SUPABASE_URL || /COLE_AQUI/.test(CFG.SUPABASE_URL) || !window.supabase){
    VIEW.innerHTML = '<div class="login"><div class="logo"><svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg></div><h1>Meu Treino</h1><p class="sub">Falta configurar o banco. Abra o arquivo <b>config.js</b> e cole a Project URL e a chave pública do Supabase (veja o LEIA-ME).</p></div>';
    return;
  }
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth:{ persistSession:true, autoRefreshToken:true } });
  sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT'){ user = null; S = {}; showLogin(); } });
  const { data } = await sb.auth.getSession();
  if (data && data.session){ user = data.session.user; await start(); }
  else showLogin();
}
function showLogin(){
  $('#tabbar').hidden = true;
  VIEW.innerHTML = `<div class="login"><div class="logo"><svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg></div><h1>Meu Treino</h1><p class="sub">Entre com seu e-mail e senha.</p>
    <form id="lf" novalidate>
      <div class="f"><label>E-mail<input type="email" id="le" autocomplete="username" required></label></div>
      <div class="f"><label>Senha<input type="password" id="lp" autocomplete="current-password" required></label></div>
      <p id="lerr" class="err" hidden></p>
      <button class="btn primary" type="submit">Entrar</button>
    </form></div>`;
  $('#lf').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#lerr'); err.hidden = true;
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Entrando…';
    const { data, error } = await sb.auth.signInWithPassword({ email: $('#le').value.trim(), password: $('#lp').value });
    if (error){
      err.textContent = /invalid/i.test(error.message) ? 'E-mail ou senha incorretos.' : 'Não deu pra entrar: ' + error.message;
      err.hidden = false; btn.disabled = false; btn.textContent = 'Entrar'; return;
    }
    user = data.user; await start();
  });
}
async function start(){
  VIEW.innerHTML = '<p class="muted">Carregando seus dados…</p>';
  try {
    const rows = await fetchAll();
    S = {}; rows.forEach(r => S[r.chave] = r.dados);
  } catch(e){
    try { S = JSON.parse(localStorage.getItem(cacheKey())) || {}; } catch(_) { S = {}; }
    status('Sem conexão. Mostrando a última cópia salva neste aparelho.', true);
  }
  if (!S.plano){ S.plano = seedPlano(); save('plano'); }
  if (!S.medidas){ S.medidas = [{ id:uid(), data:'2026-10-26', peso:103.5 }]; save('medidas'); }
  if (!S.pressao){ S.pressao = []; save('pressao'); }
  if (!S.exames){ S.exames = []; save('exames'); }
  if (!S.saude){ S.saude = { notas: SEED_NOTAS }; save('saude'); }
  if (!S.agenda){
    const LOC = 'Phoenix · Menino Deus';
    const fisio = (data, hora, fim, prof) => ({ id:uid(), tipo:'fisio', titulo:'Fisio · ' + prof, data, hora, local:LOC, obs:'até ' + fim, semanal:false });
    S.agenda = [
      fisio('2026-10-27','07:15','08:00','Karine Santos'),
      fisio('2026-10-28','07:15','08:00','Karine Santos'),
      fisio('2026-10-30','13:15','14:00','Paulo Ricardo'),
      fisio('2026-11-03','07:15','08:00','Karine Santos'),
      fisio('2026-11-04','07:15','08:00','Karine Santos'),
      fisio('2026-11-05','08:45','09:30','Karine Santos'),
      fisio('2026-11-06','13:15','14:00','Paulo Ricardo'),
      fisio('2026-11-09','07:15','08:00','Karine Santos'),
      { id:uid(), tipo:'medico', titulo:'Retorno · Dr. Felix Albuquerque Drummond', data:'2026-11-18', hora:'09:40', local:LOC, obs:'rever resultado · levar carteirinha do convênio', semanal:false },
      { id:uid(), tipo:'jogo', titulo:'Futebol de quinta (futsal)', data:'2026-10-29', hora:'20:00', local:'MCM', obs:'', semanal:true }
    ];
    save('agenda');
  }
  cache();
  if (!S.lembretes){ S.lembretes = lembretesPadrao(); save('lembretes'); }
  checkPush().then(() => { if (tab === 'saude') keepScroll(render); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  $('#tabbar').hidden = false;
  render();
}

/* ---------- componentes ---------- */
function checkRow(act, id, label, on, sub){
  return `<button class="row ${on?'done':''}" data-act="${act}" data-id="${esc(id)}" aria-pressed="${on}"><span class="c">${CHECK}</span><span class="rowmain"><span class="rn">${label}</span>${sub?`<span class="rd">${sub}</span>`:''}</span></button>`;
}
function chart(series){
  const base = series[0].pts;
  if (base.length < 2) return '<p class="muted small">Registre pelo menos 2 vezes para ver o gráfico.</p>';
  const all = []; series.forEach(s => s.pts.forEach(p => all.push(p.v)));
  const W = 340, H = 160, pl = 34, pr = 10, pt = 12, pb = 22;
  let mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
  if (mn === mx){ mn -= 1; mx += 1; }
  const pd = (mx - mn) * 0.12; mn -= pd; mx += pd;
  const n = base.length;
  const x = k => pl + k * (W - pl - pr) / (n - 1);
  const y = v => pt + (mx - v) * (H - pt - pb) / (mx - mn);
  let g = '';
  for (let i = 0; i <= 3; i++){
    const v = mn + (mx - mn) * i / 3, yy = y(v);
    g += `<line x1="${pl}" x2="${W-pr}" y1="${yy}" y2="${yy}" stroke="var(--line)"/><text x="${pl-5}" y="${yy+3}" text-anchor="end">${fmtN(v)}</text>`;
  }
  series.forEach(s => {
    const pts = s.pts.map((p,k) => x(k) + ',' + y(p.v)).join(' ');
    g += `<polyline points="${pts}" fill="none" stroke="${s.color||'var(--accent)'}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    s.pts.forEach((p,k) => { g += `<circle cx="${x(k)}" cy="${y(p.v)}" r="3" fill="${s.color||'var(--accent)'}"/>`; });
  });
  g += `<text x="${pl}" y="${H-5}">${esc(base[0].l)}</text><text x="${W-pr}" y="${H-5}" text-anchor="end">${esc(base[n-1].l)}</text>`;
  return `<div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg></div>`;
}
function getEx(L, e){
  let r = L.treino[e.id];
  if (!r){
    const n = Math.max(1, parseInt(e.series) || 3);
    r = { nome:e.nome, series: Array.from({length:n}, () => ({ kg:'', reps:'', ok:false })) };
    L.treino[e.id] = r;
  }
  return r;
}
function lastSets(e, before){
  const ks = Object.keys(S).filter(k => k.startsWith('dia:') && k.slice(4) < before).sort().reverse();
  for (const k of ks){
    const t = S[k].treino || {};
    const r = t[e.id] || Object.values(t).find(x => x.nome === e.nome);
    if (r && (r.series||[]).some(s => s.kg || s.reps)) return r.series;
  }
  return null;
}

/* ---------- HOJE ---------- */
const IC = {
  treino:'<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
  comida:'<svg viewBox="0 0 24 24"><path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M17 3c-2 1.5-3 4-3 7v3h3M17 3v18"/></svg>',
  supl:'<svg viewBox="0 0 24 24"><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.6 9.6l4.8 4.8"/></svg>',
  agua:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
  nota:'<svg viewBox="0 0 24 24"><path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/></svg>',
  agenda:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  trofeu:'<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/></svg>'
};
const panel = (title, ico, body, extra) => `<section class="panel"><header class="ph"><h2>${title}</h2>${extra||''}</header>${body}</section>`;
function ring(pct){
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<div class="ringbox"><svg class="ring" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="${r}" class="rb"/><circle cx="42" cy="42" r="${r}" class="rf" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg><span class="rp">${pct}<small>%</small></span></div>`;
}
/* ---------- treino: tempo, recordes, resumo ---------- */
let tick = null;
const fmtDur = ms => { const s = Math.max(0, Math.floor(ms/1000)), h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = s%60; return (h ? h + ':' + pad2(m) : m) + ':' + pad2(x); };
const fmtDurTxt = ms => { const m = Math.round(ms/60000); return m >= 60 ? Math.floor(m/60) + 'h' + pad2(m%60) : m + ' min'; };
const fmtKg = v => Math.round(v).toLocaleString('pt-BR') + ' kg';
const SENS = ['😫','😕','😐','🙂','🔥'];
function okSets(r){ return (r.series||[]).filter(s => s.ok && num(s.kg) != null && num(s.reps) != null); }
function volDia(L){ let v = 0; Object.values(L.treino||{}).forEach(r => okSets(r).forEach(s => { v += num(s.kg) * num(s.reps); })); return v; }
function bestKg(nome, before){
  let b = null;
  Object.keys(S).forEach(k => {
    if (!k.startsWith('dia:') || k.slice(4) >= before) return;
    Object.values(S[k].treino||{}).forEach(r => {
      if (r.nome !== nome) return;
      (r.series||[]).forEach(s => { if (!s.ok) return; const v = num(s.kg); if (v != null && (b == null || v > b)) b = v; });
    });
  });
  return b;
}
function maxOk(r){ let m = null; (r.series||[]).forEach(s => { if (!s.ok) return; const v = num(s.kg); if (v != null && (m == null || v > m)) m = v; }); return m; }
function recordes(L, date){
  const out = [];
  Object.values(L.treino||{}).forEach(r => { const mx = maxOk(r); if (mx == null) return; const prev = bestKg(r.nome, date); if (prev != null && mx > prev) out.push({ nome:r.nome, kg:mx, prev }); });
  return out;
}
function sessaoAnterior(L, date){
  const ks = Object.keys(S).filter(k => k.startsWith('dia:') && k.slice(4) < date && S[k].tnome === L.tnome).sort().reverse();
  for (const k of ks){ const v = volDia(S[k]); if (v > 0) return { data:k.slice(4), vol:v }; }
  return null;
}
function resumo(L, date){
  const series = Object.values(L.treino||{}).reduce((a,r) => a + (r.series||[]).filter(s => s.ok).length, 0);
  return { dur: L.inicio ? (L.fim || Date.now()) - L.inicio : null, vol: volDia(L), series, ant: sessaoAnterior(L, date), prs: recordes(L, date) };
}
function timerBar(L){
  if (!L.inicio) return '<button class="btn primary tstart" data-act="tstart">▶&nbsp; Iniciar treino</button>';
  if (!L.fim) return `<div class="timer"><span class="tlb"><span class="live"></span>Treinando há</span><span class="tv" id="tdur">${fmtDur(Date.now()-L.inicio)}</span><button class="tbtn" data-act="tfim">Finalizar</button></div>`;
  return `<div class="timer done"><span class="tlb">Treino finalizado</span><span class="tv">${fmtDur(L.fim-L.inicio)}</span><button class="tbtn ghost" data-act="tret">Retomar</button></div>`;
}
function resumoHtml(L, date){
  const R = resumo(L, date);
  let h = `<div class="sum"><div><b>${R.dur != null ? fmtDurTxt(R.dur) : '–'}</b><span>duração</span></div><div><b>${fmtKg(R.vol)}</b><span>volume</span></div><div><b>${R.series}</b><span>séries</span></div></div>`;
  if (R.ant && R.vol){ const p = Math.round((R.vol - R.ant.vol) / R.ant.vol * 100); h += `<p class="cmp ${p >= 0 ? 'up' : 'down'}">${p >= 0 ? '▲' : '▼'} ${Math.abs(p)}% de volume em relação a ${fmtD(R.ant.data)}</p>`; }
  if (R.prs.length) h += '<p class="cap" style="margin-top:14px">Recordes de hoje</p>' + R.prs.map(p => `<div class="pr"><span>🏆</span><span class="lm"><b>${esc(p.nome)}</b><span class="rd">${fmtN(p.kg)} kg · antes ${fmtN(p.prev)} kg</span></span></div>`).join('');
  h += '<button class="btn primary" data-act="tshare">Salvar / compartilhar imagem</button>';
  return panel('Resumo do treino', IC.trofeu, h);
}
function toast(msg){
  let el = $('#toast');
  if (!el){ el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role','status'); document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2800);
}
async function shareResumo(){
  const L = dia(cur), R = resumo(L, cur), W = 1080, H = 1350;
  try { await document.fonts.ready; } catch(e){}
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#FF2D3A'); g.addColorStop(1, '#D9141F');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.10)'; x.beginPath(); x.arc(W - 60, 110, 340, 0, 7); x.fill();
  x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.arc(40, H - 20, 320, 0, 7); x.fill();
  const HF = 'Anton,Impact,"Arial Narrow",sans-serif', BF = 'Archivo,system-ui,-apple-system,sans-serif';
  const box = (bx, by, bw, bh) => { x.fillStyle = 'rgba(0,0,0,.20)'; x.beginPath(); if (x.roundRect) x.roundRect(bx, by, bw, bh, 34); else x.rect(bx, by, bw, bh); x.fill(); };
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  x.globalAlpha = .85; x.font = `800 32px ${BF}`; x.fillText(('Meu Treino · ' + fmtLong(parse(cur))).toUpperCase(), 80, 140); x.globalAlpha = 1;
  // título
  x.font = `400 150px ${HF}`;
  const words = (L.tnome || 'Treino').toUpperCase().split(' '); const lines = []; let ln = '';
  words.forEach(w => { const t = ln ? ln + ' ' + w : w; if (x.measureText(t).width > W - 160 && ln){ lines.push(ln); ln = w; } else ln = t; });
  lines.push(ln);
  let y = 300; lines.slice(0,3).forEach(l => { x.fillText(l, 80, y); y += 140; });
  // estatísticas
  y += 30;
  const stats = [[R.dur != null ? fmtDurTxt(R.dur) : '–', 'DURAÇÃO'], [fmtKg(R.vol), 'VOLUME'], [String(R.series), 'SÉRIES']];
  const bw = (W - 160 - 40) / 3;
  stats.forEach((s, k) => {
    const bx = 80 + k * (bw + 20); box(bx, y, bw, 200);
    x.fillStyle = '#fff'; let fs = 88; x.font = `400 ${fs}px ${HF}`;
    while (x.measureText(s[0]).width > bw - 50 && fs > 40){ fs -= 4; x.font = `400 ${fs}px ${HF}`; }
    x.fillText(s[0], bx + 28, y + 115); x.globalAlpha = .85; x.font = `800 26px ${BF}`; x.fillText(s[1], bx + 28, y + 165); x.globalAlpha = 1;
  });
  y += 260;
  if (R.ant && R.vol){
    const p = Math.round((R.vol - R.ant.vol) / R.ant.vol * 100);
    x.font = `800 38px ${BF}`; x.fillText(`${p >= 0 ? '▲' : '▼'} ${Math.abs(p)}% de volume vs ${fmtD(R.ant.data)}`, 80, y); y += 80;
  }
  if (R.prs.length){
    x.font = `800 30px ${BF}`; x.globalAlpha = .85; x.fillText('RECORDES DE HOJE', 80, y); x.globalAlpha = 1; y += 60;
    R.prs.slice(0,4).forEach(p => { x.font = `700 40px ${BF}`; x.fillText(`🏆 ${p.nome} · ${fmtN(p.kg)} kg`, 80, y); y += 62; });
  }
  x.globalAlpha = .7; x.font = `800 28px ${BF}`; x.fillText('MEU TREINO', 80, H - 80); x.globalAlpha = 1;
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'treino-' + cur + '.png', { type:'image/png' });
  if (navigator.canShare && navigator.canShare({ files:[file] })){
    try { await navigator.share({ files:[file], title:'Meu treino' }); return; } catch(e){ if (e && e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
}
function jogoHtml(L, a){
  const j = (L.jogo||{})[a] || {}, id = esc(a);
  return `<div class="jogo"><div class="fields flat"><label>Minutos jogados<input inputmode="numeric" data-f="jmin" data-id="${id}" value="${esc(j.min ?? '')}"></label><label>Gols<input inputmode="numeric" data-f="jgol" data-id="${id}" value="${esc(j.gols ?? '')}"></label></div>
    <p class="fl">Como se sentiu</p><div class="scale s5">${SENS.map((e,n) => `<button class="chip ${j.sens===n+1?'on':''}" data-act="jsens" data-id="${id}" data-v="${n+1}" aria-label="Nota ${n+1}">${e}</button>`).join('')}</div>
    <p class="fl">Dor da pubalgia depois (0 a 10)</p><div class="scale s11">${Array.from({length:11},(_,n) => `<button class="chip dor${n>=7?' hi':n>=4?' md':''} ${j.dor===n?'on':''}" data-act="jdor" data-id="${id}" data-v="${n}">${n}</button>`).join('')}</div></div>`;
}

/* ---------- sugestão de carga (dupla progressão) ---------- */
function topReps(reps){
  const r = String(reps || '');
  const m = r.match(/(\d+)\s*(?:-|–|a)\s*(\d+)/); if (m) return +m[2];
  const n = r.match(/\d+/); return n ? +n[0] : null;
}
function sugestao(e, date){
  if (/\d+\s*(s|seg|min)\b/i.test(String(e.reps || ''))) return null;
  const last = lastSets(e, date); if (!last) return null;
  const ok = last.filter(s => s.ok && num(s.kg) != null);
  if (!ok.length) return null;
  const kg = Math.max(...ok.map(s => num(s.kg)));
  const top = topReps(e.reps); if (!top) return null;
  const alvo = parseInt(e.series) || ok.length;
  const bateu = ok.length >= alvo && ok.every(s => (num(s.reps) || 0) >= top);
  const step = kg < 20 ? 2 : kg < 40 ? 2.5 : 5;
  if (bateu) return { kg: kg + step, tipo:'sobe', msg:`Você fez todas as séries com ${top}+ reps em ${fmtN(kg)} kg. Suba pra ${fmtN(kg + step)} kg.` };
  return { kg, tipo:'mantem', msg:`Mantenha ${fmtN(kg)} kg e tente chegar a ${top} reps em todas as séries.` };
}

/* ---------- mapa muscular ---------- */
const GRUPOS = [
  ['peito','Peito'],['ombro','Ombros'],['costas','Costas'],['biceps','Bíceps'],['triceps','Tríceps'],['abdomen','Abdômen'],
  ['quad','Quadríceps'],['posterior','Posterior de coxa'],['gluteo','Glúteo'],['adutor','Adutores'],['panturrilha','Panturrilha']
];
const semAcento = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const REGRAS = [
  [/posterior de ombro|crucifixo inverso|face pull|voador inverso/, ['ombro']],
  [/leg ?press|agachamento|hack|afundo|passada|bulgaro/, ['quad','gluteo']],
  [/extensora/, ['quad']],
  [/flexora|stiff|nordico|terra romeno/, ['posterior']],
  [/abdutora|elevacao pelvica|ponte|hip thrust|gluteo|coice/, ['gluteo']],
  [/adutora/, ['adutor']],
  [/panturrilha|gemeos/, ['panturrilha']],
  [/prancha|abdominal|abdomen|crunch/, ['abdomen']],
  [/supino|fly|crucifixo|peck|crossover|flexao de braco/, ['peito']],
  [/elevacao lateral|elevacao frontal|desenvolvimento|ombro/, ['ombro']],
  [/remada|puxada|pulldown|barra fixa|serrote|costas/, ['costas']],
  [/biceps|rosca/, ['biceps']],
  [/triceps|mergulho|frances/, ['triceps']],
  [/futsal|futebol|corrida|bike|bicicleta/, ['quad','posterior','panturrilha','adutor']]
];
function musculosDe(nome){ const n = semAcento(nome); for (const [re, g] of REGRAS) if (re.test(n)) return g; return []; }
function estadoMusculos(){
  const H = hoje(), sem = addDays(H, -6), info = {};
  GRUPOS.forEach(([id]) => { info[id] = { ultimo:null, series:0 }; });
  Object.keys(S).filter(k => k.startsWith('dia:') && k.slice(4) <= H).forEach(k => {
    const ds = k.slice(4), L = S[k];
    const marca = (gs, n) => gs.forEach(g => { const x = info[g]; if (!x) return; if (!x.ultimo || ds > x.ultimo) x.ultimo = ds; if (ds >= sem) x.series += n; });
    Object.values(L.treino || {}).forEach(r => { const n = (r.series || []).filter(s => s.ok).length; if (n) marca(musculosDe(r.nome), n); });
    Object.keys(L.ativ || {}).forEach(a => { if (L.ativ[a]) marca(musculosDe(a), 0); });
  });
  GRUPOS.forEach(([id]) => {
    const x = info[id];
    x.dias = x.ultimo ? Math.round((parse(H) - parse(x.ultimo)) / 864e5) : null;
    x.st = x.dias == null || x.dias >= 7 ? 'parado' : x.dias <= 1 ? 'rec' : x.dias === 2 ? 'quase' : 'pronto';
  });
  return info;
}
function corSt(st){ return { rec:'var(--accent)', quase:'var(--warn)', pronto:'var(--ok)', parado:'#4A4B53' }[st]; }
// boneco frente/costas; fill(id) devolve os atributos de pintura de cada grupo
function corpoSvgs(fill, cls){
  const N = 'fill="#1C1C20"', f = id => fill(id);
  const frente = `<svg viewBox="0 0 100 190" class="${cls}" role="img" aria-label="Músculos, vista de frente">
    <circle cx="50" cy="13" r="9" ${N}/><rect x="45" y="21" width="10" height="8" ${N}/>
    <ellipse cx="31" cy="37" rx="8" ry="7" ${f('ombro')}/><ellipse cx="69" cy="37" rx="8" ry="7" ${f('ombro')}/>
    <rect x="34" y="32" width="15.5" height="17" rx="5" ${f('peito')}/><rect x="50.5" y="32" width="15.5" height="17" rx="5" ${f('peito')}/>
    <rect x="20" y="45" width="9" height="22" rx="4.5" ${f('biceps')}/><rect x="71" y="45" width="9" height="22" rx="4.5" ${f('biceps')}/>
    <rect x="17" y="69" width="8" height="24" rx="4" ${N}/><rect x="75" y="69" width="8" height="24" rx="4" ${N}/>
    <rect x="38" y="51" width="24" height="31" rx="6" ${f('abdomen')}/>
    <path d="M36 84h28l2 8H34z" ${N}/>
    <rect x="34" y="94" width="13" height="44" rx="6.5" ${f('quad')}/><rect x="53" y="94" width="13" height="44" rx="6.5" ${f('quad')}/>
    <rect x="47.5" y="95" width="5" height="26" rx="2.5" ${f('adutor')}/>
    <rect x="36" y="142" width="10" height="40" rx="5" ${N}/><rect x="54" y="142" width="10" height="40" rx="5" ${N}/>
  </svg>`;
  const costas = `<svg viewBox="0 0 100 190" class="${cls}" role="img" aria-label="Músculos, vista de costas">
    <circle cx="50" cy="13" r="9" ${N}/><rect x="45" y="21" width="10" height="8" ${N}/>
    <ellipse cx="31" cy="37" rx="8" ry="7" ${f('ombro')}/><ellipse cx="69" cy="37" rx="8" ry="7" ${f('ombro')}/>
    <path d="M36 31h28l-3 50H39z" ${f('costas')}/>
    <rect x="20" y="45" width="9" height="22" rx="4.5" ${f('triceps')}/><rect x="71" y="45" width="9" height="22" rx="4.5" ${f('triceps')}/>
    <rect x="17" y="69" width="8" height="24" rx="4" ${N}/><rect x="75" y="69" width="8" height="24" rx="4" ${N}/>
    <ellipse cx="42.5" cy="93" rx="8.5" ry="9" ${f('gluteo')}/><ellipse cx="57.5" cy="93" rx="8.5" ry="9" ${f('gluteo')}/>
    <rect x="34" y="104" width="13" height="34" rx="6.5" ${f('posterior')}/><rect x="53" y="104" width="13" height="34" rx="6.5" ${f('posterior')}/>
    <ellipse cx="41" cy="155" rx="6" ry="13" ${f('panturrilha')}/><ellipse cx="59" cy="155" rx="6" ry="13" ${f('panturrilha')}/>
    <rect x="37" y="170" width="8" height="12" rx="4" ${N}/><rect x="55" y="170" width="8" height="12" rx="4" ${N}/>
  </svg>`;
  return { frente, costas };
}
function mapaHtml(){
  const M = estadoMusculos();
  const { frente, costas } = corpoSvgs(id => `fill="${corSt(M[id].st)}"`, 'body');
  const lista = GRUPOS.map(([id, nome]) => {
    const x = M[id];
    const quando = x.dias == null ? 'sem registro' : x.dias === 0 ? 'hoje' : x.dias === 1 ? 'ontem' : 'há ' + x.dias + ' dias';
    return `<div class="mg"><i style="background:${corSt(x.st)}"></i><span class="lm"><b>${nome}</b><span class="rd">${quando}${x.series ? ' · ' + x.series + ' séries na semana' : ''}</span></span></div>`;
  }).join('');
  return `<div class="bodies"><div><span class="lbl">Frente</span>${frente}</div><div><span class="lbl">Costas</span>${costas}</div></div>
    <div class="legend2"><span><i style="background:var(--accent)"></i>Recuperando</span><span><i style="background:var(--warn)"></i>Quase</span><span><i style="background:var(--ok)"></i>Pronto</span><span><i style="background:#4A4B53"></i>Parado 7+ dias</span></div>
    <div class="mgrid">${lista}</div>`;
}

/* ---------- notificações ---------- */
let pushOn = false;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const b64ToU8 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const b = atob((s + p).replace(/-/g,'+').replace(/_/g,'/')); return Uint8Array.from(b, ch => ch.charCodeAt(0)); };
async function checkPush(){
  try {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) { pushOn = false; return; }
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && reg.pushManager && await reg.pushManager.getSubscription();
    pushOn = !!sub && Notification.permission === 'granted';
  } catch(e){ pushOn = false; }
}
async function ativarPush(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)){
    alert(isIOS && !standalone ? 'No iPhone, abra o Meu Treino pelo ícone da tela de início (não pelo Safari) e tente de novo.' : 'Este navegador não suporta notificações.');
    return;
  }
  if (!CFG.VAPID_PUBLIC || /COLE_AQUI/.test(CFG.VAPID_PUBLIC)){ alert('Falta a chave VAPID_PUBLIC no config.js (veja o guia de notificações).'); return; }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted'){ alert('Permissão negada. No iPhone: Ajustes › Notificações › Meu Treino.'); return; }
  try {
    const reg = await navigator.serviceWorker.register('sw.js');
    await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:b64ToU8(CFG.VAPID_PUBLIC) });
    const j = sub.toJSON();
    const { error } = await sb.from('push_subs').upsert({ endpoint:j.endpoint, user_id:user.id, sub:j }, { onConflict:'endpoint' });
    if (error) throw error;
    pushOn = true; toast('🔔 Notificações ativadas'); keepScroll(render);
  } catch(e){ alert('Não consegui ativar: ' + (e.message || e)); }
}
async function desativarPush(){
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    if (sub){ await sb.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe(); }
  } catch(e){}
  pushOn = false; toast('Notificações desativadas neste aparelho'); keepScroll(render);
}
async function testePush(){
  try {
    const { data } = await sb.auth.getSession();
    const r = await fetch(CFG.SUPABASE_URL + '/functions/v1/lembretes', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + data.session.access_token, apikey:CFG.SUPABASE_ANON_KEY }, body:JSON.stringify({ teste:true }) });
    if (r.ok){ toast('📨 Teste enviado. Deve chegar em segundos'); return; }
    let msg = ''; try { msg = (await r.json()).erro || ''; } catch(_){}
    if (r.status === 404 && !msg) msg = 'Função "lembretes" não encontrada. Confira o nome no Supabase.';
    if (r.status === 401 && !msg) msg = 'O Supabase barrou o pedido. Desligue "Verify JWT" na função.';
    alert('Teste falhou (' + r.status + '): ' + (msg || 'confira a função no Supabase'));
  } catch(e){ alert('Não consegui falar com a função. Confira: 1) nome "lembretes"; 2) "Verify JWT" desligado; 3) segredos do passo 4. (' + (e.message || e) + ')'); }
}
function lembretesPadrao(){
  const L = { treino:'18:00', aguaCada:2, aguaIni:'09:00', aguaFim:'21:00', agendaMin:60, supl:{} };
  const hora = n => { n = semAcento(n); if (/acnever/.test(n)) return '12:30'; if (/ioimbina/.test(n)) return '17:30'; if (/testosterona/.test(n)) return ''; return '07:30'; };
  (P().suplementos || []).forEach(s => { const h = hora(s.nome); if (h) L.supl[s.id] = h; });
  return L;
}
function notifHtml(){
  const L = S.lembretes || {};
  let h = '';
  if (pushOn){
    h += '<p class="okline">🔔 Ativadas neste aparelho</p><div class="tbtns"><button class="btn" data-act="pushtest">Enviar teste</button><button class="btn" data-act="pushoff">Desativar</button></div>';
  } else {
    if (isIOS && !standalone) h += '<p class="tip">No iPhone, as notificações só funcionam com o app aberto pelo <b>ícone da tela de início</b> (iOS 16.4 ou mais novo).</p>';
    h += '<button class="btn primary" data-act="pushon">Ativar notificações</button>';
  }
  const opt = (v, cur, txt) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${txt}</option>`;
  h += `<div class="fields flat" style="margin-top:14px">
    <label class="full">Lembrete de treino<input type="time" data-lf="treino" value="${esc(L.treino || '')}"></label>
    <label>Água: lembrar a cada<select data-lf="aguaCada">${opt(0, L.aguaCada, 'Desligado')}${opt(1, L.aguaCada, '1 hora')}${opt(2, L.aguaCada, '2 horas')}${opt(3, L.aguaCada, '3 horas')}</select></label>
    <label>Compromissos<select data-lf="agendaMin">${opt(0, L.agendaMin, 'Desligado')}${opt(30, L.agendaMin, '30 min antes')}${opt(60, L.agendaMin, '1 hora antes')}${opt(120, L.agendaMin, '2 horas antes')}</select></label>
    <label>Água: das<input type="time" data-lf="aguaIni" value="${esc(L.aguaIni || '09:00')}"></label>
    <label>até<input type="time" data-lf="aguaFim" value="${esc(L.aguaFim || '21:00')}"></label></div>
    <p class="tip" style="margin-top:12px">O horário de cada suplemento fica em <b>Plano › Suplementos › Lembrar às</b>. O lembrete de água só vem se você ainda não bateu a meta, e o de suplemento só se ainda não marcou.</p>`;
  return h;
}

const ICONE_TREINO = {
  bola: `<svg viewBox="0 0 120 120" class="ic-dia" role="img" aria-label="Dia de futsal"><circle cx="60" cy="60" r="44" fill="#EFEDE8"/><path d="M60 40l17 12-6 20H49l-6-20z" fill="#161618"/><path d="M60 16v24M77 52l25-6M71 72l14 22M49 72L35 94M43 52l-25-6" stroke="#161618" stroke-width="4" stroke-linecap="round"/><path d="M60 16a44 44 0 0 1 42 30M102 46a44 44 0 0 1-17 48M85 94a44 44 0 0 1-50 0M35 94a44 44 0 0 1-17-48M18 46a44 44 0 0 1 42-30" fill="none" stroke="#161618" stroke-width="2" opacity=".25"/><ellipse cx="60" cy="112" rx="30" ry="4" fill="#000" opacity=".35"/></svg>`,
  cardio: `<svg viewBox="0 0 120 120" class="ic-dia" role="img" aria-label="Dia de cardio"><path d="M60 98S20 74 20 44a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 30-40 54-40 54z" fill="#D7191F"/><path d="M14 60h26l8-14 10 28 9-20 5 6h34" fill="none" stroke="#EFEDE8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  descanso: `<svg viewBox="0 0 120 120" class="ic-dia" role="img" aria-label="Dia de descanso"><path d="M78 22a40 40 0 1 0 22 52 32 32 0 0 1-22-52z" fill="#EFEDE8"/><circle cx="90" cy="30" r="3" fill="#F2C230"/><circle cx="100" cy="48" r="2" fill="#F2C230"/></svg>`,
  halter: `<svg viewBox="0 0 120 120" class="ic-dia" role="img" aria-label="Treino"><rect x="30" y="56" width="60" height="8" rx="4" fill="#8E8C88"/><rect x="14" y="36" width="14" height="48" rx="4" fill="#D7191F"/><rect x="92" y="36" width="14" height="48" rx="4" fill="#D7191F"/></svg>`
};

/* ---------- componentes: Placar (LED) + Stories (cards deslizáveis) + Anéis ---------- */
const trackPos = {};
function anelSvg(rings, size, cls){
  // rings: [{r, cor, f, sw}] num viewBox de 44
  return `<svg class="${cls || ''}" viewBox="0 0 44 44" width="${size}" height="${size}" aria-hidden="true">` + rings.map(x => {
    const C = 2 * Math.PI * x.r, f = Math.max(0, Math.min(1, x.f || 0));
    return `<circle cx="22" cy="22" r="${x.r}" fill="none" stroke="${x.cor}" stroke-opacity=".2" stroke-width="${x.sw || 5}"/><circle cx="22" cy="22" r="${x.r}" fill="none" stroke="${x.cor}" stroke-width="${x.sw || 5}" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - f)).toFixed(1)}"/>`;
  }).join('') + '</svg>';
}
const CORT = '#FF4A3F', CORA = '#4C8DFF', CORD = '#3DD68C';
function tri3(a, b, c, size){ return anelSvg([{ r:18, cor:CORT, f:a, sw:4.5 }, { r:12.5, cor:CORA, f:b, sw:4.5 }, { r:7, cor:CORD, f:c, sw:4.5 }], size || 38, 'tri'); }
function stories(id, cards, start){
  if (!cards.length) return '';
  return `<div class="sbars" data-for="${id}" style="grid-template-columns:repeat(${cards.length},1fr)">${cards.map(() => '<i><b></b></i>').join('')}</div>
    <div class="strack" id="${id}" data-n="${cards.length}"${start ? ` data-start="${start}"` : ''}>${cards.join('')}<span class="send" aria-hidden="true"></span></div>`;
}
function initTracks(){
  document.querySelectorAll('.strack').forEach(tr => {
    const id = tr.id, cards = tr.querySelectorAll('.scard'), bars = document.querySelectorAll(`.sbars[data-for="${id}"] b`);
    const step = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
    const upd = () => {
      const k = Math.round(tr.scrollLeft / step());
      bars.forEach((b, j) => { b.style.width = j <= k ? '100%' : '0'; });
      trackPos[id] = tr.scrollLeft;
    };
    if (trackPos[id] != null) tr.scrollLeft = trackPos[id];
    else if (tr.dataset.start){ tr.scrollLeft = parseInt(tr.dataset.start) * step(); }
    tr.addEventListener('scroll', upd, { passive:true });
    upd();
  });
}
function irCard(id, k){
  const tr = document.getElementById(id); if (!tr) return;
  const cards = tr.querySelectorAll('.scard'); if (!cards[k]) return;
  tr.scrollTo({ left: cards[k].offsetLeft - cards[0].offsetLeft, behavior:'smooth' });
}
function contagem(o){
  const agora = new Date();
  if (o.e.hora){
    const p = o.e.hora.split(':').map(Number), dt = parse(o.data); dt.setHours(p[0], p[1]);
    const hrs = (dt - agora) / 3600000;
    if (hrs < 0) return { n:'AGORA', u:'' };
    if (hrs < 1) return { n:String(Math.max(1, Math.round(hrs * 60))), u:'MIN' };
    if (hrs < 24) return { n:String(Math.round(hrs)), u:'HORAS' };
  }
  const d = Math.round((parse(o.data) - parse(hoje())) / 864e5);
  return d <= 0 ? { n:'HOJE', u:'' } : { n:pad2(d), u: d === 1 ? 'DIA' : 'DIAS' };
}
function diaFrac(ds){
  const X = S['dia:' + ds]; if (!X) return [0, 0, 0];
  const i = idxOf(parse(ds)), ti = X.treinoDia != null ? X.treinoDia : i, t = P().treinos[ti] || { itens:[] };
  let tt = 0, to = 0;
  t.itens.forEach(e => { tt++; const r = (X.treino||{})[e.id]; if (r && r.series.length && r.series.every(s => s.ok)) to++; });
  if (t.cardio){ tt++; if (X.cardio) to++; }
  (t.atividades||[]).forEach(a => { tt++; if ((X.ativ||{})[a]) to++; });
  const sup = P().suplementos.filter(s => (s.dias||[]).includes(i));
  const dt = P().refeicoes.length + sup.length, dok = P().refeicoes.filter(m => (X.ref||{})[m.id]).length + sup.filter(s => (X.supl||{})[s.id]).length;
  return [tt ? to / tt : 0, (X.agua || 0) / (P().metaAgua || 3500), dt ? dok / dt : 0];
}

function renderHoje(){
  const d = parse(cur), i = idxOf(d), isToday = cur === hoje();
  const L = dia(cur), ti = tIdx(cur), trocado = ti !== i;
  const t = P().treinos[ti] || { nome:'', itens:[], atividades:[] };
  const sup = P().suplementos.filter(s => (s.dias||[]).includes(i));
  let tot = 0, ok = 0, exOk = 0, refOk = 0;
  t.itens.forEach(e => { tot++; const r = L.treino[e.id]; if (r && r.series.length && r.series.every(s => s.ok)){ ok++; exOk++; } });
  if (t.cardio){ tot++; if (L.cardio) ok++; }
  (t.atividades||[]).forEach(a => { tot++; if (L.ativ[a]) ok++; });
  P().refeicoes.forEach(m => { tot++; if (L.ref[m.id]){ ok++; refOk++; } });
  sup.forEach(s => { tot++; if (L.supl[s.id]) ok++; });
  const pct = tot ? Math.round(ok / tot * 100) : 0;
  const meta = P().metaAgua || 3500;

  // ---- cabeçalho, semana e a barra ----
  const NOME = 'Gabriel';
  const hr = new Date().getHours();
  const saud = hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
  const treinou = X => X && (X.cardio || Object.values(X.ativ||{}).some(Boolean) || Object.values(X.treino||{}).some(r => (r.series||[]).some(s => s.ok)));
  let streak = 0, sd = hoje();
  if (!treinou(S['dia:' + sd])) sd = addDays(sd, -1);
  while (treinou(S['dia:' + sd])){ streak++; sd = addDays(sd, -1); }
  const ini = addDays(cur, -i);
  const LET = ['S','T','Q','Q','S','S','D'];
  let wk = `<button class="wk-arrow" data-act="wprev" aria-label="Semana anterior">${ICON.l}</button>`;
  for (let k = 0; k < 7; k++){
    const ds = addDays(ini, k), on = ds === cur, td = ds === hoje(), dn = treinou(S['dia:' + ds]);
    wk += `<button class="wk-day ${on?'on':''} ${td?'today':''}" data-act="goday" data-id="${ds}" aria-label="${DIAS_F[k]} ${fmtD(ds)}${dn ? ', treinou' : ''}"><span>${LET[k]}</span><b>${parse(ds).getDate()}</b><i class="${dn?'dn':''}"></i></button>`;
  }
  wk += `<button class="wk-arrow" data-act="wnext" aria-label="Próxima semana">${ICON.r}</button>`;

  const dataTxt = (isToday ? 'Hoje, ' : DIAS_F[i] + ', ') + d.getDate() + ' de ' + MESES[d.getMonth()];
  let h = `<header class="top"><div class="tl"><span class="dt">${dataTxt}${isToday ? '' : ' <button class="lnk" data-act="dtoday">voltar pra hoje</button>'}</span><span class="hi">${saud}, ${NOME}</span></div>${streak ? `<span class="streak" title="Dias seguidos com treino"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/></svg><b>${streak}</b> ${streak === 1 ? 'dia' : 'dias'}</span>` : ''}</header>`;
  h += `<nav class="week" aria-label="Dias da semana">${wk}</nav>`;

  // ---- cards do dia (Stories) ----
  const nome = t.nome || 'Descanso';
  const fs = nome.length <= 12 ? 40 : nome.length <= 20 ? 36 : nome.length <= 28 ? 32 : 28;
  const agora = new Date(), hhmm = pad2(agora.getHours()) + ':' + pad2(agora.getMinutes());
  const prox = ocorrencias(hoje(), addDays(hoje(), 30)).find(o => o.data > hoje() || !o.e.hora || o.e.hora >= hhmm);
  const cards = [];
  let serTot = 0, serOk = 0, dots = '';
  t.itens.forEach(e => { const r = getEx(L, e); r.series.forEach(s => { serTot++; if (s.ok) serOk++; dots += `<i class="${s.ok ? 'on' : ''}"></i>`; }); });
  const volHoje = volDia(L);
  const atual = t.itens.findIndex(e => !exFeito(L, e));
  const swapBtn = `<button class="sswap" data-act="tpick" aria-label="Trocar treino">${ICON.swap}</button>`;
  if (t.itens.length){
    let clk = '<span class="led amb dim">0:00</span>';
    if (L.inicio && !L.fim) clk = `<span class="led amb" id="tdur">${fmtDur(Date.now() - L.inicio)}</span>`;
    else if (L.inicio && L.fim) clk = `<span class="led amb">${fmtDur(L.fim - L.inicio)}</span>`;
    let cont = '', cta;
    if (atual >= 0){
      const e = t.itens[atual], r = getEx(L, e), nOk = r.series.filter(s => s.ok).length;
      const kg = r.series[Math.min(nOk, r.series.length - 1)].kg || kgPadrao(e, r, nOk);
      cont = `<div class="snext"><span class="led wht">${pad2(atual + 1)}</span><span class="lm"><small>${nOk ? 'Continuar' : exOk ? 'Próximo exercício' : 'Comece por'}</small><b>${esc(e.nome)}</b><span>Série ${Math.min(nOk + 1, r.series.length)} de ${r.series.length}${kg ? ', ' + esc(kg) + ' kg' : ''}</span></span></div>`;
      cta = `<button class="scta" data-act="modo" data-ex="${e.id}">▶ ${L.inicio ? 'Continuar no modo treino' : 'Abrir modo treino'}</button>`;
    } else if (!L.fim) cta = '<button class="scta" data-act="tfim">Finalizar e ver o resumo</button>';
    else cta = '<button class="scta ghost" data-act="modo">Ver resumo do treino</button>';
    const tlink = !L.inicio ? '<button class="slink" data-act="tedit">lançar tempo à mão</button>' : !L.fim ? '<button class="slink" data-act="tfim">finalizar treino</button>' : '<button class="slink" data-act="tedit">editar tempo</button>';
    cards.push(`<section class="scard red"><div class="shead"><div><span class="k">${isToday ? 'Treino de hoje' : 'Treino de ' + DIAS_F[i].toLowerCase()}${trocado ? ' (trocado)' : ''}</span><h2 class="stt" style="font-size:${fs}px">${esc(nome)}</h2></div>${swapBtn}</div>
      <div class="board"><div class="sc3"><div class="tm"><span>FEITOS</span><b class="led">${exOk}</b></div><div class="tm clk">${clk}<span>TEMPO</span></div><div class="tm"><span>FALTAM</span><b class="led wht">${t.itens.length - exOk}</b></div></div>
        <div class="ldots">${dots}</div><div class="bcap">${serOk} DE ${serTot} SÉRIES · <span id="vvol">${Math.round(volHoje).toLocaleString('pt-BR')}</span> KG</div></div>
      ${cont}<div class="sgrow"></div>${cta}${tlink}</section>`);
  } else {
    const ats = [...(t.cardio ? [{ act:'cardio', id:'', nome:t.cardio, on:!!L.cardio }] : []), ...(t.atividades||[]).map(a => ({ act:'ativ', id:a, nome:a, on:!!L.ativ[a] }))];
    const txt = ats.map(a => a.nome).join(' ');
    const ic = /futsal|futebol/i.test(txt) ? ICONE_TREINO.bola : t.cardio ? ICONE_TREINO.cardio : ICONE_TREINO.descanso;
    cards.push(`<section class="scard ${ats.length ? 'red' : 'dark'}"><div class="shead"><div><span class="k">${isToday ? 'Hoje' : DIAS_F[i]}</span><h2 class="stt" style="font-size:${fs}px">${esc(nome)}</h2></div>${swapBtn}</div>
      <div class="sic">${ic}</div>${ats.length ? ats.map(a => `<button class="stog ${a.on ? 'on' : ''}" data-act="${a.act}" data-id="${esc(a.id)}"><span class="c">${CHECK}</span>${esc(a.nome)}</button>`).join('') : '<p class="sp">Dia livre. Descanse ou faça um cardio leve.</p>'}<div class="sgrow"></div></section>`);
  }
  // próxima refeição
  const refs = P().refeicoes, pend = refs.filter(m => !L.ref[m.id]);
  const prxRef = pend.find(m => !m.hora || m.hora >= hhmm) || pend[0];
  if (refs.length) cards.push(prxRef
    ? `<section class="scard dark"><span class="k">Próxima refeição${prxRef.hora ? ', ' + esc(prxRef.hora) : ''}</span><h2 class="stt">${esc(prxRef.nome)}</h2><ul class="slist">${(prxRef.itens||[]).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
       <div class="sgrow"></div><div class="sfoot"><span class="led grn">${refOk}/${refs.length}</span><span>refeições hoje</span></div><button class="scta green" data-act="ref" data-id="${prxRef.id}">Comi</button></section>`
    : `<section class="scard dark"><span class="k">Alimentação</span><h2 class="stt">Tudo certo</h2><p class="sp">Todas as ${refs.length} refeições marcadas.</p><div class="sgrow"></div><div class="sfoot"><span class="led grn">${refs.length}/${refs.length}</span><span>refeições hoje</span></div></section>`);
  // suplementos
  const supPend = sup.filter(x => !L.supl[x.id]);
  if (sup.length) cards.push(`<section class="scard dark"><span class="k">Suplementos</span><h2 class="stt">${supPend.length ? 'Faltam ' + supPend.length : 'Todos tomados'}</h2>
    <div class="ssup">${supPend.slice(0, 4).map(x => `<div class="ssr"><span class="lm"><b>${esc(x.nome)}</b><span>${esc([x.dose, x.hora].filter(Boolean).join(', '))}</span></span><button class="mini2" data-act="supl" data-id="${x.id}">Tomei</button></div>`).join('')}</div>
    <div class="sgrow"></div><div class="sfoot"><span class="led grn">${sup.length - supPend.length}/${sup.length}</span><span>tomados hoje</span></div></section>`);
  // água
  const aguaF = (L.agua || 0) / meta;
  cards.push(`<section class="scard blue"><span class="k">Água</span><div class="sagua"><div><b class="led blu big">${fmtN((L.agua||0)/1000)}</b><span class="bcap">DE ${fmtN(meta/1000)} L</span></div>${anelSvg([{ r:18, cor:'#4C8DFF', f:aguaF, sw:5 }], 96, 'sring')}</div>
    <div class="sgrow"></div><div class="s3"><button class="scta blue2" data-act="agua" data-v="250">+250</button><button class="scta blue2" data-act="agua" data-v="500">+500</button><button class="scta ghost" data-act="agua" data-v="-250" aria-label="Tirar 250 ml">−</button></div></section>`);
  // compromisso
  if (prox){
    const c = contagem(prox), tit = prox.e.titulo || TIPOS[prox.e.tipo] || '';
    const dl = prox.data === hoje() ? 'Hoje' : prox.data === addDays(hoje(), 1) ? 'Amanhã' : DIAS_F[idxOf(parse(prox.data))] + ', ' + fmtD(prox.data);
    cards.push(`<section class="scard gold"><span class="k">Próximo compromisso</span><h2 class="stt">${esc(tit)}</h2>
      <div class="board"><div class="sc2"><div class="tm"><span>${c.u || 'QUANDO'}</span><b class="led amb">${c.n}</b></div><div class="tm"><span>HORA</span><b class="led wht">${esc(prox.e.hora || '--:--')}</b></div></div></div>
      <p class="sp">${dl}${prox.e.local ? ', ' + esc(prox.e.local) : ''}</p><div class="sgrow"></div><button class="scta dark2" data-act="tabag">Ver agenda</button></section>`);
  }
  h += stories('st-hoje', cards);

  // ---- anéis do dia ----
  const fT = t.itens.length ? exOk / t.itens.length : (() => { const a = [t.cardio ? !!L.cardio : null, ...(t.atividades||[]).map(x => !!L.ativ[x])].filter(x => x !== null); return a.length ? a.filter(Boolean).length / a.length : 0; })();
  const dT = refs.length + sup.length, dOk = refOk + (sup.length - supPend.length);
  const tLbl = t.itens.length ? `${exOk}/${t.itens.length}` : Math.round(fT * 100) + '%';
  h += `<div class="rings3">
    <button class="rg" data-act="stgo" data-id="st-hoje" data-i="0">${anelSvg([{ r:18, cor:CORT, f:fT }], 42)}<span><b class="led">${tLbl}</b><small>Treino</small></span></button>
    <button class="rg" data-act="stgo" data-id="st-hoje" data-i="${cards.length - (prox ? 2 : 1)}">${anelSvg([{ r:18, cor:CORA, f:aguaF }], 42)}<span><b class="led blu">${fmtN((L.agua||0)/1000)}L</b><small>Água</small></span></button>
    <button class="rg" data-act="stgo" data-id="st-hoje" data-i="1">${anelSvg([{ r:18, cor:CORD, f: dT ? dOk / dT : 0 }], 42)}<span><b class="led grn">${dOk}/${dT}</b><small>Dieta</small></span></button>
  </div>`;

  // ---- falta hoje ----
  const falta = [];
  if ((L.agua || 0) < meta) falta.push(`<div class="fit"><i style="background:${CORA}"></i><span class="lm"><b>Água</b><span>Faltam ${fmtN((meta - (L.agua||0)) / 1000)} L</span></span><button class="mini2 blue" data-act="agua" data-v="250">+250</button></div>`);
  pend.filter(m => m !== prxRef).slice(0, 2).forEach(m => falta.push(`<div class="fit"><i style="background:${CORD}"></i><span class="lm"><b>${esc(m.nome)}</b><span>${esc((m.itens||[]).join(', '))}</span></span>${m.hora ? `<em>${esc(m.hora)}</em>` : ''}</div>`));
  supPend.slice(0, 2).forEach(x => falta.push(`<div class="fit"><i style="background:${CORD}"></i><span class="lm"><b>${esc(x.nome)}</b><span>${esc(x.hora || x.dose || '')}</span></span><button class="mini2" data-act="supl" data-id="${x.id}">Tomei</button></div>`));
  if (isToday && falta.length) h += `<h2 class="sh2">Falta hoje</h2><div class="fcard">${falta.slice(0, 5).join('')}</div>`;

  if (pickOpen){
    let pk = '<p class="tip">Escolha qual treino do plano você vai fazer hoje. O histórico e as cargas acompanham o treino escolhido.</p>';
    DIAS_F.forEach((n,k) => {
      const tt = P().treinos[k]; if (!tt) return;
      const desc = [tt.itens.length ? tt.itens.length + ' exercícios' : '', tt.cardio || '', (tt.atividades||[]).join(', ')].filter(Boolean).join(' · ') || 'sem exercícios';
      pk += `<button class="row pick ${k===ti?'done':''}" data-act="tset" data-id="${k}"><span class="c">${CHECK}</span><span class="rowmain"><span class="rn">${esc(tt.nome || 'Descanso')}</span><span class="rd">${DIAS[k]}${k===i?' (padrão de hoje)':''} · ${esc(desc)}</span></span></button>`;
    });
    pk += '<button class="btn" data-act="tclose">Cancelar</button>';
    h += panel('Trocar treino', ICON.swap, pk);
  }

  if (L.fim) h += resumoHtml(L, cur);

  // hoje: só o que ainda vai acontecer e não está no bloco pequeno; outros dias: tudo
  let evs = ocorrencias(cur, cur);
  if (isToday) evs = evs.filter(o => (!o.e.hora || o.e.hora >= hhmm) && !(prox && o.e.id === prox.e.id && o.data === prox.data));
  if (evs.length) h += panel(isToday ? 'Ainda hoje' : 'Compromissos', IC.agenda, evs.map(o => evtHtml(o, false)).join(''));

  let b = '';
  if (t.itens.length) b += `<button class="btn primary modo-btn" data-act="modo">${t.itens.some(x => !exFeito(L, x)) ? '▶ Abrir modo treino' : '▶ Ver resumo no modo treino'}</button>`;
  if (P().obs && t.itens.length) b += `<p class="tip">${esc(P().obs)}</p>`;
  if (!t.itens.length && !t.cardio && !(t.atividades||[]).length) b += '<p class="muted">Nada planejado pra hoje. Dá pra editar na aba Plano.</p>';
  t.itens.forEach(e => {
    const r = getEx(L, e), last = lastSets(e, cur);
    const nOk = r.series.filter(s => s.ok).length, done = r.series.length && nOk === r.series.length;
    const mx = maxOk(r), prevB = mx != null ? bestKg(e.nome, cur) : null, isPR = prevB != null && mx > prevB;
    const lastTxt = last ? last.filter(s => s.kg || s.reps).map(s => (s.kg||'–') + '×' + (s.reps||'–')).join(' · ') : '';
    b += `<details class="ex ${done?'done':''}" data-ex="${e.id}" ${openEx[e.id]?'open':''}><summary><span class="dot"></span><span class="exm"><span class="rn">${esc(e.nome)}${isPR ? ' <span class="prb">🏆 recorde</span>' : ''}</span><span class="rd">${esc(e.series)}×${esc(e.reps)}${e.obs?' · '+esc(e.obs):''}</span></span><span class="cnt">${nOk}/${r.series.length}</span></summary><div class="sets">`;
    if (lastTxt) b += `<p class="cap">Última vez (kg×reps): ${esc(lastTxt)}</p>`;
    const sg = sugestao(e, cur);
    if (sg && !done) b += `<div class="sug ${sg.tipo}"><span class="lm"><b>${sg.tipo === 'sobe' ? '▲ SUBIR CARGA' : '= MANTER CARGA'}</b><span>${esc(sg.msg)}</span></span><button class="sugb" data-act="usasug" data-ex="${e.id}" data-v="${sg.kg}">Usar ${fmtN(sg.kg)} kg</button></div>`;
    b += '<div class="sh"><span>#</span><span>kg</span><span>reps</span><span></span><span></span></div>';
    r.series.forEach((s,k) => {
      const ph = sg ? String(sg.kg).replace('.', ',') : last && last[k] ? last[k].kg : '';
      b += `<div class="sr ${s.ok?'done':''}"><span class="sn">${k+1}</span>
        <input inputmode="decimal" aria-label="Carga série ${k+1}" data-f="kg" data-ex="${e.id}" data-i="${k}" value="${esc(s.kg)}" placeholder="${esc(ph)}">
        <input inputmode="numeric" aria-label="Repetições série ${k+1}" data-f="reps" data-ex="${e.id}" data-i="${k}" value="${esc(s.reps)}" placeholder="${esc(numReps(e.reps))}">
        <button class="chk" data-act="setok" data-ex="${e.id}" data-i="${k}" aria-label="Concluir série ${k+1}"><span class="c">${CHECK}</span></button>
        <button class="rm" data-act="delset" data-ex="${e.id}" data-i="${k}" aria-label="Remover série">×</button></div>`;
    });
    b += `<button class="add sm" data-act="addset" data-ex="${e.id}">+ série</button></div></details>`;
  });
  if (t.cardio) b += checkRow('cardio', '', esc(t.cardio), !!L.cardio);
  (t.atividades||[]).forEach(a => { b += checkRow('ativ', a, esc(a), !!L.ativ[a]); if (L.ativ[a]) b += jogoHtml(L, a); });
  h += panel('Treino', IC.treino, b, t.itens.length ? `<span class="pc">${exOk}/${t.itens.length}</span>` : '');

  b = P().refeicoes.map(m => checkRow('ref', m.id, (m.hora ? esc(m.hora)+' · ' : '') + esc(m.nome), !!L.ref[m.id], esc((m.itens||[]).join(' · ')))).join('');
  h += panel('Alimentação', IC.comida, b, `<span class="pc">${refOk}/${P().refeicoes.length}</span>`);

  const supOk = sup.filter(s => L.supl[s.id]).length;
  b = sup.length ? sup.map(s => checkRow('supl', s.id, esc(s.nome) + (s.dose ? ' · ' + esc(s.dose) : ''), !!L.supl[s.id], esc(s.hora||''))).join('') : '<p class="muted">Nenhum pra hoje.</p>';
  h += panel('Suplementos', IC.supl, b, sup.length ? `<span class="pc">${supOk}/${sup.length}</span>` : '');


  h += panel('Anotações do dia', IC.nota, `<div class="f" style="margin-top:0"><textarea rows="3" data-f="nota" placeholder="Dor na pubalgia, sono, disposição…">${esc(L.nota||'')}</textarea></div>`);
  VIEW.innerHTML = h;
  clearInterval(tick);
  if (L.inicio && !L.fim) tick = setInterval(() => { const el = $('#tdur'); if (el) el.textContent = fmtDur(Date.now() - L.inicio); else clearInterval(tick); }, 1000);
}

/* ---------- PLANO ---------- */
function renderPlano(){
  const segs = [['treino','Treino'],['dieta','Dieta'],['supl','Suplementos']];
  let h = '<h1>Plano</h1><div class="seg">' + segs.map(s => `<button data-act="pseg" data-id="${s[0]}" class="${planSeg===s[0]?'on':''}">${s[1]}</button>`).join('') + '</div>';

  if (planSeg === 'treino'){
    const t = P().treinos[planDay];
    const ini = addDays(hoje(), -idxOf(new Date()));
    h += '<div class="wk3">' + DIAS.map((n,k) => { const f = diaFrac(addDays(ini, k)); return `<button class="${k===planDay?'on':''}" data-act="stgo" data-id="st-plano" data-i="${k}" aria-label="${DIAS_F[k]}"><span>${n}</span>${tri3(f[0], f[1], f[2])}</button>`; }).join('') + '</div>';
    const cardsP = DIAS_F.map((nm, k) => {
      const tt = P().treinos[k] || { nome:'', itens:[] };
      const durs = Object.keys(S).filter(x => x.startsWith('dia:') && S[x].tnome === tt.nome && S[x].inicio && S[x].fim).map(x => S[x].fim - S[x].inicio).filter(v => v > 5*60000 && v < 4*3600000);
      const med = durs.length ? fmtDur(durs.reduce((a, b) => a + b, 0) / durs.length) : '--:--';
      const ser = tt.itens.reduce((a, e) => a + (parseInt(e.series) || 0), 0);
      const linhas = tt.itens.length ? tt.itens.map((e, j) => `<div class="brow"><span class="led amb">${pad2(j + 1)}</span><b>${esc(e.nome)}</b><span class="led">${esc(e.series)}×${esc(e.reps)}</span></div>`).join('')
        : [tt.cardio, ...(tt.atividades||[])].filter(Boolean).map(a => `<div class="brow"><span class="led grn">●</span><b>${esc(a)}</b></div>`).join('') || '<div class="brow"><b class="muted">Descanso</b></div>';
      return `<section class="scard ${k === planDay ? 'red' : 'dark'}"><span class="k">${nm}${tt.itens.length ? ' · ' + tt.itens.length + ' exercícios' : ''}</span><h2 class="stt">${esc(tt.nome || 'Descanso')}</h2>
        <div class="board">${linhas}</div>${tt.itens.length ? `<div class="s2b"><div class="board tc"><span>SÉRIES</span><b class="led">${ser}</b></div><div class="board tc"><span>TEMPO MÉDIO</span><b class="led amb">${med}</b></div></div>` : ''}
        <div class="sgrow"></div><button class="scta ${k === planDay ? 'ghost2' : 'ghost'}" data-act="pday" data-id="${k}">${k === planDay ? 'Editando este dia ↓' : 'Editar este dia'}</button></section>`;
    });
    h += stories('st-plano', cardsP, planDay);
    h += `<h2 class="mh" id="editor">Editando: ${DIAS_F[planDay]}</h2>`;
    h += `<div class="f"><label>Nome do treino<input data-pf="tnome" value="${esc(t.nome)}"></label></div>`;
    h += `<div class="f"><label>Cardio (deixe vazio se não tiver)<input data-pf="tcardio" value="${esc(t.cardio||'')}" placeholder="Ex.: Cardio 30 min na bike"></label></div>`;
    h += `<div class="f"><label>Outras atividades (separe por vírgula)<input data-pf="tativ" value="${esc((t.atividades||[]).join(', '))}" placeholder="Ex.: Futsal"></label></div>`;
    h += '<h2 class="mh">Exercícios</h2>';
    if (!t.itens.length) h += '<p class="muted">Sem exercícios neste dia.</p>';
    t.itens.forEach((e,k) => {
      h += `<div class="pe"><input class="pen" aria-label="Exercício" data-pf="enome" data-i="${k}" value="${esc(e.nome)}">
        <div class="pe2"><label>Séries<input inputmode="numeric" data-pf="eser" data-i="${k}" value="${esc(e.series)}"></label><label>Reps<input data-pf="ereps" data-i="${k}" value="${esc(e.reps)}"></label><label>Observação<input data-pf="eobs" data-i="${k}" value="${esc(e.obs||'')}"></label></div>
        <div class="pe3"><button class="mini" data-act="eup" data-i="${k}" ${k===0?'disabled':''} aria-label="Subir">↑</button><button class="mini" data-act="edown" data-i="${k}" ${k===t.itens.length-1?'disabled':''} aria-label="Descer">↓</button><button class="mini danger" data-act="edel" data-i="${k}">Remover</button></div></div>`;
    });
    h += '<button class="add" data-act="eadd">+ Exercício</button>';
    h += '<div class="copy"><label>Copiar este treino para<select id="copyto">' + DIAS_F.map((n,k) => k===planDay ? '' : `<option value="${k}">${n}</option>`).join('') + '</select></label><button class="btn" data-act="ecopy">Copiar</button></div>';
    h += `<div class="f"><label>Observação geral do treino<textarea rows="2" data-pf="obs">${esc(P().obs||'')}</textarea></label></div>`;
  }

  if (planSeg === 'dieta'){
    P().refeicoes.forEach((m,k) => {
      h += `<div class="pe"><div class="pe2" style="grid-template-columns:1fr 110px;margin-top:0"><label>Refeição<input data-pf="mnome" data-i="${k}" value="${esc(m.nome)}"></label><label>Horário<input type="time" data-pf="mhora" data-i="${k}" value="${esc(m.hora||'')}"></label></div>
        <div class="f" style="margin-top:8px"><label>Itens (um por linha)<textarea rows="3" data-pf="mitens" data-i="${k}">${esc((m.itens||[]).join('\n'))}</textarea></label></div>
        <div class="pe3"><button class="mini" data-act="mup" data-i="${k}" ${k===0?'disabled':''} aria-label="Subir">↑</button><button class="mini" data-act="mdown" data-i="${k}" ${k===P().refeicoes.length-1?'disabled':''} aria-label="Descer">↓</button><button class="mini danger" data-act="mdel" data-i="${k}">Remover</button></div></div>`;
    });
    h += '<button class="add" data-act="madd2">+ Refeição</button>';
    h += `<div class="f"><label>Meta de água por dia (ml)<input inputmode="numeric" data-pf="agua" value="${esc(P().metaAgua||3500)}"></label></div>`;
  }

  if (planSeg === 'supl'){
    P().suplementos.forEach((s,k) => {
      h += `<div class="pe"><input class="pen" aria-label="Nome" data-pf="snome" data-i="${k}" value="${esc(s.nome)}">
        <div class="pe2" style="grid-template-columns:1fr 1fr"><label>Dose<input data-pf="sdose" data-i="${k}" value="${esc(s.dose||'')}" placeholder="Ex.: 1 cápsula"></label><label>Quando<input data-pf="shora" data-i="${k}" value="${esc(s.hora||'')}" placeholder="Ex.: no café"></label></div>
        <div class="pe2" style="grid-template-columns:1fr"><label>Lembrar às (notificação)<input type="time" data-pf="slemb" data-i="${k}" value="${esc(((S.lembretes||{}).supl||{})[s.id] || '')}"></label></div>
        <p class="fl" style="margin:10px 0 0">Dias</p><div class="chips sm" style="margin-top:4px">${DIAS.map((n,d) => `<button class="chip ${(s.dias||[]).includes(d)?'on':''}" data-act="sdia" data-i="${k}" data-id="${d}">${n}</button>`).join('')}</div>
        <div class="pe3"><button class="mini danger" data-act="sdel" data-i="${k}">Remover</button></div></div>`;
    });
    h += '<button class="add" data-act="sadd">+ Suplemento</button>';
  }
  VIEW.innerHTML = h;
}

/* ---------- PROGRESSO ---------- */
function renderProg(){
  const M = (S.medidas||[]).slice().sort((a,b) => a.data < b.data ? -1 : a.data > b.data ? 1 : 0);
  const pesos = M.filter(m => m.peso != null);
  const last = pesos[pesos.length-1], first = pesos[0];
  let h = '<h1>Progresso</h1>';
  const metaP = P().metaPeso || 95;
  const dksP = Object.keys(S).filter(k => k.startsWith('dia:') && k.slice(4) <= hoje()).sort();
  const cardsG = [];
  if (last){
    const diff = last.peso - first.peso, falta = first.peso - metaP, fMeta = falta > 0 ? Math.max(0, Math.min(1, (first.peso - last.peso) / falta)) : 1;
    const pp = pesos.slice(-10); let linha = '';
    if (pp.length > 1){
      const mn = Math.min(...pp.map(m => m.peso)), mx = Math.max(...pp.map(m => m.peso)), rg = (mx - mn) || 1;
      const X = k => (12 + k * 266 / (pp.length - 1)).toFixed(1), Y = v => (10 + (mx - v) / rg * 80).toFixed(1);
      linha = `<svg class="sline" viewBox="0 0 290 100" aria-hidden="true"><polyline points="${pp.map((m, k) => X(k) + ',' + Y(m.peso)).join(' ')}"/>${pp.map((m, k) => `<circle cx="${X(k)}" cy="${Y(m.peso)}" r="5"/>`).join('')}</svg>`;
    } else linha = '<p class="sp">Registre de novo daqui uns dias pra ver a curva.</p>';
    cardsG.push(`<section class="scard red"><span class="k">Peso atual</span>
      <div class="board spes"><div><b class="led big2">${fmtN(last.peso)}</b><span class="bcap ${diff <= 0 ? 'g' : ''}">${pesos.length > 1 ? (diff <= 0 ? '▼ ' : '▲ ') + fmtN(Math.abs(diff)) + ' KG DESDE ' + fmtD(first.data) : 'PRIMEIRO REGISTRO'}</span></div>
        <button class="smeta" data-act="meta" aria-label="Mudar meta de peso">${anelSvg([{ r:18, cor:CORD, f:fMeta, sw:5 }], 76)}<b>${Math.round(fMeta * 100)}%</b></button></div>
      <span class="sp r">da meta de ${fmtN(metaP)} kg (toque no anel pra mudar)</span>${linha}<div class="sgrow"></div><button class="scta" data-act="goform">+ Registrar peso</button></section>`);
  }
  // recordes: melhor carga de cada exercício
  const best = {};
  dksP.forEach(k => Object.values(S[k].treino||{}).forEach(r => (r.series||[]).forEach(x => { if (!x.ok) return; const v = num(x.kg); if (v != null && (!best[r.nome] || v > best[r.nome].kg)) best[r.nome] = { kg:v, data:k.slice(4) }; })));
  const bl = Object.entries(best).sort((a, b) => b[1].data < a[1].data ? -1 : 1).slice(0, 6);
  if (bl.length) cardsG.push(`<section class="scard dark"><span class="k">Melhores cargas</span><h2 class="stt">Recordes</h2><div class="board">${bl.map(([n, v]) => `<div class="brow"><b>${esc(n)}</b><span class="led amb">${fmtN(v.kg)}</span></div>`).join('')}</div><div class="sgrow"></div></section>`);
  const jogosC = []; dksP.forEach(k => { const J = S[k].jogo || {}; Object.keys(J).forEach(a => { if (J[a]) jogosC.push(J[a]); }); });
  if (jogosC.length){ const g = jogosC.reduce((a, j) => a + (j.gols || 0), 0), ds = jogosC.filter(j => j.dor != null), md = ds.length ? ds.reduce((a, j) => a + j.dor, 0) / ds.length : null;
    cardsG.push(`<section class="scard dark"><span class="k">Futsal</span><h2 class="stt">Seus jogos</h2><div class="board"><div class="sc3"><div class="tm"><span>JOGOS</span><b class="led wht">${jogosC.length}</b></div><div class="tm"><span>GOLS</span><b class="led grn">${g}</b></div><div class="tm"><span>DOR MÉDIA</span><b class="led amb">${md != null ? fmtN(md) : '–'}</b></div></div></div><div class="sgrow"></div></section>`); }
  h += stories('st-prog', cardsG);
  const mes = hoje().slice(0, 7), dm = dksP.filter(k => k.slice(4, 11) === mes);
  const treinosMes = dm.filter(k => { const X = S[k]; return X.cardio || Object.values(X.ativ||{}).some(Boolean) || Object.values(X.treino||{}).some(r => (r.series||[]).some(x => x.ok)); }).length;
  const prMes = dm.reduce((a, k) => a + recordes(S[k], k.slice(4)).length, 0);
  const aguas = dm.map(k => S[k].agua || 0).filter(v => v > 0), mAgua = aguas.length ? aguas.reduce((a, b) => a + b, 0) / aguas.length / 1000 : 0;
  h += `<div class="rings3 stat"><div class="rg"><span><b class="led amb">${prMes}</b><small>Recordes no mês</small></span></div><div class="rg"><span><b class="led">${treinosMes}</b><small>Treinos no mês</small></span></div><div class="rg"><span><b class="led blu">${fmtN(mAgua)}L</b><small>Média de água</small></span></div></div>`;
  h += '<h2 class="mh">Peso</h2>' + chart([{ pts: pesos.map(m => ({ l:fmtD(m.data), v:m.peso })) }]);
  const cint = M.filter(m => m.cintura != null);
  if (cint.length > 1) h += '<p class="cap" style="margin-top:14px">Cintura (cm)</p>' + chart([{ pts: cint.map(m => ({ l:fmtD(m.data), v:m.cintura })), color:'var(--warn)' }]);

  h += '<h2 class="mh">Músculos</h2>' + mapaHtml();

  h += `<h2 class="mh">Nova medida</h2><div class="fields">
    <label class="full">Data<input type="date" id="m_data" value="${hoje()}"></label>
    <label>Peso (kg)<input inputmode="decimal" id="m_peso" placeholder="Ex.: 102,6"></label>
    <label>Cintura (cm)<input inputmode="decimal" id="m_cin"></label>
    <label>Braço (cm)<input inputmode="decimal" id="m_bra"></label>
    <label>Peito (cm)<input inputmode="decimal" id="m_pei"></label>
    <label>Coxa (cm)<input inputmode="decimal" id="m_cox"></label>
    <label>Gordura (%)<input inputmode="decimal" id="m_gor"></label></div>
    <button class="btn primary" data-act="madd">Salvar medida</button>`;
  if (M.length){
    h += '<ul class="list">' + M.slice().reverse().slice(0,12).map(m => {
      const parts = [];
      if (m.peso != null) parts.push(fmtN(m.peso) + ' kg');
      [['cintura','cintura'],['braco','braço'],['peito','peito'],['coxa','coxa']].forEach(p => { if (m[p[0]] != null) parts.push(p[1] + ' ' + fmtN(m[p[0]])); });
      if (m.gordura != null) parts.push(fmtN(m.gordura) + '% gordura');
      return `<li><span class="ld">${fmtD(m.data)}</span><span class="lm"><span class="rn">${parts.join(' · ')}</span></span><button class="rm" data-act="mrem" data-id="${m.id}" aria-label="Apagar medida">×</button></li>`;
    }).join('') + '</ul>';
  }

  // evolução de carga
  const nomes = [];
  Object.values(P().treinos).forEach(t => t.itens.forEach(e => { if (!nomes.includes(e.nome)) nomes.push(e.nome); }));
  if (!progEx || !nomes.includes(progEx)) progEx = nomes[0] || '';
  h += '<h2 class="mh">Evolução de carga</h2>';
  h += '<div class="f" style="margin-top:0"><select data-f="progex" aria-label="Exercício">' + nomes.map(n => `<option ${n===progEx?'selected':''}>${esc(n)}</option>`).join('') + '</select></div>';
  const dks = Object.keys(S).filter(k => k.startsWith('dia:')).sort();
  const cargas = [];
  dks.forEach(k => {
    let best = null;
    Object.values(S[k].treino||{}).forEach(r => {
      if (r.nome !== progEx) return;
      (r.series||[]).forEach(s => { const v = num(s.kg); if (v != null && (best == null || v > best)) best = v; });
    });
    if (best != null) cargas.push({ l:fmtD(k.slice(4)), v:best });
  });
  if (cargas.length) h += `<p class="cap" style="margin-top:8px">Maior carga por treino · último: ${fmtN(cargas[cargas.length-1].v)} kg</p>`;
  h += chart([{ pts:cargas }]);

  // futsal
  const jogos = [];
  dks.forEach(k => { const J = S[k].jogo || {}; Object.keys(J).forEach(a => { const j = J[a]; if (j && (j.min != null || j.gols != null || j.sens != null || j.dor != null)) jogos.push({ data:k.slice(4), nome:a, ...j }); }); });
  if (jogos.length){
    const gols = jogos.reduce((t,j) => t + (j.gols || 0), 0);
    const dores = jogos.filter(j => j.dor != null);
    const mDor = dores.length ? dores.reduce((t,j) => t + j.dor, 0) / dores.length : null;
    h += '<h2 class="mh">Futsal</h2>';
    h += `<div class="sum card2"><div><b>${jogos.length}</b><span>jogos</span></div><div><b>${gols}</b><span>gols</span></div><div><b>${mDor != null ? fmtN(mDor) : '–'}</b><span>dor média</span></div></div>`;
    if (dores.length > 1){ h += '<p class="cap" style="margin-top:12px">Dor da pubalgia depois do jogo (0–10)</p>' + chart([{ pts:dores.map(j => ({ l:fmtD(j.data), v:j.dor })), color:'var(--warn)' }]); }
    h += '<ul class="list">' + jogos.slice().reverse().slice(0,10).map(j => {
      const bits = [j.min != null ? j.min + ' min' : '', j.gols != null ? j.gols + (j.gols === 1 ? ' gol' : ' gols') : '', j.dor != null ? 'dor ' + j.dor : ''].filter(Boolean).join(' · ');
      return `<li><span class="ld">${fmtD(j.data)}</span><span class="lm"><span class="rn">${esc(j.nome)}</span><span class="rd">${esc(bits || 'sem detalhes')}</span></span>${j.sens ? `<span class="emo">${SENS[j.sens-1]}</span>` : ''}</li>`;
    }).join('') + '</ul>';
  }

  // histórico
  h += '<h2 class="mh">Histórico</h2>';
  const hist = dks.filter(k => k.slice(4) <= hoje() && hasContent(S[k])).reverse().slice(0,30);
  if (!hist.length) h += '<p class="muted">Ainda sem dias registrados.</p>';
  else h += '<ul class="list">' + hist.map(k => {
    const L = S[k], ds = k.slice(4);
    const nEx = Object.values(L.treino||{}).filter(r => r.series.length && r.series.every(s => s.ok)).length;
    const nRef = Object.values(L.ref||{}).filter(Boolean).length;
    const bits = [];
    if (L.inicio && L.fim) bits.push(fmtDurTxt(L.fim - L.inicio));
    if (nEx) bits.push(nEx + ' exercício' + (nEx>1?'s':''));
    if (L.cardio) bits.push('cardio');
    Object.keys(L.ativ||{}).forEach(a => { if (L.ativ[a]) bits.push(a.toLowerCase()); });
    if (nRef) bits.push(nRef + ' refeiç' + (nRef>1?'ões':'ão'));
    if (L.agua) bits.push(fmtN(L.agua/1000) + ' L de água');
    return `<li><span class="ld">${fmtD(ds)}</span><button class="row" style="border:0;min-height:0;padding:0" data-act="goday" data-id="${ds}"><span class="rowmain"><span class="rn">${esc(L.tnome || DIAS_F[idxOf(parse(ds))])}</span><span class="rd">${esc(bits.join(' · ') || 'anotação')}</span></span></button></li>`;
  }).join('') + '</ul>';
  VIEW.innerHTML = h;
}

/* ---------- SAÚDE ---------- */
function classPA(p){
  if (p.sis >= 140 || p.dia >= 90) return ['bad','Alta'];
  if (p.sis >= 130 || p.dia >= 85) return ['warn','Elevada'];
  return ['ok','Normal'];
}
function renderSaude(){
  let h = '<h1>Saúde</h1>';
  const dores = []; Object.keys(S).filter(k => k.startsWith('dia:')).sort().forEach(k => { const J = S[k].jogo || {}; Object.keys(J).forEach(a => { if (J[a] && J[a].dor != null) dores.push({ data:k.slice(4), dor:J[a].dor }); }); });
  const cardsS = [];
  if (dores.length){
    const ul = dores[dores.length - 1].dor, md = dores.reduce((a, x) => a + x.dor, 0) / dores.length, mx = Math.max(...dores.map(x => x.dor));
    const dd = dores.slice(-8), cor = v => v >= 7 ? '#FF4A3F' : v >= 4 ? '#F2C230' : '#3DD68C';
    const X = k => dd.length > 1 ? (12 + k * 266 / (dd.length - 1)).toFixed(1) : 145, Y = v => (8 + (10 - v) * 5.4).toFixed(1);
    const tend = dd.length > 1 ? (dd[dd.length - 1].dor < dd[0].dor ? `Melhorando: de ${dd[0].dor} para ${dd[dd.length - 1].dor} em ${dd.length} jogos.` : dd[dd.length - 1].dor > dd[0].dor ? `Piorou: de ${dd[0].dor} para ${dd[dd.length - 1].dor}. Vale falar com a fisio.` : 'Estável nos últimos jogos.') : 'Registre mais jogos pra ver a tendência.';
    cardsS.push(`<section class="scard dark"><span class="k">Pubalgia</span><h2 class="stt">Dor depois do futsal</h2>
      <div class="board"><div class="sc3"><div class="tm"><span>ÚLTIMO JOGO</span><b class="led" style="color:${cor(ul)}">${ul}</b></div><div class="tm"><span>MÉDIA</span><b class="led amb">${fmtN(md)}</b></div><div class="tm"><span>MAIOR</span><b class="led">${mx}</b></div></div></div>
      <svg class="sline dor" viewBox="0 0 290 70" aria-hidden="true">${dd.length > 1 ? `<polyline points="${dd.map((x, k) => X(k) + ',' + Y(x.dor)).join(' ')}"/>` : ''}${dd.map((x, k) => `<circle cx="${X(k)}" cy="${Y(x.dor)}" r="5" style="fill:${cor(x.dor)}"/>`).join('')}</svg>
      <p class="sp">${tend}</p><div class="sgrow"></div></section>`);
  } else cardsS.push('<section class="scard dark"><span class="k">Pubalgia</span><h2 class="stt">Dor depois do futsal</h2><p class="sp">Depois do futsal de quinta, marque o jogo na tela Hoje e registre a dor de 0 a 10. O acompanhamento aparece aqui.</p><div class="sgrow"></div></section>');
  const lesoes = ((S.saude||{}).notas || '').split('\n').map(x => x.trim()).filter(Boolean);
  if (lesoes.length) cardsS.push(`<section class="scard red"><span class="k">Histórico</span><h2 class="stt">Lesões e observações</h2><div class="board">${lesoes.slice(0, 7).map(x => `<div class="brow"><span class="led amb">●</span><b>${esc(x)}</b></div>`).join('')}</div><div class="sgrow"></div><button class="scta" data-act="golesao">Editar</button></section>`);
  h += stories('st-saude', cardsS);
  h += '<h2 class="mh">Notificações</h2><div class="panel" style="padding-top:12px">' + notifHtml() + '</div>';
  h += `<h2 class="mh" id="lesoes">Lesões e observações</h2><div class="f" style="margin-top:0"><textarea rows="5" data-f="snotas">${esc((S.saude||{}).notas||'')}</textarea></div>`;
  h += `<h2 class="mh">Conta</h2><p class="muted small">${esc(user && user.email || '')}</p><button class="btn danger" data-act="logout">Sair</button>`;
  VIEW.innerHTML = h;
}

/* ---------- AGENDA ---------- */
const TIPOS = { medico:'Médico', fisio:'Fisio', jogo:'Jogo', exame:'Exame', outro:'Outro' };
function ocorrencias(from, to){
  const out = [];
  (S.agenda||[]).forEach(e => {
    if (e.semanal){
      let d = e.data;
      if (d < from){ const diff = Math.round((parse(from) - parse(d)) / 864e5); d = addDays(d, Math.ceil(diff / 7) * 7); }
      while (d <= to){ out.push({ e, data:d }); d = addDays(d, 7); }
    } else if (e.data >= from && e.data <= to) out.push({ e, data:e.data });
  });
  return out.sort((a,b) => (a.data + (a.e.hora||'99')) < (b.data + (b.e.hora||'99')) ? -1 : 1);
}
function evtHtml(o, rem){
  const e = o.e, d = parse(o.data);
  const quando = DIAS[idxOf(d)] + ' ' + fmtD(o.data) + (e.hora ? ' · ' + esc(e.hora) : '');
  const sub = [quando, esc(e.local||''), esc(e.obs||''), e.semanal ? 'toda semana' : ''].filter(Boolean).join(' · ');
  return `<div class="evt"><span class="lm"><span class="tag t-${e.tipo}">${TIPOS[e.tipo]||'Outro'}</span><span class="rn">${esc(e.titulo || TIPOS[e.tipo])}</span><span class="rd">${sub}</span></span>${rem ? `<button class="rm" data-act="arem" data-id="${e.id}" aria-label="Apagar">×</button>` : ''}</div>`;
}
function renderAgenda(){
  const h0 = hoje();
  let h = `<div class="thead"><h1>Agenda</h1>${agendaForm ? '' : '<button class="schip" data-act="aform">+ Novo</button>'}</div>`;
  if (agendaForm) h += `<h2 class="mh">Novo compromisso</h2><div class="fields">
    <label>Tipo<select id="a_tipo">${Object.keys(TIPOS).map(k => `<option value="${k}">${TIPOS[k]}</option>`).join('')}</select></label>
    <label>Título<input id="a_tit" placeholder="Ex.: Ortopedista"></label>
    <label>Data<input type="date" id="a_data" value="${h0}"></label>
    <label>Hora<input type="time" id="a_hora"></label>
    <label class="full">Local<input id="a_loc" placeholder="Ex.: Clínica, quadra…"></label>
    <label class="full">Observação<input id="a_obs" placeholder="Ex.: levar exames"></label>
    <label class="full ckl"><input type="checkbox" id="a_sem">Repetir toda semana</label></div>
    <div class="tbtns"><button class="btn" data-act="aformx">Cancelar</button><button class="btn primary" data-act="aadd">Salvar</button></div>`;
  const prox = ocorrencias(h0, addDays(h0, 30));
  const agora = new Date(), hhmm = pad2(agora.getHours()) + ':' + pad2(agora.getMinutes());
  const futuros = prox.filter(o => o.data > h0 || !o.e.hora || o.e.hora >= hhmm).slice(0, 5);
  const fisios = (S.agenda||[]).filter(e => e.tipo === 'fisio' && !e.semanal), fFeitas = fisios.filter(e => e.data < h0 || (e.data === h0 && (e.hora || '00:00') < hhmm)).length;
  const cardsA = futuros.map((o, k) => {
    const c = contagem(o), dl = o.data === h0 ? 'Hoje' : o.data === addDays(h0, 1) ? 'Amanhã' : DIAS_F[idxOf(parse(o.data))] + ', ' + fmtD(o.data);
    const ring = o.e.tipo === 'fisio' && fisios.length ? `<div class="sring2">${anelSvg([{ r:18, cor: k === 0 ? '#1A1200' : '#F2C230', f: fFeitas / fisios.length }], 46)}<span><b>${fFeitas} de ${fisios.length}</b><small>sessões de fisio feitas</small></span></div>` : '';
    return `<section class="scard ${k === 0 ? 'gold' : 'dark'}"><span class="k">${k === 0 ? 'Próximo compromisso' : 'Depois'}</span><h2 class="stt">${esc(o.e.titulo || TIPOS[o.e.tipo])}</h2>
      <div class="board"><div class="sc2"><div class="tm"><span>${c.u || 'QUANDO'}</span><b class="led amb">${c.n}</b></div><div class="tm"><span>HORA</span><b class="led wht">${esc(o.e.hora || '--:--')}</b></div></div></div>
      <p class="sp">${dl}${o.e.local ? ', ' + esc(o.e.local) : ''}${o.e.obs ? '. ' + esc(o.e.obs) : ''}</p>${ring}<div class="sgrow"></div></section>`;
  });
  h += stories('st-agenda', cardsA);
  h += '<h2 class="mh">Próximos 30 dias</h2>';
  h += prox.length ? prox.map(o => evtHtml(o, true)).join('') : '<p class="muted">Nada marcado.</p>';
  const pass = (S.agenda||[]).filter(e => !e.semanal && e.data < h0).sort((a,b) => a.data < b.data ? 1 : -1).slice(0,10);
  if (pass.length) h += '<h2 class="mh">Passados</h2>' + pass.map(e => evtHtml({ e, data:e.data }, true)).join('');
  VIEW.innerHTML = h;
}

/* ---------- MODO TREINO (tela cheia) ---------- */
let modo = null;            // { ex, rest:{ fim, total }, fimTreino:false }
let modoTick = null, wakeLock = null, audioCtx = null;
const DESCANSO_PADRAO = 90;
const ehTempo = e => /\d+\s*(s|seg|min)\b/i.test(String(e.reps || ''));
function exFeito(L, e){ const r = L.treino[e.id]; return !!(r && r.series.length && r.series.every(s => s.ok)); }
function proxExercicio(L, t, aPartirDe){
  const n = t.itens.length, ini = Math.max(0, t.itens.findIndex(x => x.id === aPartirDe));
  for (let k = 1; k <= n; k++){ const e = t.itens[(ini + k) % n]; if (!exFeito(L, e)) return e; }
  return null;
}
function serieAtual(r){ const k = r.series.findIndex(s => !s.ok); return k < 0 ? r.series.length - 1 : k; }
async function manterTelaAcesa(on){
  try {
    if (on && 'wakeLock' in navigator && !wakeLock){ wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    if (!on && wakeLock){ await wakeLock.release(); wakeLock = null; }
  } catch(e){}
}
function bip(){
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22, 0.44].forEach((t, k) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = k === 2 ? 1320 : 880; o.connect(g); g.connect(audioCtx.destination);
      const t0 = audioCtx.currentTime + t; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.start(t0); o.stop(t0 + 0.2);
    });
  } catch(e){}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
function abrirModo(exId){
  const L = dia(cur), t = treinoDo(cur);
  if (!t || !t.itens.length) return;
  let e = t.itens.find(x => x.id === exId);
  if (!e || exFeito(L, e)) e = t.itens.find(x => !exFeito(L, x)) || t.itens[0];
  modo = { ex: e.id, rest: null, fimTreino: !t.itens.some(x => !exFeito(L, x)) };
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch(_){}
  manterTelaAcesa(true);
  render(); window.scrollTo(0, 0);
}
function fecharModo(){
  modo = null; clearInterval(modoTick); manterTelaAcesa(false);
  render(); window.scrollTo(0, 0);
}
function renderModo(){
  const L = dia(cur), t = treinoDo(cur);
  const e = t.itens.find(x => x.id === modo.ex) || t.itens[0];
  const r = getEx(L, e); r.nome = e.nome;
  const k = serieAtual(r), s = r.series[k], last = lastSets(e, cur), sg = sugestao(e, cur), tempo = ehTempo(e);
  if (!s.ok){
    if (!s.kg && !tempo) s.kg = kgPadrao(e, r, k);
    if (!s.reps) s.reps = numReps(e.reps);
  }
  const idx = t.itens.indexOf(e);
  const crono = L.inicio ? `<span class="mtime"><i class="live" aria-hidden="true"></i><span id="mdur">${fmtDur((L.fim || Date.now()) - L.inicio)}</span></span>` : '<span class="mtime muted">0:00</span>';
  const segs = t.itens.map(x => `<span class="${exFeito(L, x) ? 'ok' : x.id === e.id ? 'cur' : ''}"></span>`).join('');
  let h = `<div class="modo"><header class="mtop"><button class="mx" data-act="msair" aria-label="Sair do modo treino">${ICON.x}</button><span class="mtn">${esc(t.nome)}</span>${crono}</header><div class="msegs" style="grid-template-columns:repeat(${t.itens.length},minmax(0,1fr))">${segs}</div>`;

  // treino completo
  if (modo.fimTreino){
    const R = resumo(L, cur);
    h += `<div class="mfim"><span class="mfi" aria-hidden="true">🏁</span><h1>Treino completo</h1><p class="muted">${t.itens.length} exercícios, ${R.series} séries, ${Math.round(R.vol).toLocaleString('pt-BR')} kg de volume${R.prs.length ? ', ' + R.prs.length + (R.prs.length > 1 ? ' recordes' : ' recorde') : ''}.</p></div>
      <div class="mgrow"></div><button class="mbig" data-act="mfinal">Finalizar e ver o resumo</button><div class="mlinks"><button class="mlink" data-act="msair">Voltar sem finalizar</button></div></div>`;
    return h;
  }

  // descanso
  if (modo.rest){
    const rest = Math.max(0, Math.ceil((modo.rest.fim - Date.now()) / 1000)), tot = modo.rest.total, C = 691.2;
    const feita = modo.rest.feita || {};
    const ne = t.itens.find(x => x.id === modo.ex), nr = getEx(L, ne), nk = serieAtual(nr), nlast = lastSets(ne, cur), nsg = sugestao(ne, cur);
    const nkg = nr.series[nk].kg || kgPadrao(ne, nr, nk);
    h += `<div class="mdone"><span class="mck">${CHECK}</span><span class="lm"><b>${esc(feita.titulo || 'Série feita')}</b><span>${esc(feita.det || '')}</span></span>${feita.pr ? '<span class="mtro" aria-hidden="true">🏆</span>' : ''}</div>
      <div class="mrest"><span class="mrl">Descanso</span><div class="mring"><svg viewBox="0 0 250 250" aria-hidden="true"><circle cx="125" cy="125" r="110" class="rb"/><circle id="mrf" cx="125" cy="125" r="110" class="rf" stroke-dasharray="${C}" stroke-dashoffset="${(C * (1 - rest / tot)).toFixed(1)}"/></svg><div class="mrv"><b id="mrv">${Math.floor(rest / 60)}:${pad2(rest % 60)}</b><span>de ${Math.floor(tot / 60)}:${pad2(tot % 60)}</span></div></div>
      <div class="m2"><button class="mbtn" data-act="mrest" data-v="-15">−15 s</button><button class="mbtn" data-act="mrest" data-v="15">+15 s</button></div></div>
      <div class="mnext"><span class="muted small">A seguir</span><b>${esc(ne.nome)}, série ${nk + 1} de ${nr.series.length}</b><span class="muted">${ehTempo(ne) ? esc(ne.reps) : (nkg ? esc(nkg) + ' kg × ' : '') + esc(nr.series[nk].reps || numReps(ne.reps)) + (ehTempo(ne) ? '' : ' reps')}</span></div>
      <button class="mbig chalk" data-act="mpular">Pular descanso</button></div>`;
    return h;
  }

  // série
  const lastTxt = last ? last.filter(x => x.kg || x.reps).map(x => (x.kg ? x.kg + ' × ' : '') + (x.reps || '–')).join(', ') : '';
  h += `<div class="mhead"><span class="muted">Exercício ${idx + 1} de ${t.itens.length}</span><h1 class="mname">${esc(e.nome)}</h1>${lastTxt ? `<span class="muted small">Última vez: ${esc(lastTxt)}</span>` : ''}${e.obs ? `<span class="mobs">${esc(e.obs)}</span>` : ''}</div>`;
  if (sg && !tempo) h += `<div class="msug ${sg.tipo}">${sg.tipo === 'sobe' ? '▲' : '='} <span>${esc(sg.msg)}</span></div>`;
  h += '<div class="mpills">' + r.series.map((x, j) => `<span class="${x.ok ? 'ok' : j === k ? 'cur' : ''}">${x.ok ? (j + 1) + ' ✓' : j === k ? 'Série ' + (j + 1) : j + 1}</span>`).join('') + '</div>';
  h += '<div class="mpanel">';
  if (!tempo) h += `<div class="mstep big"><button class="mpm" data-act="mkg" data-v="-1" aria-label="Diminuir carga">−</button><button class="mval" data-act="mkgedit" aria-label="Digitar carga"><b>${esc(s.kg || '0')}</b><span>kg</span></button><button class="mpm" data-act="mkg" data-v="1" aria-label="Aumentar carga">+</button></div><div class="mdiv"></div>`;
  h += `<div class="mstep"><button class="mpm" data-act="mrep" data-v="-1" aria-label="Menos">−</button><button class="mval" data-act="mrepedit" aria-label="Digitar repetições"><b>${esc(s.reps || '0')}</b><span>${tempo ? 'segundos' : 'reps'}</span></button><button class="mpm" data-act="mrep" data-v="1" aria-label="Mais">+</button></div></div>`;
  h += `<div class="mgrow"></div><button class="mbig" data-act="mfeita">${CHECK}<span>Série feita</span></button>
    <div class="mlinks"><button class="mlink" data-act="mskip">Pular exercício</button><button class="mlink" data-act="mlista" data-ex="${e.id}">Ver lista do treino</button></div></div>`;
  return h;
}
function tickModo(){
  clearInterval(modoTick);
  if (!modo) return;
  modoTick = setInterval(() => {
    if (!modo){ clearInterval(modoTick); return; }
    const L = dia(cur), md = $('#mdur');
    if (md && L.inicio) md.textContent = fmtDur((L.fim || Date.now()) - L.inicio);
    if (modo.rest){
      const rest = Math.max(0, Math.ceil((modo.rest.fim - Date.now()) / 1000));
      const v = $('#mrv'), rf = $('#mrf');
      if (v) v.textContent = Math.floor(rest / 60) + ':' + pad2(rest % 60);
      if (rf) rf.setAttribute('stroke-dashoffset', (691.2 * (1 - rest / modo.rest.total)).toFixed(1));
      if (rest <= 0){ modo.rest = null; bip(); render(); }
    }
  }, 250);
}
function concluirSerieModo(){
  const L = dia(cur), t = treinoDo(cur), e = t.itens.find(x => x.id === modo.ex), r = getEx(L, e), k = serieAtual(r), s = r.series[k];
  const mxAntes = maxOk(r), prev = bestKg(e.nome, cur);
  s.ok = true; if (!s.reps) s.reps = numReps(e.reps); r.nome = e.nome;
  if (!L.inicio){ L.inicio = Date.now(); delete L.fim; }
  const v = num(s.kg), pr = v != null && prev != null && v > prev && (mxAntes == null || v > mxAntes);
  touch(cur);
  const det = (ehTempo(e) ? s.reps + ' s' : (s.kg ? s.kg + ' kg × ' : '') + s.reps) + (pr ? ', novo recorde' : '');
  const feita = { titulo: 'Série ' + (k + 1) + ' feita', det, pr };
  if (r.series.every(x => x.ok)){
    const prox = proxExercicio(L, t, e.id);
    if (!prox){ modo.fimTreino = true; modo.rest = null; bip(); render(); return; }
    modo.ex = prox.id; feita.titulo = e.nome + ' concluído';
  }
  const total = (P().descanso || DESCANSO_PADRAO);
  modo.rest = { fim: Date.now() + total * 1000, total, feita };
  render();
}
function passoKg(v){ return v < 20 ? 1 : 2.5; }
// carga sugerida pra série k: a da série anterior de hoje > sugestão > a da última vez
function kgPadrao(e, r, k){
  for (let j = k - 1; j >= 0; j--) if (r.series[j].kg) return r.series[j].kg;
  const sg = sugestao(e, cur); if (sg) return String(sg.kg).replace('.', ',');
  const last = lastSets(e, cur); return last && last[k] && last[k].kg ? last[k].kg : '';
}

/* ---------- render ---------- */
function render(){
  document.querySelectorAll('.tabbtn').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (modo){ $('#tabbar').hidden = true; document.body.classList.add('em-modo'); VIEW.innerHTML = renderModo(); tickModo(); return; }
  document.body.classList.remove('em-modo'); if (user) $('#tabbar').hidden = false;
  if (tab === 'hoje') renderHoje();
  else if (tab === 'agenda') renderAgenda();
  else if (tab === 'plano') renderPlano();
  else if (tab === 'prog') renderProg();
  else renderSaude();
  initTracks();
}
function keepScroll(fn){ const y = window.scrollY; fn(); window.scrollTo(0, y); }

/* ---------- eventos ---------- */
document.querySelectorAll('.tabbtn').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; if (tab === 'hoje') cur = hoje(); render(); window.scrollTo(0,0); }));

VIEW.addEventListener('toggle', e => { const ex = e.target.dataset && e.target.dataset.ex; if (ex) openEx[ex] = e.target.open; }, true);

VIEW.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, id = b.dataset.id, i = parseInt(b.dataset.i), exId = b.dataset.ex;
  const L = tab === 'hoje' ? dia(cur) : null;
  const t = P().treinos[planDay];

  switch (a){
    case 'dprev': cur = addDays(cur, -1); pickOpen = false; render(); return;
    case 'dnext': cur = addDays(cur, 1); pickOpen = false; render(); return;
    case 'tstart': L.inicio = Date.now(); delete L.fim; touch(cur); keepScroll(render); return;
    case 'tfim': if (confirm('Finalizar o treino agora?')){ L.fim = Date.now(); touch(cur); render(); window.scrollTo(0,0); } return;
    case 'usasug': { const v = b.dataset.v; const exo = treinoDo(cur).itens.find(x => x.id === exId); const r = getEx(L, exo); r.nome = exo.nome; r.series.forEach(s => { if (!s.ok) s.kg = String(v).replace('.', ','); }); touch(cur); keepScroll(render); toast('Carga ' + fmtN(+v) + ' kg nas séries'); return; }
    case 'pushon': ativarPush(); return;
    case 'pushoff': desativarPush(); return;
    case 'pushtest': testePush(); return;
    case 'tedit': {
      const atualMin = L.inicio && L.fim ? Math.round((L.fim - L.inicio) / 60000) : '';
      const v = prompt('Quanto tempo durou o treino? (em minutos)', atualMin);
      if (v == null) return;
      const m = parseInt(String(v).replace(/\D/g, ''));
      if (!m || m < 1 || m > 600){ alert('Digite os minutos, por exemplo 50.'); return; }
      const fim = L.fim || (cur === hoje() ? Date.now() : parse(cur).setHours(20, 0, 0, 0));
      L.fim = fim; L.inicio = fim - m * 60000;
      touch(cur); keepScroll(render); toast('⏱ Treino de ' + fmtDurTxt(m * 60000) + ' salvo');
      return;
    }
    case 'tret': delete L.fim; touch(cur); keepScroll(render); return;
    case 'tshare': shareResumo(); return;
    case 'jsens': case 'jdor': { L.jogo = L.jogo || {}; const j = L.jogo[id] = L.jogo[id] || {}; const v = parseInt(b.dataset.v); const f = a === 'jsens' ? 'sens' : 'dor'; j[f] = j[f] === v ? null : v; touch(cur); keepScroll(render); return; }
    case 'wprev': cur = addDays(cur, -7); pickOpen = false; render(); return;
    case 'wnext': cur = addDays(cur, 7); pickOpen = false; render(); return;
    case 'goex': { openEx[exId] = true; render(); const el = document.querySelector('details.ex[data-ex="' + exId + '"]'); if (el) el.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    case 'tabag': tab = 'agenda'; render(); window.scrollTo(0,0); return;
    case 'tabprog': tab = 'prog'; render(); window.scrollTo(0,0); return;
    case 'modo': abrirModo(exId); return;
    case 'msair': fecharModo(); return;
    case 'mlista': { const id2 = exId; modo = null; clearInterval(modoTick); manterTelaAcesa(false); openEx[id2] = true; tab = 'hoje'; render(); const el = document.querySelector('details.ex[data-ex="' + id2 + '"]'); if (el) el.scrollIntoView({ block:'start' }); return; }
    case 'mfinal': { const LL = dia(cur); if (LL.inicio && !LL.fim){ LL.fim = Date.now(); touch(cur); } modo = null; clearInterval(modoTick); manterTelaAcesa(false); tab = 'hoje'; render(); window.scrollTo(0,0); return; }
    case 'mfeita': concluirSerieModo(); return;
    case 'mpular': if (modo){ modo.rest = null; render(); } return;
    case 'mrest': if (modo && modo.rest){ const d = parseInt(b.dataset.v); modo.rest.fim += d * 1000; modo.rest.total = Math.max(15, modo.rest.total + d); P().descanso = Math.max(15, Math.min(600, (P().descanso || DESCANSO_PADRAO) + d)); save('plano'); render(); } return;
    case 'mskip': { const LL = dia(cur), tt = treinoDo(cur), nx = proxExercicio(LL, tt, modo.ex); if (nx) modo.ex = nx.id; render(); return; }
    case 'mkg': case 'mrep': {
      const LL = dia(cur), tt = treinoDo(cur), ee = tt.itens.find(x => x.id === modo.ex), rr = getEx(LL, ee), ss = rr.series[serieAtual(rr)];
      const d = parseInt(b.dataset.v);
      if (a === 'mkg'){ const v = num(ss.kg) || 0; const nv = Math.max(0, Math.round((v + d * passoKg(v)) * 10) / 10); ss.kg = String(nv).replace('.', ','); }
      else { const v = parseInt(ss.reps) || 0; ss.reps = String(Math.max(0, v + (ehTempo(ee) ? d * 5 : d))); }
      rr.nome = ee.nome; touch(cur); render(); return;
    }
    case 'mkgedit': case 'mrepedit': {
      const LL = dia(cur), tt = treinoDo(cur), ee = tt.itens.find(x => x.id === modo.ex), rr = getEx(LL, ee), ss = rr.series[serieAtual(rr)];
      const campo = a === 'mkgedit' ? 'kg' : 'reps';
      const v = prompt(campo === 'kg' ? 'Carga (kg)' : (ehTempo(ee) ? 'Tempo (segundos)' : 'Repetições'), ss[campo] || '');
      if (v == null) return; const n = num(v); if (n == null) return;
      ss[campo] = campo === 'kg' ? String(n).replace('.', ',') : String(Math.round(n)); rr.nome = ee.nome; touch(cur); render(); return;
    }
    case 'stgo': irCard(id, parseInt(b.dataset.i)); return;
    case 'meta': { const v = prompt('Meta de peso (kg)', String(P().metaPeso || 95).replace('.', ',')); if (v == null) return; const n = num(v); if (!n || n < 40 || n > 250) return; P().metaPeso = n; save('plano'); keepScroll(render); return; }
    case 'goform': { const el = $('#m_peso'); if (el){ el.scrollIntoView({ behavior:'smooth', block:'center' }); setTimeout(() => el.focus(), 350); } return; }
    case 'golesao': { const el = $('#lesoes'); if (el) el.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    case 'tpick': pickOpen = !pickOpen; keepScroll(render); return;
    case 'tclose': pickOpen = false; keepScroll(render); return;
    case 'tset': { const k = parseInt(id); if (k === idxOf(parse(cur))) delete L.treinoDia; else L.treinoDia = k; pickOpen = false; touch(cur); render(); window.scrollTo(0,0); return; }
    case 'dtoday': cur = hoje(); render(); return;
    case 'goday': cur = id; tab = 'hoje'; render(); window.scrollTo(0,0); return;

    case 'setok': {
      e.preventDefault();
      const tr = treinoDo(cur);
      const exo = tr.itens.find(x => x.id === exId); const r = getEx(L, exo); const s = r.series[i];
      const mxAntes = maxOk(r);
      s.ok = !s.ok;
      if (s.ok){
        const last = lastSets(exo, cur);
        if (!s.kg && last && last[i] && last[i].kg) s.kg = last[i].kg;
        if (!s.reps) s.reps = numReps(exo.reps);
        if (!L.inicio){ L.inicio = Date.now(); toast('⏱ Cronômetro iniciado'); }
        const v = num(s.kg), prev = bestKg(exo.nome, cur);
        if (v != null && prev != null && v > prev && (mxAntes == null || v > mxAntes)){ toast('🏆 Novo recorde: ' + exo.nome + ' · ' + fmtN(v) + ' kg'); if (navigator.vibrate) navigator.vibrate([40,40,80]); }
      }
      r.nome = exo.nome; touch(cur); keepScroll(render); return;
    }
    case 'addset': { e.preventDefault(); const exo = treinoDo(cur).itens.find(x => x.id === exId); getEx(L, exo).series.push({ kg:'', reps:'', ok:false }); touch(cur); keepScroll(render); return; }
    case 'delset': { e.preventDefault(); const r = L.treino[exId]; if (r && r.series.length > 1){ r.series.splice(i,1); touch(cur); keepScroll(render); } return; }
    case 'cardio': L.cardio = !L.cardio; touch(cur); keepScroll(render); return;
    case 'ativ': L.ativ[id] = !L.ativ[id]; touch(cur); keepScroll(render); return;
    case 'ref': L.ref[id] = !L.ref[id]; touch(cur); keepScroll(render); return;
    case 'supl': L.supl[id] = !L.supl[id]; touch(cur); keepScroll(render); return;
    case 'agua': L.agua = Math.max(0, (L.agua||0) + parseInt(b.dataset.v)); touch(cur); keepScroll(render); return;

    case 'pseg': planSeg = id; render(); return;
    case 'pday': { planDay = parseInt(id); trackPos['st-plano'] = undefined; render(); const ed = $('#editor'); if (ed && b.closest('.scard')) ed.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    case 'eup': if (i > 0){ const x = t.itens.splice(i,1)[0]; t.itens.splice(i-1,0,x); save('plano'); keepScroll(render); } return;
    case 'edown': if (i < t.itens.length-1){ const x = t.itens.splice(i,1)[0]; t.itens.splice(i+1,0,x); save('plano'); keepScroll(render); } return;
    case 'edel': if (confirm('Remover "' + t.itens[i].nome + '"?')){ t.itens.splice(i,1); save('plano'); keepScroll(render); } return;
    case 'eadd': t.itens.push(ex('Novo exercício',3,12)); save('plano'); keepScroll(render); return;
    case 'ecopy': {
      const to = parseInt($('#copyto').value);
      if (confirm('Substituir o treino de ' + DIAS_F[to] + ' por uma cópia de ' + DIAS_F[planDay] + '?')){
        P().treinos[to] = { nome:t.nome, cardio:t.cardio||'', atividades:(t.atividades||[]).slice(), itens:t.itens.map(x => ex(x.nome, x.series, x.reps, x.obs)) };
        save('plano'); planDay = to; render(); window.scrollTo(0,0);
      }
      return;
    }
    case 'mup': case 'mdown': { const R = P().refeicoes, j = a === 'mup' ? i-1 : i+1; if (j >= 0 && j < R.length){ const x = R.splice(i,1)[0]; R.splice(j,0,x); save('plano'); keepScroll(render); } return; }
    case 'mdel': if (confirm('Remover a refeição "' + P().refeicoes[i].nome + '"?')){ P().refeicoes.splice(i,1); save('plano'); keepScroll(render); } return;
    case 'madd2': P().refeicoes.push({ id:uid(), nome:'Nova refeição', hora:'', itens:[] }); save('plano'); keepScroll(render); return;
    case 'sdia': { const s = P().suplementos[i], d = parseInt(id); s.dias = s.dias || []; const p = s.dias.indexOf(d); if (p >= 0) s.dias.splice(p,1); else s.dias.push(d); s.dias.sort(); save('plano'); keepScroll(render); return; }
    case 'sdel': if (confirm('Remover "' + P().suplementos[i].nome + '"?')){ P().suplementos.splice(i,1); save('plano'); keepScroll(render); } return;
    case 'sadd': P().suplementos.push({ id:uid(), nome:'Novo suplemento', dose:'', hora:'', dias:[0,1,2,3,4,5,6] }); save('plano'); keepScroll(render); return;

    case 'madd': {
      const m = { id:uid(), data:$('#m_data').value || hoje() };
      [['peso','m_peso'],['cintura','m_cin'],['braco','m_bra'],['peito','m_pei'],['coxa','m_cox'],['gordura','m_gor']].forEach(p => { const v = num($('#'+p[1]).value); if (v != null) m[p[0]] = v; });
      if (Object.keys(m).length <= 2){ alert('Preencha pelo menos uma medida.'); return; }
      S.medidas.push(m); save('medidas'); render(); return;
    }
    case 'mrem': if (confirm('Apagar esta medida?')){ S.medidas = S.medidas.filter(m => m.id !== id); save('medidas'); keepScroll(render); } return;
    case 'padd': {
      const sis = parseInt($('#p_sis').value), di = parseInt($('#p_dia').value), bpm = parseInt($('#p_bpm').value);
      if (!sis || !di){ alert('Preencha a máxima e a mínima.'); return; }
      S.pressao.push({ id:uid(), data:$('#p_data').value || hoje(), hora:$('#p_hora').value, sis, dia:di, bpm: bpm || null });
      save('pressao'); keepScroll(render); return;
    }
    case 'prem': if (confirm('Apagar esta medição?')){ S.pressao = S.pressao.filter(p => p.id !== id); save('pressao'); keepScroll(render); } return;
    case 'eadd2': {
      const nome = $('#e_nome').value.trim(), valor = $('#e_valor').value.trim();
      if (!nome || !valor){ alert('Preencha o exame e o resultado.'); return; }
      S.exames.push({ id:uid(), data:$('#e_data').value || hoje(), nome, valor, unidade:$('#e_uni').value.trim() });
      save('exames'); keepScroll(render); return;
    }
    case 'erem': if (confirm('Apagar o resultado mais recente deste exame?')){ S.exames = S.exames.filter(x => x.id !== id); save('exames'); keepScroll(render); } return;
    case 'aform': agendaForm = true; render(); return;
    case 'aformx': agendaForm = false; render(); return;
    case 'aadd': {
      const data = $('#a_data').value;
      if (!data){ alert('Escolha a data.'); return; }
      S.agenda.push({ id:uid(), tipo:$('#a_tipo').value, titulo:$('#a_tit').value.trim(), data, hora:$('#a_hora').value, local:$('#a_loc').value.trim(), obs:$('#a_obs').value.trim(), semanal:$('#a_sem').checked });
      agendaForm = false; save('agenda'); render(); window.scrollTo(0,0); toast('Compromisso salvo'); return;
    }
    case 'arem': {
      const ev = S.agenda.find(x => x.id === id); if (!ev) return;
      if (confirm(ev.semanal ? 'Apagar este compromisso semanal (todas as semanas)?' : 'Apagar este compromisso?')){ S.agenda = S.agenda.filter(x => x.id !== id); save('agenda'); keepScroll(render); }
      return;
    }
    case 'logout': await flush(); await sb.auth.signOut(); return;
  }
});

// quando sai dos campos de carga/reps, redesenha os blocos com os valores novos
VIEW.addEventListener('focusout', () => {
  setTimeout(() => {
    if (pendRender && tab === 'hoje' && !(document.activeElement && document.activeElement.matches('input,textarea'))){ pendRender = false; keepScroll(render); }
  }, 50);
});

VIEW.addEventListener('change', e => {
  const el = e.target, f = el.dataset.f, pf = el.dataset.pf;
  if (f){
    if (f === 'kg' || f === 'reps'){
      const exo = treinoDo(cur).itens.find(x => x.id === el.dataset.ex);
      const r = getEx(dia(cur), exo); r.nome = exo.nome; r.series[parseInt(el.dataset.i)][f] = el.value.trim(); touch(cur);
      const vv = $('#vvol'); if (vv) vv.textContent = Math.round(volDia(dia(cur))).toLocaleString('pt-BR');
      pendRender = true;
    } else if (f === 'nota'){ dia(cur).nota = el.value; touch(cur); }
    else if (f === 'jmin' || f === 'jgol'){ const L = dia(cur); L.jogo = L.jogo || {}; const j = L.jogo[el.dataset.id] = L.jogo[el.dataset.id] || {}; j[f === 'jmin' ? 'min' : 'gols'] = num(el.value); touch(cur); }
    else if (f === 'progex'){ progEx = el.value; keepScroll(render); }
    else if (f === 'snotas'){ S.saude.notas = el.value; save('saude'); }
    return;
  }
  if (el.dataset.lf){
    S.lembretes = S.lembretes || lembretesPadrao();
    const k = el.dataset.lf; S.lembretes[k] = (k === 'aguaCada' || k === 'agendaMin') ? (parseInt(el.value) || 0) : el.value;
    save('lembretes'); return;
    return;
  }
  if (!pf) return;
  const i = parseInt(el.dataset.i), v = el.value, t = P().treinos[planDay];
  switch (pf){
    case 'tnome': t.nome = v; break;
    case 'tcardio': t.cardio = v.trim(); break;
    case 'tativ': t.atividades = v.split(',').map(s => s.trim()).filter(Boolean); break;
    case 'enome': t.itens[i].nome = v.trim() || t.itens[i].nome; break;
    case 'eser': t.itens[i].series = v.trim(); break;
    case 'ereps': t.itens[i].reps = v.trim(); break;
    case 'eobs': t.itens[i].obs = v.trim(); break;
    case 'obs': P().obs = v; break;
    case 'mnome': P().refeicoes[i].nome = v.trim(); break;
    case 'mhora': P().refeicoes[i].hora = v; break;
    case 'mitens': P().refeicoes[i].itens = v.split('\n').map(s => s.trim()).filter(Boolean); break;
    case 'agua': P().metaAgua = parseInt(v) || 3500; break;
    case 'snome': P().suplementos[i].nome = v.trim(); break;
    case 'slemb': { S.lembretes = S.lembretes || lembretesPadrao(); S.lembretes.supl = S.lembretes.supl || {}; if (v) S.lembretes.supl[P().suplementos[i].id] = v; else delete S.lembretes.supl[P().suplementos[i].id]; save('lembretes'); return; }
    case 'sdose': P().suplementos[i].dose = v.trim(); break;
    case 'shora': P().suplementos[i].hora = v.trim(); break;
  }
  save('plano');
});

window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && modo){ manterTelaAcesa(true); if (modo.rest && Date.now() >= modo.rest.fim){ modo.rest = null; render(); } } });
// virada do dia: se estava vendo "hoje" e a data mudou, pula pro novo dia sozinho
let diaAtual = hoje();
function checaVirada(){
  const h = hoje();
  if (h === diaAtual) return false;
  const estavaEmHoje = cur === diaAtual;
  diaAtual = h;
  if (estavaEmHoje){ cur = h; planDay = idxOf(new Date()); pickOpen = false; }
  return estavaEmHoje;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden'){ flush(); return; }
  if (!user) return;
  const virou = checaVirada();
  if ((virou || tab === 'hoje') && !document.activeElement.matches('input,textarea')) render();
});
window.addEventListener('focus', () => { if (user && checaVirada() && tab === 'hoje' && !document.activeElement.matches('input,textarea')) render(); });
setInterval(() => { if (user && checaVirada() && tab === 'hoje' && !document.activeElement.matches('input,textarea')) render(); }, 60000);
window.addEventListener('online', flush);

boot();
})();
