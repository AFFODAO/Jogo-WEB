# Fase 8 — reparos DNS

Quatro tarefas originais em pixel art preservam os sete objetivos, sua ordem, os mapas e as condições de progressão da campanha.

| Objetivo | Tarefa |
| --- | --- |
| `root-core:hints` | Reparo da árvore DNS, começando pela raiz |
| `com-records:records` | Conexão dos nomes aos registros A de `example.com` |
| `com-zone:delegation` | Reparo dos vínculos entre raiz, topo e autoridades |
| `org-records:records` | Conexão dos registros A e CNAME de `example.org` |
| `cache-crown:ttl` | Troca de cartuchos com registros expirados |
| `cache-terminal:recursive` | Rastreamento de `portal.example.com` |
| `resolve-core:resolution` | Rastreamento de `arquivos.example.org` |

## Mecânicas

Na conexão de domínios, o painel mostra nome, tipo e valor dos registros autoritativos. Cada cabo é arrastado até um nó de IP. Um CNAME segue o nome de destino até seu registro A; dois nomes podem usar o mesmo IP. Destinos incorretos são rejeitados, e a confirmação aguarda a consulta e a resposta animadas. O resolvedor de registros também interrompe ciclos de aliases.

Na árvore DNS, servidores são encaixados nas posições correspondentes às zonas: raiz `.`, domínios de topo `.com` e `.org`, e autoridades `example.com` e `example.org`. O pai precisa estar instalado antes do filho. Os enlaces crescem entre os nós e acendem seus indicadores após a instalação.

No cache, os cartuchos exibem o TTL restante calculado a partir de TTL original, instante de armazenamento e instante de referência da auditoria. Os dois registros expirados podem ser retirados; os dois registros ainda válidos são preservados. A reposição exige o mesmo nome e tipo, TTL positivo e origem autoritativa. Depois da troca, uma varredura estabiliza a memória. O instante da auditoria fica congelado durante o reparo para manter o diagnóstico consistente.

No rastreamento, cada comporta seleciona o próximo servidor. A consulta sai do resolvedor, chega ao servidor e retorna ao resolvedor antes de avançar. Raiz e domínio de topo fornecem referências; somente a autoridade da zona fornece a resposta final. Um destino incorreto devolve a consulta sem avançar. As duas variantes seguem delegações `.com` e `.org` diferentes.

Os conceitos de registros, aliases, delegação, TTL e resolução iterativa seguem a [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html). As animações representam as trocas do jogo; não executam tráfego DNS real.

## Integração e validação

Os modelos não gravam saves nem concedem recompensas. A transição `playing → won → success` mantém o fluxo existente da campanha para integridade, corrupção, eventos, XP, objetivos e salvamento.

- `python tests/run_review.py --dns-repairs --result-label dns-minigames-campaign`: 120 variações determinísticas, aliases e ciclos, IP compartilhado, vínculos pai-filho, aritmética de TTL, preservação do cache válido, retorno de referências e resposta autoritativa; sete reparos com XP, saves, pausa, cancelamento, falha e nova tentativa.
- `python tests/run_dns_minigames_ui.py`: sete objetivos com mouse, toque emulado e teclado; cabos e servidores arrastáveis, cartuchos expirados, comportas, rejeições, confirmação animada, alvos de toque, responsividade e armazenamento isolado. Evidências em `tests/dns-minigames-gallery/`.

O toque é emulado no Chrome; aparelhos físicos não são cobertos.
