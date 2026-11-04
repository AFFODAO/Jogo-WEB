# BYTE RUNNER

A [revisão após a reformulação](tests/AUDIT.md) registra os testes executados, as correções de interface e as capturas comparativas das dez estruturas.

Repaginação **Midnight Circuit**: 22 atlas originais em pixel art, animações no Canvas, tiles por fase, paralaxe e interface renovada. Consulte [recursos, geração e integração](docs/art-direction.md).

**Reparos interativos:** aperte E perto de um componente para abrir o diagnóstico da fase. O mundo fica pausado durante o desafio. Veja [minigames, controles, habilidade e salvamento](docs/repair-minigames.md).

**Fluidez e conforto:** câmera com antecipação, impactos, ambientações originais por fase, introduções puláveis, caches opcionais e opções de volume/efeitos. Veja [integração, ritmo e limites de desempenho](docs/experience-polish.md).

Jogo de plataforma 2D sobre informática e redes, com dez fases, combate, reparos, perguntas, XP, habilidades e campanha salva no navegador.

Abra `index.html` em um navegador moderno. Não é necessário instalar pacotes ou compilar o projeto. Os arquivos usam módulos de navegador com scripts clássicos e o namespace `ByteRunner`, preservando a abertura local por `file://` e a hospedagem estática.

## Arquitetura dos mapas

As dez fases foram reconstruídas com plantas independentes. A primeira metade inclui placa-mãe, salas do sistema operacional, switch ramificado, túneis de roteamento e subida por sinais Wi-Fi. A segunda traz um prédio com shafts, setores DHCP, labirinto de domínios DNS, fortaleza de segurança e um data center com arena elevada. As dez fases continuam na campanha.

Consulte [os novos percursos, efeitos dos reparos e imagens completas](docs/first-five.md). E abre o diagnóstico do componente e também ativa portas/interfaces por proximidade. O minimapa das fases reconstruídas mostra sua geometria real.

Os percursos e diferenças das fases 6–10 estão em [docs/last-five.md](docs/last-five.md). Os padrões preservados e as melhorias do chefe estão em [FASE10.md](tests/FASE10.md).

| Arquivo/pasta | Responsabilidade |
| --- | --- |
| `src/maps/01-hardware.js` até `10-servers.js` | Um arquivo por fase, com geometria explícita, cenário, obstáculos, inimigos, reparos, objetivos e configurações. Não há geração de plataformas por índice ou herança de uma pista comum. |
| `src/maps/campaign.js` | Ordem da campanha por IDs estáveis. |
| `src/engine/maps.js` | Registro, validação e congelamento das definições. |
| `src/engine/level-runtime.js` | Estado isolado da fase, condições, objetivos, interativos, mecânicas e comportamentos de inimigos registrados. |
| `src/engine/visuals.js` | Assets, spritesheets, animações por estado, camadas, paralaxe e renderizadores de efeitos. |
| `src/engine/repairs.js`, `src/engine/repair-games.js` | Registro, ciclo de vida e dez tipos de diagnósticos interativos, com tentativas, dicas e controles acessíveis. |
| `game.js` | Física, combate, câmera, HUD, XP, habilidades, perguntas e coordenação dos serviços da fase. |
| `index.html`, `style.css` | Interface, ordem de carregamento dos módulos e painel compartilhado dos reparos. |
| `tools/` | Ferramentas Python sem bibliotecas externas para importar e auditar mapas. |
| `tests/` | Regressão da campanha, testes da arquitetura, referência anterior à migração e evidências. |

Cada definição descreve suas próprias plataformas, paredes, chão, portas, limites, início, saída e checkpoints. Um mapa pode usar chão contínuo com poços ou somente segmentos desenhados em coordenadas absolutas. Câmera, saídas por região e checkpoints ordenados funcionam também em salas, percursos que descem, labirintos e arenas. A modalidade declarada (`horizontal`, `vertical`, `maze`, `multi-route`, `arena`, `hub`) descreve a intenção; a geometria é escrita pelo autor, sem trocar apenas o nome do layout.

As mecânicas usam registros de tipos e dados locais. Um interruptor pode ativar uma ponte; uma porta pode exigir dois reparos e um sinal; um objetivo pode depender de visitar uma sala, coletar itens ou concluir um minigame. Essas relações são avaliadas a partir do estado da fase e podem ser salvas.

Os mapas e as entidades de definição são imutáveis. Vida, posição, reparos, flags e progresso pertencem a instâncias separadas. Ao trocar ou repetir uma fase, os serviços anteriores são descartados. Os campos novos do salvamento são opcionais; os saves anteriores de versão 1 continuam aceitos. Preserve IDs e a ordem dos inimigos/componentes existentes ao editar uma fase salva: a campanha antiga ainda guarda parte desse progresso por posição nas listas.

## Como criar um percurso realmente diferente

Edite somente o arquivo da fase escolhida e seus módulos de mecânica/arte. Defina o tamanho do mundo, desenhe os pisos e paredes, escolha onde a câmera acompanha o jogador, coloque os pontos de início/saída e só então distribua objetivos e inimigos. Para salas desconectadas ou corredores em andares, use `map.ground.mode: "explicit"`; nenhum piso global será criado nessa modalidade. Para uma arena, use uma saída por região e objetivos de combate. Para um labirinto, combine paredes, condições de portas e objetivos de visita.

As fases usam cenário vetorial próprio em `src/content/first-five.js` e `src/content/last-five.js`, além de mecânicas de ambiente, portais e vigilância. A arte procedural original permanece disponível como fallback. Uma fase pode desligá-la com `presentation.procedural: false` e usar suas próprias camadas e sprites. Recursos visuais não determinam colisões: a geometria permanece explícita e testável.

Veja o [contrato dos mapas e exemplos de extensão](docs/architecture.md). O [mapa de teste com salas](tests/fixtures/room-map.json) demonstra uma planta descontínua e objetivos diferentes; ele não integra a campanha.

## Verificação

Os [inimigos e suas variantes](docs/enemies.md) possuem controladores em `src/engine/enemies.js`, com navegação, ataques anunciados, pontos fracos e integração com XP e salvamento.

```powershell
python tools/check_maps.py
python tests/run_review.py
```

O primeiro comando audita os arquivos e o manifesto. O segundo executa o jogo real no Chrome headless, em cópia e perfil temporários, testa as dez fases e os serviços novos e grava `tests/review-results.json`. Requer Chrome instalado no caminho configurado em `tests/run_review.py`. O salvamento do jogador não é usado.

Os testes confirmam que as dez fases substituíram a geometria de `tests/map-baseline.json` e que as fases 1–5 permaneceram iguais à entrega anterior durante a reconstrução das fases 6–10. Também exercitam chão descontínuo, condições de portas, interativos, minigame modal, persistência, checkpoints, sprites, paralaxe, comportamentos de inimigos e saves antigos. Os testes de percurso usam movimento real, vento e modificadores de sinal; diretórios e interfaces são atravessados com E.

Saves das plantas antigas reiniciam a fase na entrada do novo mapa, mantendo XP, nível e habilidades, inclusive escolhas pendentes. Saves de revisão 2 das fases 1–5 continuam retomando sua posição e progresso, pois essas plantas foram preservadas nesta entrega. Isso evita retomar dentro de paredes ou em um vazio da planta reconstruída.

Detalhes e limitações da revisão anterior: [tests/README.md](tests/README.md). Projeto e testes do chefe final: [tests/FASE10.md](tests/FASE10.md). Não foram medidos FPS em equipamentos fracos nem realizados testes físicos de toque; o minigame por sequência é um exemplo optativo para teclado e não foi aplicado às dez fases.
