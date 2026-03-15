import ngeohash from 'ngeohash';

export const GEOHASH_PRECISION = 6; // ~1.2km x 600m

export function encodeGeohash(lat: number, lng: number): string {
  return ngeohash.encode(lat, lng, GEOHASH_PRECISION);
}

export function getNeighborhoodCells(geohash: string): string[] {
  const neighbors = ngeohash.neighbors(geohash);
  return [geohash, ...Object.values(neighbors)];
}

export function isInNeighborhood(inviterGeohash: string, joinerGeohash: string): boolean {
  return getNeighborhoodCells(inviterGeohash).includes(joinerGeohash);
}
