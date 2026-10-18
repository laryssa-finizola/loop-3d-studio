import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { site } from '../data/site';
import type { Piece } from '../data/types';
import { assetUrl } from '../lib/asset';
import { similarLink } from '../lib/contact';
import { Illustration } from '../illustrations/pieces';
import { ExternalLink } from './ExternalLink';
import { ChatIcon } from './icons';

function PieceImage({ piece, decorative = false, className }: { piece: Piece; decorative?: boolean; className: string }) {
  if (piece.photo) {
    return (
      <img
        className={`${className} is-photo`}
        src={assetUrl(piece.photo.src)}
        alt={decorative ? '' : piece.photo.alt}
        width={piece.photo.width}
        height={piece.photo.height}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (piece.illustration) {
    return (
      <Illustration
        id={piece.illustration}
        alt={decorative ? '' : (piece.illustrationAlt ?? `Ilustração: ${piece.name}`)}
        className={className}
      />
    );
  }
  return null;
}

export function Showcase() {
  const { showcase } = site;
  const categories = showcase.categories.filter((c) => c.pieces.length > 0);
  const uid = useId();
  const [catIndex, setCatIndex] = useState(0);
  const [pieceIndex, setPieceIndex] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  if (categories.length === 0) return null;

  const category = categories[catIndex];
  const piece = category.pieces[Math.min(pieceIndex, category.pieces.length - 1)];
  const isIllustration = !piece.photo;
  const similar = similarLink(piece.name, category.name);

  const selectCategory = (index: number, focus = false) => {
    const next = (index + categories.length) % categories.length;
    setCatIndex(next);
    setPieceIndex(0);
    if (focus) tabs.current[next]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: catIndex + 1,
      ArrowDown: catIndex + 1,
      ArrowLeft: catIndex - 1,
      ArrowUp: catIndex - 1,
      Home: 0,
      End: categories.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      selectCategory(keys[e.key], true);
    }
  };

  const panelId = `${uid}-panel`;

  return (
    <section id="criacoes" className="section showcase" aria-labelledby={`${uid}-title`}>
      <div className="container">
        <div className="showcase__head">
          <h2 id={`${uid}-title`} className="section-title">
            {showcase.title}
          </h2>
          <p className="lead">{showcase.intro}</p>
        </div>

        <div className="showcase__body">
          <div className="showcase__tabs" role="tablist" aria-label="Categorias de criações">
            {categories.map((c, i) => {
              const selected = i === catIndex;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`${uid}-tab-${c.id}`}
                  type="button"
                  role="tab"
                  className="showcase__tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectCategory(i)}
                  onKeyDown={onTabKey}
                >
                  <span className="showcase__tab-name">{c.name}</span>
                  <span className="showcase__tab-count">
                    {c.pieces.length} {c.pieces.length === 1 ? 'exemplo' : 'exemplos'}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id={panelId}
            className="showcase__panel"
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${category.id}`}
          >
            <div className={`showcase__stage${isIllustration ? '' : ' has-photo'}`}>
              <div className="showcase__media" key={`${category.id}-${piece.id}`}>
                <PieceImage piece={piece} className="showcase__img" />
              </div>
              {isIllustration ? <span className="showcase__badge">{showcase.illustrativeLabel}</span> : null}
            </div>

            <div className="showcase__info">
              <p className="showcase__cat-desc">{category.description}</p>
              <div aria-live="polite">
                <div className="showcase__piece" key={`${category.id}-${piece.id}`}>
                  <h3>{piece.name}</h3>
                  <p>{piece.description}</p>
                </div>
              </div>

              {category.pieces.length > 1 ? (
                <fieldset className="showcase__thumbs">
                  <legend className="visually-hidden">Exemplos de {category.name}</legend>
                  {category.pieces.map((p, i) => (
                    <label key={p.id} className="thumb" title={p.name}>
                      <input
                        type="radio"
                        className="visually-hidden"
                        name={`${uid}-piece`}
                        value={p.id}
                        checked={p.id === piece.id}
                        onChange={() => setPieceIndex(i)}
                      />
                      <span className="thumb__box">
                        <PieceImage piece={p} decorative className="thumb__img" />
                      </span>
                      <span className="visually-hidden">{p.name}</span>
                    </label>
                  ))}
                </fieldset>
              ) : null}

              {similar ? (
                <ExternalLink className="btn btn--ghost showcase__cta" href={similar}>
                  <ChatIcon />
                  {showcase.similarAction}
                </ExternalLink>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
