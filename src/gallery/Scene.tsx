import { Suspense, type RefObject } from 'react';
import { Environment } from '@react-three/drei';
import type * as THREE from 'three';
import { PAINTINGS, TECHS, BOARDS } from './data';
import { Room } from './Room';
import { Painting } from './Painting';
import { Pedestal } from './Pedestal';
import { Board } from './Board';
import { InteractionProvider } from './interaction';

interface SceneProps {
  hoveredId: string | null;
  objectsRef: RefObject<THREE.Object3D[]>;
}

export function Scene({ hoveredId, objectsRef }: SceneProps) {
  return (
    <InteractionProvider objectsRef={objectsRef}>
      <color attach="background" args={['#f2eee3']} />
      <fog attach="fog" args={['#f2eee3', 22, 56]} />

      <Room />

      {PAINTINGS.map((entry) => (
        <Painting key={entry.project.id} entry={entry} hovered={hoveredId === entry.project.id} />
      ))}
      {TECHS.map((entry) => (
        <Pedestal key={entry.id} entry={entry} hovered={hoveredId === entry.id} />
      ))}
      {BOARDS.map((entry) => (
        <Board key={entry.id} entry={entry} hovered={hoveredId === entry.id} />
      ))}

      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>
    </InteractionProvider>
  );
}
