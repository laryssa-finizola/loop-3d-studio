import { useId } from 'react';
import { site } from '../data/site';
import { formattedPhone, hasAnyContact, instagramProfile, whatsappLink } from '../lib/contact';
import { ExternalLink } from './ExternalLink';
import { AtIcon, ChatIcon, PinIcon } from './icons';

export function Contact() {
  const { contactSection: c, contact } = site;
  const uid = useId();
  const chat = whatsappLink();
  const insta = instagramProfile();
  const location = contact.location.trim();
  const phone = formattedPhone();

  return (
    <section id="contato" className="section contact" aria-labelledby={`${uid}-title`}>
      <div className="container contact__grid">
        <div className="contact__cta">
          <h2 id={`${uid}-title`} className="contact__title">
            {c.title}
          </h2>
          <p className="lead">{c.text}</p>

          {chat || insta ? (
            <div className="contact__actions">
              {chat ? (
                <ExternalLink className="btn btn--primary" href={chat}>
                  <ChatIcon />
                  {c.whatsappAction}
                </ExternalLink>
              ) : null}
              {insta ? (
                <ExternalLink className="btn btn--ghost" href={insta.url}>
                  <AtIcon />
                  {c.instagramAction}
                  <span className="contact__handle">{insta.handle}</span>
                </ExternalLink>
              ) : null}
            </div>
          ) : null}

          {phone || location ? (
            <ul className="contact__details">
              {phone ? (
                <li>
                  <ChatIcon />
                  <span>
                    <span className="visually-hidden">WhatsApp: </span>
                    {phone}
                  </span>
                </li>
              ) : null}
              {location ? (
                <li>
                  <PinIcon />
                  <span>
                    <span className="visually-hidden">Localização: </span>
                    {location}
                  </span>
                </li>
              ) : null}
            </ul>
          ) : null}

          {import.meta.env.DEV && !hasAnyContact() ? (
            <p className="dev-note" role="note">
              Aviso visível só no desenvolvimento: preencha <code>contact.whatsapp</code> e/ou{' '}
              <code>contact.instagram</code> em <code>src/data/site.ts</code> para exibir os botões de contato.
            </p>
          ) : null}
        </div>

        <div className="faq">
          <h3 className="faq__title">{c.faqTitle}</h3>
          {c.faq.slice(0, 3).map((item) => (
            <details key={item.question} className="faq__item">
              <summary>
                <span>{item.question}</span>
                <span className="faq__icon" aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
