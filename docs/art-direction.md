# BYTE RUNNER — Midnight Circuit

Arte original feita com retângulos de pixels, sem bibliotecas, fontes remotas ou imagens externas. A interface usa azul noturno, acentos menta e violeta; o mundo combina metal escuro, circuitos luminosos e silhuetas contrastantes. Cada fase recebe um atlas de tiles próprio e preserva os elementos de cenário específicos dos mapas existentes.

## Recursos

`assets/sprites/` contém 22 sprite sheets SVG reais, carregados com `Image` e desenhados com `CanvasRenderingContext2D.drawImage`. Cada célula mede **32 × 32**, com seis quadros por linha e transparência. O SVG contém apenas retângulos inteiros com `shape-rendering="crispEdges"`. A suavização do Canvas fica desligada. Não há dependência de conversão para PNG nem de arquivos que precisem ser baixados.

| Atlas | Linhas / estados |
| --- | --- |
| `r07.svg` | idle, run, jump, fall, attack, hit, repair, death |
| `virus-basic`, `fast`, `armored`, `flyer`, `shooter`, `parasite`, `boss` | idle, prepare, attack, hit, vulnerable, stage1, stage2, stage3 |
| `component.svg` | danificado e reparado |
| `portal.svg`, `terminal.svg` | inativo e ativo |
| `fx.svg` | disparo aliado, disparo inimigo, explosão, escudo, reparo, pulso de coleta |
| `tiles-01.svg` até `tiles-10.svg` | sólida, móvel, temporária |

As linhas compartilham a mesma célula e alinhamento. Há ciclos de seis quadros; poses de salto/queda mantêm sua silhueta, enquanto corrida, flutuação, LEDs, partículas e efeitos variam. Morte e explosão não repetem. Alguns estados dos vírus reutilizam o ciclo idle quando não têm linha própria. As três etapas de VIRUS ZERO mudam a cor do núcleo; seus avisos, barras, escudo e instruções de combate continuam visíveis.

## Integração

`tools/build_art.py` é a fonte editável da arte. Execute `python tools/build_art.py` para regenerar todos os SVGs, `assets/sprites/manifest.json` e `src/engine/art-manifest.js`. O manifesto declara células, colunas, quadros, velocidade e repetição. Os scripts de arte são carregados antes de `visuals.js` e `game.js` em `index.html`.

`src/engine/visuals.js` carrega os atlas junto aos assets de cada fase, mantém relógios de animação por entidade e reinicia o ciclo quando o estado muda. Recursos próprios definidos por um mapa têm precedência. Falhas de imagem resolvem a promessa de carregamento e retornam `false` ao desenhar; os desenhos anteriores de robô, vírus, componentes, plataformas, interativos e disparos continuam como alternativa.

`game.js` seleciona a animação de R-07 por dano, reparo, ataque, movimento vertical e corrida. O escudo é composto por cima do sprite. A reinicialização no checkpoint preserva o comportamento imediato da campanha e deixa um eco animado de desintegração no local da queda. O chefe usa `bossStage`; os inimigos usam preparação, ataque, dano e vulnerabilidade. As caixas de colisão permanecem independentes da arte.

`src/engine/art.js` desenha três planos de fundo com velocidades de paralaxe diferentes, partículas ambientais e vinheta. Os tiles se repetem em blocos de 32 pixels, recortados pela forma da plataforma e limitados à região visível da câmera. Plataformas temporárias pulsam e têm marcações âmbar; as móveis recebem símbolos de movimento. Plataformas perigosas conservam as pontas e a sinalização vermelha do desenho de segurança. Os cenários específicos existentes continuam sobre os planos distantes. A entrada da fase usa um breve fade; menus e escolhas usam transições CSS.

O minimapa conserva a geometria real e adiciona retângulo da câmera e marcador de saída. Teclado e botões de toque usam os mesmos eventos e ações anteriores. A nova interface adapta os painéis laterais à largura disponível.

## Verificação

`python tools/check_maps.py` audita as dez fases. `python tests/run_review.py` executa a campanha no Chrome com perfil isolado e servidor temporário em localhost. `tests/art.js` espera o carregamento real, verifica pixels em todos os atlas/estados, testa o sinal de fallback e captura as dez fases em `tests/snapshots/phase-XX-art-start.png`. A galeria fica em `tests/gallery.html`.

Abra `index.html` diretamente para jogar ou hospede o diretório como site estático. A exportação de capturas de Canvas pode ser bloqueada pelo Chrome em `file://`; por isso os testes usam localhost. O jogo não exporta o Canvas durante a campanha. Performance em aparelhos fracos e toque físico precisam de avaliação em dispositivos reais.
