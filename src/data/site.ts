import type { SiteContent } from './types';

export const site: SiteContent = {
  brand: {
    name: 'LOOP 3D Studio',
    wordmark: { primary: 'LOOP', secondary: '3D Studio' },
    slogan: 'Sua ideia em 3D',
    logo: { src: 'brand/loop-logo-compacta.webp', alt: 'LOOP 3D Studio', width: 300, height: 121 },
    logoFull: { src: 'brand/loop-logo.webp', alt: 'LOOP 3D Studio — Sua ideia em 3D', width: 560, height: 251 },
  },

  seo: {
    title: 'LOOP 3D Studio · Impressão 3D',
    description:
      'Produtos personalizados, brindes, peças técnicas, decoração e comunicação visual em impressão 3D. Estúdio em João Pessoa, Paraíba.',
    url: 'https://loop-3d-studio.vercel.app/',
    image: 'og-image.png',
    imageAlt: 'Logo da LOOP 3D Studio com o slogan Sua ideia em 3D.',
  },

  contact: {
    whatsapp: '5583988782144',
    whatsappMessage: 'Olá! Conheci a LOOP 3D Studio pelo site e gostaria de conversar sobre uma ideia.',
    similarMessage:
      'Olá! Conheci a LOOP 3D Studio pelo site. Vi o exemplo “{peca}” ({categoria}) e gostaria de conversar sobre algo parecido.',
    instagram: 'https://www.instagram.com/loop.3d.studio/',
    location: 'João Pessoa, Paraíba',
  },

  nav: [
    { label: 'Criações', href: '#criacoes' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
  ],

  hero: {
    kicker: 'LOOP 3D Studio · Impressão 3D',
    title: 'Sua ideia ganha forma.',
    subtitle: 'Camada por camada.',
    description:
      'Produtos personalizados, presentes, decorações  e soluções em impressão 3D para diferentes ideias e projetos.',
    primaryAction: 'Quero criar minha peça',
    secondaryAction: 'Explorar criações',
    demo: {
      label: 'Gire a peça',
      caption: 'Demonstração ilustrativa de uma peça impressa em camadas.',
      pause: 'Pausar giro',
      play: 'Girar peça',
      printing: 'Imprimindo',
      done: 'Concluído',
      dragHint: 'Arraste a peça para girar.',
    },
  },

  showcase: {
    title: 'O que podemos criar juntos?',
    intro:
      'Escolha uma categoria e veja exemplos do que dá para fazer com impressão 3D. Se a sua ideia não estiver aqui, conte para a gente.',
    illustrativeLabel: 'Exemplo ilustrativo',
    similarAction: 'Quero algo parecido',
    categories: [
      {
        id: 'personalizados',
        name: 'Chaveiros personalizados',
        description:
          'Peças com detalhes escolhidos por você para usar no dia a dia ou presentear alguém.',
        pieces: [
          {
            id: 'chaveiro-personalizado',
            name: 'Chaveiro Dia dos Professores',
            description: 'Chaveiro para celebrar o Dia dos Professores, com o nome em relevo e detalhes delicados.',
            photo: {
              src: 'criacoes/chaveiro1.webp',
              alt: 'Chaveiros com nomes de professoras em relevo, nas cores verde, preto, rosa e branco.',
              width: 675,
              height: 1200,
            },
          },
          {
            id: 'chaveiro-jesus-vive',
            name: 'Chaveiro Jesus Vive',
            description: 'Chaveiro em formato de cruz com a mensagem “Jesus Vive” em relevo, para lembranças de batizados, encontros e celebrações.',
            photo: {
              src: 'criacoes/chaveiro-jesus.webp',
              alt: 'Quatro chaveiros amarelos em formato de cruz com as palavras Jesus e Vive em preto, sobre uma mesa com flores.',
              width: 872,
              height: 872,
            },
          },
        ],
      },
      {
        id: 'brindes',
        name: 'Brindes e lembranças',
        description: 'Pequenas peças para marcar eventos, datas especiais e ações de marca.',
        pieces: [
          {
            id: 'lembranca-campeonato',
            name: 'Lembrança da Copa Campestre ',
            description: 'Chaveiros com a identidade de um campeonato para entregar aos participantes.',
            photo: {
              src: 'criacoes/brindes1.webp',
              alt: 'Chaveiro verde e dourado da Copa Campestre de Handebol.',
              width: 1200,
              height: 900,
            },
          },
          {
            id: 'chaveiro-porta-retrato',
            name: 'Chaveiro porta-retrato',
            description: 'Chaveiro em formato de casinha com espaço para uma foto ou um desenho especial, para guardar uma lembrança sempre por perto.',
            photo: {
              src: 'criacoes/brinde-casinha.webp',
              alt: 'Chaveiros vermelhos em formato de casinha com espaço para foto, ao lado de desenhos de família em papel.',
              width: 867,
              height: 865,
            },
          },
        ],
      },
      {
        id: 'suportes',
        name: 'Suportes',
        description: 'Suportes para celular, fone de ouvido, canetas, clipes e pequenos objetos, de diferentes formas e tamanhos, para organizar o dia a dia.',
        pieces: [
          {
            id: 'suporte-celular-fone',
            name: 'Suporte para celular e fone',
            description: 'O mesmo suporte visto de frente, de lado e em uso, para conferir o encaixe do celular e do fone.',
            photo: {
              src: 'criacoes/suporte-fone-celular.webp',
              alt: 'Colagem de fotos de um suporte rosa para celular e fone de ouvido, visto de frente, de lado e em uso.',
              width: 666,
              height: 888,
            },
          },
          {
            id: 'chaveiro-suporte-celular',
            name: 'Chaveiro suporte de celular',
            description: 'Chaveiro que também vira suporte de celular, com o nome em relevo: um presente útil para professores e equipes.',
            photo: {
              src: 'criacoes/suporte-celular.webp',
              alt: 'Chaveiros suportes de celular em rosa e dourado, com nomes de professoras em relevo, ao lado de um vaso.',
              width: 874,
              height: 862,
            },
          },
        ],
      },
      {
        id: 'decoracao',
        name: 'Decoração e utilidades',
        description: 'Objetos para casa e escritório que unem forma e função.',
        pieces: [
          {
            id: 'vaso-ondulado',
            name: 'Vaso ondulado',
            description: 'Vaso com ondas em espiral e acabamento brilhante, para plantas ou como peça decorativa.',
            photo: {
              src: 'criacoes/vaso1.webp',
              alt: 'Vaso amarelo brilhante com ondas em espiral, sobre uma mesa branca.',
              width: 900,
              height: 1200,
            },
          },
          {
            id: 'vaso-torcido',
            name: 'Vaso torcido',
            description: 'Vaso de linhas torcidas em tom bege, para flores secas, plantas ou como objeto decorativo.',
            photo: {
              src: 'criacoes/vaso2.webp',
              alt: 'Vaso bege de formato torcido sobre um prato, ao lado de um vaso rosa.',
              width: 900,
              height: 1200,
            },
          },
        ],
      },
    ],
  },

  process: {
    title: 'Como encomendar sua peça',
    intro: 'Um caminho simples, combinado com você em cada etapa.',
    cta: 'Encomendar pelo Instagram',
    steps: [
      {
        title: 'Você compartilha a ideia',
        text: 'Envie uma referência, descreva o que procura ou apresente um projeto que já tenha.',
      },
      {
        title: 'Alinhamos os detalhes',
        text: 'Conversamos sobre possibilidades, tamanho, quantidade, orçamento e prazo.',
      },
      {
        title: 'A peça ganha forma',
        text: 'Após a aprovação, seguimos com a produção combinada.',
      },
      {
        title: 'Combinamos como receber',
        text: 'Os detalhes de entrega ou retirada são definidos no atendimento.',
      },
    ],
  },

  about: {
    title: 'Sobre a LOOP',
    text: 'A LOOP 3D Studio trabalha com impressão 3D para dar forma a ideias em produtos personalizados, brindes, peças técnicas, decoração e comunicação visual. Cada proposta começa com uma conversa sobre o que você quer criar.',
    photo: null,
  },

  contactSection: {
    title: 'Vamos tirar sua ideia do papel?',
    text: 'Conte o que você imagina. Vamos conversar sobre as possibilidades para o seu projeto.',
    whatsappAction: 'Conversar pelo WhatsApp',
    instagramAction: 'Ver o Instagram',
    faqTitle: 'Dúvidas rápidas',
    faq: [
      {
        question: 'Preciso ter um arquivo 3D pronto?',
        answer: 'Não. Se você tiver apenas uma ideia, referência, desenho ou foto, podemos conversar sobre a possibilidade de criar ou adaptar o modelo.',
      },
      {
        question: 'Quanto custa uma impressão 3D?',
        answer:
          'O valor varia conforme tamanho, material, quantidade, tempo de impressão e complexidade da peça. O orçamento é feito de forma personalizada.',
      },
      {
        question: 'Qual é o prazo?',
        answer: 'Depende da complexidade e da quantidade de peças. O prazo é informado junto com o orçamento.',
      },
    ],
  },
};