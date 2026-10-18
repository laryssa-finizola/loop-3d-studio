import { site } from '../data/site';
import { whatsappLink } from '../lib/contact';
import { ExternalLink } from './ExternalLink';
import { ChatIcon } from './icons';
import { HeroVisual } from './HeroVisual';

export function Hero() {
  const { hero } = site;
  const chat = whatsappLink();

  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__kicker">{hero.kicker}</p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__title-main">{hero.title}</span>{' '}
            <span className="hero__title-sub">{hero.subtitle}</span>
          </h1>
          <p className="hero__desc">{hero.description}</p>
          <div className="hero__actions">
            {chat ? (
              <ExternalLink className="btn btn--primary" href={chat}>
                <ChatIcon />
                {hero.primaryAction}
              </ExternalLink>
            ) : (
              // Sem WhatsApp configurado, a ação leva à seção de contato.
              <a className="btn btn--primary" href="#contato">
                {hero.primaryAction}
              </a>
            )}
            <a className="btn btn--ghost" href="#criacoes">
              {hero.secondaryAction}
            </a>
          </div>
        </div>
        <div className="hero__visual">
          <HeroVisual demo={hero.demo} />
        </div>
      </div>
    </section>
  );
}