# Parte 3 — Geometria e parkour jogáveis no Hardware

## Abrir

Use `index.html?procedural=pcb-alpha&rooms=12&difficulty=3&optional=0.4`. O parâmetro `difficulty` aceita 1–5. As seeds `pcb-beta` e `pcb-gamma` oferecem outras estruturas. A campanha sem parâmetros continua original; os dez arquivos de mapa e `campaign.js` permanecem intactos. As fases 2–10 não recebem novos perigos ou plataformas.

## Geometria

O plugin agora é `playable-hardware-v2`: células 768×768, piso principal em y=720, mantendo encaixes horizontais e verticais do grafo. A revisão do mapa passa a 2. Há áreas abertas de entrada/saída, andares escalonados, plataformas suspensas alternadas, torres com elevadores, poços de até 480px entre a rota alta e o piso, silhuetas irregulares, túneis com teto baixo e saltos centrais de precisão. Os poços têm apoios e rotas fixas para voltar; não são quedas cegas obrigatórias.

As bordas de ligação ficam livres. Nas aberturas verticais, degraus de 96px permitem subir e descer entre as células. Os vãos obrigatórios usam apoio central permanente, largo nas salas simples e com 72px nas avançadas. Quando não existe ligação inferior, um piso de recuperação permite sair de um salto errado; alguns recebem eletricidade cíclica. As placas indicam a rota fixa e o acesso ao andar inferior antes da queda.

O caminho principal progride de desafios simples para intermediários e avançados, limitados pela dificuldade selecionada. Há descanso a cada terceiro setor principal, além das salas inicial, final e de manutenção. Arestas, apoios, distribuição de cômodos e tipos de plataformas mudam a geometria de colisão, não apenas a apresentação.

## Física e validação

`src/engine/platform-physics.js` concentra os mesmos valores usados pelo jogador e pelo gerador: velocidade 255px/s, impulso 690px/s, gravidade 1850px/s² e corpo 34×48. As fórmulas são:

```
altura = impulso² / (2 × gravidade)                  ≈ 128,68px
tempo ao mesmo nível = 2 × impulso / gravidade      ≈ 0,746s
alcance horizontal = velocidade × tempo             ≈ 190,22px
tempo até um nível Δy = (impulso + √(impulso² + 2gΔy)) / g
```

`canReach()` considera os intervalos ocupáveis pelo corpo e reserva 6px em cada borda de pouso, com fator horizontal de segurança .82. Não utiliza impulso, velocidade ou altura aumentados por habilidades. O `game.js` lê essas constantes, sem mudar os números usados pelas fases originais.

`src/generation/parkour-validation.js` verifica certificados de saltos em ambos os sentidos, subidas fixas, trajetórias completas das plataformas móveis contra paredes, velocidade dos elevadores, temporização e apoio permanente nos checkpoints. A zona de segurança inclui o deslocamento de +38px aplicado pelo respawn atual. A geometria inteira ainda passa pelas validações de sala, compositor, grafo e mapa.

Os caminhos obrigatórios são construídos com apoios fixos. Elevadores, plataformas móveis/temporárias/cadentes oferecem alternativas; nenhuma delas é necessária para sair de uma sala ou voltar ao checkpoint. O teste físico remove todas essas superfícies transitórias antes de buscar a rota. Os certificados analíticos são específicos desses modelos de sala; não são um solver genérico de colisões para qualquer geometria criada por terceiros.

## Plataformas e perigos

- Horizontais e elevadores verticais reutilizam o movimento senoidal e o transporte do motor. Os envelopes são limitados para não tocar paredes nem batentes.
- Temporárias reutilizam o temporizador existente; duram 2,2s ou 1,3s, retornam em 2,5s e aguardam se o corpo do jogador ocupa seu espaço.
- Cadentes usam `src/engine/falling-platforms.js`: aviso de 0,7s, queda acelerada até 224px, desaparecimento e retorno após 2,5s. Permanecem atualizando fora da câmera e aguardam espaço livre antes de voltar. O estado fica no `platformRuntime` já existente; morrer reinicia esses estados, como nas temporárias.
- `src/content/parkour.js` registra lasers e eletricidade. Há aviso visual de 0,8s antes do dano, período ativo curto e uma janela segura superior ao tempo do salto. Lasers são regiões de dano atravessáveis, sem paredes invisíveis. O dano usa as mesmas proteções e regras do combate. As marcas são desenhadas com pixels e os avisos continuam visíveis com efeitos reduzidos.

Os únicos ganchos novos no `game.js` são a leitura da física compartilhada e a integração das cadentes em forma, atualização, transporte, aterrissagem e aviso visual. O desenho de tiles reconhece a superfície cadente com a marca `CAI`. Nenhum controlador de inimigos, XP, reparos ou perguntas foi substituído.

## Salvamento e progressão

A prévia conserva sua chave separada por seed/configuração da Parte 2. A revisão 2 usa a migração já existente: posições, checkpoints e flags de uma geometria antiga reiniciam, mas XP e habilidades permanecem. A campanha original mantém sua própria chave. No mesmo mapa/revisão, continuar restaura normalmente a posição e o progresso.

Chegar à sala final continua abrindo a pergunta obrigatória de Hardware. Errar exige repetir a mesma fase/seed. Acertar e confirmar libera a fase 2 original. Os tipos de sala de combate e reparo ainda não ganham novos inimigos ou minigames nesta etapa.

## Testes

```powershell
python tools/check_generation.py
python tools/check_maps.py
python tests/run_review.py --parkour-only
python tests/run_review.py --procedural-only
python tests/run_review.py --procedural-demo
python tests/run_review.py
```

`tests/parkour.js` verifica salto real a 30/60/144Hz, dificuldade, transporte e pouso permanente ao sair dos dois tipos de plataforma móvel, aterrissagem que ativa temporárias/cadentes, avisos, dano real e retorno sem aprisionamento. Testa morte, queda no vazio, respawn, expiração da proteção e câmera nos 36 checkpoints das três seeds. Também gera 60 combinações de seeds, 8/12/24 salas e dificuldade 1–5 para validação estrutural, temporal e de segurança.

`tests/procedural.js` verifica todos os checkpoints e a saída nos dois sentidos **sem** plataformas transitórias, para as três seeds de 12 salas e dificuldade 2. Captura cada mapa depois de os PNGs carregarem. `tests/procedural-demo.js` testa carregamento, save separado, conclusão, resposta errada e migração de saves antigos com XP/habilidades.

O solver em `tests/review.js` foi corrigido para continuar andando quando o primeiro contato com uma borda apoia somente parte do corpo. A tentativa só é aprovada depois de o corpo estar inteiramente sobre o intervalo de pouso; movimento e colisão continuam sendo executados pelo motor real. Antes desse ajuste, o teste extra de dificuldade 5 apontava falsamente falta de retorno ao sair de uma plataforma estreita. A prova avançada agora cobre oito salas nos dois sentidos, com apoios de 72px e sem plataformas transitórias.

Resultados dos testes específicos executados no Chrome: parkour **9/9**, incluindo as 60 configurações; prévia por URL e salvamento/migração **4/4**, sem erros de runtime. A validação dos dez módulos originais, o guard de preservação e `git diff --check` passaram. Durante o desenvolvimento, o validador encontrou um elevador tocando um batente: o envelope vertical foi reduzido para conservar a folga, e os testes de transporte/pouso passaram depois da correção.

A execução final da regressão completa passou nas **10 fases originais e em 111/111 verificações de sistemas**, sem erros de runtime; gerou 71 capturas. A suíte específica de geração passou em **6/6**, com 12/12 checkpoints e saída alcançáveis nos dois sentidos em `pcb-alpha`, `pcb-beta` e `pcb-gamma`. Foram alcançadas, respectivamente, 106, 100 e 125 superfícies permanentes. Os três mapas também são reproduzíveis por seed e diferentes na geometria de colisão.

Evidências: `tests/parkour-results.json`, `tests/procedural-results.json`, `tests/procedural-demo-results.json`, `tests/review-results.json` e `tests/procedural-pcb-{alpha,beta,gamma}.png`.

Os testes são instrumentados: o solver reposiciona o personagem entre saltos verificados e não executa uma partida humana contínua. Os perigos são testados separadamente da busca de rotas. As 60 configurações extras recebem validação estrutural, não uma travessia completa com o motor. Ritmo, equilíbrio e conforto ainda precisam de teste manual.
