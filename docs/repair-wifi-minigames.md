# Fase 5 — reparos Wi-Fi

Quatro tarefas originais usam equipamentos em pixel art e controles integrados ao cenário. Os IDs, a ordem dos objetivos, os mapas e o fluxo de reparos da campanha permanecem preservados.

| Objetivo existente | Nova tarefa |
| --- | --- |
| `main-array:uplink` | Alinhamento da antena: arrastar o prato, orientar o feixe e travar a recepção |
| `repeater-west:west` | Posicionamento de repetidores e cobertura das zonas A, B e C |
| `repeater-east:east` | Reconstrução da cadeia leste com dispositivos reposicionáveis |
| `noise-center:spectrum` | Limpeza de três interferências com filtros de rejeição |
| `transmit-west:carrier` | Calibração física de potência e ventilação do transmissor |
| `base-west:association` | Limpeza do espectro e estabilização do enlace da estação-base |

A antena gira por arraste angular em uma volta completa; teclado e cliques oferecem os mesmos ajustes. Ondas animadas acompanham sua direção. O receptor indica o destino do feixe, e a confirmação exige alinhamento e estabilização.

No espectro, filtros podem ser aplicados em qualquer ordem aos picos de ruído. O sinal útil e as faixas livres rejeitam os filtros. Os picos filtrados desaparecem gradualmente antes da confirmação da transmissão.

O mapa calcula a cadeia de repetidores por distância: alcance entre dispositivos de 205 unidades e raio de cobertura de 145 unidades. Apenas dispositivos conectados à origem cobrem zonas. Bases obstruídas ou ocupadas rejeitam dispositivos; todos os repetidores podem ser reposicionados antes da confirmação. Os círculos correspondem ao raio usado pelas regras.

O transmissor possui seletores giratórios de potência e ventilação, um osciloscópio, indicadores de força de sinal e temperatura e uma ventoinha animada. A calibração exige força de sinal de pelo menos 90% e temperatura de até 60 °C durante a estabilização. Os instrumentos não são controles deslizantes.

Os modelos não gravam saves nem concedem recompensas. A transição existente `playing → won → success` mantém a responsabilidade da campanha por integridade, corrupção, eventos, XP, objetivos e salvamento.

Validação:

- `python tests/run_wifi_minigames_ui.py`: seis objetivos com mouse, toque emulado e teclado; arraste angular da antena e do seletor de potência; bloqueios, pausa, animações, dimensões dos alvos, responsividade e armazenamento isolado. Evidências em `tests/wifi-minigames-gallery/`.
- `python tests/run_review.py --wifi-repairs --result-label wifi-minigames-campaign`: 120 variações determinísticas, cobertura geométrica, reposicionamento, proteção do sinal útil, segurança térmica e integração completa dos seis reparos com XP, saves, pausa, cancelamento, falha e nova tentativa.

O toque é emulado no Chrome; aparelhos físicos não são cobertos.
