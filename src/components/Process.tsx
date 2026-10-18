import { useId, type CSSProperties } from 'react';
import { site } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { instagramProfile } from '../lib/contact';
import { ExternalLink } from './ExternalLink';
import { AtIcon } from './icons';

export function Process() {
  const { process } = site;
  const uid = useId();
  const { ref, state } = useReveal<HTMLOListElement>();
  const insta = instagramProfile();

  return (
    <section id="como-funciona" className="section process" aria-labelledby={`${uid}-title`}>
      <div className="container">
        <div className="process__head">
          <h2 id={`${uid}-title`} className="section-title">
            {process.title}
          </h2>
          {process.intro ? <p className="lead">{process.intro}</p> : null}
        </div>
        <ol ref={ref} className="steps" data-reveal={state}>
          {process.steps.map((step, i) => (
            <li key={step.title} className="step" style={{ '--i': i } as CSSProperties}>
              <span className="step__num" aria-hidden="true">
                <span>{i + 1}</span>
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.text}</p>
            </li>
          ))}
        </ol>

        {insta ? (
          <div className="process__cta">
            <ExternalLink className="btn process__cta-btn" href={insta.url}>
              <AtIcon />
              {process.cta}
            </ExternalLink>
            <span className="process__cta-handle">{insta.handle}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}