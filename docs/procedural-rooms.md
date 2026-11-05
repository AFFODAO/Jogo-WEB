# Salas procedurais — Parte 2

Este documento registra a etapa estrutural anterior. A implementação atual de geometria, física, perigos e migração de saves está em [Parte 3: parkour procedural](procedural-parkour.md).

## Exemplo funcional

Abra `index.html?procedural=pcb-alpha&rooms=12&difficulty=2&optional=0.4` no endereço em que executa o jogo e clique em iniciar. Troque a seed por `pcb-beta` ou `pcb-gamma` para comparar. Sem `procedural`, todos os mapas originais continuam ativos.

| Parâmetro | Valores | Efeito |
| --- | --- | --- |
| `procedural` | texto | Seed reproduzível |
| `rooms` | 8–24; padrão 12 | Quantidade total de salas |
| `difficulty` | 1–5; padrão 1 | Quantidade de plataformas de prática no parkour |
| `optional` | 0.2–0.7; padrão 0.35 | Proporção desejada fora do caminho principal; arredondada, mínimo duas salas opcionais e três principais |
| `portals` | `1` para ativar | Atalho bidirecional de diagnóstico por barramento, acionado com E |

A prévia substitui apenas o primeiro slot da campanha em memória. Os dez arquivos originais e `campaign.js` não são reescritos. A única alteração em `game.js` seleciona uma chave de salvamento separada, por seed/configuração. Abra a mesma URL para continuar. XP, habilidades e perguntas usam os sistemas existentes. Áudio/conforto continuam compartilhados. Mudanças futuras no algoritmo devem versionar o namespace do save.

## Módulos

- `src/generation/graph.js`: topologia independente da geometria. Caminho principal, ramificações, ciclo garantido e atalhos adicionais. Os oito tipos aparecem em cada mapa: inicial, exploração, parkour, combate, reparo, recompensa, secreta e final. Recompensa e secreta ficam fora do caminho obrigatório.
- `src/generation/rooms.js`: plugin `structural-shell-v1` do compositor anterior; salas 768×480, encaixes nas bordas, corredores, túneis, portas abertas, pontes substituindo trechos de chão e passagens verticais com plataformas one-way.
- `src/generation/structural.js`: converte o grafo numa receita schema-v2, valida conexões, cria checkpoints livres e objetivo de alcançar a sala final. Portais opcionais usam o controlador existente.
- `src/generation/demo.js`: ativação pela URL, tema Hardware e isolamento do save. Configuração inválida mostra aviso e conserva a campanha original.

API:

```js
const map = ByteRunner.proceduralMaps.generate({
  seed: 'pcb-alpha', roomCount: 12, difficulty: 2,
  optionalRatio: .4, portals: false
});
```

Retorna definição imutável sem registrar/carregar a fase. `graph(options)` retorna apenas a topologia; `validate(map)` verifica regras estruturais. O plugin é registrado no primeiro uso. `generation.graph` contém opções, nós, arestas, tipos, caminho principal e proporção efetiva; `generation.recipe` permite recompilar a geometria pelo compositor da Parte 1.

## Regras e limites

A grade usa ocupação exclusiva e ligações entre vizinhos. Há uma espinha horizontal com ramificações acima/abaixo e pelo menos um ciclo; as dimensões e formas possíveis são limitadas. Todas as conexões físicas são bidirecionais. Aberturas horizontais têm pelo menos 96px de altura para o jogador de 34×48; os degraus verticais ficam a cada 96px, abaixo da altura do salto básico (~129px). O validador verifica conectividade, sobreposição, entrada/saída únicas, ciclos e espaço nas emendas, além das validações do compositor e do motor.

Salas de combate/reparo são classificadas e sinalizadas, mas ainda não têm ondas de inimigos ou componentes novos. Salas secretas são setores opcionais identificados; descoberta por paredes falsas está fora desta etapa. Recompensas usam os colecionáveis existentes. Portas não têm fechaduras. Nenhum caminho exige habilidade opcional. Chegar à sala final libera a pergunta obrigatória; errar reinicia a mesma fase gerada.

## Verificação

```powershell
python tools/check_generation.py
python tools/check_maps.py
python tests/run_review.py --procedural-only
python tests/run_review.py --procedural-demo
python tests/run_review.py
```

`tests/procedural.js` compara três seeds com 12 salas, dificuldade 2 e proporção .4: determinismo e diferenças na geometria de colisão, acesso a todos os checkpoints/saída com movimento e salto reais e retorno partindo da saída. Também verifica configurações de 8/16/24 salas e portais nos dois sentidos. `tests/procedural-demo.js` verifica a URL, sprites, mapas posteriores, isolamento do save, XP/posição após continuar, pergunta obrigatória, repetição por erro e liberação da fase seguinte.

Capturas: `tests/procedural-pcb-alpha.png`, `tests/procedural-pcb-beta.png` e `tests/procedural-pcb-gamma.png`. Relatórios: `tests/procedural-results.json`, `tests/procedural-demo-results.json`, `tests/review-results.json`.

Resultados reais no Chrome:

| Seed | Salas | Arestas físicas | Ciclos independentes | Checkpoints alcançáveis (ida e volta) |
| --- | ---: | ---: | ---: | ---: |
| pcb-alpha | 12 | 12 | 1 | 12/12 |
| pcb-beta | 12 | 13 | 2 | 12/12 |
| pcb-gamma | 12 | 13 | 2 | 12/12 |

As três definições se repetem integralmente para a mesma seed e têm colisões distintas entre si. Cada uma tem sete salas principais e cinco opcionais. A regressão completa passou nas dez fases originais e em 102/102 verificações de sistemas, sem erros de runtime. O teste específico da prévia passou em 3/3 verificações. Os verificadores de mapas/preservação e `git diff --check` também passaram. Na inicialização de uma execução, o arquivo da porta de depuração do Chrome estava temporariamente bloqueado; o runner agora aguarda a leitura válida antes de conectar.

O solver reposiciona o personagem entre superfícies cujas travessias foram verificadas; não é uma partida humana contínua. Ritmo, conforto de câmera e equilíbrio precisam de teste manual. Os tamanhos extremos passam por testes estruturais; a prova física completa cobre as três seeds indicadas, não todas as configurações.
