import { create } from 'zustand';
import type { PokemonTemplate, PokemonType, BaseStats, SkillDefinition } from '@gatchamon/shared';
import { POKEDEX, SKILLS, STAR_MULTIPLIERS } from '@gatchamon/shared';

export interface PokemonDiff {
  naturalStars?: 1 | 2 | 3 | 4 | 5;
  baseStats?: Partial<BaseStats>;
  summonable?: boolean;
  skillIds?: [string, string, string];
  customSkills?: Record<string, SkillDefinition>;
}

type SortBy = 'id' | 'stars' | 'name';
type SummonableFilter = 'all' | 'yes' | 'no';
type GenFilter = null | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function getGeneration(id: number): number {
  if (id >= 10000) return getGeneration(id % 1000);
  if (id >= 906) return 9;
  if (id >= 810) return 8;
  if (id >= 722) return 7;
  if (id >= 650) return 6;
  if (id >= 494) return 5;
  if (id >= 388) return 4;
  if (id >= 252) return 3;
  if (id >= 152) return 2;
  return 1;
}

interface AdminState {
  diffs: Map<number, PokemonDiff>;
  selectedId: number | null;
  searchQuery: string;
  typeFilter: PokemonType | null;
  starFilter: number | null;
  summonableFilter: SummonableFilter;
  sortBy: SortBy;
  genFilter: GenFilter;
  showForms: boolean;
  changesOnly: boolean;
  skillPickerSlot: number | null; // null = closed, 0/1/2 = which slot

  setSelectedId: (id: number | null) => void;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (t: PokemonType | null) => void;
  setStarFilter: (s: number | null) => void;
  setSummonableFilter: (f: SummonableFilter) => void;
  setSortBy: (s: SortBy) => void;
  setGenFilter: (g: GenFilter) => void;
  setShowForms: (v: boolean) => void;
  setChangesOnly: (v: boolean) => void;
  setSkillPickerSlot: (slot: number | null) => void;

  setStars: (id: number, stars: 1 | 2 | 3 | 4 | 5) => void;
  setSummonable: (id: number, value: boolean) => void;
  setStat: (id: number, stat: keyof BaseStats, value: number) => void;
  setSkillId: (id: number, slotIndex: 0 | 1 | 2, skillId: string) => void;
  setCustomSkill: (pokemonId: number, slotIndex: 0 | 1 | 2, skill: SkillDefinition) => void;
  getEffectiveSkill: (template: PokemonTemplate, slotIndex: number) => SkillDefinition | null;
  resetPokemon: (id: number) => void;
  resetAll: () => void;
  exportDiff: () => string;
  importDiff: (json: string) => void;
  getEffective: (template: PokemonTemplate) => PokemonTemplate;
  getDiffCount: () => number;
}

const originalMap = new Map<number, PokemonTemplate>(
  POKEDEX.map(p => [p.id, p])
);

function getGenFile(id: number): string {
  const base = 'packages/shared/src/data/pokedex/';
  if (id >= 10000) return base + 'forms.ts';
  if (id >= 906) return base + 'gen9.ts';
  if (id >= 810) return base + 'gen8.ts';
  if (id >= 722) return base + 'gen7.ts';
  if (id >= 650) return base + 'gen6.ts';
  if (id >= 494) return base + 'gen5.ts';
  if (id >= 388) return base + 'gen4.ts';
  if (id >= 252) return base + 'gen3.ts';
  if (id >= 152) return base + 'gen2.ts';
  return base + 'gen1.ts';
}

function cleanDiff(id: number, diff: PokemonDiff): PokemonDiff | null {
  const orig = originalMap.get(id);
  if (!orig) return null;

  const cleaned: PokemonDiff = {};
  let hasChanges = false;

  if (diff.naturalStars !== undefined && diff.naturalStars !== orig.naturalStars) {
    cleaned.naturalStars = diff.naturalStars;
    hasChanges = true;
  }

  const origSummonable = orig.summonable ?? true;
  if (diff.summonable !== undefined && diff.summonable !== origSummonable) {
    cleaned.summonable = diff.summonable;
    hasChanges = true;
  }

  if (diff.baseStats) {
    const statDiff: Partial<BaseStats> = {};
    let hasStatChanges = false;
    for (const key of Object.keys(diff.baseStats) as (keyof BaseStats)[]) {
      if (diff.baseStats[key] !== undefined && diff.baseStats[key] !== orig.baseStats[key]) {
        statDiff[key] = diff.baseStats[key];
        hasStatChanges = true;
      }
    }
    if (hasStatChanges) {
      cleaned.baseStats = statDiff;
      hasChanges = true;
    }
  }

  if (diff.skillIds) {
    const origSkills = orig.skillIds;
    if (diff.skillIds[0] !== origSkills[0] || diff.skillIds[1] !== origSkills[1] || diff.skillIds[2] !== origSkills[2]) {
      cleaned.skillIds = diff.skillIds;
      hasChanges = true;
    }
  }

  if (diff.customSkills && Object.keys(diff.customSkills).length > 0) {
    cleaned.customSkills = diff.customSkills;
    hasChanges = true;
  }

  return hasChanges ? cleaned : null;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  diffs: new Map(),
  selectedId: null,
  searchQuery: '',
  typeFilter: null,
  starFilter: null,
  summonableFilter: 'all',
  sortBy: 'id',
  genFilter: null,
  showForms: false,
  changesOnly: false,
  skillPickerSlot: null,

  setSelectedId: (id) => set({ selectedId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setTypeFilter: (t) => set({ typeFilter: t }),
  setStarFilter: (s) => set({ starFilter: s }),
  setSummonableFilter: (f) => set({ summonableFilter: f }),
  setSortBy: (s) => set({ sortBy: s }),
  setGenFilter: (g) => set({ genFilter: g }),
  setShowForms: (v) => set({ showForms: v }),
  setChangesOnly: (v) => set({ changesOnly: v }),
  setSkillPickerSlot: (slot) => set({ skillPickerSlot: slot }),

  setStars: (id, stars) => {
    const { diffs } = get();
    const orig = originalMap.get(id);
    if (!orig) return;
    const newDiffs = new Map(diffs);
    const existing = newDiffs.get(id) ?? {};
    const oldStars = existing.naturalStars ?? orig.naturalStars;

    let updated: PokemonDiff;
    if (oldStars !== stars) {
      const ratio = (STAR_MULTIPLIERS[stars] ?? 1) / (STAR_MULTIPLIERS[oldStars] ?? 1);
      const curHp = existing.baseStats?.hp ?? orig.baseStats.hp;
      const curAtk = existing.baseStats?.atk ?? orig.baseStats.atk;
      const curDef = existing.baseStats?.def ?? orig.baseStats.def;
      updated = {
        ...existing,
        naturalStars: stars,
        baseStats: {
          ...existing.baseStats,
          hp: Math.round(curHp * ratio),
          atk: Math.round(curAtk * ratio),
          def: Math.round(curDef * ratio),
        },
      };
    } else {
      updated = { ...existing, naturalStars: stars };
    }

    const cleaned = cleanDiff(id, updated);
    if (cleaned) newDiffs.set(id, cleaned);
    else newDiffs.delete(id);
    set({ diffs: newDiffs });
  },

  setSummonable: (id, value) => {
    const { diffs } = get();
    const newDiffs = new Map(diffs);
    const existing = newDiffs.get(id) ?? {};
    const updated = { ...existing, summonable: value };
    const cleaned = cleanDiff(id, updated);
    if (cleaned) newDiffs.set(id, cleaned);
    else newDiffs.delete(id);
    set({ diffs: newDiffs });
  },

  setStat: (id, stat, value) => {
    const { diffs } = get();
    const newDiffs = new Map(diffs);
    const existing = newDiffs.get(id) ?? {};
    const updated = {
      ...existing,
      baseStats: { ...existing.baseStats, [stat]: value },
    };
    const cleaned = cleanDiff(id, updated);
    if (cleaned) newDiffs.set(id, cleaned);
    else newDiffs.delete(id);
    set({ diffs: newDiffs });
  },

  setSkillId: (id, slotIndex, skillId) => {
    const { diffs } = get();
    const orig = originalMap.get(id);
    if (!orig) return;
    const newDiffs = new Map(diffs);
    const existing = newDiffs.get(id) ?? {};
    const currentSkills: [string, string, string] = existing.skillIds
      ? [...existing.skillIds]
      : [...orig.skillIds];
    currentSkills[slotIndex] = skillId;
    const updated = { ...existing, skillIds: currentSkills };
    const cleaned = cleanDiff(id, updated);
    if (cleaned) newDiffs.set(id, cleaned);
    else newDiffs.delete(id);
    set({ diffs: newDiffs });
  },

  setCustomSkill: (pokemonId, slotIndex, skill) => {
    const { diffs } = get();
    const orig = originalMap.get(pokemonId);
    if (!orig) return;
    const newDiffs = new Map(diffs);
    const existing = newDiffs.get(pokemonId) ?? {};
    const currentSkills: [string, string, string] = existing.skillIds
      ? [...existing.skillIds]
      : [...orig.skillIds];
    currentSkills[slotIndex] = skill.id;
    const updated: PokemonDiff = {
      ...existing,
      skillIds: currentSkills,
      customSkills: { ...existing.customSkills, [skill.id]: skill },
    };
    const cleaned = cleanDiff(pokemonId, updated);
    if (cleaned) newDiffs.set(pokemonId, cleaned);
    else newDiffs.delete(pokemonId);
    set({ diffs: newDiffs });
  },

  getEffectiveSkill: (template, slotIndex) => {
    const diff = get().diffs.get(template.id);
    const skillIds = diff?.skillIds ?? template.skillIds;
    const skillId = skillIds[slotIndex];
    if (diff?.customSkills?.[skillId]) return diff.customSkills[skillId];
    return SKILLS[skillId] ?? null;
  },

  resetPokemon: (id) => {
    const { diffs } = get();
    const newDiffs = new Map(diffs);
    newDiffs.delete(id);
    set({ diffs: newDiffs });
  },

  resetAll: () => set({ diffs: new Map() }),

  getDiffCount: () => get().diffs.size,

  getEffective: (template) => {
    const diff = get().diffs.get(template.id);
    if (!diff) return template;
    return {
      ...template,
      naturalStars: diff.naturalStars ?? template.naturalStars,
      summonable: diff.summonable ?? template.summonable,
      baseStats: { ...template.baseStats, ...diff.baseStats },
      skillIds: diff.skillIds ?? template.skillIds,
    };
  },

  exportDiff: () => {
    const { diffs } = get();
    const changes: unknown[] = [];

    for (const [id, diff] of diffs) {
      const orig = originalMap.get(id);
      if (!orig) continue;

      const entry: Record<string, unknown> = {
        id,
        name: orig.name,
        file: getGenFile(id),
        changes: {} as Record<string, unknown>,
      };
      const c = entry.changes as Record<string, unknown>;

      if (diff.naturalStars !== undefined) {
        c.naturalStars = { from: orig.naturalStars, to: diff.naturalStars };
      }
      if (diff.summonable !== undefined) {
        c.summonable = { from: orig.summonable ?? true, to: diff.summonable };
      }
      if (diff.baseStats) {
        const statChanges: Record<string, unknown> = {};
        for (const key of Object.keys(diff.baseStats) as (keyof BaseStats)[]) {
          if (diff.baseStats[key] !== undefined) {
            statChanges[key] = { from: orig.baseStats[key], to: diff.baseStats[key] };
          }
        }
        c.baseStats = statChanges;
      }
      if (diff.skillIds) {
        c.skillIds = { from: orig.skillIds, to: diff.skillIds };
      }
      if (diff.customSkills && Object.keys(diff.customSkills).length > 0) {
        c.customSkills = diff.customSkills;
      }

      changes.push(entry);
    }

    changes.sort((a: any, b: any) => a.id - b.id);

    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalChanges: changes.length,
      changes,
    }, null, 2);
  },

  importDiff: (json) => {
    try {
      const data = JSON.parse(json);
      const arr = data.changes ?? data;
      if (!Array.isArray(arr)) return;

      const newDiffs = new Map<number, PokemonDiff>();

      for (const entry of arr) {
        const id = entry.id;
        const orig = originalMap.get(id);
        if (!orig || !entry.changes) continue;

        const diff: PokemonDiff = {};
        const c = entry.changes;

        if (c.naturalStars) {
          diff.naturalStars = c.naturalStars.to ?? c.naturalStars;
        }
        if (c.summonable) {
          diff.summonable = c.summonable.to ?? c.summonable;
        }
        if (c.baseStats) {
          const stats: Partial<BaseStats> = {};
          for (const key of Object.keys(c.baseStats) as (keyof BaseStats)[]) {
            const val = c.baseStats[key];
            stats[key] = typeof val === 'object' ? val.to : val;
          }
          diff.baseStats = stats;
        }
        if (c.skillIds) {
          diff.skillIds = c.skillIds.to ?? c.skillIds;
        }
        if (c.customSkills) {
          diff.customSkills = c.customSkills;
        }

        const cleaned = cleanDiff(id, diff);
        if (cleaned) newDiffs.set(id, cleaned);
      }

      set({ diffs: newDiffs });
    } catch {
      console.error('[admin] Invalid JSON in diff paste');
    }
  },
}));
