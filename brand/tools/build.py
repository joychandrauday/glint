#!/usr/bin/env python3
"""
Glint brand asset builder.

Generates the whole brand kit from a single source of geometry:

    tokens.json            design tokens (colors + component boxes)
    colors.css             CSS custom properties
    glint-mark.svg         starburst mascot + 8 orbiting voxels
    glint-icon.svg         starburst mascot only (square app icon)
    glint-wordmark.svg     boxy 3D "Glint" wordmark
    glint-logo.svg         horizontal lockup (mark + wordmark)
    glint-logo-dark.svg    lockup on the deep-space background plate
    glint-app-icon.svg     rounded-square app tile
    icons/*.png            16 -> 1024 px app icons (true alpha)
    icons/glint-favicon.ico
    exports/*.png          2x renders for docs and slides

Everything is drawn from the same constants, so the SVGs and the raster
icons can never drift apart.

    python3 brand/tools/build.py
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image

# --------------------------------------------------------------------------
# Brand tokens
# --------------------------------------------------------------------------

C = {
    "lime": "#BDFB03",
    "cyan": "#0DE4F3",
    "violet": "#7D23D9",
    "magenta": "#CB4BF7",
    "yellow": "#FED02A",
    "coral": "#F57265",
    "ink": "#110939",
    "bg": "#0B0726",
}

ROOT = Path(__file__).resolve().parents[1]          # brand/
REPO = ROOT.parent                                   # repo root
SVG_DIR = ROOT
ICON_DIR = ROOT / "icons"

# --------------------------------------------------------------------------
# Core mascot geometry (640 x 640 canvas, star centred on 320,320)
# --------------------------------------------------------------------------

# Chunky 4-point starburst: square core + four blocky points.
STAR_D = "M320 100 L380 220 H420 V260 L540 320 L420 380 V420 H380 L320 540 L260 420 H220 V380 L100 320 L220 260 V220 H260 Z"

# Front-face facets (clipped to the star).
FACET_CYAN = [(248, 220), (220, 220), (220, 260), (100, 320),
              (220, 380), (220, 420), (248, 420)]
FACET_MAGENTA = [(320, 100), (380, 220), (420, 220), (420, 248), (320, 248)]
FACET_YELLOW = [(320, 540), (380, 420), (420, 420), (420, 392), (320, 392)]

# Face
EYE_L = (268, 252, 34, 44)
EYE_R = (338, 252, 34, 44)
GLINT_L = (278, 261, 10, 10)
GLINT_R = (348, 261, 10, 10)
CHEEK_L = (246, 314, 28, 14)
CHEEK_R = (366, 314, 28, 14)
SMILE = [(300, 324), (310, 343), (330, 343), (340, 324)]

STAR_STROKE = 13
STAR_DEPTH_STROKE = 9
EXTRUDE = (28, 34)          # voxel depth offset
ICON_SHIFT = (-13, -16)     # optically centre ink + extrusion in the 640 box

# --------------------------------------------------------------------------
# Orbiting voxels: (x, y, size, front, top, side)
# --------------------------------------------------------------------------

CUBES = [
    (452, 168, 50, "lime", "cyan", "violet"),
    (150, 148, 44, "cyan", "yellow", "violet"),
    (528, 238, 40, "coral", "yellow", "violet"),
    (70, 240, 46, "lime", "magenta", "violet"),
    (534, 418, 38, "cyan", "lime", "violet"),
    (133, 478, 48, "coral", "yellow", "violet"),
    (438, 492, 50, "yellow", "magenta", "violet"),
    (228, 552, 42, "cyan", "lime", "violet"),
]

CUBE_STROKE = 7

# --------------------------------------------------------------------------
# Wordmark geometry (cap height 100, baseline 100)
#
# One closed contour per glyph so the ink pass can be painted as a single
# silhouette (no seams where strokes would otherwise overlap).
# --------------------------------------------------------------------------

WM_STROKE = 7
WM_DEPTH = (15, 18)

G_D = "M0 0 H96 V24 H24 V76 H48 V52 H96 V100 H0 Z"
L_D = "M126 0 H150 V100 H126 Z"
I_STEM_D = "M182 32 H206 V100 H182 Z"
I_DOT_D = "M182 0 H206 V18 H182 Z"
N_D = "M238 28 H348 V100 H324 V52 H262 V100 H238 Z"
T_D = ("M370 14 H402 V0 H426 V14 H458 V36 H426 V84 H448 V100 "
       "H402 V36 H370 Z")

LETTERS = [
    (G_D, "lime"),
    (L_D, "lime"),
    (I_STEM_D, "cyan"),
    (I_DOT_D, "yellow"),
    (N_D, "lime"),
    (T_D, "lime"),
]

WM_BOX = (-6, -6, 490, 134)


# --------------------------------------------------------------------------
# SVG emitters
# --------------------------------------------------------------------------

def rect_svg(box, fill, rx=0):
    x, y, w, h = box
    r = f' rx="{rx}"' if rx else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"{r} fill="{fill}"/>'


def cube_svg(x, y, s, front, top, side):
    d = round(s * 0.36)
    top_pts = f"{x},{y} {x+d},{y-d} {x+s+d},{y-d} {x+s},{y}"
    side_pts = f"{x+s},{y} {x+s+d},{y-d} {x+s+d},{y+s-d} {x+s},{y+s}"
    return (
        f'<g stroke="{C["ink"]}" stroke-width="{CUBE_STROKE}" '
        f'stroke-linejoin="round">'
        f'<polygon points="{top_pts}" fill="{C[top]}"/>'
        f'<polygon points="{side_pts}" fill="{C[side]}"/>'
        f'<rect x="{x}" y="{y}" width="{s}" height="{s}" fill="{C[front]}"/>'
        f"</g>"
    )


def defs_svg():
    d_all = " ".join(p for p, _ in LETTERS)
    return (
        f'<path id="glint-star" d="{STAR_D}"/>'
        f'<clipPath id="glint-star-clip"><use href="#glint-star"/></clipPath>'
        f'<mask id="glint-wm-cutout" maskUnits="userSpaceOnUse" '
        f'x="-60" y="-60" width="600" height="240">'
        f'<rect x="-60" y="-60" width="600" height="240" fill="#fff"/>'
        f'<path d="{d_all}" fill="#000"/></mask>'
    )


def mascot_svg(shift=(0, 0)):
    """Starburst mascot: extrusion, faceted front face, expression."""
    sx, sy = shift
    ink = C["ink"]
    facets = "".join(
        f'<path d="M{" ".join(f"{x} {y}" for x, y in pts)} Z" fill="{col}"/>'
        for pts, col in [
            (FACET_CYAN, C["cyan"]),
            (FACET_MAGENTA, C["magenta"]),
            (FACET_YELLOW, C["yellow"]),
        ]
    )
    smile = f"M{SMILE[0][0]} {SMILE[0][1]} L{SMILE[1][0]} {SMILE[1][1]} H{SMILE[2][0]} L{SMILE[3][0]} {SMILE[3][1]}"
    return f"""<g transform="translate({sx} {sy})">
  <use href="#glint-star" x="{EXTRUDE[0]}" y="{EXTRUDE[1]}" fill="{C['violet']}" stroke="{ink}" stroke-width="{STAR_DEPTH_STROKE}" stroke-linejoin="round"/>
  <use href="#glint-star" fill="{ink}" stroke="{ink}" stroke-width="{STAR_STROKE}" stroke-linejoin="round"/>
  <use href="#glint-star" fill="{C['lime']}"/>
  <g clip-path="url(#glint-star-clip)">{facets}</g>
  {rect_svg(EYE_L, ink, 8)}
  {rect_svg(EYE_R, ink, 8)}
  {rect_svg(GLINT_L, "#FFFFFF", 2)}
  {rect_svg(GLINT_R, "#FFFFFF", 2)}
  {rect_svg(CHEEK_L, C['coral'], 7)}
  {rect_svg(CHEEK_R, C['coral'], 7)}
  <path d="{smile}" fill="none" stroke="{ink}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
</g>"""


def svg_doc(viewbox, body, title="Glint"):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" fill="none" role="img" aria-label="{title}">
<title>{title}</title>
<defs>{defs_svg()}</defs>
{body}
</svg>
"""


def wordmark_body():
    """Front-facing letters (each painted ink-silhouette first, colour second)."""
    d_all = " ".join(p for p, _ in LETTERS)
    out = [
        f'<g mask="url(#glint-wm-cutout)">'
        f'<g transform="translate({WM_DEPTH[0]} {WM_DEPTH[1]})" '
        f'fill="{C["violet"]}" stroke="{C["ink"]}" '
        f'stroke-width="{WM_STROKE}" stroke-linejoin="miter">'
        f'<path d="{d_all}"/></g></g>'
    ]
    for d, colour in LETTERS:
        out.append(
            f'<path d="{d}" fill="{C["ink"]}" stroke="{C["ink"]}" '
            f'stroke-width="{WM_STROKE}" stroke-linejoin="miter"/>'
            f'<path d="{d}" fill="{C[colour]}"/>'
        )
    return "\n".join(out)


def mark_svg():
    cubes = "\n".join(cube_svg(*c) for c in CUBES)
    body = mascot_svg(ICON_SHIFT) + "\n" + cubes
    return svg_doc("0 0 640 640", body, "Glint starburst mascot")


def icon_svg():
    return svg_doc("0 0 640 640", mascot_svg(ICON_SHIFT), "Glint")


def app_icon_svg():
    """Rounded-square app tile: deep-space plate + centred mascot."""
    return svg_doc(
        "0 0 1024 1024",
        f'<rect width="1024" height="1024" rx="224" fill="{C["bg"]}"/>'
        f'<g transform="translate(30.5 30.5) scale(1.5)">{mascot_svg(ICON_SHIFT)}</g>',
        "Glint app icon",
    )


def wordmark_svg():
    return svg_doc(" ".join(map(str, WM_BOX)), wordmark_body(), "Glint wordmark")


def logo_svg(dark=False):
    plate = f'<rect width="1380" height="500" fill="{C["bg"]}"/>' if dark else ""
    return svg_doc(
        "0 0 1380 500",
        f"""{plate}
<g transform="translate(10 -42) scale(0.8)">
{mascot_svg(ICON_SHIFT)}
{chr(10).join(cube_svg(*c) for c in CUBES)}
</g>
<g transform="translate(540 165) scale(1.7)">{wordmark_body()}</g>""",
        "Glint logo",
    )


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def write(path: Path, text: str):
    path.write_text(text, encoding="utf-8")
    print("  wrote", path.relative_to(REPO), flush=True)


def main():
    ICON_DIR.mkdir(parents=True, exist_ok=True)

    write(SVG_DIR / "glint-mark.svg", mark_svg())
    write(SVG_DIR / "glint-icon.svg", icon_svg())
    write(SVG_DIR / "glint-wordmark.svg", wordmark_svg())
    write(SVG_DIR / "glint-logo.svg", logo_svg())
    write(SVG_DIR / "glint-logo-dark.svg", logo_svg(dark=True))

    tokens = {
        "brand": "Glint",
        "colors": {
            "electricLime": C["lime"],
            "brightCyan": C["cyan"],
            "vividViolet": C["violet"],
            "electricMagenta": C["magenta"],
            "warmYellow": C["yellow"],
            "coralBlush": C["coral"],
            "deepVoidIndigo": C["ink"],
            "deepSpaceBackground": C["bg"],
        },
        "assets": {
            "fullLogo": {"file": "glint-logo.svg", "viewBox": [0, 0, 1380, 500]},
            "mark": {"file": "glint-mark.svg", "viewBox": [0, 0, 640, 640]},
            "icon": {"file": "glint-icon.svg", "viewBox": [0, 0, 640, 640]},
            "appIcon": {"file": "glint-app-icon.svg", "viewBox": [0, 0, 1024, 1024]},
            "wordmark": {"file": "glint-wordmark.svg", "viewBox": [-6, -6, 490, 134]},
        },
    }
    write(SVG_DIR / "tokens.json", json.dumps(tokens, indent=2) + "\n")

    write(SVG_DIR / "colors.css", f""":root {{
  --glint-lime: {C['lime']};
  --glint-cyan: {C['cyan']};
  --glint-violet: {C['violet']};
  --glint-magenta: {C['magenta']};
  --glint-yellow: {C['yellow']};
  --glint-coral: {C['coral']};
  --glint-ink: {C['ink']};
  --glint-bg-dark: {C['bg']};

  /* semantic aliases */
  --glint-face: var(--glint-lime);
  --glint-face-alt: var(--glint-cyan);
  --glint-depth: var(--glint-violet);
  --glint-highlight: var(--glint-magenta);
  --glint-spark: var(--glint-yellow);
  --glint-blush: var(--glint-coral);
  --glint-stroke: var(--glint-ink);
  --glint-surface: var(--glint-bg-dark);
}}
""")

    write(SVG_DIR / "glint-app-icon.svg", app_icon_svg())

    # rasterise with resvg (transparent PNGs)
    try:
        subprocess.run(
            ["node", str(ROOT / "tools" / "render-icons.mjs")],
            check=True,
            cwd=REPO,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        print("  ! PNG export skipped:", exc)
        return

    # multi-size favicon, downsampled from the 1024 master
    master = Image.open(ICON_DIR / "glint-1024.png").convert("RGBA")
    master.save(
        ICON_DIR / "glint-favicon.ico",
        sizes=[(n, n) for n in (16, 32, 48, 64, 128, 256)],
    )
    print("  wrote", (ICON_DIR / "glint-favicon.ico").relative_to(REPO))

if __name__ == "__main__":
    main()
