import { useEffect, useRef, useCallback } from 'react';
import { AnimationEngine } from './animations/animation-engine';
import { AudioManager } from './animations/audio-manager';
import { registerAllMoves } from './animations/moves';
import { skillNameToSlug, resolveAnimationCategory } from './animations/move-registry';
import { SKILLS } from '@gatchamon/shared';
import type { BattleLogEntry } from '@gatchamon/shared';

interface UseBattleAnimationReturn {
	playLogEntry: (entry: BattleLogEntry) => Promise<void>;
}

export function useBattleAnimation(
	arenaElement: HTMLDivElement | null,
	monRefs: React.RefObject<Map<string, HTMLElement>>
): UseBattleAnimationReturn {
	const engineRef = useRef<AnimationEngine | null>(null);
	const audioRef = useRef<AudioManager | null>(null);

	useEffect(() => {
		if (!arenaElement) return;

		const engine = new AnimationEngine(arenaElement);
		engine.initialize();
		registerAllMoves(engine);
		engineRef.current = engine;

		const audio = new AudioManager(4, 0.5);
		audioRef.current = audio;

		// Preload common effects
		engine['effectPool'].preload([
			'impact', 'fire', 'water', 'thunder', 'leaf', 'ice',
			'buff', 'debuff', 'heal', 'fist', 'slash', 'wind',
			'poison', 'rock', 'shadowball', 'lightball'
		]);

		return () => {
			engine.cancelAll();
			audio.stopAll();
			engineRef.current = null;
			audioRef.current = null;
		};
	}, [arenaElement]);

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

		// Play effectiveness SFX
		if (entry.damage > 0) {
			if (entry.effectiveness > 1) {
				audio?.playBattleSound('hit-super-effective');
			} else if (entry.effectiveness < 1 && entry.effectiveness > 0) {
				audio?.playBattleSound('hit-not-very-effective');
			} else if (entry.effectiveness === 1) {
				audio?.playBattleSound('hit-normal');
			}
		}
	}, [monRefs]);

	return { playLogEntry };
}
