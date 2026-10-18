import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** Link que abre em nova aba, com aviso para leitores de tela. */
export function ExternalLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (abre em nova aba)</span>
    </a>
  );
}
