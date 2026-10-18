import { useId } from 'react';
import { site } from '../data/site';
import { assetUrl } from '../lib/asset';

export function About() {
  const { about, brand } = site;
  const uid = useId();

  return (
    <section id="sobre" className={`section about${about.photo ? ' has-photo' : ''}`} aria-labelledby={`${uid}-title`}>
      <div className="container about__grid">
        <h2 id={`${uid}-title`} className="about__title">
          {about.title}
        </h2>
        <div className="about__body">
          <p className="about__text">{about.text}</p>
          <p className="about__slogan">{brand.slogan}</p>
        </div>
        {about.photo ? (
          <figure className="about__photo">
            <img
              src={assetUrl(about.photo.src)}
              alt={about.photo.alt}
              width={about.photo.width}
              height={about.photo.height}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
