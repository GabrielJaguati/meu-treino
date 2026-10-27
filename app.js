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
  swap: '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>'
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
const panel = (title, ico, body, extra) => `<section class="panel"><header class="ph"><span class="pi">${ico}</span><h2>${title}</h2>${extra||''}</header>${body}</section>`;
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
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#E5202E'); g.addColorStop(1, '#FF4B2B');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.10)'; x.beginPath(); x.arc(W - 60, 110, 340, 0, 7); x.fill();
  x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.arc(40, H - 20, 320, 0, 7); x.fill();
  const HF = '"Big Shoulders Display","Arial Narrow",Impact,sans-serif', BF = 'Manrope,system-ui,-apple-system,sans-serif';
  const box = (bx, by, bw, bh) => { x.fillStyle = 'rgba(0,0,0,.20)'; x.beginPath(); if (x.roundRect) x.roundRect(bx, by, bw, bh, 34); else x.rect(bx, by, bw, bh); x.fill(); };
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  x.globalAlpha = .85; x.font = `800 32px ${BF}`; x.fillText(('Meu Treino · ' + fmtLong(parse(cur))).toUpperCase(), 80, 140); x.globalAlpha = 1;
  // título
  x.font = `800 150px ${HF}`;
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
    x.fillStyle = '#fff'; let fs = 92; x.font = `800 ${fs}px ${HF}`;
    while (x.measureText(s[0]).width > bw - 50 && fs > 40){ fs -= 4; x.font = `800 ${fs}px ${HF}`; }
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

  let h = `<div class="dnav"><button class="wkb" data-act="dprev" aria-label="Dia anterior">${ICON.l}</button>
    <div class="dl"><strong>${DIAS_F[i]}${isToday?' · hoje':''}</strong><span>${fmtLong(d)}</span>${isToday?'':'<button class="linkbtn sm" data-act="dtoday">Voltar pra hoje</button>'}</div>
    <button class="wkb" data-act="dnext" aria-label="Próximo dia">${ICON.r}</button></div>`;
  h += `<section class="hero"><div class="hl"><span class="eyebrow">${isToday ? 'Treino de hoje' : 'Treino de ' + DIAS_F[i].toLowerCase()}</span><h1>${esc(t.nome || 'Descanso')}</h1><button class="swap" data-act="tpick">${ICON.swap} ${trocado ? 'Treino de ' + DIAS_F[ti].toLowerCase() + ' · trocar' : 'Trocar treino'}</button></div>${ring(pct)}<div class="stats"><span><b>${exOk}/${t.itens.length}</b>exercícios</span><span><b>${fmtN((L.agua||0)/1000)} L</b>água</span><span><b>${refOk}/${P().refeicoes.length}</b>refeições</span></div></section>`;

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

  const evs = ocorrencias(cur, cur);
  if (evs.length) h += panel('Compromissos', IC.agenda, evs.map(o => evtHtml(o, false)).join(''));

  let b = '';
  if (t.itens.length || t.cardio) b += timerBar(L);
  if (P().obs && t.itens.length) b += `<p class="tip">${esc(P().obs)}</p>`;
  if (!t.itens.length && !t.cardio && !(t.atividades||[]).length) b += '<p class="muted">Nada planejado pra hoje. Dá pra editar na aba Plano.</p>';
  t.itens.forEach(e => {
    const r = getEx(L, e), last = lastSets(e, cur);
    const nOk = r.series.filter(s => s.ok).length, done = r.series.length && nOk === r.series.length;
    const mx = maxOk(r), prevB = mx != null ? bestKg(e.nome, cur) : null, isPR = prevB != null && mx > prevB;
    const lastTxt = last ? last.filter(s => s.kg || s.reps).map(s => (s.kg||'–') + '×' + (s.reps||'–')).join(' · ') : '';
    b += `<details class="ex ${done?'done':''}" data-ex="${e.id}" ${openEx[e.id]?'open':''}><summary><span class="dot"></span><span class="exm"><span class="rn">${esc(e.nome)}${isPR ? ' <span class="prb">🏆 recorde</span>' : ''}</span><span class="rd">${esc(e.series)}×${esc(e.reps)}${e.obs?' · '+esc(e.obs):''}</span></span><span class="cnt">${nOk}/${r.series.length}</span></summary><div class="sets">`;
    if (lastTxt) b += `<p class="cap">Última vez (kg×reps): ${esc(lastTxt)}</p>`;
    b += '<div class="sh"><span>#</span><span>kg</span><span>reps</span><span></span><span></span></div>';
    r.series.forEach((s,k) => {
      const ph = last && last[k] ? last[k].kg : '';
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

  b = `<div class="water"><span class="wn">${fmtN((L.agua||0)/1000)}<small> L</small></span><span class="wg">meta ${fmtN(meta/1000)} L</span></div>
    <div class="prog"><div class="bar"><i style="width:${Math.min(100, Math.round((L.agua||0)/meta*100))}%"></i></div></div>
    <div class="wq"><button data-act="agua" data-v="250">+250</button><button data-act="agua" data-v="500">+500</button><button data-act="agua" data-v="750">+750</button><button data-act="agua" data-v="-250">−250</button></div>`;
  h += panel('Água', IC.agua, b);

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
    h += '<div class="chips">' + DIAS.map((n,k) => `<button class="chip ${k===planDay?'on':''}" data-act="pday" data-id="${k}">${n}</button>`).join('') + '</div>';
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
  if (last){
    const diff = last.peso - first.peso;
    h += `<div class="big"><span class="bn">${fmtN(last.peso)}</span><span class="bu">kg</span></div>`;
    h += `<p class="sub">${pesos.length > 1 ? (diff > 0 ? '+' : '') + fmtN(diff) + ' kg desde ' + fmtD(first.data) : 'Primeiro registro em ' + fmtD(last.data)}</p>`;
  }
  h += chart([{ pts: pesos.map(m => ({ l:fmtD(m.data), v:m.peso })) }]);
  const cint = M.filter(m => m.cintura != null);
  if (cint.length > 1) h += '<p class="cap" style="margin-top:14px">Cintura (cm)</p>' + chart([{ pts: cint.map(m => ({ l:fmtD(m.data), v:m.cintura })), color:'var(--warn)' }]);

  h += `<h2 class="mh">Nova medida</h2><div class="fields">
    <label class="full">Data<input type="date" id="m_data" value="${hoje()}"></label>
    <label>Peso (kg)<input inputmode="decimal" id="m_peso"></label>
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
  h += `<h2 class="mh">Lesões e observações</h2><div class="f" style="margin-top:0"><textarea rows="5" data-f="snotas">${esc((S.saude||{}).notas||'')}</textarea></div>`;
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
  let h = '<h1>Agenda</h1>';
  h += `<h2 class="mh">Novo compromisso</h2><div class="fields">
    <label>Tipo<select id="a_tipo">${Object.keys(TIPOS).map(k => `<option value="${k}">${TIPOS[k]}</option>`).join('')}</select></label>
    <label>Título<input id="a_tit" placeholder="Ex.: Ortopedista"></label>
    <label>Data<input type="date" id="a_data" value="${h0}"></label>
    <label>Hora<input type="time" id="a_hora"></label>
    <label class="full">Local<input id="a_loc" placeholder="Ex.: Clínica, quadra…"></label>
    <label class="full">Observação<input id="a_obs" placeholder="Ex.: levar exames"></label>
    <label class="full ckl"><input type="checkbox" id="a_sem">Repetir toda semana</label></div>
    <button class="btn primary" data-act="aadd">Salvar compromisso</button>`;
  const prox = ocorrencias(h0, addDays(h0, 30));
  h += '<h2 class="mh">Próximos 30 dias</h2>';
  h += prox.length ? prox.map(o => evtHtml(o, true)).join('') : '<p class="muted">Nada marcado.</p>';
  const pass = (S.agenda||[]).filter(e => !e.semanal && e.data < h0).sort((a,b) => a.data < b.data ? 1 : -1).slice(0,10);
  if (pass.length) h += '<h2 class="mh">Passados</h2>' + pass.map(e => evtHtml({ e, data:e.data }, true)).join('');
  VIEW.innerHTML = h;
}

/* ---------- render ---------- */
function render(){
  document.querySelectorAll('.tabbtn').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (tab === 'hoje') renderHoje();
  else if (tab === 'agenda') renderAgenda();
  else if (tab === 'plano') renderPlano();
  else if (tab === 'prog') renderProg();
  else renderSaude();
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
    case 'tret': delete L.fim; touch(cur); keepScroll(render); return;
    case 'tshare': shareResumo(); return;
    case 'jsens': case 'jdor': { L.jogo = L.jogo || {}; const j = L.jogo[id] = L.jogo[id] || {}; const v = parseInt(b.dataset.v); const f = a === 'jsens' ? 'sens' : 'dor'; j[f] = j[f] === v ? null : v; touch(cur); keepScroll(render); return; }
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
    case 'pday': planDay = parseInt(id); render(); return;
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
    case 'aadd': {
      const data = $('#a_data').value;
      if (!data){ alert('Escolha a data.'); return; }
      S.agenda.push({ id:uid(), tipo:$('#a_tipo').value, titulo:$('#a_tit').value.trim(), data, hora:$('#a_hora').value, local:$('#a_loc').value.trim(), obs:$('#a_obs').value.trim(), semanal:$('#a_sem').checked });
      save('agenda'); keepScroll(render); return;
    }
    case 'arem': {
      const ev = S.agenda.find(x => x.id === id); if (!ev) return;
      if (confirm(ev.semanal ? 'Apagar este compromisso semanal (todas as semanas)?' : 'Apagar este compromisso?')){ S.agenda = S.agenda.filter(x => x.id !== id); save('agenda'); keepScroll(render); }
      return;
    }
    case 'logout': await flush(); await sb.auth.signOut(); return;
  }
});

VIEW.addEventListener('change', e => {
  const el = e.target, f = el.dataset.f, pf = el.dataset.pf;
  if (f){
    if (f === 'kg' || f === 'reps'){
      const exo = treinoDo(cur).itens.find(x => x.id === el.dataset.ex);
      const r = getEx(dia(cur), exo); r.nome = exo.nome; r.series[parseInt(el.dataset.i)][f] = el.value.trim(); touch(cur);
    } else if (f === 'nota'){ dia(cur).nota = el.value; touch(cur); }
    else if (f === 'jmin' || f === 'jgol'){ const L = dia(cur); L.jogo = L.jogo || {}; const j = L.jogo[el.dataset.id] = L.jogo[el.dataset.id] || {}; j[f === 'jmin' ? 'min' : 'gols'] = num(el.value); touch(cur); }
    else if (f === 'progex'){ progEx = el.value; keepScroll(render); }
    else if (f === 'snotas'){ S.saude.notas = el.value; save('saude'); }
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
    case 'sdose': P().suplementos[i].dose = v.trim(); break;
    case 'shora': P().suplementos[i].hora = v.trim(); break;
  }
  save('plano');
});

window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); else if (user && tab === 'hoje' && !document.activeElement.matches('input,textarea')) render(); });
window.addEventListener('online', flush);

boot();
})();
