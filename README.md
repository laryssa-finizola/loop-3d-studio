# LOOP 3D Studio — site de apresentação

Landing page de uma página, em português do Brasil, para a LOOP 3D Studio. Feita com React, Vite e TypeScript, totalmente estática: não tem loja, login, banco de dados nem formulário com servidor. O contato acontece pelo WhatsApp e pelo Instagram.

Destaques:

- **Abertura em 3D:** uma impressora imprime um vaso camada por camada (three.js/WebGL). Ao terminar, a peça gira sozinha. O visitante pode girá-la pelo controle “Gire a peça” ou arrastando a peça, e o botão ao lado pausa ou retoma o giro. Em navegadores sem WebGL 2, com economia de dados ativada ou sem JavaScript, aparece a versão em SVG, com a mesma interação.
- **Vitrine:** as cinco categorias da marca, com fotos e ilustrações, miniaturas e o botão “Quero algo parecido”, que abre o WhatsApp já com o nome da peça.
- **Como funciona, Sobre e Contato:** inclui dúvidas rápidas em acordeões.
- **HTML pré-renderizado no build:** o conteúdo aparece antes do JavaScript carregar e pode ser lido por buscadores.

## Requisitos

- Node.js 20.19 ou mais recente (recomendado: 22).
- npm (vem com o Node).

## Instalar e executar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`). As alterações aparecem na hora.

## Gerar e conferir o build

```bash
npm run build     # verifica os tipos, gera a pasta dist/ e pré-renderiza o HTML
npm run preview   # serve dist/ em http://localhost:4173
```

Para simular o GitHub Pages em subcaminho (troque pelo nome do seu repositório):

```bash
BASE_PATH=/loop-3d-studio/ npm run build
BASE_PATH=/loop-3d-studio/ npm run preview
# abra http://localhost:4173/loop-3d-studio/
```

No Windows (PowerShell), use `$env:BASE_PATH="/loop-3d-studio/"; npm run build`.

Outros comandos:

- `npm run typecheck` verifica os tipos sem gerar o site.

## Como editar o conteúdo

Quase tudo fica em **`src/data/site.ts`**. Os componentes só leem esse arquivo, então não é preciso mexer na estrutura do site.

| O que mudar | Onde, em `site.ts` |
|---|---|
| WhatsApp, Instagram e cidade | `contact` |
| Mensagem inicial do WhatsApp | `contact.whatsappMessage` |
| Mensagem do “Quero algo parecido” | `contact.similarMessage` (`{peca}` e `{categoria}` são preenchidos sozinhos) |
| Título e descrição para Google e redes | `seo` |
| Textos da abertura e do controle de giro | `hero` (o controle fica em `hero.demo`) |
| Categorias e peças | `showcase.categories` |
| Etapas de “Como funciona” | `process.steps` |
| Texto “Sobre” e foto opcional | `about` |
| Chamada final e dúvidas rápidas | `contactSection` (até três perguntas) |

Regras gerais:

- **Campo vazio (`''`) fica oculto.** Sem WhatsApp, por exemplo, os botões de orçamento somem e “Quero criar minha peça” leva à seção de contato.
- **WhatsApp:** só números, com DDI e DDD. Exemplo: `5583988782144`.
- **Instagram:** o endereço completo, como `https://www.instagram.com/loop.3d.studio/`.

Todos os textos atuais são exemplos para revisão.

### Trocar ou adicionar fotos

1. Salve a foto em `public/criacoes/`.
   - Formato: WebP ou JPG.
   - Tamanho: cerca de 1600 px no lado maior, com até 300 KB.
   - Use nomes sem espaços nem acentos, como `porta-chaves.webp`.
2. Na peça, em `site.ts`, preencha `photo` com o caminho e o tamanho real do arquivo:

   ```ts
   photo: {
     src: 'criacoes/porta-chaves.webp', // relativo a public/, sem barra no início
     alt: 'Descrição do que aparece na foto.',
     width: 1200,
     height: 1600,
   },
   ```

   A largura e a altura reais evitam saltos na página enquanto a foto carrega.

Comportamento da vitrine:

- **Selo:** peças com `photo` aparecem sem selo. Peças só com `illustration` recebem o selo “Exemplo ilustrativo”.
- **Ilustrações disponíveis:** veja a lista de ilustrações locais no tipo `IllustrationId`, em `src/data/types.ts`.
- **Limite por categoria:** use até quatro peças em cada categoria; a vitrine mostra até quatro miniaturas por linha.
- **Categoria vazia:** uma categoria sem peças não aparece.

> As fotos atuais foram recortadas de capturas de tela do Instagram, por isso têm baixa resolução. Substitua-as pelos arquivos originais, ou pelas versões melhoradas, assim que possível.
>
> Ficaram de fora as peças com personagens ou escudos de terceiros (Homem-Aranha, Flamengo, Banguela). Divulgar esses produtos em um site comercial pode exigir licença dos donos das marcas.

### Abertura em 3D

A cena fica em `src/three/printerScene.ts` e só é baixada no navegador (cerca de 150 KB compactados), depois que o resto da página já apareceu. Os ajustes mais comuns estão no começo do arquivo:

- `PRINT_MS`: duração da impressão de demonstração.
- `SPEED`: velocidade do giro automático, em graus por segundo.
- `LAYERS`: quantidade de camadas visíveis.
- `PROFILE`: o formato do vaso (altura relativa e raio).
- `STOPS`: as cores do gradiente da peça.

No desenvolvimento (`npm run dev`), abra `http://localhost:5173/?lento=10` para ver a impressão 10 vezes mais lenta. Isso não funciona no site publicado.

A versão em SVG (`src/components/LayerVase.tsx`) continua no projeto como alternativa automática.

### Logo e ícones

- **Arquivos da marca:**
  - `public/brand/loop-logo-compacta.webp`: logo sem o slogan, usada no cabeçalho.
  - `public/brand/loop-logo.webp`: logo completa, usada no rodapé.
  - `public/favicon-32.png`, `public/icon-192.png` e `public/apple-touch-icon.png`: ícones gerados a partir do símbolo do infinito.
  - `public/og-image.png`: imagem de 1200 × 630 para compartilhamento.
- **Originais em alta resolução:** ficam em `design/marca/`. Essa pasta não é publicada.
- **Para trocar a logo:** substitua os arquivos mantendo os nomes, ou altere `brand.logo` e `brand.logoFull` em `site.ts`. Informe sempre a largura e a altura reais.

### Pré-visualização ao compartilhar o link

As tags `og:url` e `og:image` exigem o endereço final. Por isso, só são geradas quando `seo.url` estiver preenchido, com `https://` e barra no fim:

```ts
url: 'https://seudominio.com.br/',
```

Se o site ficar em subcaminho no GitHub Pages, inclua o subcaminho, por exemplo: `'https://usuario.github.io/loop-3d-studio/'`.

## Publicar na Vercel

1. Envie o projeto para um repositório no GitHub.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. As configurações já estão em `vercel.json`:
   - framework: Vite;
   - instalação: `npm ci`;
   - build: `npm run build`;
   - saída: `dist`.
4. Não defina `BASE_PATH`: na Vercel o site fica na raiz.
5. Para domínio próprio, use **Settings → Domains**. Depois, preencha `seo.url` com o domínio final.

## Publicar no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` faz o build a cada push na branch `main`. A publicação só acontece depois que você ativar o Pages.

1. Em **Settings → Pages**, em *Build and deployment → Source*, escolha **GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions → Variables**, crie `DEPLOY_GITHUB_PAGES` com o valor `true`.
3. Faça um push na `main` ou rode o workflow manualmente, na aba **Actions**.

Base dos caminhos:

- O padrão é `/nome-do-repositorio/`, que é o endereço `usuario.github.io/nome-do-repositorio/`.
- Com domínio próprio, ou em um repositório `usuario.github.io`, crie também a variável `BASE_PATH` com o valor `/`.

Se usar só a Vercel, não crie `DEPLOY_GITHUB_PAGES`. O workflow continuará apenas conferindo se o build funciona.

## Hospedagem para uso comercial

Este é o site de uma empresa. Escolha uma hospedagem e um plano que permitam esse uso:

- **Vercel:** o plano gratuito (Hobby) é destinado a uso pessoal e não comercial. Sites de empresa normalmente exigem o plano Pro.
- **GitHub Pages:** os termos de uso restringem sites voltados principalmente a negócios ou transações comerciais.

Os termos mudam com o tempo. Confira as regras atuais de cada serviço antes de publicar.

## Pendências e pontos para validar

- [ ] Endereço final do site (`seo.url`), para ativar a prévia com imagem ao compartilhar.
- [ ] Fotos em melhor resolução. As atuais vieram de capturas do Instagram.
- [ ] Fotos reais para **Peças técnicas**. Hoje a categoria tem só ilustrações.
- [ ] Revisão de nomes e descrições das peças, das etapas de “Como funciona” e das dúvidas rápidas.
- [ ] Confirmação das condições de encomenda, personalização, entrega e retirada.
- [ ] Opcional: foto da bancada ou da impressora para a seção “Sobre” (`about.photo`).

## Estrutura

```
src/
  data/site.ts          conteúdo editável (textos, contatos, peças)
  data/types.ts         formato de cada campo
  components/           seções da página (Header, Hero, Showcase, Process, About, Contact, Footer)
  components/LayerVase  interação “Explore as camadas”
  illustrations/        ilustrações SVG das peças de exemplo
  lib/                  utilitários (links de contato, caminhos, geometria, cores)
  styles/               CSS próprio (tokens, abertura, seções)
public/                 arquivos copiados como estão (logo, ícones, fotos)
design/marca/           originais da marca (não publicados)
scripts/prerender.mjs   gera o HTML estático depois do build
```

## Acessibilidade e desempenho

- **Navegação e controles:**
  - a página toda funciona pelo teclado e tem foco visível;
  - a peça da abertura gira por um controle deslizante nativo (toque, mouse e setas do teclado) ou arrastando a peça;
  - ao girar manualmente, o giro automático pausa; o botão “Pausar giro” / “Girar peça” liga e desliga o giro;
  - as categorias seguem o padrão de abas, com setas, Home e End;
  - as miniaturas são botões de opção.
- **Sem depender de hover ou de animação:** nenhuma informação essencial depende de hover, e os textos e botões aparecem sem esperar animações.
- **Movimento reduzido:** com `prefers-reduced-motion`, a peça já aparece pronta, as transições são desligadas e o giro só começa se o visitante clicar em “Girar peça”.
- **Economia:** a cena 3D para de ser desenhada quando sai da tela e volta quando reaparece.
- **Fontes e imagens:**
  - as fontes vêm do próprio site, sem chamadas ao Google Fonts;
  - as fotos abaixo da primeira tela carregam só quando necessário;
  - todas as fotos têm tamanho reservado, o que evita saltos no layout.