import { useRef, useCallback } from 'react';

export function useWindowResize() {
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    startPosRef.current = { x: e.screenX, y: e.screenY };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isResizingRef.current) return;
      const dx = moveEvent.screenX - startPosRef.current.x;
      const dy = moveEvent.screenY - startPosRef.current.y;

      if (dx !== 0 || dy !== 0) {
        const desktop = (window as any).glintDesktop;
        if (desktop?.resizeBy) {
          desktop.resizeBy(dx, dy);
        }
        startPosRef.current = { x: moveEvent.screenX, y: moveEvent.screenY };
      }
    };

    const handlePointerUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, []);

  return { handleResizePointerDown };
}
