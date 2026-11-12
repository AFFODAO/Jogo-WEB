# Fase 6 — reparos de cabeamento

Quatro tarefas físicas em pixel art substituem as mecânicas antigas. Os sete IDs de objetivos, sua ordem e a integração com a campanha permanecem preservados.

| Objetivo existente | Tarefa |
| --- | --- |
| `roof-controls:antenna` | Alinhamento de fibra: mover dois núcleos e travar o acoplador |
| `upper-hub:distribution` | Emenda de cabo: desencapar, alinhar, prensar e isolar |
| `shaft-west-mid:motor` | Teste de continuidade com uma ruptura |
| `maintenance-west:service` | Crimpagem RJ45 no padrão T568A |
| `central-main:patch` | Emenda do cabo central |
| `central-east:trunk` | Crimpagem RJ45 no padrão T568B |
| `basement-power:power` | Teste de continuidade com duas rupturas |

Na crimpagem, os oito fios possuem cores e listras distintas e podem ser arrastados individualmente. O gabarito mostra o padrão exigido e a ordem dos contatos. Pinos incorretos rejeitam fios. O alicate usa movimento de aperto; a animação dos contatos termina antes da confirmação do reparo. As pinagens seguem a documentação da [Fluke Networks](https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs).

Na emenda, o desencapador é levado a cada extremidade. A retirada das capas tem duração própria; os condutores só ficam disponíveis depois que ambas as pontas estão expostas. Quatro cores precisam corresponder antes de fechar a prensa. A união e a restauração da manga isolante são animadas.

O acoplador óptico tem dois carros verticais independentes, com controles de arraste e teclado. O feixe acompanha a posição de cada núcleo durante o movimento. Apenas o alinhamento dos dois núcleos à marca central produz 100% de sinal e permite travar o conjunto.

O testador exige duas pontas conectadas às extremidades corretas. A varredura acende os oito LEDs em sequência, revela as rupturas e libera a ferramenta de emenda. Condutores íntegros rejeitam reparos. O jogador precisa executar uma nova varredura após reparar: a tarefa termina somente com oito LEDs verdes.

Os modelos não gravam saves nem emitem recompensas. A campanha mantém a transição `playing → won → success`, a restauração da integridade, os eventos, o XP, os objetivos e o salvamento existentes.

Validação:

- `python tests/run_review.py --cabling-repairs --result-label cabling-minigames-campaign`: 120 variações, pinagens A/B, bloqueios de sequência, isolamento, alinhamento óptico, diagnóstico, novo teste obrigatório, sete reparos com XP e saves, pausa, cancelamento, falha e nova tentativa.
- `python tests/run_cabling_minigames_ui.py`: sete objetivos com mouse, toque emulado e teclado; fios e ferramentas arrastáveis, aperto do alicate, movimento vertical das fibras, rejeições, animações, alvos de toque, responsividade e armazenamento isolado. Evidências em `tests/cabling-minigames-gallery/`.

O toque é emulado no Chrome; aparelhos físicos não são cobertos.
