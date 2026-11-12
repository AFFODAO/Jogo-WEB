# Fase 7 — reparos DHCP

Quatro tarefas em pixel art preservam os seis IDs de objetivos, a ordem dos componentes e as condições de progressão da campanha.

| Objetivo | Tarefa |
| --- | --- |
| `gateway-plaza:gateway` | Intervalo de endereços com exclusão de gateway, reserva e extremos da rede |
| `address-office:scope` | Intervalo para quatro clientes com duas reservas internas |
| `reserve-main:reservation` | Entrega de endereços com reserva vinculada à impressora |
| `central-core:server` | Troca do módulo do servidor e reinício do serviço DHCP |
| `conflict-core:conflict` | Substituição da concessão duplicada sem alterar o titular registrado |
| `distribution-south:relay` | Entrega por sub-rede, incluindo cliente via retransmissor |

Os objetivos de reserva e servidor usam as tarefas correspondentes a suas funções; suas identidades, posições e dependências permanecem intactas. Os identificadores internos de fábrica continuam compatíveis com o catálogo de quarenta tarefas.

## Regras de rede

Na entrega, chips saem do servidor e só aceitam destinos compatíveis. As sub-redes são `192.168.10.0/29` e `192.168.20.0/29`, com gateway `.1`. O endereço `192.168.10.2` já está ocupado e `192.168.10.3` pertence à reserva da impressora. Rede, difusão, sub-rede incorreta, IP ocupado e reserva de outro cliente são rejeitados. A ativação de cada dispositivo tem confirmação animada.

No conflito, PC-A e PC-B exibem o mesmo IP. O registro do servidor confirma o endereço para PC-A; a tarefa exige selecionar a concessão de PC-B e entregar um endereço livre, válido e exclusivo. Os outros clientes e os registros existentes são preservados. A comunicação só é confirmada após a animação.

No reparo do servidor, o jogador precisa desligar a energia antes de abrir a placa, retirar o módulo avariado, instalar a reposição e reconectar memória de concessões, rede de clientes e relógio de validade. O reinício valida concessões, reservas e serviço, com LEDs progressivos. Os registros permanecem intactos.

Na máquina de escopo, dois batentes físicos definem um intervalo contíguo dentro de `10.7.0.0/28`. A máquina exclui rede `.0`, gateway `.1`, difusão `.15` e as reservas mostradas no painel. O intervalo precisa atender a capacidade pedida. Há mais de uma solução válida: a tarefa valida capacidade e exclusões, não uma combinação fixa. As vagas disponíveis acendem em sequência após a liberação.

As regras de seleção por sub-rede, exclusividade de concessões e identidade de cliente seguem os conceitos da [RFC 2131](https://www.rfc-editor.org/rfc/rfc2131.html). Os tempos das animações representam confirmações do jogo, sem executar tráfego real.

## Integração e testes

Os modelos não gravam saves nem concedem recompensas. O fluxo `playing → won → success` mantém a responsabilidade da campanha por integridade, corrupção, eventos, XP, objetivos e salvamento.

- `python tests/run_review.py --dhcp-repairs --result-label dhcp-minigames-campaign`: 120 variações determinísticas, validação de endereços e reservas, proprietário legítimo do IP duplicado, intervalos alternativos, capacidade, segurança da placa e seis reparos completos com XP, saves, pausa, cancelamento, falha e nova tentativa.
- `python tests/run_dhcp_minigames_ui.py`: seis objetivos com mouse, toque emulado e teclado; emissão e entrega dos chips, duplicatas, troca de módulo, circuitos e arraste dos batentes. Também verifica animações, alvos, responsividade e armazenamento isolado. Evidências em `tests/dhcp-minigames-gallery/`.

O toque é emulado no Chrome; aparelhos físicos não são cobertos.
