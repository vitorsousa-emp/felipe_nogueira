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

  const dot  = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;   // posição atual do mouse
  let ringX  = 0, ringY  = 0;   // posição interpolada do anel

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
  const start  = performance.now();

  const tick = (now) => {
    const progress = Math.min(1, (now - start) / COUNTER_DURATION_MS);
    const eased    = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value    = Math.round(eased * target);
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
});
