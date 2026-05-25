"use client"

import * as React from "react"
import { useRef, useEffect } from "react";

const MouseFollowingEyes: React.FC = () => {
  const eye1Ref = useRef<HTMLDivElement>(null);
  const eye2Ref = useRef<HTMLDivElement>(null);
  const pupil1Ref = useRef<HTMLDivElement>(null);
  const pupil2Ref = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: 0, y: 0 });
  const center1Ref = useRef({ x: 0, y: 0 });
  const center2Ref = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateCenters = () => {
      if (eye1Ref.current) {
        const r = eye1Ref.current.getBoundingClientRect();
        center1Ref.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      if (eye2Ref.current) {
        const r = eye2Ref.current.getBoundingClientRect();
        center2Ref.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    };

    updateCenters();
    window.addEventListener("resize", updateCenters);
    window.addEventListener("scroll", updateCenters, { passive: true });

    const movePupil = (
      pupilEl: HTMLDivElement | null,
      center: { x: number; y: number },
      maxMove: number
    ) => {
      if (!pupilEl) return;
      const dx = mouseRef.current.x - center.x;
      const dy = mouseRef.current.y - center.y;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy) / 4, maxMove);
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;
      pupilEl.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };

    const tick = () => {
      movePupil(pupil1Ref.current, center1Ref.current, 14);
      movePupil(pupil2Ref.current, center2Ref.current, 14);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", updateCenters);
      window.removeEventListener("scroll", updateCenters);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center rounded-xl">
      <div className="flex gap-3">
        <Eye eyeRef={eye1Ref} pupilRef={pupil1Ref} />
        <Eye eyeRef={eye2Ref} pupilRef={pupil2Ref} />
      </div>
    </div>
  );
};

interface EyeViewProps {
  eyeRef: React.RefObject<HTMLDivElement>;
  pupilRef: React.RefObject<HTMLDivElement>;
}

const Eye: React.FC<EyeViewProps> = ({ eyeRef, pupilRef }) => {
  return (
    <div
      ref={eyeRef}
      className="relative bg-white border-[3px] border-black rounded-full h-24 w-24 md:h-32 md:w-32 flex items-center justify-center will-change-transform"
    >
      <div
        ref={pupilRef}
        className="absolute bg-black rounded-full h-7 w-7 md:h-9 md:w-9 will-change-transform"
      >
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full absolute bottom-1 right-1"></div>
      </div>
    </div>
  );
};

export { MouseFollowingEyes };
