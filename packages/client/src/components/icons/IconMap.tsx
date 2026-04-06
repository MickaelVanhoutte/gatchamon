import type { ComponentType, SVGProps } from 'react';
import {
  IconHome, IconSummon, IconCollection, IconTrophy, IconSwords, IconDungeon, IconTrainer,
  IconEnergy, IconStardust, IconPokeball, IconPremiumPokeball, IconLegendaryPokeball, IconStar, IconClose, IconLock, IconCheck,
  IconGift, IconArrowRight, IconArrowUp, IconArrowDown, IconSparkles, IconClover, IconShiny,
  IconEvolve, IconMerge, IconSkull, IconTower,
  IconNormal, IconFire, IconWater, IconGrass, IconElectric, IconIce, IconFighting,
  IconPoison, IconGround, IconFlying, IconPsychic, IconBug, IconRock, IconGhost,
  IconDragon, IconFairy, IconDark, IconSteel, IconMagic,
  IconWind, IconMuscle, IconTarget, IconCrown, IconBlade, IconMusic, IconMartialArts,
  IconGlasses, IconPaw, IconSandwich,
  IconTree, IconWheat, IconWave, IconMountain, IconShrine,
  IconPokedollar, IconShop, IconGlowingPokeball, IconRoulette,
  IconBag,
} from './Icons';

type IconComponent = ComponentType<{ size?: number } & SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = {
  // Navigation
  home: IconHome,
  summon: IconSummon,
  collection: IconCollection,
  trophy: IconTrophy,
  swords: IconSwords,
  dungeon: IconDungeon,
  trainer: IconTrainer,

  // HUD
  energy: IconEnergy,
  stardust: IconStardust,
  pokeball: IconPokeball,
  premiumPokeball: IconPremiumPokeball,
  legendaryPokeball: IconLegendaryPokeball,
  tower: IconTower,

  // Utility
  star: IconStar,
  close: IconClose,
  lock: IconLock,
  check: IconCheck,
  gift: IconGift,
  arrow_right: IconArrowRight,
  arrow_up: IconArrowUp,
  arrow_down: IconArrowDown,
  sparkles: IconSparkles,
  clover: IconClover,
  shiny: IconShiny,
  evolve: IconEvolve,
  merge: IconMerge,
  skull: IconSkull,

  // Pokemon types
  normal: IconNormal,
  fire: IconFire,
  water: IconWater,
  grass: IconGrass,
  electric: IconElectric,
  ice: IconIce,
  fighting: IconFighting,
  poison: IconPoison,
  ground: IconGround,
  flying: IconFlying,
  psychic: IconPsychic,
  bug: IconBug,
  rock: IconRock,
  ghost: IconGhost,
  dragon: IconDragon,
  fairy: IconFairy,
  dark: IconDark,
  steel: IconSteel,
  magic: IconMagic,

  // Item sets
  wind: IconWind,
  muscle: IconMuscle,
  target: IconTarget,
  crown: IconCrown,
  blade: IconBlade,
  music: IconMusic,
  martial_arts: IconMartialArts,
  glasses: IconGlasses,
  paw: IconPaw,
  sandwich: IconSandwich,

  // Currency & Shop
  bag: IconBag,
  pokedollar: IconPokedollar,
  shop: IconShop,
  glowingPokeball: IconGlowingPokeball,
  roulette: IconRoulette,

  // Regions
  tree: IconTree,
  wheat: IconWheat,
  wave: IconWave,
  mountain: IconMountain,
  shrine: IconShrine,
};

interface GameIconProps {
  id: string | undefined;
  size?: number;
  color?: string;
  className?: string;
}

export function GameIcon({ id, size = 16, color, className }: GameIconProps) {
  if (!id) return null;
  const Comp = ICON_MAP[id];
  if (!Comp) return <span className={className}>{id}</span>;
  return <Comp size={size} style={color ? { color } : undefined} className={className} />;
}

interface StarRatingProps {
  count: number;
  size?: number;
  color?: string;
  className?: string;
}

export function StarRating({ count, size = 12, color = 'var(--star-gold)', className }: StarRatingProps) {
  return (
    <span className={className} style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: count }, (_, i) => (
        <IconStar key={i} size={size} style={{ color }} />
      ))}
    </span>
  );
}
