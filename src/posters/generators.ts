// Generated decoration for the "Jardin" (wreath, arches, garden) and "Tricot" (jacquard bands) posters.
// Each generator empties its target groups first, so running it twice (StrictMode, zoom view) stays correct.

const NS = "http://www.w3.org/2000/svg";

type Attrs = Record<string, string | number>;

function el(tag: string, attrs: Attrs, parent: Element) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  parent.appendChild(node);
  return node;
}

const use = (href: string, attrs: Attrs, parent: Element) => el("use", { href, ...attrs }, parent);

/** Deterministic pseudo-random numbers, so every render (and every export) is identical. */
function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function group(root: HTMLElement, selector: string) {
  const g = root.querySelector(selector);
  if (!g) throw new Error(`Missing ${selector}`);
  g.replaceChildren();
  return g;
}

export function drawJardin(root: HTMLElement) {
  const rnd = seeded();
  const W = group(root, "#j-wreath");
  const cx = 300;
  const cy = 230;
  const rx = 232;
  const ry = 176;

  const branch = (a0: number, a1: number, n: number) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t), t]);
    }
    const d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`;
    el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 1.4 }, W);
    const dir = Math.sign(a1 - a0);
    pts.forEach(([x, y, t], i) => {
      if (i === 0) return;
      const ang = (Math.atan2(ry * Math.cos(t) * dir, -rx * Math.sin(t) * dir) * 180) / Math.PI;
      const sc = (0.76 + rnd() * 0.18) * (1 - (i / n) * 0.5);
      const outlined = i % 3 === 0;
      use(outlined ? "#leaf-o" : "#leaf", { transform: `translate(${x} ${y}) rotate(${ang - 38}) scale(${sc})` }, W);
      use(
        outlined ? "#leaf" : "#leaf-o",
        { transform: `translate(${x} ${y}) rotate(${ang + 38}) scale(${sc * 0.92})` },
        W,
      );
      if (i % 6 === 3) {
        const berries = el("g", { transform: `translate(${x} ${y}) rotate(${ang + 90})` }, W);
        for (const [bx, by] of [
          [8, -2],
          [12, 3],
          [6, 5],
        ] as const) {
          el("circle", { cx: bx, cy: by, r: 2.4, fill: "#a8874f" }, berries);
        }
      }
    });
  };
  branch(97, 262, 26);
  branch(83, -82, 26);

  const by = cy + ry;
  for (const [flip, x] of [
    [-1, 252],
    [1, 348],
  ] as const) {
    for (let a = 0; a < 3; a++) {
      use("#leaf", { transform: `translate(${x} ${by}) scale(${flip} 1) rotate(${-150 + a * 40}) scale(.7)` }, W);
    }
  }
  for (const [x, y, s] of [
    [300, by - 4, 1.15],
    [272, by + 2, 0.85],
    [328, by + 2, 0.85],
  ] as const) {
    use("#rose", { transform: `translate(${x} ${y}) scale(${s})` }, W);
  }
  el(
    "path",
    {
      d: `M300 ${by + 14}c-20-6-34 4-40 14 14 2 30-2 40-14zm0 0c20-6 34 4 40 14-14 2-30-2-40-14zm-4 2l-12 22 7-2 5 6 4-28zm8 0l12 22-7-2-5 6-4-28z`,
      fill: "#a8874f",
    },
    W,
  );
  const medal = el("g", { transform: `translate(300 ${cy - ry})` }, W);
  el("ellipse", { rx: 15, ry: 19, fill: "#f3eee1", stroke: "#a8874f", "stroke-width": 1.3 }, medal);
  use("#i-heart", { x: -9, y: -10, width: 18, height: 18, fill: "#a8874f" }, medal);

  const A = group(root, "#j-arches");
  ["#i-cup", "#i-scarf", "#i-book"].forEach((icon, idx) => {
    const x = 40 + idx * 180;
    const w = 160;
    const r = 80;
    const y = 446;
    const top = y + r;
    const bot = 718;
    el(
      "path",
      { d: `M${x} ${bot}V${top}A${r} ${r} 0 0 1 ${x + w} ${top}V${bot}Z`, fill: "#e9e2cd", stroke: "none" },
      A,
    );
    el("path", { d: `M${x} ${bot}V${top}A${r} ${r} 0 0 1 ${x + w} ${top}V${bot}`, "stroke-width": 1.4 }, A);
    el(
      "path",
      { d: `M${x + 7} ${bot}V${top}A${r - 7} ${r - 7} 0 0 1 ${x + w - 7} ${top}V${bot}`, "stroke-width": 0.6 },
      A,
    );
    el("path", { d: `M${x - 6} ${bot}H${x + w + 6}`, stroke: "#a8874f", "stroke-width": 1.6 }, A);
    el("path", { d: `M${x + r - 7} ${y}h14l-3 12h-8z`, fill: "#a8874f", stroke: "none" }, A);
    for (let side = 0; side < 2; side++) {
      const vx = side ? x + w - 3.5 : x + 3.5;
      for (let k = 0; k < 8; k++) {
        const vy = bot - 12 - k * 19;
        if (vy < top - 24) break;
        const rot = side ? 200 + (k % 2) * 60 : -20 - (k % 2) * 60;
        use("#leaf", { transform: `translate(${vx} ${vy}) rotate(${rot}) scale(.42)` }, A);
      }
    }
    use(icon, { x: x + r - 29, y: y + 14, width: 58, height: 58, color: "#1b3024", "stroke-width": 2 }, A);
  });

  const C = group(root, "#j-corners");
  for (const [x, y, r] of [
    [23, 23, 0],
    [577, 23, 90],
    [577, 877, 180],
    [23, 877, 270],
  ] as const) {
    const g = el("g", { transform: `translate(${x} ${y}) rotate(${r})` }, C);
    el("path", { d: "M6 6C30 10 44 24 48 48", fill: "none", stroke: "currentColor", "stroke-width": 0.9 }, g);
    for (const [lx, ly, la] of [
      [14, 8, 10],
      [26, 14, 30],
      [36, 24, 50],
      [44, 36, 70],
    ] as const) {
      use("#leaf", { transform: `translate(${lx} ${ly}) rotate(${la - 40}) scale(.45)` }, g);
    }
    el("circle", { cx: 8, cy: 8, r: 3, fill: "#a8874f" }, g);
  }

  const G = group(root, "#j-garden");
  for (let x = 34; x < 566; x += 7) {
    const h = 8 + rnd() * 18;
    const d = `M${x} 874q${(rnd() - 0.5) * 6} ${-h / 2} ${(rnd() - 0.5) * 8} ${-h}`;
    el("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 0.7, opacity: 0.7 }, G);
  }
  for (const [x, s, f] of [
    [60, 0.42, 1],
    [130, 0.36, -1],
    [470, 0.36, 1],
    [540, 0.42, -1],
  ] as const) {
    use("#muguet", { transform: `translate(${x} 876) scale(${s * f} ${s})` }, G);
  }
  for (const x of [96, 504]) use("#rose", { transform: `translate(${x} 862) scale(.55)` }, G);
}

export function drawTricot(root: HTMLElement) {
  const heart = [".XX...XX.", "XXXX.XXXX", "XXXXXXXXX", ".XXXXXXX.", "..XXXXX..", "...XXX...", "....X...."];
  const flake = ["X..X..X", ".X.X.X.", "..XXX..", "XXX.XXX", "..XXX..", ".X.X.X.", "X..X..X"];
  const motif = heart.map((row, i) => `.${row}..${flake[i]}.`);
  const P = motif[0]?.length ?? 20;
  const rows = [
    "o".repeat(P),
    "o.".repeat(P / 2),
    ".".repeat(P),
    ...motif,
    ".".repeat(P),
    ".o".repeat(P / 2),
    "o".repeat(P),
  ];
  const colors: Record<string, string> = { ".": "#7e1f22", X: "#f5e9d4", o: "#2f5a43" };

  const band = (selector: string, y0: number, flip: boolean) => {
    const g = group(root, selector);
    const rs = flip ? [...rows].reverse() : rows;
    el("rect", { x: 0, y: y0 - 4, width: 600, height: rs.length * 9 + 8, fill: "#7e1f22" }, g);
    rs.forEach((row, ri) => {
      for (let c = 0; c < 60; c++) {
        use("#st", { x: c * 10, y: y0 + ri * 9, fill: colors[row[(c + 5) % P] ?? "."] ?? "#7e1f22" }, g);
      }
    });
  };
  band("#knit-top", 4, false);
  band("#knit-bot", 900 - 4 - rows.length * 9, true);
}
