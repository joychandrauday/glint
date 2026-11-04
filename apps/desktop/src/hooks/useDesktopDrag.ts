import { useState, useRef } from 'react';

export function useDesktopDrag(onClick?: () => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on primary left click
    if (e.button !== 0) return;

    dragRef.current = { startX: e.screenX, startY: e.screenY, moved: false };
    setIsDragging(true);

    let lastX = e.screenX;
    let lastY = e.screenY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.screenX - lastX;
      const dy = moveEvent.screenY - lastY;
      lastX = moveEvent.screenX;
      lastY = moveEvent.screenY;

      if (Math.hypot(moveEvent.screenX - dragRef.current!.startX, moveEvent.screenY - dragRef.current!.startY) > 3) {
        dragRef.current!.moved = true;
      }

      if (dx !== 0 || dy !== 0) {
        if (typeof window !== 'undefined' && (window as any).glintDesktop?.moveBy) {
          (window as any).glintDesktop.moveBy(dx, dy);
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);

      if (dragRef.current && !dragRef.current.moved) {
        onClick?.();
      }
      dragRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return { handleMouseDown, isDragging };
}
