export interface EffectDefinition {
	path: string;
	frames: number;
	frameWidth: number;
	frameHeight: number;
	fps?: number;
}

export const EFFECT_MANIFEST: Record<string, EffectDefinition> = {
	impact: {
		path: '/fx/impact-sprite.png',
		frames: 4,
		frameWidth: 192,
		frameHeight: 192
	},
	fire: {
		path: '/fx/fire-sprite.png',
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	thunder: {
		path: '/fx/thunder-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	slash: {
		path: '/fx/slash-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	water: {
		path: '/fx/water-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	ice: {
		path: '/fx/ice-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	fist: {
		path: '/fx/fist-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	foot: {
		path: '/fx/foot-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	claws: {
		path: '/fx/claws-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	crunch: {
		path: '/fx/crunch-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	heal: {
		path: '/fx/heal-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	buff: {
		path: '/fx/buff-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	debuff: {
		path: '/fx/debuff-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	psychic: {
		path: '/fx/debuff-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	rock: {
		path: '/fx/rock-sprite.png',
		frames: 5,
		frameWidth: 192,
		frameHeight: 192
	},
	leaf: {
		path: '/fx/leaf-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	poison: {
		path: '/fx/poison-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	wind: {
		path: '/fx/wind-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	shadowball: {
		path: '/fx/shadowball-sprite.png',
		frames: 6,
		frameWidth: 192,
		frameHeight: 192
	},
	lightball: {
		path: '/fx/lightball-sprite.png',
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	},
	drain: {
		path: '/fx/drain-sprite.png',
		frames: 8,
		frameWidth: 192,
		frameHeight: 192
	}
};

export function getEffectDefinition(effectName: string): EffectDefinition | undefined {
	return EFFECT_MANIFEST[effectName];
}
