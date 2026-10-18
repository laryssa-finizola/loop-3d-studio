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
    url: '',
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
            id: 'chaveiro-como-treinar-o-seu-dragao',
            name: 'Chaveiro Como Treinar o Seu Dragão',
            description: 'Chaveiro com o personagem Banguela, do filme “Como Treinar o Seu Dragão”, em relevo.',
            photo: {
              src: 'criacoes/chaveiro1.webp',
              alt: 'Chaveiro com o personagem Banguela, do filme “Como Treinar o Seu Dragão”, em relevo.',
              width: 900,
              height: 1200,
            },
          },
          {
            id: 'chaveiro-polvo-articulado',
            name: 'Chaveiros Polvo',
            description: 'Chaveiros com partes que se movem para levar para qualquer lugar.',
            photo: {
              src: 'criacoes/chaveiro2.webp',
              alt: 'Chaveiros de polvo articulado cor-de-rosa.',
              width: 1200,
              height: 900,
            },
          },
          {
            id: 'chaveiro-raposa',
            name: 'Chaveiro Raposa',
            description: 'Raposinhas em tons de rosa, com detalhes delicados e cauda articulada em formato de pétalas, para presentear ou dar um toque especial às suas chaves.',
            photo: {
              src: 'criacoes/chaveiro3.webp',
              alt: 'Três chaveiros de raposinhas cor-de-rosa, com detalhes brancos, olhos fechados e caudas articuladas em formato de pétalas, sobre um fundo roxo-escuro.',
              width: 1200,
              height: 1097,
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
            id: 'chaveiros-porta-retrato',
            name: 'Chaveiros Porta-retrato',
            description: 'Lembrança especial com espaço para foto, para presentear ou vender em eventos.',
            photo: {
              src: 'criacoes/brindes2.webp',
              alt: 'Chaveiros em formato de casa com espaço para foto, na cor vermelho.',
              width: 1200,
              height: 1200,
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
            description: 'Apoio de mesa que deixa o celular e o fone de ouvido organizados no mesmo lugar.',
            photo: {
              src: 'criacoes/suporte1.webp',
              alt: 'Suporte cor-de-rosa para celular e fone de ouvido, ao lado de um vaso.',
              width: 900,
              height: 1200,
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
            id: 'vaso-geometrico',
            name: 'Vaso geométrico',
            description: 'Formas facetadas e torcidas, para plantas ou como objeto decorativo.',
            illustration: 'vaso-geometrico',
            illustrationAlt: 'Ilustração de um vaso facetado e torcido em tons de violeta e magenta.',
          },
          {
            id: 'organizador',
            name: 'Organizador de mesa',
            description: 'Compartimentos em alturas diferentes para canetas, clipes e pequenos objetos.',
            illustration: 'organizador',
            illustrationAlt: 'Ilustração de um organizador de mesa com três compartimentos de alturas diferentes.',
          },
        ],
      },
      {
        id: 'comunicacao',
        name: 'Publicidade e comunicação',
        description: 'Letreiros, displays e peças em relevo para apresentar uma marca, sinalizar espaços ou chamar atenção.',
        pieces: [
          {
            id: 'placa-com-logo',
            name: 'Placa com logo',
            description: 'Logotipo em relevo, com as cores da marca, para balcões, recepções e eventos.',
            photo: {
              src: 'criacoes/placa-com-logo.webp',
              alt: 'Placa preta com a logo da LOOP 3D Studio em relevo, com uma impressora 3D ao fundo.',
              width: 418,
              height: 676,
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