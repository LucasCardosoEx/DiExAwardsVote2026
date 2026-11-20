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
let controle = null; // { votacao_aberta, encerra_em } vindo do Supabase
let vencedores = {}; // categoria -> indicado
let souAdmin = false;
let adminVerificado = false;

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

// O painel (tabela "controle" no Supabase) manda. Sem ela, vale o config.js.
function prazo() {
  if (controle)
    return controle.encerra_em ? new Date(controle.encerra_em) : null;
  return CFG.votacaoEncerra ? new Date(CFG.votacaoEncerra) : null;
}
function ligada() {
  return controle ? !!controle.votacao_aberta : !!CFG.votacaoAberta;
}
function votacaoAberta() {
  const p = prazo();
  return ligada() && (!p || Date.now() < p.getTime());
}
function textoPrazo(data = prazo()) {
  const PRAZO = data;
  if (!PRAZO) return "";
  const d = PRAZO.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  const h = PRAZO.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  })
    .replace(":00", "h")
    .replace(":", "h");
  return `${d} às ${h}`;
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
const urlAdmin = () => BASE + "admin";
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
  if (rel === "admin" || rel === "admin/") return { tipo: "admin" };
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

let chaveConta = null;
function renderConta() {
  const box = $("#me");
  if (!box) return;

  const p0 = session ? perfis[meuId()] : null;
  const chave = [
    !!sb,
    session ? meuId() : "",
    p0 ? p0.nick + p0.avatar : "",
    votacaoAberta(),
    souAdmin,
  ].join("|");
  if (chave === chaveConta) return;
  chaveConta = chave;
  box.replaceChildren();

  if (!sb) return;

  if (!session) {
    if (!votacaoAberta()) {
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
  box.append(quem);
  if (souAdmin)
    box.append(link(urlAdmin(), "botao ghost painel-link", "Painel"));
  box.append(sair);
}

// ---------------------------------------------------------------------
//  Barra de navegação entre categorias
// ---------------------------------------------------------------------
let chaveBarra = null;
let contadorBarra = null;
const textoContador = () => `${session ? totalVotados() : 0}/${CATS.length}`;

function renderBarra(rota) {
  const barra = $("#barra");
  const fixos = $("#fixos");
  if (!barra) return;
  const chave = rota.tipo + (rota.cat ? rota.cat.slug : "");
  if (chave === chaveBarra) {
    if (contadorBarra) contadorBarra.textContent = textoContador();
    return;
  }
  chaveBarra = chave;
  contadorBarra = null;
  barra.replaceChildren();
  const passosBox = $("#passos");
  if (passosBox) passosBox.replaceChildren();
  const visivel = rota.tipo === "categoria";
  if (fixos) fixos.hidden = !visivel;
  else barra.hidden = !visivel;
  if (!visivel) return;

  const sair = link(urlHome(), "sair", "← Sair");
  sair.append(el("span", "longo", " da votação"));

  const meio = el("div", "meio");
  meio.append(linkTodas());

  const contador = el("div", "contador");
  contador.append(el("span", "longo", "Seus votos"));
  const n = el("b");
  n.textContent = textoContador();
  contadorBarra = n;
  contador.append(n);

  barra.append(sair, meio, contador);

  // Anterior / próxima: logo abaixo da barra, presos no topo ao rolar
  if (passosBox) {
    const ant = CATS[rota.indice - 1];
    const prox = CATS[rota.indice + 1];
    if (ant) {
      const a = link(urlCategoria(ant), "passo ant");
      a.append(el("small", null, "← Anterior"), el("span", null, ant.nome));
      passosBox.append(a);
    } else passosBox.append(el("span"));
    if (prox) {
      const a = link(urlCategoria(prox), "passo prox");
      a.append(el("small", null, "Próxima →"), el("span", null, prox.nome));
      passosBox.append(a);
    } else {
      const a = link(urlHome(), "passo prox");
      a.append(
        el("small", null, "Fim das categorias"),
        el("span", null, "Ver todas →"),
      );
      passosBox.append(a);
    }
  }
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
  const progresso = el("span", "hint");
  topo.append(progresso);
  sec.append(topo);

  const rodapes = {};
  const grid = el("div", "lista-cats");
  CATS.forEach((c) => {
    const card = link(urlCategoria(c), "cat-card");
    card.append(el("b", null, c.nome));
    if (c.en) card.append(el("span", "en", c.en));
    const rod = el("div", "cat-card-rodape");
    rodapes[c.id] = rod;
    card.append(rod);
    grid.append(card);
  });
  sec.append(grid);
  refs = { progresso, rodapes };
  atualizarHome();

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

function atualizarHome() {
  const { progresso, rodapes } = refs;
  progresso.textContent = session
    ? `Você votou em ${totalVotados()} de ${CATS.length}`
    : "";
  const ids = Object.keys(perfis);
  for (const c of CATS) {
    const qtd = ids.filter((id) => votos[id] && votos[id][c.id]).length;
    const v = session ? meuVoto(c.id) : null;
    const nom = v && c.indicados.find((n) => n.id === v);
    const chave = `${qtd}|${session ? (nom ? nom.id : "-") : ""}`;
    const rod = rodapes[c.id];
    if (rod.dataset.k === chave) continue;
    rod.dataset.k = chave;
    rod.replaceChildren(
      el("span", "hint", `${qtd} ${qtd === 1 ? "voto" : "votos"}`),
    );
    if (session) {
      rod.append(
        nom
          ? el("span", "pill ok", "Seu voto: " + nom.titulo)
          : el("span", "pill", "Falta votar"),
      );
    }
  }
}

// ---------------------------------------------------------------------
//  Página de uma categoria
// ---------------------------------------------------------------------
function viewCategoria(rota) {
  const c = rota.cat;
  const ids = Object.keys(perfis);
  const sec = el("section", "cat");

  const cab = el("header", "cat-cab");
  cab.append(el("h1", "cat-titulo", c.nome));
  if (c.en) cab.append(el("span", "cat-en", c.en));
  if (c.desc) cab.append(el("p", "cat-desc", c.desc));
  sec.append(cab);

  const grid = el("div", "grid");
  grid.style.setProperty("--n", c.indicados.length);
  const cards = {};
  for (const n of c.indicados) {
    cards[n.id] = cardIndicado(c, n);
    grid.append(cards[n.id].b);
  }
  sec.append(grid);

  // Quem ainda não votou nesta categoria
  const pend = el("div", "pend");
  const pendLbl = el("span", "lbl");
  const pendLista = el("div", "list");
  pend.append(pendLbl, pendLista);
  sec.append(pend);

  refs = { cat: c, cards, pendLbl, pendLista };
  atualizarCategoria();
  preCarregarVizinhas(rota.indice);
  return sec;
}

// Atualiza só o que mudou: bolinhas, contador, "seu voto" e pendentes
function atualizarCategoria() {
  const { cat: c, cards, pendLbl, pendLista } = refs;
  const ids = Object.keys(perfis);
  const aberta = votacaoAberta();
  const meu = meuVoto(c.id);

  for (const n of c.indicados) {
    const r = cards[n.id];
    const quem = ids.filter((id) => votos[id] && votos[id][c.id] === n.id);
    const ehMeu = meu === n.id;

    r.b.disabled = !aberta;
    r.b.classList.toggle("mine", ehMeu);
    r.b.setAttribute(
      "aria-label",
      `${n.titulo}, ${n.sub || ""}. ${quem.length} voto(s).${ehMeu ? " Seu voto." : ""}`,
    );
    trocarAvatares(r.vs, quem);
    r.count.hidden = !quem.length;
    r.count.textContent = String(quem.length);
    r.badge.hidden = !ehMeu;
  }

  const falta = ids.filter((id) => !(votos[id] && votos[id][c.id]));
  pendLbl.textContent = !ids.length
    ? "Ninguém entrou ainda"
    : falta.length
      ? "Ainda não votaram"
      : "Todo mundo já votou";
  trocarAvatares(pendLista, falta);
}

// Só refaz as bolinhas de um lugar se a lista de pessoas mudou
function trocarAvatares(box, ids) {
  const chave = ids
    .map((id) => id + ":" + ((perfis[id] && perfis[id].avatar) || ""))
    .join(",");
  if (box.dataset.k === chave) return;
  box.dataset.k = chave;
  box.replaceChildren(...ids.map((id) => avatar(perfis[id])));
}

// Imagens que já carregaram uma vez (aparecem na hora, sem piscar)
const imagensOk = new Map();

function tentativasImagem(n) {
  if (imagensOk.has(n.id)) return [imagensOk.get(n.id)];
  return n.imagem
    ? [n.imagem]
    : ["webp", "jpg", "png"].map((ext) => `img/${n.id}.${ext}`);
}

// Deixa as imagens da categoria anterior e da próxima já baixadas
function preCarregarVizinhas(indice) {
  const vizinhas = [CATS[indice - 1], CATS[indice + 1]].filter(Boolean);
  const fazer = () => {
    for (const c of vizinhas) {
      for (const n of c.indicados) {
        if (imagensOk.has(n.id)) continue;
        const lista = tentativasImagem(n);
        const im = new Image();
        im.onload = () => imagensOk.set(n.id, im.src);
        im.onerror = () => {
          if (lista.length) im.src = lista.shift();
        };
        im.src = lista.shift();
      }
    }
  };
  if ("requestIdleCallback" in window) requestIdleCallback(fazer);
  else setTimeout(fazer, 300);
}

function cardIndicado(c, n) {
  const b = el("button", "nom");
  b.type = "button";

  const art = el("div", "art");
  art.style.setProperty("--g", n.cor || corPadrao(n.titulo));
  // As iniciais só aparecem se não existir imagem nenhuma
  const mono = el("span", "mono", iniciais(n.titulo));
  mono.hidden = true;
  art.append(mono);

  const tentativas = tentativasImagem(n);
  const im = el("img", "capa");
  im.alt = "";
  im.decoding = "async";
  const pronta = () => {
    imagensOk.set(n.id, im.src);
    art.classList.add("has-img");
  };
  im.onload = pronta;
  im.onerror = () => {
    if (tentativas.length) im.src = tentativas.shift();
    else {
      im.remove();
      mono.hidden = false;
    }
  };
  im.src = tentativas.shift();
  if (im.complete && im.naturalWidth) pronta();
  art.prepend(im);

  const vs = el("div", "votes");
  const count = el("span", "count");
  const badge = el("span", "badge", "SEU VOTO");
  count.hidden = badge.hidden = true;
  art.append(vs, count, badge);

  const info = el("div", "info");
  info.append(el("b", null, n.titulo), el("span", null, n.sub || ""));

  b.append(art, info);
  b.onclick = () => votar(c.id, n.id);
  return { b, vs, count, badge };
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
//  Rodapé
// ---------------------------------------------------------------------
function renderRodape() {
  const st = $("#status-votacao");
  if (st) {
    const aberta = votacaoAberta();
    st.classList.toggle("ok", aberta);
    st.textContent = aberta
      ? prazo()
        ? `Votação aberta até ${textoPrazo()}`
        : "Votação aberta"
      : "Votação encerrada";
  }
  const ev = $("#rodape-evento");
  if (ev && CFG.evento)
    ev.textContent = `${CFG.evento.nome}: ${CFG.evento.data}`;
}

function configurarRodape() {
  const ano = $("#rodape-ano");
  if (ano)
    ano.textContent = String(
      prazo() ? prazo().getFullYear() : new Date().getFullYear(),
    );

  const a = CFG.autor || {};
  const gh = $("#link-github");
  if (gh && a.github) gh.href = a.github;
  const repo = $("#link-repo");
  if (repo && a.repositorio) repo.href = a.repositorio;
  const tga = $("#link-tga");
  if (tga && CFG.evento && CFG.evento.site) tga.href = CFG.evento.site;

  const copiar = $("#copiar-discord");
  if (copiar) {
    copiar.onclick = async () => {
      const nome = a.nome || "ArthasEx";
      try {
        await navigator.clipboard.writeText(nome);
        toast(`"${nome}" copiado. É só procurar no Discord.`);
      } catch {
        const alvo = $("#nome-discord");
        if (alvo) {
          const r = document.createRange();
          r.selectNodeContents(alvo);
          const sel = getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
        }
        toast("Selecionei o nome. Use Ctrl+C para copiar.");
      }
    };
  }

  agendarFechamento();
}

// Fecha a votação sozinho quando o prazo chegar com a página aberta
let timerPrazo;
function agendarFechamento() {
  clearTimeout(timerPrazo);
  const p = prazo();
  if (p && votacaoAberta()) {
    const falta = p.getTime() - Date.now();
    if (falta < 2 ** 31 - 1) timerPrazo = setTimeout(render, falta + 1000);
  }
}

// ---------------------------------------------------------------------
//  Render geral
// ---------------------------------------------------------------------
let chaveView = null;
let refs = null;

function render() {
  const rota = rotaAtual();
  renderConta();
  renderBarra(rota);
  renderRodape();

  const app = $("#app");
  if (!app) return;

  // Painel: só para o admin. Enquanto confere, mostra "Carregando".
  let tipo = rota.tipo;
  if (tipo === "admin" && !souAdmin)
    tipo = adminVerificado ? "naoEncontrada" : "carregando";

  const chave = tipo + (rota.cat ? rota.cat.slug : "");
  if (chave === chaveView) {
    if (tipo === "home") atualizarHome();
    else if (tipo === "categoria") atualizarCategoria();
    else if (tipo === "admin") atualizarAdmin();
  } else {
    chaveView = chave;
    refs = null;
    app.replaceChildren(
      tipo === "home"
        ? viewHome()
        : tipo === "categoria"
          ? viewCategoria(rota)
          : tipo === "admin"
            ? viewAdmin()
            : tipo === "carregando"
              ? el("p", "hint", "Carregando…")
              : viewNaoEncontrada(),
    );
  }

  document.title =
    rota.tipo === "categoria"
      ? `${rota.cat.nome} · DiEx Awards`
      : tipo === "admin"
        ? "Painel · DiEx Awards"
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
  if (!votacaoAberta()) return;
  if (!session) {
    toast("Entre com o Discord para votar.");
    const b = $("#me button");
    if (b) b.focus();
    return;
  }
  if (ocupado) return;
  ocupado = true;
  if (CATS.length - totalVotados() <= 2) prepararSom();

  const id = meuId();
  const antes = { ...(votos[id] || {}) };
  const tirar = antes[cat] === nom;
  const faltavaAntes = totalVotados() < CATS.length;

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
    return;
  }

  // Acabou de completar todas as categorias
  if (faltavaAntes && totalVotados() === CATS.length) comemorar();
}

// ---------------------------------------------------------------------
//  Comemoração: confete + fanfarra + mensagem
// ---------------------------------------------------------------------
// Som da comemoração (audio/comemoracao.mp3). Se não tocar, usa a fanfarra.
let somComemoracao = null;
function prepararSom() {
  if (somComemoracao) return;
  try {
    somComemoracao = new Audio("audio/comemoracao.mp3");
    somComemoracao.preload = "auto";
    somComemoracao.volume = 0.6;
  } catch {
    somComemoracao = null;
  }
}

function tocarSom() {
  if (!somComemoracao) prepararSom();
  if (!somComemoracao) return tocarFanfarra();
  somComemoracao.currentTime = 0;
  const p = somComemoracao.play();
  if (p && p.catch) p.catch(() => tocarFanfarra());
}

function comemorar() {
  tocarSom();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) soltarConfete();
  mostrarParabens();
}

function tocarFanfarra() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const geral = ctx.createGain();
    geral.gain.value = 0.18;
    geral.connect(ctx.destination);

    // [frequência, início (s), duração (s)]
    const notas = [
      [523.25, 0.0, 0.14], // Dó
      [659.25, 0.14, 0.14], // Mi
      [783.99, 0.28, 0.14], // Sol
      [1046.5, 0.42, 0.5], // Dó agudo
      [783.99, 0.42, 0.5],
      [659.25, 0.42, 0.5],
      [1318.5, 0.95, 0.7], // Mi agudo (final)
      [1046.5, 0.95, 0.7],
      [783.99, 0.95, 0.7],
    ];
    const t0 = ctx.currentTime + 0.05;
    for (const [f, ini, dur] of notas) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      env.gain.setValueAtTime(0, t0 + ini);
      env.gain.linearRampToValueAtTime(0.5, t0 + ini + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, t0 + ini + dur);
      osc.connect(env).connect(geral);
      osc.start(t0 + ini);
      osc.stop(t0 + ini + dur + 0.05);
    }
    setTimeout(() => ctx.close(), 2500);
  } catch {
    /* sem som, tudo bem */
  }
}

function soltarConfete() {
  const cv = document.createElement("canvas");
  cv.className = "confete";
  document.body.append(cv);
  const ctx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = innerWidth;
  const H = innerHeight;
  cv.width = W * dpr;
  cv.height = H * dpr;
  ctx.scale(dpr, dpr);

  const cores = [
    "#e8b44c",
    "#f6d58a",
    "#ffffff",
    "#5865f2",
    "#4aa0b8",
    "#c98a4a",
  ];
  const pecas = Array.from({ length: 220 }, (_, i) => {
    const lado = i % 2 ? 1 : -1; // metade sai de cada canto de baixo
    return {
      x: lado > 0 ? -10 : W + 10,
      y: H * 0.75,
      vx: lado * (4 + Math.random() * 9),
      vy: -(9 + Math.random() * 11),
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      cor: cores[i % cores.length],
    };
  });

  const inicio = performance.now();
  (function quadro(agora) {
    const t = agora - inicio;
    ctx.clearRect(0, 0, W, H);
    for (const p of pecas) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 3200) / 800);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    }
    if (t < 4000) requestAnimationFrame(quadro);
    else cv.remove();
  })(inicio);
}

function mostrarParabens() {
  const antigo = $(".parabens");
  if (antigo) antigo.remove();

  const fundo = el("div", "parabens");
  const card = el("div", "parabens-card");
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-labelledby", "parabens-titulo");

  const trofeu = el("div", "parabens-trofeu");
  trofeu.innerHTML =
    '<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path fill="currentColor" d="M18 2H6v2H2v3a5 5 0 0 0 4.6 5 6 6 0 0 0 4.4 3.9V19H7v3h10v-3h-4v-3.1a6 6 0 0 0 4.4-3.9A5 5 0 0 0 22 7V4h-4V2ZM4 7V6h2v3.8A3 3 0 0 1 4 7Zm16 0a3 3 0 0 1-2 2.8V6h2v1Z"/></svg>';
  const titulo = el("h2", null, "Votos completos!");
  titulo.id = "parabens-titulo";
  const texto = el(
    "p",
    null,
    `Você votou nas ${CATS.length} categorias.` +
      (prazo() ? ` Dá para mudar qualquer voto até ${textoPrazo()}.` : ""),
  );

  const acoes = el("div", "parabens-acoes");
  const todas = link(urlHome(), "botao", "Ver minhas escolhas");
  const fechar = el("button", "ghost", "Fechar");
  fechar.type = "button";
  acoes.append(todas, fechar);
  card.append(trofeu, titulo, texto, acoes);
  fundo.append(card);
  document.body.append(fundo);

  const sair = () => {
    fundo.remove();
    document.removeEventListener("keydown", esc);
  };
  const esc = (e) => {
    if (e.key === "Escape") sair();
  };
  fechar.onclick = sair;
  todas.addEventListener("click", sair);
  fundo.addEventListener("click", (e) => {
    if (e.target === fundo) sair();
  });
  document.addEventListener("keydown", esc);
  todas.focus();
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

  // Tabelas do painel (admin.sql). Se ainda não existirem, o site segue normal.
  const [c, w] = await Promise.all([
    sb
      .from("controle")
      .select("votacao_aberta,encerra_em")
      .eq("id", 1)
      .maybeSingle(),
    sb.from("vencedores").select("categoria,indicado"),
  ]);
  controle = !c.error && c.data ? c.data : null;
  vencedores = {};
  if (!w.error && w.data)
    w.data.forEach((r) => (vencedores[r.categoria] = r.indicado));

  agendarFechamento();
  render();
}

async function verificarAdmin() {
  souAdmin = false;
  if (session) {
    const { data, error } = await sb
      .from("admins")
      .select("user_id")
      .eq("user_id", meuId())
      .maybeSingle();
    souAdmin = !error && !!data;
  }
  adminVerificado = true;
  render();
}

let recarga;
function agendarRecarga() {
  clearTimeout(recarga);
  recarga = setTimeout(carregar, 250);
}

// =====================================================================
//  PAINEL DO ADMIN (endereço .../admin, só para quem está na tabela admins)
// =====================================================================
let abaAdmin = "ranking";
let usuarioAberto = null;

const corAcerto = (p) => (p < 0.4 ? "verm" : p < 0.7 ? "amar" : "verd");
const nomeIndicado = (c, id) =>
  (c.indicados.find((n) => n.id === id) || {}).titulo || "—";

function placarAdmin() {
  const decididas = CATS.filter((c) => vencedores[c.id]);
  return Object.keys(perfis)
    .map((id) => {
      const v = votos[id] || {};
      return {
        id,
        p: perfis[id],
        ac: decididas.filter((c) => v[c.id] === vencedores[c.id]).length,
        tot: decididas.length,
        votou: CATS.filter((c) => v[c.id]).length,
      };
    })
    .sort(
      (a, b) =>
        b.ac - a.ac || b.votou - a.votou || a.p.nick.localeCompare(b.p.nick),
    );
}

function viewAdmin() {
  const sec = el("section", "admin");

  const cab = el("div", "adm-cab");
  const t = el("div");
  t.append(
    el("span", "adm-tag", "Só você vê esta página"),
    el("h1", null, "Painel do Awards"),
  );
  cab.append(t, link(urlHome(), "botao ghost", "← Voltar ao site"));

  const kpis = el("div", "kpis");
  const ctrl = el("div", "controle-box");

  const abas = el("div", "abas");
  abas.setAttribute("role", "tablist");
  const nomes = {
    ranking: "Ranking",
    vencedores: "Vencedores",
    participantes: "Participantes",
    pendentes: "Quem falta votar",
  };
  const paineis = {};
  for (const [k, rotulo] of Object.entries(nomes)) {
    const b = el("button", null, rotulo);
    b.type = "button";
    b.setAttribute("role", "tab");
    b.dataset.aba = k;
    b.onclick = () => {
      abaAdmin = k;
      atualizarAdmin();
    };
    abas.append(b);
    paineis[k] = el("div", "painel");
  }

  sec.append(cab, kpis, ctrl, abas, ...Object.values(paineis));
  refs = { kpis, ctrl, abas, paineis };
  atualizarAdmin();
  return sec;
}

function atualizarAdmin() {
  if (!refs || !refs.paineis) return;
  const { kpis, ctrl, abas, paineis } = refs;
  const ids = Object.keys(perfis);
  const comp = ids.filter((id) =>
    CATS.every((c) => votos[id] && votos[id][c.id]),
  ).length;
  const total = ids.reduce(
    (s, id) => s + CATS.filter((c) => votos[id] && votos[id][c.id]).length,
    0,
  );
  const dec = CATS.filter((c) => vencedores[c.id]).length;

  kpis.replaceChildren(
    ...[
      [ids.length, "Participantes"],
      [`${comp}/${ids.length}`, "Votaram em tudo"],
      [total, "Votos no total"],
      [`${dec}/${CATS.length}`, "Vencedores definidos"],
    ].map(([v, l]) => {
      const d = el("div", "kpi");
      d.append(el("b", null, String(v)), el("span", null, l));
      return d;
    }),
  );

  renderControle(ctrl);

  abas
    .querySelectorAll("button")
    .forEach((b) =>
      b.setAttribute("aria-selected", String(b.dataset.aba === abaAdmin)),
    );
  for (const [k, p] of Object.entries(paineis)) p.hidden = k !== abaAdmin;
  ({
    ranking: painelRanking,
    vencedores: painelVencedores,
    participantes: painelParticipantes,
    pendentes: painelPendentes,
  })[abaAdmin](paineis[abaAdmin]);
}

// ---------- Encerrar / reabrir / prazo ----------
// Brasília não tem horário de verão: -03:00 fixo
function paraCampoData(d) {
  return d ? new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 16) : "";
}
function doCampoData(v) {
  return v ? new Date(v + ":00-03:00").toISOString() : null;
}

function renderControle(box) {
  box.replaceChildren();
  const p = prazo();
  const passou = p && Date.now() >= p.getTime();
  const aberta = votacaoAberta();

  const esq = el("div", "ctrl-status");
  esq.append(el("span", "adm-rotulo", "Votação"));
  const st = el(
    "b",
    aberta ? "ok" : "fechada",
    aberta
      ? p
        ? `Aberta até ${textoPrazo(p)}`
        : "Aberta, sem prazo"
      : !ligada()
        ? "Encerrada por você"
        : "Encerrada pelo prazo",
  );
  esq.append(st);
  if (!controle)
    esq.append(
      el(
        "small",
        "hint",
        "Rode o admin.sql no Supabase para estes botões funcionarem.",
      ),
    );

  const acoes = el("div", "ctrl-acoes");
  const botao = el("button", aberta ? "perigo" : "botao");
  botao.type = "button";
  if (aberta) {
    botao.textContent = "Encerrar votação agora";
    botao.onclick = () => {
      if (
        confirm(
          "Encerrar a votação agora? Ninguém vai conseguir votar até você reabrir.",
        )
      )
        salvarControle({ votacao_aberta: false });
    };
  } else {
    botao.textContent = passou ? "Reabrir sem prazo" : "Reabrir votação";
    botao.onclick = () =>
      salvarControle(
        passou
          ? { votacao_aberta: true, encerra_em: null }
          : { votacao_aberta: true },
      );
  }

  const campo = el("input");
  campo.type = "datetime-local";
  campo.id = "campo-prazo";
  campo.value = paraCampoData(p);
  const lbl = el("label", "adm-rotulo", "Prazo (Brasília)");
  lbl.htmlFor = "campo-prazo";
  const salvar = el("button", "ghost", "Salvar prazo");
  salvar.type = "button";
  salvar.onclick = () =>
    salvarControle({ encerra_em: doCampoData(campo.value) });
  const sem = el("button", "ghost", "Sem prazo");
  sem.type = "button";
  sem.onclick = () => salvarControle({ encerra_em: null });

  const prazoBox = el("div", "ctrl-prazo");
  prazoBox.append(lbl, campo, salvar, sem);
  acoes.append(botao);
  box.append(esq, acoes, prazoBox);
}

async function salvarControle(mudanca) {
  const antes = controle;
  controle = {
    ...(controle || {
      votacao_aberta: !!CFG.votacaoAberta,
      encerra_em: CFG.votacaoEncerra || null,
    }),
    ...mudanca,
  };
  render();
  const { error } = await sb.from("controle").update(mudanca).eq("id", 1);
  if (error) {
    controle = antes;
    render();
    toast("Não deu para salvar. Confira se o admin.sql foi rodado.");
    console.error(error);
    return;
  }
  agendarFechamento();
  toast("Salvo.");
}

// ---------- Abas ----------
function painelRanking(box) {
  box.replaceChildren();
  const dec = CATS.filter((c) => vencedores[c.id]).length;
  box.append(el("h2", null, "Ranking de acertos"));
  box.append(
    el(
      "p",
      "sub",
      dec
        ? `Contando as ${dec} categorias que já têm vencedor.`
        : "Defina os vencedores na aba Vencedores para o ranking começar.",
    ),
  );
  const leg = el("div", "legenda");
  [
    ["verm", "menos de 40%"],
    ["amar", "40% a 69%"],
    ["verd", "70% ou mais"],
  ].forEach(([c, t]) => {
    const sp = el("span");
    sp.append(el("i", c), t);
    leg.append(sp);
  });
  box.append(leg);

  const lista = el("div", "rank");
  let pos = 0;
  let ultimo = null;
  placarAdmin().forEach((r, i) => {
    if (r.ac !== ultimo) {
      pos = i + 1;
      ultimo = r.ac;
    }
    const pct = r.tot ? r.ac / r.tot : 0;
    const linha = el(
      "div",
      "rank-linha" + (pos === 1 && r.ac > 0 ? " top1" : ""),
    );
    const barra = el("div", "barra-p");
    const fill = el("i", corAcerto(pct));
    fill.style.width = (pct * 100).toFixed(1) + "%";
    barra.append(fill);
    const pl = el("div", "placar");
    pl.append(
      el("b", null, `${r.ac}/${r.tot}`),
      el("small", null, `${Math.round(pct * 100)}% de acerto`),
    );
    linha.append(
      el("span", "pos", r.tot ? pos + "º" : "–"),
      avatar(r.p),
      el("span", "nick", r.p.nick),
      barra,
      pl,
    );
    lista.append(linha);
  });
  if (!lista.children.length)
    lista.append(el("p", "hint", "Ninguém entrou ainda."));
  box.append(lista);
}

function painelVencedores(box) {
  box.replaceChildren();
  box.append(el("h2", null, "Definir vencedores"));
  box.append(
    el(
      "p",
      "sub",
      "Clique no jogo que ganhou. Clique de novo para desfazer. O ranking atualiza na hora.",
    ),
  );
  const ids = Object.keys(perfis);
  const lista = el("div", "lista-venc");
  for (const c of CATS) {
    const art = el("article", "venc-cat");
    const h = el("header");
    h.append(
      el("b", null, c.nome),
      el(
        "span",
        "estado" + (vencedores[c.id] ? " ok" : ""),
        vencedores[c.id] ? "Vencedor definido" : "Aguardando",
      ),
    );
    const ops = el("div", "opcoes");
    for (const n of c.indicados) {
      const q = ids.filter(
        (id) => votos[id] && votos[id][c.id] === n.id,
      ).length;
      const ehV = vencedores[c.id] === n.id;
      const b = el("button", "op" + (ehV ? " venc" : ""));
      b.type = "button";
      const im = el("img");
      im.alt = "";
      im.loading = "lazy";
      const tent = tentativasImagem(n);
      im.onerror = () =>
        tent.length
          ? (im.src = tent.shift())
          : im.replaceWith(el("span", "ph"));
      im.src = tent.shift();
      const tx = el("span", "t");
      tx.append(
        el("b", null, n.titulo),
        el(
          "small",
          null,
          ehV ? "Vencedor" : `${q} ${q === 1 ? "voto" : "votos"}`,
        ),
      );
      b.append(im, tx);
      b.onclick = () => definirVencedor(c.id, n.id);
      ops.append(b);
    }
    art.append(h, ops);
    if (vencedores[c.id]) {
      const f = el("footer");
      const acertou = ids.filter(
        (id) => votos[id] && votos[id][c.id] === vencedores[c.id],
      );
      f.append(
        el("span", null, acertou.length ? "Acertaram:" : "Ninguém acertou"),
      );
      acertou.forEach((id) => f.append(avatar(perfis[id])));
      art.append(f);
    }
    lista.append(art);
  }
  box.append(lista);
}

async function definirVencedor(cat, nom) {
  const antes = vencedores[cat];
  const tirar = antes === nom;
  if (tirar) delete vencedores[cat];
  else vencedores[cat] = nom;
  render();
  const { error } = tirar
    ? await sb.from("vencedores").delete().eq("categoria", cat)
    : await sb.from("vencedores").upsert(
        {
          categoria: cat,
          indicado: nom,
          definido_em: new Date().toISOString(),
        },
        { onConflict: "categoria" },
      );
  if (error) {
    if (antes) vencedores[cat] = antes;
    else delete vencedores[cat];
    render();
    toast("Não deu para salvar o vencedor. Confira se o admin.sql foi rodado.");
    console.error(error);
  }
}

function painelParticipantes(box) {
  box.replaceChildren();
  box.append(el("h2", null, "Participantes"));
  box.append(el("p", "sub", "Clique em um nome para ver os votos dele."));
  const wrap = el("div", "tabela-wrap");
  const t = el("table", "tabela");
  t.innerHTML =
    "<thead><tr><th>Usuário</th><th>Progresso</th><th>Acertos</th><th>Situação</th></tr></thead>";
  const tb = el("tbody");
  const P = Object.fromEntries(placarAdmin().map((r) => [r.id, r]));
  const ids = Object.keys(perfis).sort((a, b) =>
    perfis[a].nick.localeCompare(perfis[b].nick),
  );
  for (const id of ids) {
    const r = P[id];
    const tr = el("tr", "clicavel");
    tr.tabIndex = 0;
    const q = el("td");
    const qq = el("div", "quem2");
    qq.append(avatar(perfis[id]), el("span", null, perfis[id].nick));
    q.append(qq);
    const pr = el("td");
    const m = el("div", "mini");
    const b = el("div", "barra-p");
    const f = el("i", corAcerto(r.votou / CATS.length));
    f.style.width = (r.votou / CATS.length) * 100 + "%";
    b.append(f);
    m.append(b, el("span", null, `${r.votou}/${CATS.length}`));
    pr.append(m);
    const st = el("td");
    st.append(
      r.votou === CATS.length
        ? el("span", "pill verde", "Completo")
        : el("span", "pill falta", `Faltam ${CATS.length - r.votou}`),
    );
    tr.append(q, pr, el("td", null, r.tot ? `${r.ac}/${r.tot}` : "—"), st);
    const abrir = () => {
      usuarioAberto = usuarioAberto === id ? null : id;
      painelParticipantes(box);
    };
    tr.onclick = abrir;
    tr.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    };
    tb.append(tr);
    if (usuarioAberto === id) {
      const d = el("tr", "det");
      const td = el("td");
      td.colSpan = 4;
      const g = el("div", "votos-user");
      for (const c of CATS) {
        const v = votos[id] && votos[id][c.id];
        const row = el("div");
        const cls = !v
          ? "n"
          : !vencedores[c.id]
            ? ""
            : v === vencedores[c.id]
              ? "c"
              : "e";
        row.append(
          el("span", null, c.nome),
          el(
            "span",
            cls,
            v
              ? nomeIndicado(c, v) +
                  (cls === "c" ? " ✓" : cls === "e" ? " ✗" : "")
              : "não votou",
          ),
        );
        g.append(row);
      }
      td.append(g);
      d.append(td);
      tb.append(d);
    }
  }
  t.append(tb);
  wrap.append(t);
  box.append(wrap);
}

function painelPendentes(box) {
  box.replaceChildren();
  box.append(el("h2", null, "Quem falta votar"));
  const ids = Object.keys(perfis);
  const g = el("div", "pend-cats");
  for (const c of CATS) {
    const falta = ids.filter((id) => !(votos[id] && votos[id][c.id]));
    const b = el("article", "pend-cat");
    const h = el("header");
    h.append(
      el("b", null, c.nome),
      el(
        "span",
        falta.length ? "pill falta" : "pill verde",
        falta.length ? `${falta.length} faltando` : "Todos votaram",
      ),
    );
    b.append(h);
    if (falta.length) {
      const l = el("div", "list");
      falta.forEach((id) => l.append(avatar(perfis[id])));
      b.append(l);
    }
    g.append(b);
  }
  box.append(g);
}

// =====================================================================
//  EASTER EGG: um ícone pequeno atravessa a tela de vez em quando.
//  Quem clicar ouve a intro da Valve.
// =====================================================================
const ICONE_EASTER =
  '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="#f47a20"/><rect x="2" y="2" width="36" height="36" rx="9" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/><text x="17" y="29" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="24" fill="#1a1205">λ</text><text x="30" y="17" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="12" fill="#1a1205">3</text></svg>';

function iniciarEasterEgg() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const proxima = (min, max) =>
    setTimeout(soltarEasterEgg, (min + Math.random() * (max - min)) * 1000);
  // primeira vez entre 40 s e 2 min; depois a cada 2 a 5 min
  proxima(40, 120);
  soltarEasterEgg.depois = () => proxima(120, 300);
}

function soltarEasterEgg() {
  const reagendar = () => soltarEasterEgg.depois && soltarEasterEgg.depois();
  if (document.hidden || document.querySelector(".parabens, .easter"))
    return reagendar();

  const b = el("button", "easter");
  b.type = "button";
  b.setAttribute("aria-label", "Segredo");
  b.innerHTML = ICONE_EASTER;
  document.body.append(b);

  const W = innerWidth;
  const H = innerHeight;
  const daEsquerda = Math.random() < 0.5;
  const x0 = daEsquerda ? -50 : W + 50;
  const x1 = daEsquerda ? W + 50 : -50;
  const y0 = H * (0.15 + Math.random() * 0.6);
  const y1 = H * (0.15 + Math.random() * 0.6);
  const onda = 30 + Math.random() * 60;
  const dur = 7000 + Math.random() * 4000;
  const giro = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 360);
  const ini = performance.now();
  let ativo = true;

  function quadro(agora) {
    if (!ativo) return;
    const t = Math.min(1, (agora - ini) / dur);
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 4) * onda;
    b.style.transform = `translate(${x}px, ${y}px) rotate(${(giro * (agora - ini)) / 1000}deg)`;
    if (t < 1) requestAnimationFrame(quadro);
    else {
      b.remove();
      reagendar();
    }
  }
  requestAnimationFrame(quadro);

  b.onclick = () => {
    if (!ativo) return;
    ativo = false;
    try {
      const a = new Audio("audio/valve.mp3");
      a.volume = 0.7;
      a.play().catch(() => {});
    } catch {
      /* sem som */
    }
    b.classList.add("pego");
    setTimeout(() => {
      b.remove();
      reagendar();
    }, 900);
  };
}

// ---------------------------------------------------------------------
//  Início
// ---------------------------------------------------------------------
(async function iniciar() {
  configurarRodape();
  iniciarEasterEgg();
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
  verificarAdmin();

  sb.auth.onAuthStateChange(async (_evento, s) => {
    const mudou = (s && s.user.id) !== meuId();
    session = s;
    if (s && mudou) await salvarPerfil();
    if (mudou) verificarAdmin();
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
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "controle" },
      agendarRecarga,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vencedores" },
      agendarRecarga,
    )
    .subscribe();
})();
