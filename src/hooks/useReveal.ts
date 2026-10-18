import { useEffect, useRef, useState } from 'react';

type RevealState = 'static' | 'armed' | 'shown';

/**
 * Entrada suave ao aparecer na tela. O conteúdo só é escondido depois que o
 * JavaScript confirma que o elemento ainda está fora da tela; sem JS, sem
 * IntersectionObserver ou com movimento reduzido, ele fica sempre visível.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>('static');

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    setState('armed');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('shown');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, state };
}
