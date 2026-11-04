#!/usr/bin/env node
/**
 * Rasterise the Glint SVGs into production PNGs (true alpha) with resvg.
 *
 *   node brand/tools/render-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const brand = resolve(here, "..");
const icons = resolve(brand, "icons");
const exportsDir = resolve(brand, "exports");

mkdirSync(icons, { recursive: true });
mkdirSync(exportsDir, { recursive: true });

const render = (file, width, out) => {
  const svg = readFileSync(file, "utf8");
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } })
    .render()
    .asPng();
  writeFileSync(out, png);
  console.log("  wrote", out.replace(brand + "/", ""));
};

const icon = resolve(brand, "glint-icon.svg");
const appIcon = resolve(brand, "glint-app-icon.svg");

for (const size of [16, 32, 48, 64, 128, 256, 512, 1024]) {
  render(icon, size, resolve(icons, `glint-${size}.png`));
}
for (const size of [256, 512, 1024]) {
  render(appIcon, size, resolve(icons, `glint-app-${size}.png`));
}

// marketing / docs exports
render(resolve(brand, "glint-logo.svg"), 1380, resolve(exportsDir, "glint-logo@2x.png"));
render(resolve(brand, "glint-logo-dark.svg"), 1380, resolve(exportsDir, "glint-logo-dark@2x.png"));
render(resolve(brand, "glint-mark.svg"), 1280, resolve(exportsDir, "glint-mark@2x.png"));
render(resolve(brand, "glint-wordmark.svg"), 980, resolve(exportsDir, "glint-wordmark@2x.png"));
