import { physicalMoves } from './moves/physical';
import { specialMoves } from './moves/special';
import { statusMoves } from './moves/status';
import { otherMoves } from './moves/other';

/**
 * Convert a display name to a slug:
 * "Quick Attack" -> "quick-attack"
 * "Aerial Ace" -> "aerial-ace"
 * "X-Scissor" -> "x-scissor"
 * "Freeze-Dry" -> "freeze-dry"
 */
export function skillNameToSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

/**
 * Determine animation category for a skill based on the move registries.
 * Falls back to heuristics based on skill properties.
 */
export function resolveAnimationCategory(
	skillSlug: string,
	skillDef?: { multiplier: number; effects: unknown[]; target: string }
): 'physical' | 'special' | 'status' {
	if (physicalMoves[skillSlug]) return 'physical';
	if (specialMoves[skillSlug]) return 'special';
	if (statusMoves[skillSlug]) return 'status';
	if (otherMoves[skillSlug]) return 'physical';

	// Fallback heuristics
	if (skillDef) {
		if (skillDef.multiplier === 0 || skillDef.target === 'self' || skillDef.target === 'single_ally' || skillDef.target === 'all_allies') {
			return 'status';
		}
		if (skillDef.target === 'all_enemies') {
			return 'special';
		}
	}

	return 'physical';
}
