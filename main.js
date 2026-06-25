/* ============================================================
   main.js
   Arquivo único com todos os módulos do site.
   Sem dependências externas — apenas Vanilla JS.

   Sumário:
     1. Loader          — tela de abertura cinematográfica
     2. Reveal          — fade-in dos elementos .reveal
     3. ScrollProgress  — barra de progresso no topo
     4. Parallax        — movimento Y em [data-parallax]
     5. Cursor          — cursor customizado (desktop)
     6. Counters        — animação de [data-counter]
     7. BrandTiles      — overlay nos tiles de marcas
     8. FooterYear      — ano atual no rodapé
     9. Bootstrap       — inicialização no DOMContentLoaded
   ============================================================ */


/* ------------------------------------------------------------
   1. Loader
   Tela de abertura cinematográfica. Permanece visível por
   ~2.8s para que as duas frases sejam lidas, depois revela
   o site adicionando a classe .gone.
   ------------------------------------------------------------ */
const LOADER_DURATION = 2800; // ms

function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  // Bloqueia rolagem enquanto o loader está visível
  document.documentElement.style.overflow = "hidden";

  window.setTimeout(() => {
    loader.classList.add("gone");
    loader.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }, LOADER_DURATION);
}


/* ------------------------------------------------------------
   2. Reveal
   Adiciona a classe .in nos elementos .reveal quando eles
   entram no viewport. A animação em si é feita 100% em CSS
   (ver animations.css), aqui só observamos a interseção.
   ------------------------------------------------------------ */
function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length || !("IntersectionObserver" in window)) {
    // Fallback: mostra tudo
    targets.forEach((el) => el.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  targets.forEach((el) => observer.observe(el));
}


/* ------------------------------------------------------------
   7. BubbleLayout
   Posiciona as bolhas na arena sem sobreposição.
   Lógica simples: tenta posições aleatórias e verifica colisão
   antes de fixar. Roda uma única vez no load e no resize.
   ------------------------------------------------------------ */

function isMobile() {
  return window.innerWidth <= 768;
}

function positionBubbles() {
  const arena = document.querySelector('.bubbles-arena');
  if (!arena) return;

  const bubbles = arena.querySelectorAll('.bubble');

  if (isMobile()) {
    /* ── MOBILE: remove qualquer posição inline aplicada antes ── */
    bubbles.forEach(b => {
      b.style.left = '';
      b.style.top = '';
      b.style.right = '';
      b.style.bottom = '';
      /* Mantém a animação de flutuação — apenas o eixo Y */
    });

  } else {
    /* ── DESKTOP: aplica posicionamento absoluto original ── */
    const arenaW = arena.offsetWidth;
    const arenaH = arena.offsetHeight;

    /*
     * Substitua o array abaixo pelas suas posições reais,
     * expressas como fração de 0–1 do tamanho da arena.
     * Ex.: { x: 0.1, y: 0.2 } = 10% da largura, 20% da altura.
     *
     * Usar frações garante que o layout escala com o container
     * mesmo no desktop, sem bolhas saindo da borda.
     */
    const positions = [
      { x: 0.08, y: 0.10 },
      { x: 0.25, y: 0.55 },
      { x: 0.42, y: 0.08 },
      { x: 0.60, y: 0.62 },
      { x: 0.75, y: 0.18 },
      { x: 0.85, y: 0.55 },
      { x: 0.50, y: 0.35 },
      { x: 0.15, y: 0.75 },
    ];

    bubbles.forEach((b, i) => {
      const pos = positions[i % positions.length];
      const size = b.offsetWidth;

      /* Clamp para a bolha não ultrapassar as bordas da arena */
      const maxX = arenaW - size;
      const maxY = arenaH - size;

      b.style.left = Math.min(pos.x * arenaW, maxX) + 'px';
      b.style.top = Math.min(pos.y * arenaH, maxY) + 'px';
    });
  }
}

/* ── Inicializa e re-executa no resize ── */
positionBubbles();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(positionBubbles, 120);
});

function initBubbleLayout() {
  const arena = document.getElementById("bubblesArena");
  if (!arena) return;

  const bubbles = Array.from(arena.querySelectorAll(".bubble"));
  if (!bubbles.length) return;

  const PADDING = 12; // margem mínima entre bolhas

  function place() {
    const W = arena.offsetWidth;
    const H = arena.offsetHeight;
    const placed = []; // { cx, cy, r }

    bubbles.forEach((b) => {
      const r = b.offsetWidth / 2;
      let cx, cy, tries = 0, ok = false;

      while (tries < 300 && !ok) {
        tries++;
        cx = r + Math.random() * (W - r * 2);
        cy = r + Math.random() * (H - r * 2);
        ok = placed.every((p) => {
          const dx = cx - p.cx, dy = cy - p.cy;
          return Math.sqrt(dx * dx + dy * dy) >= r + p.r + PADDING;
        });
      }

      // Fallback: posição aleatória sem verificação
      if (!ok) { cx = r + Math.random() * (W - r * 2); cy = r + Math.random() * (H - r * 2); }

      placed.push({ cx, cy, r });
      b.style.left = `${cx - r}px`;
      b.style.top = `${cy - r}px`;
    });
  }

  place();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(place, 120);
  });
}

/* ------------------------------------------------------------
   3. ScrollProgress
   Barra fina de bronze que cresce no topo conforme o usuário
   rola a página. Usa transform: scaleX() para performance.
   ------------------------------------------------------------ */
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ------------------------------------------------------------
   4. Parallax
   Move elementos [data-parallax="0.1"] em Y de acordo com a
   posição relativa ao centro da viewport. O número define a
   intensidade — pode ser negativo (movimento inverso).
   ------------------------------------------------------------ */
function initParallax() {
  const tiles = document.querySelectorAll("[data-parallax]");
  if (!tiles.length) return;

  let raf = 0;

  const update = () => {
    const vh = window.innerHeight;
    tiles.forEach((tile) => {
      const speed = parseFloat(tile.dataset.parallax || "0");
      const rect = tile.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - vh / 2;
      const offset = (-center * speed).toFixed(2);
      tile.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    raf = 0;
  };

  const onScroll = () => {
    if (!raf) raf = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);
}


/* ------------------------------------------------------------
   5. Cursor
   Cursor customizado em duas partes (ponto + anel que segue
   com inércia). Ativo apenas em dispositivos com hover real.
   ------------------------------------------------------------ */
function initCursor() {
  // Não inicializa em touch / mobile
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".cursor-dot, .cursor-ring")
      .forEach((el) => el.remove());
    return;
  }

  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;   // posição atual do mouse
  let ringX = 0, ringY = 0;   // posição interpolada do anel

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Loop com easing para o anel
  const loop = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    window.requestAnimationFrame(loop);
  };
  loop();

  // Cursor maior em links/botões
  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width = "56px";
      ring.style.height = "56px";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width = "36px";
      ring.style.height = "36px";
    });
  });
}


/* ------------------------------------------------------------
   6. Counters
   Anima qualquer [data-counter="N"] de 0 até N quando entra
   no viewport. Easing easeOutCubic para um final suave.
   ------------------------------------------------------------ */
const COUNTER_DURATION_MS = 1800;

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.counter || "0", 10);
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min(1, (now - start) / COUNTER_DURATION_MS);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString("pt-BR");
    if (progress < 1) window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}


/* ------------------------------------------------------------
   7. BrandTiles
   Para cada tile do mural de marcas (.logo-tile), cria um
   elemento de descrição a partir do atributo data-desc.
   Toque/clique alterna a descrição (importante para mobile,
   onde não existe :hover).
   ------------------------------------------------------------ */
function initBrandTiles() {
  const tiles = document.querySelectorAll(".logo-tile");
  if (!tiles.length) return;

  tiles.forEach((tile) => {
    const desc = tile.dataset.desc;
    if (!desc) return;

    // Cria o overlay de descrição
    const overlay = document.createElement("span");
    overlay.className = "logo-tile__desc";
    overlay.textContent = desc;
    tile.appendChild(overlay);

    // Click/touch alterna .is-active
    tile.addEventListener("click", (e) => {
      e.preventDefault();
      // Fecha os outros para deixar apenas um ativo
      tiles.forEach((t) => { if (t !== tile) t.classList.remove("is-active"); });
      tile.classList.toggle("is-active");
    });
  });

  // Clicar fora fecha todos
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    if (!e.target.closest(".logo-tile")) {
      tiles.forEach((t) => t.classList.remove("is-active"));
    }
  });
}


/* ------------------------------------------------------------
   8. FooterYear
   Mantém o ano do rodapé sempre atualizado.
   ------------------------------------------------------------ */
function initFooterYear() {
  const el = document.getElementById("year");
  if (!el) return;
  el.textContent = `© ${new Date().getFullYear()} Felipe Nogueira`;
}


/* ------------------------------------------------------------
   9. Bootstrap
   Inicializa todos os módulos após o DOM estar pronto.
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initReveal();
  initScrollProgress();
  initParallax();
  initCursor();
  initCounters();
  initBrandTiles();
  initFooterYear();
  initBubbleLayout();
  initVideoPlay();
});

// Extrai o ID do vídeo aceitando URL completa (watch, shorts, youtu.be,
// embed) ou apenas o ID puro, para evitar erro de cole-e-esqueça no HTML.
function extractYouTubeId(raw) {
  if (!raw) return null;

  // Já é um ID puro (11 caracteres, sem barras/protocolo)
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/shorts/")[1];
    }
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/embed/")[1];
    }
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

function initVideoPlay() {
  const frame = document.getElementById("videoFrame");
  if (!frame) return;

  const btn = frame.querySelector(".play-btn");
  const ytId = extractYouTubeId(frame.dataset.ytId);

  if (!btn || !ytId) {
    console.warn("[initVideoPlay] data-yt-id inválido ou ausente:", frame.dataset.ytId);
    return;
  }

  btn.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    iframe.title = "Reel cinematográfico";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    frame.appendChild(iframe);
    frame.classList.add("is-playing");
  });
}