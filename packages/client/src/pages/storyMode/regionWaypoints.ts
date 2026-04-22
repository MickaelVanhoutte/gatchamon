/**
 * Hand-tuned waypoint curves used to draw the organic path through Kanto and
 * Johto on the story map. Pulled out of the StoryModePage component so the
 * page file isn't dominated by hundreds of coordinate literals.
 *
 * These are pixel coordinates inside the SVG viewBox the page uses; layout
 * tweaks should happen here, not in the page file.
 */

export interface Waypoint {
  x: number;
  y: number;
}

export const KANTO_WAYPOINTS: Waypoint[] = [
  { x: 100, y: 380 },    // Pewter Passage
  { x: 175, y: 355 },
  { x: 235, y: 275 },
  { x: 280, y: 220 },    // Cerulean Cove
  { x: 320, y: 235 },
  { x: 375, y: 340 },
  { x: 430, y: 400 },
  { x: 460, y: 420 },    // Vermilion Docks
  { x: 500, y: 410 },
  { x: 560, y: 345 },
  { x: 610, y: 280 },
  { x: 650, y: 250 },    // Celadon Gardens
  { x: 700, y: 265 },
  { x: 760, y: 355 },
  { x: 810, y: 415 },
  { x: 840, y: 440 },    // Fuchsia Marsh
  { x: 875, y: 425 },
  { x: 935, y: 340 },
  { x: 985, y: 245 },
  { x: 1020, y: 200 },   // Saffron Towers
  { x: 1060, y: 215 },
  { x: 1110, y: 295 },
  { x: 1155, y: 355 },
  { x: 1180, y: 380 },   // Cinnabar Volcano
  { x: 1215, y: 370 },
  { x: 1260, y: 295 },
  { x: 1305, y: 220 },
  { x: 1340, y: 180 },   // Viridian Fortress
  { x: 1385, y: 195 },
  { x: 1440, y: 275 },
  { x: 1480, y: 330 },
  { x: 1500, y: 350 },   // Victory Road
  { x: 1545, y: 345 },
  { x: 1615, y: 300 },
  { x: 1680, y: 260 },   // Pokemon League
];

export const JOHTO_WAYPOINTS: Waypoint[] = [
  { x: 100, y: 300 },    // Violet Skies
  { x: 155, y: 325 },
  { x: 215, y: 395 },
  { x: 280, y: 440 },    // Azalea Woods
  { x: 330, y: 420 },
  { x: 380, y: 350 },
  { x: 425, y: 290 },
  { x: 460, y: 260 },    // Goldenrod City
  { x: 505, y: 275 },
  { x: 560, y: 335 },
  { x: 610, y: 370 },
  { x: 640, y: 380 },    // Ecruteak Shrine
  { x: 685, y: 395 },
  { x: 740, y: 435 },
  { x: 790, y: 455 },
  { x: 820, y: 460 },    // Cianwood Shore
  { x: 860, y: 445 },
  { x: 920, y: 380 },
  { x: 965, y: 330 },
  { x: 1000, y: 300 },   // Olivine Harbor
  { x: 1040, y: 315 },
  { x: 1095, y: 375 },
  { x: 1145, y: 405 },
  { x: 1180, y: 420 },   // Mahogany Frost
  { x: 1220, y: 405 },
  { x: 1275, y: 340 },
  { x: 1325, y: 280 },
  { x: 1360, y: 250 },   // Blackthorn Peak
  { x: 1400, y: 265 },
  { x: 1450, y: 325 },
  { x: 1490, y: 365 },
  { x: 1520, y: 380 },   // Johto Victory Road
  { x: 1560, y: 370 },
  { x: 1620, y: 310 },
  { x: 1680, y: 260 },   // Johto Pokemon League
];

export function getArcWaypoints(arcId: string | undefined): Waypoint[] {
  return arcId === 'johto' ? JOHTO_WAYPOINTS : KANTO_WAYPOINTS;
}
