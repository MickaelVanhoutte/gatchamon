export const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

if (DEBUG_MODE) {
  console.log('[DEBUG] Debug mode enabled — shiny rate boosted to 50%');
}
