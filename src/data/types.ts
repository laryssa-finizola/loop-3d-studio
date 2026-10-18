/**
 * Tipos do conteúdo do site. Os textos, contatos e peças ficam em `site.ts`;
 * este arquivo só descreve o formato esperado de cada campo.
 */

/** Ilustrações locais disponíveis enquanto não houver fotografias reais. */
export type IllustrationId =
  | 'chaveiro-nome'
  | 'plaquinha-mesa'
  | 'chaveiros-evento'
  | 'porta-copos'
  | 'engrenagem'
  | 'cantoneira'
  | 'vaso-geometrico'
  | 'organizador'
  | 'suporte-celular'
  | 'letreiro'
  | 'placa-sinalizacao';

/**
 * Fotografia real. `src` é relativo à pasta `public/`, sem barra inicial
 * (ex.: 'criacoes/chaveiro-nome.webp'). Informe a largura e a altura reais
 * do arquivo para o navegador reservar o espaço da imagem.
 */
export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Piece {
  /** Identificador único, sem espaços (usado internamente). */
  id: string;
  name: string;
  /** Uma ou duas frases sobre o uso da peça. */
  description: string;
  /**
   * Fotografia real de uma peça feita pela LOOP. Quando presente, substitui a
   * ilustração e o selo “Exemplo ilustrativo” deixa de aparecer.
   */
  photo?: Photo;
  /** Ilustração usada enquanto não houver fotografia. */
  illustration?: IllustrationId;
  /** Texto alternativo da ilustração. */
  illustrationAlt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  pieces: Piece[];
}

export interface Step {
  title: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NavItem {
  label: string;
  href: `#${string}`;
}

export interface SiteContent {
  brand: {
    name: string;
    /** Parte em destaque no logotipo em texto. */
    wordmark: { primary: string; secondary: string };
    slogan: string;
    /** Logo compacta, sem o slogan, para o cabeçalho. Enquanto `null`, o nome aparece em texto. */
    logo: Photo | null;
    /** Logo completa, com o slogan, para o rodapé. */
    logoFull: Photo | null;
  };
  seo: {
    title: string;
    description: string;
    /**
     * Endereço público final, com `https://` e barra no fim
     * (ex.: 'https://loop3dstudio.com.br/'). Usado em og:url e og:image.
     */
    url: string;
    /** Imagem de compartilhamento, relativa a `public/`. */
    image: string;
    imageAlt: string;
  };
  contact: {
    /** Somente números, com DDI e DDD. Ex.: '5583999999999'. Vazio = desativado. */
    whatsapp: string;
    /** Mensagem inicial da conversa no WhatsApp. */
    whatsappMessage: string;
    /**
     * Mensagem do botão “Quero algo parecido”.
     * `{peca}` e `{categoria}` são substituídos automaticamente.
     */
    similarMessage: string;
    /** Endereço completo do perfil. Ex.: 'https://www.instagram.com/perfil/'. */
    instagram: string;
    /** Cidade e região atendida. Vazio = não exibido. */
    location: string;
  };
  nav: NavItem[];
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    /** Vaso da abertura: se forma em camadas e depois gira. */
    demo: {
      /** Rótulo do controle que gira a peça. */
      label: string;
      caption: string;
      /** Texto do botão enquanto a peça gira. */
      pause: string;
      /** Texto do botão com a peça parada. */
      play: string;
      /** Versão 3D: status no anel de progresso. */
      printing: string;
      done: string;
      /** Versão 3D: dica de que dá para arrastar a peça. */
      dragHint: string;
    };
  };
  showcase: {
    title: string;
    intro: string;
    illustrativeLabel: string;
    similarAction: string;
    categories: Category[];
  };
  process: {
    title: string;
    intro: string;
    steps: Step[];
    /** Texto do botão abaixo das etapas, que leva ao Instagram (aparece se o Instagram estiver preenchido). */
    cta: string;
  };
  about: {
    title: string;
    text: string;
    /** Foto real da bancada, impressora ou ambiente de trabalho. */
    photo: Photo | null;
  };
  contactSection: {
    title: string;
    text: string;
    whatsappAction: string;
    instagramAction: string;
    faqTitle: string;
    faq: FaqItem[];
  };
}