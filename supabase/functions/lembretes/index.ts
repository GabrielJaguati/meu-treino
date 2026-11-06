// Meu Treino — função "lembretes" (Supabase Edge Function)
// Roda a cada 5 minutos pelo agendador e envia as notificações que estão na hora.
// Também aceita {"teste":true} vindo do app (com o login do usuário) para mandar um teste.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

// lê um segredo limpando espaços, aspas e crases coladas por engano
const env = (k: string) => { const v = Deno.env.get(k); return v == null ? undefined : v.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, "") || undefined; };

// configuração carregada só na hora do pedido, pra poder avisar o que falta
let sb: any = null;
function iniciar() {
  const faltando = ["VAPID_PUBLIC", "VAPID_PRIVATE", "CRON_SECRET"].filter((k) => !env(k));
  const service = env("SERVICE_KEY") ?? env("SUPABASE_SERVICE_ROLE_KEY");
  if (!service) faltando.push("SERVICE_KEY");
  if (faltando.length) throw new Error("Faltam os segredos: " + faltando.join(", "));
  if (!sb) {
    sb = createClient(env("SUPABASE_URL")!, service!, { auth: { persistSession: false } });
    webpush.setVapidDetails(
      "mailto:" + (env("VAPID_EMAIL") || "meu-treino@example.com").replace(/^mailto:/i, ""),
      env("VAPID_PUBLIC")!,
      env("VAPID_PRIVATE")!,
    );
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const TZ = "America/Sao_Paulo";
const JANELA = 15; // minutos de tolerância (o agendador roda a cada 5)
const DIAS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function agoraSP() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { data: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute, dia: DIAS.indexOf(p.weekday) };
}
const hm = (s?: string) => { if (!s || !/^\d{1,2}:\d{2}$/.test(s)) return null; const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const fmtL = (ml: number) => String(Math.round(ml / 100) / 10).replace(".", ",");
const diasEntre = (a: string, b: string) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);

type Msg = { chave: string; title: string; body: string; tag: string };

function calcular(reg: Record<string, any>, agora: ReturnType<typeof agoraSP>): Msg[] {
  const out: Msg[] = [];
  const plano = reg.plano; if (!plano) return out;
  const L = reg.lembretes || {};
  const D = reg["dia:" + agora.data] || {};
  const naHora = (alvo: number | null) => alvo != null && agora.min >= alvo && agora.min - alvo < JANELA;
  const idx = D.treinoDia != null ? D.treinoDia : agora.dia;
  const treino = (plano.treinos || {})[idx] || {};

  // suplementos
  for (const s of plano.suplementos || []) {
    const t = hm((L.supl || {})[s.id]);
    if (!(s.dias || []).includes(agora.dia) || (D.supl || {})[s.id]) continue;
    if (naHora(t)) out.push({ chave: `supl|${s.id}|${t}`, title: "💊 " + s.nome, body: (s.dose ? s.dose + " · " : "") + "Hora de tomar", tag: "supl-" + s.id });
  }

  // refeições (horário do plano; o jantar de quinta pode ter horário próprio)
  if (L.refeicoes !== false) {
    for (const m of plano.refeicoes || []) {
      const t = hm(((m.horaDia || {})[agora.dia]) || m.hora);
      if ((D.ref || {})[m.id]) continue;
      if (naHora(t)) out.push({ chave: `ref|${m.id}|${t}`, title: "🍽️ " + (m.nome || "Refeição"), body: "Hora de comer. Marque no app o que você escolheu.", tag: "ref-" + m.id });
    }
  }

  // água
  const cada = +L.aguaCada || 0, meta = +plano.metaAgua || 3500, agua = +D.agua || 0;
  const ini = hm(L.aguaIni) ?? 540, fim = hm(L.aguaFim) ?? 1260;
  if (cada > 0 && agua < meta) {
    for (let t = ini + cada * 60; t <= fim; t += cada * 60) {
      if (naHora(t)) out.push({ chave: `agua|${t}`, title: "💧 Bora beber água", body: `${fmtL(agua)} de ${fmtL(meta)} L hoje`, tag: "agua" });
    }
  }

  // treino
  const tt = hm(L.treino);
  if (tt != null && !D.inicio && ((treino.itens || []).length || treino.cardio) && naHora(tt)) {
    out.push({ chave: `treino|${tt}`, title: "🏋️ Hora do treino", body: `Hoje: ${treino.nome || "treino"}${treino.cardio ? " · " + treino.cardio : ""}`, tag: "treino" });
  }

  // compromissos
  const antes = +L.agendaMin || 0;
  if (antes > 0) {
    for (const e of reg.agenda || []) {
      const h = hm(e.hora); if (h == null) continue;
      let hoje = e.data === agora.data;
      if (e.semanal && e.data <= agora.data && diasEntre(e.data, agora.data) % 7 === 0) hoje = true;
      if (!hoje) continue;
      const alvo = h - antes;
      if (alvo >= 0 && naHora(alvo)) {
        const q = antes >= 60 ? (antes / 60) + (antes === 60 ? " hora" : " horas") : antes + " min";
        out.push({ chave: `agenda|${e.id}|${alvo}`, title: "📅 " + (e.titulo || "Compromisso"), body: `Em ${q} · ${e.hora}${e.local ? " · " + e.local : ""}`, tag: "agenda-" + e.id });
      }
    }
  }
  return out;
}

async function enviar(userId: string, payload: Record<string, unknown>) {
  const { data: subs } = await sb.from("push_subs").select("endpoint, sub").eq("user_id", userId);
  let ok = 0;
  for (const s of subs || []) {
    try { await webpush.sendNotification(s.sub, JSON.stringify(payload), { TTL: 3600 }); ok++; }
    catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", s.endpoint);
      else console.error("push falhou", err?.statusCode, err?.body);
    }
  }
  return ok;
}

async function rodar() {
  const agora = agoraSP();
  const { data: subs } = await sb.from("push_subs").select("user_id");
  const users = [...new Set((subs || []).map((s) => s.user_id))];
  let enviados = 0;
  for (const uid of users) {
    const { data: rows } = await sb.from("registros").select("chave, dados").eq("user_id", uid)
      .in("chave", ["plano", "agenda", "lembretes", "dia:" + agora.data]);
    const reg: Record<string, any> = {};
    for (const r of rows || []) reg[r.chave] = r.dados;
    const msgs = calcular(reg, agora);
    if (!msgs.length) continue;
    const chaves = msgs.map((m) => agora.data + "|" + m.chave);
    const { data: ja } = await sb.from("push_log").select("chave").eq("user_id", uid).in("chave", chaves);
    const feitos = new Set((ja || []).map((x) => x.chave));
    for (const m of msgs) {
      const k = agora.data + "|" + m.chave;
      if (feitos.has(k)) continue;
      const { error } = await sb.from("push_log").insert({ user_id: uid, chave: k });
      if (error) continue; // outro disparo já mandou
      enviados += await enviar(uid, { title: m.title, body: m.body, tag: m.tag, url: "./" });
    }
  }
  await sb.from("push_log").delete().lt("enviado_em", new Date(Date.now() - 3 * 864e5).toISOString());
  return { usuarios: users.length, enviados, hora: agora };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    iniciar();
  } catch (e: any) {
    return json({ erro: e.message }, 500);
  }
  try {
    return await atender(req);
  } catch (e: any) {
    console.error(e);
    return json({ erro: "Erro na função: " + (e?.message || e) }, 500);
  }
});

async function atender(req: Request) {
  const body = await req.json().catch(() => ({}));

  if (body?.teste) {
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) return json({ erro: "Login não reconhecido. Saia e entre de novo no app." }, 401);
    const n = await enviar(data.user.id, { title: "Meu Treino 💪", body: "Notificações funcionando!", tag: "teste", url: "./" });
    if (!n) return json({ erro: "Nenhum aparelho ativado. Toque em Desativar e depois em Ativar de novo." }, 404);
    return json({ enviados: n });
  }

  if (req.headers.get("x-cron-secret") !== env("CRON_SECRET")) return json({ erro: "não autorizado" }, 401);
  return json(await rodar());
}
