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

## Parte 3 — reformulação artística do fundo da fase 1

Etapa concluída somente em Hardware. A captura do estado de trabalho anterior foi preservada antes das alterações; mudanças preexistentes nas fases 2 a 10 foram mantidas, sem estender esta reformulação a elas.

- Novo pintor `hardware_vista` em `tools/build_environment_art.py`, com bancos de memória, dissipadores, capacitores, suportes e silhuetas grandes. Atlas `vista-01.png` regenerado exclusivamente com `--parallax-hardware`.
- Paleta limitada de materiais escuros, sombras sólidas, contatos discretos e contornos raster. Os quatro planos agora usam opacidade 1: o contraste vem das cores dos novos desenhos, sem escurecimento do atlas antigo por transparência.
- Removida a grade decorativa `board` da fase 1. Os elementos interativos e as plataformas conservam seu desenho.
- Espaçamento vertical de fileiras duplicado somente em Hardware (`rowSpacing: 2`); variantes vazias e distribuição horizontal espaçada criam áreas de descanso. Os outros perfis mantêm o espaçamento padrão.
- Mantidas quatro partículas discretas, sem halos atrás do personagem, escalas inteiras e nearest-neighbor.

Comparação visual inspecionada nas vistas inicial, horizontal e vertical, com os mesmos valores de câmera e tempo. Evidências e observações em [docs/phase-01-art-comparison.md](docs/phase-01-art-comparison.md). Capturas anteriores: `tests/phase-01-art-before-{start,horizontal,vertical}.png`; posteriores: `tests/phase-01-depth-{start,horizontal,vertical}.png`.

Validação executada: `python tests/run_review.py --depth-only` (7/7), `python tests/run_review.py --parallax-only` (12/12), ambos sem erros de runtime; `python tools/check_hardware_depth.py`, `python tools/check_parallax.py` e `git diff --check` aprovados. As suítes verificam bordas, câmera X/Y, cache, efeitos reduzidos e desenho dos atores após o fundo. Suíte completa e benchmark de FPS não executados nesta etapa.

Etapa encerrada após implementar e comparar visualmente a fase 1, conforme solicitado. Nenhuma continuação artística para as fases seguintes nesta etapa.

## Parte 4 — identidade exclusiva do parallax nas dez fases

A solicitação seguinte estendeu a revisão artística às dez fases. Implementação e validação inicial executadas na ordem Hardware → Software → Switch → Roteador → Wi-Fi → Cabeamento → DHCP → DNS → Firewall → Servidores, gerando e testando um atlas antes de avançar ao próximo. Após os ajustes finais, a revisão sequencial foi repetida nas dez fases com a mesma versão de fontes.

| Fase | Identidade implementada |
| --- | --- |
| 1 — Hardware | Placa-mãe gigante em silhuetas, processador com contatos, trilhas luminosas discretas, RAM, dissipadores e capacitores |
| 2 — Software | Janelas sobrepostas, diretórios, pastas, arquivos com canto dobrado e cartões de processos em roxo |
| 3 — Switch | Bancos de portas Ethernet, patch cables organizados, interfaces e pequenos percursos de pacotes |
| 4 — Roteador | Túneis octogonais, bifurcações de caminhos, interfaces e setas de encaminhamento |
| 5 — Wi-Fi | Torres abertas distantes, relays suspensos, ondas angulares e pequenas marcas ocasionais de interferência |
| 6 — Cabeamento | Vãos estruturais, contraventamentos, dutos em cotovelo, braçadeiras e painéis de cabos com iluminação contida |
| 7 — DHCP | Distribuidor com sub-redes, servidores de endereçamento, terminais e fluxo de dados discreto |
| 8 — DNS | Portais distantes, árvore de domínios/subdomínios, arquivos de nomes e resolução em roxo e azul |
| 9 — Firewall | Fortaleza com ameias, barreiras entre torres, escudo, fechadura e alertas vermelhos discretos |
| 10 — Servidores | Corredores em profundidade, racks, infraestrutura de data center, corrupção progressiva e núcleo regional de VIRUS ZERO |

### Composição e integração

Os novos desenhos usam raster original por coordenadas inteiras, paletas limitadas e sombras sólidas. Cada um dos três planos principais tem silhueta diferente nas dez fases, verificada após remover as cores. As variantes vazias e o espaçamento vertical duplo criam áreas de descanso. Os planos usam opacidade 1: os desenhos e suas cores foram reformulados, sem depender de transparência sobre a arte anterior.

Hardware conserva seus quatro planos. As outras fases têm três planos e atmosfera separada, com velocidades distintas para profundidade e câmera X/Y. Wi-Fi usa o plano distante ainda mais lento para reforçar a altura. Pequenas marcas de atividade acompanham os equipamentos no espaço do atlas, sem deslizar independentemente da composição. Permanecem quatro partículas ambientais por perfil.

As posições, dimensões e rótulos das regiões arquitetônicas foram preservados; a grade repetida opaca foi substituída por cantos discretos, permitindo ver o fundo temático. Equipamentos específicos, plataformas e elementos interativos mantêm seus sprites. Mapas, colisões, atores, reparos, objetivos, checkpoints, perguntas, habilidades, chefe, física e lógica da câmera não foram alterados nesta etapa.

Em Servidores, a quantidade de pequenos fragmentos de corrupção cresce com o avanço horizontal. A região existente `boss-arena` acrescenta fragmentos e um núcleo raster próprio, recortado pelos seus limites e visível somente quando a câmera intersecta a arena em X e Y. O núcleo não é repetido fora dela. Efeitos reduzidos mantêm o núcleo estático e eliminam partículas, marcas animadas e fragmentos. Não há flashes de tela.

### Evidências e arquivos

- [Galeria visual das dez identidades](tests/identity-gallery.html): 41 capturas reais, incluindo início com personagem, vistas horizontal/vertical, camadas isoladas e arena.
- [Documentação das composições e camadas](docs/parallax-identities.md): motivos, velocidades, escala, limites regionais e comandos de reprodução.
- `tools/pixelart/identities.py` e `tools/build_environment_art.py`: pintores originais e opção `--parallax-phase N`, que reconstrói somente o parallax escolhido.
- `assets/pixelart/environments/vista-01.png` a `vista-10.png`: dez composições próprias. Terrenos, sprites de atores e atlas de equipamentos não foram regenerados.
- `src/content/parallax.js`, `src/engine/parallax.js` e `src/engine/environment-art.js`: perfis, composição, atividade dos equipamentos e integração regional.
- `assets/pixelart/manifest.json` e `src/engine/art-manifest.js`: núcleo regional e declaração explícita das variantes espaciais vazias.
- `tests/parallax-identity.js`, `tests/run_identity_campaign.py` e `tests/run_review.py`: revisão individual/sequencial e geração da galeria. `tests/identity-phase-NN-results.json` conserva o resultado de cada fase.

### Validação final

Versão de fontes e assets da revisão sequencial e regressão completa: `f8811113c246ef523a68b256ae232860fb32d8ba0a967fdc263b7ca36f8c8be2`.

| Verificação executada | Resultado |
| --- | --- |
| `python tests/run_identity_campaign.py` | Dez fases em sequência; 41/41 verificações; 41 capturas; zero erros de runtime |
| `python tests/run_review.py` | 209/209 verificações; dez fases; 92 capturas; zero erros de runtime; nenhuma falha |
| `python tools/check_hardware_depth.py` | Dez atlas reproduzíveis, silhuetas exclusivas em cada plano principal e manifestos concordantes |
| `python tools/check_parallax.py` | Mapas, manifesto da campanha, física, câmera e runtime protegidos por hashes |
| `python tools/check_environment.py` | Sistemas de campanha, chefe e reparos preservados |
| `git diff --check` | Aprovado; somente avisos de conversão LF/CRLF |

Os totais das duas suítes são resultados separados; parte da cobertura se sobrepõe. Os testes individuais incluem bordas transparentes compatíveis, ausência de antialiasing, espaços vazios, câmera X/Y e coordenadas negativas, determinismo, cache limitado, restauração do Canvas, efeitos reduzidos e ausência de mudanças em atores e colisões. Servidores acrescenta progressão da corrupção e isolamento da arena nos dois eixos.

A primeira regressão completa reprovou somente o contrato antigo que exigia pixels em todo frame, incluindo variantes vazias de descanso. Evidência preservada em `tests/identity-initial-regression.json` (208/209, zero erros de runtime). O contrato passou a exigir correspondência exata entre pixels vazios e `emptyFrames`, permitidos exclusivamente em atlas espaciais `vista-*`; cada plano continua obrigado a possuir conteúdo, e sprites de atores continuam obrigatoriamente não vazios. A regressão final acima passou após essa correção.

Resultados finais: `tests/identity-campaign-results.json`, `tests/identity-phase-NN-results.json` e `tests/review-results.json`. Nenhum benchmark de FPS foi executado; esta revisão não certifica 60 FPS. Etapa encerrada após as dez identidades, sem iniciar uma etapa adicional.

## Parte 5 — animação ambiental, iluminação e transições regionais

Implementada vida discreta sobre as dez identidades, preservando a ordem de desenho: fundo e efeitos decorativos continuam antes das plataformas, inimigos, componentes e personagem. A nova composição não altera mapas, colisões, física, câmera, combate, chefe, reparos, habilidades, objetivos ou saves da campanha.

### Animação e iluminação

- LEDs com ciclos lentos e defasados por equipamento; monitores com avanço discreto a 2 Hz; ventoinhas em quatro quadros a 3 quadros/s nos temas Hardware, Cabeamento e Servidores.
- Ativações de circuitos e pulsos pequenos durante 2,5 segundos de um ciclo de 12 segundos, além dos fluxos temáticos já existentes. As falhas leves de Wi-Fi e a corrupção limitada de Servidores foram preservadas e agora respeitam os controles separados de conforto.
- Luzes pontuais em blocos de pixels, pequenas faixas neon e sombras sólidas. Variação de luminosidade lenta, com amplitude pequena; nenhum blur, halo ou flash de tela foi acrescentado.
- Mantidas quatro partículas ambientais por perfil. Os efeitos novos não criam listas de partículas, temporizadores acumulados nem superfícies do tamanho do mapa.
- Componentes ainda danificados recebem uma marca quente e pequenas falhas ocasionais abaixo e ao lado do equipamento. O passe consulta `runtime.matches({component:id})` sem escrever no estado; após o reparo, a decoração de dano desaparece. Sprite, rótulo e área de interação permanecem livres.

### Regiões e transições

Hardware recebeu quatro marcos originais em raster, armazenados em um único Canvas nativo de 512 × 128: placa-mãe/processador → bancos de RAM → GPU e barramentos → alimentação final iluminada. A mistura usa `smoothstep` entre marcos adjacentes, guiada pela posição absoluta da câmera, sem acumular deltas ou trocar fundos abruptamente. Os marcos continuam em uma camada com velocidade de parallax própria.

As outras fases reutilizam motivos dos seus próprios atlas para destacar regiões sucessivas, mantendo as identidades da Parte 4. O avanço acompanha o eixo predominante do mapa; nas fases verticais, respeita o sentido de subida a partir da entrada. Os quatro nomes de região por tema e a composição estão em `src/engine/parallax-life.js`. Trata-se de progressão espacial ao longo do percurso, sem modificar as regiões funcionais ou seus gatilhos de gameplay. A arena de VIRUS ZERO continua com seu recorte regional independente nos dois eixos.

O cache extra de Hardware é de 256 KiB; os demais temas usam os atlas existentes. O total verificado do parallax, incluindo os novos marcos, fica abaixo de 4 MiB. O cache é liberado ao descartar a fase e não cresce com o deslocamento da câmera.

### Conforto

O painel OPÇÕES ganhou dois controles independentes, salvos em `byteRunner.scenery.v1`:

- **Reduzir partículas do cenário**: elimina poeira ambiente e fragmentos de corrupção, mantendo os equipamentos animados.
- **Congelar animações decorativas do cenário**: fixa ventoinhas, monitores, LEDs e variações de luz; interrompe fluxos e falhas; mantém os marcos regionais e a leitura dos equipamentos. A posição espacial do fundo continua acompanhando a câmera.

O controle global anterior **Reduzir partículas, brilhos e animações decorativas** continua válido, respeita a preferência inicial de movimento reduzido e elimina o novo passe decorativo inteiro. Avisos de perigo, escudos, pontos fracos e animações de combate mantêm seu comportamento existente. `experience.js` e a lógica da câmera permaneceram byte a byte preservados.

### Testes e desempenho medido

Versão de fontes e assets: `f6a2bac4e9cae7df4dbfa0a366faa38716fa2a407023c508a31efd05dd5c78f6`.

| Verificação executada | Resultado |
| --- | --- |
| `python tests/run_review.py --ambient-only` | 61/61 verificações ambientais; zero erros de runtime |
| Visibilidade | 30 posições de apoio livres, nas dez fases; no pior caso, 89,21% dos pixels claros detectados no robô ficaram pelo menos 40 níveis de luminância acima do cenário imediatamente anterior ao seu desenho |
| Triagem temporal | 24 intervalos de 1/6 s por fase; pico de 0,191% dos pixels mudando; variação acima de 24 níveis de luminância limitada a 0,098% do quadro |
| Transições e conforto | Mistura contínua, cache limitado, congelamento temporal e redução de partículas independentes, preferências persistidas e modo global reduzido aprovados |
| `python tests/run_review.py` | 209/209 verificações de regressão; dez fases; 92 capturas; zero erros de runtime |
| `check_parallax.py`, `check_environment.py`, `check_hardware_depth.py` | Mapas, sistemas, câmera, física, atlas e manifestos preservados |
| `git diff --check` | Aprovado; somente avisos de conversão LF/CRLF |

O primeiro teste de contraste selecionava o centro de plataformas sem excluir paredes ou pisos sobrepostos. Ele reprovou uma posição artificial em DHCP. A seleção passou a usar os intervalos de apoio livres calculados pela auditoria de colisões, mantendo os mesmos limites de contraste. A execução inicial está preservada em `tests/ambient-initial-visibility-review.json`; a revisão final validou as 30 posições. Os testes visuais são uma amostragem de situações concretas, não uma garantia para toda possível posição do jogo.

Foram executados benchmarks antes e depois, em Chrome headless **com GPU desativada**, Canvas 905 × 644. O teste isolado do fundo usa 24 quadros de aquecimento e 120 amostras por fase e modo, nove posições de câmera e leitura síncrona após cada desenho. As médias posteriores ficaram entre 2,35 e 5,06 ms no modo normal e entre 1,37 e 2,36 ms no modo global reduzido. A diferença média observada nas dez fases foi de **+0,52 ms por desenho do fundo**; são execuções separadas, sujeitas à variação da máquina.

O benchmark do jogo completo (`--performance-only`, 60 amostras por mapa, update + draw) **reprovou o orçamento de p95 ≤ 16,7 ms nos onze casos tanto antes quanto depois**: dez fases e um mapa procedural de 24 salas. A reprovação foi mantida, sem relaxar o limite. Houve variação de tempo entre mapas, incluindo piora em alguns casos; as tabelas completas anteriores/posteriores estão no relatório. Esta etapa não certifica 60 FPS. Uma otimização global e uma medição com GPU em hardware real continuam necessárias para esse objetivo.

### Evidências e arquivos

- [Galeria dos cenários vivos](tests/ambient-gallery.html): quatro regiões de Hardware com personagem, quatro quadros temporais na mesma câmera e visibilidade nas dez fases.
- [Relatório visual e tabelas de desempenho](docs/parallax-life-review.md).
- `src/engine/parallax-life.js`: marcos raster, mistura espacial, iluminação, ventoinhas, monitores, LEDs, sinais de dano e preferências separadas.
- `src/engine/parallax.js`: integração do passe, controles dos efeitos anteriores e contabilização/liberação do cache extra.
- `src/engine/environment-art.js`: congelamento das animações dos sprites decorativos quando solicitado.
- `index.html`: carregamento do novo módulo e controles de conforto.
- `tests/parallax-ambient.js`, `tests/ambient-performance.js`, `tests/run_review.py` e `tests/report_ambient.py`: testes, capturas, benchmarks e geração dos relatórios.
- `tests/parallax-ambient-results.json` e `tests/ambient-summary.json`: resultados ambientais finais.
- `tests/ambient-before-background-performance.json` e `tests/ambient-before-full-performance.json`: medições anteriores, na versão da Parte 4.
- `tests/ambient-performance-results.json` e `tests/ambient-after-full-performance.json`: medições posteriores. `--performance-only` retorna código 1 quando o orçamento de frame reprova, mantendo as medidas no JSON.
- `tests/review-results.json`: regressão completa aprovada nesta versão.

Etapa encerrada após implementar, medir e revisar os efeitos e as transições. Nenhuma etapa adicional foi iniciada.

## Parte 6 — revisão final, otimização e encerramento do parallax

Implementação finalizada. A revisão preservou as dez identidades, os efeitos ambientais e as opções de conforto, e otimizou tanto o desenho das camadas quanto sua apresentação na tela. O [relatório final](docs/parallax-final-review.md) contém a lista de arquivos, métodos, resultados e limitações; a [galeria final](tests/parallax-final-gallery.html) reúne capturas das dez fases em viewport padrão e DPR 2.

### Otimizações realizadas

1. **Desenho somente dos trechos úteis:** o gerador agora registra `frameBounds` por variante, além de `emptyFrames`. O renderer prepara os recortes uma vez, pula variantes transparentes e recorta os blits aos limites do viewport. Os atlas continuam em cache; a navegação e o redimensionamento não os recriam. A auditoria verificou os limites contra os pixels dos pintores originais.
2. **Menos trabalho redundante:** removido o gradiente de tela inteira que era coberto pelo parallax opaco. O fallback anterior permanece quando o atlas não está disponível. As faixas estáticas deixaram de solicitar leitura frequente ao Canvas.
3. **Sprites e composição reutilizados:** ventoinhas usam quatro quadros raster em cache. A mistura regional usa um Canvas fixo de 256 × 256 e só é atualizada quando muda a região, a mistura quantizada em 64 passos ou a imagem. Descritores, condições de reparo e parâmetros constantes saíram do loop de desenho; arrays temporários de braços e pares de mistura foram eliminados.
4. **Apresentação direta quando possível:** em DPR efetivo 1 e dimensões lógicas inteiras, o jogo desenha diretamente no Canvas de saída, eliminando a cópia integral do quadro e liberando o framebuffer intermediário. DPR maior ou dimensões fracionárias mantêm o caminho escalado anterior com nearest-neighbor. Os contextos são opacos e o estado básico de desenho é definido explicitamente.
5. **Descarte verificável:** canvases são zerados e referências às imagens são removidas ao descartar a fase. Na mesma câmera, 60 desenhos após aquecimento criaram zero canvases e não reconstruíram faixas nem a mistura regional.

Não houve redesign dos sprites, troca de paletas, remoção de elementos de identidade ou alteração dos módulos de câmera, física, mapas e runtime. As alterações em `game.js` ficaram restritas aos construtores e ao caminho de apresentação; os guardas normalizam somente esses trechos exatos antes de conferir o restante por hash.

### Problemas e bordas corrigidos

- Grandes áreas transparentes dos atlas eram reenviadas ao Canvas em cada quadro; agora são omitidas por metadados e culling, incluindo recorte vertical e horizontal.
- A apresentação fazia uma cópia completa mesmo sem escala; o caminho nativo evita essa operação e o framebuffer redundante.
- O cálculo de linha dos monitores usava `%` com coordenadas negativas; passou a usar módulo positivo, evitando índices deslocados ao redor da origem e nas reversões.
- O culling dos pequenos sinais de dano agora considera sua extensão real além do corpo do componente, evitando cortes prematuros na borda.
- O descarte inclui as novas superfícies e as referências dos descritores, mantendo a memória gerenciada limitada mesmo quando o serviço descartado continua referenciado.
- A comparação inicial em Retina forçava DPR 1 mantendo uma superfície física maior; isso introduzia diferenças artificiais na borda. O fixture foi corrigido para comparar superfícies equivalentes. A posição inicial do teste de reversão também passou a estar dentro do envelope normal de acompanhamento. Os limites de pixels e a lógica da câmera não foram relaxados nem alterados. A reprovação inicial foi preservada em `tests/parallax-final-initial-retina.json`.
- A primeira medição nativa de RAF deixava o blur do menu sobre o jogo. O benchmark passou a iniciar a fase e verificar que o menu está oculto; a matriz inicial está preservada em `tests/parallax-final-initial-matrix.json`.

### Testes finais realmente executados

Fontes e assets finais: `ddf1cacc2559935f83f9194b2f29951effe78bca08ec7a1b268b511dd0b246da`.

| Verificação | Resultado executado |
| --- | --- |
| `python tests/run_review.py` | **209/209** verificações; dez fases; 92 capturas; zero erros de runtime |
| `python tests/run_review.py --parallax-final` | **43/43** verificações no viewport padrão |
| `--parallax-final --viewport 1920x1080 --dpr 2 --result-label parallax-final-retina` | **43/43** verificações em alta densidade |
| `python tests/run_review.py --ambient-only` | **61/61** verificações de efeitos, conforto, dano e leitura do personagem; 30 posições de apoio válidas |
| `--ambient-performance --result-label parallax-final-background-performance` | Dez fases em modo normal e reduzido, 120 amostras por caso após 24 quadros de aquecimento |
| `--profile-render --result-label parallax-final-profile` | Perfil final de update, desenho e apresentação, comparado ao perfil inicial desta etapa |
| `python tests/run_parallax_performance_matrix.py` | 33 cargas de update + draw, incluindo mapa procedural de 24 salas, em três configurações; 12 medições nativas de RAF |
| `--pacing-only` da matriz | Repetição das medições de RAF após corrigir o menu visível; a fase estava iniciada e o menu oculto nos resultados finais |
| Integridade | `check_parallax.py`, `check_environment.py`, `check_hardware_depth.py`, `check_maps.py` e `check_generation.py` executados e aprovados |
| Diff | `git diff --check` aprovado; somente avisos de conversão LF/CRLF |

A regressão confirmou física e colisões, câmera, ataques e comportamentos de inimigos, reparos, minigames, habilidades, salvamento e compatibilidade de saves, perguntas, vitória e as fases/escudos/telegráficos/derrota de VIRUS ZERO. Os totais por suíte têm cobertura sobreposta e não são somados como testes exclusivos.

### Câmera, pixel art e visibilidade

A auditoria comparou o renderer final com o renderer e o módulo ambiental salvos antes desta etapa. Foram **394 amostras por configuração**, em 320 × 180, 905 × 644 e 1920 × 1080, incluindo limites específicos das camadas, movimento horizontal, vertical e diagonal, reversões rápidas, retornos à origem e coordenadas negativas. O maior desvio por canal foi de **2 níveis em 255**, associado à composição em cache; nenhum pixel teve desvio acima de cinco. As cenas completas nos caminhos direto e intermediário ficaram **idênticas** na comparação em superfícies equivalentes de DPR 2.

Nearest-neighbor foi preservado após mudanças reais de tamanho e DPR. Os recortes e escalas das camadas são inteiros, as margens são transparentes e os limites dos atlas foram conferidos. O comportamento de câmera permaneceu determinístico e limitado, sem acúmulo de deslocamento após ida e volta. Não foram encontradas novas emendas ou borrões nas condições auditadas.

Nas 30 posições de apoio do teste de leitura, o menor percentual de pixels claros do robô pelo menos 40 níveis de luminância acima da cena anterior foi **89,21%**. A inspeção das capturas manteve personagem, inimigos, plataformas e equipamentos interativos com contraste superior às estruturas decorativas. Os fundos permanecem em passes anteriores, sem novas colisões, e os avisos de perigo continuam visíveis. Essa cobertura é uma amostragem concreta, sem garantia para toda combinação possível de posição e efeitos.

### Memória e mapas grandes

O pico de superfícies RGBA do parallax foi de **4.200.704 bytes (4,006 MiB)** em Hardware, dentro do limite auditado de **4,25 MiB**. A superfície regional adicional custa 256 KiB e cada atlas de quatro ventoinhas custa 6.400 bytes; esse custo fixo reduz trabalho de desenho. As outras fases ficaram abaixo desse pico. O descarte deixou **zero bytes** nessas superfícies, mesmo mantendo referência ao objeto descartado.

O mapa grande auditado tem **14.592 × 2.304 pixels**, 24 salas e 316 formas na configuração usada na auditoria. Foram percorridas 120 vistas com mudanças de eixo, tamanho e efeitos, sem crescimento dos caches. Os benchmarks também exercitaram outro mapa de 24 salas em cada configuração de tela. Não há textura do tamanho do mundo.

Os números de memória são das superfícies RGBA gerenciadas, não do RSS total do Chrome, heap completo ou VRAM. Framebuffers, pool compartilhado de imagens e terreno têm limites e métricas próprios; a matriz registrou os framebuffers e confirmou os caches de terreno dentro do limite de 96 chunks.

### Desempenho e limitações restantes

Condições: **Chrome headless com GPU desativada**. A média do fundo entre as dez fases passou de **3,66 para 2,71 ms**, redução observada de **26,1%** em execuções separadas. O perfil de update + draw desta etapa passou de **32,01 para 10,07 ms por quadro**. Esses tempos de CPU/submissão não são usados como substitutos dos intervalos reais de apresentação.

| Configuração | Canvas lógico / DPR efetivo | RAF observado nos quatro cenários | Orçamento CPU p95 ≤ 16,7 ms |
| --- | --- | --- | --- |
| Desktop padrão | 905 × 644 / 1 | **55,7–59,3 FPS** | **10/11** cargas aprovadas |
| Viewport mobile 480 × 800 | 454 × 438 / 1 | **aproximadamente 60 FPS** | **11/11** cargas aprovadas |
| Viewport 1920 × 1080, DPR 2 | 1179 × 819 / 1,5 efetivo | **36,7–42,2 FPS** | **0/11** cargas aprovadas sem GPU |

As medições por RAF usaram Hardware, Software, Servidores e um mapa procedural de 24 salas, com 12 quadros de aquecimento e 90 intervalos nativos por cenário, jogo iniciado, menu fechado e deslocamento diagonal sintético. O passo de simulação do benchmark é fixo em 1/60. As medidas incluem o compositor e são registradas separadamente dos tempos de update + draw.

Permaneceu um pico acima do orçamento no desktop, na carga de Servidores/VIRUS ZERO (**p95 de CPU 26,1 ms**). Em alta densidade, as onze cargas reprovaram o orçamento neste ambiente sem GPU. Essas reprovações foram mantidas nos relatórios, sem remover testes ou relaxar o limite. **Não há promessa universal de 60 FPS.** Uma medição com GPU habilitada em hardware real, sessões humanas longas e outros navegadores/zooms/drivers permanece necessária para conclusões por dispositivo.

### Arquivos e evidências finais

Arquivos de implementação desta etapa: `game.js`, `src/engine/parallax.js`, `src/engine/parallax-life.js`, `src/engine/background-scene.js`, `tools/build_environment_art.py`, `assets/pixelart/manifest.json` e `src/engine/art-manifest.js`. A tabela completa de testes, guardas, fixtures, relatórios e capturas modificados está no [relatório final](docs/parallax-final-review.md).

- Resumo verificável: `tests/parallax-final-summary.json`.
- Auditorias: `tests/parallax-final-results.json` e `tests/parallax-final-retina-results.json`.
- Ambiente e visibilidade: `tests/parallax-ambient-results.json`.
- Regressão completa: `tests/review-results.json`.
- Desempenho: `tests/parallax-final-performance-matrix.json`, relatórios de cada configuração, `tests/parallax-final-background-performance-results.json` e `tests/parallax-final-profile-results.json`.
- Referências anteriores: `tests/parallax-final-before-background.json`, `tests/parallax-final-before-full.json`, `tests/parallax-final-before-profile.json` e os dois módulos salvos em `tests/fixtures/*-before-final.js`.
- Geração do relatório: `python tests/report_final_parallax.py`, que valida os resultados e a correspondência da versão de fontes antes de produzir o resumo e a galeria.

**Encerramento:** revisão, otimização, correções e testes finais concluídos. As limitações restantes estão documentadas; nenhuma etapa adicional foi iniciada.
