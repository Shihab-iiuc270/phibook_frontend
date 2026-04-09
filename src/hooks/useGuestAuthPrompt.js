import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "phi_guest_auth_prompt_dismissed_v1";

const safeGetSessionValue = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const safeSetSessionValue = (value) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
};

/**
 * Guest-only auth prompt that triggers after the user scrolls and spends some time on the page.
 */
const useGuestAuthPrompt = ({
  enabled = true,
  minSecondsAfterFirstScroll = 5,
  minScrollPx = 450,
  minScrollPercent = 0.12,
} = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const armedRef = useRef(false);
  const firstScrollAtRef = useRef(null);
  const timeoutRef = useRef(null);
  const dismissedRef = useRef(false);

  const dismiss = () => {
    dismissedRef.current = true;
    safeSetSessionValue("1");
    setIsOpen(false);
  };

  useEffect(() => {
    if (!enabled) {
      setIsOpen(false);
      return;
    }

    dismissedRef.current = safeGetSessionValue() === "1";
    if (dismissedRef.current) return;

    if (typeof window === "undefined" || typeof document === "undefined") return;

    const shouldOpen = () => {
      if (dismissedRef.current) return false;
      if (isOpen) return false;

      const firstScrollAt = firstScrollAtRef.current;
      if (!firstScrollAt) return false;

      const elapsedMs = Date.now() - firstScrollAt;
      if (elapsedMs < minSecondsAfterFirstScroll * 1000) return false;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = Math.max(
        document.documentElement?.scrollHeight || 0,
        document.body?.scrollHeight || 0
      );
      const viewHeight = window.innerHeight || 0;
      const maxScrollable = Math.max(1, docHeight - viewHeight);
      const scrollPercent = scrollY / maxScrollable;

      return scrollY >= minScrollPx || scrollPercent >= minScrollPercent;
    };

    const openOnce = () => {
      if (!shouldOpen()) return;
      setIsOpen(true);
      cleanup();
    };

    const onScroll = () => {
      if (dismissedRef.current) return;
      if (!firstScrollAtRef.current) {
        firstScrollAtRef.current = Date.now();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(openOnce, minSecondsAfterFirstScroll * 1000);
      }

      if (!armedRef.current) return;
      openOnce();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", onScroll);
      armedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // Arm after mount so we don't open from any initial scroll restoration.
    armedRef.current = true;
    window.addEventListener("scroll", onScroll, { passive: true });

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, minSecondsAfterFirstScroll, minScrollPx, minScrollPercent]);

  return { isOpen, dismiss, setIsOpen };
};

export default useGuestAuthPrompt;
