/**
 * Apply Pokedex Diff Script
 *
 * Applies a JSON diff file (exported from the Admin Editor) to the pokedex
 * source files (gen1.ts through gen9.ts + forms.ts).
 *
 * Supported change types: naturalStars, summonable, baseStats, skillIds.
 *
 * Usage:
 *   npx tsx packages/shared/scripts/apply-pokedex-diff.ts <diff-file.json>
 *
 * Options:
 *   --dry-run   Show what would change without writing files
 *
 * Workflow:
 *   1. Open the Admin page (/admin) in the browser
 *   2. Make changes to Pokémon (stars, stats, skills, summonable)
 *   3. Click "Export Diff" — downloads a JSON file and copies to clipboard
 *   4. Run this script with the exported JSON file
 *   5. Verify changes with `git diff`
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POKEDEX_DIR = path.resolve(__dirname, '../src/data/pokedex');

// ─── Types ───────────────────────────────────────────────────────────────────

interface FieldChange<T = number> {
  from: T;
  to: T;
}

interface DiffEntry {
  id: number;
  name: string;
  file: string;
  changes: {
    naturalStars?: FieldChange;
    summonable?: FieldChange<boolean>;
    baseStats?: Record<string, FieldChange>;
    skillIds?: FieldChange<string[]>;
  };
}

interface DiffFile {
  generatedAt: string;
  totalChanges: number;
  changes: DiffEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveFile(relativePath: string): string {
  // The diff file stores paths like "packages/shared/src/data/pokedex/gen1.ts"
  // Resolve relative to repo root
  return path.resolve(__dirname, '../../..', relativePath);
}

/**
 * Build a regex that matches a Pokémon entry block by name,
 * then replaces a specific field value within that block.
 *
 * The entry block starts with `name: 'PokemonName'` and ends at the next
 * closing `},` (end of the object in the array).
 */
function replaceFieldInEntry(
  content: string,
  name: string,
  field: string,
  fromStr: string,
  toStr: string,
): { content: string; replaced: boolean } {
  const escapedName = name.replace(/[.*+?${}()|[\]\\]/g, '\\$&');

  // Match from `name: 'X',` through the field, stopping before the entry ends
  const pattern = new RegExp(
    `(name: '${escapedName}',[\\s\\S]*?${field}: )${escapeRegex(fromStr)}`
  );

  if (!pattern.test(content)) {
    return { content, replaced: false };
  }

  return {
    content: content.replace(pattern, `$1${toStr}`),
    replaced: true,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?${}()|[\]\\]/g, '\\$&');
}

function formatSkillIds(ids: string[]): string {
  return `[${ids.map(id => `'${id}'`).join(', ')}]`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const diffPath = args.find(a => !a.startsWith('--'));

  if (!diffPath) {
    console.error('Usage: npx tsx packages/shared/scripts/apply-pokedex-diff.ts <diff-file.json> [--dry-run]');
    process.exit(1);
  }

  const resolvedDiffPath = path.resolve(diffPath);
  if (!fs.existsSync(resolvedDiffPath)) {
    console.error(`File not found: ${resolvedDiffPath}`);
    process.exit(1);
  }

  const diff: DiffFile = JSON.parse(fs.readFileSync(resolvedDiffPath, 'utf8'));
  console.log(`\nDiff from ${diff.generatedAt} — ${diff.totalChanges} change(s)`);
  if (dryRun) console.log('(dry run — no files will be modified)\n');
  else console.log();

  // Group changes by file for efficiency
  const byFile = new Map<string, DiffEntry[]>();
  for (const entry of diff.changes) {
    const file = entry.file;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file)!.push(entry);
  }

  let totalApplied = 0;
  let totalFailed = 0;

  for (const [relPath, entries] of byFile) {
    const filePath = resolveFile(relPath);
    if (!fs.existsSync(filePath)) {
      console.error(`  SKIP ${relPath} — file not found`);
      totalFailed += entries.length;
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fileApplied = 0;
    let fileFailed = 0;

    for (const entry of entries) {
      const { id, name, changes } = entry;
      const prefix = `  #${String(id).padStart(4, '0')} ${name.padEnd(14)}`;
      const results: string[] = [];
      let entryOk = true;

      // naturalStars
      if (changes.naturalStars) {
        const { from, to } = changes.naturalStars;
        const res = replaceFieldInEntry(content, name, 'naturalStars', String(from), String(to));
        if (res.replaced) {
          content = res.content;
          results.push(`stars ${from}→${to}`);
        } else {
          results.push(`stars ${from}→${to} FAILED`);
          entryOk = false;
        }
      }

      // summonable
      if (changes.summonable) {
        const { from, to } = changes.summonable;
        const res = replaceFieldInEntry(content, name, 'summonable', String(from), String(to));
        if (res.replaced) {
          content = res.content;
          results.push(`summonable ${from}→${to}`);
        } else {
          results.push(`summonable ${from}→${to} FAILED`);
          entryOk = false;
        }
      }

      // baseStats
      if (changes.baseStats) {
        for (const [stat, change] of Object.entries(changes.baseStats)) {
          const { from, to } = change;
          const res = replaceFieldInEntry(content, name, stat, String(from), String(to));
          if (res.replaced) {
            content = res.content;
            results.push(`${stat} ${from}→${to}`);
          } else {
            results.push(`${stat} ${from}→${to} FAILED`);
            entryOk = false;
          }
        }
      }

      // skillIds
      if (changes.skillIds) {
        const { from, to } = changes.skillIds;
        const fromStr = formatSkillIds(from);
        const toStr = formatSkillIds(to);
        const res = replaceFieldInEntry(content, name, 'skillIds', fromStr, toStr);
        if (res.replaced) {
          content = res.content;
          results.push(`skills changed`);
        } else {
          results.push(`skills FAILED`);
          entryOk = false;
        }
      }

      if (entryOk) {
        fileApplied++;
        console.log(`${prefix} ✓  ${results.join(', ')}`);
      } else {
        fileFailed++;
        console.log(`${prefix} ✗  ${results.join(', ')}`);
      }
    }

    if (!dryRun && fileApplied > 0) {
      fs.writeFileSync(filePath, content);
    }

    const fileName = path.basename(relPath);
    console.log(`  ${fileName}: ${fileApplied} applied, ${fileFailed} failed\n`);
    totalApplied += fileApplied;
    totalFailed += fileFailed;
  }

  console.log(`Done: ${totalApplied} applied, ${totalFailed} failed`);
  if (dryRun) console.log('(dry run — re-run without --dry-run to apply)');
  if (totalFailed > 0) process.exit(1);
}

main();
