"use client";

import { useEffect, useRef } from "react";

export function useAutoScroll<T extends HTMLElement>(dependency: unknown) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dependency]);

  return ref;
}
