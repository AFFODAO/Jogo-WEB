# BYTE RUNNER — auditoria final de combate V2

Status: V2 implementado e validado em Chrome isolado em 13/11/2026. Interface e instruções para o jogador permanecem em pt-BR. Esta auditoria descreve os valores do código atual; os testes não alteram atributos de inimigos ou dano.

## Fórmulas: versão anterior e V2

| Sistema | Anterior | V2 implementado |
| --- | --- | --- |
| Ataque básico | Dano `1 + rank(Canhão)`; intervalo `0,32 × 0,9^rank(Cadência)` (até 6 de dano e 0,189 s no rank 5), máximo nominal ≈31,75 DPS. | Dano 1; intervalo `0,32 × (1 − 0,05 × potência(Cadência))`, potência limitada a 3: 0,296/0,2816/0,272 s nos ranks 1/2/3. Nominal: 3,125 a 3,676 DPS antes de ambiente, alcance e acertos (17,6% acima do básico). |
| Especial | Canhão aumentava o dano básico; sem reserva de energia compartilhada. | K prepara 0,28 s, causa 3 por alvo, acerta até 2 alvos distintos; custa 25 de 100 de energia e tem recarga `6 − 0,4 × potência(Canhão)` = 5,4/5,04/4,8 s. No máximo quatro disparos por fase se não usar escudos. |
| Armadura | `10% × rank`, teto de 50%. | `min(20%, potência(Armadura) × 20% / 3)`: 10/16/20% nos ranks 1/2/3. Dano recebido positivo é limitado a 1 HP por evento; dano não positivo/inválido é ignorado. |
| Escudo | Automático, 5–8 s de duração e recarga de 18–14 s, conforme rank. | Q ativa proteção por `0,35 + 0,1 × rank` = 0,45/0,55/0,65 s; recarga 16 s e custo 50 de energia. Dois usos por fase, ou menos se houver disparos K. Sem reativação automática. |
| Esquiva | Impulso e duração maiores por rank, com proteção implícita em alguns fluxos antigos. | L: velocidade terrestre 1,6× por 0,12/0,14/0,16 s, recarga 5 s, sem invulnerabilidade. |
| Cura | Recuperação escalava `20 + 5 × rank` HP (até 45 HP) e retry devolvia 100 HP sem restaurar o encontro ativo. | H cura 20 HP; capacidade total `1 + rank` (2/3/4), intervalo 20 s; cargas gastas persistem em retry e save. Não cura acima do máximo. |
| XP | Custo legado por nível `100 + 45n`, onde `n = nível − 1`; avanço de nível podia ampliar combate sem teto de slots/equipamento. | `400 + 150n + 30n²`; recompensas de habilidades e limites de equipamento seguem o catálogo v2. XP não recarrega energia nem cura. |

O intervalo final também recebe o modificador ambiental. O especial não acelera o básico e seu dano não recebe o bônus de Precisão. A Precisão concede +1 em acerto básico vulnerável a cada 6/5/4 impactos, com pelo menos 1,5 s entre bônus. O Estabilizador reduz o intervalo básico em até 15% (potência limitada a 3); o cálculo de DPS acima usa a cadência derivada de `rapid` conforme o código, antes dos modificadores de fase. Arredondamento e limiares de HP fazem o DPS efetivo contra um inimigo variar.

Armadura v2 é limitada a 20% no cálculo do jogador. `damagePlayer` mantém 1 s de proteção após um acerto; escudo e proteção de impacto são janelas separadas, e não podem ser ativadas durante essa proteção. Energia é compartilhada entre K e Q, fica salva, não regenera, não é devolvida por pausa, morte, retry ou migração, e só volta a 100 na entrada de outra fase. Saves anteriores sem campo de energia recebem 100 uma única vez quando carregados; saves v2 preservam o valor salvo.

## Habilidades e progressão

- Três slots de combate, ranks limitados a 3 e habilidades de utilidade/Reparo fora dos slots de combate.
- Escudo, esquiva e recuperação são ações manuais; segurar uma tecla não repete a ativação. Os comandos podem ser remapeados sem colisão com movimento, ataque, interação ou entre si; toque tem botões equivalentes.
- A recuperação tem cargas finitas e gastos persistentes. Aquisição, troca, retry e migração não concedem cura.
- As escolhas de habilidade validam a opção apresentada e conservam alternativas válidas quando não há melhoria de combate disponível. Não é necessário selecionar habilidade opcional para vencer.
- A curva de XP permanece `400 + 150n + 30n²`. A progressão por marcos oferece os limites v2 sem exigir habilidades opcionais.

## Inimigos e chefe

Perfis-base de HP: rápido 1, básico/voador 2, atirador/parasita 3 e blindado 7; VIRUS ZERO tem 90 HP no mapa final, com etapas, proteção e janelas de exposição. Estimativa de TTK pontual de tiros básicos sem armadura, sem atraso de projétil e sem movimento: rápido 0 s (um tiro), básico/voador 0,32 s, atirador/parasita 0,64 s e blindado 1,92 s. Esses valores são limiares matemáticos, não tempo de encontro medido. TTK real depende de cobertura, orientação, vulnerabilidade, distância e modificadores.

Projéteis verificam geometria sólida no caminho; ataques de inimigo mantêm avisos visuais antes de causar dano. A avaliação de VIRUS ZERO deve incluir todas as seis configurações abaixo e não pressupõe escudo, cura ou habilidade opcional obrigatória.

## Builds exigidas e resultados

| Build | Configuração usada |
| --- | --- |
| Base, sem habilidade | Nenhuma habilidade equipada; ataque básico, salto e reserva base de energia. |
| Progressão típica | Canhão 1, Estabilizador 1 e Armadura 1. |
| Ofensiva máxima legal | Precisão 3, Canhão 3 e Estabilizador 3. |
| Defensiva máxima legal | Armadura 3, Escudo 3 e Recuperação 3. |
| Mobilidade | Esquiva 3, Estabilizador 1 e Armadura 1. |
| Reparo | Reparo eficiente 3, sem habilidades de combate. |

Resultados executados com `tests/boss-balance.js` em Chrome isolado. Todas derrotaram VIRUS ZERO:

| Build | Duração | Dano recebido | Integridade final | Ações usadas |
| --- | ---: | ---: | ---: | --- |
| Base | 25,75 s | 44 | 56 | — |
| Progressão típica | 24,88 s | 41 | 59 | — |
| Ofensiva máxima | 19,42 s | 30 | 70 | — |
| Defensiva máxima | 26,20 s | 25 | 88 | 1 escudo, 1 cura |
| Mobilidade | 24,42 s | 0 | 100 | 2 esquivas |
| Reparo | 25,75 s | 44 | 56 | — |

Os três checks de chefe passaram, incluindo transições, avisos e reforços limitados.

## Suites e escopo da validação

Foram executados: suítes existentes; testes automatizados de combate; progressão completa pelas dez fases; testes de chefe com as seis builds; layouts desktop e toque. Os relatórios JSON em `tests/*-results.json` são a fonte dos resultados. A simulação automatizada não equivale a uma sessão humana contínua nem a teste em hardware móvel físico.

| Verificação | Resultado |
| --- | --- |
| Suítes existentes | 240/240 sistemas aprovados em 10 fases; 92 capturas; zero erros de runtime |
| Habilidades, combate e inimigos | Habilidades: 31 checks; combate: 28 checks; zero erros de runtime |
| Progressão pelas fases 1–10 | 27 checks aprovados; níveis 10/11/12 nos percursos obrigatório/normal/completo; 9/10/11 escolhas |
| VIRUS ZERO, seis builds | 3 checks aprovados; seis builds derrotaram o chefe em 19,42–26,20 s |
| Desktop e toque | Desktop: 28 checks aprovados; toque 390×844: 12 checks aprovados, zero erros de runtime |

Também foram executados seis checks de Game Over/checkpoint; retry restaura o encontro ativo e conserva consumíveis gastos. A revisão completa confirma layouts, cobertura de paredes, avisos de chefe, saves e progressão sem habilidades opcionais. O percurso utiliza busca instrumentada entre conexões de mapa, não uma travessia humana contínua.

## Riscos e limitações

As lutas são executadas em simulação instrumentada e dependem da estratégia do controlador de teste; duração e dano recebido não representam a média de jogadores. A energia finita reduz a disponibilidade de ações especiais; os mapas e encontros devem continuar concluíveis somente com o ataque básico. A interface de toque automatizada em viewport móvel não substitui validação em aparelho real.
