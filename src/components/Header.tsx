import { useEffect, useRef, useState } from 'react';
import { site } from '../data/site';
import { whatsappLink } from '../lib/contact';
import { Brand } from './Brand';
import { ExternalLink } from './ExternalLink';
import { MenuIcon } from './icons';

export function Header() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const quote = whatsappLink();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 60em)');
    const onChange = () => desktop.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onChange);
    };
  }, [open]);

  return (
    <header className={`header${open ? ' is-open' : ''}`}>
      <div className="container header__bar">
        <Brand />
        <button
          ref={buttonRef}
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
          <span>{open ? 'Fechar' : 'Menu'}</span>
        </button>
        <nav id="menu-principal" className="header__nav" aria-label="Principal">
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {quote ? (
            <ExternalLink className="btn btn--primary header__cta" href={quote} onClick={() => setOpen(false)}>
              Pedir orçamento
            </ExternalLink>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
