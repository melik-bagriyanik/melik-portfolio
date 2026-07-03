import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM, TECHS, PEDESTAL_HALF } from './data';

export interface PlayerApi {
  lock: () => void;
  unlock: () => void;
}

export interface TouchState {
  /** x: yana adım (-1..1), y: ileri (-1..1) */
  move: { x: number; y: number };
  /** birikmiş bakış deltaları (piksel); her karede tüketilir */
  look: { dx: number; dy: number };
}

export function createTouchState(): TouchState {
  return { move: { x: 0, y: 0 }, look: { dx: 0, dy: 0 } };
}

interface PlayerProps {
  enabled: boolean;
  apiRef: RefObject<PlayerApi | null>;
  touchRef: RefObject<TouchState>;
  onLockChange: (locked: boolean) => void;
}

const WALK_SPEED = 3.3;
const SPRINT_SPEED = 5.6;
const PLAYER_RADIUS = 0.42;
const LOOK_SENSITIVITY = 0.0021;
const TOUCH_LOOK_SENSITIVITY = 0.0042;
const PITCH_LIMIT = 1.42;

const BOUND_X = ROOM.width / 2 - 0.3 - PLAYER_RADIUS;
const BOUND_Z = ROOM.length / 2 - 0.3 - PLAYER_RADIUS;
const PEDESTAL_HIT = PEDESTAL_HALF + PLAYER_RADIUS;

export const PLAYER_START = new THREE.Vector3(0, ROOM.eyeHeight, 13.5);

export function Player({ enabled, apiRef, touchRef, onLockChange }: PlayerProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const velocity = useRef(new THREE.Vector3());
  const bobTime = useRef(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Başlangıç pozu: galeriye (-Z) bakar
  useEffect(() => {
    camera.rotation.order = 'YXZ';
    camera.position.copy(PLAYER_START);
    camera.rotation.set(0, 0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiRef.current = {
      lock: () => {
        try {
          // Chrome'da Promise döner; reddi (ör. ESC sonrası soğuma süresi) sessizce yut
          const result = gl.domElement.requestPointerLock() as unknown;
          (result as Promise<void> | undefined)?.catch?.(() => {});
        } catch {
          /* kilit isteği başarısız — duraklatma ekranı devrede kalır */
        }
      },
      unlock: () => {
        if (document.pointerLockElement) document.exitPointerLock();
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, gl]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const onBlur = () => keys.current.clear();

    const onLockChangeEvt = () => {
      const locked = document.pointerLockElement === gl.domElement;
      if (!locked) keys.current.clear();
      onLockChange(locked);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      // Odak/dönüş animasyonu sırasında (kilit erken alınmış olsa bile) bakışı FocusRig yönetir
      if (!enabledRef.current) return;
      camera.rotation.y -= e.movementX * LOOK_SENSITIVITY;
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x - e.movementY * LOOK_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('pointerlockchange', onLockChangeEvt);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('pointerlockchange', onLockChangeEvt);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, gl, onLockChange]);

  useFrame((_, rawDt) => {
    if (!enabledRef.current) return;
    const dt = Math.min(rawDt, 0.05);
    const k = keys.current;
    const touch = touchRef.current;

    // Dokunmatik bakış
    if (touch.look.dx !== 0 || touch.look.dy !== 0) {
      camera.rotation.y -= touch.look.dx * TOUCH_LOOK_SENSITIVITY;
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x - touch.look.dy * TOUCH_LOOK_SENSITIVITY,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
      touch.look.dx = 0;
      touch.look.dy = 0;
    }

    // Girdi vektörü (klavye + joystick)
    let forward =
      (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) -
      (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let strafe =
      (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) -
      (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    forward += touch.move.y;
    strafe += touch.move.x;

    const inputLen = Math.hypot(forward, strafe);
    if (inputLen > 1) {
      forward /= inputLen;
      strafe /= inputLen;
    }

    const sprint = k.has('ShiftLeft') || k.has('ShiftRight');
    const speed = sprint ? SPRINT_SPEED : WALK_SPEED;

    // Kamera yaw uzayında hareket yönü
    const yaw = camera.rotation.y;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const dirX = -sin * forward + cos * strafe;
    const dirZ = -cos * forward - sin * strafe;

    const target = new THREE.Vector3(dirX * speed, 0, dirZ * speed);
    // Yumuşak hızlanma/yavaşlama
    velocity.current.lerp(target, 1 - Math.exp(-10 * dt));

    const pos = camera.position;
    // Eksen-ayrık çarpışma çözümü: önce X, sonra Z
    pos.x += velocity.current.x * dt;
    pos.x = THREE.MathUtils.clamp(pos.x, -BOUND_X, BOUND_X);
    for (const tech of TECHS) {
      const [px, , pz] = tech.position;
      if (Math.abs(pos.x - px) < PEDESTAL_HIT && Math.abs(pos.z - pz) < PEDESTAL_HIT) {
        pos.x = px + Math.sign(pos.x - px || 1) * PEDESTAL_HIT;
      }
    }
    pos.z += velocity.current.z * dt;
    pos.z = THREE.MathUtils.clamp(pos.z, -BOUND_Z, BOUND_Z);
    for (const tech of TECHS) {
      const [px, , pz] = tech.position;
      if (Math.abs(pos.x - px) < PEDESTAL_HIT && Math.abs(pos.z - pz) < PEDESTAL_HIT) {
        pos.z = pz + Math.sign(pos.z - pz || 1) * PEDESTAL_HIT;
      }
    }

    // Zarif, hafif baş salınımı (yalnızca hareket halinde)
    const planarSpeed = Math.hypot(velocity.current.x, velocity.current.z);
    if (!reduceMotion && planarSpeed > 0.4) {
      bobTime.current += dt * (sprint ? 11 : 8.5);
      pos.y = ROOM.eyeHeight + Math.sin(bobTime.current) * 0.021 * Math.min(planarSpeed / WALK_SPEED, 1);
    } else {
      pos.y = THREE.MathUtils.lerp(pos.y, ROOM.eyeHeight, 1 - Math.exp(-8 * dt));
    }
  });

  return null;
}
