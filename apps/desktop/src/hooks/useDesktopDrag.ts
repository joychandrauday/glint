import { useRef, useCallback } from 'react';

export function useDesktopDrag(onClick?: () => void) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ screenX: 0, screenY: 0, clientX: 0, clientY: 0 });
  const hasMovedRef = useRef(false);
  const capturedElementRef = useRef<HTMLElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag on primary mouse button
    if (e.button !== 0) return;
    
    // Don't drag if clicking interactive elements like buttons, inputs, links, textarea
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [data-no-drag="true"]')) {
      return;
    }

    // Prevent default browser selection and native HTML drag-and-drop
    e.preventDefault();

    const currentTarget = e.currentTarget as HTMLElement;
    capturedElementRef.current = currentTarget;
    pointerIdRef.current = e.pointerId;

    try {
      currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if pointer capture isn't supported on current target
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = {
      screenX: e.screenX,
      screenY: e.screenY,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    const desktop = (window as any).glintDesktop;
    if (desktop?.dragStart) {
      desktop.dragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        screenX: e.screenX,
        screenY: e.screenY,
      });
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.screenX - startPosRef.current.screenX;
      const dy = moveEvent.screenY - startPosRef.current.screenY;

      if (!hasMovedRef.current && Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        const desktop = (window as any).glintDesktop;
        if (desktop?.dragMove) {
          desktop.dragMove({
            screenX: moveEvent.screenX,
            screenY: moveEvent.screenY,
            startX: startPosRef.current.screenX,
            startY: startPosRef.current.screenY,
            clientX: startPosRef.current.clientX,
            clientY: startPosRef.current.clientY,
          });
        } else if (desktop?.moveBy) {
          desktop.moveBy(dx, dy);
          startPosRef.current.screenX = moveEvent.screenX;
          startPosRef.current.screenY = moveEvent.screenY;
        }
      }
    };

    const handlePointerEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);

      if (capturedElementRef.current && pointerIdRef.current !== null) {
        try {
          capturedElementRef.current.releasePointerCapture(pointerIdRef.current);
        } catch {
          // Ignored
        }
        capturedElementRef.current = null;
        pointerIdRef.current = null;
      }

      const desktop = (window as any).glintDesktop;
      if (desktop?.dragEnd) {
        desktop.dragEnd();
      }

      if (!hasMovedRef.current && onClick) {
        onClick();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
  }, [onClick]);

  return { handlePointerDown };
}
