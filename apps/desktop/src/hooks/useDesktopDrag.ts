import { useState, useRef } from 'react';

export function useDesktopDrag(onClick?: () => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    hasMoved: boolean;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Left click only
    if (e.button !== 0) return;

    dragRef.current = {
      startX: e.screenX,
      startY: e.screenY,
      lastX: e.screenX,
      lastY: e.screenY,
      hasMoved: false,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;

    const dx = e.screenX - dragRef.current.lastX;
    const dy = e.screenY - dragRef.current.lastY;
    dragRef.current.lastX = e.screenX;
    dragRef.current.lastY = e.screenY;

    const totalDist = Math.hypot(
      e.screenX - dragRef.current.startX,
      e.screenY - dragRef.current.startY
    );

    if (totalDist > 4) {
      dragRef.current.hasMoved = true;
    }

    if (dx !== 0 || dy !== 0) {
      if (typeof window !== 'undefined' && (window as any).glintDesktop?.moveBy) {
        (window as any).glintDesktop.moveBy(dx, dy);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const wasClick = !dragRef.current.hasMoved;
    dragRef.current = null;
    setIsDragging(false);

    if (wasClick && onClick) {
      onClick();
    }
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
  };
}
