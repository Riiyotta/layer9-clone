#!/usr/bin/env node
// measure_sections.mjs: measure every in-flow section's rendered height on every route of the BUILT
// clone at 1440px wide and (with --write) record it in extraction/measured-values.json -> sectionHeights.
//
// Selectors come from each section contract's source.domSelectors (the DOM trace); the routes and the
// section order come from templates/templates.json. Nothing is hardcoded here.
//
// Usage (the clone must already be built and served, e.g. `npx vite build` then `npx vite preview --port 5472`):
//   node extraction/measure_sections.mjs --base http://localhost:5472 [--playwright PATH_TO_playwright/index.mjs] [--write]
// --playwright is only needed when `playwright` is not importable from this folder (it is a measuring
// tool, not a dependency of the design-repo; the verifiers never run it).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.dirname(HERE)
const args = process.argv.slice(2)
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d }
const base = opt('--base', 'http://localhost:5472')
const write = args.includes('--write')
const VIEWPORT = { width: 1440, height: 900 }

const pw = opt('--playwright', null)
const { chromium } = await import(pw ? pathToFileURL(path.resolve(pw)).href : 'playwright')

const jl = (rel) => JSON.parse(fs.readFileSync(path.join(REPO, rel), 'utf8'))
const templates = jl('templates/templates.json')
const contracts = {}
for (const f of fs.readdirSync(path.join(REPO, 'sections'))) {
  if (f.endsWith('.json')) { const d = jl('sections/' + f); contracts[d.id] = d }
}

const browser = await chromium.launch()
const out = {}
for (const r of templates.routes) {
  const page = await browser.newPage({ viewport: VIEWPORT })
  await page.goto(base + r.path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const nodes = templates.templates[r.template].nodes
  const spec = nodes.map((n) => ({ id: n.section, inFlow: contracts[n.section].source.inFlow, sel: contracts[n.section].source.domSelectors }))
  const res = await page.evaluate((spec) => {
    const sections = {}
    for (const s of spec) {
      if (!s.inFlow) { sections[s.id] = null; continue }
      let top = Infinity, bottom = -Infinity, found = 0
      for (const sel of s.sel) {
        for (const el of document.querySelectorAll(sel)) {
          const b = el.getBoundingClientRect()
          top = Math.min(top, b.top + window.scrollY)
          bottom = Math.max(bottom, b.bottom + window.scrollY)
          found++
        }
      }
      sections[s.id] = found ? { heightPx: Math.round(bottom - top), topPx: Math.round(top), elements: found } : { heightPx: null, error: 'selector matched nothing' }
    }
    return { pageHeightPx: Math.round(document.documentElement.scrollHeight), sections }
  }, spec)
  out[r.path] = res
  await page.close()
}
await browser.close()

const rec = {
  viewport: VIEWPORT,
  method: 'Built clone (vite build + vite preview), headless Chromium via Playwright, networkidle + 1200ms settle, cookie consent unset. Section height = union span (min top to max bottom) of the elements matched by source.domSelectors in that section contract; overlays are position:fixed and not in flow (null). pageHeightPx = document.documentElement.scrollHeight.',
  measuredBy: 'extraction/measure_sections.mjs',
  routes: out,
}
if (write) {
  const p = path.join(HERE, 'measured-values.json')
  const d = JSON.parse(fs.readFileSync(p, 'utf8'))
  d.sectionHeights = Object.assign({ capturedOn: new Date().toISOString().slice(0, 10) }, rec)
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n')
  console.log('wrote sectionHeights to extraction/measured-values.json')
}
console.log(JSON.stringify(rec.routes, null, 1))
