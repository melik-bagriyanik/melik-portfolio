import { Component, Suspense, type ReactNode, type RefObject } from 'react';
import { Environment } from '@react-three/drei';
import type * as THREE from 'three';
import {
  PAINTINGS,
  TECHS,
  BOARDS,
  EXPERIENCES,
  EDUCATION,
  EDUCATION_PLACEMENT,
  GUIDE_PLACEMENT,
  ROOMS_INFO,
} from './data';
import { drawBoard, drawCareerBoard, drawEducationBoard, drawGuideBoard } from './textures';
import { Room } from './Room';
import { Painting } from './Painting';
import { Pedestal } from './Pedestal';
import { WallBoard } from './Board';
import { InteractionProvider, type TargetMeta } from './interaction';

interface SceneProps {
  hoveredId: string | null;
  objectsRef: RefObject<THREE.Object3D[]>;
  /** Mobil performans modu */
  lite?: boolean;
}

/**
 * Environment HDR'ı CDN'den gelir; ağ hatası Suspense üzerinden tüm uygulamayı
 * düşürmesin — hata durumunda sahne yalnızca analitik ışıklarla devam eder.
 */
class EnvBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Statik veriden bir kez üretilen hedef metaları (kimlikleri sabit kalır)
const BOARD_METAS: TargetMeta[] = BOARDS.map((b) => ({
  id: b.id,
  kind: b.id,
  label: b.id === 'about' ? 'Hakkımda' : 'İletişim',
  center: b.placement.position,
  normal: b.placement.normal,
  width: b.placement.width,
}));

const EXPERIENCE_METAS: TargetMeta[] = EXPERIENCES.map((e) => ({
  id: e.id,
  kind: 'experience',
  label: `${e.company} — ${e.role}`,
  center: e.placement.position,
  normal: e.placement.normal,
  width: e.placement.width,
}));

const EDUCATION_META: TargetMeta = {
  id: 'education',
  kind: 'education',
  label: 'Eğitim',
  center: EDUCATION_PLACEMENT.position,
  normal: EDUCATION_PLACEMENT.normal,
  width: EDUCATION_PLACEMENT.width,
};

const GUIDE_META: TargetMeta = {
  id: 'guide',
  kind: 'guide',
  label: 'Sergi Planı',
  center: GUIDE_PLACEMENT.position,
  normal: GUIDE_PLACEMENT.normal,
  width: GUIDE_PLACEMENT.width,
};

export function Scene({ hoveredId, objectsRef, lite }: SceneProps) {
  return (
    <InteractionProvider objectsRef={objectsRef}>
      <color attach="background" args={['#f2eee3']} />
      <fog attach="fog" args={['#f2eee3', 26, 62]} />

      <Room />

      {PAINTINGS.map((entry) => (
        <Painting
          key={entry.project.id}
          entry={entry}
          hovered={hoveredId === entry.project.id}
          lite={lite}
        />
      ))}

      {TECHS.map((entry) => (
        <Pedestal key={entry.id} entry={entry} hovered={hoveredId === entry.id} />
      ))}

      {BOARDS.map((entry, i) => (
        <WallBoard
          key={entry.id}
          placement={entry.placement}
          meta={BOARD_METAS[i]}
          hovered={hoveredId === entry.id}
          draw={() => drawBoard(entry)}
        />
      ))}

      {EXPERIENCES.map((entry, i) => (
        <WallBoard
          key={entry.id}
          placement={entry.placement}
          meta={EXPERIENCE_METAS[i]}
          hovered={hoveredId === entry.id}
          draw={() => drawCareerBoard(entry)}
        />
      ))}

      <WallBoard
        placement={EDUCATION_PLACEMENT}
        meta={EDUCATION_META}
        hovered={hoveredId === 'education'}
        draw={() => drawEducationBoard(EDUCATION)}
      />

      <WallBoard
        placement={GUIDE_PLACEMENT}
        meta={GUIDE_META}
        hovered={hoveredId === 'guide'}
        draw={() => drawGuideBoard(ROOMS_INFO)}
      />

      <EnvBoundary>
        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>
      </EnvBoundary>
    </InteractionProvider>
  );
}
