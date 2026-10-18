import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { site } from './src/data/site';

/**
 * Base dos caminhos:
 * - Vercel ou domínio próprio: '/' (padrão).
 * - GitHub Pages em subcaminho: '/nome-do-repositorio/' (definido pelo workflow via BASE_PATH).
 */
function resolveBase(): string {
  const raw = process.env.BASE_PATH?.trim() || '/';
  const withLead = raw.startsWith('/') ? raw : `/${raw}`;
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

/**
 * Dados estruturados (schema.org) da empresa, para o Google entender nome,
 * cidade, telefone e Instagram. Só usa campos preenchidos em site.ts.
 */
function businessJsonLd(url: string): string {
  const { brand, seo, contact } = site;
  const phone = contact.whatsapp.replace(/\D/g, '');
  const [city, region] = contact.location.split(',').map((part) => part.trim());
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand.name,
    slogan: brand.slogan,
    description: seo.description,
    url,
    image: new URL(seo.image.replace(/^\/+/, ''), url).href,
  };
  if (brand.logoFull) data.logo = new URL(brand.logoFull.src.replace(/^\/+/, ''), url).href;
  if (phone) data.telephone = `+${phone}`;
  if (city) {
    data.address = {
      '@type': 'PostalAddress',
      addressLocality: city,
      ...(region ? { addressRegion: region } : {}),
      addressCountry: 'BR',
    };
    data.areaServed = city;
  }
  if (/^https:\/\//.test(contact.instagram)) data.sameAs = [contact.instagram];
  // "<" escapado para o JSON não fechar a tag <script> por engano.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Preenche título, descrição e metadados de compartilhamento a partir de src/data/site.ts. */
function siteMeta(): Plugin {
  return {
    name: 'loop-site-meta',
    buildStart() {
      if (!site.contact.whatsapp.replace(/\D/g, '')) {
        console.warn('\n[loop] WhatsApp ainda não configurado em src/data/site.ts: os botões de contato ficam ocultos.\n');
      }
    },
    transformIndexHtml(html) {
      const { seo, brand } = site;
      const url = /^https:\/\//.test(seo.url) ? (seo.url.endsWith('/') ? seo.url : `${seo.url}/`) : '';
      const tags: string[] = [
        `<title>${escapeHtml(seo.title)}</title>`,
        `<meta name="description" content="${escapeHtml(seo.description)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:locale" content="pt_BR" />`,
        `<meta property="og:site_name" content="${escapeHtml(brand.name)}" />`,
        `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
      ];
      // og:url, og:image e os dados estruturados exigem endereço absoluto:
      // só entram quando seo.url estiver preenchido.
      if (url) {
        const image = new URL(seo.image.replace(/^\/+/, ''), url).href;
        tags.push(
          `<link rel="canonical" href="${escapeHtml(url)}" />`,
          `<meta property="og:url" content="${escapeHtml(url)}" />`,
          `<meta property="og:image" content="${escapeHtml(image)}" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
          `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
          businessJsonLd(url),
        );
      }
      return html.replace('<!--site-meta-->', tags.join('\n    '));
    },
  };
}

export default defineConfig(() => {
  const base = resolveBase();
  return {
    base,
    plugins: [react(), siteMeta()],
    build: {
      target: 'es2020',
      assetsInlineLimit: 4096,
    },
  };
});