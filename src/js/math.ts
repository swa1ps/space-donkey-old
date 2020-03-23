export function interpolate(a: number, b: number, x: number): number {
  return (1 - x) * a + x * b
}

export function extrapolate(a: number, b: number, y: number): number {
  return (y - a) / (b - a);
}

export function getVelocityAfterFriction(velocity: number, friction: number): number {
  return velocity > -0.01 && velocity < 0.01 ? 0 : velocity / friction;
}
