// =====================================================================
//  CONFIGURAÇÃO DO SITE — é só editar este arquivo
// =====================================================================
window.DIEX_CONFIG = {
  // Supabase → Project Settings → API Keys.
  // A chave "publishable" é pública e pode ficar aqui.
  // NUNCA coloque a chave "secret"/"service_role" nem o secret do Discord neste arquivo.
  supabaseUrl: "https://cdytztyfuyrztnokltrt.supabase.co",
  supabaseAnonKey: "sb_publishable_zenS0G5FPizKbC9DC45cng_MPHorEDh",

  // Mude para false para encerrar a votação na hora.
  votacaoAberta: true,

  // A votação fecha sozinha neste horário (horário de Brasília = -03:00).
  // Deixe "" para não ter prazo.
  votacaoEncerra: "2026-12-10T21:00:00-03:00",

  // Informações do rodapé
  evento: {
    nome: "The Game Awards 2026",
    data: "10 de dezembro de 2026",
    site: "https://thegameawards.com",
    // Contador regressivo da página inicial (horário de Brasília)
    inicio: "2026-12-10T21:30:00-03:00",
    // Link do evento no Discord da comunidade
    link: "https://discord.gg/3CuZ8WCjx?event=1573434513621651496",
  },
  autor: {
    nome: "ArthasEx",
    github: "https://github.com/LucasCardosoEx",
    repositorio: "https://github.com/LucasCardosoEx/DiExAwardsVote2026",
  },

  // ------------------------------------------------------------------
  //  Categorias (na mesma ordem do site oficial do The Game Awards)
  //
  //  Categoria:
  //  - id:   identificador interno. NÃO mude depois que começarem a votar.
  //  - slug: endereço da página (ex.: .../categorias/jogo-do-ano).
  //
  //  Indicado:
  //  - id:     identificador do indicado. NÃO mude depois que começarem a votar.
  //            O mesmo jogo usa o mesmo id em todas as categorias.
  //  - imagem: opcional. Se não tiver, o site procura "img/<id>.webp"
  //            (ex.: img/gta6.webp), depois .jpg e .png. Uma imagem só serve
  //            para todas as categorias em que o jogo aparece. Sem imagem,
  //            o card usa cores e iniciais.
  //  - cor:    opcional. Gradiente do card quando não há imagem.
  // ------------------------------------------------------------------
  categorias: [
    {
      id: "goty",
      slug: "jogo-do-ano",
      nome: "Jogo do Ano",
      en: "Game of the Year",
      desc: "Premia o jogo que entregou a melhor experiência geral em todos os aspectos criativos e técnicos.",
      indicados: [
        {
          id: "007-first-light",
          titulo: "007 First Light",
          sub: "IO Interactive",
        },
        {
          id: "control-resonant",
          titulo: "Control Resonant",
          sub: "Remedy/Annapurna",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        {
          id: "phantom-blade-zero",
          titulo: "Phantom Blade Zero",
          sub: "S-GAME",
        },
        { id: "re-requiem", titulo: "Resident Evil Requiem", sub: "Capcom" },
        {
          id: "zelda-oot",
          titulo: "The Legend of Zelda: Ocarina of Time",
          sub: "Nintendo",
        },
      ],
    },
    {
      id: "direcao",
      slug: "melhor-direcao",
      nome: "Melhor Direção",
      en: "Best Game Direction",
      desc: "Reconhece a visão criativa e a inovação excepcional na direção e no design do jogo.",
      indicados: [
        {
          id: "control-resonant",
          titulo: "Control Resonant",
          sub: "Remedy/Annapurna",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        {
          id: "phantom-blade-zero",
          titulo: "Phantom Blade Zero",
          sub: "S-GAME",
        },
        { id: "pragmata", titulo: "Pragmata", sub: "Capcom" },
        { id: "re-requiem", titulo: "Resident Evil Requiem", sub: "Capcom" },
      ],
    },
    {
      id: "narrativa",
      slug: "melhor-narrativa",
      nome: "Melhor Narrativa",
      en: "Best Narrative",
      desc: "Destaca a excelência na construção da história, no roteiro e na forma como o enredo é desenvolvido.",
      indicados: [
        {
          id: "007-first-light",
          titulo: "007 First Light",
          sub: "IO Interactive",
        },
        {
          id: "control-resonant",
          titulo: "Control Resonant",
          sub: "Remedy/Annapurna",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        { id: "re-requiem", titulo: "Resident Evil Requiem", sub: "Capcom" },
        {
          id: "blood-of-dawnwalker",
          titulo: "The Blood of Dawnwalker",
          sub: "Rebel Wolves/Bandai Namco",
        },
      ],
    },
    {
      id: "arte",
      slug: "melhor-direcao-de-arte",
      nome: "Melhor Direção de Arte",
      en: "Best Art Direction",
      desc: "Avalia o mérito criativo e técnico no estilo visual, cenários, animação e identidade artística.",
      indicados: [
        {
          id: "control-resonant",
          titulo: "Control Resonant",
          sub: "Remedy/Annapurna",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        {
          id: "mouse-pi-for-hire",
          titulo: "Mouse: P.I. for Hire",
          sub: "Fumi/PlaySide",
        },
        {
          id: "phantom-blade-zero",
          titulo: "Phantom Blade Zero",
          sub: "S-GAME",
        },
        {
          id: "zelda-oot",
          titulo: "The Legend of Zelda: Ocarina of Time",
          sub: "Nintendo",
        },
      ],
    },
    {
      id: "trilha",
      slug: "melhor-trilha-sonora-e-musica",
      nome: "Melhor Trilha Sonora e Música",
      en: "Best Score and Music",
      desc: "Celebra composições originais, músicas licenciadas e trilhas que marcam a experiência do jogo.",
      indicados: [
        {
          id: "ace-combat-8",
          titulo: "Ace Combat 8: Wings of Theve",
          sub: "Bandai Namco Aces/Bandai Namco",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        {
          id: "mixtape",
          titulo: "Mixtape",
          sub: "Beethoven & Dinosaur/Annapurna",
        },
        {
          id: "phantom-blade-zero",
          titulo: "Phantom Blade Zero",
          sub: "S-GAME",
        },
        {
          id: "zelda-oot",
          titulo: "The Legend of Zelda: Ocarina of Time",
          sub: "Nintendo",
        },
      ],
    },
    {
      id: "audio",
      slug: "melhor-design-de-audio",
      nome: "Melhor Design de Áudio",
      en: "Best Audio Design",
      desc: "Premia a qualidade técnica dos efeitos sonoros, ambientação acústica e mixagem de som.",
      indicados: [
        {
          id: "ace-combat-8",
          titulo: "Ace Combat 8: Wings of Theve",
          sub: "Bandai Namco Aces/Bandai Namco",
        },
        {
          id: "control-resonant",
          titulo: "Control Resonant",
          sub: "Remedy/Annapurna",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        { id: "re-requiem", titulo: "Resident Evil Requiem", sub: "Capcom" },
        {
          id: "star-wars-galactic-racer",
          titulo: "Star Wars: Galactic Racer",
          sub: "Fuse Games/Secret Mode",
        },
      ],
    },
    {
      id: "performance",
      slug: "melhor-performance",
      nome: "Melhor Performance",
      en: "Best Performance",
      desc: "Reconhece atuações de destaque em dublagem, atuação de voz e captura de movimentos.",
      indicados: [
        {
          id: "angela-santalbano",
          titulo: "Angela Sant'Albano",
          sub: "Resident Evil Requiem",
        },
        {
          id: "liam-mcintyre",
          titulo: "Liam McIntyre",
          sub: "Marvel's Wolverine",
        },
        {
          id: "manni-perez",
          titulo: "Manni L. Perez",
          sub: "Grand Theft Auto VI",
        },
        {
          id: "patrick-gibson",
          titulo: "Patrick Gibson",
          sub: "007 First Light",
        },
        { id: "rahul-kohli", titulo: "Rahul Kohli", sub: "Saros" },
      ],
    },
    {
      id: "impacto",
      slug: "jogos-de-impacto",
      nome: "Jogos de Impacto",
      en: "Games for Impact",
      desc: "Premia títulos instigantes que trazem uma mensagem social, emocional ou reflexiva relevante.",
      indicados: [
        { id: "big-walk", titulo: "Big Walk", sub: "House House/Panic" },
        { id: "cairn", titulo: "Cairn", sub: "The Game Bakers" },
        {
          id: "forever-ago",
          titulo: "Forever Ago",
          sub: "Third Shift/Annapurna",
        },
        {
          id: "lis-reunion",
          titulo: "Life is Strange: Reunion",
          sub: "Deck Nine/Square Enix",
        },
        {
          id: "lilys-world-xd",
          titulo: "Lily's World XD",
          sub: "SonderingEmily/Kwalee",
        },
        {
          id: "mixtape",
          titulo: "Mixtape",
          sub: "Beethoven & Dinosaur/Annapurna",
        },
      ],
    },
    {
      id: "acessibilidade",
      slug: "inovacao-em-acessibilidade",
      nome: "Inovação em Acessibilidade",
      en: "Innovation in Accessibility",
      desc: "Destaca softwares ou hardwares que ampliam o acesso de pessoas com deficiência aos jogos.",
      indicados: [
        {
          id: "ac-black-flag-resynced",
          titulo: "Assassin's Creed Black Flag Resynced",
          sub: "Ubisoft Singapore/Ubisoft",
        },
        {
          id: "forza-horizon-6",
          titulo: "Forza Horizon 6",
          sub: "Playground Games/Xbox Game Studios",
        },
        {
          id: "gears-e-day",
          titulo: "Gears of War: E-Day",
          sub: "The Coalition/Xbox Game Studios",
        },
        {
          id: "wolverine",
          titulo: "Marvel's Wolverine",
          sub: "Insomniac/Sony Interactive",
        },
        {
          id: "rhythm-heaven-groove",
          titulo: "Rhythm Heaven Groove",
          sub: "Nintendo",
        },
      ],
    },
    {
      id: "continuo",
      slug: "melhor-jogo-continuo",
      nome: "Melhor Jogo Contínuo",
      en: "Best Ongoing",
      desc: "Reconhece jogos já lançados que continuam evoluindo com novas atualizações, expansões e conteúdos.",
      indicados: [
        { id: "arc-raiders", titulo: "Arc Raiders", sub: "Embark Studios" },
        { id: "ffxiv", titulo: "Final Fantasy XIV", sub: "Square Enix" },
        { id: "fortnite", titulo: "Fortnite", sub: "Epic Games" },
        { id: "no-mans-sky", titulo: "No Man's Sky", sub: "Hello Games" },
        {
          id: "witcher-3",
          titulo: "The Witcher 3: Wild Hunt",
          sub: "CD Projekt Red",
        },
      ],
    },
    {
      id: "comunidade",
      slug: "melhor-suporte-a-comunidade",
      nome: "Melhor Suporte à Comunidade",
      en: "Best Community Support",
      desc: "Valoriza estúdios que mantêm transparência, diálogo ativo e suporte exemplar aos jogadores.",
      indicados: [
        { id: "crimson-desert", titulo: "Crimson Desert", sub: "Pearl Abyss" },
        {
          id: "helldivers-2",
          titulo: "Helldivers 2",
          sub: "Arrowhead Game Studios/Sony Interactive",
        },
        { id: "no-mans-sky", titulo: "No Man's Sky", sub: "Hello Games" },
        {
          id: "witcher-3",
          titulo: "The Witcher 3: Wild Hunt",
          sub: "CD Projekt Red",
        },
        { id: "warframe", titulo: "Warframe", sub: "Digital Extremes" },
      ],
    },
    {
      id: "independente",
      slug: "melhor-jogo-independente",
      nome: "Melhor Jogo Independente",
      en: "Best Independent Game",
      desc: "Premia jogos criados fora do sistema tradicional de grandes publishers, focando em criatividade e autoria.",
      indicados: [
        { id: "big-walk", titulo: "Big Walk", sub: "House House/Panic" },
        { id: "cairn", titulo: "Cairn", sub: "The Game Bakers" },
        {
          id: "denshattack",
          titulo: "Denshattack!",
          sub: "Undercoders/Fireshine Games",
        },
        {
          id: "mewgenics",
          titulo: "Mewgenics",
          sub: "Edmund McMillen and Tyler Glaiel",
        },
        {
          id: "mina-the-hollower",
          titulo: "Mina the Hollower",
          sub: "Yacht Club Games",
        },
      ],
    },
    {
      id: "indie-estreia",
      slug: "melhor-jogo-independente-de-estreia",
      nome: "Melhor Jogo Independente de Estreia",
      en: "Best Debut Indie Game",
      desc: "Destaca o melhor jogo de estreia produzido por um novo estúdio independente.",
      indicados: [
        {
          id: "dressmaker",
          titulo: "Dressmaker",
          sub: "Cozy Lives/Free Lives",
        },
        {
          id: "esoteric-ebb",
          titulo: "Esoteric Ebb",
          sub: "Christoffer Bodegård/Raw Fury",
        },
        { id: "orbitals", titulo: "Orbitals", sub: "Shapefarm/Kepler" },
        {
          id: "replaced",
          titulo: "Replaced",
          sub: "Sad Cat Studios/Thunderful",
        },
        { id: "silver-pines", titulo: "Silver Pines", sub: "Wych Elm/Team17" },
      ],
    },
    {
      id: "mobile",
      slug: "melhor-jogo-mobile",
      nome: "Melhor Jogo Mobile",
      en: "Best Mobile Game",
      desc: "Reconhece o melhor jogo desenvolvido especificamente para dispositivos móveis, como celulares e tablets.",
      indicados: [
        {
          id: "arknights-endfield",
          titulo: "Arknights: Endfield",
          sub: "Hypergryph/GRYPHLINE",
        },
        {
          id: "mh-outlanders",
          titulo: "Monster Hunter Outlanders",
          sub: "TiMi Studio Group/Level Infinite",
        },
        {
          id: "neverness-to-everness",
          titulo: "Neverness to Everness",
          sub: "Hotta Studio/Perfect World Games",
        },
        {
          id: "pokemon-champions",
          titulo: "Pokémon Champions",
          sub: "The Pokémon Works/The Pokémon Company",
        },
        {
          id: "where-winds-meet",
          titulo: "Where Winds Meet",
          sub: "Everstone Studio/NetEase Games",
        },
      ],
    },
    {
      id: "vr-ar",
      slug: "melhor-jogo-vr-ar",
      nome: "Melhor Jogo VR / AR",
      en: "Best VR / AR",
      desc: "Premia as experiências mais imersivas criadas para realidade virtual ou realidade aumentada.",
      indicados: [
        { id: "forefront", titulo: "Forefront", sub: "Triangle Factory" },
        {
          id: "into-the-radius-2",
          titulo: "Into the Radius 2",
          sub: "CM Immersive",
        },
        {
          id: "little-nightmares-vr",
          titulo: "Little Nightmares VR: Altered Echoes",
          sub: "Iconik/Bandai Namco",
        },
        {
          id: "tmnt-empire-city",
          titulo: "Teenage Mutant Ninja Turtles: Empire City",
          sub: "Cortopia Studios/Beyond Frames",
        },
        {
          id: "thief-vr",
          titulo: "Thief VR: Legacy of Shadow",
          sub: "Maze Theory/Vertigo Games",
        },
      ],
    },
    {
      id: "acao",
      slug: "melhor-jogo-de-acao",
      nome: "Melhor Jogo de Ação",
      en: "Best Action Game",
      desc: "Destaca títulos focados em combate, reflexos rápidos e mecânicas intensas de ação.",
      indicados: [
        {
          id: "ace-combat-8",
          titulo: "Ace Combat 8: Wings of Theve",
          sub: "Bandai Namco Aces/Bandai Namco",
        },
        {
          id: "gears-e-day",
          titulo: "Gears of War: E-Day",
          sub: "The Coalition/Xbox Game Studios",
        },
        { id: "onimusha", titulo: "Onimusha: Way of the Sword", sub: "Capcom" },
        {
          id: "phantom-blade-zero",
          titulo: "Phantom Blade Zero",
          sub: "S-GAME",
        },
        { id: "saros", titulo: "Saros", sub: "Housemarque/Sony Interactive" },
      ],
    },
    {
      id: "acao-aventura",
      slug: "melhor-jogo-de-acao-aventura",
      nome: "Melhor Jogo de Ação / Aventura",
      en: "Best Action / Adventure",
      desc: "Premia jogos que combinam combate com exploração, resolução de quebra-cabeças e narrativa.",
      indicados: [
        {
          id: "007-first-light",
          titulo: "007 First Light",
          sub: "IO Interactive",
        },
        {
          id: "control-resonant",
          titulo: "Control Resonant",
          sub: "Remedy/Annapurna",
        },
        { id: "gta6", titulo: "Grand Theft Auto VI", sub: "Rockstar Games" },
        { id: "pragmata", titulo: "Pragmata", sub: "Capcom" },
        { id: "re-requiem", titulo: "Resident Evil Requiem", sub: "Capcom" },
        {
          id: "zelda-oot",
          titulo: "The Legend of Zelda: Ocarina of Time",
          sub: "Nintendo",
        },
      ],
    },
    {
      id: "rpg",
      slug: "melhor-rpg",
      nome: "Melhor RPG",
      en: "Best Role Playing",
      desc: "Avalia jogos ricos em progressão de personagens, customização, escolhas e mecânicas de interpretação.",
      indicados: [
        {
          id: "ff-resonance",
          titulo: "Final Fantasy Resonance",
          sub: "Lancarse/Square Enix",
        },
        {
          id: "fire-emblem-fortunes-weave",
          titulo: "Fire Emblem Fortune's Weave",
          sub: "Intelligent Systems/Nintendo",
        },
        {
          id: "mh-stories-3",
          titulo: "Monster Hunter Stories 3: Twisted Reflection",
          sub: "Capcom",
        },
        {
          id: "blood-of-dawnwalker",
          titulo: "The Blood of Dawnwalker",
          sub: "Rebel Wolves/Bandai Namco",
        },
        {
          id: "trails-in-the-sky-2nd",
          titulo: "Trails in the Sky 2nd Chapter",
          sub: "Nihon Falcom/GungHo",
        },
      ],
    },
    {
      id: "luta",
      slug: "melhor-jogo-de-luta",
      nome: "Melhor Jogo de Luta",
      en: "Best Fighting",
      desc: "Reconhece títulos desenhados principalmente para o combate direto entre oponentes.",
      indicados: [
        { id: "2xko", titulo: "2XKO", sub: "Riot Games" },
        {
          id: "avatar-fighting",
          titulo: "Avatar Legends: The Fighting Game",
          sub: "Gameplay Group/Paramount Games",
        },
        {
          id: "invincible-vs",
          titulo: "Invincible VS",
          sub: "Quarter Up/Skybound Games",
        },
        {
          id: "marvel-tokon",
          titulo: "Marvel Tōkon: Fighting Souls",
          sub: "ARC System Works/Sony Interactive",
        },
        {
          id: "mha-alls-justice",
          titulo: "My Hero Academia: All's Justice",
          sub: "Byking/Bandai Namco",
        },
      ],
    },
    {
      id: "familia",
      slug: "melhor-jogo-para-a-familia",
      nome: "Melhor Jogo para a Família",
      en: "Best Family",
      desc: "Premia jogos divertidos e acessíveis para serem aproveitados em grupo ou por todas as idades.",
      indicados: [
        { id: "big-walk", titulo: "Big Walk", sub: "House House/Panic" },
        {
          id: "lego-batman",
          titulo: "LEGO Batman: Legacy of the Dark Knight",
          sub: "TT Games/Warner Bros. Games",
        },
        {
          id: "switch-sports-resort",
          titulo: "Nintendo Switch Sports Resort",
          sub: "Nintendo",
        },
        {
          id: "pokemon-pokopia",
          titulo: "Pokémon Pokopia",
          sub: "Game Freak/Omega Force/Nintendo",
        },
        {
          id: "yoshi-mysterious-book",
          titulo: "Yoshi and the Mysterious Book",
          sub: "Good-Feel/Nintendo",
        },
      ],
    },
    {
      id: "simulacao",
      slug: "melhor-jogo-de-simulacao-estrategia",
      nome: "Melhor Jogo de Simulação / Estratégia",
      en: "Best Sim / Strategy",
      desc: "Destaca experiências focadas em planejamento tático, gerenciamento ou simulação realista.",
      indicados: [
        {
          id: "mewgenics",
          titulo: "Mewgenics",
          sub: "Edmund McMillen and Tyler Glaiel",
        },
        {
          id: "planet-zoo-2",
          titulo: "Planet Zoo 2",
          sub: "Frontier Developments",
        },
        {
          id: "pokemon-pokopia",
          titulo: "Pokémon Pokopia",
          sub: "Game Freak/Omega Force/Nintendo",
        },
        {
          id: "slay-the-spire-2",
          titulo: "Slay the Spire 2",
          sub: "Mega Crit",
        },
        {
          id: "star-wars-zero-company",
          titulo: "Star Wars Zero Company",
          sub: "Bit Reactor/Electronic Arts",
        },
      ],
    },
    {
      id: "esportes-corrida",
      slug: "melhor-jogo-de-esportes-corrida",
      nome: "Melhor Jogo de Esportes / Corrida",
      en: "Best Sports / Racing",
      desc: "Premia os melhores jogos baseados em esportes tradicionais, alternativos ou corridas.",
      indicados: [
        {
          id: "ea-fc-27",
          titulo: "EA Sports FC 27",
          sub: "EA Vancouver/EA Romania/EA Sports",
        },
        {
          id: "forza-horizon-6",
          titulo: "Forza Horizon 6",
          sub: "Playground Games/Xbox Game Studios",
        },
        {
          id: "switch-sports-resort",
          titulo: "Nintendo Switch Sports Resort",
          sub: "Nintendo",
        },
        { id: "screamer", titulo: "Screamer", sub: "Milestone" },
        {
          id: "star-wars-galactic-racer",
          titulo: "Star Wars: Galactic Racer",
          sub: "Fuse Games/Secret Mode",
        },
      ],
    },
    {
      id: "multiplayer",
      slug: "melhor-jogo-multiplayer",
      nome: "Melhor Jogo Multiplayer",
      en: "Best Multiplayer",
      desc: "Reconhece experiências e designs excepcionais voltados para partidas cooperativas ou competitivas online.",
      indicados: [
        { id: "big-walk", titulo: "Big Walk", sub: "House House/Panic" },
        {
          id: "cod-mw4",
          titulo: "Call of Duty: Modern Warfare 4",
          sub: "Infinity Ward/Activision",
        },
        {
          id: "gears-e-day",
          titulo: "Gears of War: E-Day",
          sub: "The Coalition/Xbox Game Studios",
        },
        { id: "marathon", titulo: "Marathon", sub: "Bungie/Sony Interactive" },
        {
          id: "meccha-chameleon",
          titulo: "Meccha Chameleon",
          sub: "Lemorion_1224",
        },
        { id: "orbitals", titulo: "Orbitals", sub: "Shapefarm/Kepler" },
      ],
    },
    {
      id: "adaptacao",
      slug: "melhor-adaptacao",
      nome: "Melhor Adaptação",
      en: "Best Adaptation",
      desc: "Premia obras de outras mídias, como filmes, séries e animações, que adaptam franquias de videogames.",
      indicados: [
        {
          id: "cyberpunk-edgerunners-2",
          titulo: "Cyberpunk: Edgerunners 2",
          sub: "Studio Trigger/CD Projekt Red/Netflix",
        },
        {
          id: "fallout-s2",
          titulo: "Fallout (Season 2)",
          sub: "Kilter Films/Bethesda/Amazon MGM Studios",
        },
        {
          id: "mortal-kombat-2",
          titulo: "Mortal Kombat II",
          sub: "New Line Cinema/Atomic Monster/Warner Bros. Pictures",
        },
        {
          id: "resident-evil-filme",
          titulo: "Resident Evil",
          sub: "Constantin/PlayStation Productions/Columbia Pictures",
        },
        {
          id: "super-mario-galaxy-movie",
          titulo: "The Super Mario Galaxy Movie",
          sub: "Illumination/Nintendo/Universal Pictures",
        },
      ],
    },
    {
      id: "criacao-usuario",
      slug: "melhor-criacao-de-usuario",
      nome: "Melhor Criação de Usuário",
      en: "Best User Creation",
      desc: "Reconhece mods, mapas, modos e experiências criadas pela própria comunidade dentro dos jogos.",
      indicados: [
        {
          id: "dream-of-silence",
          titulo: "A Dream of Silence: Revamped",
          sub: "Lizardphunk for Baldur's Gate 3",
        },
        {
          id: "create-aeronautics",
          titulo: "Create Aeronautics",
          sub: "Simulated Team for Minecraft",
        },
        {
          id: "nopixel-v",
          titulo: "NoPixel V",
          sub: "NoPixel Studios for Grand Theft Auto Online",
        },
        {
          id: "star-wars-droid-tycoon",
          titulo: "Star Wars Droid Tycoon",
          sub: "FOAD for Fortnite",
        },
        { id: "ttk", titulo: "TTK", sub: "Sable Digital for Roblox" },
      ],
    },
    {
      id: "criador",
      slug: "criador-de-conteudo-do-ano",
      nome: "Criador de Conteúdo do Ano",
      en: "Content Creator of the Year",
      desc: "Premia streamers e produtores de conteúdo que tiveram grande impacto positivo na comunidade gamer.",
      indicados: [
        { id: "cdawg", titulo: "CDawg", sub: "" },
        { id: "cellbit", titulo: "Cellbit", sub: "" },
        { id: "ishowspeed", titulo: "IShowSpeed", sub: "" },
        { id: "lilsimsie", titulo: "LilSimsie", sub: "" },
        { id: "ohnepixel", titulo: "OhnePixel", sub: "" },
      ],
    },
    {
      id: "atleta",
      slug: "melhor-atleta-de-esports",
      nome: "Melhor Atleta de Esports",
      en: "Best Esports Athlete",
      desc: "Destaca o jogador profissional com o desempenho mais impressionante no cenário competitivo.",
      indicados: [
        { id: "chovy", titulo: "Chovy", sub: "Gen.G" },
        { id: "donk", titulo: "donk", sub: "Team Spirit" },
        { id: "erde", titulo: "ERDE", sub: "LOUD" },
        { id: "yatoro", titulo: "Yatoro", sub: "Team Spirit" },
        { id: "zywoo", titulo: "ZywOo", sub: "Team Vitality" },
      ],
    },
    {
      id: "jogo-esports",
      slug: "melhor-jogo-de-esports",
      nome: "Melhor Jogo de Esports",
      en: "Best Esports Game",
      desc: "Premia o jogo que proporcionou a melhor experiência competitiva e torneios no ano.",
      indicados: [
        { id: "cs2", titulo: "Counter-Strike 2", sub: "Valve" },
        { id: "dota2", titulo: "Dota 2", sub: "Valve" },
        { id: "lol", titulo: "League of Legends", sub: "Riot Games" },
        { id: "mlbb", titulo: "Mobile Legends: Bang Bang", sub: "Moonton" },
        { id: "valorant", titulo: "Valorant", sub: "Riot Games" },
      ],
    },
    {
      id: "esports",
      slug: "melhor-time-de-esports",
      nome: "Melhor Time de Esports",
      en: "Best Esports Team",
      desc: "Reconhece a equipe competitiva com o melhor desempenho e resultados ao longo da temporada.",
      indicados: [
        {
          id: "geng",
          titulo: "Gen.G",
          sub: "League of Legends",
          cor: "linear-gradient(160deg,#b8973a,#2a220c)",
        },
        {
          id: "loud",
          titulo: "LOUD",
          sub: "Valorant",
          cor: "linear-gradient(160deg,#3fbf5a,#0d2a14)",
        },
        {
          id: "falcs2",
          titulo: "Team Falcons",
          sub: "Counter-Strike 2",
          cor: "linear-gradient(160deg,#2f8f6a,#0c2a20)",
        },
        {
          id: "falrl",
          titulo: "Team Falcons",
          sub: "Rocket League",
          cor: "linear-gradient(160deg,#4aa0b8,#0e2830)",
        },
        {
          id: "spirit",
          titulo: "Team Spirit",
          sub: "Dota 2",
          cor: "linear-gradient(160deg,#9a9aa8,#22222a)",
        },
        {
          id: "vitality",
          titulo: "Team Vitality",
          sub: "Counter-Strike 2",
          cor: "linear-gradient(160deg,#d6c93a,#2e2a08)",
        },
      ],
    },
    {
      id: "aguardado",
      slug: "jogo-mais-aguardado",
      nome: "Jogo Mais Aguardado",
      en: "Most Anticipated Game",
      desc: "Premia o título futuro anunciado que gera a maior expectativa entre o público e a crítica.",
      indicados: [
        {
          id: "fable",
          titulo: "Fable",
          sub: "Playground Games/Xbox Game Studios",
          cor: "linear-gradient(160deg,#4f7a4a,#1e3324)",
        },
        {
          id: "ff7r3",
          titulo: "Final Fantasy VII Revelation",
          sub: "Square Enix",
          cor: "linear-gradient(160deg,#5b6c8f,#1b2236)",
        },
        {
          id: "gowl",
          titulo: "God of War Laufey",
          sub: "Sony Santa Monica/Sony Interactive",
          cor: "linear-gradient(160deg,#c98a4a,#4a2814)",
        },
        {
          id: "rev",
          titulo: "Resident Evil Veronica",
          sub: "Capcom",
          cor: "linear-gradient(160deg,#c23a3a,#3a0d12)",
        },
        {
          id: "tw4",
          titulo: "The Witcher 4",
          sub: "CD Projekt Red",
          cor: "linear-gradient(160deg,#8a8f7a,#2a2c22)",
        },
      ],
    },
  ],
};
