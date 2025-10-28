# Airlines Seat Calculator — Next.js starter

This workspace contains a minimal Next.js (app router) + Tailwind CSS starter with a single centralized theme file for fonts and colors.

Key files:
- `styles/theme.css` — edit colors and font variable names here. This is the single place to change the look.
- `styles/globals.css` — imports `theme.css` and contains @font-face placeholders. Put your local fonts in `public/fonts/` and reference them here.
- `public/fonts/` — drop your .woff2/.woff/.ttf files here.
- `components/Button.tsx` — example component using the theme variables.

Local setup (macOS / zsh):

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

3. Open http://localhost:3000

Adding local fonts:
1. Copy your font files to `public/fonts/`.
2. Edit `styles/globals.css` and add an `@font-face` block pointing to your files. Example:

```css
@font-face {
  font-family: 'InterLocal';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Then update the `--font-sans` variable in `styles/theme.css` if needed.

Notes:
- Tailwind is already configured. Edit `tailwind.config.js` content paths if you add more folders.
- This project is TypeScript-ready. Install types or adjust `tsconfig.json` if you change settings.
