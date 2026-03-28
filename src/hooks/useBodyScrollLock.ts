import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

/**
 * Prevents page scroll behind fixed overlays (modals, chat sheet, drawers).
 * Ref-counted so nested overlays (e.g. memory drawer on open dock) stay correct on iOS.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const body = document.body;
    const html = document.documentElement;

    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        html.style.overflow = "";
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [locked]);
}
