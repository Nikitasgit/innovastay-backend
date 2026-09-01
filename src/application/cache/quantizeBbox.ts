export type QuantizedBbox = {
  ne: [number, number];
  sw: [number, number];
};

export function bboxDecimalPrecision(spanDegrees: number): number {
  if (spanDegrees > 1) {
    return 2;
  }
  if (spanDegrees > 0.1) {
    return 3;
  }
  return 4;
}

export function roundCoord(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

/**
 * Quantizes a bounding box for cache keys only.
 * The original bbox must still be sent to Mongo so `$limit` is not
 * applied to an expanded box.
 */
export function quantizeBbox(ne: number[], sw: number[]): QuantizedBbox {
  const lngSpan = Math.abs((ne[0] ?? 0) - (sw[0] ?? 0));
  const latSpan = Math.abs((ne[1] ?? 0) - (sw[1] ?? 0));
  const decimals = bboxDecimalPrecision(Math.max(lngSpan, latSpan));

  return {
    ne: [roundCoord(ne[0] ?? 0, decimals), roundCoord(ne[1] ?? 0, decimals)],
    sw: [roundCoord(sw[0] ?? 0, decimals), roundCoord(sw[1] ?? 0, decimals)],
  };
}
