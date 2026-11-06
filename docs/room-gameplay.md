# Gameplay integrado à geração de salas

A geração de conteúdo usa as salas e certificados físicos existentes. A prévia procedural agora ativa combate, reparos, segredos e recompensas por padrão. A campanha autoral de dez fases, seus saves e a arena manual de VIRUS ZERO continuam preservados.

Para experimentar, abra:

```text
index.html?procedural=meu-mapa&theme=hardware&difficulty=3&rooms=12
```

`theme` aceita `hardware`, `software`, `switch`, `router`, `wifi`, `cabling`, `dhcp`, `dns`, `firewall` e `servers`. A dificuldade pode variar de 1 a 5. Quando omitida, cresce por pares de temas: 1 para Hardware/Software até 5 para Firewall/Servidores. `gameplay=0` mantém a prévia anterior de geometria e sua chave de salvamento.

API integrada:

```javascript
const map = ByteRunner.proceduralMaps.generate({
  gameplay: true, seed: 'meu-mapa', theme: 'wifi',
  difficulty: 3, roomCount: 12, optionalRatio: .4
});
// Também disponível como generateGameplay(options).
const errors = ByteRunner.proceduralMaps.validateGameplay(map);
```

A receita contém configurações e seed suficientes para reproduzir IDs, ordem das entidades, posições e conteúdo. A composição continua pelo `mapGeneration.compile`, usando o gerador local `gameplay-room-v1`.

## Tipos de sala

| Tipo | Conteúdo e regras |
| --- | --- |
| Inicial | Apoio permanente, checkpoint e espaço de entrada sem inimigos |
| Exploração | Caminhos fixos, plataformas móveis e até um inimigo nas dificuldades maiores, respeitando trechos de descanso |
| Parkour | Obstáculos e avisos existentes, com rota fixa certificada; sem pressão adicional de inimigos |
| Combate | Encontros de um a três inimigos, orçamento crescente e combinações adaptadas ao espaço disponível |
| Reparo | Relay com minigame nativo, remoção do teto de manutenção, plataforma restaurada e elevador energizado |
| Recompensa | Caches em apoios reais, porta opcional e elevador ligados ao relay principal; par de atalhos para a sala principal de reparo |
| Secreta | Ramificação opcional, painel BUS que revela uma passarela, recompensa de exploração e risco adicional nas dificuldades maiores |
| Final | Área sem inimigos, região de conclusão, reparos obrigatórios e pergunta obrigatória |

Os reparos da espinha principal são obrigatórios. Há sempre pelo menos um relay obrigatório; quando a espinha é muito curta, o gerador escolhe uma sala de reparo alcançável numa ramificação. Os demais reparos podem ser opcionais. Os segredos e as recompensas permanecem opcionais.

## Inimigos e dificuldade

Cada tema possui um perfil próprio de combinações. Os tipos existentes — básico, rápido, blindado, atirador, voador e parasita — mantêm seus comportamentos, ataques e recompensas. As variantes nativas de arquivo, pacote, Wi-Fi, DNS e Firewall são atribuídas explicitamente. Os sprites de reforços de arquivos também são carregados quando necessários.

O orçamento cresce com a dificuldade e a posição na rota. Tipos com maior custo exigem mais espaço. O gerador prioriza tipos diferentes nas combinações e reduz o encontro quando faltam posições seguras, respeitando o teto de três inimigos. As salas de combate exigem pelo menos um encontro válido. Descanso, reparo, início, final e parkour mantêm sua separação de pressão de combate.

Os candidatos usam pisos ou plataformas fixas já disponíveis, dimensões do inimigo, limites de patrulha, obstáculos, portas, hazards e envelopes das plataformas móveis. Apoios condicionais e temporários ficam fora da seleção. Há reserva de 260 pixels ao escolher posições em relação aos respawns da própria sala e das vizinhas, e uma validação global de pelo menos 220 pixels. A região de ativação evita disparos contra o checkpoint de entrada.

## Reparos, exploração e salvamento

Os relays são posicionados sobre piso permanente, acessível antes do reparo. O validador faz uma resolução progressiva de dependências a partir dos objetivos reais, verificando apoio e corredor de interação. Dependências próprias, ciclos e portas que bloqueiam o reparo necessário são rejeitados. Os reparos alteram geometria e conexões opcionais sem fechar sockets da rota original.

Os minigames vêm de `repairChallenges.forPhase`, incluindo os dez tipos existentes. Não há reparo automático por segurar E. Painéis secretos usam flags nativas; portas, elevadores, plataformas e portais usam as condições já suportadas pelo runtime.

Cada sala conserva seu checkpoint em apoio permanente, incluindo a folga de 38 pixels aplicada pelo respawn atual. A prévia usa checkpoints livres. Morrer preserva os reparos concluídos conforme o runtime existente. As descobertas secretas usam o salvamento de flags existente.

A prévia de gameplay possui chave `byteRunner.rooms.v1:` com seed, tema e opções. A campanha continua em `byteRunner.campaign.v1`; a prévia anterior conserva `byteRunner.procedural.v1:`. Não houve alteração do formato de save, dos arrays persistidos, da física, das habilidades, das perguntas ou dos motores de reparo e de inimigos.

## Arquivos desta etapa

- `src/generation/gameplay.js`: população determinística, perfis, efeitos, receitas e validação.
- `src/generation/demo.js`: ativa o conteúdo na prévia, seleção de tema/dificuldade e isolamento do save.
- `src/engine/visuals.js`: inclui o sprite dos reforços rápidos quando há arquivos temáticos que podem invocá-los.
- `src/engine/art.js`: resolve o material pelo tema do mapa carregado, permitindo prévias temáticas no primeiro slot da campanha com os tilesets corretos.
- `index.html`: carrega a camada de conteúdo após o gerador estrutural.
- `tests/room-gameplay.js`: tipos de sala, temas, dificuldade, falhas de dependência, travessia, combate, recompensas e checkpoints.
- `tests/gameplay-demo.js`: prévia ativa, persistência de reparos/segredos/XP/habilidades, morte, pergunta e progressão.
- `tests/run_review.py`: modos `--room-gameplay` e `--gameplay-demo`, regressão e capturas.
- `tools/check_environment.py`: reconhece a extensão autorizada de ativação da prévia e mantém os guards dos demais sistemas.

Os arquivos dos mapas autorais, dos geradores anteriores, da física, dos minigames e de VIRUS ZERO permanecem intactos nesta etapa.

## Verificações

```powershell
python tests/run_review.py --room-gameplay
python tests/run_review.py --gameplay-demo
python tests/run_review.py
python tools/check_environment.py
python tools/check_generation.py
git diff --check
```

Os testes específicos cobrem trinta combinações de tema/dificuldade, doze sementes com tamanhos de 8 a 24 salas, reprodução determinística, orçamento, variantes temáticas, dez minigames reais e rejeição de reparos autodependentes e respawns inseguros. A travessia física testa os oito tipos de sala, relays, atalhos, painéis secretos, recompensas, elevadores e combate com atributos básicos.

O teste de prévia confirma a persistência de reparos, segredos, XP, habilidades e checkpoint, a preservação do save da campanha, a repetição após resposta errada e a transição à fase autoral seguinte após o acerto.

Resultados: `tests/room-gameplay-results.json`, `tests/gameplay-demo-results.json` e `tests/review-results.json`. As capturas ficam em `tests/room-gameplay-*.png`, reunidas em `tests/room-gameplay-gallery.html`.

Limites: os testes de acesso reposicionam o robô entre arestas comprovadas com a física real; o teste de combate básico usa proteção contra dano. Isso verifica acesso e funcionamento, sem substituir uma partida humana contínua de avaliação da dificuldade. O validador de dependências é conservador e dirigido aos contratos destas salas; não é um solver universal de mapas arbitrários.

Resultado final: 163/163 verifica??es aprovadas na regress?o completa, dez fases verificadas, 89 capturas e zero erros de runtime. Os onze testes de gameplay foram extra?dos desse relat?rio para a entrega espec?fica. Os tr?s testes da pr?via com gameplay e os quatro testes da pr?via anterior tamb?m passaram. O fingerprint do relat?rio completo corresponde ao c?digo final.
