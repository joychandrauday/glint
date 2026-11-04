# Glint — Brand Kit

The Glint identity: a boxy 3D starburst mascot (`the spark`) in electric lime, faceted
with cyan, magenta and yellow, extruded into violet depth and outlined in deep indigo.

Open **[`preview.html`](./preview.html)** for the visual spec sheet.

---

## Assets

| File | Use |
| --- | --- |
| `glint-logo.svg` | Primary horizontal lockup (transparent) |
| `glint-logo-dark.svg` | Lockup on the `#0B0726` deep-space plate |
| `glint-mark.svg` | Mascot + 8 orbiting voxels |
| `glint-icon.svg` | Mascot only, square — safest for small sizes |
| `glint-app-icon.svg` | Rounded-square tile (1024 grid) |
| `glint-wordmark.svg` | Standalone "Glint" wordmark |
| `tokens.json` | Color + component tokens |
| `colors.css` | CSS custom properties |
| `icons/glint-*.png` | 16 → 1024 px transparent app icons |
| `icons/glint-app-*.png` | 256 / 512 / 1024 px tile renders |
| `icons/glint-favicon.ico` | Multi-size favicon (16/32/48/64) |
| `exports/` | 2× PNGs for docs, READMEs and slides |

## Palette

| Token | Hex | Job |
| --- | --- | --- |
| Electric Lime | `#BDFB03` | Face, G l n t |
| Bright Cyan | `#0DE4F3` | `i` stem, left facet |
| Vivid Violet | `#7D23D9` | 3D extrusion |
| Electric Magenta | `#CB4BF7` | Top-right facet |
| Warm Yellow | `#FED02A` | `i` dot, lower-right spark |
| Coral Blush | `#F57265` | Cheeks, particle pops |
| Deep Void Indigo | `#110939` | Ink, outline |
| Deep Space | `#0B0726` | Dark surface |

## Construction

- **Mark** — square core on a 640 grid with four blocky points, extruded `+28 / +34`
  into violet. Front face is lime with clipped cyan/magenta/yellow facets. Ink stroke `13`.
- **Wordmark** — cap height `100`, stem `24`, ink `7`, extrusion `+15 / +18`.
  Every glyph is one closed contour; the extrusion is masked out from the letter faces
  so the depth only reads on the outside of each block.
- **Particles** — 8 voxels with a `0.36 × size` depth, top face highlight, violet side.

## Rules

- Clear space: one star point (≈ ⅛ of the mark) on every side.
- Minimum sizes: mark `48 px`, icon `16 px`, lockup `120 px` wide.
- Don't recolor facets, flatten the extrusion, restretch the wordmark or add effects.

## Rebuilding

Everything is generated from a single geometry source:

```bash
python3 brand/tools/build.py       # writes all SVGs, tokens, CSS
node brand/tools/render-icons.mjs  # rasterises the PNG/ICO set with resvg
```

`build.py` calls the renderer automatically, so a single `python3 brand/tools/build.py`
is usually enough. Requirements: Python 3 + Pillow (for the `.ico`), Node 20+.
