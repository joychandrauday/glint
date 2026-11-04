import { useRef, useCallback } from 'react';

export function useDesktopDrag(onClick?: () => void) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag on primary mouse button
    if (e.button !== 0) return;
    
    // Don't drag if clicking interactive elements like buttons, inputs, links
    const target = e.target as HTMLElement;
    if (target.closest('button, input, a, [data-no-drag="true"]')) {
      return;
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = { x: e.screenX, y: e.screenY };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.screenX - startPosRef.current.x;
      const dy = moveEvent.screenY - startPosRef.current.y;

      if (Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        const desktop = (window as any).glintDesktop;
        if (desktop?.moveBy) {
          desktop.moveBy(dx, dy);
        }
        startPosRef.current = { x: moveEvent.screenX, y: moveEvent.screenY };
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (!hasMovedRef.current && onClick) {
        onClick();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [onClick]);

  return { handlePointerDown };
}
