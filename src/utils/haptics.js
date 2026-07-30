/** Lightweight mobile haptics (no-op on unsupported devices). */
export function vibe(pattern = 30) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch (_) {
    /* ignore */
  }
}

export const HAPTIC = {
  hit: [45, 35, 70],
  power: [18, 40, 18, 40],
  shieldBreak: [25, 20, 25]
};
