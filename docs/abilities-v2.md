# Habilidades V2

Todas as habilidades normais têm três ranks. A seleção mantém três opções distintas: novas habilidades, upgrades e, quando faltam upgrades, registros de serviço sem efeito de combate. Mesmo com tudo no limite, a escolha termina normalmente e salva o registro escolhido. Registros não concedem cura, invulnerabilidade ou atributos permanentes.

A seleção aceita somente o ID e o nível de uma das três opções exibidas. Após escolher, a oferta é invalidada para impedir reaproveitamento. Os registros usam mensagens próprias de recompensa na interface, sem anunciar uma habilidade de combate.

| Habilidade | Benefício e limite |
| --- | --- |
| Tiro de precisão | +1 de dano a cada 6/5/4 impactos básicos em alvos vulneráveis; pelo menos 1,5 s entre bônus. Não beneficia o especial. |
| Sobrecarga de energia | K: dano 3, preparação de 0,28 s, até dois alvos distintos. Custa 25 de energia; recarga de 5,4/5,04/4,8 s; sem upgrade, 6 s. |
| Escudo de pulso | Q: proteção de 0,45/0,55/0,65 s, custa 50 de energia e tem recarga de 16 s. Exige acionamento novo; segurar não repete. |
| Esquiva lateral | L: impulso terrestre a 1,6× a velocidade normal por 0,12/0,14/0,16 s, recarga de 5 s, sem invulnerabilidade. Exige apoio contínuo, cancela em bordas, no ar e ao saltar; usa as colisões existentes. |
| Recuperação | H: cura 20; capacidade total de 2/3/4 usos por campanha, com 20 s entre usos. Aprimorar amplia a capacidade em um, preservando todos os gastos anteriores. Não gasta em integridade cheia. |
| Estabilizador | Intervalo básico reduzido em 7,5/12/15% e velocidade básica aumentada em 7,5/12/15%. Não acelera a recarga do especial. |
| Reparo eficiente | +1/2/3 dicas por tentativa e +0/1/1 verificações. Sem aumento de dano. |
| Armadura leve | Opção defensiva preservada: redução de aproximadamente 10/16/20%. |

O ataque básico continua com dano 1. No máximo do Estabilizador, seu intervalo é de 0,272 s (aproximadamente 3,68 tiros/s). O bônus de precisão é condicionado às janelas de vulnerabilidade, evitando multiplicadores permanentes grandes. Os modificadores ambientais continuam aplicados ao disparo e à mobilidade; não há alteração na vida dos inimigos ou na força básica do salto.

## Migração explícita

O envelope da campanha continua v1 e passa a incluir `skillSchema: 2`, `skillState` e `serviceRewards`. Os IDs antigos continuam estáveis para não perder upgrades:

| ID persistido | Nome novo |
| --- | --- |
| `cannon` | Sobrecarga de energia |
| `shield` | Escudo de pulso |
| `boost` | Esquiva lateral |
| `rapid` | Estabilizador |
| `recovery`, `repair`, `armor` | Recuperação, Reparo eficiente, Armadura leve |

Saves sem schema 2 convertem os ranks antigos 1/2/3/4/5 em 1/2/2/3/3, preservando a posição relativa da progressão e o teto de três ranks. Duplicatas usam o maior rank; entradas desconhecidas ou inválidas são descartadas. Saves com schema 2 apenas normalizam os ranks; a conversão nunca se repete. Nomes e descrições são reconstruídos pelo catálogo atual. A campanha é salva já migrada ao continuar; nível, XP e objetivos seguem preservados.

O estado guarda recargas, energia especial e cargas de recuperação gastas. K custa 25 e Q custa 50 de uma reserva compartilhada de 100 por fase; não há regeneração. Energia e cargas gastas sobrevivem a pausa, morte, retry e save/load; nova fase recebe uma reserva nova, e saves antigos recebem 100 uma única vez. Atividades temporárias (pulso e esquiva) não voltam ativas após carregar. Reaplicar atributos ou selecionar upgrades não cura, não recarrega e não devolve recursos.

## Testes

`python tests/run_review.py --abilities-v2 --result-label abilities-v2`

Repetir com `--viewport 390x844 --result-label abilities-v2-mobile` para controles por toque. A suíte executa limites de atributos, escudo manual, cura finita, restrições da esquiva, precisão nos projéteis reais, migração idempotente, persistência de custos, três escolhas, fallback e benefícios dos reparos. Também inclui as regressões existentes dos inimigos, de VIRUS ZERO, da seleção de nível e dos checkpoints finais. Eventos de teclado/toque são despachados no DOM em Chrome isolado; equilíbrio em uma sessão humana prolongada continua fora dessa verificação automatizada.
