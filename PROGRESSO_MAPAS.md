# BYTE RUNNER — arquitetura modular de parallax

## Análise realizada antes das alterações

O `index.html` carrega `game.js`; não há `game(2).js` neste projeto. Foram analisados esse arquivo, os dez módulos de fase, `experience.js`, `visuals.js`, `art.js`, `pixel-art.js` e `environment-art.js`.

O caminho anterior era `game.drawBackground → art.background → pixelArt.background → environmentArt.background`. O último módulo misturava a composição de parallax com tiles de colisão visual, autotiling e estruturas. Já `game.draw()` intercalava fundo, camadas autorais e decorações antes de plataformas e atores.

O fundo usa três planos dos PNG `vista-01` a `vista-10`: distante, intermediário e próximo. As velocidades horizontais anteriores eram 0,08 / 0,22 / 0,4; as verticais correspondem a 45% dessas velocidades. As escalas são inteiras: 2 / 2 / 1. Há 24 partículas luminosas e um modo existente de efeitos reduzidos. As oito variantes de cada plano já eram pré-escaladas em faixas de cache.

A câmera usa antecipação, suavização, zona morta vertical e limites do mundo em `experience.camera()`. As dez fases atuais habilitam os eixos X e Y, inclusive as de arquitetura horizontal. O parallax lê as coordenadas finais dessa câmera; não modifica seu acompanhamento.

Pontos de repetição e possível poluição visual identificados:

- Os mesmos parâmetros de densidade e movimento estavam embutidos no renderizador para todas as fases.
- As variantes do fundo repetem um padrão diagonal de oito células; as partículas seguem uma distribuição periódica.
- A grade sobre o mundo, as etiquetas e os módulos arquitetônicos repetidos somam detalhes aos planos do fundo.
- Switch e Wi-Fi possuem itens relacionados em midground e foreground. Essa sobreposição merece avaliação visual, mas foi preservada para manter a composição e a oclusão existentes.
- Há caminhos antigos de fallback e decorações adicionais para mapas procedurais. Eles foram preservados e separados do renderizador principal.

## Arquitetura implementada

1. `src/content/parallax.js` contém dez perfis visuais independentes e imutáveis. Cada perfil define atlas, cores, planos, velocidades X/Y, escala, opacidade e partículas. As listas de planos e partículas são objetos distintos por fase. Os valores iniciais mantêm a composição atual; os motivos temáticos são metadados para futuras alterações artísticas.
2. `src/engine/parallax.js` é o único renderizador do parallax principal. Recebe contexto Canvas, câmera, viewport, tempo e serviço de imagens. Usa coordenadas inteiras para os pixels e mantém três faixas pré-escaladas, com até 4,5 MiB de cache por serviço visual. A cache é reaproveitada quando a câmera se move e liberada no `dispose()` da fase.
3. `src/engine/background-scene.js` organiza somente o cenário anterior aos atores: céu, camadas background, decorações procedurais e midground. A função antiga foi extraída mecanicamente para preservar os desenhos adicionais.
4. `game.drawBackground()` delega a esse organizador. Plataformas, colisões visuais, interativos, personagem, inimigos e combate continuam no passe do mundo. Foreground permanece depois dos atores para preservar oclusão.
5. `environmentArt.background()` é um adaptador para a nova API. Os fallbacks de `art.js` e `pixel-art.js` continuam disponíveis; a lógica principal não foi duplicada.
6. `visuals.js` escolhe o atlas pelo perfil, mantém o serviço por fase e descarta a cache ao liberar os recursos. `index.html` carrega os módulos na ordem de dependência.

| Fase | Perfil | Atlas |
| --- | --- | --- |
| 1 — Hardware | `hardware` | `vista-01` |
| 2 — Software | `software` | `vista-02` |
| 3 — Switch | `switch` | `vista-03` |
| 4 — Roteador | `router` | `vista-04` |
| 5 — Wi-Fi | `wifi` | `vista-05` |
| 6 — Cabeamento | `cabling` | `vista-06` |
| 7 — DHCP | `dhcp` | `vista-07` |
| 8 — DNS | `dns` | `vista-08` |
| 9 — Firewall | `firewall` | `vista-09` |
| 10 — Servidores | `servers` | `vista-10` |

Para ajustar uma fase posteriormente, editar seu perfil em `src/content/parallax.js`. `planes[].rateX` controla o deslocamento horizontal; `planes[].rateY × verticalMultiplier` controla o vertical. Os dois eixos podem ser ajustados separadamente. A ordem da multiplicação anterior foi preservada para evitar deslocamentos de um pixel por arredondamento. O perfil é resolvido pelo tema, portanto mapas de teste procedurais também recebem o atlas correto. Nesta etapa não foram redesenhados os fundos, alterados os mapas ou reduzida a resolução. O Canvas intermediário, a escala de apresentação e nearest-neighbor foram mantidos.

## Arquivos desta etapa

- Criados: `src/content/parallax.js`, `src/engine/parallax.js`, `src/engine/background-scene.js` e este documento.
- Alterados: `game.js`, `index.html`, `src/engine/environment-art.js` e `src/engine/visuals.js`.
- Verificação: `tests/parallax.js`, `tests/run_review.py`, `tools/check_parallax.py`, `tools/check_environment.py` e `tests/fixtures/pre-parallax.json`. Os JSON e PNG produzidos pelos testes registram as execuções.
- Os dez arquivos de fase e o manifesto de campanha permanecem idênticos byte a byte. Câmera, runtime e física também são protegidos por hashes. A comparação do `game.js` permite apenas a extração do desenho do cenário.

## Validação

Comandos efetivamente executados nesta etapa:

```powershell
python tools/check_parallax.py
python tools/check_environment.py
python tools/check_generation.py
python tools/check_maps.py
python tests/run_review.py --parallax-only
python tests/run_review.py --environment-only
python tests/run_review.py
git diff --check
```

Os testes específicos verificam perfis independentes, os dois eixos da câmera, coordenadas negativas, repetibilidade, limites e descarte da cache, restauração do estado do Canvas, ordem dos passes e ausência de alterações em gameplay. A suíte de ambiente compara os pixels com a composição anterior, com tolerância de até três níveis por canal para a composição intermediária do alfa.

Resultados finais, todos na versão de fontes `8a453dd52a4bad1fdca9ac735bb9a42ee9958ecb4b58a5ddfb0dc539213200b9`:

| Verificação | Resultado executado |
| --- | --- |
| Parallax específico | 12/12 aprovados; zero erros de runtime |
| Ambiente pixel art | 43/43 aprovados nas dez fases |
| Suíte completa | 202/202 verificações aprovadas; dez fases; 89 capturas; zero erros de runtime |
| Integridade de mapas e sistemas | `check_parallax.py`, `check_environment.py`, `check_generation.py` e `check_maps.py` aprovados |
| Espaçamento do diff | `git diff --check` aprovado; somente aviso de conversão LF/CRLF em `visuals.js` |

Os totais das suítes focadas também têm cobertura na suíte completa e não devem ser somados como testes exclusivos. Não houve reprovação nos testes desta etapa. As evidências estão em `tests/parallax-results.json`, `tests/environment-art-results.json` e `tests/review-results.json`; as capturas foram atualizadas pelos testes.

Esta etapa prepara a arquitetura. Não certifica 60 FPS: o benchmark sem GPU da revisão anterior havia reprovado o orçamento de frame, e não foi repetido aqui. A reformulação artística dos fundos e uma nova rodada de otimização global ficam fora desta etapa.

## Parte 2 — cinco camadas de profundidade na fase 1

O registro anterior corresponde à Parte 1. Nesta Parte 2, somente Hardware recebeu a nova composição; as fases 2 a 10 conservam seus atlas, velocidades e efeitos anteriores.

| Camada | Conteúdo | Velocidade X | Velocidade Y |
| --- | --- | --- | --- |
| 1 — Fundo distante | Base escura e silhuetas grandes, espaçadas e de baixo contraste | 0,025 | 0,020 |
| 2 — Estruturas distantes | Circuitos, racks e equipamentos esparsos | 0,080 | 0,065 |
| 3 — Intermediária | Painéis, componentes eletrônicos, capacitores e tubos | 0,220 | 0,170 |
| 4 — Ambiente próximo | Vigas e tubulações metálicas discretas | 0,600 | 0,480 |
| 5 — Atmosfera | Dez pequenas partículas, luz suave e brilhos ocasionais | 0,320 | 0,250 |

As velocidades são fatores da posição da câmera, calculados separadamente em X e Y. A atmosfera tem também deriva temporal suave e brilhos curtos com período de oito segundos por partícula. O modo de efeitos reduzidos mantém as duas primeiras camadas e desativa a atmosfera.

Foram criados 32 frames PNG originais, em quatro linhas de oito variantes de 128 × 128 pixels, no atlas `vista-01.png`. Silhuetas usam escala inteira 2; as outras estruturas usam escala 1. As bordas das variantes são compatíveis em ambos os eixos. Desenho e deslocamentos continuam com nearest-neighbor e coordenadas inteiras, calculadas a partir da câmera absoluta, sem acumular deltas.

A inspeção visual revelou que o preenchimento opaco da decoração da placa-mãe escondia o fundo. Apenas seu desenho na fase 1 foi ajustado: o preenchimento ficou transparente e os circuitos decorativos receberam opacidade menor. As decorações continuam presentes. A geometria, as colisões e os objetivos não foram alterados. Todos os planos e a nova atmosfera são desenhados antes das plataformas, inimigos e personagem.

O teste de cache limita a fase 1 a quatro faixas, com 3,5 MiB, reutilizadas mesmo com deslocamento da câmera. A inspeção visual também levou a espaçar painéis e racks, evitando preencher cada célula com componentes.

### Arquivos da Parte 2

- `src/content/parallax.js`: perfil Hardware com quatro planos e atmosfera independente.
- `src/engine/parallax.js`: suporte configurável à atmosfera suave e aos brilhos ocasionais; comportamento antigo mantido nos outros perfis.
- `src/engine/environment-art.js`: transparência da decoração da placa-mãe, restrita ao tema Hardware e ao item `board`.
- `tools/build_environment_art.py`: pintor original de Hardware e opção `--parallax-hardware`, que gera somente seu atlas de parallax.
- `assets/pixelart/environments/vista-01.png`, `assets/pixelart/manifest.json` e `src/engine/art-manifest.js`: quatro planos registrados. Nenhum atlas das fases 2 a 10 foi redesenhado.
- `tests/parallax-depth.js`, `tests/parallax.js`, `tests/environment-art.js`, `tests/run_review.py` e `tools/check_hardware_depth.py`: testes e evidências desta etapa.
- `PROGRESSO_MAPAS.md`: este registro. JSON de resultados e capturas PNG são atualizados pelos testes.

### Validação da Parte 2

Comandos de geração e testes executados:

```powershell
python tools/build_environment_art.py --parallax-hardware
python tools/check_hardware_depth.py
python tools/check_parallax.py
python tools/check_environment.py
python tools/check_generation.py
python tests/run_review.py --depth-only
python tests/run_review.py --parallax-only
python tests/run_review.py --environment-only
python tests/run_review.py
git diff --check
```

Os testes novos verificam as bordas de todas as variantes PNG em X e Y, deslocamentos inteiros e monotônicos com entrada fracionária da câmera, acompanhamento horizontal e vertical real, atmosfera e efeitos reduzidos, limites da cache, ordem de desenho dos atores e transparência da placa-mãe. Há capturas em `tests/phase-01-depth-start.png`, `tests/phase-01-depth-horizontal.png` e `tests/phase-01-depth-vertical.png`.

Resultados finais da Parte 2, na versão de fontes `4fa23ad91c72918f5ae977f733d1cc874be758da3beee3462048b26fc29ac907`:

| Verificação | Resultado executado |
| --- | --- |
| Cinco camadas Hardware | 7/7 aprovados, incluindo os dois eixos e ausência de emendas |
| Parallax das dez fases | 12/12 aprovados |
| Ambiente e pixel art | 43/43 aprovados |
| Regressão completa | 209/209 verificações aprovadas; dez fases; 92 capturas; zero erros de runtime |
| Integridade | Atlas e metadados conferidos; mapas, câmera, runtime e física preservados |
| Diff | `git diff --check` aprovado, com avisos de conversão LF/CRLF |

Uma execução intermediária reprovou o contrato de atlas porque variantes de espaçamento estavam totalmente transparentes. Esses frames receberam elementos mínimos, sem aumentar a densidade dos painéis principais; a regra de validação foi mantida. O resultado reprovado foi preservado em `tests/parallax-depth-initial-review.json`. As execuções finais acima passaram. Os totais das suítes focadas têm cobertura na suíte completa e não representam testes exclusivos adicionais.

Evidências finais: `tests/parallax-depth-results.json`, `tests/parallax-results.json`, `tests/environment-art-results.json` e `tests/review-results.json`.

Esta Parte 2 não altera os mapas nem certifica desempenho de 60 FPS. O benchmark da etapa anterior continua histórico; não foi substituído por uma alegação de melhora de FPS.
