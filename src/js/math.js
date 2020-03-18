/**
 * 
 * @param {number} a 
 * @param {number} b 
 * @param {number} x [0;1]
 */
export function interpolate(a, b, x) {
  return (1 - x) * a + x * b
}

/**
 * 
 * @param {number} a 
 * @param {number} b 
 * @param {number} y [a;b]
 */
export function extrapolate(a, b, y) {
  return (y - a) / (b - a);
}
