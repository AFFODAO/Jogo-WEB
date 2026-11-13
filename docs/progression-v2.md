# Progressão e equilíbrio de XP — Combat V2

## Curva e cenários

O custo para sair do nível L é `400 + 150 × (L − 1) + 30 × (L − 1)²`.
Cada nível concede uma escolha; não há crescimento automático de dano, vida ou salto.
Uma campanha nova termina com 9 escolhas no caminho obrigatório, 10 no cenário normal
ou 11 na exploração completa. Há 24 aprimoramentos possíveis (8 habilidades × 3 níveis),
portanto a campanha não esgota o catálogo. A curva anterior permitia chegar ao nível 34.

Normal significa cumprir os objetivos obrigatórios e coletar metade dos fragmentos,
arredondada para baixo, sem buscar os depósitos opcionais. É uma hipótese reproduzível,
não uma medição de comportamento humano. Completa inclui todos os inimigos, reparos,
fragmentos, depósitos e bônus de objetivos. Os níveis abaixo são acumulados desde a fase 1.

| Fase | Inimigos XP | Reparos XP | Fragmentos XP | Objetivos XP | Depósitos XP | XP completo | XP normal | Nível obrigatório | Nível normal | Nível completo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 690 | 120 | 520 | 300 | 40 | 1670 | 1370 | 3 | 3 | 3 |
| 2 | 855 | 150 | 500 | 300 | 40 | 1845 | 1545 | 4 | 4 | 5 |
| 3 | 985 | 180 | 1060 | 300 | 8 | 2533 | 1985 | 5 | 6 | 6 |
| 4 | 1145 | 180 | 800 | 300 | 40 | 2465 | 2025 | 6 | 7 | 7 |
| 5 | 1210 | 180 | 780 | 300 | 16 | 2486 | 2070 | 7 | 8 | 8 |
| 6 | 1875 | 210 | 1080 | 300 | 44 | 3509 | 2925 | 8 | 9 | 9 |
| 7 | 1215 | 180 | 760 | 300 | 80 | 2535 | 2075 | 8 | 9 | 10 |
| 8 | 1490 | 210 | 1120 | 200 | 108 | 3128 | 2080 | 9 | 10 | 11 |
| 9 | 1525 | 240 | 800 | 300 | 116 | 2981 | 2465 | 9 | 10 | 11 |
| 10 | 2360 | 360 | 1140 | 300 | 116 | 4276 | 3580 | 10 | 11 | 12 |

## Poder e variedade

Todas as habilidades de combate desbloqueadas podem ficar equipadas juntas. Reparo
eficiente funciona como utilidade independente. O botão EQUIPAMENTO permite equipar ou
desequipar habilidades enquanto o jogo está pausado, sem reparo aberto e sem inimigos
próximos. Trocar não cura, não devolve cargas e não reinicia recargas.

Estabilizador e Armadura usam potência 1,5 / 2,4 / 3: ganhos marginais de 1,5 / 0,9 / 0,6.
O bônus máximo de velocidade continua em 15% e a redução máxima de dano em 20%.
Ataques fortes, escudo, esquiva e recuperação mantêm suas recargas e limites de uso.
Combinações ofensivas, defensivas e de mobilidade continuam respeitando os limites
individuais de potência, recarga, cargas e proteção.
Disparo básico, especial sem aprimoramento e salto continuam disponíveis sem desbloqueios.
Nenhum objetivo exige uma habilidade opcional.

Cada fonte de XP usa uma chave persistente por fase e entidade. Reiniciar, morrer,
carregar ou repetir uma fase não paga novamente. Criaturas invocadas não dão XP.
Recompensas sem uma chave de origem válida são recusadas, assim como valores
fracionários, negativos ou não finitos; novas fontes precisam identificar sua origem.
A seleção consome XP antes de abrir e aceita apenas a oferta vigente. Ao esgotar os
aprimoramentos, registros de serviço substituem escolhas sem gerar atributos ou XP.

## Saves existentes

O schema de progressão 2 preserva nível, XP e habilidades desbloqueadas. A migração
preserva a lista equipada no save e permite equipar as habilidades restantes pela
interface. Fontes já concluídas são marcadas; fases anteriores usam uma marca de fase
inteira para evitar duplicação onde o save antigo não guardava o histórico de entidades.
A migração de níveis de habilidades segue o schema 2 descrito em abilities-v2.md.

## Validação reproduzível

`python tests/run_review.py --progression-v2 --result-label progression-v2`

`python tests/run_review.py --progression-v2 --viewport 390x844 --result-label progression-v2-mobile`

A suíte audita os inventários das dez fases, concede as recompensas reais de exploração,
compara níveis com a projeção, tenta repetir todas as fontes, verifica migração idempotente,
trocas e limites de equipamento, custos preservados e fallback finito. Também derrota os
inimigos com dano básico e verifica os objetivos sem habilidades opcionais nas dez fases.
Isso valida os requisitos de combate e objetivos; não substitui uma travessia humana completa.
Os relatórios JSON incluem os resultados e a impressão digital do código executado.

Os três percursos (obrigatório, normal e completo) são executados com concessões reais
de XP nas dez fases, além da projeção matemática. Os percursos obrigatório e normal
salvam e restauram o progresso após cada fase e tentam receber novamente o bônus de
saída. O teste confirma respectivamente 9, 10 e 11 escolhas ao final da campanha.
Validação concluída em desktop e em 390 × 844: 27 verificações aprovadas por execução,
sem erros do jogo, incluindo equipamento, reserva, migração e objetivos sem habilidades.
