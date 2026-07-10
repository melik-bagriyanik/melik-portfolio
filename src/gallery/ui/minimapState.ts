import { SPAWN } from '../data';

/** Oyuncu konum/yön köprüsü: Canvas içinden yazılır, DOM haritası okur */
export interface MinimapState {
  x: number;
  z: number;
  yaw: number;
}

export function createMinimapState(): MinimapState {
  return { x: SPAWN.x, z: SPAWN.z, yaw: 0 };
}
