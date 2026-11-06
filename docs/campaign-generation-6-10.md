# Geração híbrida — fases 6 a 10

Cada fase foi integrada ao compositor existente e testada antes da alteração da fase seguinte. As cinco receitas usam seeds fixas e blueprints próprios, com acréscimos procedurais de exploração. A geometria não muda durante respawn ou reload. O modelo continua sendo o da etapa anterior: macroarquitetura autoral com rotas adicionais geradas, sem sortear a topologia inteira.

| Fase | Arquitetura e acréscimos | Arquivo integrado | Teste isolado aprovado |
| --- | --- | --- | --- |
| 6 — Cabeamento | Prédio de 1.600 × 3.000, andares, shafts, três elevadores reparáveis, dutos oeste/leste; rota adicional de manutenção no subsolo leste e travessia entre shafts | `src/maps/06-cabling.js` | `python tests/run_review.py --phase 6` |
| 7 — DHCP | Hub de distribuição, quatro setores de sub-redes, concessões, reserva obrigatória e gateways; varanda de atribuição de IP e região de conflito que reduz movimento até o reparo | `src/maps/07-dhcp.js` | `python tests/run_review.py --phase 7` |
| 8 — DNS | Labirinto .com/.org, mail.com/api.org, NXDOMAIN, cache e retornos à raiz; caminho de manutenção TTL e portal bidirecional raiz/arquivo após reparar o cache | `src/maps/08-dns.js` | `python tests/run_review.py --phase 8` |
| 9 — Firewall | Fortaleza, muralhas, anéis de segurança, câmeras, lasers, combates e cidadela; duto alternativo de infiltração pelo setor oeste | `src/maps/09-firewall.js` | `python tests/run_review.py --phase 9` |
| 10 — Servidores | Data center de 6.800 × 2.000, duas torres, backbone de combate, fibra óptica, quatro relays e airlock; caminhos adicionais de fibra redundante e manutenção, antes da arena | `src/maps/10-servers.js` | `python tests/run_review.py --phase 10` |

Seeds: `building-shafts-v3`, `subnet-distribution-v3`, `domain-labyrinth-v3`, `digital-fortress-v3` e `datacenter-exploration-v3`.

Os testes isolados verificaram carregamento/renderização, câmera, posicionamento de objetos, acesso às plataformas, reparos com resolução real dos controles dos minigames, coletas, interativos, portais, combate, checkpoints, respawn, save, perguntas obrigatórias e transição/vitória. As travessias usam atributos básicos, sem habilidades opcionais. Os resultados estão em `tests/phase-06-results.json` até `tests/phase-10-results.json`.

O teste da fase 6 identificou uma passarela encoberta pelo duto superior. A passarela foi afastada e o teste repetido com aprovação antes da integração do DHCP.

A regressão identificou uma ativação em cadeia entre o retorno de `.org` e a entrada nova do cache. A entrada foi afastada dos pontos de chegada. O teste específico agora aciona todos os portais DNS e verifica o destino exato, apoio no piso e ausência de sobreposição com paredes; a fase 8 foi testada novamente após a correção.

## Arena manual de VIRUS ZERO

A arena autoral existente foi mantida: piso entre X=4.800 e 6.600 em Y=900, plataformas de combate em alturas definidas manualmente, elevador aéreo, duas coberturas e checkpoint em (5.000, 900). As coberturas têm 74 e 86 pixels de altura, abaixo do salto básico de aproximadamente 129 pixels. A subida às plataformas elevadas usa degraus intermediários; a travessia real da fase 10 verifica todas as plataformas com os atributos básicos.

A revisão manual incluiu a definição de colisões e a inspeção das capturas `tests/snapshots/phase-10-structure.png` e `tests/snapshots/phase-10-boss-protected.png`, conferindo a separação do airlock, o piso elevado, as plataformas de combate e a área livre em torno do chefe.

O setor à direita de X=4.800 é reservado à geometria manual. Plataformas e cenários adicionados pelo gerador não podem cruzar esse limite, inclusive considerando a largura. Elevadores adicionais passam pela mesma verificação. Mecânicas procedurais adicionais são rejeitadas nesta receita para preservar as condições de combate. A entrada com quatro relays, os limites/atributos do chefe, a região de ativação, as coberturas, o checkpoint, a saída e `completion: boss-question` são comparados com o original.

`tests/infrastructure-generation.js` recompila cinco seeds e exige que a arena continue idêntica. Também tenta inserir plataforma, elevador, cenário e mecânica indevidos e verifica a rejeição. A baseline autoral completa, capturada antes da integração, está em `tests/fixtures/last-five-v2.json`.

`game.js`, `src/engine/enemies.js` e os motores de reparo permanecem byte a byte iguais aos do início desta etapa. A verificação usa `tests/fixtures/preserved-campaign-systems.json`, que também protege os módulos das fases 1–5.

A regressão completa inclui os testes existentes de escudo, três etapas do chefe, limiares de vida, proteção durante transições, impacto, investida, rajada, pilares, combo, invocações, avisos, esquivas com movimento básico, interrupção por cobertura, janela de vulnerabilidade, limpeza após a morte e pergunta final obrigatória. O projeto manual do combate permanece descrito em `tests/FASE10.md`.

## Arquivos compartilhados alterados nesta etapa

- `src/generation/campaign.js`: cinco configurações novas, cenários/mecânicas adicionais, proteção da arena e preservação da conclusão por chefe e dos rótulos de setores.
- `tests/run_review.py`: testes isolados até a fase 10, fixture das cinco plantas anteriores e modo `--infrastructure-generation`.
- `tests/campaign-generation.js`: reprodução e validação das dez receitas.
- `tests/infrastructure-generation.js`: preservação dos conteúdos/checkpoints, arena manual, rejeição de invasões, conflito DHCP e atalhos DNS.
- `tests/architecture.js` e `tests/generation.js`: contratos atualizados para dez mapas híbridos de revisão 3.
- `tools/check_generation.py`: proteção dos blueprints, motores, módulos anteriores e manifesto da campanha.
- `tools/build_last_five.py`: exporta as definições com a chamada de compilação híbrida.
- Fixtures novas: `tests/fixtures/last-five-v2.json` e `tests/fixtures/preserved-campaign-systems.json`.
- Relatórios/capturas: `tests/phase-06-results.json` a `tests/phase-10-results.json`, `tests/infrastructure-generation-results.json`, `tests/review-results.json`, galeria e capturas em `tests/snapshots/`.

Revisão dos mapas: 3. O runtime existente reinicia coordenadas e estado local de saves da planta antiga, mantendo XP, nível e habilidades. Saves das fases 1–5 continuam na revisão anterior desta integração, sem mudança de geometria.

Comandos adicionais executados: `python tools/check_maps.py`, `python tools/check_generation.py`, `python tests/run_review.py --infrastructure-generation`, `python tests/run_review.py --campaign-generation`, `python tests/run_review.py` e `git diff --check`.

Limites da validação: os testes gerais de travessia reposicionam o jogador entre arestas comprovadas e usam proteção contra dano para isolar acesso e funcionamento. Os testes específicos de esquiva do chefe usam dano ativo. Não foi realizada uma partida humana contínua para medir o equilíbrio subjetivo de dificuldade.

Resultado final: 10 fases verificadas, 119/119 verifica??es de sistemas aprovadas, 71 capturas, zero erros de runtime e nenhuma falha. O fingerprint do relat?rio corresponde ao c?digo final.
