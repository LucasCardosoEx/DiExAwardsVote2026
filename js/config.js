// =====================================================================
//  CONFIGURAÇÃO DO SITE — é só editar este arquivo
// =====================================================================
window.DIEX_CONFIG = {
  // Supabase → Project Settings → API (ou "Data API").
  // A "anon"/"publishable" key é pública e pode ficar aqui.
  // NUNCA coloque a "service_role"/"secret" key nem o secret do Discord neste arquivo.
  supabaseUrl: "https://cdytztyfuyrztnokltrt.supabase.co",
  supabaseAnonKey: "sb_publishable_zenS0G5FPizKbC9DC45cng_MPHorEDh",

  // Mude para false quando quiser encerrar a votação.
  votacaoAberta: true,

  // Categorias e indicados.
  // - id: identificador único (sem espaço, sem acento). NÃO mude depois que começarem a votar.
  // - imagem: caminho da imagem na pasta img. Já vem como "img/<id>.jpg":
  //           é só salvar a imagem com esse nome. Se o arquivo não existir,
  //           o card usa as cores e as iniciais automaticamente.
  // - cor: gradiente usado quando não há imagem.
  categorias: [
    {
      id: "aguardado",
      nome: "Jogo Mais Aguardado",
      en: "Most Anticipated Game",
      desc: "Premia o título futuro anunciado que gera a maior expectativa entre o público e a crítica.",
      indicados: [
        {
          id: "fable",
          titulo: "Fable",
          sub: "Playground Games / Xbox Game Studios",
          imagem: "img/fable.jpg",
          cor: "linear-gradient(160deg,#4f7a4a,#1e3324)",
        },
        {
          id: "ff7r3",
          titulo: "Final Fantasy VII Revelation",
          sub: "Square Enix",
          imagem: "img/ff7r3.jpg",
          cor: "linear-gradient(160deg,#5b6c8f,#1b2236)",
        },
        {
          id: "gowl",
          titulo: "God of War Laufey",
          sub: "Sony Santa Monica / Sony Interactive",
          imagem: "img/gowl.jpg",
          cor: "linear-gradient(160deg,#c98a4a,#4a2814)",
        },
        {
          id: "rev",
          titulo: "Resident Evil Veronica",
          sub: "Capcom",
          imagem: "img/rev.jpg",
          cor: "linear-gradient(160deg,#c23a3a,#3a0d12)",
        },
        {
          id: "tw4",
          titulo: "The Witcher 4",
          sub: "CD Projekt Red",
          imagem: "img/tw4.jpg",
          cor: "linear-gradient(160deg,#8a8f7a,#2a2c22)",
        },
      ],
    },
    {
      id: "esports",
      nome: "Melhor Time de Esports",
      en: "Best Esports Team",
      desc: "Reconhece a equipe competitiva com o melhor desempenho e resultados ao longo da temporada.",
      indicados: [
        {
          id: "geng",
          titulo: "Gen.G",
          sub: "League of Legends",
          imagem: "img/geng.jpg",
          cor: "linear-gradient(160deg,#b8973a,#2a220c)",
        },
        {
          id: "loud",
          titulo: "LOUD",
          sub: "Valorant",
          imagem: "img/loud.jpg",
          cor: "linear-gradient(160deg,#3fbf5a,#0d2a14)",
        },
        {
          id: "falcs2",
          titulo: "Team Falcons",
          sub: "Counter-Strike 2",
          imagem: "img/falcs2.jpg",
          cor: "linear-gradient(160deg,#2f8f6a,#0c2a20)",
        },
        {
          id: "falrl",
          titulo: "Team Falcons",
          sub: "Rocket League",
          imagem: "img/falrl.jpg",
          cor: "linear-gradient(160deg,#4aa0b8,#0e2830)",
        },
        {
          id: "spirit",
          titulo: "Team Spirit",
          sub: "Dota 2",
          imagem: "img/spirit.jpg",
          cor: "linear-gradient(160deg,#9a9aa8,#22222a)",
        },
        {
          id: "vitality",
          titulo: "Team Vitality",
          sub: "Counter-Strike 2",
          imagem: "img/vitality.jpg",
          cor: "linear-gradient(160deg,#d6c93a,#2e2a08)",
        },
      ],
    },
  ],
};
