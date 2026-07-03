import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { ProjectEntry, BoardEntry } from './data';

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
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
      setTexture((prev) => {
        prev.dispose();
        return toTexture(draw());
      });
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
