import { useEffect, useRef, useCallback } from 'react';
import { AnimationEngine } from './animations/animation-engine';
import { AudioManager } from './animations/audio-manager';
import { registerAllMoves, EFFECT_ANIMATIONS } from './animations/moves';
import { skillNameToSlug, resolveAnimationCategory } from './animations/move-registry';
import { SKILLS } from '@gatchamon/shared';
import type { BattleLogEntry } from '@gatchamon/shared';
import { haptic } from '../utils/haptics';

interface UseBattleAnimationReturn {
	playLogEntry: (entry: BattleLogEntry) => Promise<void>;
	playMultiTargetEntries: (entries: BattleLogEntry[]) => Promise<void>;
}

export function useBattleAnimation(
	arenaElement: HTMLDivElement | null,
	monRefs: React.RefObject<Map<string, HTMLElement>>,
	options?: { muted?: boolean },
): UseBattleAnimationReturn {
	const engineRef = useRef<AnimationEngine | null>(null);
	const audioRef = useRef<AudioManager | null>(null);
	const muted = options?.muted ?? false;

	useEffect(() => {
		if (!arenaElement) return;

		const engine = new AnimationEngine(arenaElement);
		engine.initialize();
		registerAllMoves(engine);
		engineRef.current = engine;

		const audio = muted ? null : new AudioManager(4, 0.5);
		audioRef.current = audio;

		// Preload common effects
		engine['effectPool'].preload([
			'impact', 'fire', 'water', 'thunder', 'leaf', 'ice',
			'buff', 'debuff', 'heal', 'fist', 'slash', 'wind',
			'poison', 'rock', 'shadowball', 'lightball'
		]);

		return () => {
			engine.cancelAll();
			audio?.stopAll();
			engineRef.current = null;
			audioRef.current = null;
		};
	}, [arenaElement, muted]);

	const playLogEntry = useCallback(async (entry: BattleLogEntry) => {
		const engine = engineRef.current;
		const audio = audioRef.current;
		const refs = monRefs.current;
		if (!engine || !refs) return;

		const skillDef = SKILLS[entry.skillUsed];
		const slug = skillNameToSlug(entry.skillName);
		const moveCategory = resolveAnimationCategory(slug, skillDef);
		const moveType = skillDef?.type ?? 'normal';

		const attackerEl = refs.get(entry.actorId);
		const defenderEl = refs.get(entry.targetId);

		if (!attackerEl || !defenderEl) return;

		const attacker = {
			instanceId: entry.actorId,
			element: attackerEl,
			isPlayer: !!entry.actorId // will be refined below
		};

		const defender = {
			instanceId: entry.targetId,
			element: defenderEl,
			isPlayer: false
		};

		// Determine sides by checking if attacker and defender are in player/enemy fields
		const attackerField = attackerEl.closest('.player-field');
		const defenderField = defenderEl.closest('.player-field');
		attacker.isPlayer = !!attackerField;
		defender.isPlayer = !!defenderField;

		// Fire audio (don't await — let it play alongside animation)
		audio?.playMoveSound(slug);

		// Play visual animation
		await engine.playMove({
			attacker,
			defender,
			moveName: slug,
			moveCategory,
			moveType,
		});

		// Play one-shot effect animations for applied effects
		if (entry.effects && entry.effects.length > 0) {
			const effectPromises: Promise<void>[] = [];
			for (const effectId of entry.effects) {
				const effectAnim = EFFECT_ANIMATIONS[effectId];
				if (effectAnim) {
					// Determine target: buffs/heals play on attacker's side, debuffs on defender
					const isSelfEffect = ['heal', 'atb_boost', 'cd_reset', 'cd_reduce', 'cleanse',
						'atk_buff', 'def_buff', 'spd_buff', 'crit_rate_buff', 'immunity',
						'invincibility', 'endure', 'shield', 'reflect', 'counter', 'recovery', 'vampire'].includes(effectId);
					const target = isSelfEffect ? attacker : defender;
					effectPromises.push(effectAnim(engine, target));
				}
			}
			if (effectPromises.length > 0) {
				await Promise.all(effectPromises);
			}
		}

		// Play effectiveness SFX + haptic feedback on hits
		if (entry.damage > 0) {
			if (entry.effectiveness > 1) {
				audio?.playBattleSound('hit-super-effective');
				haptic.impact();
			} else if (entry.effectiveness < 1 && entry.effectiveness > 0) {
				audio?.playBattleSound('hit-not-very-effective');
				haptic.tap();
			} else if (entry.effectiveness === 1) {
				audio?.playBattleSound('hit-normal');
				haptic.medium();
			}
			if (entry.isCrit) haptic.double();
		}
	}, [monRefs]);

	const playMultiTargetEntries = useCallback(async (entries: BattleLogEntry[]) => {
		const engine = engineRef.current;
		const audio = audioRef.current;
		const refs = monRefs.current;
		if (!engine || !refs || entries.length === 0) return;

		const firstEntry = entries[0];
		const skillDef = SKILLS[firstEntry.skillUsed];
		const slug = skillNameToSlug(firstEntry.skillName);
		const moveCategory = resolveAnimationCategory(slug, skillDef);
		const moveType = skillDef?.type ?? 'normal';

		const attackerEl = refs.get(firstEntry.actorId);
		if (!attackerEl) return;

		const attacker = {
			instanceId: firstEntry.actorId,
			element: attackerEl,
			isPlayer: !!attackerEl.closest('.player-field'),
		};

		const defenders = entries
			.map(entry => {
				const el = refs.get(entry.targetId);
				if (!el) return null;
				return {
					instanceId: entry.targetId,
					element: el,
					isPlayer: !!el.closest('.player-field'),
				};
			})
			.filter((d): d is NonNullable<typeof d> => d !== null);

		if (defenders.length === 0) return;

		audio?.playMoveSound(slug);

		await engine.playMove({
			attacker,
			defender: defenders,
			moveName: slug,
			moveCategory,
			moveType,
		});

		// Play one-shot effect animations for applied effects on each target
		const effectPromises: Promise<void>[] = [];
		for (let i = 0; i < entries.length; i++) {
			const logEntry = entries[i];
			const target = defenders[i];
			if (!logEntry.effects || logEntry.effects.length === 0 || !target) continue;

			for (const effectId of logEntry.effects) {
				const effectAnim = EFFECT_ANIMATIONS[effectId];
				if (effectAnim) {
					const isSelfEffect = ['heal', 'atb_boost', 'cd_reset', 'cd_reduce', 'cleanse',
						'atk_buff', 'def_buff', 'spd_buff', 'crit_rate_buff', 'immunity',
						'invincibility', 'endure', 'shield', 'reflect', 'counter', 'recovery', 'vampire'].includes(effectId);
					effectPromises.push(effectAnim(engine, isSelfEffect ? attacker : target));
				}
			}
		}
		if (effectPromises.length > 0) {
			await Promise.all(effectPromises);
		}

		// Play best effectiveness SFX
		const hasDamage = entries.some(e => e.damage > 0);
		if (hasDamage) {
			const bestEffectiveness = Math.max(...entries.map(e => e.effectiveness));
			if (bestEffectiveness > 1) {
				audio?.playBattleSound('hit-super-effective');
			} else if (bestEffectiveness < 1 && bestEffectiveness > 0) {
				audio?.playBattleSound('hit-not-very-effective');
			} else if (bestEffectiveness === 1) {
				audio?.playBattleSound('hit-normal');
			}
		}
	}, [monRefs]);

	return { playLogEntry, playMultiTargetEntries };
}
