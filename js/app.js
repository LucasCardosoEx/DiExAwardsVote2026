// =====================================================================
//  The Game Awards DiEx Edition — lógica do site
//  Você não precisa mexer aqui: categorias, indicados e chaves ficam em js/config.js
// =====================================================================
"use strict";

const CFG = window.DIEX_CONFIG;
const CATS = CFG.categorias;
const $ = (s) => document.querySelector(s);
let sb = null,
  session = null,
  perfis = {},
  votos = {},
  ocupado = false;

const iniciais = (t) =>
  t
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.h);
  toast.h = setTimeout(() => (t.hidden = true), 3500);
}
function aviso(msg, erro) {
  const a = $("#aviso");
  if (!a) {
    if (msg) console.warn(msg);
    return;
  }
  a.textContent = msg || "";
  a.hidden = !msg;
  a.classList.toggle("err", !!erro);
}

function avatar(p, cls = "") {
  if (p && p.avatar) {
    const i = document.createElement("img");
    i.className = "av " + cls;
    i.src = p.avatar;
    i.alt = p.nick || "";
    i.title = p.nick || "";
    i.loading = "lazy";
    i.onerror = () => i.replaceWith(avatar({ nick: p.nick }, cls));
    return i;
  }
  const d = document.createElement("span");
  d.className = "av " + cls;
  d.textContent = ((p && p.nick) || "?")[0].toUpperCase();
  d.title = (p && p.nick) || "";
  return d;
}

function nickDoDiscord(u) {
  const m = u.user_metadata || {};
  return (
    (m.custom_claims && m.custom_claims.global_name) ||
    m.full_name ||
    m.name ||
    m.user_name ||
    "Sem nome"
  );
}

// ---------- Topo: login / perfil ----------
function renderMe() {
  const box = $("#me");
  if (!box) return;
  box.replaceChildren();
  if (!sb) {
    const s = document.createElement("span");
    s.className = "hint";
    s.textContent = "Site ainda não configurado.";
    box.append(s);
    return;
  }

  if (!session) {
    const who = document.createElement("div");
    who.className = "who";
    const s = document.createElement("span");
    s.className = "hint";
    s.textContent = CFG.votacaoAberta
      ? "Entre com sua conta do Discord para votar. Seu nick e sua foto vêm de lá."
      : "A votação está encerrada. Confira o resultado abaixo.";
    who.append(s);
    box.append(who);
    if (CFG.votacaoAberta) {
      const b = document.createElement("button");
      b.className = "discord";
      b.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18 18 0 0 0-5.6 0L8.6 3a19.6 19.6 0 0 0-4.9 1.5C.6 9.1-.3 13.7.1 18.2a19.8 19.8 0 0 0 6 3l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.8-3.6-13.8ZM8.3 15.5c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg><span>Entrar com Discord</span>';
      b.onclick = entrar;
      box.append(b);
    }
    return;
  }

  const meuId = session.user.id;
  const p = perfis[meuId] || {
    nick: nickDoDiscord(session.user),
    avatar: (session.user.user_metadata || {}).avatar_url,
  };
  const who = document.createElement("div");
  who.className = "who";
  const t = document.createElement("div");
  const b = document.createElement("b");
  b.textContent = p.nick;
  const h = document.createElement("div");
  h.className = "hint";
  const n = CATS.filter((c) => votos[meuId] && votos[meuId][c.id]).length;
  h.textContent = CFG.votacaoAberta
    ? `Você votou em ${n} de ${CATS.length} categorias`
    : "Votação encerrada";
  t.append(b, h);
  who.append(avatar(p, "lg"), t);
  const sair = document.createElement("button");
  sair.className = "ghost";
  sair.textContent = "Sair";
  sair.onclick = async () => {
    await sb.auth.signOut();
  };
  box.append(who, sair);
}

// ---------- Categorias ----------
function renderCats() {
  const root = $("#cats");
  if (!root) return;
  root.replaceChildren();
  const ids = Object.keys(perfis);
  const meuId = session && session.user.id;

  for (const c of CATS) {
    const sec = document.createElement("section");
    sec.className = "cat";
    const h = document.createElement("h2");
    h.textContent = c.nome;
    if (c.en) {
      const sm = document.createElement("small");
      sm.textContent = c.en;
      h.append(sm);
    }
    const d = document.createElement("p");
    d.textContent = c.desc || "";
    const g = document.createElement("div");
    g.className = "grid";

    for (const n of c.indicados) {
      const quem = ids.filter((id) => votos[id] && votos[id][c.id] === n.id);
      const meu = meuId && votos[meuId] && votos[meuId][c.id] === n.id;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "nom" + (meu ? " mine" : "");
      b.disabled = !CFG.votacaoAberta;
      b.setAttribute(
        "aria-label",
        `${n.titulo}, ${n.sub || ""}. ${quem.length} voto(s).${meu ? " Seu voto." : ""}`,
      );

      const art = document.createElement("div");
      art.className = "art";
      art.style.setProperty(
        "--g",
        n.cor || "linear-gradient(160deg,#3a4058,#141822)",
      );
      const mono = document.createElement("span");
      mono.className = "mono";
      mono.textContent = iniciais(n.titulo);
      art.append(mono);
      if (n.imagem) {
        const im = document.createElement("img");
        im.className = "capa";
        im.alt = "";
        im.src = n.imagem;
        im.loading = "lazy";
        im.onload = () => {
          art.classList.add("has-img");
          mono.hidden = true;
        };
        im.onerror = () => im.remove();
        art.prepend(im);
      }
      const vs = document.createElement("div");
      vs.className = "votes";
      quem.forEach((id) => vs.append(avatar(perfis[id])));
      art.append(vs);
      if (quem.length) {
        const ct = document.createElement("span");
        ct.className = "count";
        ct.textContent = quem.length;
        art.append(ct);
      }
      if (meu) {
        const bd = document.createElement("span");
        bd.className = "badge";
        bd.textContent = "SEU VOTO";
        art.append(bd);
      }

      const info = document.createElement("div");
      info.className = "info";
      const tb = document.createElement("b");
      tb.textContent = n.titulo;
      const ts = document.createElement("span");
      ts.textContent = n.sub || "";
      info.append(tb, ts);
      b.append(art, info);
      b.onclick = () => votar(c.id, n.id);
      g.append(b);
    }

    const pend = document.createElement("div");
    pend.className = "pend";
    const falta = ids.filter((id) => !(votos[id] && votos[id][c.id]));
    const lbl = document.createElement("span");
    lbl.className = "lbl";
    lbl.textContent = !ids.length
      ? "Ninguém entrou ainda"
      : falta.length
        ? "Ainda não votaram"
        : "Todo mundo já votou";
    const list = document.createElement("div");
    list.className = "list";
    falta.forEach((id) => list.append(avatar(perfis[id])));
    pend.append(lbl, list);

    sec.append(h, d, g, pend);
    root.append(sec);
  }
}

function render() {
  renderMe();
  renderCats();
}

// ---------- Ações ----------
async function entrar() {
  const volta = location.origin + location.pathname;
  const { error } = await sb.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: volta, scopes: "identify" },
  });
  if (error)
    aviso("Não deu para abrir o login do Discord: " + error.message, true);
}

async function votar(cat, nom) {
  if (!CFG.votacaoAberta) return;
  if (!session) {
    toast("Entre com o Discord para votar.");
    $("#me button")?.focus();
    return;
  }
  if (ocupado) return;
  ocupado = true;
  const id = session.user.id;
  const antes = Object.assign({}, votos[id] || {});
  const tirar = antes[cat] === nom;

  // atualiza na tela na hora
  votos[id] = Object.assign({}, antes);
  if (tirar) delete votos[id][cat];
  else votos[id][cat] = nom;
  render();

  const { error } = tirar
    ? await sb.from("votos").delete().eq("user_id", id).eq("categoria", cat)
    : await sb
        .from("votos")
        .upsert(
          {
            user_id: id,
            categoria: cat,
            indicado: nom,
            votado_em: new Date().toISOString(),
          },
          { onConflict: "user_id,categoria" },
        );

  ocupado = false;
  if (error) {
    votos[id] = antes;
    render();
    toast("Seu voto não foi salvo. Tente de novo.");
    console.error(error);
  }
}

async function salvarPerfil() {
  if (!session) return;
  const u = session.user;
  const p = {
    id: u.id,
    nick: nickDoDiscord(u),
    avatar: (u.user_metadata || {}).avatar_url || null,
    atualizado_em: new Date().toISOString(),
  };
  perfis[u.id] = p;
  const { error } = await sb.from("perfis").upsert(p);
  if (error) console.error(error);
}

async function carregar() {
  const [p, v] = await Promise.all([
    sb.from("perfis").select("id,nick,avatar"),
    sb.from("votos").select("user_id,categoria,indicado"),
  ]);
  if (p.error || v.error) {
    aviso(
      "Não deu para carregar os votos. Confira se o setup.sql foi rodado no Supabase.",
      true,
    );
    console.error(p.error || v.error);
    return;
  }
  aviso("");
  perfis = {};
  p.data.forEach((r) => (perfis[r.id] = r));
  votos = {};
  v.data.forEach((r) => {
    (votos[r.user_id] ||= {})[r.categoria] = r.indicado;
  });
  render();
}

let recarga;
function agendarRecarga() {
  clearTimeout(recarga);
  recarga = setTimeout(carregar, 250);
}

// ---------- Início ----------
(async function iniciar() {
  const eyebrow = $("#eyebrow");
  if (eyebrow)
    eyebrow.textContent = CFG.votacaoAberta
      ? "Votação da comunidade · aberta"
      : "Votação da comunidade · encerrada";
  renderCats();

  const configurado =
    CFG.supabaseUrl &&
    !CFG.supabaseUrl.includes("SEU-PROJETO") &&
    CFG.supabaseAnonKey &&
    !CFG.supabaseAnonKey.includes("COLE");
  if (!configurado || !window.supabase) {
    renderMe();
    aviso(
      !window.supabase
        ? "Não deu para carregar a biblioteca do Supabase. Verifique sua conexão."
        : "Preencha supabaseUrl e supabaseAnonKey no arquivo config.js.",
      true,
    );
    return;
  }

  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  const { data } = await sb.auth.getSession();
  session = data.session;
  if (session) await salvarPerfil();
  render();

  sb.auth.onAuthStateChange(async (evento, s) => {
    const mudou = (s && s.user.id) !== (session && session.user.id);
    session = s;
    if (s && mudou) await salvarPerfil();
    render();
  });

  await carregar();

  sb.channel("diex-votos")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "votos" },
      agendarRecarga,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "perfis" },
      agendarRecarga,
    )
    .subscribe();
})();
