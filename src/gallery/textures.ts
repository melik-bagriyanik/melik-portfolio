import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type {
  ProjectEntry,
  BoardEntry,
  ExperienceEntry,
  EducationItem,
  RoomInfo,
} from './data';

// Dokunmatik cihazlarda GPU doku belleğini düşürmek için tuvaller küçük üretilir
const TEXTURE_SCALE =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 0.6 : 1;

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * TEXTURE_SCALE);
  canvas.height = Math.round(h * TEXTURE_SCALE);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(TEXTURE_SCALE, TEXTURE_SCALE);
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Ekran görüntüsü olmayan projeler için zarif, markaya uygun sergi posteri üretir. */
export function drawPoster(project: ProjectEntry): HTMLCanvasElement {
  const W = 1024;
  const H = 1280;
  const { canvas, ctx } = makeCanvas(W, H);

  // Krem zemin
  ctx.fillStyle = '#faf6ec';
  ctx.fillRect(0, 0, W, H);

  // Yumuşak accent ışıması
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.36, 60, W * 0.5, H * 0.36, W * 0.75);
  glow.addColorStop(0, project.accent + '33');
  glow.addColorStop(1, project.accent + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Soyut kompozisyon: eş merkezli yaylar
  ctx.save();
  ctx.translate(W * 0.5, H * 0.38);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 120 + i * 62, Math.PI * (0.9 + i * 0.12), Math.PI * (1.9 + i * 0.08));
    ctx.strokeStyle = i % 2 === 0 ? project.accent + 'aa' : '#c9a44b88';
    ctx.lineWidth = 10 - i * 1.5;
    ctx.stroke();
  }
  // Merkez baş harf
  ctx.font = '900 300px Outfit, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#292524';
  ctx.fillText(project.title.charAt(0).toUpperCase(), 0, 16);
  ctx.restore();

  // Alt tipografi bloğu
  ctx.textAlign = 'center';
  ctx.fillStyle = '#292524';
  ctx.font = '800 86px Outfit, Inter, sans-serif';
  ctx.fillText(project.title.toUpperCase(), W / 2, H * 0.74);

  ctx.fillStyle = '#a98438';
  ctx.font = '600 34px Inter, sans-serif';
  const sub = project.subtitle.toUpperCase();
  ctx.save();
  ctx.letterSpacing = '8px';
  ctx.fillText(sub, W / 2, H * 0.795);
  ctx.restore();

  // Altın ayraç çizgisi
  ctx.strokeStyle = '#c9a44b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70, H * 0.84);
  ctx.lineTo(W / 2 + 70, H * 0.84);
  ctx.stroke();

  ctx.fillStyle = '#78716c';
  ctx.font = '600 30px Inter, sans-serif';
  ctx.fillText(project.year, W / 2, H * 0.89);

  // İnce çerçeve içi kenarlık
  ctx.strokeStyle = '#29252422';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  return canvas;
}

/** Hakkımda / İletişim duvar panoları */
export function drawBoard(board: BoardEntry): HTMLCanvasElement {
  const W = 1120;
  const H = 800;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#fbf8f0';
  ctx.fillRect(0, 0, W, H);

  const wash = ctx.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, '#c9a44b14');
  wash.addColorStop(1, '#c9a44b00');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a98438';
  ctx.font = '800 40px Outfit, Inter, sans-serif';
  ctx.save();
  ctx.letterSpacing = '14px';
  ctx.fillText(board.title, 84, 130);
  ctx.restore();

  ctx.strokeStyle = '#c9a44b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(84, 168);
  ctx.lineTo(228, 168);
  ctx.stroke();

  ctx.fillStyle = '#3d3a34';
  ctx.font = '500 41px Inter, sans-serif';
  let y = 262;
  for (const line of board.lines) {
    if (line) ctx.fillText(line, 84, y);
    y += line ? 62 : 34;
  }

  ctx.strokeStyle = '#29252418';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Kariyer panosu: şirket, rol, dönem + ilk maddeler */
export function drawCareerBoard(exp: ExperienceEntry): HTMLCanvasElement {
  const W = 1120;
  const H = 760;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#fbf8f0';
  ctx.fillRect(0, 0, W, H);
  const wash = ctx.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, '#c9a44b14');
  wash.addColorStop(1, '#c9a44b00');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a98438';
  ctx.font = '700 30px Inter, sans-serif';
  ctx.save();
  ctx.letterSpacing = '10px';
  ctx.fillText('KARİYER', 84, 96);
  ctx.restore();

  ctx.fillStyle = '#292524';
  ctx.font = '800 66px Outfit, Inter, sans-serif';
  ctx.fillText(exp.company, 84, 178);

  ctx.fillStyle = '#57534e';
  ctx.font = '600 38px Inter, sans-serif';
  ctx.fillText(exp.role, 84, 236);

  ctx.fillStyle = '#a98438';
  ctx.font = '700 30px Inter, sans-serif';
  ctx.fillText(`${exp.period} · ${exp.location}`, 84, 292);

  ctx.strokeStyle = '#c9a44b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(84, 330);
  ctx.lineTo(240, 330);
  ctx.stroke();

  ctx.fillStyle = '#3d3a34';
  ctx.font = '500 32px Inter, sans-serif';
  let y = 398;
  outer: for (const bullet of exp.bullets) {
    const lines = wrapText(ctx, bullet, W - 220);
    for (let i = 0; i < lines.length; i++) {
      if (y > H - 70) break outer;
      if (i === 0) {
        ctx.fillStyle = '#c9a44b';
        ctx.fillText('◆', 84, y);
        ctx.fillStyle = '#3d3a34';
      }
      ctx.fillText(lines[i], 128, y);
      y += 46;
    }
    y += 14;
  }

  ctx.strokeStyle = '#29252418';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  return canvas;
}

/** Eğitim panosu */
export function drawEducationBoard(items: EducationItem[]): HTMLCanvasElement {
  const W = 1120;
  const H = 760;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#fbf8f0';
  ctx.fillRect(0, 0, W, H);
  const wash = ctx.createLinearGradient(W, 0, 0, H);
  wash.addColorStop(0, '#c9a44b14');
  wash.addColorStop(1, '#c9a44b00');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a98438';
  ctx.font = '700 30px Inter, sans-serif';
  ctx.save();
  ctx.letterSpacing = '10px';
  ctx.fillText('EĞİTİM', 84, 108);
  ctx.restore();

  ctx.strokeStyle = '#c9a44b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(84, 146);
  ctx.lineTo(210, 146);
  ctx.stroke();

  let y = 232;
  for (const item of items) {
    ctx.fillStyle = '#292524';
    ctx.font = '800 40px Outfit, Inter, sans-serif';
    ctx.fillText(item.school, 84, y);
    ctx.fillStyle = '#57534e';
    ctx.font = '500 32px Inter, sans-serif';
    ctx.fillText(`${item.degree} · ${item.period}`, 84, y + 48);
    if (item.note) {
      ctx.fillStyle = '#8a8378';
      ctx.font = '500 28px Inter, sans-serif';
      ctx.fillText(item.note, 84, y + 90);
    }
    y += 172;
  }

  ctx.strokeStyle = '#29252418';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  return canvas;
}

/** Sergi planı (kroki) panosu */
export function drawGuideBoard(rooms: RoomInfo[]): HTMLCanvasElement {
  const W = 1120;
  const H = 820;
  const { canvas, ctx } = makeCanvas(W, H);

  ctx.fillStyle = '#fbf8f0';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a98438';
  ctx.font = '700 30px Inter, sans-serif';
  ctx.save();
  ctx.letterSpacing = '10px';
  ctx.fillText('SERGİ PLANI', 84, 96);
  ctx.restore();

  ctx.strokeStyle = '#c9a44b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(84, 130);
  ctx.lineTo(300, 130);
  ctx.stroke();

  // Dünya → tuval dönüşümü (x: -20..20, z: -21..21; z aşağı doğru büyür)
  const scale = 15;
  const px = (x: number) => 560 + x * scale;
  const py = (z: number) => 470 + z * scale;

  ctx.textAlign = 'center';
  for (const room of rooms) {
    const [x1, z1, x2, z2] = room.rect;
    const rx = px(x1);
    const ry = py(z1);
    const rw = (x2 - x1) * scale;
    const rh = (z2 - z1) * scale;
    ctx.fillStyle = '#f3ecdb';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#a98438';
    ctx.lineWidth = 3;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = '#44403c';
    ctx.font = '700 24px Inter, sans-serif';
    ctx.fillText(room.name.toUpperCase(), rx + rw / 2, ry + rh / 2 + 8);
  }

  // "Buradasınız" işareti (giriş holü)
  ctx.fillStyle = '#c9a44b';
  ctx.beginPath();
  ctx.arc(px(0), py(17), 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#84682d';
  ctx.font = '700 24px Inter, sans-serif';
  ctx.fillText('BURADASINIZ', px(0), py(17) + 44);

  ctx.strokeStyle = '#29252418';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  return canvas;
}

/** Anıt hologramı: havada asılı yetenek çipi */
export function drawHoloChip(label: string): HTMLCanvasElement {
  const W = 256;
  const H = 88;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.beginPath();
  ctx.roundRect(6, 6, W - 12, H - 12, 22);
  ctx.fillStyle = 'rgba(30, 24, 14, 0.78)';
  ctx.fill();
  ctx.strokeStyle = '#e8c37a';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = '700 34px Outfit, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText(label, W / 2, H / 2 + 2);
  return canvas;
}

/** Anıt hologramı: eğitim bilgisi kartı */
export function drawHoloCard(
  title: string,
  rows: { head: string; sub: string }[]
): HTMLCanvasElement {
  const W = 760;
  const H = 430;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.beginPath();
  ctx.roundRect(8, 8, W - 16, H - 16, 26);
  ctx.fillStyle = 'rgba(28, 22, 13, 0.82)';
  ctx.fill();
  ctx.strokeStyle = '#e8c37a';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#e8c37a';
  ctx.font = '800 30px Outfit, Inter, sans-serif';
  ctx.save();
  ctx.letterSpacing = '8px';
  ctx.fillText(title, 52, 76);
  ctx.restore();
  ctx.strokeStyle = 'rgba(232,195,122,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(52, 100);
  ctx.lineTo(180, 100);
  ctx.stroke();

  let y = 160;
  for (const row of rows) {
    ctx.fillStyle = '#fdf4dd';
    ctx.font = '700 32px Inter, sans-serif';
    ctx.fillText(row.head, 52, y);
    ctx.fillStyle = 'rgba(253,244,221,0.62)';
    ctx.font = '500 26px Inter, sans-serif';
    ctx.fillText(row.sub, 52, y + 38);
    y += 100;
  }
  return canvas;
}

/** Tabloların önünde zemine vuran sıcak spot havuzu (fırınlanmış görünüm) */
export function makeLightPoolTexture(): THREE.Texture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
  g.addColorStop(0, 'rgba(255, 240, 205, 0.85)');
  g.addColorStop(0.45, 'rgba(255, 236, 195, 0.35)');
  g.addColorStop(1, 'rgba(255, 236, 195, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

/** Kaidelerin altına yumuşak temas gölgesi */
export function makeBlobShadowTexture(): THREE.Texture {
  const { canvas, ctx } = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, 'rgba(40,32,18,0.42)');
  g.addColorStop(0.6, 'rgba(40,32,18,0.18)');
  g.addColorStop(1, 'rgba(40,32,18,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Canvas dokusunu web fontları yüklendikten sonra (yeniden) üretir —
 * aksi halde posterler sistem fontuyla çizilirdi.
 */
export function useCanvasTexture(draw: () => HTMLCanvasElement): THREE.CanvasTexture {
  const [texture, setTexture] = useState(() => toTexture(draw()));

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      // Eski dokunun dispose'u aşağıdaki [texture] cleanup'ında yapılır;
      // updater saf kalmalı (StrictMode çift çağırır).
      setTexture(toTexture(draw()));
    });
    return () => {
      cancelled = true;
    };
    // draw, veri sabitlerinden beslenir; mount başına bir kez yenilemek yeterli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}
