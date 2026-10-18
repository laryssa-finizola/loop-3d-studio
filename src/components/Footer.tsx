import { site } from '../data/site';
import { formattedPhone, instagramProfile, whatsappLink } from '../lib/contact';
import { Brand } from './Brand';
import { ExternalLink } from './ExternalLink';

export function Footer() {
  const chat = whatsappLink();
  const phone = formattedPhone();
  const insta = instagramProfile();
  const location = site.contact.location.trim();
  const hasContacts = Boolean(chat || insta || location);

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Brand variant="full" />
        </div>
        <nav aria-label="Rodapé" className="footer__nav">
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        {hasContacts ? (
          <ul className="footer__contacts" aria-label="Contatos">
            {chat ? (
              <li>
                <ExternalLink href={chat}>WhatsApp {phone}</ExternalLink>
              </li>
            ) : null}
            {insta ? (
              <li>
                <ExternalLink href={insta.url}>Instagram {insta.handle}</ExternalLink>
              </li>
            ) : null}
            {location ? <li>{location}</li> : null}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}
