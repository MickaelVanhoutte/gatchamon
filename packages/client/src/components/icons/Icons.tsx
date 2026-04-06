import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function makeIcon(d: string, viewBox = '0 0 24 24') {
  return function Icon({ size = 24, ...props }: IconProps) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={viewBox} fill="currentColor" {...props}>
        <path d={d} />
      </svg>
    );
  };
}

function makeMultiPathIcon(paths: string[], viewBox = '0 0 24 24') {
  return function Icon({ size = 24, ...props }: IconProps) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={viewBox} fill="currentColor" {...props}>
        {paths.map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  };
}

// ─── Navigation Icons ───

export const IconHome = makeIcon('M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z');

export const IconSummon = makeMultiPathIcon([
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  'M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  'M12 10a2 2 0 100 4 2 2 0 000-4z',
]);

export const IconCollection = makeIcon('M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z');

export const IconTrophy = makeIcon('M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z');

export const IconSwords = makeMultiPathIcon([
  'M6.92 5L5.5 6.42 10.08 11l-4.58 4.58L6.92 17l6-6-6-6z',
  'M17.08 5l1.42 1.42L13.92 11l4.58 4.58L17.08 17l-6-6 6-6z',
]);

export const IconDungeon = makeMultiPathIcon([
  'M6 2v20H4V2h2zm5 0v20H9V2h2zm5 0v20h-2V2h2zm5 0v20h-2V2h2z',
  'M2 4h20v2H2V4zm0 14h20v2H2v-2z',
]);

export const IconTrainer = makeIcon('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z');

// ─── HUD Icons ───

export const IconEnergy = makeIcon('M13 2L3 14h7l-2 8 10-12h-7l2-8z');

export const IconStardust = makeIcon('M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4 5.6 21.2 8 14 2 9.2h7.6L12 2z');

export function IconPokeball({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h8a2 2 0 104 0h8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2a10 10 0 010 0" fill="currentColor" opacity="0.3" />
      <path d="M2.1 11.5A10 10 0 0112 2a10 10 0 019.9 9.5H14.9a3 3 0 00-5.8 0H2.1z" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

export function IconPremiumPokeball({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h8a2 2 0 104 0h8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.1 11.5A10 10 0 0112 2a10 10 0 019.9 9.5H14.9a3 3 0 00-5.8 0H2.1z" fill="#9333ea" opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="#fbbf24" opacity="0.6" />
    </svg>
  );
}

export function IconLegendaryPokeball({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h8a2 2 0 104 0h8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.1 11.5A10 10 0 0112 2a10 10 0 019.9 9.5H14.9a3 3 0 00-5.8 0H2.1z" fill="#f59e0b" opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="#fbbf24" opacity="0.8" />
      <path d="M12 5l1 3h3l-2.5 2 1 3L12 11l-2.5 2 1-3L8 8h3l1-3z" fill="#fbbf24" opacity="0.4" />
    </svg>
  );
}

export function IconTower({ size = 24, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 22V6l4-4 4 4v16" />
      <path d="M6 22h12" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

// ─── Utility Icons ───

export const IconStar = makeIcon('M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z');

export const IconClose = makeIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z');

export const IconLock = makeIcon('M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z');

export const IconCheck = makeIcon('M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z');

export const IconGift = makeMultiPathIcon([
  'M20 7h-4.05A3.49 3.49 0 0012 3.05 3.49 3.49 0 007.95 7H4c-1.1 0-2 .9-2 2v2h20V9c0-1.1-.9-2-2-2z',
  'M2 13v7c0 1.1.9 2 2 2h7v-9H2zm9 0v9h7c1.1 0 2-.9 2-2v-7h-9z',
  'M12 3a1.5 1.5 0 011.5 1.5c0 .53-.27.99-.69 1.26L12 6.5l-.81-.74A1.49 1.49 0 0112 3z',
]);

export const IconArrowRight = makeIcon('M10 6l-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6-6-6z');

export const IconArrowUp = makeIcon('M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z');

export const IconArrowDown = makeIcon('M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41 1.41z');

export const IconSparkles = makeMultiPathIcon([
  'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z',
  'M5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z',
  'M19 12l.75 2.25L22 15l-2.25.75L19 18l-.75-2.25L16 15l2.25-.75L19 12z',
]);

export const IconClover = makeMultiPathIcon([
  'M12 2c-1.66 0-3 1.34-3 3 0 .95.45 1.79 1.14 2.33L12 9l1.86-1.67A2.99 2.99 0 0015 5c0-1.66-1.34-3-3-3z',
  'M22 12c0-1.66-1.34-3-3-3-.95 0-1.79.45-2.33 1.14L15 12l1.67 1.86c.54.69 1.38 1.14 2.33 1.14 1.66 0 3-1.34 3-3z',
  'M12 22c1.66 0 3-1.34 3-3 0-.95-.45-1.79-1.14-2.33L12 15l-1.86 1.67A2.99 2.99 0 009 19c0 1.66 1.34 3 3 3z',
  'M2 12c0 1.66 1.34 3 3 3 .95 0 1.79-.45 2.33-1.14L9 12l-1.67-1.86A2.99 2.99 0 005 9c-1.66 0-3 1.34-3 3z',
]);

export const IconShiny = makeMultiPathIcon([
  'M12 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z',
  'M5 17l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z',
]);

export const IconEvolve = makeIcon('M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z');

export const IconMerge = makeIcon('M7 7h10l-5 5-5-5zm0 10l5-5 5 5H7z');

export const IconSkull = makeMultiPathIcon([
  'M12 2C7.58 2 4 5.58 4 10c0 2.76 1.41 5.19 3.54 6.62L7 22h10l-.54-5.38A7.98 7.98 0 0020 10c0-4.42-3.58-8-8-8z',
  'M9 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'M15 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  'M10 17h4v2h-4v-2z',
]);

// ─── Pokemon Type Icons ───

export const IconNormal = makeIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14a4 4 0 110-8 4 4 0 010 8z');

export const IconFire = makeIcon('M13.5 .67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z');

export const IconWater = makeIcon('M12 2c-5.33 8.33-8 13.33-8 15 0 4.42 3.58 8 8 8s8-3.58 8-8c0-1.67-2.67-6.67-8-15z');

export const IconGrass = makeIcon('M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.72 17.18 10.18 12 17 10V8zm-4 4c-6 1.5-8 7.5-9.5 12.5l1.9.6C7 20 9 15 13 13.5V12zM20 2s-4 2-10 3v2c5-1 8.5-2.5 10-3V2z');

export const IconElectric = makeIcon('M13 2L3 14h7l-2 8 10-12h-7l2-8z');

export const IconIce = makeMultiPathIcon([
  'M12 2v20M2 12h20',
  'M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07',
  'M12 6l-2 2 2 2 2-2-2-2zm-6 6l-2 2 2 2 2-2-2-2zm12 0l-2 2 2 2 2-2-2-2zm-6 6l-2 2 2 2 2-2-2-2z',
]);

export const IconFighting = makeIcon('M5 4v6.5c0 3.5 2.6 6.5 6 6.93V20H7v2h10v-2h-4v-2.57c3.4-.43 6-3.43 6-6.93V4H5zm6.5 8.5L9 10l2.5-2.5L14 10l-2.5 2.5z');

export const IconPoison = makeMultiPathIcon([
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  'M8.5 8.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z',
  'M12.5 8.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z',
  'M8 14s1.5 3 4 3 4-3 4-3',
]);

export const IconGround = makeIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z');

export const IconFlying = makeIcon('M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z');

export const IconPsychic = makeIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z');

export const IconBug = makeMultiPathIcon([
  'M20 8h-2.81a5.98 5.98 0 00-1.82-2.43L17 4l-1.41-1.41L13.12 5.02A5.9 5.9 0 0012 5c-.38 0-.75.04-1.12.1L8.41 2.59 7 4l1.63 1.57A5.98 5.98 0 006.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z',
  'M14 16h-4v-2h4v2zm0-4h-4v-2h4v2z',
]);

export const IconRock = makeIcon('M4 18l4-10 4 6 4-4 4 8H4z');

export const IconGhost = makeIcon('M12 2C7.58 2 4 5.58 4 10v8c0 0 1.5-1 3-1s2 1 3 1 2-1 3-1 1.5 1 3 1 3-1 3-1v-8c0-4.42-3.58-8-8-8zm-2 9a2 2 0 110-4 2 2 0 010 4zm4 0a2 2 0 110-4 2 2 0 010 4z');

export const IconDragon = makeIcon('M6.5 2C4.01 2 2 4.01 2 6.5S4.01 11 6.5 11H8v2H6.5C4.01 13 2 15.01 2 17.5S4.01 22 6.5 22c1.61 0 3.04-.86 3.84-2.15L12 17l1.66 2.85C14.46 21.14 15.89 22 17.5 22c2.49 0 4.5-2.01 4.5-4.5S19.99 13 17.5 13H16v-2h1.5C19.99 11 22 8.99 22 6.5S19.99 2 17.5 2c-1.61 0-3.04.86-3.84 2.15L12 7l-1.66-2.85A4.49 4.49 0 006.5 2z');

export const IconFairy = makeMultiPathIcon([
  'M12 2l2.5 5.5L20 10l-5.5 2.5L12 18l-2.5-5.5L4 10l5.5-2.5L12 2z',
  'M19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z',
  'M5 15l1 3-3 1 3 1 1 3-1-3 3-1-3-1-1-3z',
]);

export const IconDark = makeIcon('M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 01-4.4 2.26 5.4 5.4 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z');

export const IconSteel = makeIcon('M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z');

export const IconMagic = makeMultiPathIcon([
  'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z',
  'M5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z',
  'M19 12l.75 2.25L22 15l-2.25.75L19 18l-.75-2.25L16 15l2.25-.75L19 12z',
]);

// ─── Item Set Icons ───

export const IconWind = makeMultiPathIcon([
  'M3 8h8a3 3 0 100-3',
  'M3 16h12a3 3 0 110 3',
  'M3 12h10a3 3 0 100-3',
]);

export const IconMuscle = makeIcon('M4 17v-6l3-3 2 2 4-4 2 2 3-3h2v6l-3 3-2-2-4 4-2-2-3 3H4z');

export const IconTarget = makeMultiPathIcon([
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  'M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  'M12 10a2 2 0 100 4 2 2 0 000-4z',
]);

export const IconCrown = makeIcon('M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z');

export const IconBlade = makeIcon('M14.17 3L3 14.17l3.83 3.83L18 6.83 14.17 3zM5.64 16.36l-1.41-1.41 8.49-8.49 1.41 1.41-8.49 8.49zM19 12l3-3-1-1-3 3v1h1zm-8 8l3-3h-1v-1l-3 3 1 1z');

export const IconMusic = makeIcon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z');

export const IconMartialArts = makeIcon('M5 4v6.5c0 3.5 2.6 6.5 6 6.93V20H7v2h10v-2h-4v-2.57c3.4-.43 6-3.43 6-6.93V4H5zm6.5 8.5L9 10l2.5-2.5L14 10l-2.5 2.5z');

export const IconGlasses = makeMultiPathIcon([
  'M3 10a4 4 0 108 0 4 4 0 00-8 0z',
  'M13 10a4 4 0 108 0 4 4 0 00-8 0z',
  'M11 10h2',
  'M1 10h2M21 10h2',
]);

export const IconPaw = makeMultiPathIcon([
  'M12 18c-2.5 0-4.5 1.5-4.5 3h9c0-1.5-2-3-4.5-3z',
  'M4.5 11a2 2 0 104 0 2 2 0 00-4 0z',
  'M8 7a2 2 0 104 0 2 2 0 00-4 0z',
  'M12 7a2 2 0 104 0 2 2 0 00-4 0z',
  'M15.5 11a2 2 0 104 0 2 2 0 00-4 0z',
]);

export const IconSandwich = makeMultiPathIcon([
  'M2 16l10-10 10 10H2z',
  'M4 16h16v2H4v-2z',
  'M3 18h18v3H3v-3z',
]);

// ─── Region Icons ───

export const IconTree = makeIcon('M12 2L6 10h3l-3 6h3l-3 6h12l-3-6h3l-3-6h3L12 2z');

export const IconWheat = makeMultiPathIcon([
  'M12 22V8',
  'M7 8l5-5 5 5',
  'M7 12l5-3 5 3',
  'M7 16l5-3 5 3',
]);

export const IconWave = makeIcon('M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0v4c-2-2-4-2-6 0s-4 2-6 0-4-2-6 0-4 2-6 0v-4z');

export const IconMountain = makeIcon('M14 6l-3.75 5L12 13l1.5-2 3.5 5H3l5-8 2 2.67L14 6zm4 10.5L14 10l-1 1.33L16 17h2v-.5z');

export const IconShrine = makeMultiPathIcon([
  'M3 21h18v-2H3v2z',
  'M5 19V9h14v10',
  'M2 9l10-7 10 7',
  'M10 19v-6h4v6',
]);

// ─── Currency & Shop Icons ───

export const IconPokedollar = makeMultiPathIcon([
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  'M13 7h-2v3H8v2h3v3h2v-3h3v-2h-3V7z',
]);

export const IconShop = makeMultiPathIcon([
  'M18.36 9l.6-3H5.04l.6 3h12.72zM20 4H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2h-1V4z',
  'M6 18v2h8v-2H6z',
]);

// Glowing Pokeball — pokeball with sparkle rays
export const IconGlowingPokeball = makeMultiPathIcon([
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  'M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  'M12 10a2 2 0 100 4 2 2 0 000-4z',
  // Sparkle rays
  'M12 0v2M12 22v2M0 12h2M22 12h2M3.5 3.5l1.4 1.4M19.1 19.1l1.4 1.4M3.5 20.5l1.4-1.4M19.1 4.9l1.4-1.4',
]);

// Roulette wheel icon
export const IconRoulette = makeMultiPathIcon([
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  'M12 6v6l4.24 4.24',
  'M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12',
]);
