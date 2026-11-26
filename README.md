# React Sandbox

React + TypeScript + Vite + Tailwind + shadcn/ui (Base UI) + Bun template.
Collection posters for the association **Petits Frères des Pauvres**: six designs drawn in SVG, each downloadable
as a PNG (3600 × 5400 px, A3 print quality) or as a vector SVG. The standalone illustrations are in `public/illustrations/`.

## 1. Installation (Windows)

1. Install **Bun**: open PowerShell and run

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

   Close and reopen PowerShell, then check with `bun --version`.
2. Install **VS Code**: https://code.visualstudio.com
3. Unzip the project, then in VS Code: **File → Open Folder…** and pick the unzipped folder.
   Accept the recommended extensions popup (Biome, Tailwind CSS, Bun).
4. Open the terminal (**Terminal → New Terminal**) and run:

   ```powershell
   bun install
   ```

## 2. Dev & build

| Command              | What it does                                               |
| -------------------- | ---------------------------------------------------------- |
| `bun dev`            | Start the dev server at http://localhost:5173 (hot reload) |
| `bun run build:html` | Build everything into **one file**: `dist-html/index.html` |
| `bun run build`      | Classic build (several files) into `dist/`                 |
| `bun run lint`       | Check code style and errors (Biome)                        |
| `bun run format`     | Auto-fix style, sort imports and Tailwind classes          |
| `bun run typecheck`  | TypeScript check                                           |
| `bun run check`      | Typecheck + lint + build, run it before sharing your work  |

`dist-html/index.html` works offline (fonts are bundled): double-click it or send it by email, nothing else is needed.
`bun dev` runs Vite on the Bun runtime, so it works even if an old Node.js is installed.

## 3. Repo structure

```
src/
  app.tsx              Layout
  pages/posters.tsx    The poster gallery
  components/          poster-view (scaled render), poster-card (zoom + PNG/SVG download)
  components/ui/       shadcn/ui components (button, sonner)
  posters/
    markup/            Poster designs (HTML + inline SVG, drawn at 600 × 900) and the shared illustration library
    posters.css        Poster styles and illustration palettes
    generators.ts      Generated decoration (garden wreath, knitted bands)
    export.ts          PNG / SVG export with html-to-image
    fonts.ts           Bundled fonts (Fontsource)
public/illustrations/  Standalone illustrations, PNG and SVG, in three palettes
scripts/               Maintenance scripts (dependency update)
```

## 4. Security

| Command                      | What it does                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `bun run audit`              | Lists dependencies with known vulnerabilities (CVE)                                    |
| `bun run deps:outdated`      | Lists dependencies that have a newer version                                           |
| `bun run deps:update`        | Updates within safe ranges, runs audit + all checks, **rolls back if anything breaks** |
| `bun run deps:update:latest` | Same, including major versions                                                         |

Built-in protections:

- `bunfig.toml` refuses package versions published less than 3 days ago (hijacked releases are usually removed within hours).
- Bun never runs install scripts of dependencies unless they are listed in `trustedDependencies`.
- `bun.lock` pins exact versions: everyone installs the same code.
- If the project is hosted on GitHub: Dependabot (`.github/dependabot.yml`) opens weekly update PRs and CI (`.github/workflows/ci.yml`) runs the audit and checks.

Run `bun run deps:update` regularly (e.g. once a month). To report a vulnerability, see `SECURITY.md`.

## 5. Adding features

- **New poster**: add `src/posters/markup/my-poster.html` (root `<div class="poster p-my-poster">`, 600 × 900), its styles in `posters.css`, then one entry in `src/posters/index.ts`.
- **New shadcn component**: `bunx shadcn@latest add dialog` (see https://ui.shadcn.com/docs/components), then import it from `@/components/ui/dialog`.
- **Icons**: import from `lucide-react` (browse https://lucide.dev/icons).
- **Tests**: add a `*.test.ts` file next to the code it tests (see `src/posters/export.test.ts`).
- **New dependency**: `bun add package-name`, then `bun run check`.
