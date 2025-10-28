const fs = require('fs')
const path = require('path')

const publicFontsDir = path.join(process.cwd(), 'public', 'fonts')
const assetsFontsDir = path.join(process.cwd(), 'assets', 'fonts')
const outCss = path.join(process.cwd(), 'styles', '_fonts.generated.css')

function gatherFonts(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => /\.woff2?$|\.ttf$|\.otf$/i.test(f))
}

const publicFonts = gatherFonts(publicFontsDir).map(f => ({ file: f, src: path.posix.join('fonts', f), origin: 'public' }))
const assetsFonts = gatherFonts(assetsFontsDir).map(f => ({ file: f, src: path.posix.join('assets', 'fonts', f), origin: 'assets' }))

const fonts = [...publicFonts, ...assetsFonts]

let css = '/* THIS FILE IS GENERATED — run `node scripts/generate-font-css.js` */\n\n'

for (const f of fonts) {
  const name = path.parse(f.file).name.replace(/[^a-zA-Z0-9_-]/g, '_')
  // default weight/style guesses
  const weight = /bold/i.test(f.file) ? 700 : /thin|hairline|light/i.test(f.file) ? 300 : 400
  const style = /italic/i.test(f.file) ? 'italic' : 'normal'
  const ext = path.extname(f.file).toLowerCase()
  let fmt = 'woff2'
  if (ext === '.woff') fmt = 'woff'
  if (ext === '.ttf') fmt = 'truetype'
  if (ext === '.otf') fmt = 'opentype'

  // public fonts should be referenced from root '/fonts/..'
  const urlPath = f.origin === 'public' ? `/${f.src}` : `/${f.src}`

  css += `@font-face {\n  font-family: '${name}';\n  src: url('${urlPath}') format('${fmt}');\n  font-weight: ${weight};\n  font-style: ${style};\n  font-display: swap;\n}\n\n`
}

fs.writeFileSync(outCss, css)
console.log('Wrote', outCss)
