import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const PRISMA_IMPORT_RE = /import\s*\{\s*prisma\s*\}\s*from\s*['"]/
const ALLOWED_DIRS = new RegExp([
  'src/lib/prisma\\.ts$',
  'prisma/',
  'scripts/',
  'tests/',
].join('|'))

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files.push(...collectTsFiles(full))
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

describe('no global prisma import outside allowed files', () => {
  const scanDirs = [
    path.join(process.cwd(), 'src', 'app'),
    path.join(process.cwd(), 'src', 'lib', 'auth'),
    path.join(process.cwd(), 'src', 'lib', 'actions'),
    path.join(process.cwd(), 'src', 'lib', 'audit'),
  ]

  const badFiles: { file: string; line: number }[] = []

  for (const dir of scanDirs) {
    if (!fs.existsSync(dir)) continue
    for (const file of collectTsFiles(dir)) {
      if (ALLOWED_DIRS.test(file)) continue
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (PRISMA_IMPORT_RE.test(lines[i])) {
          badFiles.push({ file: path.relative(process.cwd(), file), line: i + 1 })
        }
      }
    }
  }

  it('no request-time file imports { prisma } directly (must use getPrisma)', () => {
    expect(badFiles).toEqual([])
  })
})
