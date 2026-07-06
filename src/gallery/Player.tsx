import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM, SPAWN, COLLIDERS, WORLD_BOUNDS } from './data';
import { galleryAudio } from './audio';

export interface PlayerApi {
  lock: () => void;
  unlock: () => void;
}

export interface TouchState {
  /** x: yana adım (-1..1), y: ileri (-1..1) */
  move: { x: number; y: number };
  /** birikmiş bakış deltaları (piksel); her karede tüketilir */
  look: { dx: number; dy: number };
  /** zıplama isteği; Player tarafından tüketilir */
  jump: boolean;
}

export function createTouchState(): TouchState {
  return { move: { x: 0, y: 0 }, look: { dx: 0, dy: 0 }, jump: false };
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
const JUMP_VELOCITY = 4.2;
const GRAVITY = 11.5;

const SUIT = '#2c2823';
const SKIN = '#c99b76';
const SHOE = '#1f1c17';

export const PLAYER_START = new THREE.Vector3(SPAWN.x, ROOM.eyeHeight, SPAWN.z);

/**
 * Daire–AABB çözümü: her çakışmayı EN AZ batma olan eksende iter (MTV).
 * Eksen-ayrık itme, uzun duvarlarda oyuncuyu duvarın ucuna fırlatıp
 * odanın dışına ışınlayabiliyordu — bu yüzden batma derinliği karşılaştırılır.
 */
function resolveCollisions(pos: THREE.Vector3) {
  for (const c of COLLIDERS) {
    const dx = pos.x - c.cx;
    const dz = pos.z - c.cz;
    const hx = c.hx + PLAYER_RADIUS;
    const hz = c.hz + PLAYER_RADIUS;
    const penX = hx - Math.abs(dx);
    const penZ = hz - Math.abs(dz);
    if (penX > 0 && penZ > 0) {
      if (penX < penZ) {
        pos.x = c.cx + Math.sign(dx || 1) * hx;
      } else {
        pos.z = c.cz + Math.sign(dz || 1) * hz;
      }
    }
  }
}

export function Player({ enabled, apiRef, touchRef, onLockChange }: PlayerProps) {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const velocity = useRef(new THREE.Vector3());
  const targetVel = useRef(new THREE.Vector3());
  const bobTime = useRef(0);
  const vy = useRef(0);
  const grounded = useRef(true);
  const swingPhase = useRef(0);
  const swingAmp = useRef(0);
  const stepAccum = useRef(0);
  const bodyRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  // Kameraya bağlı görünüm-kolları (FPS usulü, ekranın alt köşelerinde)
  const viewArmsRef = useRef<THREE.Group>(null);
  const viewArmLRef = useRef<THREE.Group>(null);
  const viewArmRRef = useRef<THREE.Group>(null);
  const armRise = useRef(0);
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
    // Gövde ve kollar yalnızca yürüyüş modunda görünür (odak uçuşunda kamera bedenden ayrılır)
    if (bodyRef.current) bodyRef.current.visible = enabledRef.current;
    if (viewArmsRef.current) viewArmsRef.current.visible = enabledRef.current;
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

    targetVel.current.set(dirX * speed, 0, dirZ * speed);
    // Yumuşak hızlanma/yavaşlama
    velocity.current.lerp(targetVel.current, 1 - Math.exp(-10 * dt));

    const pos = camera.position;
    pos.x += velocity.current.x * dt;
    pos.z += velocity.current.z * dt;
    pos.x = THREE.MathUtils.clamp(pos.x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
    pos.z = THREE.MathUtils.clamp(pos.z, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);
    // İki geçiş: bir kutudan itilme komşu kutuya sokabilir, ikinci tur temizler
    resolveCollisions(pos);
    resolveCollisions(pos);

    // Zıplama
    const wantJump = k.has('Space') || touch.jump;
    touch.jump = false;
    if (wantJump && grounded.current) {
      vy.current = JUMP_VELOCITY;
      grounded.current = false;
    }

    const planarSpeed = Math.hypot(velocity.current.x, velocity.current.z);
    if (!grounded.current) {
      // Havada: yerçekimi entegrasyonu
      pos.y += vy.current * dt;
      vy.current -= GRAVITY * dt;
      if (pos.y <= ROOM.eyeHeight && vy.current <= 0) {
        pos.y = ROOM.eyeHeight;
        vy.current = 0;
        grounded.current = true;
        galleryAudio.playLand();
      }
    } else if (!reduceMotion && planarSpeed > 0.4) {
      // Zarif, hafif baş salınımı (yalnızca yerde ve hareket halinde)
      bobTime.current += dt * (sprint ? 11 : 8.5);
      pos.y = ROOM.eyeHeight + Math.sin(bobTime.current) * 0.021 * Math.min(planarSpeed / WALK_SPEED, 1);
    } else {
      pos.y = THREE.MathUtils.lerp(pos.y, ROOM.eyeHeight, 1 - Math.exp(-8 * dt));
    }

    // Adım sesleri: yürüme temposuyla orantılı (mermer zeminde yumuşak tıkırtı)
    if (grounded.current && planarSpeed > 0.5) {
      stepAccum.current += dt * planarSpeed * 0.58;
      if (stepAccum.current >= 1) {
        stepAccum.current -= 1;
        galleryAudio.playFootstep();
      }
    } else {
      stepAccum.current = Math.min(stepAccum.current, 0.7);
    }

    // Birinci şahıs gövdesi: kameranın hafif ARKASINDA durur (Minecraft usulü) —
    // böylece aşağı bakınca kafanın içi değil, göğüs/bacak/ayaklar görünür.
    const body = bodyRef.current;
    if (body) {
      const bodyYaw = camera.rotation.y;
      const back = 0.34;
      body.position.set(
        pos.x + Math.sin(bodyYaw) * back,
        pos.y - ROOM.eyeHeight,
        pos.z + Math.cos(bodyYaw) * back
      );
      body.rotation.y = bodyYaw;

      // Adım salınımı: hız arttıkça bacak sallanımı büyür
      const speedN = Math.min(planarSpeed / WALK_SPEED, 1.3);
      swingPhase.current += dt * planarSpeed * 2.7;
      const targetAmp = grounded.current ? 0.8 * speedN : 0.25;
      swingAmp.current = THREE.MathUtils.lerp(swingAmp.current, targetAmp, 1 - Math.exp(-8 * dt));
      const a = Math.sin(swingPhase.current) * swingAmp.current;

      if (legLRef.current) legLRef.current.rotation.x = -a * 0.85;
      if (legRRef.current) legRRef.current.rotation.x = a * 0.85;

      // Görünüm-kolları: kameraya kilitli; dururken görüşün altına iner,
      // yürüdükçe yükselir ve zıt fazda pompalar (FPS koşu hissi)
      const arms = viewArmsRef.current;
      if (arms) {
        arms.position.copy(pos);
        arms.quaternion.copy(camera.quaternion);
        armRise.current = THREE.MathUtils.lerp(
          armRise.current,
          Math.min(speedN, 1),
          1 - Math.exp(-6 * dt)
        );
        const baseY = -0.5 + armRise.current * 0.24;
        const pump = Math.sin(swingPhase.current) * 0.09 * armRise.current;
        const lift = Math.cos(swingPhase.current * 2) * 0.015 * armRise.current;
        if (viewArmLRef.current) {
          viewArmLRef.current.position.set(-0.24, baseY + lift, -0.38 + pump);
          viewArmLRef.current.rotation.x = -1.15 + pump * 1.6;
        }
        if (viewArmRRef.current) {
          viewArmRRef.current.position.set(0.24, baseY + lift, -0.38 - pump);
          viewArmRRef.current.rotation.x = -1.15 - pump * 1.6;
        }
      }
    }
  });

  // Birinci şahıs gövdesi — şık koyu takımlı manken (baş yok, kamera kafanın içinde)
  return (
    <>
    <group ref={bodyRef} visible={false}>
      {/* Gövde */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.4, 6, 14]} />
        <meshStandardMaterial color={SUIT} roughness={0.72} />
      </mesh>
      {/* Omuz hattı */}
      <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.08, 0.34, 6, 10]} />
        <meshStandardMaterial color={SUIT} roughness={0.72} />
      </mesh>

      {/* Sol bacak (kalça pivotu) */}
      <group ref={legLRef} position={[-0.12, 0.86, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.58, 6, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.77, 0.06]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.27]} />
          <meshStandardMaterial color={SHOE} roughness={0.45} metalness={0.1} />
        </mesh>
      </group>
      {/* Sağ bacak */}
      <group ref={legRRef} position={[0.12, 0.86, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.58, 6, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.77, 0.06]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.27]} />
          <meshStandardMaterial color={SHOE} roughness={0.45} metalness={0.1} />
        </mesh>
      </group>
    </group>

    {/* Görünüm-kolları: kameraya kilitli, ekranın alt köşelerinde (gölge düşürmez) */}
    <group ref={viewArmsRef} visible={false}>
      <group ref={viewArmLRef} position={[-0.24, -0.5, -0.38]} rotation={[-1.15, 0.1, 0.06]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 6, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>
      <group ref={viewArmRRef} position={[0.24, -0.5, -0.38]} rotation={[-1.15, -0.1, -0.06]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 6, 10]} />
          <meshStandardMaterial color={SUIT} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>
    </group>
  </>
  );
}
