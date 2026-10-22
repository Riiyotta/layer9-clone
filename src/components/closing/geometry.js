// Isometric helpers for the closing stack illustration (572x687 viewBox).
// A slab is a rhombus top face (half-width w, half-height h) with a
// thickness t dropped below its two front edges.

const f = (n) => Math.round(n * 100) / 100

export function topFace(cx, cy, w, h) {
  return `M${f(cx)} ${f(cy - h)}L${f(cx + w)} ${f(cy)}L${f(cx)} ${f(cy + h)}L${f(cx - w)} ${f(cy)}Z`
}

export function leftFace(cx, cy, w, h, t) {
  return `M${f(cx - w)} ${f(cy)}L${f(cx)} ${f(cy + h)}L${f(cx)} ${f(cy + h + t)}L${f(cx - w)} ${f(cy + t)}Z`
}

export function rightFace(cx, cy, w, h, t) {
  return `M${f(cx)} ${f(cy + h)}L${f(cx + w)} ${f(cy)}L${f(cx + w)} ${f(cy + t)}L${f(cx)} ${f(cy + h + t)}Z`
}

// Short vertical ticks hanging off the two lower front edges (chip pins).
export function pins(cx, cy, w, h, t, n = 4, len = 6) {
  let d = ''
  for (let i = 1; i <= n; i++) {
    const k = i / (n + 1)
    const lx = cx - w + w * k
    const rx = cx + w * k
    const ly = cy + t + h * k
    const ry = cy + h + t - h * k
    d += `M${f(lx)} ${f(ly)}v${len}M${f(rx)} ${f(ry)}v${len}`
  }
  return d
}

// Maps a 100x100 glyph box onto the rhombus top face.
export function faceMatrix(cx, cy, w, h) {
  return `matrix(${f(w / 100)} ${f(h / 100)} ${f(-w / 100)} ${f(h / 100)} ${f(cx)} ${f(cy - h)})`
}
