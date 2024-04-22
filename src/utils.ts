export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randMinMaxObj({
  minValue,
  maxValue,
}: {
  minValue: number;
  maxValue: number;
}) {
  return rand(minValue, maxValue);
}

export function fadeArray(data: Float32Array, min: number, max: number) {
  if (min >= 1) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    data[i] *= rand(min, max);
  }
}

export function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha;
}

export const EPSILON = 0.001;

export function clampArray(data: Float32Array, min = 0, max = 1) {
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(min, Math.min(max, data[i]));
  }
}
