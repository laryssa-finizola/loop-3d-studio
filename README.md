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
