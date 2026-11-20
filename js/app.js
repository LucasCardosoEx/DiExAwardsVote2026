// =====================================================================
//  The Game Awards DiEx Edition — lógica do site
//  Você não precisa mexer aqui: categorias, indicados e chaves ficam em js/config.js
// =====================================================================
"use strict";

const CFG = window.DIEX_CONFIG;

// Cada categoria ganha um "slug", que vira o endereço da página:
//   .../categorias/jogo-mais-aguardado
const CATS = CFG.categorias.map((c) => ({
  ...c,
  slug: c.slug || slugify(c.nome),
}));

// Pasta raiz do site (definida pela tag <base> no index.html)
const BASE = new URL(document.baseURI).pathname;

const $ = (s) => document.querySelector(s);

let sb = null;
let session = null;
let perfis = {};
let votos = {};
let ocupado = false;

// ---------------------------------------------------------------------
//  Utilidades
// ---------------------------------------------------------------------
function slugify(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function iniciais(texto) {
  return texto
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Gradiente fixo para cada indicado sem imagem (sempre a mesma cor para o mesmo nome)
function corPadrao(texto) {
  let h = 0;
  for (const ch of texto) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  const matiz = h % 360;
  return `linear-gradient(160deg, hsl(${matiz} 35% 42%), hsl(${matiz} 45% 12%))`;
}

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto != null) e.textContent = texto;
  return e;
}

function link(href, classe, texto) {
  const a = el("a", classe, texto);
  a.href = href;
  a.dataset.link = "";
  return a;
}

function linkTodas() {
  const a = link(urlHome(), "todas", "Ver todas");
  a.append(el("span", "longo", " as categorias"));
  return a;
}

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 3500);
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

function avatar(p, classe = "") {
  if (p && p.avatar) {
    const i = el("img", "av " + classe);
    i.src = p.avatar;
    i.alt = p.nick || "";
    i.title = p.nick || "";
    i.loading = "lazy";
    i.onerror = () => i.replaceWith(avatar({ nick: p.nick }, classe));
    return i;
  }
  const d = el("span", "av " + classe, ((p && p.nick) || "?")[0].toUpperCase());
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

const meuId = () => session && session.user.id;
const meuVoto = (catId) => {
  const id = meuId();
  return id && votos[id] ? votos[id][catId] : undefined;
};
const totalVotados = () => CATS.filter((c) => meuVoto(c.id)).length;

// ---------------------------------------------------------------------
//  Rotas: "/" (todas as categorias) e "/categorias/<slug>"
// ---------------------------------------------------------------------
const urlHome = () => BASE;
const urlCategoria = (c) => BASE + "categorias/" + c.slug;

function rotaAtual() {
  const caminho = location.pathname;
  const rel = caminho.startsWith(BASE) ? caminho.slice(BASE.length) : "";
  if (
    rel === "" ||
    rel === "index.html" ||
    rel === "categorias" ||
    rel === "categorias/"
  ) {
    return { tipo: "home" };
  }
  const m = rel.match(/^categorias\/([^/]+)\/?$/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    const i = CATS.findIndex((c) => c.slug === slug);
    if (i >= 0) return { tipo: "categoria", cat: CATS[i], indice: i };
  }
  return { tipo: "naoEncontrada" };
}

function navegar(href) {
  if (href === location.href) return;
  history.pushState({}, "", href);
  render();
  window.scrollTo(0, 0);
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
    return;
  e.preventDefault();
  navegar(a.href);
});

window.addEventListener("popstate", render);

// Setas do teclado trocam de categoria
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, select")) return;
  const r = rotaAtual();
  if (r.tipo !== "categoria") return;
  if (e.key === "ArrowLeft" && r.indice > 0)
    navegar(urlCategoria(CATS[r.indice - 1]));
  if (e.key === "ArrowRight" && r.indice < CATS.length - 1)
    navegar(urlCategoria(CATS[r.indice + 1]));
});

// ---------------------------------------------------------------------
//  Topo: login / conta
// ---------------------------------------------------------------------
const ICONE_DISCORD =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18 18 0 0 0-5.6 0L8.6 3a19.6 19.6 0 0 0-4.9 1.5C.6 9.1-.3 13.7.1 18.2a19.8 19.8 0 0 0 6 3l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.8-3.6-13.8ZM8.3 15.5c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>';

function renderConta() {
  const box = $("#me");
  if (!box) return;
  box.replaceChildren();

  if (!sb) return;

  if (!session) {
    if (!CFG.votacaoAberta) {
      box.append(el("span", "hint", "Votação encerrada"));
      return;
    }
    const b = el("button", "discord");
    b.type = "button";
    b.innerHTML = ICONE_DISCORD + "<span>Entrar com Discord</span>";
    b.onclick = entrar;
    box.append(b);
    return;
  }

  const p = perfis[meuId()] || {
    nick: nickDoDiscord(session.user),
    avatar: (session.user.user_metadata || {}).avatar_url,
  };
  const quem = el("div", "quem");
  quem.append(avatar(p), el("b", null, p.nick));
  const sair = el("button", "ghost", "Sair");
  sair.type = "button";
  sair.onclick = () => sb.auth.signOut();
  box.append(quem, sair);
}

// ---------------------------------------------------------------------
//  Barra de navegação entre categorias
// ---------------------------------------------------------------------
function renderBarra(rota) {
  const barra = $("#barra");
  if (!barra) return;
  barra.replaceChildren();
  barra.hidden = rota.tipo !== "categoria";
  if (barra.hidden) return;

  const sair = link(urlHome(), "sair", "← Sair");
  sair.append(el("span", "longo", " da votação"));

  const meio = el("div", "meio");
  meio.append(linkTodas());

  const contador = el("div", "contador");
  contador.append(el("span", "longo", "Seus votos"));
  const n = el("b");
  n.textContent = `${session ? totalVotados() : 0}/${CATS.length}`;
  contador.append(n);

  barra.append(sair, meio, contador);
}

// ---------------------------------------------------------------------
//  Página inicial: todas as categorias
// ---------------------------------------------------------------------
function viewHome() {
  const frag = document.createDocumentFragment();

  const hero = el("header", "hero");
  hero.innerHTML =
    '<img class="hero-img" src="img/hero.jpg" alt="">' +
    "<h1>The Game Awards <em>DiEx Edition</em></h1>";
  frag.append(hero);

  const sec = el("section", "todas-cats");
  const topo = el("div", "todas-topo");
  topo.append(el("h2", null, "Categorias"));
  if (session) {
    topo.append(
      el("span", "hint", `Você votou em ${totalVotados()} de ${CATS.length}`),
    );
  }
  sec.append(topo);

  const grid = el("div", "lista-cats");
  const ids = Object.keys(perfis);
  CATS.forEach((c) => {
    const card = link(urlCategoria(c), "cat-card");
    card.append(el("b", null, c.nome));
    if (c.en) card.append(el("span", "en", c.en));

    const rod = el("div", "cat-card-rodape");
    const qtd = ids.filter((id) => votos[id] && votos[id][c.id]).length;
    rod.append(el("span", "hint", `${qtd} ${qtd === 1 ? "voto" : "votos"}`));
    if (session) {
      const v = meuVoto(c.id);
      const nom = v && c.indicados.find((n) => n.id === v);
      rod.append(
        nom
          ? el("span", "pill ok", "Seu voto: " + nom.titulo)
          : el("span", "pill", "Falta votar"),
      );
    }
    card.append(rod);
    grid.append(card);
  });
  sec.append(grid);

  if (CATS.length) {
    const comecar = link(
      urlCategoria(CATS[0]),
      "botao",
      "Começar pela primeira categoria →",
    );
    const wrap = el("div", "acoes");
    wrap.append(comecar);
    sec.append(wrap);
  }

  frag.append(sec);
  return frag;
}

// ---------------------------------------------------------------------
//  Página de uma categoria
// ---------------------------------------------------------------------
function viewCategoria(rota) {
  const c = rota.cat;
  const ids = Object.keys(perfis);
  const sec = el("section", "cat");

  // Anterior / próxima: sempre no mesmo lugar, logo abaixo da barra
  const ant = CATS[rota.indice - 1];
  const prox = CATS[rota.indice + 1];
  const passos = el("nav", "passos");
  passos.setAttribute("aria-label", "Categoria anterior e próxima");
  if (ant) {
    const a = link(urlCategoria(ant), "passo ant");
    a.append(el("small", null, "← Anterior"), el("span", null, ant.nome));
    passos.append(a);
  } else passos.append(el("span"));
  if (prox) {
    const a = link(urlCategoria(prox), "passo prox");
    a.append(el("small", null, "Próxima →"), el("span", null, prox.nome));
    passos.append(a);
  } else {
    const a = link(urlHome(), "passo prox");
    a.append(
      el("small", null, "Fim das categorias"),
      el("span", null, "Ver todas →"),
    );
    passos.append(a);
  }
  sec.append(passos);

  const cab = el("header", "cat-cab");
  cab.append(el("h1", "cat-titulo", c.nome));
  if (c.en) cab.append(el("span", "cat-en", c.en));
  if (c.desc) cab.append(el("p", "cat-desc", c.desc));
  sec.append(cab);

  const grid = el("div", "grid");
  grid.style.setProperty("--n", c.indicados.length);
  for (const n of c.indicados) {
    grid.append(cardIndicado(c, n, ids));
  }
  sec.append(grid);

  // Quem ainda não votou nesta categoria
  const pend = el("div", "pend");
  const falta = ids.filter((id) => !(votos[id] && votos[id][c.id]));
  pend.append(
    el(
      "span",
      "lbl",
      !ids.length
        ? "Ninguém entrou ainda"
        : falta.length
          ? "Ainda não votaram"
          : "Todo mundo já votou",
    ),
  );
  const lista = el("div", "list");
  falta.forEach((id) => lista.append(avatar(perfis[id])));
  pend.append(lista);
  sec.append(pend);

  return sec;
}

function cardIndicado(c, n, ids) {
  const quem = ids.filter((id) => votos[id] && votos[id][c.id] === n.id);
  const meu = meuVoto(c.id) === n.id;

  const b = el("button", "nom" + (meu ? " mine" : ""));
  b.type = "button";
  b.disabled = !CFG.votacaoAberta;
  b.setAttribute(
    "aria-label",
    `${n.titulo}, ${n.sub || ""}. ${quem.length} voto(s).${meu ? " Seu voto." : ""}`,
  );

  const art = el("div", "art");
  art.style.setProperty("--g", n.cor || corPadrao(n.titulo));
  const mono = el("span", "mono", iniciais(n.titulo));
  art.append(mono);
  // Tenta img/<id>.webp, depois .jpg e .png (ou o caminho do config, se tiver)
  const tentativas = n.imagem
    ? [n.imagem]
    : ["webp", "jpg", "png"].map((ext) => `img/${n.id}.${ext}`);
  {
    const im = el("img", "capa");
    im.alt = "";
    im.loading = "lazy";
    im.src = tentativas.shift();
    im.onload = () => {
      art.classList.add("has-img");
      mono.hidden = true;
    };
    im.onerror = () => {
      if (tentativas.length) im.src = tentativas.shift();
      else im.remove();
    };
    art.prepend(im);
  }

  const vs = el("div", "votes");
  quem.forEach((id) => vs.append(avatar(perfis[id])));
  art.append(vs);
  if (quem.length) art.append(el("span", "count", String(quem.length)));
  if (meu) art.append(el("span", "badge", "SEU VOTO"));

  const info = el("div", "info");
  info.append(el("b", null, n.titulo), el("span", null, n.sub || ""));

  b.append(art, info);
  b.onclick = () => votar(c.id, n.id);
  return b;
}

function viewNaoEncontrada() {
  const sec = el("section", "vazio");
  sec.append(el("h1", "cat-titulo", "Categoria não encontrada"));
  sec.append(
    el("p", "cat-desc", "Esse endereço não corresponde a nenhuma categoria."),
  );
  sec.append(link(urlHome(), "botao", "Ver todas as categorias"));
  return sec;
}

// ---------------------------------------------------------------------
//  Render geral
// ---------------------------------------------------------------------
function render() {
  const rota = rotaAtual();
  renderConta();
  renderBarra(rota);

  const app = $("#app");
  if (!app) return;
  app.replaceChildren(
    rota.tipo === "home"
      ? viewHome()
      : rota.tipo === "categoria"
        ? viewCategoria(rota)
        : viewNaoEncontrada(),
  );

  document.title =
    rota.tipo === "categoria"
      ? `${rota.cat.nome} · DiEx Awards`
      : "The Game Awards DiEx Edition";
}

// ---------------------------------------------------------------------
//  Ações
// ---------------------------------------------------------------------
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
    const b = $("#me button");
    if (b) b.focus();
    return;
  }
  if (ocupado) return;
  ocupado = true;

  const id = meuId();
  const antes = { ...(votos[id] || {}) };
  const tirar = antes[cat] === nom;

  // Atualiza a tela na hora
  votos[id] = { ...antes };
  if (tirar) delete votos[id][cat];
  else votos[id][cat] = nom;
  render();

  const { error } = tirar
    ? await sb.from("votos").delete().eq("user_id", id).eq("categoria", cat)
    : await sb.from("votos").upsert(
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

// ---------------------------------------------------------------------
//  Início
// ---------------------------------------------------------------------
(async function iniciar() {
  render();

  const configurado =
    CFG.supabaseUrl &&
    !CFG.supabaseUrl.includes("SEU-PROJETO") &&
    CFG.supabaseAnonKey &&
    !CFG.supabaseAnonKey.includes("COLE");

  if (!configurado || !window.supabase) {
    aviso(
      !window.supabase
        ? "Não deu para carregar a biblioteca do Supabase. Verifique sua conexão."
        : "Preencha supabaseUrl e supabaseAnonKey no arquivo js/config.js.",
      true,
    );
    return;
  }

  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  const { data } = await sb.auth.getSession();
  session = data.session;
  if (session) await salvarPerfil();
  render();

  sb.auth.onAuthStateChange(async (_evento, s) => {
    const mudou = (s && s.user.id) !== meuId();
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
