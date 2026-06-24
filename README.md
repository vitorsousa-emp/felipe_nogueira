# Felipe Nogueira — Personal Brand Experience

Site estático em **HTML + CSS + JavaScript puro** (sem build, sem dependências).

## Como rodar

Abra `index.html` direto no navegador **ou** rode um servidor local para evitar restrições de `file://` (recomendado para os módulos JS):

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Depois acesse `http://localhost:8000`.

## Estrutura

```
felipe-nogueira/
├── index.html                # Marcação semântica + SEO + estrutura por capítulos
├── assets/                   # Imagens (hero, retrato, bastidores)
├── css/
│   ├── reset.css             # Reset mínimo
│   ├── tokens.css            # Variáveis (cores, fontes, espaçamento)
│   ├── base.css              # Tipografia e elementos globais
│   ├── components.css        # Botões, frames, cards reutilizáveis
│   ├── layout.css            # Header, hero, grids de cada seção
│   ├── animations.css        # Loader, reveal, cursor, progress
│   └── responsive.css        # Breakpoints mobile-first
└── js/
    ├── main.js               # Entry point, importa cada módulo
    └── modules/
        ├── loader.js         # Abertura cinematográfica
        ├── reveal.js         # IntersectionObserver para entradas
        ├── scrollProgress.js # Barra fina de progresso no topo
        ├── parallax.js       # Tiles com data-parallax
        ├── cursor.js         # Cursor customizado (desktop)
        ├── counters.js       # Contadores animados
        ├── brandTiles.js     # Mural de marcas (toque revela)
        └── footerYear.js     # Atualiza o ano no rodapé
```

## Paleta

| Token        | Hex       | Uso                          |
| ------------ | --------- | ---------------------------- |
| `--ink`      | `#0A0A0A` | Fundo principal              |
| `--deep`     | `#081924` | Superfícies escuras          |
| `--petrol`   | `#10273F` | Superfícies de glass         |
| `--bronze`   | `#A27C52` | Detalhes, linhas, acentos    |
| `--ice`      | `#F5F5F5` | Texto e títulos              |

## Tipografia

- **Display**: Cormorant Garamond (300/400, regular e itálico)
- **Texto**:   Inter (300/400/500/600)

Carregada via Google Fonts em `index.html`.

## Boas práticas usadas

- Mobile-first em `responsive.css`, valores fluidos com `clamp()`.
- Zero dependências JS — performance e simplicidade.
- `IntersectionObserver` para reveals (não roda em scroll).
- `requestAnimationFrame` no parallax, progress e cursor.
- `prefers-reduced-motion` respeitado em `animations.css`.
- Imagens com `loading="lazy"` quando fora do hero.
