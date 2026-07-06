import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM } from './data';

export type TargetKind =
  | 'project'
  | 'tech'
  | 'about'
  | 'contact'
  | 'experience'
  | 'education'
  | 'guide';

export interface TargetMeta {
  id: string;
  kind: TargetKind;
  /** HUD'da crosshair altında görünen etiket */
  label: string;
  center: [number, number, number];
  /** Duvar hedefleri için yüzey normali; kaidelerde yok (dinamik hesaplanır) */
  normal?: [number, number, number];
  /** Odak mesafesini belirleyen görsel genişlik */
  width: number;
}

export interface FocusPose {
  camera: THREE.Vector3;
  lookAt: THREE.Vector3;
}

interface Registry {
  register: (obj: THREE.Object3D, meta: TargetMeta) => void;
  unregister: (obj: THREE.Object3D) => void;
}

const InteractionContext = createContext<Registry | null>(null);

export function InteractionProvider({
  children,
  objectsRef,
}: {
  children: ReactNode;
  objectsRef: RefObject<THREE.Object3D[]>;
}) {
  const registry = useMemo<Registry>(
    () => ({
      register(obj, meta) {
        obj.userData.__target = meta;
        objectsRef.current.push(obj);
      },
      unregister(obj) {
        delete obj.userData.__target;
        const list = objectsRef.current;
        const i = list.indexOf(obj);
        if (i >= 0) list.splice(i, 1);
      },
    }),
    [objectsRef]
  );
  return <InteractionContext.Provider value={registry}>{children}</InteractionContext.Provider>;
}

export function useRegisterTarget(ref: RefObject<THREE.Object3D | null>, meta: TargetMeta) {
  const registry = useContext(InteractionContext);
  useEffect(() => {
    const obj = ref.current;
    if (!obj || !registry) return;
    registry.register(obj, meta);
    return () => registry.unregister(obj);
  }, [registry, ref, meta]);
}

const EYE_Y = ROOM.eyeHeight;

/** Seçilen hedef için sinematik kamera pozu üretir (panel sağda açıldığı için eser sola kaydırılır). */
export function computeFocusPose(meta: TargetMeta, cameraPos: THREE.Vector3): FocusPose {
  const center = new THREE.Vector3(...meta.center);
  let camera: THREE.Vector3;

  if (meta.normal) {
    const n = new THREE.Vector3(...meta.normal).normalize();
    const dist = THREE.MathUtils.clamp(meta.width * 1.15, 1.8, 3.6);
    camera = center.clone().addScaledVector(n, dist);
    camera.y = EYE_Y;
  } else {
    // Kaide: oyuncunun geldiği yönden bak (bakış yüksekliği meta.center'dan gelir)
    const dir = cameraPos.clone().sub(center);
    dir.y = 0;
    if (dir.lengthSq() < 0.0001) dir.set(0, 0, 1);
    dir.normalize();
    camera = center.clone().addScaledVector(dir, 2.2 + (meta.width - 1.2) * 0.6);
    camera.y = EYE_Y;
  }

  const viewDir = center.clone().sub(camera).normalize();
  const screenRight = viewDir.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
  // lookAt'ı ekranda sağa kaydır → eser solda konumlanır, sağdaki karta yer açılır
  const lookAt = center.clone().addScaledVector(screenRight, meta.width * 0.18 + 0.12);

  return { camera, lookAt };
}

interface InteractionManagerProps {
  enabled: boolean;
  maxDistance?: number;
  objectsRef: RefObject<THREE.Object3D[]>;
  onHover: (meta: TargetMeta | null) => void;
  onSelect: (meta: TargetMeta, pose: FocusPose) => void;
  /** Dokunmatikte "incele" tetikleyicisi dışarıdan çağrılır */
  triggerRef?: RefObject<{ trigger: () => void } | null>;
}

export function InteractionManager({
  enabled,
  maxDistance = 8,
  objectsRef,
  onHover,
  onSelect,
  triggerRef,
}: InteractionManagerProps) {
  const { camera } = useThree();
  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster();
    r.far = maxDistance;
    return r;
  }, [maxDistance]);
  const dirTmp = useMemo(() => new THREE.Vector3(), []);
  const hoverRef = useRef<TargetMeta | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const setHover = useCallback(
    (meta: TargetMeta | null) => {
      if (hoverRef.current?.id !== meta?.id) {
        hoverRef.current = meta;
        onHover(meta);
      }
    },
    [onHover]
  );

  useFrame(() => {
    if (!enabledRef.current) {
      setHover(null);
      return;
    }
    camera.getWorldDirection(dirTmp);
    raycaster.set(camera.position, dirTmp);
    const hits = raycaster.intersectObjects(objectsRef.current, true);
    if (hits.length === 0) {
      setHover(null);
      return;
    }
    // En yakın vuruşun kayıtlı kök hedefini bul
    let obj: THREE.Object3D | null = hits[0].object;
    while (obj && !obj.userData.__target) obj = obj.parent;
    setHover((obj?.userData.__target as TargetMeta) ?? null);
  });

  const select = useCallback(() => {
    const meta = hoverRef.current;
    if (!meta || !enabledRef.current) return;
    onSelect(meta, computeFocusPose(meta, camera.position));
  }, [onSelect, camera]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      // Sadece pointer kilitliyken (FPS modunda) tıklama seçim sayılır
      if (document.pointerLockElement) select();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [select]);

  useEffect(() => {
    if (!triggerRef) return;
    triggerRef.current = { trigger: select };
    return () => {
      triggerRef.current = null;
    };
  }, [triggerRef, select]);

  return null;
}
