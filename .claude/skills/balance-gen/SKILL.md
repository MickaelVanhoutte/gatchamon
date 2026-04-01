---
name: balance-gen
description: Rebalance all monster skills and stats for a Pokemon generation
disable-model-invocation: true
argument-hint: <gen-number>
---

# Balance Generation $ARGUMENTS

Rebalance all monster skills and stats for Gen $ARGUMENTS following the established process.

## Files

- **Skills:** `packages/shared/src/data/skills/gen$ARGUMENTS.ts` — exports `GEN${ARGUMENTS}_SKILLS: Record<string, SkillDefinition>`
- **Pokedex:** `packages/shared/src/data/pokedex/gen$ARGUMENTS.ts` — exports `GEN${ARGUMENTS}: PokemonTemplate[]`
- **Types:** `packages/shared/src/types/pokemon.ts` — all type definitions (DO NOT modify)
- **Reference (Gen 1, already balanced):** `packages/shared/src/data/skills/gen1.ts`

## Phase 1: Audit

Read the current skills and pokedex files for this gen. Produce a diagnostic report:

1. **Move name fidelity** — Flag any skill name that is NOT a real Pokemon move/ability the specific Pokemon can learn
2. **Type-effect alignment** — Flag effects that don't match the Pokemon's type (see Type-Effect Table below)
3. **Balance violations** — Check:
   - No permanent effects (duration: 999) below 5-star
   - No AoE battle_start debuffs on enemies below 4-star
   - No revive on 1-star monsters
   - No triple-debuff combos (mark + expose + def_break) except 1 high-star specialist max
   - No turn_start AoE strip below 4-star
4. **Role clarity** — Flag monsters with incoherent kits (e.g. attacker stats but full support skills)
5. **Duplicate patterns** — Flag copy-paste skill sets across different Pokemon
6. **Effect coverage** — List which of the 62 effect IDs are NOT used in this gen

## Phase 2: Plan

Enter plan mode. Design the rework using these principles:

### Skill Structure Rules
- **S1 (basic):** `category: 'basic'`, `cooldown: 0`, `multiplier: 1`, `target: 'single_enemy'`
- **S2 (active):** `category: 'active'`, `cooldown: 2-4`, `multiplier: 1.2-2.4`
- **S3 (passive):** `category: 'passive'`, `cooldown: 0`, `multiplier: 0`, must have `passiveTrigger`
- **Skill IDs:** `{pokemon_name}_skill1`, `{pokemon_name}_skill2`, `{pokemon_name}_skill3`

### Move Name Rules
- S1 and S2 names must be real Pokemon moves the specific Pokemon can learn
- S3 names must be real Pokemon abilities the specific Pokemon can have
- Prefer the Pokemon's generation moves, but later-gen learnset moves are acceptable

### Type-Effect Alignment Table
| Type | Primary Effects |
|------|----------------|
| Fire | Burn, Brand, Detonate |
| Water | Heal, Cleanse, ATB manipulation |
| Grass | Recovery, Poison, drain/heal |
| Electric | Paralysis, ATB boost/reduce, SPD |
| Ice | Freeze, Slow, Anti-Heal |
| Poison | Poison, Bleed, Anti-Heal, Unrecoverable, Bomb |
| Psychic | Confusion, Sleep, Silence, Seal |
| Ghost | Oblivion, Silence, Bomb, Strip |
| Fighting | DEF Break, Provoke, Brand, raw damage |
| Bug | ACC Break, Glancing, status, debuff support |
| Rock/Ground | Shield, DEF, Provoke, Strip, DEF Break |
| Dragon | Self-buff, high damage, ATB |
| Fairy | Heal, Cleanse, Revive |
| Normal | Versatile utility |
| Flying | Speed, Evasion, ATB, AoE |
| Dark | Strip, Oblivion, Brand, steal_buff |
| Steel | Shield, DEF Buff, Immunity, Reflect |

### Balance Rules
- No AoE debuffs at `battle_start` for monsters below 4-star
- No permanent (duration: 999) effects below 5-star
- No triple-debuff combos (mark + expose + def_break) — limit to 1 high-star specialist max
- No revive on 1-star monsters
- `turn_start` AoE strip only allowed on 4+ star
- Low-stars must be useful via clear niche (speed buffer, cleanser, anti-heal specialist, etc.)
- Every monster should have a distinct role; avoid duplicate kits

### PassiveTrigger Options
`battle_start`, `turn_start`, `on_attack`, `on_hit`, `on_hit_received`, `on_crit`, `on_kill`, `on_ally_death`, `hp_threshold`, `always`

### Valid SkillTarget Options
`single_enemy`, `all_enemies`, `self`, `single_ally`, `all_allies`

### Stat Adjustment Guidelines
When a Pokemon's role changes significantly, adjust its baseStats:
- **Attackers:** High ATK, critRate, critDmg
- **Tanks:** High HP, DEF; low SPD acceptable
- **Healers/Supports:** High HP, RES; lower ATK
- **Speed supports:** High SPD
- **CC specialists:** High SPD, ACC
- **Debuffers:** High ACC, SPD

Present the plan as a table per Pokemon showing current vs proposed skills. Get user approval before proceeding.

## Phase 3: Implement

After plan approval, implement the changes:

1. **Batch by ~25 Pokemon per agent** — Launch parallel agents to generate skill definitions. Each agent gets:
   - The approved plan
   - The type definitions from `pokemon.ts`
   - A format example from the existing file
   - The specific Pokemon assignments

2. **Format per skill entry:**
```typescript
  // --- pokemon_name (type1/type2) ---
  pokemon_name_skill1: {
    id: 'pokemon_name_skill1',
    name: 'Move Name',
    description: 'Description of the move.',
    type: 'fire',
    category: 'basic',
    cooldown: 0,
    multiplier: 1,
    effects: [{ id: 'burn', value: 3, duration: 1, chance: 25 }],
    target: 'single_enemy',
  },
```

3. **Assemble** all agent outputs into the complete file with:
   - `import type { SkillDefinition } from '../../types/pokemon.js';`
   - `export const GEN${N}_SKILLS: Record<string, SkillDefinition> = { ... };`

4. **Apply stat adjustments** to the pokedex file for role-changed Pokemon.

## Phase 4: Verify

Run all checks:

1. **TypeScript compilation:** `npx tsc --noEmit -p packages/shared/tsconfig.json`
2. **Skill count:** Confirm exactly `(num_pokemon * 3)` skill definitions
3. **SkillId cross-reference:** Every skillId in the pokedex file exists in the skills file
4. **Balance audit (scripted):**
   - 0 permanent (999) effects on non-5-star
   - 0 AoE battle_start debuffs targeting enemies on sub-4-star
   - 0 revive on 1-star
5. **Effect coverage:** Count how many of the 62 effect IDs are used. Add missing effects to thematically appropriate Pokemon if below 50/62.

### Known Gotchas
- `crit_rate_buff` not `crit_buff`
- No `random_status` EffectId — use individual status effects (burn, freeze, paralysis) with separate chance values
- `target: 'attacker'` is NOT valid — for `on_hit_received` passives, use `target: 'self'` on the skill; the engine handles application to the attacker
- Chansey S1 uses `target: 'random_ally'` which is not in SkillTarget — verify if the engine supports this or use `single_ally`
- Farfetch'd skill ID is `farfetchd` (no apostrophe)
- Mr. Mime skill ID is `mrmime` (no underscore or period)
