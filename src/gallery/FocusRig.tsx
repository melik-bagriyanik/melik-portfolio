import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { FocusPose } from './interaction';

interface FocusRigProps {
  /** Aktif odak pozu; null → odak yok */
  pose: FocusPose | null;
  /** true → geri dönüş animasyonu oynat, bitince onReturned çağrılır */
  returning: boolean;
  onReturned: () => void;
}

const DURATION = 1.05;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Bir esere odaklanırken kamerayı sinematik biçimde taşır,
 * kapatınca oyuncunun kaldığı poza geri döndürür.
 */
export function FocusRig({ pose, returning, onReturned }: FocusRigProps) {
  const { camera } = useThree();
  const state = useRef<{
    mode: 'idle' | 'in' | 'hold' | 'out';
    t: number;
    fromPos: THREE.Vector3;
    fromQuat: THREE.Quaternion;
    toPos: THREE.Vector3;
    toQuat: THREE.Quaternion;
    savedPos: THREE.Vector3;
    savedQuat: THREE.Quaternion;
  }>({
    mode: 'idle',
    t: 0,
    fromPos: new THREE.Vector3(),
    fromQuat: new THREE.Quaternion(),
    toPos: new THREE.Vector3(),
    toQuat: new THREE.Quaternion(),
    savedPos: new THREE.Vector3(),
    savedQuat: new THREE.Quaternion(),
  });

  useEffect(() => {
    const s = state.current;
    if (pose && !returning) {
      // Odak başlıyor: mevcut pozu sakla, hedefe süzül
      s.savedPos.copy(camera.position);
      s.savedQuat.copy(camera.quaternion);
      s.fromPos.copy(camera.position);
      s.fromQuat.copy(camera.quaternion);
      s.toPos.copy(pose.camera);
      const m = new THREE.Matrix4().lookAt(pose.camera, pose.lookAt, new THREE.Vector3(0, 1, 0));
      s.toQuat.setFromRotationMatrix(m);
      s.t = 0;
      s.mode = 'in';
    } else if (returning && s.mode !== 'idle') {
      s.fromPos.copy(camera.position);
      s.fromQuat.copy(camera.quaternion);
      s.toPos.copy(s.savedPos);
      s.toQuat.copy(s.savedQuat);
      s.t = 0;
      s.mode = 'out';
    }
  }, [pose, returning, camera]);

  useFrame((_, dt) => {
    const s = state.current;
    if (s.mode === 'idle' || s.mode === 'hold') return;
    s.t = Math.min(s.t + dt / DURATION, 1);
    const e = easeInOutCubic(s.t);
    camera.position.lerpVectors(s.fromPos, s.toPos, e);
    camera.quaternion.slerpQuaternions(s.fromQuat, s.toQuat, e);
    if (s.t >= 1) {
      if (s.mode === 'out') {
        s.mode = 'idle';
        // Euler'ı YXZ düzenine geri oturt (FPS bakışı quaternion'dan türesin)
        camera.rotation.setFromQuaternion(camera.quaternion, 'YXZ');
        camera.rotation.z = 0;
        onReturned();
      } else {
        s.mode = 'hold';
      }
    }
  });

  return null;
}
