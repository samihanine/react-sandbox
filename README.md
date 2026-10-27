# React Sandbox

React + TypeScript + Vite + Tailwind + shadcn/ui (Base UI) + Bun template.
Two tabs: an **Excel / CSV viewer** (DuckDB in the browser, handles multi-GB files) and a **Todo** example saved in the browser.

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

`dist-html/index.html` works offline: double-click it or send it by email, nothing else is needed.
Files opened in the viewer never leave the computer.

## 3. Repo structure

```
src/
  app.tsx            Layout and tabs
  pages/             One file per tab (excel-viewer.tsx, example.tsx)
  components/        App components (file-input, excel-table, pagination…)
  components/ui/     shadcn/ui components (button, input, tabs…)
  lib/               Logic without UI
    duckdb.ts        In-browser SQL engine: loading, search, sort, pagination
    csv.ts           CSV import / export
    xlsx.ts          Excel import / export
    storage.ts       IndexedDB storage (usePersistentState hook)
scripts/             Maintenance scripts (dependency update)
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
- The built HTML has a Content-Security-Policy that blocks every network request: data can never leave the computer.
- Exports escape cells starting with `= + - @` so Excel cannot run them as formulas.
- If the project is hosted on GitHub: Dependabot (`.github/dependabot.yml`) opens weekly update PRs and CI (`.github/workflows/ci.yml`) runs the audit and checks.

Run `bun run deps:update` regularly (e.g. once a month). To report a vulnerability, see `SECURITY.md`.

## 5. Adding features

- **New tab**: create `src/pages/my-page.tsx` exporting a component, then add one line to the `tabs` array in `src/app.tsx`.
- **New shadcn component**: `bunx shadcn@latest add dialog` (see https://ui.shadcn.com/docs/components), then import it from `@/components/ui/dialog`.
- **Icons**: import from `lucide-react` (browse https://lucide.dev/icons).
- **Save data in the browser**: replace `useState` by `usePersistentState("my-key", initialValue)` from `@/lib/storage`.
- **Tests**: add a `*.test.ts` file next to the code it tests (see `src/lib/csv.test.ts`).
- **New dependency**: `bun add package-name`, then `bun run check`.
