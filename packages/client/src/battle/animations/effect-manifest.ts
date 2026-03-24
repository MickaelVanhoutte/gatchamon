import { assetUrl } from '../../utils/asset-url';

export interface EffectDefinition {
	path: string;
	frames: number;
	frameWidth: number;
	frameHeight: number;
	fps?: number;
}

export const EFFECT_MANIFEST: Record<string, EffectDefinition> = {
	impact: {
		path: assetUrl('fx/impact-sprite.png'),
		frames: 4,
		frameWidth: 192,
		frameHeight: 192
	},
	fire: {
		path: assetUrl('fx/fire-sprite.png'),
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	thunder: {
		path: assetUrl('fx/thunder-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	slash: {
		path: assetUrl('fx/slash-sprite.png'),
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	water: {
		path: assetUrl('fx/water-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	ice: {
		path: assetUrl('fx/ice-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	fist: {
		path: assetUrl('fx/fist-sprite.png'),
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	foot: {
		path: assetUrl('fx/foot-sprite.png'),
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	claws: {
		path: assetUrl('fx/claws-sprite.png'),
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	crunch: {
		path: assetUrl('fx/crunch-sprite.png'),
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	heal: {
		path: assetUrl('fx/heal-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	buff: {
		path: assetUrl('fx/buff-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	debuff: {
		path: assetUrl('fx/debuff-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	psychic: {
		path: assetUrl('fx/debuff-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	rock: {
		path: assetUrl('fx/rock-sprite.png'),
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	leaf: {
		path: assetUrl('fx/leaf-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	poison: {
		path: assetUrl('fx/poison-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	wind: {
		path: assetUrl('fx/wind-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	shadowball: {
		path: assetUrl('fx/shadowball-sprite.png'),
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	lightball: {
		path: assetUrl('fx/lightball-sprite.png'),
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	drain: {
		path: assetUrl('fx/drain-sprite.png'),
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	}
};

export function getEffectDefinition(effectName: string): EffectDefinition | undefined {
	return EFFECT_MANIFEST[effectName];
}
