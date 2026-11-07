import { useRef, useCallback } from 'react';

export function useDesktopDrag(onClick?: () => void) {
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ screenX: 0, screenY: 0, clientX: 0, clientY: 0 });
  const totalMovedDistRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    // Only drag on primary mouse button (left-click)
    if (e.button !== 0) return;

    // Don't drag if clicking interactive elements like buttons, inputs, links, textarea
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [data-no-drag="true"]')) {
      return;
    }

    // Prevent default text selection and native HTML image drag
    e.preventDefault();

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    totalMovedDistRef.current = 0;

    lastPosRef.current = {
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    const pointerId = (e as any).pointerId;
    const currentTarget = e.currentTarget as HTMLElement | null;
    if (typeof pointerId === 'number' && currentTarget && typeof currentTarget.setPointerCapture === 'function') {
      try {
        currentTarget.setPointerCapture(pointerId);
      } catch {}
    }

    const desktop = (window as any).glintDesktop;
    if (desktop?.dragStart) {
      desktop.dragStart({
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: e.clientX,
        clientY: e.clientY,
      });
    }

    const handlePointerMove = (moveEvent: PointerEvent | MouseEvent) => {
      if (!isDraggingRef.current) return;

      // Extract deltas with multi-layer fallback:
      // Priority 1: hardware movementX/movementY
      // Priority 2: screenX/screenY deltas
      // Priority 3: clientX/clientY deltas
      let dx = 0;
      let dy = 0;

      if (typeof moveEvent.movementX === 'number' && (moveEvent.movementX !== 0 || moveEvent.movementY !== 0)) {
        dx = moveEvent.movementX;
        dy = moveEvent.movementY;
      } else if (moveEvent.screenX !== 0 || moveEvent.screenY !== 0) {
        dx = moveEvent.screenX - lastPosRef.current.screenX;
        dy = moveEvent.screenY - lastPosRef.current.screenY;
      } else {
        dx = moveEvent.clientX - lastPosRef.current.clientX;
        dy = moveEvent.clientY - lastPosRef.current.clientY;
      }

      lastPosRef.current = {
        screenX: moveEvent.screenX,
        screenY: moveEvent.screenY,
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
      };

      totalMovedDistRef.current += Math.hypot(dx, dy);

      // Distinguish click from intentional drag
      if (!hasMovedRef.current && totalMovedDistRef.current > 4) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current && (dx !== 0 || dy !== 0)) {
        const desktop = (window as any).glintDesktop;
        if (desktop?.dragMove) {
          desktop.dragMove({
            dx,
            dy,
            screenX: moveEvent.screenX,
            screenY: moveEvent.screenY,
          });
        } else if (desktop?.moveBy) {
          desktop.moveBy(dx, dy);
        }
      }
    };

    const handlePointerEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (typeof pointerId === 'number' && currentTarget && typeof currentTarget.releasePointerCapture === 'function') {
        try {
          currentTarget.releasePointerCapture(pointerId);
        } catch {}
      }

      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerEnd, true);
      window.removeEventListener('mousemove', handlePointerMove, true);
      window.removeEventListener('mouseup', handlePointerEnd, true);
      window.removeEventListener('blur', handlePointerEnd, true);

      const desktop = (window as any).glintDesktop;
      if (desktop?.dragEnd) {
        desktop.dragEnd();
      }

      // If pointer moved less than the drag threshold, trigger click action
      if (!hasMovedRef.current && onClick) {
        onClick();
      }
    };

    // Use capture phase on window so events are captured continuously even during fast gestures
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerEnd, true);
    window.addEventListener('mousemove', handlePointerMove, true);
    window.addEventListener('mouseup', handlePointerEnd, true);
    window.addEventListener('blur', handlePointerEnd, true);
  }, [onClick]);

  return { handlePointerDown };
}
