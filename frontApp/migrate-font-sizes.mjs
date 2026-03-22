#!/usr/bin/env node
/**
 * migrate-font-sizes.mjs
 * ──────────────────────
 * Recorre todos los archivos JSX del proyecto y reemplaza las clases
 * de fuente por debajo del mínimo recomendado (11px).
 *
 * Uso:
 *   node migrate-font-sizes.mjs          → modo dry-run (solo muestra cambios)
 *   node migrate-font-sizes.mjs --write  → aplica los cambios
 *
 * Tabla de reemplazos:
 *   text-[8px]  → text-[11px]   (estaba 3px bajo el mínimo)
 *   text-[9px]  → text-[11px]   (estaba 2px bajo el mínimo)
 *   text-[10px] → text-[11px]   (estaba 1px bajo el mínimo)
 *
 * Excepción: text-[10px] en el sidebar y headers puede quedar en 11px sin problema.
 * Si quieres preservar algún caso específico, agrégalo al array EXCEPTIONS abajo.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

const WRITE_MODE  = process.argv.includes("--write")
const SRC_DIR     = "./src"
const EXTENSIONS  = [".jsx", ".tsx", ".js", ".ts"]

// Pares [patrón regex, reemplazo]
const REPLACEMENTS = [
  [/text-\[8px\]/g,  "text-[11px]"],
  [/text-\[9px\]/g,  "text-[11px]"],
  [/text-\[10px\]/g, "text-[11px]"],
]

// Archivos a saltar (si hay alguno que intencionalmente use fuentes micro)
const EXCEPTIONS = []

let totalFiles   = 0
let changedFiles = 0

function walkDir(dir) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat     = statSync(fullPath)
    if (stat.isDirectory()) {
      walkDir(fullPath)
    } else if (EXTENSIONS.includes(extname(entry))) {
      processFile(fullPath)
    }
  }
}

function processFile(filePath) {
  if (EXCEPTIONS.some(exc => filePath.includes(exc))) return

  const original = readFileSync(filePath, "utf-8")
  let modified   = original

  for (const [pattern, replacement] of REPLACEMENTS) {
    modified = modified.replace(pattern, replacement)
  }

  if (modified !== original) {
    totalFiles++
    changedFiles++
    if (WRITE_MODE) {
      writeFileSync(filePath, modified, "utf-8")
      console.log(`✅ Actualizado: ${filePath}`)
    } else {
      console.log(`📋 Cambios pendientes en: ${filePath}`)
      // Mostrar qué cambiaría
      const lines = original.split("\n")
      lines.forEach((line, i) => {
        const newLine = REPLACEMENTS.reduce((l, [p, r]) => l.replace(p, r), line)
        if (newLine !== line) {
          console.log(`   Línea ${i + 1}: ${line.trim()}`)
          console.log(`   →          ${newLine.trim()}`)
        }
      })
    }
  }
}

walkDir(SRC_DIR)

console.log(`\n──────────────────────────────────`)
console.log(`Archivos con cambios: ${changedFiles}`)
if (!WRITE_MODE) {
  console.log(`\nEjecuta con --write para aplicar los cambios:`)
  console.log(`  node migrate-font-sizes.mjs --write`)
} else {
  console.log(`Migración completada.`)
}