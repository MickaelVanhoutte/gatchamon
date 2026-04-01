/**
 * Stat Rebalance Script
 *
 * Reads all pokedex files, reverse-engineers BST from existing stats,
 * applies the new compressed formula, and writes back.
 * SPD is preserved as-is (already well-compressed and game-speed-based).
 *
 * OLD formula: hp = 350 + scale*300, atk = 30 + scale*80, def = 30 + scale*70, etc.
 * NEW formula: hp = 450 + scale*200, atk = 60 + scale*50, def = 55 + scale*45, etc.
 *
 * Usage: node packages/shared/scripts/rebalance-stats.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POKEDEX_DIR = path.resolve(__dirname, '../src/data/pokedex');

// OLD formula constants (for reverse-engineering BST)
const OLD = {
  hp:       { base: 350, scale: 300 },
  atk:      { base: 30,  scale: 80  },
  def:      { base: 30,  scale: 70  },
  critRate: { base: 10,  scale: 12  },
  critDmg:  { base: 150, scale: 20  },
  acc:      { base: 85,  scale: 18  },
  res:      { base: 10,  scale: 14  },
};

// NEW formula constants (compressed ranges, higher floors)
const NEW = {
  hp:       { base: 450, scale: 200 },
  atk:      { base: 60,  scale: 50  },
  def:      { base: 55,  scale: 45  },
  critRate: { base: 14,  scale: 7   },
  critDmg:  { base: 157, scale: 12  },
  acc:      { base: 90,  scale: 11  },
  res:      { base: 15,  scale: 8   },
};

function reverseBstFromStat(statValue, formula) {
  // stat = floor(base + (bst/500) * scale)
  // bst ≈ (stat - base) / scale * 500
  return (statValue - formula.base) / formula.scale * 500;
}

function estimateBst(stats) {
  // Use multiple stats to estimate BST, take the median for robustness
  // against any manual tweaks we may have applied
  const estimates = [
    reverseBstFromStat(stats.hp, OLD.hp),
    reverseBstFromStat(stats.atk, OLD.atk),
    reverseBstFromStat(stats.def, OLD.def),
    reverseBstFromStat(stats.critRate, OLD.critRate),
    reverseBstFromStat(stats.critDmg, OLD.critDmg),
    reverseBstFromStat(stats.acc, OLD.acc),
    reverseBstFromStat(stats.res, OLD.res),
  ].sort((a, b) => a - b);

  // Take median
  return estimates[3];
}

function newMapStats(bst, oldSpd) {
  const scale = bst / 500;
  return {
    hp:       Math.floor(NEW.hp.base + scale * NEW.hp.scale),
    atk:      Math.floor(NEW.atk.base + scale * NEW.atk.scale),
    def:      Math.floor(NEW.def.base + scale * NEW.def.scale),
    spd:      oldSpd, // Preserve SPD — it's game-speed-based, already compressed
    critRate: Math.floor(NEW.critRate.base + scale * NEW.critRate.scale),
    critDmg:  Math.floor(NEW.critDmg.base + scale * NEW.critDmg.scale),
    acc:      Math.floor(NEW.acc.base + scale * NEW.acc.scale),
    res:      Math.floor(NEW.res.base + scale * NEW.res.scale),
  };
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Match baseStats blocks
  const regex = /baseStats:\s*\{([^}]+)\}/g;

  content = content.replace(regex, (match, inner) => {
    // Parse current stats
    const getNum = (key) => {
      const m = inner.match(new RegExp(key + ':\\s*(\\d+)'));
      return m ? parseInt(m[1]) : null;
    };

    const oldStats = {
      hp: getNum('hp'),
      atk: getNum('atk'),
      def: getNum('def'),
      spd: getNum('spd'),
      critRate: getNum('critRate'),
      critDmg: getNum('critDmg'),
      acc: getNum('acc'),
      res: getNum('res'),
    };

    if (!oldStats.hp) return match; // Skip if can't parse

    const bst = estimateBst(oldStats);
    const newStats = newMapStats(bst, oldStats.spd);

    changeCount++;

    return `baseStats: {
      hp: ${newStats.hp},
      atk: ${newStats.atk},
      def: ${newStats.def},
      spd: ${newStats.spd},
      critRate: ${newStats.critRate},
      critDmg: ${newStats.critDmg},
      acc: ${newStats.acc},
      res: ${newStats.res},
    }`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  return changeCount;
}

// Process all pokedex files
const files = fs.readdirSync(POKEDEX_DIR)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

let total = 0;
for (const file of files) {
  const filePath = path.join(POKEDEX_DIR, file);
  const count = processFile(filePath);
  console.log(`${file}: ${count} Pokemon updated`);
  total += count;
}
console.log(`\nTotal: ${total} Pokemon stats rebalanced`);
