# BYTE RUNNER — reconstrução dos mapas V3

**Estado atual (09/11/2026):** fases 1–8 reconstruídas, incluindo DNS. As fases 3–8 estão nas seções 12 e 14–18. As seções 1–9 conservam o registro histórico da preparação de 06/11/2026; seus limites de escopo e inventários descrevem aquela etapa. V3 identifica esta iniciativa, não a revisão numérica dos mapas.

O **Modo Desenvolvedor**, implementado sem reconstruir mapas, está documentado na seção 13.

## 1. Segurança, referência e limites da etapa

| Item | Estado verificado |
| --- | --- |
| Diretório analisado | Checkout local `jogo WEB`, informado na sessão |
| Remoto `origin` | `https://github.com/AFFODAO/Jogo-WEB.git` |
| Branch inicial | `main`, sem modificações ou arquivos não rastreados no início |
| Commit de referência | `bbe227357432ad48bf22ccb3cc9a6a861d83d75f` — `bbe2273 decimo quarto` |
| Branch de trabalho criada | `rebuild-maps-v3`, a partir desse commit |
| Mapas antigos | Os dez arquivos e o manifesto estão rastreados e preservados no histórico; o último commit que tocou `src/maps/` é `47f6057` |
| Integridade da árvore existente | Os **621 arquivos previamente rastreados** foram comparados por SHA-256 antes/depois da coleta: todos permaneceram idênticos |
| Operações que não foram feitas | Push, merge, rebase, reset, stash, commit, alteração dos mapas ou dos sistemas de produção |
| GitHub remoto | URL conferida no Git local; não foi feito fetch/pull nem verificada eventual atualização remota posterior ao checkout |

A criação da branch exigiu permissão para escrita em `.git`, inicialmente somente leitura no sandbox. Nenhuma alteração local foi descartada. A branch `main` e seus mapas continuam na referência anterior. Exemplo de consulta ao mapa preservado, sem restaurar ou sobrescrever o trabalho:

```powershell
git show bbe2273:src/maps/01-hardware.js
```

**Escopo autorizado agora:** leitura do projeto real, inventário dos mapas efetivamente carregados, execução da referência de testes em cópia isolada, documentação e ferramenta de análise. O jogo inteiro não será reconstruído. Novas geometrias, dimensões, entidades, perguntas, habilidades, física, arena ou regras de salvamento não foram implantadas.

## 2. Arquivos e arquitetura realmente examinados

| Arquivos/pastas existentes | Papel confirmado e consequência para a reconstrução |
| --- | --- |
| `README.md`, `tests/README.md` | Entrada e documentação histórica; vários números e descrições ficaram antigos e não substituem o código atual |
| `game.js` | Coordenação de mapas, movimento, colisões, combate, perguntas, XP/habilidades, checkpoints, salvamento e VIRUS ZERO |
| `index.html`, `style.css` | Ordem real dos scripts clássicos, interface de reparos/perguntas, pausa e apresentação responsiva |
| `src/maps/01-hardware.js` a `10-servers.js` | Plantas autorais explícitas; todas passam por `ByteRunner.campaignGeneration.build(...)` antes do registro |
| `src/maps/campaign.js` | Campanha imutável com `phase-01` a `phase-10`, nessa ordem |
| `src/engine/maps.js` | Registro, clonagem, validação e congelamento; contrato `schemaVersion: 2` |
| `src/engine/platform-physics.js`, `falling-platforms.js` | Parâmetros básicos compartilhados, certificados de salto e ciclo de plataformas que caem |
| `src/engine/level-runtime.js` | Flags, condições, objetivos, mecânicas, interativos, conexões e estado persistível por fase |
| `src/engine/enemies.js` | Perfis, variantes, percepção, suporte, patrulha, preparação de ataques e efeitos específicos |
| `src/engine/repairs.js`, `repair-games.js` | Registro dos reparos e dez diagnósticos modais da campanha |
| `src/engine/experience.js` | Câmera suavizada, conforto, efeitos e áudio; a função de câmera não está em um arquivo separado inventado |
| `src/engine/map-audit.js`, `map-debug.js` | Simulação discreta de travessia, índice espacial e overlay `?dev`; não são prova de dificuldade humana |
| `src/engine/visuals.js`, `environment-art.js`, `pixel-art.js`, `art.js`, `background-scene.js`, `parallax.js`, `parallax-life.js`, `src/content/parallax.js` | Assets, colisões separadas da arte, cache/culling e identidade visual já existente das dez fases |
| `src/content/first-five.js`, `last-five.js`, `parkour.js`, `pacing.js` | Portais, vento/interferência, vigilância, perigos de parkour e caches opcionais |
| `src/generation/campaign.js` | Dez receitas com seeds e rotas de serviço adicionais; também controla a revisão efetiva e a exclusão da arena |
| `src/generation/composer.js`, `config.js`, `validation.js`, `random.js` | Compilação de salas, qualificação de IDs, limites, validação e aleatoriedade determinística |
| `src/generation/graph.js`, `rooms.js`, `structural.js`, `parkour-validation.js`, `gameplay.js`, `demo.js` | Geração opcional de salas/parkour e prévia por URL; não equivale à campanha normal |
| `assets/pixelart/manifest.json`, `assets/pixelart/README.md`, `assets/pixelart/`, `assets/sprites/` | Biblioteca existente: **77 atlas registrados**; 79 PNGs e 22 SVGs presentes em `assets/`, além de JSON/documentação. Quantidade de arquivos não é quantidade de assets carregados |
| `tools/build_first_five.py`, `build_last_five.py`, `build_environment_art.py`, `import_maps.py` | Fontes de geração/importação; executar os dois primeiros reescreve mapas e pode apagar edições manuais futuras |
| `tools/check_maps.py`, `check_environment.py`, `check_generation.py`, `check_parallax.py`, `check_hardware_depth.py` | Guardas atuais de mapas, sistemas, ordem de scripts e atlas |
| `tests/run_review.py`, `review.js`, `architecture.js`, `first-five.js`, `last-five.js`, `enemies.js`, `repairs.js`, `experience.js`, `campaign-generation.js`, `final-regressions.js` e fixtures | Regressão real, auditoria de percurso, contratos históricos e limitações do método |
| `docs/architecture.md`, `docs/campaign-generation-1-5.md`, `docs/campaign-generation-6-10.md`, `docs/parallax-final-review.md`, `PROGRESSO_MAPAS.md` | Contexto de arquitetura, geração e limites anteriores de desempenho |

O levantamento dos assets é estrutural, de manifestos e referências; não representa uma revisão artística individual de cada arquivo. As capturas panorâmicas foram preservadas na referência desta etapa para inspeção dos mapas.

### Caminho real do mapa até o jogo

```mermaid
flowchart LR
  A["src/maps/NN-tema.js: planta autoral"] --> B["campaignGeneration.build: receita e seed"]
  B --> C["mapGeneration.compile / composer"]
  C --> D["maps.register: valida e congela"]
  D --> E["campaign.js: IDs ordenados / PHASES"]
  E --> F["game.js: loadPhase / loadMap"]
  F --> G["level-runtime: condições e mecânicas"]
  F --> H["visuals: arte sem determinar colisões"]
```

As rotas adicionais não ficam todas escritas em `src/maps/`. Contar apenas os JSONs autorais subestima o jogo carregado: há **242 plataformas autorais e 282 compiladas**. Os 40 acréscimos incluem percursos de serviço e um elevador de transmissão. As contagens deste documento usam as definições compiladas, distinguindo conteúdo condicional de conteúdo ativo.

## 3. Contratos dos sistemas a preservar

### Física, movimento e colisão

- Corpo do R-07: **34 × 48 px**; sprite principal: **32 × 48 px**, desenhado com ajuste lateral. Não redimensionar colisões para acompanhar a arte.
- Velocidade básica: **255 px/s**; impulso do salto: **690 px/s**; gravidade: **1.850 px/s²**; velocidade terminal vertical usada na simulação: **1.050 px/s**.
- Sem vento, interferência ou habilidades: altura balística **128,676 px**, voo para altura igual **0,746 s**, deslocamento horizontal teórico **190,216 px**. Isso não é uma autorização para vãos de 190 px entre plataformas: largura do corpo, subida, tetos e margens de aterrissagem reduzem o espaço útil.
- `platformPhysics.canReach` usa intervalos de apoio, margem de seis pixels, largura mínima de corpo + 12 e fator conservador 0,82. Usar esse contrato e depois validar com `movePlayer`; não projetar por distância entre centros.
- `game.js` integra a gravidade pela velocidade média do passo, resolve X/Y, trata plataformas `one-way` e reaplica limites laterais. A atualização usa acumulador de **1/120 s**, limitado a oito passos por frame.
- Pisos explícitos não criam um chão global de segurança. Cair abaixo de `worldHeight() + 180` dispara recuperação. Plataformas móveis, temporárias e que caem possuem estado por fase; sua envoltória inteira precisa ficar livre.
- Vento, sinal fraco, infecção e interferência alteram deslocamento/disparo. Todo caminho obrigatório futuro deve ser possível com atributos básicos e nos extremos das mecânicas, sem depender de `boost`.

### Câmera e progressão espacial

As dez definições compiladas permitem **X e Y**, mesmo quando o layout é horizontal ou vertical. O compositor configura offsets de acompanhamento em 0,44/0,55. `experience.camera` suaviza a posição, antecipa a velocidade, mantém limites do mundo e um envelope vertical de segurança. Portais posicionam a câmera imediatamente no destino.

As dez plantas compiladas usam atualmente `map.progress.axis: 'objectives'`. A direção visual do mapa não determina sozinha o progresso. Ampliar a geometria pode deixar a barra quase parada entre reparos; isso deverá ser resolvido nos dados e no desenho dos objetivos, sem trocar a física/câmera nesta preparação.

### Registro, IDs e geração

Manter `schemaVersion: 2`, os dez IDs da campanha, a ordem dos temas e o namespace `ByteRunner`. Definições são imutáveis; dano, reparos e flags pertencem ao runtime. Referências em `requires`, `disabledWhen`, `opensWhen`, `requiresComponentId`, portais e objetivos precisam apontar para IDs válidos.

O compositor qualifica referências por sala, inclusive condições, patrulhas, limites do chefe e destinos. A campanha atual usa uma macro-sala `world` e remove esse prefixo para manter compatibilidade de IDs. Não remover essa normalização ou misturar IDs qualificados e legados por acidente.

Limites atuais de `src/generation/config.js`: **64 salas**, dimensão máxima de **32.768 px** por eixo e **2.048 entidades por sala**. São limites de validação, não orçamentos seguros de desempenho.

### Inimigos, combate e VIRUS ZERO

Perfis existentes: `basic/common`, `fast`, `armored`, `flyer`, `shooter`, `parasite` e `boss`; variantes temáticas incluem arquivo/fork, pacote, Wi-Fi, DNS e firewall. Patrulha, suporte, linha de visão, `navigationBounds`, `groundY` e `activationRegion` precisam acompanhar a nova geometria. Inimigos terrestres não devem nascer em plataformas que só aparecerão depois de um reparo.

Os projéteis do jogador mantêm a assimetria atual de atravessar obstáculos; projéteis inimigos são bloqueados por sólidos. Isso é comportamento existente, não uma regra nova proposta para V3.

O chefe efetivo da fase 10 é **`e08`**, com **90 HP e 500 XP**, e não apenas os valores padrão menores do perfil `boss`. Seus limites atuais são `left:4880/right:6500`; ativação em `(4800,320,1800,650)`; há checkpoint em `(5000,900)`. A conclusão usa `{type:'boss-question', enemyId:'e08'}`.

O escudo consulta **todos os componentes não reparados da fase**, não uma lista isolada de relays. Acrescentar um componente supostamente opcional pode impedir a vitória. O chefe possui três etapas, transições protegidas, telegráficos, investida, rajada, onda/surge, combo, invocação e ponto fraco. Esses comportamentos devem permanecer; a nova arena precisará fornecer cobertura, espaço de desvio e apoio compatíveis.

### Reparos, minigames e objetivos

Os tipos reais por tema são `circuit`, `software`, `ethernet`, `route`, `wifi`, `cabling`, `dhcp`, `dns`, `firewall`, `servers`. `createComponents` escolhe `repairChallenges.forPhase(phaseIndex, componentIndex)` quando não há um reparo explícito não legado. `hold` e `sequence` continuam registrados como extensões; os diagnósticos atuais da campanha são modais, pausam o mundo e usam o painel compartilhado.

Sucesso repara o componente, limpa corrupção, emite o evento, concede 30 XP, reavalia objetivos e salva. Falha/cancelamento não pode concluir o reparo. A dificuldade/variação também depende de `componentIndex`; aumentar o número de componentes aumenta a repetição e pode alterar o tamanho dos desafios.

As dez fases exigem atualmente todos os reparos e o total configurado de inimigos, além da pergunta educativa. Switch, DHCP e Firewall têm condições adicionais explícitas por flags. Aumentar inimigos/reparos sem atualizar contadores e dependências pode criar bloqueios ou liberações prematuras. `createViruses` inicializa inimigos declarados como `countsForObjective:true`; não basta pôr `false` no JSON para criar um encontro opcional.

### Checkpoints e recuperação

Há modos `legacy`, `proximity`, `ordered` e `free`. A campanha usa `proximity` ou `free`, conforme a tabela abaixo. Para pontos com Y, a ativação exige proximidade horizontal e pés a até 24 px da cota. A recuperação usa **`checkpointX + 38`** e `checkpointY - altura`.

Um checkpoint futuro precisa funcionar antes dos reparos, ter piso permanente suficiente para essa posição deslocada e estar fora de lasers, portais conflitantes, inimigos e envoltórias móveis. Ordenar pontos por X é incorreto para hubs e subidas; manter a modalidade adequada à planta.

### Perguntas, XP e habilidades

`QUESTION_BANK`, em `game.js`, contém **dez perguntas por tema**. IDs e histórico são mantidos em `byteRunner.usedQuestions.v1`; opções são embaralhadas. Resposta errada marca `questionRetryRequired`, persiste e exige repetir a fase. Em mapas muito longos essa penalidade cresce bastante: a regra deve ser preservada e avaliada conscientemente, sem amenização silenciosa nesta etapa.

XP existente: reparo 30, fragmento 20, grupos de objetivos 100 cada; inimigos usam seus perfis/especificações e minions têm regra própria. Limiar do próximo nível: `100 + (nível - 1) × 45`. Habilidades existentes: `armor`, `rapid`, `cannon`, `boost`, `shield`, `repair`, com escolha pendente persistida. Expandir o conteúdo sem orçamento de XP pode saturar habilidades cedo e descaracterizar combate/dificuldade. O percurso obrigatório continuará validado com atributos básicos.

### Salvamento e revisão dos mapas

- Chave da campanha normal: **`byteRunner.campaign.v1`**; formato salvo `version:1`. Guarda `phaseId`, `phaseIndex`, `mapRevision`, XP, nível, habilidades, checkpoint, flags/mecânicas e progresso das entidades.
- Inimigos, reparos, integridade de componentes e coletáveis ainda são restaurados **por posição nos arrays**, apesar dos IDs. Mesma revisão + listas reordenadas pode aplicar progresso ao objeto errado.
- `continueCampaign` compara a revisão efetiva do mapa. Quando mudou, reinicia o estado espacial e os objetivos da fase, preservando XP, nível, habilidades e desbloqueios; a saúde segue as regras existentes de retomada/retry. A escolha pendente é reaberta quando aplicável.
- Revisões efetivas atuais: **3 nas fases 1–5 e 7–10; 4 em Cabeamento**. Os blueprints ainda dizem revisão 2. **Editar só `revision` no arquivo da fase não basta**: `campaignGeneration.build` usa `settings.revision || 3`.
- Decisão de preparação: reservar **revisão efetiva 5 ou superior** para as plantas reconstruídas. O número V3 da iniciativa não autoriza reutilizar a revisão efetiva 3 já publicada. A alteração será feita somente na etapa de reconstrução.
- Não trocar a chave da campanha, apagar `localStorage` ou resetar XP para resolver incompatibilidade. Histórico de perguntas, som, conforto e cenário têm chaves separadas.
- Prévia procedural usa chaves `byteRunner.rooms.v1:`/`byteRunner.procedural.v1:` e modifica a campanha apenas quando a URL a solicita. Não confundir essa prévia com os dez mapas normais.

## 4. Inventário das dez fases atuais

### Método da estimativa de área explorável

O retângulo do mundo inclui ar, tetos e espaços sem apoio; por isso sua área não é chamada de área explorável. Foi estimada uma **faixa candidata de navegação** a partir dos intervalos onde o corpo pode ficar apoiado sem penetrar em outra geometria (`surfaces()` da auditoria).

Sobre cada intervalo, projeta-se uma faixa de **48 + 128,676 = 176,676 px** de altura: corpo em pé mais um salto básico. A união dessas faixas é recortada ao mundo e subtraída da união dos sólidos, sem contar sobreposições duas vezes. Foram medidos dois estados em `animationTime = 0`: inicial e com todos os componentes reparados. **Flags de terminais, ciclos móveis e visitas não foram forçados nesse segundo estado.**

Essa é uma estimativa geométrica útil para comparar plantas, **não uma prova de alcançabilidade de toda a faixa, tempo de exploração ou área varrida numa partida**. Plataformas one-way são tratadas geometricamente como retângulos; portais e fases temporais exigem avaliação à parte. As áreas livres totais e todas as coordenadas estão em [inventory.json](tests/rebuild-v3-baseline/inventory.json). A regressão de percurso complementa, mas não transforma essa aproximação em uma partida contínua.

Áreas abaixo em **milhões de px²**, arredondadas a três casas; `início → reparos` usa os dois estados descritos.

| Fase / tema | Dimensões em px | Retângulo do mundo | Faixa candidata início → reparos | Formato compilado |
| --- | --- | ---: | ---: | --- |
| 1 Hardware | 2800 × 1000 | 2,800 | 0,783 → 0,874 | horizontal |
| 2 Software | 1900 × 1400 | 2,660 | 0,668 → 0,753 | hub |
| 3 Switch | 2200 × 1200 | 2,640 | 0,782 → 0,903 | multi-route |
| 4 Roteador | 2200 × 1500 | 3,300 | 1,133 → 1,204 | maze |
| 5 Wi-Fi | 1550 × 2400 | 3,720 | 0,861 → 1,001 | vertical |
| 6 Cabeamento | 1600 × 3000 | 4,800 | 1,693 → 1,973 | vertical |
| 7 DHCP | 2800 × 1700 | 4,760 | 0,663 → 0,949 | hub |
| 8 DNS | 3400 × 2100 | 7,140 | 1,780 → 2,001 | maze |
| 9 Firewall | 3600 × 1800 | 6,480 | 1,492 → 1,577 | multi-route |
| 10 Servidores | 6800 × 2000 | 13,600 | 2,060 → 2,316 | multi-route |

### Quantidades declaradas

`P autorais → compiladas` não inclui os segmentos de chão. Condições podem manter uma plataforma/obstáculo inativo no início. Inimigos são os declarados, sem somar invocações futuras. Caches gerados por `pacing` não foram misturados aos coletáveis declarados.

| Fase | Segmentos de chão | P autorais → compiladas | Inimigos | Reparos | Coletáveis | Obstáculos / gates | Checkpoints / modo |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 3 | 17 → 20 | 3 | 3 | 5 | 2 / 0 | 3 / proximity |
| 2 | 4 | 11 → 14 | 3 | 3 | 4 | 10 / 0 | 3 / free |
| 3 | 5 | 23 → 27 | 3 | 3 | 4 | 0 / 0 | 3 / free |
| 4 | 4 | 17 → 20 | 3 | 3 | 4 | 2 / 0 | 3 / free |
| 5 | 5 | 26 → 29 | 3 | 3 | 5 | 0 / 0 | 4 / proximity |
| 6 | 8 | 36 → 44 | 4 | 3 | 4 | 5 / 0 | 4 / proximity |
| 7 | 5 | 18 → 21 | 4 | 3 | 4 | 1 / 1 | 4 / free |
| 8 | 8 | 33 → 36 | 5 | 3 | 5 | 6 / 0 | 4 / free |
| 9 | 6 | 17 → 21 | 5 | 4 | 4 | 4 / 4 | 5 / free |
| 10 | 8 | 44 → 50 | 8 | 4 | 6 | 4 / 1 | 5 / free |
| **Total** | **56** | **242 → 282** | **41** | **32** | **45** | **34 / 6** | **38** |

### Fase 1 — Hardware

- **Fonte e regiões:** `src/maps/01-hardware.js`; CPU, RAM, GPU e BUS; placa-mãe, refrigeração e caches L1/RAM. Entrada `(70,802)`; saída regional `(2670,786,90,64)`.
- **Plataformas e combate:** 20 fixas compiladas; `basic`, `fast`, `armored`, um de cada. Há vento na região de refrigeração, desligado pelo reparo da CPU.
- **Objetivos:** reparar `c01` soquete da CPU, `c02` banco de RAM e `c03` alimentação da GPU; derrotar os três inimigos e responder à pergunta. Minigame `circuit`.
- **Checkpoints:** `(1050,850)`, `(1400,510)`, `(2000,850)`.
- **Diagnóstico de design:** a progressão obrigatória se concentra em três serviços; simplesmente alongar a placa criaria trechos vazios. O primeiro checkpoint fica 980 px à direita da entrada, uma referência a reavaliar ao ampliar. A rota opcional de serviço tem três degraus; isso acrescenta geometria, não uma nova missão. Vento deve entrar no teste de retorno e de salto básico.

### Fase 2 — Software

- **Fonte e regiões:** `src/maps/02-software.js`; desktop, processos, arquivos e escalonador em quatro salas. Entrada `(280,1202)`; saída `(1660,1186,90,64)`.
- **Plataformas e combate:** 12 fixas + duas móveis; dez obstáculos. Inimigos `fast`, `basic`, `shooter`.
- **Objetivos:** `c01` processo do sistema, `c02` índice de arquivos, `c03` escalonador; três inimigos e pergunta. Minigame `software`. Há oito conexões de diretório declaradas, seis ativas no início e oito com reparos.
- **Checkpoints:** `(180,650)`, `(1250,650)`, `(1300,1250)`.
- **Diagnóstico:** a topologia de quatro salas e os portais encurtam a viagem física; aumentar largura sem ampliar tarefas não aumenta proporcionalmente a duração. É preciso diferenciar subdiretórios, criar retornos legíveis e conservar destinos seguros em ambos os sentidos. O excesso de portais similares pode desorientar sem marcos e rotas claras.

### Fase 3 — Switch

- **Fonte e regiões:** `src/maps/03-switch.js`; backplane/uplink e quatro portas Ethernet. Entrada central `(1000,992)`; saída `(1050,386,90,64)`.
- **Plataformas e combate:** 26 fixas + um elevador móvel acrescentado pela receita. Inimigos `basic`, `parasite`, `shooter`.
- **Objetivos:** `c01` conector Ethernet, `c02` enlace da porta 04, `c03` backplane; flags **`port-a` e `port-b`** do objetivo `active-ports`; três inimigos e pergunta. Minigame `ethernet`.
- **Checkpoints:** `(1010,1040)`, `(260,900)`, `(1880,400)`.
- **Diagnóstico:** há quatro regiões de portas, mas apenas três encontros declarados; ampliar deve criar funções distintas para ramais, não repetição de escadas. Os quatro itens visuais de portas aparecem duplicados nos dados autorais nas mesmas posições, sem conteúdo jogável adicional. O elevador e as ativações precisam continuar compatíveis com atributos básicos e salvamento de flags.

### Fase 4 — Roteador

- **Fonte e regiões:** `src/maps/04-router.js`; LAN inferior, trânsito, WAN e rota superior/reserva. Entrada `(150,1272)`; saída `(1950,436,90,64)`.
- **Plataformas e combate:** 20 fixas, dois obstáculos; `fast`, `flyer`, `armored`.
- **Objetivos:** tabelas LAN `c01`, trânsito `c02`, WAN `c03`; três inimigos e pergunta. Minigame `route`. Cinco interfaces declaradas, duas disponíveis inicialmente.
- **Checkpoints:** `(1740,1320)`, `(600,950)`, `(1830,500)`.
- **Diagnóstico:** o labirinto usa poucos troncos largos e interfaces que encurtam o trajeto. A V3 precisa ter decisões e caminhos de encaminhamento reconhecíveis, evitando só ampliar corredores ou impor retornos longos pelo mesmo trecho. Portais não podem contornar dependências obrigatórias nem entregar o jogador dentro de novas paredes.

### Fase 5 — Wi-Fi

- **Fonte e regiões:** `src/maps/05-wifi.js`; associação, AP A, repetidor, AP B e uplink, com antena auxiliar. Entrada `(160,2192)`; saída `(740,286,90,64)`.
- **Plataformas e combate:** 21 fixas, três móveis, cinco temporárias; `shooter`, `flyer`, `basic`. Quatro zonas ambientais de sinal/interferência.
- **Objetivos:** `c01` AP A, `c02` repetidor, `c03` AP B; três inimigos e pergunta. Minigame `wifi`.
- **Checkpoints:** `(1040,1880)`, `(240,1520)`, `(1160,1160)`, `(720,620)`.
- **Diagnóstico:** a subida combina plataformas temporárias e velocidade reduzida; uma escala geométrica simples produziria saltos impossíveis. Quedas entre andares maiores podem custar muito tempo. Os cinco itens visuais principais de antenas também estão duplicados nos dados autorais. São necessários apoios permanentes de recuperação e ramais com recompensa real, sem exigir propulsor.

### Fase 6 — Cabeamento

- **Fonte e regiões:** `src/maps/06-cabling.js`; subsolo, shafts oeste/leste, manutenção, elevadores e cobertura. Entrada `(200,2752)`; saída `(1280,336,90,64)`. Há uma sala visual de manutenção adicional na receita.
- **Plataformas e combate:** 41 fixas + três móveis; cinco obstáculos; `basic`, `fast`, `parasite`, `shooter`.
- **Objetivos:** quadro do shaft A `c01`, patch panel B `c02`, distribuidor do topo `c03`; quatro inimigos e pergunta. Minigame `cabling`.
- **Checkpoints:** `(260,2200)`, `(1190,1600)`, `(260,1000)`, `(1200,400)`.
- **Diagnóstico:** quatro intervalos de aproximadamente 600 px verticais dominam a recuperação, enquanto os encontros obrigatórios são poucos para o edifício. O desenho repete a alternância de shafts e já contém correções de travessia de retorno; recriar pontes contínuas pode reintroduzir bloqueios. Uma expansão precisa criar andares com funções distintas e evitar que falhas de elevador/retorno obriguem a refazer grande parte da subida. Revisão efetiva já é 4.

### Fase 7 — DHCP

- **Fonte e regiões:** `src/maps/07-dhcp.js`; distribuidor central, reservas `10.0.10`, diagnóstico APIPA, relay `10.0.20` e gateway `10.0.30`. Entrada `(1370,952)`; saída `(2490,696,90,64)`.
- **Plataformas e combate:** 16 fixas + cinco móveis; um obstáculo e um gate; `fast`, `armored`, `flyer`, `basic`. Oito conexões declaradas e uma zona de conflito IP.
- **Objetivos:** serviço DHCP `c01`, pool em conflito `c02`, relay `c03`; flags **`dhcp-on` e `reservation`** do objetivo `ip-services`; quatro inimigos e pergunta. Minigame `dhcp`.
- **Checkpoints:** `(1430,1000)`, `(300,650)`, `(2270,1450)`, `(2330,760)`.
- **Diagnóstico:** a faixa útil inicial é pequena em relação ao retângulo do mundo, e a exploração depende bastante de gateways e concessões. Expansão deve aprofundar cada sub-rede e sua função, não aumentar o vazio entre hubs. Preservar destinos/retornos seguros e não criar ciclo em que um serviço necessário só seja alcançável após reparar a si próprio.

### Fase 8 — DNS

- **Fonte e regiões:** `src/maps/08-dns.js`; raiz, `.com`, `mail.com`, `.org`, `api.org`, resolvedor recursivo, cache TTL e NXDOMAIN. Entrada `(1600,352)`; saída próxima da raiz `(1940,336,90,64)`.
- **Plataformas e combate:** 36 fixas, seis obstáculos; `shooter`, `fast`, `basic`, `parasite`, `armored`.
- **Objetivos:** MX/.com `c01`, A/.org `c02`, cache recursivo `c03`; cinco inimigos e pergunta. Minigame `dns`. Dezesseis links declarados, onze disponíveis no início, incluindo o atalho TTL adicional.
- **Checkpoints:** `(1580,400)`, `(400,1200)`, `(2900,1200)`, `(1510,1550)`.
- **Diagnóstico:** muitos destinos e retorno final próximo da entrada tornam orientação e entendimento dos desbloqueios essenciais. A área NXDOMAIN precisa justificar o desvio; ampliar becos sem recompensa só aumenta punição. O atalho TTL deve reduzir retorno depois da descoberta, sem pular tarefas obrigatórias. Evitar portais de chegada que ativem outra conexão imediatamente.

### Fase 9 — Firewall

- **Fonte e regiões:** `src/maps/09-firewall.js`; perímetro, duto de infiltração, bastiões, anel interno e cidadela. Entrada `(120,1512)`; saída `(2460,476,90,64)`.
- **Plataformas e combate:** 19 fixas, uma móvel, uma temporária; quatro obstáculos e quatro gates; `fast`, `shooter`, dois `armored`, um `flyer`. Duas câmeras de vigilância.
- **Objetivos:** quatro políticas/regras `c01`–`c04`, flag **`rules-on`** de `security-policy`, cinco inimigos e pergunta. Minigame `firewall`.
- **Checkpoints:** `(1450,1560)`, `(3200,1560)`, `(2300,1140)`, `(1050,1140)`, `(2200,540)`.
- **Diagnóstico:** a dependência entre camadas, câmeras e gates pode virar um percurso de retorno excessivo em uma fortaleza maior. Acumular lasers, blindados e tiros sem áreas de espera comprometeria a leitura. Separar entradas, preparação e fuga; conferir o retorno após todos os estados de reparo e não somente a ida com tudo aberto.

### Fase 10 — Servidores e VIRUS ZERO

- **Fonte e regiões:** `src/maps/10-servers.js`; torres A/B, fibra óptica, backbone, airlock e núcleo elevado. Entrada `(200,1592)`; saída `(6480,836,90,64)`.
- **Plataformas e combate:** 46 fixas, três móveis, uma temporária; quatro obstáculos e um gate. `basic`, dois `shooter`, `flyer`, `parasite`, `fast`, `armored`, `boss`.
- **Objetivos:** relays `c01`–`c04`, oito inimigos incluindo `e08`, pergunta final e conclusão `boss-question`. Minigame `servers`. O reparo de todos os componentes mantém a regra atual do escudo.
- **Checkpoints:** `(640,1190)`, `(1850,1050)`, `(2910,1640)`, `(4450,1170)`, `(5000,900)`.
- **Diagnóstico:** já é o maior retângulo da campanha, mas a faixa candidata de navegação reparada ocupa cerca de 17% dele. Aumentar só suas dimensões ampliaria espaços vazios. A arena atual e seus padrões foram ajustados a coordenadas específicas. `src/generation/campaign.js` proíbe conteúdo gerado a partir de **x = 4800** e declara uma área manual até x = 6800; deixar esses números intactos bloquearia uma ampliação real. A V3 deve reconstruir o percurso macro e redesenhar espacialmente a arena, preservando o comportamento do chefe e atualizando juntos exclusão, limites, ativação, relays, checkpoint e saída.

## 5. Riscos e decisões de preparação

| Prioridade | Risco observado | Decisão / tratamento necessário na reconstrução futura |
| --- | --- | --- |
| Crítica | Save por índices e coordenadas; revisões efetivas 3/4 já publicadas | Usar revisão efetiva 5+ nas novas plantas; validar migração mantendo progressão global e resetando estado espacial incompatível |
| Crítica | Mudar só os blueprints não muda a revisão efetiva nem todas as plataformas | Alterar de forma coordenada a autoria e as receitas em `src/generation/campaign.js`; conferir sempre o mapa compilado |
| Crítica | Dependências de reparos/portais/gates podem formar ciclo ou deixar objetivo obrigatório inacessível | Grafo de pré-requisitos com caminho inicial sem habilidades; testar estados anteriores/intermediários/posteriores e o retorno |
| Crítica | Escudo do chefe depende de todos os componentes; `countsForObjective` é imposto aos inimigos declarados | Não tratar novos componentes/inimigos como opcionais só por um campo no JSON; planejar os objetivos explicitamente antes de inserir conteúdo |
| Alta | Arena, limites, ativação e exclusão do gerador têm coordenadas fixas | Parametrizar/atualizar os dados da arena conjuntamente na futura etapa, sem alterar os padrões de combate silenciosamente |
| Alta | Alterações diretas podem ser sobrescritas por `build_first_five.py`/`build_last_five.py` | Escolher uma fonte autoral reproduzível e atualizar ferramenta e saída juntas; não executar os builders nesta preparação |
| Alta | Mais entidades aumentam custo de `solids()`, colisões, HUD/minimapa e IA; expansão de piso/conexões da IA pode ter custo quadrático | Orçar por setor, usar regiões de ativação e medir cena cheia; otimização de engine só se necessária e testada separadamente |
| Alta | Mais inimigos/reparos elevam XP e frequência de escolhas/pausas | Orçamento de progressão por fase, variação e espaçamento de desafios; preservar os coeficientes globais por padrão |
| Alta | Repetir uma fase muito maior após pergunta errada pode ser frustrante | Manter a regra existente nesta iniciativa até decisão explícita em contrário; avaliar o percurso completo e a sinalização final |
| Alta | Checkpoints herdados podem aparecer sobre vazio/perigo ou sem espaço para +38 px de respawn | Validar estabilidade antes dos reparos, suporte permanente, envoltória do corpo e perigos em ciclos distintos |
| Alta | Guardas atuais congelam hashes/coordenadas/revisões das plantas antigas | Criar fixtures novas versionadas e adaptar testes de conteúdo de forma controlada; não desligar testes nem regravar todo baseline para esconder falhas |
| Média | README cita 47 atlas/37 inimigos e descrições históricas; código atual tem 77 atlas registrados/41 inimigos declarados | Usar esta referência medida; atualizar documentação de produto somente quando as novas plantas forem entregues |
| Média | Alguns itens decorativos estão duplicados e o minimapa pode perder legibilidade em mundos maiores | Deduplicar dados na nova autoria e avaliar escala/orientação do mapa; arte de fundo não pode sugerir piso colidível |
| Média | A linguagem V3 pode ser confundida com os seeds e revisões 3 já existentes | Separar nome da iniciativa, seed/receita e revisão efetiva; registrar todas as três |

### Diretrizes aceitas para a próxima etapa — ainda não implementadas

1. Reconstruir plantas, rotas, distribuição e conteúdo, preservando os dez temas e IDs. Não esticar coordenadas do desenho atual nem repetir o mesmo mapa com outra paleta.
2. Preservar os formatos reconhecíveis: placa horizontal, hub de software, switch ramificado, roteador em labirinto, Wi-Fi/cabeamento verticais, hub DHCP, labirinto DNS, fortaleza e data center com arena.
3. Planejar primeiro grafo macro, objetivos/pré-requisitos, percurso crítico, retornos/atalhos e recuperação; depois encaixar os saltos reais e os encontros. Evitar depender de plataforma temporária como único apoio de recuperação.
4. Como **meta preliminar de projeto**, buscar percurso crítico substancialmente maior (referência inicial: cerca de 3×) e pelo menos 2,5× a faixa útil candidata de navegação, acompanhados por setores funcionais e variedade. Esses fatores não são dimensões finais nem duração prometida; precisam de protótipo e medição. Nenhum tamanho novo foi escolhido nesta etapa.
5. Definir orçamento de conteúdo e XP por setor antes de multiplicar inimigos e minigames. Contar decisões, desafios, recompensas e caminhos úteis, não apenas plataformas ou metros de ar.
6. Separar obrigatório e opcional com requisitos explícitos e funções suportadas pelo runtime. Segredos devem recompensar exploração e permitir retorno; habilidades opcionais podem facilitar, nunca bloquear a campanha básica.
7. Preservar o sistema visual e de parallax existente, associando a nova arquitetura/regiões aos seus dados. Os quatro marcos ambientais atuais não equivalem automaticamente a todos os setores de um mapa maior.
8. Reconstruir **uma fase por vez**, na ordem 1 a 10, com validação de geometria, ida/retorno, objetivos, checkpoint, morte, save, pergunta e combate antes de seguir. Definir então novas metas quantitativas por fase e registrar aqui a aprovação de cada marco.

## 6. Preparação técnica criada nesta etapa

- [tools/analyze_rebuild_maps_v3.py](tools/analyze_rebuild_maps_v3.py): coletor de baseline. Faz uma cópia temporária do projeto, executa os verificadores e a suíte existente, coleta as dez definições compiladas pelo navegador e calcula as áreas. Não chama os builders de mapas.
- [tests/rebuild-v3-baseline/inventory.json](tests/rebuild-v3-baseline/inventory.json): definições compiladas, receitas/blueprints de referência, atores reais, reparos, contagens autorais, condições, conexões, superfícies e estimativas de área.
- [tests/rebuild-v3-baseline/regression-results.json](tests/rebuild-v3-baseline/regression-results.json): resultado da regressão executada nesta preparação, separado dos relatórios anteriores.
- [tests/rebuild-v3-baseline/execution.json](tests/rebuild-v3-baseline/execution.json): comandos, retornos, saídas e SHA-256 dos 621 arquivos previamente rastreados; registra a preservação desses arquivos e a remoção da cópia temporária.
- `tests/rebuild-v3-baseline/captures/phase-NN-overview.png`: dez panoramas da execução isolada. Exemplos inspecionados: [Cabeamento](tests/rebuild-v3-baseline/captures/phase-06-overview.png) e [Servidores](tests/rebuild-v3-baseline/captures/phase-10-overview.png).

O coletor se recusa a sobrescrever um diretório de baseline existente. `--inventory-only` reutiliza somente a regressão já concluída e exige o mesmo HEAD e os mesmos hashes dos arquivos rastreados. Não substitui uma nova regressão quando o projeto mudar. Os testes usam perfil de Chrome temporário e não acessam o salvamento pessoal do jogador.

## 7. Testes realmente executados agora

Todos os comandos de jogo foram executados **na cópia temporária**, com o código do commit de referência. O fingerprint dos arquivos de produção no relatório é `ddf1cacc2559935f83f9194b2f29951effe78bca08ec7a1b268b511dd0b246da`.

| Comando / verificação | Resultado observado |
| --- | --- |
| `python tools/check_maps.py` | Dez módulos e manifesto válidos |
| `python tools/check_parallax.py` | Mapas/campanha e sistemas protegidos; mudanças históricas de apresentação reconhecidas |
| `python tools/check_environment.py` | Campanha, física, chefe e reparos preservados |
| `python tools/check_generation.py` | Infraestrutura e ordem de scripts válidas |
| `python tools/check_hardware_depth.py` | Atlas, silhuetas, recortes e manifestos concordantes |
| `python tests/run_review.py` | **209/209** verificações, dez fases, 92 capturas, zero erros de runtime e nenhuma falha |
| Coleta/validação compilada em Chrome | **10/10** mapas validados e exportados; estados inicial e reparado coletados |
| SHA-256 antes/depois | **621/621 arquivos existentes idênticos**, incluindo fontes, mapas e relatórios previamente rastreados |

A primeira coleta auxiliar usou um nome incorreto para a constante das perguntas; a segunda esbarrou na saída CP1252 do Windows ao imprimir rótulos com setas. O coletor foi corrigido para o nome real `QUESTION_BANK` e para execução UTF-8. As tentativas e os retornos ficam em `execution.json`; a regressão do jogo já havia passado e não foi alterada para resolver esses erros do coletor.

**Cobertura/limitações:** a suíte usa movimento real em trechos amostrados, mas pode reposicionar o jogador entre arestas comprovadas e usa proteção contra dano em testes de combate. Não é uma partida humana contínua nem avaliação de duração, dificuldade, fadiga ou sobrevivência. A estimativa de área não mede todos os ciclos temporais. Não foi feita nova medição de FPS, teste físico mobile, áudio por escuta ou teste de outros navegadores nesta preparação. O relatório anterior de parallax registra limitações de desempenho em alta densidade; isso é histórico a revalidar nas futuras plantas, não um novo benchmark desta etapa.

## 8. Progresso e ponto de parada

- [x] Checkout/remoto/HEAD e estado limpo inicial verificados.
- [x] Branch `rebuild-maps-v3` criada; histórico dos mapas antigos preservado.
- [x] Sistemas, geração, contratos de saves e riscos analisados.
- [x] Dez plantas autorais e compiladas inventariadas, com áreas estimadas e diagnóstico individual.
- [x] Baseline de testes isolado e artefatos de referência preservados.
- [x] Decisões e critérios para a reconstrução registrados.
- [ ] Reconstrução de geometria e conteúdo das fases 1–10 — **não iniciada**.
- [ ] Alteração de revisões/receitas/arena e migração de saves — **não implementada**.
- [ ] Playtests e benchmarks dos mapas maiores — **não executados, pois os mapas novos ainda não existem**.

**PARE AQUI:** etapa de análise e preparação encerrada. Os únicos novos arquivos são este documento, o coletor e seus artefatos de referência. As alterações de preparação ficam na branch separada, sem commit automático, push ou merge.

## 9. Etapa seguinte — arquitetura preparada (2026-11-06)

Esta seção sucede o ponto de parada anterior, mantido como histórico. **Nenhuma fase foi substituída.** Continuamos em `rebuild-maps-v3`, preservando os arquivos locais da etapa anterior, sem commit automático, push ou merge.

### 9.1 Metas atualizadas e área útil

A referência agora é **3–5 vezes a área explorável útil** e **15–25 minutos por fase**. Substitui a proposta preliminar de 2,5 vezes a banda de navegação / três vezes o caminho crítico. Não existe medição de duração dos mapas novos: `measuredMinutes` permanece `null`.

A tabela usa a banda candidata do baseline com componentes reparados, em milhões de px². É um orçamento geométrico inicial, **não área comprovadamente alcançável**. Inclui superfícies dinâmicas congeladas; a comparação futura deve repetir os mesmos estados e método do coletor original. O novo auditor informa separadamente a banda estática restrita às superfícies alcançadas por simulação; não misturar as métricas para anunciar multiplicadores.

| Fase | Dimensão original compilada | Banda candidata original (Mpx²) | Orçamento 3–5× (Mpx², arredondado) | Andares planejados |
| --- | --- | ---: | ---: | ---: |
| Hardware | 2800×1000 | 0,874 | 2,622–4,371 | 4 |
| Software | 1900×1400 | 0,753 | 2,259–3,764 | 5 |
| Switch | 2200×1200 | 0,903 | 2,708–4,513 | 4 |
| Roteador | 2200×1500 | 1,204 | 3,612–6,020 | 5 |
| Wi-Fi | 1550×2400 | 1,001 | 3,003–5,004 | 7 |
| Cabeamento | 1600×3000 | 1,973 | 5,919–9,865 | 8 |
| DHCP | 2800×1700 | 0,949 | 2,846–4,743 | 5 |
| DNS | 3400×2100 | 2,001 | 6,002–10,003 | 6 |
| Firewall | 3600×1800 | 1,577 | 4,730–7,883 | 6 |
| Servidores | 6800×2000 | 2,316 | 6,948–11,580 | 6 |

Não há novas dimensões externas fixadas: serão consequência de salas úteis conectadas. Espaço vazio não entra na união de bandas; sobreposições contam uma vez e sólidos são subtraídos. Mesmo partindo de superfícies alcançadas, a banda é uma estimativa geométrica, não a união exata das trajetórias. A aceitação exigirá objetivos alcançáveis, caminhos efetivos, variedade e percurso humano medido, sem esticar deslocamentos apenas para atingir minutos.

### 9.2 Dez plantas conceituais

O catálogo e os dez grafos ficam em `ByteRunner.mapRebuildV3.catalog` e `.blueprints`. Os grafos são `planningOnly`: **não possuem implantação geométrica de campanha**. Cada região prevê checkpoint, exploração, combate, reparo, parkour, junção, segredo e área opcional: 32 salas em quatro regiões, 40 em cinco. Há rota principal, alternativas locais, conexões regionais e atalhos após reparos. Salas críticas serão manuais; exploração, segredos e anexos recebem geração determinística subordinada aos sockets planejados.

As funções das salas compartilham um esqueleto; as conexões regionais e as intenções de silhueta diferem. Silhuetas, andares e identidade das geometrias ainda precisam ser concretizados em cada fase — não estão declarados concluídos por existir um grafo.

| Fase | Silhueta / regiões previstas | Distribuição de conteúdo e rotas |
| --- | --- | --- |
| Hardware | Espinha com quatro braços escalonados; CPU, RAM, GPU, barramentos | Núcleo ligado também à GPU e barramentos; reparos nos alojamentos, caches secretos e parkour entre soquetes. |
| Software | Janelas encaixadas em torno de vazio central; desktop, processos, arquivos, scheduler | Ligações diagonais entre janelas; serviços manuais, diretórios opcionais e retorno pelo núcleo. |
| Switch | Backplane e galerias paralelas; backplane, portas A/B, uplink | Travessias entre galerias, conectores manuais, anexos de diagnóstico e atalhos pelo painel. |
| Roteador | Duas malhas e anéis de trânsito; LAN, trânsito, WAN, redundância | Conexão longa LAN/reserva, bifurcações nas interfaces, combate nos hubs e reparos de encaminhamento. |
| Wi-Fi | Arquipélago vertical e duas torres assimétricas; associação, antenas, repetidores, uplink | Ligação antenas/uplink, patamares seguros antes das subidas e estruturas opcionais entre torres. |
| Cabeamento | Três shafts com travessias alternadas; subsolo, dutos, manutenção, cobertura | Conexões cruzadas, elevadores de manutenção, salas de patch e anexos industriais. |
| DHCP | Distribuidor e bairros em terraços; distribuidor, reservas, APIPA, relay | Retornos radiais ao hub, diagnóstico e parkour nas fronteiras de sub-redes. |
| DNS | Árvore com retorno recursivo lateral; raiz, domínios, subdomínios, cache | Ramificações da raiz, ligação domínios/cache, resolução manual e registros opcionais. |
| Firewall | Muralhas concêntricas abertas; perímetro, bastiões, anel interno, cidadela | Infiltração perímetro/anel, portas de política, guaritas de combate e manutenção segura. |
| Servidores | Racks bifurcados e backbone até arena isolada; racks, fibra, backbone, airlock, VIRUS ZERO | Laterais racks/backbone e fibra/airlock; arena e aproximação totalmente manuais, sem geração sobre o chefe. |

Em todas: separar descanso/reparo da pressão de combate, sinalizar aterrissagens e objetivos e oferecer exploração horizontal/vertical com apoio permanente. Segredos não guardarão chaves obrigatórias; boost não será obrigatório. O motor atual conta todos os componentes/inimigos: áreas opcionais devem usar recompensas/colecionáveis até uma mudança deliberada desse contrato. Não presumir que um campo `optional` já exclui reparos ou inimigos das exigências.

### 9.3 Implementação e contrato

Novo módulo: `src/generation/rebuild-v3.js`, carregado depois dos geradores existentes. Não registra salas, geradores, mapas ou campanhas ao carregar. Somente os testes registram as salas de laboratório; nada é inserido em `PHASES`.

Fluxo de autoria:

1. Partir do catálogo e desenhar manualmente a implantação das salas, sockets e andares. Os grafos conceituais não são receitas executáveis.
2. Registrar templates e geradores pelas APIs existentes `mapGeneration.registerRoom/registerGenerator`. Usar `random.fork(roomId)`, sem `Math.random` ou estado global.
3. Criar receita schema-v2 e contrato com `seed`, `start`, `exit`, `rooms`, `links`, `repairs`, `objectives`. Salas têm id, x/y, width/height e source manual/procedural. Links têm from/to, oneWay opcional e requires com IDs de reparos. Reparos têm id, room e requires. Objetivos têm id, room, required e requires.
4. `validateContract` rejeita sobreposição, IDs/pré-requisitos desconhecidos, desconexão, ciclos, reparos atrás da própria porta e objetivos bloqueados. Expande progressivamente salas e reparos disponíveis, respeitando direção dos links e alternativas. Dependências nesta API são monotônicas: listas AND de reparos; não interpreta flags/negações como chaves implícitas.
5. `compile(plan, contract, certificate)` produz um **candidato**, sem registrar. Confere seed, revisão efetiva inteira ≥5, posições/fontes/dimensões, pares de conexões, endpoints e reparos compilados. O compositor existente confere sockets alinhados/opostos, limites e integridade schema-v2.
6. `await prepare(plan, contract, certificate)` só retorna `{phase, proof}` congelado depois da auditoria física. Isso não libera automaticamente uma fase: antes da adoção conferir condições do contrato contra portas/objetivos reais e testar temporização, combate, save e percurso humano.

Certificado: `{jumps:[{from,to}], landings:[{surface,view:{x,y,width,height}}]}`, com IDs compilados de superfícies permanentes. Arestas declaradas recebem fórmula com margem e simulação de colisões; cada alvo declarado precisa de enquadramento informado. Não prova automaticamente enquadramento de todas as arestas/resoluções. Porta fechada interceptando aresta declarada causa rejeição conservadora; certificar trechos dos dois lados e usar auditoria progressiva para a passagem desbloqueada.

`audit` parte sempre do spawn, com física básica, sem habilidades ou teletransporte. Recalcula acesso após reparos, refletindo plataformas condicionais, obstáculos removidos e portas abertas. Confere saída, reparos, checkpoints, proximidade dos inimigos e objetivos de região/coleção/condição. Acesso a inimigo não prova combate vencível. Condições não suportadas geram erro explícito. Plataformas móveis/temporárias/caindo e portais não provam a rota obrigatória nesta auditoria; dependências temporais exigirão testes específicos.

### 9.4 Física, desafios e respawn

Fonte preservada: `platformPhysics.base`, corpo 34×48, velocidade 255 px/s, gravidade 1850 px/s², impulso 690 px/s. Salto básico: **128,6757 px de altura**, **0,745946 s de voo**, **190,2162 px de deslocamento nivelado**. Não equivale a um vão seguro: alcance usa intervalos da borda esquerda do corpo, margens de 6 px e fator 0,82; desnível altera o voo. A simulação detecta tetos e paredes ausentes da parábola livre.

| Desafio | Recurso existente e proteção |
| --- | --- |
| Móvel/elevador | `type:moving`, motion axis x/y; envelope dentro do mapa e livre de paredes/portas, velocidade conservadora máxima de 60% da velocidade básica. |
| Temporária com retorno | `type:temporary`, duration > voo básico +0,4 s e respawnDelay positivo. |
| Armadilha que cai/retorna | `type:falling`, duration ≥0,6 s, respawnDelay/dropDistance positivos; controlador existente. |
| Laser/eletricidade | `parkour-hazards` existente, aviso e intervalos seguros validados pelo contrato de sala; nunca cobrir respawn. |
| Porta por reparo | `gate.opensWhen.component` / `requiresComponentId`, contrato lógico e simulações progressivas. |
| Evento ambiental | `environment.zones` e condições existentes. Não foi criado um executor arbitrário de eventos; eventos complexos exigirão implementação específica. |

Spawn/checkpoints precisam de suporte permanente, independente de reparos, e espaço para o corpo. Verifica ativação e o deslocamento real de **+38 px** do respawn, paredes, portas e caixas de perigo. Suporte móvel não certifica checkpoint; hazards são considerados mesmo quando desligados naquele instante.

### 9.5 Arte e mapas grandes

Catálogo vinculado aos tilesets, decoração, fundos e paletas exclusivos existentes (`tiles-01..10`, `decor-01..10`, `sky-01..10`). `pixelScale:2`, parallax multicamadas e transição regional proposta de 512 px são metadados de autoria, sem substituir o renderer ou impor nova resolução a todos os atlas. Novas salas deverão receber regiões e estruturas coerentes com a posição horizontal/vertical e preservar a legibilidade de R-07.

Caches, nearest-neighbor, culling e limites de memória existentes foram preservados. A API expõe o índice espacial compartilhado `mapAudit.spatialIndex` para consultas locais, a reconstruir apenas quando a geometria mudar. Não substituiu o renderer nem representa um ganho de FPS medido. A união de bandas usa varredura offline, fora do loop de desenho/atualização.

### 9.6 Arquivos e resultados desta etapa

- `src/generation/rebuild-v3.js`: catálogo, dez grafos, capacidades, contratos, compilação opt-in, auditoria progressiva e estimador de bandas.
- `index.html`: uma inclusão de script, sem alteração da seleção de campanha.
- `tests/rebuild-v3-architecture.js`: laboratório híbrido de 768×384 e casos positivos/negativos.
- `tools/test_rebuild_maps_v3.py`: executa em cópia temporária com Chrome e armazenamento isolados; preserva relatórios antigos e hashes de `game.js` e módulos de mapas.
- `tests/rebuild-v3-architecture/`: resultados de arquitetura, regressão e execução. As 92 capturas da regressão são geradas na cópia descartável; somente JSONs retornam. Seus caminhos no relatório descrevem aquela execução, não novos PNGs persistidos aqui.
- Este documento; baseline/coletor anteriores mantidos.

Testes executados após as últimas alterações:

| Comando/verificação | Resultado |
| --- | --- |
| `python -X utf8 tools/test_rebuild_maps_v3.py` | Verificadores e duas execuções de Chrome concluídos na cópia isolada |
| `tools/check_maps.py` | PASS |
| `tools/check_generation.py` | PASS |
| `tools/check_parallax.py` | PASS |
| `tools/check_environment.py` | PASS |
| Laboratório via `tests/run_review.py --identity-phase 1 --result-label rebuild-v3-architecture` | **27/27**, zero erros de runtime; resultados individuais em `architecture-results.json` |
| `tests/run_review.py` | **209/209**, dez fases, 92 capturas, zero erros de runtime e nenhuma falha |
| SHA-256 de `game.js` e 11 módulos `src/maps` antes/depois | **12/12 idênticos**; `campaignUnchanged:true` em `execution.json` |

O laboratório mediu 143.366,92 px² de banda estática candidata e alcançada, sem diferença entre elas nesse exemplo simples. Isso verifica o funcionamento do instrumento; não representa o tamanho de nenhuma fase nova. Há testes específicos para não contar crescimento vazio ou duplicar bandas sobrepostas. `git diff --check` também foi executado sem erros.

A primeira execução do laboratório revelou um erro no caso de teste: o envelope do elevador ainda cabia no mapa. O teste foi corrigido para ultrapassar o limite; não se enfraqueceu o validador. O sandbox inicialmente bloqueou a cópia temporária; a execução autorizada fora dele concluiu. Um comando auxiliar de redação falhou por quoting antes de escrever; o documento foi aplicado por patch.

**Limitações:** não há dez mapas reconstruídos, medição de 15–25 minutos, comprovação de 3–5× de área útil, benchmark de mapas grandes ou arte nova produzida nesta etapa. A auditoria é estática/conservadora e amostra lançamentos discretos: pode rejeitar caminhos jogáveis. Condições de flags, portais, ciclos temporais e combate exigem provas adicionais. A regressão existente usa proteção contra dano e reposicionamento entre arestas em partes dos testes; não é uma partida humana contínua. Os riscos anteriores de save por posição de arrays, objetivos globais e arena hardcoded continuam relevantes.

**Ponto de parada:** arquitetura e laboratório preparados; campanha atual preservada. A próxima etapa será implantar e testar somente a primeira fase nova, com geometria manual, medição comparável de área, validação física/temporal e playtests. Não iniciada aqui.

## 10. Fase 1 — Hardware reconstruída no jogo

Esta seção sucede o ponto de parada da arquitetura. **Somente a fase 1 foi reconstruída.** Os nove módulos seguintes e o manifesto de campanha permanecem idênticos. Branch `rebuild-maps-v3`, sem commit automático, push ou merge. Os arquivos locais das duas etapas anteriores foram mantidos.

### 10.1 Substituição real e dimensões

`src/maps/01-hardware.js` agora monta e registra uma rede nova de salas, usando o compositor existente diretamente. Não passa pelo antigo adaptador `campaignGeneration.build`, que empacotava o mundo horizontal em uma única macro-sala e acrescentava uma pequena rota. A receita nova preserva `phase-01`, tema `hardware`, schema 2 e a integração com a campanha, com **revisão efetiva 5**.

| Medida | Fase anterior compilada | Hardware nova |
| --- | ---: | ---: |
| Dimensões | 2800×1000 | **4480×2560** |
| Retângulo externo | 2.800.000 px² | 11.468.800 px² — não é área útil |
| Formato | Horizontal, uma macro-sala | Malha em dois eixos, torres e ramificações |
| Salas do compositor | 1 | **22**, sendo 18 manuais e 4 cofres procedurais |
| Regiões | 4 marcos ambientais | **6 setores espaciais** |
| Conexões físicas entre salas | Não modeladas como rede de salas | **30 bidirecionais**, nove ciclos independentes |
| Segmentos de piso | 3 | **41** |
| Plataformas | 20 | **111**: 105 fixas, 4 móveis, 2 temporárias |
| Inimigos declarados | 3 | **13**, com perfis basic, fast, armored e shooter |
| Reparos obrigatórios | 3 | **4**, todos com minigame real de circuitos |
| Colecionáveis declarados | 5 | **26**, incluindo oito em quatro cofres opcionais |
| Checkpoints | 3 | **8**, com retorno livre a checkpoints anteriores |

Entrada `(64,1952)` na placa-mãe central. Saída integrada ao estrado do núcleo em `(4360,688)`, com região 80×64, após uma sequência de subida. A posição anterior da saída não foi reaproveitada. Os mapas antigos permanecem no histórico do Git e no baseline preservado.

### 10.2 Medição de área, sem contar vazio como expansão

Coleta no Chrome, usando o mesmo cálculo de união de bandas de navegação do baseline: corpo em pé + altura de salto básico acima das superfícies, recorte ao mundo, subtração dos sólidos e contagem única das sobreposições.

| Estado / método | Anterior (px²) | Nova (px²) | Razão |
| --- | ---: | ---: | ---: |
| Banda candidata, estado inicial congelado | 782.679,41 | 4.281.775,14 | 5,47× |
| Banda candidata, todos os componentes reparados, sem forçar flags | 874.140,81 | **4.356.826,38** | **4,98×** |
| Banda estática de superfícies alcançadas por simulação progressiva, mesma física básica nos dois mapas | 874.140,81 | **3.726.025,51** | **4,26×** |

O último método foi executado novamente também sobre a definição anterior preservada: não compara uma prova nova contra um retângulo antigo. A auditoria anterior concluiu sem erros. A versão nova alcançou 146 superfícies estáticas; os cinco topos externos dos tetos ficaram fora do percurso e não entram na banda alcançada. Plataformas móveis/temporárias e portais não foram necessários nessa prova conservadora.

**A meta de expansão é atendida pelas estimativas de bandas comparáveis, não por uma medição exata de toda a área fisicamente percorrível.** O retângulo externo cresceu 4,096×, mas não foi usado como evidência de área útil. A banda candidata inicial cresceu mais que 5×; isso está explicitado em vez de selecionar apenas o número mais favorável.

**Duração:** a referência continua 15–25 minutos. Não foi realizada uma partida humana contínua cronometrada; `durationMinutes` permanece `null`. Os testes automatizados reposicionam R-07 entre trechos e protegem contra dano em combate, portanto seu tempo de execução não mede duração, dificuldade ou sobrevivência. Não declarar a meta de minutos alcançada.

### 10.3 Regiões e caminhos

```mermaid
graph LR
  P[Placa-mãe central] <--> C[Complexo da CPU]
  P <--> B[Barramentos]
  C <--> R[Torres de RAM]
  C <--> B
  R <--> B
  B <--> G[Complexo da GPU]
  G <--> N[Núcleo final]
  P --- S1[Cache L1 opcional]
  R --- S2[Arquivo RAM opcional]
  B --- S3[Cache de barramento opcional]
  G --- S4[Cache GPU opcional]
```

O diagrama resume setores, não cada uma das 30 passagens. Os reparos acrescentam quatro retornos à entrada; os caminhos físicos continuam bidirecionais e não dependem desses atalhos.

| Setor | Salas | Conteúdo e função |
| --- | --- | --- |
| Placa-mãe central | `arrival`, `junction`, `l1-vault` | Galeria inicial de duas salas, saídas superiores/laterais, circuitos de piso e um cofre inferior. A entrada oferece acesso tanto à CPU quanto ao circuito dos barramentos. |
| CPU | `thermal`, `socket`, `heatsink` | Processadores sobre bases grandes, contatos dourados, ventoinhas, impulso térmico discreto, perigo térmico sinalizado, plataforma móvel, arena e reparo de refrigeração. |
| RAM | `ram-base`, `ram-west`, `ram-east`, `ram-return` | Torres em dois níveis, módulos altos e contatos, degraus de 112 px, elevador auxiliar, ramificação secreta e retorno aos barramentos. |
| Barramentos | `bus-north`, `bus-cross`, `bus-west`, `bus-east`, `bus-cache`, `bus-return` | Túneis/galerias em três níveis, rotas superior/inferior, arena, eletricidade, plataforma temporária opcional e ponte energizada pelo reparo da malha. |
| GPU | `gpu-west`, `gpu-east`, `gpu-under`, `gpu-cache` | Placas largas e ventiladores, duas posições de combate na arena, degraus de 96 px, elevador, plataforma temporária, cofre e reparo principal de alimentação. |
| Núcleo | `core-test`, `core-exit` | Perigo final com aviso, apoio móvel auxiliar, checkpoint e sequência de subida obrigatória até o estrado da saída. Pergunta educativa preservada. |

Os cofres não guardam chaves ou reparos obrigatórios. Recompensas opcionais não entram nas condições de saída. A visita às arenas é necessária porque os treze inimigos continuam sujeitos ao contrato de eliminar todos os vírus, sem inventar um campo de inimigo opcional que o motor não respeitaria.

### 10.4 Mecânicas, segurança e geração

- Física, salto, habilidades, IA, combate, perguntas e motor de reparos preservados; `game.js` não foi alterado.
- Quatro minigames: refrigeração da CPU, banco de RAM, malha de barramentos e alimentação principal da GPU. Cada reparo materializa uma ponte de observação e libera um retorno à placa-mãe. O reparo da CPU também desliga o vento térmico. Os perigos temporizados mantêm seus ciclos; não se presume que todos sejam desligados por esse reparo.
- Nenhum reparo exige outro reparo para ser alcançado. Todas as salas e objetivos são acessíveis com plataformas permanentes e salto básico, antes de depender de atalhos. A nova revisão reinicia coordenadas/arrays de saves antigos, preservando XP e habilidades pelo mecanismo existente.
- Plataformas móveis em `thermal`, `ram-return`, `gpu-under` e `core-test`: eixo y, amplitude 64 px, velocidade 0,45. Todas são auxiliares à rota fixa.
- Plataformas temporárias em `bus-return` e `gpu-under`: 2,6 s após aterrissagem, retorno após 2,4 s, sem necessidade de boost. O teste aciona o temporizador verdadeiro pela aterrissagem, em vez de mudar somente o relógio da animação.
- Quatro perigos com aviso de 1,2 s, atividade de 0,65 s e período de 4,8 s; janela segura restante de 2,95 s, dano 8. Laser térmico na CPU, eletricidade nos demais setores. Sem flashes de tela inteira.
- Checkpoints sobre pisos permanentes, fora das caixas de perigo, considerando o deslocamento real de respawn de +38 px. Todos foram submetidos a um segundo de física real após respawn sem deriva ou queda.
- Subidas de 96 px, abaixo da altura básica de 128,6757 px. Degraus progressivamente mais estreitos, com 128 px na CPU, 112 px na RAM e 96 px na GPU. A descida entre salas tem um patamar próximo, sem exigir queda cega de um andar inteiro.
- Seeds determinísticas: campanha `byte-hardware-v3-2026`; cofres usam os streams por sala do compositor. Variações ficam em coordenadas de múltiplos de 16 px e não alteram o caminho obrigatório. Três seeds extras foram compiladas duas vezes e auditadas fisicamente. Duas podem produzir a mesma variante: o conjunto é pequeno e não promete unicidade de cada seed.

**Problema corrigido durante a implementação:** o patamar superior inicial de 256 px deixava só 16 px até cada lado da abertura do teto, menos que o corpo de 34 px. Isso permitia chegar à entrada do cofre, mas prendia a descida. Foi reduzido para 192 px, deixando 48 px de folga por lado. O teste passou a exigir todas as superfícies permanentes de percurso, além de acesso por sala e coleta real de cada recompensa.

### 10.5 Arte e parallax

Atlases pixel art existentes reutilizados, com novas composições de placas, módulos, processadores, contatos e barramentos em retângulos alinhados a pixels. Equipamentos grandes formam pontos de interesse; os detalhes de atlas ficam dentro das estruturas. Paleta verde/dourada, com os azuis discretos já presentes nas texturas e fundo. Colisão continua separada das estruturas decorativas.

`parallax-life.js` ganhou uma extensão opt-in para `map.regions`: escolhe setores pela distância às suas áreas no mundo, incluindo setores acima/abaixo da câmera, e mistura motivos próximos numa faixa de 256 px. O antigo perfil por progresso continua para as outras nove fases. Os seis setores usam os quatro bancos de motivos existentes, enquanto a decoração de mundo distingue cada região. O cache regional agora inclui origem **e destino** na chave; destinos não são necessariamente consecutivos nessa planta não linear. A seleção no desenho não cria arrays/objetos por frame.

Foram inspecionados visualmente o panorama e capturas em escala de jogo, incluindo CPU e RAM. R-07 claro, plataformas com bordas nítidas, inimigos coloridos e reparos distintos do fundo. Nearest-neighbor preservado. Capturas feitas após a transição inicial para não confundir o fade de entrada com uma mudança na iluminação.

- [Panorama anterior](tests/rebuild-v3-baseline/captures/phase-01-overview.png)
- [Panorama novo](tests/hardware-v3-results/identity-phase-01-v3-overview.png)
- [Placa-mãe](tests/hardware-v3-results/identity-phase-01-v3-pcb.png), [CPU](tests/hardware-v3-results/identity-phase-01-v3-cpu.png), [RAM](tests/hardware-v3-results/identity-phase-01-v3-ram.png), [Barramentos](tests/hardware-v3-results/identity-phase-01-v3-bus.png), [GPU](tests/hardware-v3-results/identity-phase-01-v3-gpu.png), [Núcleo](tests/hardware-v3-results/identity-phase-01-v3-core.png).

### 10.6 Testes e arquivos

Execução isolada em Chrome headless, sem GPU e com armazenamento temporário, por `tools/test_hardware_v3.py`. Os relatórios antigos não foram sobrescritos; `tests/hardware-v3-results/` recebe os novos resultados e sete PNGs.

| Verificação executada | Resultado |
| --- | --- |
| Testes específicos `tests/hardware-v3.js` | **35/35**, zero erros de runtime |
| Conectividade por simulação básica | Reparos, saída, checkpoints, inimigos e todas as superfícies permanentes de percurso alcançados |
| Passagens entre salas em `movePlayer` real | 30 conexões nos dois sentidos |
| Reparos | Quatro minigames resolvidos por controles DOM; pontes e retornos verificados |
| Recompensas | Todos os 26 itens coletados com movimento/salto reais nos trechos candidatos |
| Combate | Treze inimigos derrotados por projéteis básicos, sem boost/canhão; proteção contra dano no teste |
| Conclusão | Saída bloqueada até objetivos, pergunta correta e transição de fase confirmadas |
| Save | Migração de revisão 3 para 5 preserva XP/habilidade; save novo preserva reparo e checkpoint |
| Geração | Receita repetível e três seeds extras validadas sem depender de plataformas temporizadas |
| `tools/check_maps.py` | PASS |
| `tools/check_environment.py` | PASS |
| `tools/check_parallax.py` | PASS |
| `tools/check_generation.py` | PASS |
| Regressão completa `tests/run_review.py` | **209/209**, dez fases, 92 capturas geradas na cópia isolada, zero erros de runtime e nenhuma falha |
| Integridade das outras fases | Nove módulos e manifesto, dez arquivos com SHA-256 idênticos antes/depois; proteções históricas dos sistemas também passaram |

As 92 capturas da regressão completa são descartadas com a cópia temporária; os sete PNGs específicos acima foram preservados. O fingerprint da execução final após a liberação explícita de bitmaps é registrado na subseção de desempenho.

A primeira regressão registrou 203/209: seis testes ainda exigiam revisão 3, um formato horizontal na campanha, zero templates, coordenadas antigas da ventoinha ou um inimigo próximo do spawn. Foram atualizados para o contrato V3 e para testar a IA dentro da região de ativação real; os contratos das fases 2–10 permaneceram protegidos. A suíte voltou a 209/209. O teste da plataforma temporária também foi corrigido para acionar a aterrissagem e avançar a atualização real, conforme o motor funciona.

Arquivos de produção desta etapa:

- `src/maps/01-hardware.js`: reconstrução completa e receita híbrida.
- `src/engine/parallax-life.js`: seleção espacial opt-in dos setores e chave de cache regional.
- `src/engine/environment-art.js`: liberação imediata dos bitmaps de terreno removidos do cache, invalidados ou descartados, sem mudar pixels ou aumentar o limite de 96 blocos; contador de bytes para diagnóstico.

Arquivos de validação/documentação:

- `tests/hardware-v3.js`, `tools/test_hardware_v3.py`, `tests/hardware-v3-results/`.
- `tests/architecture.js`, `tests/campaign-generation.js`, `tests/first-five.js`, `tests/generation.js`, `tests/review.js`: atualização das seis suposições antigas, mantendo as demais verificações.
- `tools/check_maps.py`, `tools/check_environment.py`, `tools/check_generation.py`, `tools/check_parallax.py`, `tools/hardware_v3_contract.py`: exceção explícita e restrita à nova Hardware, conferida por hash e exportação do navegador.
- `tests/fixtures/hardware-v3.json`: referência nova exclusiva da fase 1, exportada após testes por `--write-fixture`; nenhum baseline histórico foi regravado.
- `REBUILD_MAPS_V3.md`: este registro. `index.html`, o módulo de arquitetura e seus artefatos já estavam alterados/não rastreados da etapa anterior e foram preservados.

#### Amostragem de renderização e cache

Desenho real de Canvas no Chrome headless com GPU desabilitada, quatro tamanhos de canvas lógico e os seis setores. Não é medição de FPS com `requestAnimationFrame`, nem benchmark em dispositivo móvel. Para rolagem normal: 4,25 px horizontais por desenho, pequena deriva vertical, quinze desenhos de aquecimento por setor e 270 amostras por resolução. O teste extremo usa 120 amostras numa varredura diagonal completa em sessenta desenhos com reversões, excedendo a velocidade do personagem.

| Canvas lógico | Desenho normal, mediana (ms) | Desenho normal, P95 (ms) | Varredura extrema, P95 (ms) |
| --- | ---: | ---: | ---: |
| 640×360 | 0,7 | 2,1 | 3,6 |
| 905×644 | 1,2 | 36,2 | 2,8 |
| 1280×720 | 1,7 | 56,7 | 54,3 |
| 1920×1080 | 1,9 | 70,5 | 108,3 |

As amostras normais passam por todos os setores, enquanto a varredura também cruza espaços externos vazios; por isso o P95 extremo pode ser menor em uma resolução. Não inferir desempenho de jogo somente pela mediana.

A investigação encontrou canvases evictados do cache aguardando GC para liberar seus pixels. Agora são zerados imediatamente na remoção, invalidação e dispose. Um teste mantém referências aos canvases evictado/descartado e confirma dimensões e bytes zerados. A amostra anterior foi preservada em `tests/hardware-v3-results/render-before-release.json`: P95 normal de 76,2 ms em 905×644 e 96,5 ms em 1920×1080, contra 36,2/70,5 ms nesta execução. São observações desta máquina, não promessa de ganho uniforme.

O cache permaneceu em até 96 blocos; os bitmaps de terreno retidos no fim dos casos ficaram entre 1,53 e 1,63 MiB. O parallax reteve 4.200.704 bytes (4,01 MiB), abaixo de 4,25 MiB. Isso não inclui toda a RAM do navegador, atlas compartilhados ou buffers de apresentação. **Continuam existindo picos de desenho nos setores densos e nas resoluções maiores**, mesmo com a liberação corrigida; não foi prometido 60 FPS. A geometria e a identidade visual não foram reduzidas para esconder essa limitação.

Execução final: `python -X utf8 tools/test_hardware_v3.py --full`, após a correção dos bitmaps. Hardware **35/35**, regressão **209/209**, zero erros de runtime. Os dois relatórios e o checkout atual compartilham o fingerprint `239da831b948a4f17ba2e2fa574d0262384cbc29d7dec739e89064d4cba9054e`. A comparação SHA-256 com o baseline confirmou também `game.js` intacto. Os quatro verificadores foram repetidos diretamente no checkout e passaram; `git diff --check` terminou sem erros de whitespace.

Evidências: [Hardware e medições](tests/hardware-v3-results/hardware.json), [regressão completa](tests/hardware-v3-results/regression.json), [comandos e hashes](tests/hardware-v3-results/execution.json). A exportação da referência exclusiva foi feita explicitamente com `--write-fixture` após os testes; as execuções comuns não atualizam essa referência.

### 10.7 Limitações e parada

Os testes de percurso e combate não são uma sessão humana contínua; minigames são resolvidos automaticamente pelo DOM e combate usa proteção contra dano. Falta medir 15–25 minutos, ajustar dificuldade por playtest, testar controles em um aparelho móvel físico e observar fadiga/orientação em exploração prolongada. A área é estimada por bandas e não deve ser divulgada como área exata.

Não foram reconstruídas as fases 2–10. Os riscos de save por posição dos arrays continuam para futuras revisões; por isso a revisão efetiva foi aumentada. O chefe VIRUS ZERO permanece na fase 10, e sua regressão passou sem alteração de mapa, IA ou arena.

- [x] Hardware nova implementada e selecionada na campanha real.
- [x] Seis regiões, caminhos, recompensas, reparos e conclusão validados.
- [x] Comparação de área e inspeção visual registradas.
- [x] Regressão das dez fases executada.
- [ ] Duração e balanceamento por partida humana contínua.
- [ ] Reconstrução das fases 2–10 — não iniciada.

**PARE AQUI:** implementação encerrada após a fase 1, sem push ou merge.

## 11. Fase 2 — Software reconstruída

Esta seção sucede o encerramento da Hardware. **Somente a fase 2 foi reconstruída nesta etapa.** A Hardware nova, os mapas 3–10, o manifesto e `game.js` foram preservados por hash. Permanecemos em `rebuild-maps-v3`, mantendo as alterações locais anteriores e sem commit automático, push ou merge.

### 11.1 Forma e integração

O Software antigo tinha quatro janelas em um mundo de 1900×1400, compiladas pelo adaptador de uma macro-sala. A Hardware nova usa uma malha física de células adjacentes. O Software agora usa uma **constelação assimétrica de 19 janelas independentes**, com alturas diferentes e uma torre de paginação: o desktop fica suspenso no centro, arquivos se ramificam à esquerda/abaixo, processos à direita, memória virtual acima, quarentena abaixo e núcleo em uma cadeia superior de quatro janelas.

As janelas são conectadas por diretórios/portais, sem longos corredores vazios entre setores. O espaço externo entre janelas é cenário não explorável e não é contabilizado como expansão útil. A receita registra `phase-02`, tema `software`, schema 2, **revisão efetiva 5**, seed `byte-software-v3-2026`, layout `hub` e câmera nos dois eixos.

| Medida | Software anterior compilado | Software novo |
| --- | ---: | ---: |
| Dimensões externas | 1900×1400 | **5120×4224** |
| Retângulo externo | 2.660.000 px² | 21.626.880 px² — não equivale à área útil |
| Janelas/salas | 4 no desenho autoral | **19**, 15 manuais e 4 cofres procedurais |
| Regiões | Desktop, processos, arquivos, scheduler | **6 setores** |
| Ligações de diretório | 8 links após reparos | **25 pares / 50 links direcionados** após reparos |
| Segmentos de piso | 4 | **21** |
| Plataformas | 14 | **88**, sendo 79 fixas, 5 móveis e 4 temporárias |
| Inimigos | 3 | **16**, basic/fast/shooter/armored com as variantes temáticas do Software |
| Reparos | 3 | **5**, com os desafios nativos do Software |
| Colecionáveis | 4 | **25**, incluindo oito nos quatro cofres opcionais |
| Checkpoints | 3 | **9**, livres e sobre apoios permanentes |
| Portas físicas controladas por reparos | 0 | **2**, além dos acessos condicionais por diretório |

O grafo completo possui sete ciclos independentes. A entrada é `(1856,2592)` no desktop; a saída elevada é `(928,208)` na janela final do núcleo, com região 64×64. Não foram reaproveitadas as coordenadas de entrada/saída do Software anterior.

### 11.2 Área explorável estimada e duração

Foram aplicados os mesmos instrumentos às duas definições: a preservada no baseline e a nova realmente carregada no Chrome. As bandas somam o corpo em pé e a altura básica de salto, contam sobreposição uma vez e subtraem sólidos. Continuam sendo estimativas geométricas, não área exata de trajetórias.

| Medida | Anterior (px²) | Nova (px²) | Razão |
| --- | ---: | ---: | ---: |
| Banda candidata inicial congelada | 668.314,22 | 5.159.232,43 | 7,72× |
| Banda candidata com componentes reparados | 752.881,57 | 5.229.257,51 | 6,95× |
| **Banda estática alcançada por física básica + portais ativos**, com progressão de reparos | **694.416,81** | **3.503.711,57** | **5,05×** |

A banda candidata superestima a utilidade de topos externos dos quadros e inclui plataformas temporizadas congeladas. A medida restrita às superfícies alcançadas exclui esses falsos percursos e é a principal referência de área útil desta etapa. Os dois números são publicados para não apresentar o retângulo externo ou um contador favorável como prova de exploração. O resultado útil estimado ficou **ligeiramente acima** da referência de 3–5×, não exatamente dentro dela. Larguras redundantes e patamares sem função foram reduzidos durante a preparação, mantendo as 19 salas, encontros e objetivos.

Referência de duração: **15–25 minutos**, ainda não medida por partida humana. Orçamento de autoria, sujeito a playtest: desktop 1–2 min, arquivos 3–4, processos 3–4, memória virtual 2–4, corrupção 3–4 e núcleo 3–5. Isso é planejamento de conteúdo, não tempo comprovado; não foram adicionados tempos de espera ou requisitos de grind para fabricar minutos. `durationMinutes`/`humanMinutes` continuam `null`.

### 11.3 Regiões e rotas

```mermaid
graph TD
  D[Desktop central] <--> F[Sistema de arquivos]
  D <--> P[Gerenciador de processos]
  D <--> C[Arquivos corrompidos]
  D <-- Escalonador restaurado --> V[Memória virtual]
  F <--> V
  V <--> P
  P <--> C
  F <-- Índice restaurado --> C
  D <-- Quatro serviços restaurados --> K[Núcleo: gateway, IO, stack e saída]
```

O diagrama resume setores; os 25 pares concretos estão em `generation.architecture.portalEdges`. Cada um possui destino e patamar permanente identificados por âncora. Portas bloqueadas continuam mostrando o nome do destino e a indicação de reparo.

| Setor | Janelas | Conteúdo |
| --- | --- | --- |
| Área de trabalho | `desktop`, `dock` | Hub de seis destinos em níveis diferentes, janelas gigantes, interfaces em degraus, escolha inicial de setor e cofre do dock. |
| Sistema de arquivos | `root`, `documents`, `archive`, `recycle` | Índice reparável, arena de documentos, ciclo entre diretórios, passagem para memória virtual/quarentena e lixeira secreta. |
| Processos | `scheduler`, `worker`, `clock` | Reparo do escalonador, interfaces móveis horizontais, arena, sobrecarga com aviso e travessia temporizada com piso de recuperação. |
| Memória virtual | `swap`, `pages`, `swap-cache` | Paginação reparável, apoios suspensos, elevadores auxiliares, torre de 1152 px com degraus de 112 px, páginas temporárias e cache superior secreto. |
| Arquivos corrompidos | `quarantine`, `recovery`, `infected-vault` | Combate, reconstrução de arquivos, perigo sinalizado e cofre atrás de acesso/porta liberados pela recuperação. |
| Núcleo do sistema | `kernel-gateway`, `kernel-io`, `kernel-stack`, `kernel-exit` | Aproximação extensa em quatro janelas, arena de IO, subida com degraus de 96 px, restauração final dos processos e estrado de saída protegido. |

O acesso direto desktop→memória virtual depende do escalonador, mas existe alternativa por arquivos→archive→swap. Portanto, a ordem dos setores externos não é imposta por essa porta. O atalho arquivos↔quarentena depende do índice; também há caminhos pelo desktop ou relógio de processos. Os cofres `dock`, `recycle`, `swap-cache` e `infected-vault` não contêm reparos ou inimigos obrigatórios.

### 11.4 Reparos, portas e física

Progressão observada no teste, usando os controles reais dos minigames:

1. `root:index`: restaura o índice e um atalho de diretório.
2. `scheduler:scheduler`: restaura o escalonador e o acesso direto à memória virtual.
3. `swap:paging`: restaura a paginação e sua interface auxiliar.
4. `recovery:recovery`: reconstrói arquivos e libera o cofre infectado/porta de quarentena.
5. Após os quatro serviços externos, o núcleo fica acessível. `kernel-stack:kernel` restaura os processos finais, libera o retorno do núcleo e remove a trava física da saída.

Essa foi a ordem escolhida pelo auditor, não uma sequência obrigatória dos quatro primeiros. Os quatro podem ser visitados por rotas independentes. Todos os reparos alteram geometria ou conexões. O quinto nunca é requisito para acessar a si mesmo. A saída ainda exige todos os reparos, todos os dezesseis inimigos e a pergunta educativa.

Física básica mantida: corpo 34×48, velocidade 255 px/s, impulso 690 px/s, altura de salto 128,6757 px. Subidas regulares de 96 px, com patamares intermediários. Os apoios móveis e temporários foram excluídos da prova estática principal: ela usa superfícies permanentes e os portais efetivamente disponíveis em cada estado.

- Cinco interfaces móveis: três horizontais no gerenciador de processos, duas verticais na memória virtual; amplitude 48 px e velocidade 0,55.
- Quatro páginas temporárias: duração 2,8 s após aterrissagem, retorno em 2,2 s, sem necessidade de habilidade opcional.
- Quatro sobrecargas/lasers: aviso 1,25 s, atividade 0,7 s, período 5,2 s e janela segura restante de 3,25 s; dano 8. Sem flash global.
- Nove checkpoints com piso permanente, sem sobreposição com hazards e considerando os +38 px do respawn. Foram testados com um segundo de física real.
- Todas as 50 viagens foram executadas com E, verificando coordenadas exatas, espaço para o corpo, apoio permanente e ausência de retorno ao segurar a tecla.
- Coleta dos 25 arquivos e combate contra os 16 inimigos executados com movimento/projéteis básicos. O combate automatizado usa proteção contra dano; não mede sobrevivência.

XP, habilidades, perguntas e chaves de armazenamento foram preservados. A revisão 5 aciona a migração já existente de coordenadas/arrays da revisão 3, sem apagar XP ou habilidade. O save novo foi retomado com reparo e checkpoint mantidos.

### 11.5 Extensão restrita do compositor

`src/generation/composer.js` aceita agora **somente por opt-in** `connectivity:'portal-network'`. Nesse modo, os links com destino `{room,anchor}` formam arestas dirigidas para a verificação estrutural; limites, sobreposições, IDs e alinhamento de sockets continuam sendo verificados. Destino ou âncora inexistente é rejeitado. O modo padrão continua exigindo a rede física de sockets; uma receita de janelas desconectadas sem opt-in foi rejeitada no teste, assim como um nome de modo desconhecido.

Os portais desse modo são reunidos em **um controlador** no resultado compilado. Isso corrige um problema encontrado no teste: com um controlador por janela, o mesmo toque de E podia ser consumido de novo no destino e devolver R-07 imediatamente. O modo opt-in compartilha a detecção da tecla e o cooldown na rede, sem modificar `level-runtime.js`, `game.js` ou o controlador legado usado pelas outras fases.

A conectividade estrutural não prova progressão de chaves. O teste faz expansão por física/portais reais, resolve um reparo alcançável por vez e repete até estabilizar. Uma cópia negativa fecha todas as entradas do escalonador com o próprio reparo: o auditor detectou o serviço inacessível e a saída bloqueada. Isso verifica que um grafo de diretórios aparentemente conectado não é aceito como prova de objetivos resolvíveis.

Geração híbrida: quinze templates manuais e quatro cofres com stream determinístico por sala. Três seeds adicionais foram compiladas duas vezes e tiveram saída, janelas e superfícies permanentes validadas. As variações dos cofres são discretas, em múltiplos de 16 px; não deslocam objetivos obrigatórios.

### 11.6 Visual e evidências

Paleta roxa, azul e rosa dos atlas do Software, com composições novas de janelas, barras de título, ícones de pasta/arquivo e páginas suspensas. A estrutura de cada janela serve de limite claro; painéis e ícones de fundo não colidem. Nenhuma textura é criada no loop do mapa. O parallax existente acompanha os seis setores em x/y usando `map.regions`, sem alteração adicional no renderer regional da etapa Hardware. Nearest-neighbor e escala inteira dos elementos mantidos.

Inspeção visual realizada no panorama e nas capturas do desktop e núcleo, com R-07 visível e interfaces distinguíveis do fundo. Há sete PNGs preservados:

- [Panorama anterior](tests/rebuild-v3-baseline/captures/phase-02-overview.png) e [panorama novo](tests/software-v3-results/identity-phase-02-sw-v3-overview.png).
- [Desktop](tests/software-v3-results/identity-phase-02-sw-v3-desktop.png), [arquivos](tests/software-v3-results/identity-phase-02-sw-v3-files.png), [processos](tests/software-v3-results/identity-phase-02-sw-v3-process.png), [memória virtual](tests/software-v3-results/identity-phase-02-sw-v3-virtual.png), [corrupção](tests/software-v3-results/identity-phase-02-sw-v3-corrupt.png), [núcleo](tests/software-v3-results/identity-phase-02-sw-v3-kernel.png).

### 11.7 Validação e arquivos desta etapa

`tools/test_software_v3.py` usa cópia e perfil de Chrome temporários. Os relatórios antigos, os artefatos da Hardware e os baselines históricos não são regravados. As janelas são verificadas por sobreposição antes da execução; erros de inicialização no navegador encerram o teste rapidamente.

| Verificação | Resultado executado |
| --- | --- |
| Testes específicos Software | **40/40**, zero erros de runtime |
| Conectividade progressiva | Cinco reparos, todas as janelas, superfícies permanentes de percurso e saída alcançados |
| Minigames | Cinco resolvidos pelo DOM real; efeitos e condições aplicados pelo jogo |
| Portais | 50 destinos executados, com apoio/colisão e tecla segurada verificados |
| Segredos/recompensas | 25 itens coletados; quatro cofres opcionais |
| Combate | 16 inimigos derrotados por projéteis básicos |
| Save | Migração de revisão 3 e retomada da revisão 5 verificadas |
| Negativos | Modo implícito/indevido rejeitado; dependência circular simulada detectada |
| Seeds | Três extras, compilação repetida idêntica e auditoria de alcance |
| `check_maps`, `check_environment`, `check_parallax`, `check_generation` | PASS |
| Regressão completa `tests/run_review.py` | **209/209**, dez fases, 92 capturas na cópia isolada, zero erros de runtime |
| Integridade | `game.js`, Hardware, fases 3–10 e manifesto preservados por SHA-256 |

Amostragem de desenho em Chrome headless, sem GPU: 270 amostras por resolução, seis setores, após quinze desenhos de aquecimento por setor, câmera em 4,25 px por desenho com pequena deriva vertical. É custo do `draw()` em loop de teste, não FPS com `requestAnimationFrame` nem benchmark em celular.

| Canvas lógico | Mediana de desenho (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 1,7 | 2,2 |
| 905×644 | 1,8 | 3,7 |
| 1280×720 | 1,4 | 4,4 |
| 1920×1080 | 1,7 | 86,2 |

Os limites existentes foram respeitados: até 96 blocos, aproximadamente 1,72–2,08 MiB de bitmaps de terreno retidos ao fim dos casos e 3,25 MiB no parallax. Isso não mede toda a memória do navegador/atlas. **Persistem picos em 1920×1080**, embora a mediana seja baixa; não foi declarado 60 FPS. Nenhum renderer ou limite de cache foi alterado nesta etapa para esconder essa limitação.

Execução final: `python -X utf8 tools/test_software_v3.py --full --write-fixture`, após o ajuste dos rótulos. O checkout, o relatório específico e a regressão completa compartilham o fingerprint `4374275b255bda4cb7b8fb7194d1e127d86e6df92473c7d7068d656b84a823f7`. Foram confirmados **40/40**, **209/209**, zero erros de runtime e **11 arquivos preservados por SHA-256** (`game.js`, Hardware, oito fases seguintes e manifesto). A prova final alcançou 100 superfícies estáticas; 16 topos externos de quadros ficaram fora do percurso, sem outros apoios permanentes inacessíveis. Os quatro verificadores também passaram diretamente no checkout; `git diff --check` terminou sem erros de whitespace.

Evidências: [Software e medições](tests/software-v3-results/software.json), [regressão completa](tests/software-v3-results/regression.json), [comandos e hashes](tests/software-v3-results/execution.json). As 92 capturas gerais foram geradas na cópia descartável; apenas os sete PNGs específicos foram copiados para o projeto.

Problemas encontrados/corrigidos: sobreposição inicial archive/desktop; retorno imediato por controladores separados de portais; teste que confundia conexão interna do núcleo com acesso do desktop; rótulos bloqueados que não identificavam o destino. A primeira inicialização com sobreposição aguardou timeout no transporte antigo; o executor específico ganhou diagnóstico imediato. Comandos auxiliares que falharam antes de escrever não modificaram fontes ou saves.

Produção alterada nesta etapa:

- `src/maps/02-software.js`: reconstrução e integração real da fase 2.
- `src/generation/composer.js`: conectividade e controlador único, restritos ao modo de rede por portais.

Validação/documentação:

- `tests/software-v3.js`, `tools/test_software_v3.py`, `tests/software-v3-results/`.
- `tests/architecture.js`, `tests/campaign-generation.js`, `tests/first-five.js`: contratos V3, janelas/portais, checkpoints sem coordenada antiga fixa e seleção da nova interface móvel.
- `tools/check_maps.py`, `tools/check_environment.py`, `tools/check_generation.py`, `tools/check_parallax.py`, `tools/software_v3_contract.py`: exceções limitadas ao Software e compositor revisados, verificadas por hash.
- `tests/fixtures/software-v3.json`: exportação exclusiva após testes por `--write-fixture`; referência da Hardware e fixtures históricas intactas.
- Este documento. As demais alterações/não rastreados de etapas anteriores foram preservados.

### 11.8 Limitações e ponto de parada

Ainda é necessário cronometrar uma partida humana, avaliar orientação/ritmo em exploração longa, dificuldade de sobrevivência e controles em dispositivo móvel físico. O tempo do teste automatizado não comprova 15–25 minutos. A área útil é uma estimativa por bandas; a banda candidata sem prova de alcance superestima as janelas externas. Desenho em Canvas não foi tratado como FPS garantido.

- [x] Software reconstruído e selecionado como fase 2 na campanha.
- [x] Seis regiões, 19 janelas, múltiplos andares, alternativas, segredos e núcleo implementados.
- [x] Colisões, portais, progressão, reparos, combate, perguntas e saves validados.
- [x] Estimativas comparáveis e capturas registradas.
- [ ] Duração e balanceamento por partida humana contínua.
- [ ] Reconstrução das fases 3–10 — não iniciada.

**PARE AQUI:** etapa encerrada após a fase 2, sem push ou merge.

### 11.9 Revalidação da solicitação — 2026-11-09

A inspeção do checkout encontrou a reconstrução Software V3 já implementada e versionada. Esta execução preservou esse mapa e repetiu a validação, sem alterar fontes de produção nem reconstruir outras fases.

- Seis regiões, 19 janelas em rede assimétrica, cinco reparos, quatro salas opcionais, 25 arquivos e 16 inimigos.
- Área estimada por bandas estáticas alcançáveis: **5,0455×** o baseline anterior. Essa medida exclui a simples expansão do retângulo do mundo; é uma aproximação de navegação, não uma medição de tempo de jogo.
- `python -X utf8 tools/test_software_v3.py --full`: nova execução com relatórios em `tests/software-v3-results/`.
- Resultado: **40/40** testes específicos e **209/209** verificações da regressão geral; zero erros de runtime. Os quatro verificadores estruturais passaram, e os hashes dos 11 arquivos protegidos permaneceram iguais. `git diff --check` passou.
- Meta de 15–25 minutos mantida; duração e dificuldade ainda dependem de uma partida humana contínua.

Ponto de parada mantido na fase 2, após validação e documentação.

## 12. Fase 3 — Switch radial reconstruído (09/11/2026)

### 12.1 Implementação e comparação com a referência

`src/maps/03-switch.js` foi substituído integralmente por uma receita própria, revisão efetiva **5**, carregada como `phase-03` na campanha existente. O adaptador antigo de uma sala não participa da nova geometria. A definição usa o compositor existente, sem alterar física, renderizadores, XP, habilidades, perguntas ou armazenamento.

O mapa tem uma silhueta de losango, com um backplane em cruz central e ramais que se reencontram em circuitos laterais e inferiores. Os interiores não têm paredes laterais entre áreas adjacentes: os percursos são físicos, por decks, cabos e recortes verticais. As paredes externas desenham o chassi. Isso difere da planta anterior de quatro portas em torno de uma espinha e da constelação de portais do Software. Também difere do contorno assimétrico 7×5 da Hardware: são sete faixas de larguras 1/3/5/7/5/3/1.

| Medida | Switch anterior, baseline preservado | Switch radial |
| --- | ---: | ---: |
| Dimensões | 2200×1200 | 4480×3584 |
| Regiões | Sem distritos espaciais | 6 |
| Áreas autorais | Adaptador de uma planta | 25: 21 manuais e 4 opcionais determinísticas |
| Conexões físicas de áreas | Planta anterior | 36, bidirecionais |
| Plataformas | 27 | 200: 189 fixas, 6 móveis, 5 temporárias |
| Reparos | 3 | 6 |
| Inimigos | 3 | 18 |
| Coletáveis | 4 | 53 |
| Portas Ethernet interativas | 2 | 2, ainda obrigatórias |
| Checkpoints | 3 | 14, com retorno livre |
| Banda estática navegável alcançável | 886.714 px² | 5.000.740 px² |

A comparação de área usa a união de bandas da altura do salto sobre apoios realmente alcançados, descontando sólidos, com o mesmo auditor e atributos básicos nos dois mapas. O resultado é **5,64×**, acima da faixa desejada de 3–5×. Não é a razão dos retângulos do mundo nem uma medição exata da área de trajetórias; não inclui depender de elevadores ou apoios temporários. O crescimento contém andares, objetivos, combate e recompensas, não apenas corredores alongados.

### 12.2 Regiões, rotas e progressão

| Região | Áreas e conteúdo |
| --- | --- |
| Backplane central | `backplane`, `hub-west`, `hub-east`, `hub-north`, `hub-south`: distribuição em quatro direções, elevadores e ligações entre os circuitos |
| Portas Ethernet | Portas 01–04, galerias leste/oeste e duas salas de manutenção: RJ45 gigantes com oito contatos, cabos, combates, varandas e controles 01/04 |
| Canais de transmissão | Ramos oeste/leste, canal central, relé e dois caches: pontes de pacotes, apoios temporários, correntes elétricas e retorno inferior |
| Central de comutação | Cruzamento e andar norte: exploração vertical, tabela MAC, ligação com porta 03, backplane e núcleo |
| Região de uplink | Base e coroa: plataformas mais estreitas, apoios temporários de menor duração, elevador e inimigos blindados |
| Núcleo final | Câmara de comutação e saída: entrada condicionada aos cinco circuitos externos, reparo final e trava de conectividade |

Os cinco reparos externos podem ser feitos em ordens diferentes: RJ45 da porta 01, RJ45 da porta 04, tabela MAC, sincronização dos canais e uplink. Cada reparo energiza uma ponte e habilita um retorno de manutenção ao hub. Esses seis retornos usam o controlador de portais existente; **não são necessários para a prova de conectividade**, que desconsidera todos eles.

Os reparos Ethernet também abrem as duas entradas das respectivas salas de manutenção, revelando recompensas opcionais. `channel-cache` e `packet-vault` são desvios adicionais no circuito inferior. Nenhuma sala opcional contém reparo ou inimigo obrigatório.

Depois dos cinco serviços externos, as três travas físicas da câmara do núcleo abrem. O reparo `core-guard:fabric` restaura a conectividade. A última barreira exige os seis reparos e as flags reais `port01:port-a` / `port04:port-b`. A conclusão ainda exige os 18 inimigos e a pergunta educativa. As duas portas usam o sistema existente de interativos e salvamento; o teste de regressão foi atualizado para verificar suas referências locais, em vez das antigas flags sem namespace.

### 12.3 Mecânicas, visual e ritmo planejado

- Seis plataformas móveis: cinco elevadores verticais e uma ponte horizontal de pacotes, amplitude 64 px e velocidade 0,5.
- Cinco apoios temporários: duração 2,8 s nos canais e 2,2 s no uplink, retorno em 2,4 s. O percurso obrigatório permanece demonstrável sobre apoios fixos.
- Sete correntes elétricas com aviso de 1,25 s, atividade de 0,7 s, período de 5,2 s e dano 8; os ciclos de aviso, dano e segurança foram exercitados no runtime.
- Degraus verticais regulares de 96 px, abaixo do salto básico de 128,6757 px. O uplink usa patamares menores, sem exigir habilidades opcionais.
- Pixel art azul/ciano, bocas RJ45 com oito contatos, gaiolas SFP no uplink, trilhas, pentes de cabos e chassi delimitado. Cenário decorativo não adiciona colisões invisíveis.
- Parallax existente em três profundidades, com acompanhamento regional em x/y; nearest-neighbor preservado. Nenhuma alteração global de renderer ou atlas.

Planejamento de primeira exploração: orientação 2–3 min, portas Ethernet 4–6 min, canais 3–4 min, comutação/uplink 4–7 min e núcleo 2–5 min; total pretendido **15–25 min**. São faixas de planejamento registradas no mapa, não um cronômetro de partida. O tempo real e a dificuldade de sobrevivência ainda precisam de uma partida humana contínua.

### 12.4 Validação executada

Comando: `python -X utf8 tools/test_switch_v3.py --full --write-fixture`. O executor usa cópia descartável, perfil isolado do Chrome e exportação da fixture somente após aprovação dos testes específicos. Os verificadores de integridade reconhecem exclusivamente o hash dessa exportação da fase 3; não foi removida a proteção das demais fases.

**46/46 testes específicos passaram, sem erros de runtime.** A prova física parte do spawn central, não usa habilidades nem os atalhos de retorno e repete a expansão após cada reparo. A câmara final estava inacessível inicialmente; tornou-se acessível depois dos cinco serviços externos. Foram alcançadas 232 superfícies estáticas após a restauração. Somente seis topos externos de chassi (`:rim`) ficaram fora do percurso.

| Verificação | Evidência |
| --- | --- |
| Conectividade física | Todas as 25 áreas e os objetivos alcançados; 36 emendas exercitadas nos dois sentidos pelo `movePlayer` real |
| Reparos | Seis minigames resolvidos por controles DOM reais; geometria e atalhos restaurados |
| Portas | Ativações com E em apoios alcançáveis, persistência e obrigatoriedade na conclusão |
| Retornos | Seis viagens executadas; destino com apoio permanente, corpo fora de sólidos e ausência de repetição ao segurar E |
| Checkpoints | 14 respawns estáveis após um segundo de física |
| Recompensas | 53 itens coletados por movimento/salto básicos |
| Combate | 18 inimigos derrotados por projéteis básicos; a proteção de dano usada pelo auditor não demonstra dificuldade de sobrevivência |
| Conclusão | Condições de reparos, portas e combate, pergunta real e transição verificadas |
| Save | Migração da revisão 3 com XP/habilidades intactos; retomada de reparo e checkpoint da revisão 5 |
| Negativos | Receita com ramal desconectado rejeitada; portas ausentes impedem conclusão; travas iniciais verificadas |
| Seeds | Três adicionais recompiladas duas vezes, com prova física dos objetivos e geometria |
| Verificadores Python | `check_maps`, `check_environment`, `check_parallax`, `check_generation`: PASS |
| Regressão geral das dez fases | **209/209**, zero erros de runtime, incluindo o teste ajustado do interceptor |
| Integridade | 11 arquivos protegidos por SHA-256 preservados: `game.js`, Hardware, Software, fases 4–10 e manifesto da campanha |

Execução final concluída com sucesso: os seis comandos do executor retornaram código 0. Checkout, teste específico e regressão geral compartilham o fingerprint de produção `a44595c68138d71261d33684cdf63856c338eee42dd43a6fc79a43032cfb12bb`. `git diff --check` passou. Evidência da campanha completa: [regression.json](tests/switch-v3-results/regression.json).

Amostragem do `draw()` no Chrome headless sem GPU: 270 amostras por resolução, seis regiões, 15 desenhos de aquecimento por região e deslocamento de câmera. Não equivale a FPS em jogo ou benchmark em celular.

| Canvas lógico | Mediana (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 2,4 | 5,5 |
| 905×644 | 2,6 | 42,4 |
| 1280×720 | 2,2 | 56,5 |
| 1920×1080 | 3,0 | 149,5 |

Os caches ficaram dentro dos limites existentes: 96 blocos de terreno e 3,25 MiB de parallax. **Há picos de desenho nas resoluções maiores**; não foi declarado 60 FPS nem alterado o motor para esconder essa limitação.

Capturas inspecionadas: [panorama radial](tests/switch-v3-results/identity-phase-03-switch-v3-overview.png) e [Ethernet](tests/switch-v3-results/identity-phase-03-switch-v3-ethernet.png). Também foram preservadas capturas das outras cinco regiões. Relatório específico: [switch.json](tests/switch-v3-results/switch.json); comandos e integridade: [execution.json](tests/switch-v3-results/execution.json).

### 12.5 Arquivos e ponto de parada

Produção: somente `src/maps/03-switch.js`. Validação: `tests/switch-v3.js`, `tools/test_switch_v3.py`, `tools/switch_v3_contract.py`, fixture e relatórios específicos. Os contratos de arquitetura/campanha, flags Ethernet e quatro verificadores foram adaptados à reconstrução explícita. Baselines históricos não foram regravados. As alterações anteriores da etapa Software foram preservadas.

Problemas encontrados e corrigidos: uma varanda reduzia o espaço para ficar em pé sobre o terceiro patamar do uplink. O apoio lateral foi deslocado, e a prova de todas as superfícies permanentes passou. Foram acrescentadas travas externas do núcleo e testes que confirmam a ordem de desbloqueio. O teste legado do interceptor colocava o jogador fora da região de ativação da primeira sentinela da nova planta: `tests/enemies.js` passou a testar a aproximação pelo interior, mantendo as exigências de capturar exatamente um tiro e devolvê-lo após o aviso. Nenhuma IA de produção foi alterada.

**PARE AQUI:** fase 3 implementada, testada e documentada. Fases 4–10 não reconstruídas nesta etapa; sem push ou merge. Permanecem pendentes a cronometragem humana, o balanceamento de sobrevivência e a avaliação em dispositivo móvel físico.

## 13. Modo Desenvolvedor — navegação isolada nas dez fases

### 13.1 Como usar

1. Abra **OPÇÕES** e ative **Modo Desenvolvedor**. O interruptor mostra ON; a interface identifica a sessão de teste.
2. Clique em **Selecionar fase**. As dez fases ficam disponíveis, de Hardware a **Servidores — VIRUS ZERO**, com destaque da fase atual. A seleção carrega o mapa imediatamente, sem introdução ou exigências das fases anteriores.
3. Durante a partida, pressione Esc ou o botão de pausa no celular. Use **Trocar de fase** ou **Reiniciar fase**. As mesmas ações estão disponíveis nas opções/seletor.
4. **Voltar** fecha o seletor e retorna à origem: configurações ou pausa.
5. Desative o interruptor em OPÇÕES para restaurar a campanha normal. O jogo retorna à tela que estava aberta, com o progresso preservado; se estava pausado, use **CONTINUAR**.

O modo começa **OFF em toda abertura/recarregamento da página**. Nenhuma preferência de desenvolvedor ou fase de teste é gravada em produção. Recarregar encerra a sessão temporária e apresenta o menu normal, de onde CONTINUAR CAMPANHA lê o salvamento principal intacto.

### 13.2 Implementação e limites do isolamento

- `src/engine/developer-mode.js` contém somente a interface e chamadas para o jogo: interruptor, seletor das dez fases, destaque atual, ações de pausa, reinício, retorno e identificação de teste. Não implementa física, colisões, inimigos ou carregamento alternativo.
- `game.js` reutiliza `resetCampaign()`, `loadPhase()`, `loadMap()` e `launchLoadedPhase(false)`. Selecionar ou reiniciar começa com atributos básicos, XP zero e sem habilidades de teste anteriores. O carregador existente descarta os controladores e recursos visuais antigos, limpa projéteis, inimigos, flags, checkpoints e plataformas temporárias e inicializa os recursos/parallax da fase escolhida.
- Ao ativar, o estado persistível da campanha normal fica em um snapshot **em memória**, junto à tela e aos diálogos normais. Ao desativar, o caminho existente de restauração reconstitui o jogador, XP/nível/habilidades, componentes, inimigos, itens, flags e checkpoint. Perguntas e escolhas de habilidade pendentes mantêm seus nós DOM e callbacks. Uma tentativa de diagnóstico em andamento é cancelada ao trocar de mundo; reparos já concluídos permanecem preservados no snapshot normal.
- `saveCampaign()` retorna sem gravar enquanto a sessão de teste existe. Isso cobre autosave, reparos, checkpoints, vitórias, pausa, mudança de visibilidade, teleporte e `pagehide`, sem substituir ou interceptar globalmente o `localStorage`.
- O histórico de perguntas possui cópia temporária própria; leitura/escrita durante testes usa essa cópia, sem consumir perguntas da campanha normal. OFF restaura o histórico normal em memória. As preferências comuns de áudio/conforto continuam funcionando normalmente.
- `continueCampaign()` não troca silenciosamente para o save normal enquanto o teste está ativo. O botão de nova campanha, se acionado após uma vitória de teste, inicia outro teste sem pedir substituição do save principal.
- Acesso livre **não** marca objetivos como cumpridos: vírus, minigames, reparos, perguntas, travas locais e os relés/estágios do VIRUS ZERO continuam ativos. Somente o acesso inicial às fases ignora o avanço da campanha.
- A requisição de animação é rastreada e cancelada antes de trocar mundos ou pausar, evitando acumular loops após seleções rápidas. Teclado e toque não movimentam o personagem com os painéis de configurações/seletor abertos.

### 13.3 Interface e compatibilidade

Os novos controles usam tipografia monoespaçada, bordas e cores do jogo, interruptor com `role="switch"`, destaque com `aria-current`, foco visível e botões de pelo menos 44 px. O seletor usa duas colunas no computador e uma em telas estreitas. Configurações e seletor têm altura limitada à tela e rolagem, incluindo celular horizontal.

Capturas reais do Chrome, sem instrumentação do motor:

- [Configurações desktop](tests/developer-mode-results/ui-1440x1000-settings.png) e [seletor desktop](tests/developer-mode-results/ui-1440x1000-selector.png).
- [Configurações em celular vertical](tests/developer-mode-results/ui-390x844-settings.png) e [seletor vertical](tests/developer-mode-results/ui-390x844-selector.png).
- [Configurações em celular horizontal](tests/developer-mode-results/ui-844x390-settings.png) e [seletor horizontal](tests/developer-mode-results/ui-844x390-selector.png).

As seis capturas foram inspecionadas; o executor verifica limites dos diálogos, ausência de overflow horizontal, tamanho dos botões e retorno às configurações. Medições: [ui.json](tests/developer-mode-results/ui.json).

### 13.4 Testes e preservação

Comando reproduzível: `python -X utf8 tools/test_developer_mode.py --full`. O projeto é copiado para uma pasta descartável; Chrome usa perfil isolado. O teste inclui um **reload real**, armazenando o controle do teste em `sessionStorage` somente na instrumentação descartável. Não existe esse controle no jogo distribuído.

Cobertura executada: OFF inicial; ativação; abertura do seletor; acesso direto à fase 10; troca 10→1; dez carregamentos com recursos, parallax, física e câmera; minigame e respawn em cada fase; relés e estágios do chefe; reinício com estados contaminados; vitória/pergunta de teste sem gravação normal; OFF com retomada de XP, habilidades, inimigos, reparos, itens, flags e checkpoint; reload com modo OFF e campanha retomável. O conteúdo das chaves de campanha e perguntas é comparado como texto, antes/depois das operações de teste.

Os quatro verificadores de mapas, ambiente, parallax e geração passaram. As proteções antigas do motor não foram desativadas: `tools/developer_mode_contract.py` reverte somente as alterações explícitas descritas em `tests/fixtures/developer-mode-source.json`, antes das verificações anteriores. Assim, a física e os demais sistemas continuam comparados à referência protegida.

Resultado final executado: **21/21 testes específicos**, incluindo restauração de perguntas/escolhas pendentes e reload real; **209/209 verificações da regressão geral das dez fases**, sem erros de runtime. As seis verificações visuais passaram em 1440×1000, 390×844 e 844×390. Os **11 arquivos de `src/maps/`**, incluindo o manifesto, mantiveram os mesmos SHA-256 durante esta funcionalidade. Os seis comandos de teste/verificação retornaram código 0, e `git diff --check` passou.

Checkout e relatórios finais compartilham o fingerprint de produção `13fa260c8a69230ed7625427c430d07008f9179912c859c572629597a593fb64`. Evidências: [testes específicos](tests/developer-mode-results/developer.json), [regressão geral](tests/developer-mode-results/regression.json) e [comandos/hashes dos mapas](tests/developer-mode-results/execution.json).

Problemas de validação resolvidos: a conexão CDP precisa tolerar a invalidação de contexto causada pelo reload real; o evento nativo de fechar `<dialog>` é assíncrono; o cache de plataformas é preenchido legitimamente pelo desenho, portanto o teste verifica IDs/estados novos em vez de exigir um cache vazio. Também foi ajustada a altura das configurações em telas baixas.

### 13.5 Arquivos e ponto de parada

Produção modificada nesta funcionalidade: `game.js`, `index.html`, `style.css` e o novo `src/engine/developer-mode.js`. Testes/contratos: `tests/developer-mode.js`, `tools/test_developer_mode.py`, `tools/developer_mode_contract.py`, `tests/fixtures/developer-mode-source.json`, `tools/check_environment.py`, `tools/check_parallax.py` e `tests/developer-mode-results/`. Documentação: este arquivo.

Nenhum arquivo de mapa, manifesto de campanha, pergunta, habilidade ou IA foi reconstruído nesta etapa. As alterações das reconstruções anteriores permanecem no checkout.

**PARE AQUI:** somente Modo Desenvolvedor e navegação de testes. Não há publicação, push ou merge. A validação de interface em celular foi feita com viewports do Chrome desktop; permanece pendente a avaliação em aparelhos físicos e outros navegadores.

## 14. Fase 4 — Roteador reconstruído

### 14.1 Arquitetura e conteúdo real

`src/maps/04-router.js` foi inteiramente substituído por **Roteador — O labirinto de rotas**, revisão efetiva 5. A campanha e o Modo Desenvolvedor carregam a mesma definição `phase-04`. O antigo adaptador da planta compacta não é usado nesta fase.

A nova silhueta possui galerias interligadas em cinco níveis, um vazio estrutural entre o núcleo e a WAN e uma extensão elevada para o gateway, no extremo direito. Há **27 salas e 38 conexões físicas bidirecionais**, com 12 ciclos independentes na malha conectada. As conexões são escolhidas individualmente: duas salas vizinhas podem continuar separadas por uma parede. Isso cria escolhas entre andares e desvios, em vez de uma grade totalmente aberta ou do hub radial do Switch.

| Medida | Roteador anterior, baseline preservado | Novo labirinto |
| --- | ---: | ---: |
| Dimensões | 2200×1500 | 5120×2560 |
| Regiões espaciais | Sem distritos regionais | 6 |
| Salas da receita | Planta compacta em adaptador | 27: 24 manuais e 3 caches opcionais determinísticos |
| Plataformas | 20 | 162: 152 fixas, 6 móveis e 4 temporárias |
| Reparos | 3 | 6 |
| Inimigos | 3 | 21 |
| Coletáveis | 4 | 40 |
| Checkpoints | 3 | 15 |
| Travamentos físicos condicionais | Sem portas dedicadas | 10 |
| Área por bandas estáticas alcançáveis | 1.204.002 px² | 4.872.790 px² |

A área navegável estimada cresceu **4,047×**, dentro da meta de 3–5×. A medida usa a união de bandas da altura do salto sobre apoios alcançados, descontando sólidos; não conta simplesmente o retângulo do mundo. O baseline foi auditado com seus atalhos reais disponíveis. A nova fase foi demonstrada **sem usar nenhum dos seis atalhos por teleporte**, nem depender das plataformas móveis/temporárias. A medida aproxima espaço navegável e não comprova duração de partida.

### 14.2 Regiões e escolhas de exploração

| Região | Implementação |
| --- | --- |
| Entrada LAN | `lan-entry`, `lan-rise`, `lan-fork`: chegada segura, túneis de introdução, primeira subida e bifurcação entre galeria superior e rota inferior |
| Labirinto central | `maze-cross`, `maze-upper`, `maze-well`, `maze-lower` e dois caches: poço vertical, combate em dois andares, conexões de retorno e desvio inferior |
| Interfaces de rede | `iface-lan`, `iface-console`, `iface-wan`, `iface-bypass`, `iface-cache`: consoles de configuração, reparos, portas de manutenção e caminhos liberados |
| Túneis WAN | `wan-crown`, `wan-shaft`, `wan-relay`, `wan-under`, `wan-trench`, `wan-intake`: câmaras conectadas de até 1280 px de largura, elevadores, pontes móveis, armadilhas e combate vertical |
| Núcleo de roteamento | `core-west`, `core-south`, `core-main`, `core-east`: hub em vários níveis, acesso por galerias LAN e WAN, reparo da tabela e saída para duas aproximações do gateway |
| Gateway final | `gateway-approach`, `gateway-tower`, `gateway-exit`: setor elevado, parkour de precisão, restauração final e barreira de saída |

O jogador pode abordar os quatro serviços externos em ordens diferentes. A galeria LAN superior se reconecta ao poço e ao núcleo; o circuito inferior liga trânsito, interface WAN e câmaras de transmissão. A ligação direta `maze-cross → maze-well` começa fechada, mas a interface LAN é alcançável pela galeria superior e pelo circuito inferior. Repará-la abre esse atalho e as duas entradas de `maze-vault`.

O reparo de trânsito abre as duas entradas do cache de configuração. `maze-cache` é um desvio opcional adicional entre o labirinto e o bypass inferior. Nenhum dos três caches contém inimigo ou reparo obrigatório. Existem seis recompensas marcadas como secretas, além dos datagramas e demais itens de exploração.

### 14.3 Progressão sem dependências circulares

1. Restaurar **LAN** (`iface-lan:lan`), **trânsito** (`iface-console:transit`), **WAN** (`iface-wan:wan`) e **sincronização do túnel** (`wan-relay:link`). Todos os quatro são alcançáveis no estado inicial, com atributos básicos.
2. Os quatro serviços abrem as duas entradas da sala `core-main`. Restaurar sua **tabela de roteamento** (`core-main:table`).
3. A tabela libera as duas passagens verticais para o gateway, pelo núcleo leste e pela coroa WAN.
4. Restaurar o **gateway padrão** (`gateway-tower:gateway`). A última barreira exige os seis reparos; a conclusão também exige os 21 inimigos e a pergunta educativa existente.

Cada reparo energiza uma plataforma e habilita um atalho de manutenção com apoio permanente. Cinco retornam à bifurcação LAN; o do gateway retorna ao núcleo sul. Os destinos não contêm portais de retorno imediato. A conectividade obrigatória não depende desses atalhos.

O auditor repete a expansão física a partir do spawn após cada reparo alcançável. A ordem registrada no teste é uma escolha do auditor, não uma sequência imposta aos quatro primeiros serviços. Um caso negativo coloca a interface LAN atrás de uma trava que só ela poderia abrir: o teste detecta LAN, núcleo e gateway inacessíveis e não aceita a saída como alcançada.

### 14.4 Desafios, segurança e apresentação

- Seis apoios móveis, com amplitude 64 px e velocidade 0,5: quatro verticais e duas pontes horizontais WAN.
- Quatro apoios temporários: duração de 2,6 s e retorno em 2,4 s. Os percursos obrigatórios também têm apoios permanentes demonstrados.
- Seis armadilhas elétricas/lasers: aviso de 1,3 s, atividade de 0,65 s, período de 5,4 s e dano 8. Aviso, janela ativa e janela segura foram exercitados no runtime.
- Subidas regulares de 96 px, abaixo do salto básico de 128,6757 px. O gateway usa patamares menores, sem exigir habilidades opcionais.
- Combates em dois andares: as sentinelas secundárias ficam em varandas permanentes 192 px acima do piso. Isso também afasta suas patrulhas dos pontos de respawn.
- Checkpoints com apoio fixo e retorno livre. O teste considera os +38 px reais do respawn, todos os hazards e os envelopes completos de patrulha, exigindo distância mínima de 160 px entre centro do personagem e centro de patrulha.
- Pixel art azul-escura, paredes tecnológicas, cabos, consoles LAN/WAN e indicadores discretos. O cenário decorativo não cria caixas de colisão invisíveis. O parallax existente acompanha os seis distritos em x/y, em três profundidades; nearest-neighbor preservado.

Planejamento de ritmo: LAN 2–3 min, labirinto 4–6 min, interfaces 3–5 min, WAN/núcleo 4–7 min e gateway 2–4 min; total pretendido **15–25 min**. Ainda é necessário cronometrar uma partida humana e avaliar orientação, sobrevivência e exploração dos desvios. O tempo do auditor não foi tratado como duração de gameplay.

### 14.5 Validação e evidências

Comando reproduzível: `python -X utf8 tools/test_router_v3.py --full --write-fixture`. O executor usa cópia e perfil de Chrome descartáveis. A fixture da fase 4 é exportada somente depois da aprovação dos testes específicos. Os verificadores antigos reconhecem seu hash exato, sem liberar mudanças arbitrárias nos mapas ou no motor.

| Verificação | Resultado específico |
| --- | --- |
| Progressão | Seis minigames resolvidos pelo DOM real; travas do núcleo/gateway respeitadas |
| Física | Todas as 27 salas e 197 superfícies permanentes do percurso alcançadas com atributos básicos |
| Conexões | As 38 emendas físicas foram executadas nos dois sentidos pelo `movePlayer` real |
| Superfícies externas | Somente seis topos de teto externos (`:roof`) ficaram fora do percurso |
| Atalhos | Seis viagens, corpo livre de sólidos, apoio permanente e tecla E segurada sem repetição |
| Checkpoints | 15 respawns estáveis, hazards excluídos e patrulhas afastadas |
| Recompensas | 40 itens coletados por movimento e salto básicos |
| Combate | 21 inimigos derrotados por projéteis básicos; a proteção de dano do teste não demonstra balanceamento de sobrevivência |
| Objetivos | Reparos, combate, pergunta educativa real e transição para a fase seguinte verificados |
| Salvamento | Migração da revisão 3 com XP/habilidades preservados; retomada de reparo e checkpoint da revisão 5 |
| Negativos | Ramal desconectado rejeitado; serviço atrás do próprio reparo detectado |
| Seeds | Três adicionais recompiladas duas vezes e auditadas, com objetivos e apoios permanentes alcançáveis |
| Modo Desenvolvedor | Acesso direto à fase 4, reinício dos objetivos e retorno à campanha normal sem alterar suas chaves de salvamento/perguntas |

Execução final: **53/53 testes específicos** e **209/209 verificações da regressão geral**, zero erros de runtime. `check_maps`, `check_environment`, `check_parallax` e `check_generation` passaram; os seis comandos do executor retornaram código 0. Os 11 arquivos protegidos por SHA-256 permaneceram iguais: `game.js`, fases 1–3, fases 5–10 e manifesto da campanha. `git diff --check` passou. Checkout e relatórios finais correspondem ao fingerprint de produção `da495afb683d2588649ee3a7fc1d831f34b362ecdd7cd5b4aeba573f3e01be81`.

Capturas inspecionadas: [panorama anterior](tests/rebuild-v3-baseline/captures/phase-04-overview.png), [panorama novo](tests/router-v3-results/identity-phase-04-router-v3-overview.png), [WAN](tests/router-v3-results/identity-phase-04-router-v3-wan.png) e [gateway](tests/router-v3-results/identity-phase-04-router-v3-gateway.png). Também foram preservadas capturas das quatro outras regiões.

Relatórios: [fase Roteador](tests/router-v3-results/router.json), [regressão geral](tests/router-v3-results/regression.json) e [comandos/hashes](tests/router-v3-results/execution.json). A amostragem de custo de desenho está no relatório específico; não equivale a FPS nem a benchmark em celular. Persistem picos em resoluções maiores, sem alteração global do renderer ou dos limites de cache nesta etapa.

Amostragem no Chrome headless sem GPU, 270 desenhos medidos por resolução após aquecimento e com deslocamento de câmera pelos seis setores:

| Canvas lógico | Mediana de desenho (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 1,1 | 2,9 |
| 905×644 | 2,0 | 5,7 |
| 1280×720 | 1,7 | 54,2 |
| 1920×1080 | 2,6 | 66,3 |

Os caches respeitaram os limites existentes: até 96 blocos de terreno e 3,25 MiB de parallax. Não foi declarado 60 FPS garantido.

### 14.6 Arquivos e ponto de parada

Produção desta etapa: somente `src/maps/04-router.js`. Testes e referência: `tests/router-v3.js`, `tools/test_router_v3.py`, `tools/router_v3_contract.py`, `tests/fixtures/router-v3.json` e `tests/router-v3-results/`. Os contratos em `tests/architecture.js`, `tests/campaign-generation.js` e os quatro verificadores Python foram adaptados à receita da fase 4. Este documento registra a implementação; os baselines históricos não foram regravados.

Correção de segurança durante a validação: as patrulhas secundárias foram elevadas para varandas e os checkpoints deslocados 16 px para dentro das salas, evitando proximidade excessiva com patrulhas de salas vizinhas. A revisão não mudou as regras de dano nem a proteção existente de respawn.

**PARE AQUI:** fase 4 implementada, testada e documentada. Hardware, Software, Switch, Modo Desenvolvedor, motor e fases 5–10 preservados nesta etapa. Sem push ou merge. Pendentes: partida humana contínua para confirmar duração/dificuldade e teste em aparelhos físicos.

## 15. Fase 5 — Wi-Fi: a torre de sinal

### 15.1 Reconstrução e comparação

`src/maps/05-wifi.js` foi substituído integralmente pela nova fase `phase-05`, revisão efetiva 5. A campanha e o seletor do Modo Desenvolvedor carregam a mesma torre, sem um segundo motor ou alterações na câmera global. O mapa agora possui **1920×5632 px**, 27 áreas de manutenção e **37 conexões físicas bidirecionais**, com 11 ciclos na rede de conexões.

A arquitetura consiste em mastros abertos, ligados por travessas, plataformas e desvios laterais. Não há os tetos e paredes de salas que caracterizam o Roteador. As linhas de subida se cruzam nos repetidores e no campo de sinal; quedas podem ser recuperadas em apoios inferiores. A coroa superior abriga a antena principal e um compartimento de saída condicionado aos seis reparos.

| Medida | Wi-Fi anterior, baseline preservado | Nova torre |
| --- | ---: | ---: |
| Dimensões | 1550×2400 | 1920×5632 |
| Regiões espaciais | Sem distritos regionais | 6 |
| Áreas da receita | Planta compacta em adaptador | 27: 23 manuais e 4 caches opcionais determinísticos |
| Plataformas | 29 | 210: 191 fixas, 8 móveis e 11 temporárias |
| Reparos | 3 | 6 |
| Inimigos | 3 | 22, incluindo dois voadores Wi-Fi |
| Coletáveis | 5 | 39 |
| Checkpoints | 4 | 16 |
| Banda alcançável no snapshot completo ativo | 1.000.871 px² | 5.519.125 px² |

A estimativa comparável de área navegável é **5,514×**, um pouco acima da meta de 3–5×. Nos dois mapas, o auditor parte do spawn, com todos os reparos aplicados e os apoios móveis/temporários presentes no mesmo instante inicial. O cálculo usa a união de bandas da altura do salto sobre apoios alcançados, descontando sólidos. A saída da referência também foi alcançada nesse snapshot.

Essa medida congela os apoios ativos: não equivale à união de todas as trajetórias possíveis ao longo do tempo. A referência depende de sinais temporários/móveis; ignorá-los reduz sua prova a 232.456 px². Por isso, a razão estática de 22,88× presente no relatório **não é usada como índice de expansão**. Na nova torre, a prova sem apoios móveis/temporários alcançou 5.318.235 px² e todos os objetivos: o percurso obrigatório não depende de acertar uma janela temporal ou de habilidades opcionais.

### 15.2 Regiões, rotas e reparos

| Região | Conteúdo implementado |
| --- | --- |
| Base da torre | `base-west`, `base-center`, `base-east`, `base-dock`: área larga de entrada, calibração de associação, primeiro combate e um desvio secreto inferior |
| Estruturas de transmissão | `transmit-west`, `transmit-spine`, `transmit-east`: portadora, subida em zigue-zague, elevadores, rota lateral e ameaça aérea |
| Zona de interferência | `noise-west`, `noise-center`, `noise-bypass`, `noise-east`, `noise-cache`: espectro congestionado, apoios temporários, pulsos elétricos, bypass e cache oculto |
| Torres repetidoras | `repeater-west`, `repeater-east`, `repeater-bridge`, `repeater-base`, `repeater-cross`: dois reparos, elevadores, pontes horizontais e conexões entre as duas linhas de subida |
| Campo de sinal | `signal-west`, `signal-cross`, `signal-crown`, `signal-drift`, `signal-cache`: estruturas suspensas, patamares menores, exploração lateral, voador, apoios móveis/temporários e desvio opcional |
| Antena principal | `array-west`, `array-east`, `main-array`, `sky-exit`, `upper-cache`: grande setor superior, inimigos blindados, parkour de precisão, restauração do uplink e saída |

Os seis reparos são: associação Wi-Fi, portadora, limpeza do espectro, repetidor oeste, repetidor leste e antena principal. Todos têm minigames Wi-Fi reais, ativam uma ponte de apoio e habilitam retorno seguro à base. Componentes ficam em apoios permanentes; nenhum reparo exige sua própria plataforma energizada para ser alcançado.

O reparo da portadora remove uma zona de sinal fraco na transmissão. O do espectro remove as cinco zonas congestionadas da faixa de interferência. As zonas preservam os modificadores existentes de movimento, cadência e velocidade de projéteis; os testes verificam sua remoção pelo componente correspondente. A saída exige todos os reparos, os 22 inimigos e a pergunta educativa normal.

Os quatro desvios opcionais não contêm reparo ou inimigo obrigatório. Seus oito bônus secretos ficam em plataformas de manutenção, além dos fragmentos e demais recompensas. A subida principal pode alternar entre mastros e retornar a andares já visitados. Os seis atalhos de retorno são conveniência após os reparos; não foram usados na prova física dos objetivos.

### 15.3 Parkour, checkpoints, câmera e visual

- Patamares de subida com desníveis regulares de 96 px, abaixo do salto básico de 128,6757 px. As larguras diminuem até 96 px na coroa, com locais permanentes de descanso e recuperação.
- **Oito apoios móveis:** cinco verticais e três horizontais; amplitude 64 px e velocidade 0,5. Todos foram testados transportando o personagem nos dois eixos correspondentes.
- **Onze sinais temporários:** duração 2,5 s nas faixas intermediárias e 2,2 s na antena, com reaparecimento após 2,4 s. Cada um foi acionado, desapareceu e reapareceu no runtime real.
- Seis pulsos elétricos com aviso 1,3 s, atividade 0,65 s, período 5,4 s e dano 8; janelas de aviso, dano e segurança verificadas.
- Dezesseis checkpoints livres em apoios fixos. A verificação inclui os +38 px reais do respawn, estabilidade após um segundo de física, ausência de sobreposição com hazards e distância mínima de 160 px dos envelopes de patrulha iniciais. Sentinelas secundárias ficam em varandas elevadas.
- A câmera existente foi exercitada durante subida e descida contínuas por toda a altura, em 320×568, 844×390 e 1280×720: cabeça e pés permaneceram visíveis, o maior deslocamento vertical por passo simulado foi 3,214 px e a deriva estacionária foi zero. São provas do controlador a 120 passos/s, não medição de FPS.
- Pixel art azul/ciano, mastros gigantes, antenas, travessas e LEDs discretos. Não há paredes invisíveis delimitando salas; somente o compartimento final possui teto/parede sólidos e trava. O parallax vertical existente acompanha os seis setores em três profundidades, com nearest-neighbor preservado.

Planejamento de ritmo: base 2–3 min, transmissão 3–5 min, interferência 3–5 min, repetidores 3–5 min, campo de sinal 2–4 min e antena 2–3 min: total pretendido **15–25 minutos**. Ainda é necessário cronometrar uma partida humana contínua e avaliar dificuldade de sobrevivência, orientação e controles em aparelho físico.

### 15.4 Validação executada

Comando final: `python -X utf8 tools/test_wifi_v3.py --full --write-fixture`. O executor usa cópia e perfil de Chrome descartáveis. A fixture é exportada somente depois da aprovação dos testes específicos; as referências históricas não são regravadas.

Resultado: **58/58 testes específicos**, **209/209 verificações da regressão geral das dez fases**, zero erros de runtime. Os quatro verificadores Python (`check_maps`, `check_environment`, `check_parallax`, `check_generation`) passaram. Os seis comandos do executor retornaram código 0. Foram preservados por SHA-256 os 11 arquivos protegidos: `game.js`, fases 1–4, fases 6–10 e manifesto da campanha.

| Verificação | Evidência |
| --- | --- |
| Objetivos e conectividade | Seis minigames resolvidos por controles DOM reais; saída e todas as 27 áreas alcançadas sem poderes opcionais |
| Apoios permanentes | 242 superfícies demonstradas; nenhuma superfície estática ficou sem prova de alcance |
| Conexões entre andares | 37 emendas exercitadas nos dois sentidos pelo `movePlayer` real |
| Recompensas | 39 itens coletados por movimento e salto básicos |
| Combate | 22 inimigos derrotados por projéteis básicos; a proteção de dano usada pelo auditor não comprova balanceamento de sobrevivência |
| Mecânicas temporais | Onze sinais desapareceram/reapareceram; oito apoios móveis transportaram o personagem |
| Câmera | Três viewports, subida/descida integral e estabilidade estacionária |
| Salvamento | Migração da revisão 3 com XP/habilidades preservados; retomada de reparo e checkpoint da revisão 5 |
| Modo Desenvolvedor | Acesso direto à fase 5, reinício dos objetivos e retorno à campanha sem alterar suas chaves de salvamento/perguntas |
| Negativo | Remoção das conexões da base central rejeitada como grafo desconectado |
| Seeds | Três seeds adicionais recompiladas duas vezes e auditadas com os objetivos alcançáveis |

Os testes legados de interferência passaram a localizar a zona e seu reparo por referência, em vez de coordenadas antigas. A seleção do sinal temporário também usa seu tipo, sem depender do antigo ID `signal-01`. Os testes de arquitetura/campanha verificam agora a torre efetiva, preservando replay determinístico e objetivos.

Checkout e relatórios finais compartilham o fingerprint de produção `f40cf484752f668cc3111713446c243acc75022a39f664f24e9a2a4fa45939f9`. `git diff --check` passou. Evidências: [fase Wi-Fi](tests/wifi-v3-results/wifi.json), [regressão geral](tests/wifi-v3-results/regression.json) e [comandos/hashes](tests/wifi-v3-results/execution.json).

Capturas inspecionadas: [panorama vertical](tests/wifi-v3-results/identity-phase-05-wifi-v3-overview.png), [base](tests/wifi-v3-results/identity-phase-05-wifi-v3-base.png) e [antena principal](tests/wifi-v3-results/identity-phase-05-wifi-v3-antenna.png). Também foram preservadas capturas de transmissão, interferência, repetidores e campo de sinal.

Amostragem de `draw()` em Chrome headless sem GPU: 270 desenhos por resolução, após aquecimento e com deslocamento de câmera pelos seis setores. Não equivale a FPS com `requestAnimationFrame` nem a benchmark em celular.

| Canvas lógico | Mediana de desenho (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 1,2 | 3,1 |
| 905×644 | 1,8 | 40,4 |
| 1280×720 | 2,1 | 49,8 |
| 1920×1080 | 3,0 | 59,5 |

Os caches respeitaram os limites existentes: até 96 blocos de terreno e 3,25 MiB de parallax. Persistem picos nas resoluções maiores; não foi declarado 60 FPS garantido nem alterado o motor para ocultar essa limitação.

### 15.5 Arquivos e ponto de parada

Produção desta etapa: somente `src/maps/05-wifi.js`. Validação: `tests/wifi-v3.js`, `tools/test_wifi_v3.py`, `tools/wifi_v3_contract.py`, `tests/fixtures/wifi-v3.json`, `tests/wifi-v3-results/`, contratos de arquitetura/campanha, testes legados das cinco primeiras fases e quatro verificadores Python. Documentação: este arquivo. As alterações das etapas anteriores foram preservadas.

**PARE AQUI:** fase 5 implementada, testada e documentada. Sem reconstruir fases 6–10, sem alterações adicionais no motor/Modo Desenvolvedor e sem push ou merge. Pendentes: cronometragem e balanceamento por partida humana contínua, dispositivos físicos e avaliação dos picos de desenho já registrados.

## 16. Fase 6 — Cabeamento: o complexo industrial

### 16.1 Reconstrução e área explorável

`src/maps/06-cabling.js` foi inteiramente substituído pela fase **Cabeamento — O complexo industrial**, revisão efetiva 5. A campanha e o Modo Desenvolvedor carregam a mesma definição `phase-06`. A antiga torre estreita de dutos deu lugar a um complexo largo de **3840×4096 px**, com oito níveis, blocos técnicos, três linhas principais de poços e um elevador no anexo.

Há **41 salas e 66 conexões físicas bidirecionais**, formando 26 ciclos independentes na rede conectada. Os andares inferiores se estendem por toda a largura do prédio. Acima, os poços e passarelas conectam blocos separados; a cobertura recua para o centro. Galerias de manutenção/central adjacentes podem se abrir em salões maiores, enquanto portas estruturais e tetos delimitam os demais setores. A arquitetura difere da torre aberta Wi-Fi e da planta vertical anterior do Cabeamento.

| Medida | Cabeamento anterior, baseline preservado | Novo complexo |
| --- | ---: | ---: |
| Dimensões | 1600×3000 | 3840×4096 |
| Regiões espaciais | Sem distritos regionais | 6 |
| Salas da receita | Planta compacta em adaptador | 41: 37 manuais e 4 caches opcionais determinísticos |
| Plataformas | 44 | 293: 272 fixas, 15 móveis e 6 temporárias |
| Reparos | 3 | 7 |
| Inimigos | 4 | 30 |
| Coletáveis | 4 | 54 |
| Checkpoints | 4 | 22 |
| Travas físicas | Sem portas dedicadas | 5 |
| Banda alcançável no snapshot restaurado completo | 1.969.062 px² | 7.937.184 px² |

A estimativa comparável de área navegável cresceu **4,031×**, dentro da meta de 3–5×. Os dois mapas foram auditados a partir do spawn, após os reparos, com seus apoios móveis/temporários presentes no mesmo instante inicial. A saída da referência foi alcançada. A medida é a união de bandas da altura do salto sobre apoios alcançados, descontando sólidos; congela o estado dos mecanismos e não representa toda a área de trajetórias ao longo do tempo.

Na prova conservadora que exclui apoios móveis e temporários, a nova fase alcançou **7.835.034 px²**, contra 1.893.219 px² da referência: **4,138×**. Todos os reparos e a saída são alcançáveis nesse modelo. Assim, a progressão não depende de acertar o instante de um elevador nem de uma habilidade opcional. A expansão inclui salas, objetivos, combate, poços e recompensas, em vez de apenas aumentar o retângulo do mundo.

### 16.2 Regiões e rotas

| Região | Implementação |
| --- | --- |
| Subsolo | Seis áreas: chegada, alimentação, túneis de cabos, passagem inferior de combate, galeria leste e cache lateral |
| Central de cabeamento | Seis salas: painel principal, tronco de cobre, hub, distribuição de patch cords e galerias técnicas interligadas |
| Andares de manutenção | Nove salas: quadro de serviço, corredores de combate em dois níveis, passarelas, retornos, anexo e cofre de manutenção |
| Poços de elevadores | Seis áreas: poço oeste em dois níveis, poço central de inspeção, poço leste em dois níveis e elevador do anexo |
| Infraestrutura superior | Oito áreas: torres metálicas, oficina, hub de distribuição, passarela elevada, dutos laterais e dois caches |
| Cobertura | Seis áreas: duas aproximações laterais, ponte, quadro de antenas, estruturas de combate/parkour e saída |

O subsolo, a central e os corredores de manutenção oferecem vários retornos entre colunas e andares. O poço central permite inspeção e mudança de rota; as linhas oeste/leste e o anexo conectam os níveis superiores. As escadas técnicas permanecem disponíveis quando os elevadores de serviço estão desligados. O setor superior tem passarela entre blocos e conexões laterais à cobertura.

Os quatro caches opcionais ficam no subsolo, no anexo de manutenção e nas duas extremidades superiores. Não contêm inimigo ou reparo obrigatório. Há oito recompensas marcadas como secretas, além dos demais dados e peças de exploração.

### 16.3 Reparos integrados e progressão

| Reparo | Efeito |
| --- | --- |
| `basement-power:power` | Restaura alimentação, elevador de serviço e bandeja de apoio do subsolo |
| `central-main:patch` | Reconecta o painel principal, seu elevador e bandeja |
| `central-east:trunk` | Repara o tronco de cobre e energiza seus acessos |
| `maintenance-west:service` | Restaura o quadro técnico do andar de manutenção |
| `shaft-west-mid:motor` | Repara o controle local de elevador do poço oeste |
| `upper-hub:distribution` | Restaura distribuição superior e seu elevador de serviço |
| `roof-controls:antenna` | Reconecta a cobertura e completa a condição de abertura da saída |

Cada reparo tem um minigame de Cabeamento real, energiza uma ponte/bandeja e um elevador de serviço e habilita um retorno seguro. Seis retornos levam à chegada no subsolo; o da cobertura retorna ao hub central. Os destinos têm apoio permanente e não contêm portais que causem retorno imediato ao segurar E.

Os **seis serviços inferiores são alcançáveis inicialmente**, em ordens diferentes. Eles liberam as quatro entradas verticais da faixa de cobertura. O quadro da cobertura não está incluído na condição que permite chegar a si próprio. A saída final exige os sete reparos, os 30 inimigos e a pergunta educativa normal.

O auditor repete a expansão física após cada reparo. Uma cópia negativa encerra o painel principal atrás de uma trava que somente seu próprio reparo abriria: o teste detecta o painel e o quadro da cobertura inacessíveis, com saída não alcançada. Os atalhos de retorno não foram usados na prova dos caminhos obrigatórios.

### 16.4 Elevadores, desafios e segurança

- **Quinze apoios móveis:** sete elevadores de serviço inicialmente desligados, cinco elevadores operacionais e três pontes/guindastes horizontais. Os verticais têm amplitude 112 px, cobrindo 224 px entre extremos; os horizontais têm amplitude 64 px. Todos foram exercitados transportando o personagem.
- Os sete elevadores de serviço usam a condição do próprio quadro de reparo. Seus componentes ficam no piso permanente, sem depender do elevador que precisam energizar.
- Seis andaimes temporários, com apoio fixo de preparação: duração 2,8 s e reaparecimento em 2,4 s. Todos foram acionados, desapareceram e reapareceram no runtime.
- Treze riscos elétricos, com aviso 1,3 s, atividade 0,65 s, período 5,4 s e dano 8. As janelas de aviso, dano e segurança foram verificadas.
- Escadas técnicas com subidas de 96 px, abaixo do salto básico de 128,6757 px. A cobertura usa patamares menores e rotas de preparação para o parkour final.
- Vinte e dois checkpoints livres em piso permanente. O ensaio considera os +38 px reais do respawn, estabilidade após um segundo de física, ausência de sobreposição com hazards e distância mínima de 160 px dos envelopes iniciais de patrulha.
- Sentinelas secundárias ficam em varandas elevadas, separando combate de piso e combate de andar. Ameaças rápidas aparecem nos corredores; blindados ocupam infraestrutura superior e cobertura.
- A câmera existente foi exercitada em subida/descida integral, em 320×568, 844×390 e 1280×720: personagem sempre visível e deriva estacionária zero. A inicialização do ensaio foi corrigida para começar dentro dos limites reais da câmera, sem alterar o controlador do jogo.

Pixel art de metal e cobre, bandejas organizadas de cabos, trilhos de elevadores, dutos, painéis e pequenas luzes amarelas. O cenário decorativo não acrescenta colisões invisíveis. O parallax industrial existente acompanha as seis regiões em x/y, com nearest-neighbor preservado.

Planejamento de ritmo: subsolo 2–3 min, central 3–5 min, manutenção 3–5 min, poços 3–5 min, infraestrutura superior 2–4 min e cobertura 2–3 min; total pretendido **15–25 minutos**. A duração e o balanceamento de sobrevivência ainda precisam de uma partida humana contínua. O tempo do teste automatizado não foi usado como duração de gameplay.

### 16.5 Validação executada e evidências

Comando final: `python -X utf8 tools/test_cabling_v3.py --full --write-fixture`. O projeto e o perfil do Chrome são descartáveis. A fixture da fase 6 é exportada somente após a aprovação dos testes específicos; referências históricas não foram regravadas.

Resultado: **69/69 testes específicos**, **209/209 verificações da regressão geral das dez fases**, zero erros de runtime. Os quatro verificadores Python (`check_maps`, `check_environment`, `check_parallax`, `check_generation`) passaram. Os seis comandos do executor retornaram código 0. Os 11 arquivos protegidos por SHA-256 permaneceram iguais: `game.js`, fases 1–5, fases 7–10 e manifesto da campanha.

| Verificação | Evidência |
| --- | --- |
| Conectividade e objetivos | 41 salas, sete minigames resolvidos pelo DOM real, seis quadros iniciais acessíveis e cobertura liberada depois deles |
| Geometria | 351 superfícies permanentes alcançadas; somente cinco topos externos de teto ficaram fora do percurso |
| Conexões | 66 emendas exercitadas nos dois sentidos pelo `movePlayer` real |
| Apoios móveis | Todos os 15 transportaram o personagem; sete elevadores de serviço confirmados desligados antes dos reparos |
| Andaimes | Seis ciclos de ativação, desaparecimento e retorno no runtime |
| Checkpoints | 22 respawns estáveis e afastados dos hazards/patrulhas iniciais |
| Recompensas | 54 itens coletados com movimento e salto básicos |
| Combate | 30 inimigos derrotados por projéteis básicos; a proteção de dano do auditor não comprova dificuldade de sobrevivência |
| Conclusão | Reparos, combate, pergunta real e transição verificados |
| Salvamento | Migração de revisão anterior com XP/habilidades preservados; retomada de reparo e checkpoint da revisão 5 |
| Modo Desenvolvedor | Acesso direto à fase 6, reinício de objetivos e retorno à campanha sem alterar suas chaves de salvamento/perguntas |
| Negativos | Entrada desconectada rejeitada; painel atrás do próprio reparo detectado |
| Seeds | Três adicionais recompiladas duas vezes e auditadas, com objetivos e apoios permanentes alcançáveis |

Os contratos de infraestrutura/campanha foram atualizados para verificar a receita e o replay do novo Cabeamento. Os testes dos elevadores legados apontam agora para os novos IDs de serviço. As fases 7–10 continuam comparadas às suas referências originais, incluindo a arena manual de VIRUS ZERO. As proteções do motor/Modo Desenvolvedor não foram removidas.

Checkout e relatórios finais compartilham o fingerprint de produção `30d520f307d4a706f57a7bdd3ea76a7534e24b3aa4b7a73b6bca4daab8650ac3`. `git diff --check` passou. Evidências: [fase Cabeamento](tests/cabling-v3-results/cabling.json), [regressão geral](tests/cabling-v3-results/regression.json) e [comandos/hashes](tests/cabling-v3-results/execution.json).

Capturas inspecionadas: [panorama industrial](tests/cabling-v3-results/identity-phase-06-cabling-v3-overview.png) e [poços](tests/cabling-v3-results/identity-phase-06-cabling-v3-shafts.png). Também foram preservadas capturas de subsolo, central, manutenção, infraestrutura superior e cobertura.

Amostragem de `draw()` em Chrome headless sem GPU: 270 desenhos por resolução, após aquecimento e com câmera em deslocamento pelos seis setores. Não representa FPS com `requestAnimationFrame` nem benchmark em celular.

| Canvas lógico | Mediana de desenho (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 1,4 | 3,0 |
| 905×644 | 1,6 | 4,0 |
| 1280×720 | 2,0 | 4,6 |
| 1920×1080 | 2,6 | 105,0 |

Os caches respeitaram os limites existentes: até 96 blocos de terreno e aproximadamente 3,26 MiB de parallax. Persistem picos em 1920×1080; não foi declarado 60 FPS garantido nem alterado o renderer para ocultar essa limitação.

### 16.6 Arquivos e ponto de parada

Produção desta etapa: somente `src/maps/06-cabling.js`. Validação: `tests/cabling-v3.js`, `tools/test_cabling_v3.py`, `tools/cabling_v3_contract.py`, `tests/fixtures/cabling-v3.json`, `tests/cabling-v3-results/`, contratos de arquitetura/campanha/infraestrutura, testes dos elevadores e quatro verificadores Python. Documentação: este arquivo. As alterações anteriores do projeto foram preservadas.

**PARE AQUI:** fase 6 implementada, testada e documentada. Sem reconstruir fases 7–10, sem alterações adicionais no motor/Modo Desenvolvedor e sem push ou merge. Pendentes: cronometragem e balanceamento por partida humana contínua, aparelhos físicos e avaliação dos picos de desenho registrados.

## 17. Fase 7 — DHCP: a cidade dos endereços

### 17.1 Reconstrução e área explorável

`src/maps/07-dhcp.js` foi substituído integralmente pela nova definição `phase-07`, revisão efetiva 5, usada pela campanha e pelo Modo Desenvolvedor. A antiga planta de escopos ligados principalmente por portais deu lugar a uma **cidade de 3840×3072 px**, com torres de servidores, praças, passarelas em vários níveis e distritos conectados fisicamente.

São **25 áreas e 35 conexões físicas bidirecionais**, com 11 ciclos independentes na rede conectada. A Central DHCP conecta os distritos de endereçamento, reservas e conflitos; o circuito inferior de distribuição se reencontra com as rotas laterais. O gateway ocupa um bloco elevado próprio. A cidade não reutiliza o contorno do complexo industrial ou da torre Wi-Fi.

| Medida | DHCP anterior, baseline preservado | Nova cidade |
| --- | ---: | ---: |
| Dimensões | 2800×1700 | 3840×3072 |
| Distritos espaciais | Sem distritos regionais | 6 |
| Áreas da receita | Planta compacta em adaptador | 25: 21 manuais e 4 caches opcionais determinísticos |
| Plataformas | 21 | 173: 163 fixas, 6 móveis e 4 temporárias |
| Reparos | 3 | 6 |
| Terminais de serviço obrigatórios | 2 | 2, preservados e integrados aos novos reparos |
| Inimigos | 4 | 22 |
| Coletáveis | 4 | 38 |
| Checkpoints | 4 | 15 |
| Travas físicas | 1 | 4 |
| Banda alcançável no snapshot restaurado completo | 1.004.264 px² | 4.888.224 px² |

A estimativa comparável de área navegável cresceu **4,867×**, dentro da meta de 3–5×. Ambos os mapas foram medidos após os reparos e a habilitação dos serviços de IP, com apoios móveis/temporários presentes no mesmo instante inicial. A saída da referência foi alcançada. A medida usa a união de bandas da altura do salto sobre apoios alcançados, descontando sólidos; não é simplesmente a razão entre retângulos do mundo nem a área exata de todas as trajetórias temporais.

Separadamente, a prova conservadora da nova cidade, sem usar plataformas móveis/temporárias nem atalhos por teleporte, alcançou **4.799.363 px²** e todos os objetivos. A referência depende mais desses mecanismos: sua comparação somente estática resulta em 5,47×. O índice principal acima usa o cenário completo restaurado para incluir de maneira equivalente o conteúdo ativo das duas versões.

### 17.2 Distritos, hubs e rotas alternativas

| Distrito | Conteúdo implementado |
| --- | --- |
| Central DHCP | `central-core`, `central-north`, `central-east`: hub inicial, servidor, terminal de ativação, elevador e combate em dois níveis |
| Endereçamento | Cinco áreas: escritório de escopo, galeria superior, praça oeste, conexão leste e cache lateral |
| Conflitos | Cinco áreas: núcleo de correção, praças corrompidas oeste/leste, passagem inferior e cache; zonas de IP duplicado, inimigos e atalho bloqueado |
| Reservas | `reserve-main`, `reserve-upper`, `reserve-cache`: tabela de reservas, terminal obrigatório, plataformas móveis e desvio opcional |
| Distribuição | Cinco áreas: pontes leste/oeste, cruzamento, reparo de relay e cache; parkour, ligação inferior entre distritos e rotas em vários níveis |
| Gateway | `gateway-plaza`, `gateway-guard`, `gateway-upper`, `gateway-exit`: praça de reparo, guardas blindados, patamares de precisão e saída |

Os quatro caches não contêm inimigo ou reparo obrigatório. Há oito recompensas marcadas como secretas, além dos demais tokens e cópias de concessão. Os caminhos de retorno e cruzamentos permitem alternar entre os distritos; a central funciona como ponto de recepção dos seis atalhos habilitados pelos reparos.

As recepções ficam em apoio permanente, afastadas de inimigos e da interação do próprio servidor, e não coincidem com portais de retorno. A conectividade obrigatória foi demonstrada sem esses atalhos. O gateway tem duas aproximações, pela galeria de reservas e pela passagem vertical do cache de reservas.

### 17.3 Reparos e serviços DHCP continuam obrigatórios

1. Restaurar servidor DHCP (`central-core:server`), escopo (`address-office:scope`), conflitos (`conflict-core:conflict`), reservas (`reserve-main:reservation`) e relay de distribuição (`distribution-south:relay`). Os cinco reparos são alcançáveis no estado inicial, em ordens diferentes.
2. Ativar por E o terminal DHCP e o terminal de reservas, após o reparo correspondente. As flags são `central-core:dhcp-on` e `reserve-main:reservation`; reparar o componente não ativa automaticamente o terminal.
3. Os cinco reparos e as duas ativações liberam as duas entradas do gateway. Restaurar o sexto componente, `gateway-plaza:gateway`.
4. A barreira final exige os seis reparos e as duas flags. A conclusão também exige os 22 inimigos e a pergunta educativa normal.

Cada reparo tem um minigame DHCP real, energiza uma ponte de dados e habilita um retorno à central. O reparo de reservas também habilita sua plataforma móvel. Resolver o núcleo de conflitos remove as cinco zonas de IP duplicado, que reduzem a velocidade para 85%, e abre a passagem vertical leste.

O auditor ativa os terminais com E em apoios fisicamente alcançados, respeitando seus requisitos, e repete a expansão após cada reparo/ativação. Não injeta flags de conclusão na prova principal. Um caso negativo encerra o escritório de escopo atrás do próprio reparo: o auditor detecta escopo e gateway inacessíveis e saída não alcançada.

Os dois serviços mantêm o funcionamento e o salvamento existentes. Os testes legados passaram a consultar as flags dos terminais por suas referências locais, em vez dos antigos nomes sem namespace. Os rótulos visuais usam prefixos IPv4 completos (`10.0.0.0/24`, `10.0.10.0/24`, `10.0.20.0/24`, `10.0.30.0/24`); o distrito corrompido é identificado como IP duplicado.

### 17.4 Desafios, checkpoints e apresentação

- Seis apoios móveis: três verticais e três horizontais, amplitude 64 px e velocidade 0,5; todos transportaram o personagem no runtime.
- Quatro pontes temporárias com preparação em apoio fixo: duração 2,6 s e reaparecimento em 2,4 s. Todos os ciclos foram executados.
- Seis pulsos elétricos/lasers com aviso 1,3 s, atividade 0,65 s, período 5,4 s e dano 8; janelas de aviso, dano e segurança verificadas.
- Patamares regulares de 96 px, abaixo do salto básico de 128,6757 px. O gateway usa apoios menores e guardas blindados; as sentinelas secundárias ficam em terraços elevados.
- Quinze checkpoints livres em apoio fixo. O ensaio considera os +38 px reais do respawn, estabilidade após um segundo de física, ausência de sobreposição com hazards e distância mínima de 160 px dos envelopes iniciais de patrulha.
- Câmera existente verificada em subida/descida, nos viewports 320×568, 844×390 e 1280×720: corpo sempre visível, limites respeitados e deriva estacionária zero. O ensaio não mede FPS.
- Pixel art verde/azul, torres de servidores, janelas discretas e pontes digitais. O distrito de conflitos usa pequenos acentos de corrupção. O cenário não adiciona colisões invisíveis; o bloco do gateway tem paredes e travas explícitas. O parallax existente acompanha os seis distritos em x/y, com nearest-neighbor preservado.

Planejamento de ritmo: central 2–3 min, endereçamento 3–5 min, conflitos 3–5 min, reservas 2–4 min, distribuição 3–5 min e gateway 2–3 min; total pretendido **15–25 minutos**. Duração, orientação e dificuldade de sobrevivência ainda precisam de uma partida humana contínua e testes em aparelho físico.

### 17.5 Validação e evidências

Comando reproduzível: `python -X utf8 tools/test_dhcp_v3.py --full --write-fixture`. O executor usa cópia e perfil de Chrome descartáveis. A fixture é exportada somente após a aprovação dos testes específicos; os baselines históricos não são regravados.

| Verificação | Evidência |
| --- | --- |
| Objetivos e serviços | Seis minigames resolvidos pelo DOM real e duas ativações reais, com desbloqueio progressivo do gateway |
| Conectividade | Todas as 25 áreas e 209 superfícies permanentes alcançadas, sem superfícies estáticas sem prova |
| Conexões físicas | 35 emendas exercitadas nos dois sentidos pelo `movePlayer` real |
| Retornos | Seis destinos com apoio permanente, corpo fora de sólidos e tecla E segurada sem repetição de viagem |
| Mecânicas temporais | Seis apoios móveis transportaram o personagem; quatro pontes desapareceram e reapareceram |
| Checkpoints | 15 respawns estáveis, fora de hazards e afastados das patrulhas iniciais |
| Recompensas | 38 itens coletados por movimento/salto básicos |
| Combate | 22 inimigos derrotados por projéteis básicos; a proteção de dano do auditor não comprova balanceamento de sobrevivência |
| Conclusão | Reparos, flags, combate, pergunta real e transição verificados |
| Salvamento | Migração da revisão 3 com XP/habilidades preservados; retomada de reparo/checkpoint e persistência das flags de serviço |
| Modo Desenvolvedor | Acesso direto à fase 7, reinício dos objetivos e retorno à campanha sem alterar suas chaves de salvamento/perguntas |
| Negativos | Hub desconectado rejeitado; escopo atrás do próprio reparo detectado |
| Seeds | Três adicionais recompiladas duas vezes e auditadas com objetivos alcançáveis |

Resultado final da etapa DHCP: **62/62 testes específicos** e **209/209 verificações da regressão geral das dez fases**, zero erros de runtime. `check_maps`, `check_environment`, `check_parallax` e `check_generation` passaram. Os seis comandos do executor retornaram código 0; os 11 arquivos protegidos por SHA-256 permaneceram iguais (`game.js`, fases 1–6, fases 8–10 e manifesto da campanha). `git diff --check` passou. Checkout e relatórios finais compartilham o fingerprint de produção `724857045022b712366a68434a9c74a6a19f5bd57f5213f14f8aa0cffb33956d`.

As referências de arquitetura/campanha/infraestrutura foram atualizadas para a receita da cidade. O teste de conflito localiza a zona e seu componente, sem coordenadas antigas; o teste de concessão móvel usa a nova plataforma de reservas. As fases 8–10 permanecem comparadas às referências originais, incluindo a arena manual de VIRUS ZERO. O motor e o Modo Desenvolvedor não foram alterados nesta etapa.

Capturas inspecionadas: [panorama da cidade](tests/dhcp-v3-results/identity-phase-07-dhcp-v3-overview.png), [central](tests/dhcp-v3-results/identity-phase-07-dhcp-v3-central.png) e [conflitos](tests/dhcp-v3-results/identity-phase-07-dhcp-v3-conflicts.png). Também foram preservadas capturas de endereçamento, reservas, distribuição e gateway. Relatórios: [fase DHCP](tests/dhcp-v3-results/dhcp.json), [regressão geral](tests/dhcp-v3-results/regression.json) e [comandos/hashes](tests/dhcp-v3-results/execution.json).

Amostragem de `draw()` em Chrome headless sem GPU: 270 desenhos por resolução, após aquecimento e com câmera em deslocamento pelos seis distritos. Não representa FPS com `requestAnimationFrame` ou benchmark em celular.

| Canvas lógico | Mediana de desenho (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 1,8 | 3,6 |
| 905×644 | 1,8 | 4,4 |
| 1280×720 | 2,2 | 5,3 |
| 1920×1080 | 3,0 | 165,6 |

Os caches respeitaram os limites existentes: até 96 blocos de terreno e 3,25 MiB de parallax. Persistem picos em 1920×1080; não foi declarado 60 FPS garantido nem alterado o renderer para ocultar essa limitação.

### 17.6 Arquivos e ponto de parada

Produção desta etapa: somente `src/maps/07-dhcp.js`. Validação: `tests/dhcp-v3.js`, `tools/test_dhcp_v3.py`, `tools/dhcp_v3_contract.py`, `tests/fixtures/dhcp-v3.json`, `tests/dhcp-v3-results/`, contratos de arquitetura/campanha/infraestrutura, testes legados dos serviços e quatro verificadores Python. Documentação: este arquivo. As alterações anteriores do projeto foram preservadas.

**PARE AQUI:** fase 7 implementada, testada e documentada. Sem reconstruir fases 8–10, sem alterações adicionais no motor/Modo Desenvolvedor e sem push ou merge. Pendentes: cronometragem e balanceamento por partida humana contínua, aparelhos físicos e avaliação dos picos de desenho registrados.

## 18. Fase 8 — DNS: complexo dos domínios

### 18.1 Arquitetura e conteúdo

Reconstrução integral de `src/maps/08-dns.js`, revisão 5: mundo de **7040×5120**, 33 salas, 36 conexões físicas bidirecionais e 24 ligações direcionadas por portais. São 28 salas manuais e cinco cofres determinísticos gerados. Os grandes espaços entre conjuntos representam domínios separados, acessados por portais; não são contabilizados como corredores exploráveis.

| Região | Salas | Conteúdo |
| --- | ---: | --- |
| Servidor Raiz | 4 | Hub, consultas aos domínios, referências e atalhos de retorno |
| .COM | 7 | Torres de arquivos, delegação, registros A/AAAA, combates e dois cofres |
| .ORG | 6 | Terraços abertos, registros, parkour, sentinelas e cofre |
| Cache Recursivo | 8 | Labirinto de quatro níveis, resolvedor, TTL, elevadores e passagem lateral desbloqueável |
| NXDOMAIN | 4 | Desvio opcional, corrupção, quatro inimigos reforçados e recompensas |
| Resolução Final | 4 | Entrada após seis serviços, combate, navegação avançada, sétimo reparo e saída |

O conjunto tem 24 inimigos, 56 itens, sete reparos/minigames, 21 checkpoints, seis plataformas móveis, quatro temporárias e oito zonas de perigo temporizado. Oito salas são opcionais: quatro de NXDOMAIN e quatro cofres nos demais domínios. Cada sala contém plataformas, objetivos, encontros, recompensas ou conexões úteis.

A estimativa de área útil compara a união das faixas de navegação em apoios permanentes realmente alcançados, no mapa anterior e no novo, com serviços restaurados e portais disponíveis. Não usa o retângulo vazio do mundo. O crescimento medido é aproximadamente **3,18×**. A prova usa a física básica do motor, sem habilidades opcionais; os topos exteriores de paredes e tetos estruturais não são rotas jogáveis.

### 18.2 Progressão e portais

Os seis serviços exteriores são alcançáveis sem dependências circulares: referências da raiz, registros .COM, delegação .COM, registros .ORG, resolvedor recursivo e TTL. Sua restauração habilita a consulta para Resolução Final. O sétimo reparo conclui a resolução; a barreira de saída exige os sete serviços.

O motor mantém os minigames, perguntas, combate, XP e salvamento existentes. A conclusão exige os **20 guardiões obrigatórios**, identificados por uma meta nativa de derrota com IDs explícitos. Os quatro inimigos de NXDOMAIN não são requisitos nem substituem guardiões obrigatórios. O teste libera a saída com os quatro opcionais vivos e depois também exercita seus combates.

Referências da raiz abrem um atalho ao resolvedor; delegação liga .COM a .ORG; registros .ORG conectam os terraços ao cache; TTL libera atalhos e a passagem lateral do labirinto. Seis serviços fora da raiz ganham retornos após reparo. Os 24 portais usam o controlador compartilhado existente, com recepção em apoio permanente e afastada da origem: segurar E não dispara viagens em cascata. Nenhum teleporte paralelo ou segundo motor foi criado.

### 18.3 Física, apresentação e ritmo

As plataformas móveis incluem quatro elevadores verticais e duas travessias horizontais, amplitude 64 px. As quatro temporárias duram 2,7 s e reaparecem em 2,4 s; apoios fixos permitem preparar os saltos. Degraus regulares de 96 px respeitam o salto básico de aproximadamente 128,68 px. O setor final recebeu um degrau adicional de aproximação após a regressão apontar acesso insuficiente ao apoio de uma ponte temporária.

Os checkpoints usam apoios fixos, respawn real e afastamento mínimo de 160 px dos envelopes iniciais de patrulha. Perigos têm aviso de 1,3 s, atividade de 0,65 s e período de 5,4 s. O desenho roxo/azul usa servidores, arquivos, portais e parallax existente; .ORG apresenta terraços e NXDOMAIN acentos de corrupção. O cenário decorativo não cria colisões invisíveis. Foram inspecionadas as capturas de panorama, raiz e .ORG.

Planejamento de ritmo: raiz 2–3 min, .COM 3–5 min, .ORG 3–5 min, cache 4–7 min e resolução 3–5 min, com sobreposição de trajetos e atalhos para buscar **15–25 minutos**. NXDOMAIN acrescenta um desvio de risco previsto em 2–5 min. Esses valores são planejamento: duração e balanceamento precisam de partida humana contínua; a automação não comprova tempo de gameplay ou dificuldade de sobrevivência.

### 18.4 Validação reproduzível

Comando: `python -X utf8 tools/test_dns_v3.py --full --write-fixture`. Execução em cópia e perfil de Chrome descartáveis, sem usar o salvamento do jogador. A fixture só é exportada após aprovação específica; seu contrato verifica o SHA-256 normalizado do código. As referências históricas permanecem preservadas e as fases 9–10 continuam comparadas aos mapas originais.

O ensaio cobre sete minigames pelo DOM real; expansão da conectividade após reparos; todas as salas e superfícies permanentes de rota; 36 emendas nos dois sentidos com `movePlayer`; 24 portais por E, destinos apoiados e ausência de repetição com E segurado; 21 respawns; 56 coletas; 24 combates com projéteis básicos; saída e pergunta educativa. A proteção de dano do auditor não comprova balanceamento de sobrevivência.

Também executa desaparecimento/reaparecimento das quatro pontes; transporte pelas seis plataformas móveis; janelas de dano dos oito perigos; três seeds adicionais; rejeição de raiz isolada e destino inexistente; detecção de reparo bloqueado por si próprio; migração de save da revisão 3, preservação de XP/habilidades, retomada de checkpoint/reparos; acesso direto à fase 8, reinício e retorno pelo Modo Desenvolvedor sem escrita nas chaves normais. A câmera é exercitada em 320×568, 844×390 e 1280×720.

Relatórios: [DNS](tests/dns-v3-results/dns.json), [regressão geral](tests/dns-v3-results/regression.json), [comandos e hashes](tests/dns-v3-results/execution.json). Capturas: [panorama](tests/dns-v3-results/identity-phase-08-dns-v3-overview.png), [raiz](tests/dns-v3-results/identity-phase-08-dns-v3-root.png), [.ORG](tests/dns-v3-results/identity-phase-08-dns-v3-org.png), [.COM](tests/dns-v3-results/identity-phase-08-dns-v3-com.png), [cache](tests/dns-v3-results/identity-phase-08-dns-v3-cache.png), [NXDOMAIN](tests/dns-v3-results/identity-phase-08-dns-v3-nx.png) e [resolução](tests/dns-v3-results/identity-phase-08-dns-v3-resolution.png).

A versão final passou **63/63 testes específicos**, com área útil relativa de **3,1824×**, 254 superfícies alcançadas e nenhuma sala inacessível. As exclusões da prova são somente topos estruturais de paredes/tetos. `check_maps`, `check_environment`, `check_parallax` e `check_generation` passaram.

A regressão final das dez fases passou **209/209 verificações**, com 92 capturas, zero erros de runtime e nenhuma falha. Os seis comandos da última execução retornaram código 0; os 11 arquivos protegidos por SHA-256 ficaram idênticos. Checkout, relatório específico e regressão compartilham o fingerprint `3ee0fdfca39f6437770c458c0ff739fb1c9d8df2c8e0c66e08468606d048eac5`. `git diff --check` passou. As tentativas anteriores permanecem no histórico: corrigiu-se o apoio final apontado pela regressão e ampliou-se somente o timeout de diagnóstico do executor, após uma interrupção da comunicação com Chrome. Não foram declaradas aprovadas as execuções interrompidas.

Amostragem de `draw()` em Chrome headless sem GPU, 270 desenhos por resolução após aquecimento:

| Canvas lógico | Mediana (ms) | P95 (ms) |
| --- | ---: | ---: |
| 640×360 | 2,1 | 4,0 |
| 905×644 | 2,3 | 5,7 |
| 1280×720 | 2,4 | 5,4 |
| 1920×1080 | 1,4 | 3,8 |

Os caches permaneceram nos limites existentes: até 96 blocos de terreno e 3,25 MiB de parallax. Isso mede custo de desenho, não FPS de uma partida nem desempenho garantido em celular.

### 18.5 Arquivos e ponto de parada

Produção desta etapa: somente `src/maps/08-dns.js`. Validação: `tests/dns-v3.js`, `tools/test_dns_v3.py`, `tools/dns_v3_contract.py`, fixture e relatórios DNS, contratos de arquitetura/campanha/infraestrutura e quatro verificadores Python. Documentação: este arquivo. Alterações anteriores foram preservadas; o motor, o Modo Desenvolvedor, as demais fases e o manifesto não foram alterados nesta etapa.

**PARE AQUI:** fase 8. Sem reconstruir fases 9–10 e sem push ou merge. Pendentes: duração e balanceamento em partida humana contínua e teste em aparelhos físicos.
