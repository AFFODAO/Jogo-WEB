# Ambientes tecnológicos em pixel art 2D

A etapa foi feita primeiro em Hardware: geração dos três atlas, testes de renderização/autotiling/cache e inspeção da captura fora do fade inicial. Só depois os atlas e as identidades foram estendidos às outras nove fases.

As imagens são originais, geradas em Python com primitivas inteiras e PNG RGBA, sem downloads, bibliotecas de imagens externas ou imagens de terceiros. Os sprites existentes de personagens, objetos e efeitos foram preservados.

## Conteúdo e identidade

Cada fase recebeu três PNGs em `assets/pixelart/environments/`:

- `terrain-NN.png`: tiles de 32 × 32, dezesseis máscaras de conexão cardinal e quatro cantos internos; oito variantes por máscara. Pisos, paredes, bordas, cantos, plataformas e estruturas usam o mesmo material coerente, com marcações próprias para plataformas móveis, temporárias e perigosas.
- `structure-NN.png`: estruturas de 128 × 128, com oito quadros para indicadores e detalhes animados.
- `vista-NN.png`: três planos de fundo de 128 × 128, com oito variantes por plano.

São 30 atlas novos, totalizando 77 na biblioteca com os 47 anteriores. O jogo carrega somente o conjunto da fase e seus atores; os testes que auditam a biblioteca inteira pedem os demais explicitamente.

| Fase | Material, estruturas e decoração |
| --- | --- |
| Hardware | Trilhas verdes, contatos dourados, microchips, placa-mãe, CPU grande, RAM, GPU e ventoinhas |
| Software | Interfaces roxas, janelas, listas digitais e terminais |
| Switch | Portas Ethernet, pinos, LEDs e backplane modular |
| Roteador | Dutos de transmissão e setas de fluxo de dados |
| Wi-Fi | Barras de sinal, antenas e pontos luminosos |
| Cabeamento | Eletrocalhas industriais, feixes de cabos e travessas metálicas |
| DHCP | Nós de rede, monitores e terminais de distribuição |
| DNS | Diagramas de domínio, interfaces de resolução e servidores |
| Firewall | Alvenaria digital vermelha, bastiões, portões e indicadores de segurança |
| Servidores | Racks azuis, fibra e núcleo corrompido magenta dentro da arena manual |

Os cenários grandes são montados em módulos visíveis, sem esticar uma imagem sobre o mapa inteiro. Elementos de primeiro plano continuam separados dos fundos. Há três planos de parallax em velocidades distintas, pacotes luminosos animados, partículas quadradas e halos em degraus. O modo de efeitos reduzidos diminui os planos e remove partículas/animações decorativas.

## Autotiling e otimização

`src/engine/environment-art.js` recebe uma cópia visual das formas ativas de `solids()`. Uma grade espacial consulta vizinhos, seleciona as máscaras e detecta cantos côncavos. Bordas parcialmente conectadas são corrigidas por trechos; não é necessário encaixar as colisões em uma grade. Uma lacuna real continua aberta. Plataformas móveis, temporárias e perigosas mantêm contornos independentes.

Quando um reparo ativa uma ponte ou remove uma parede, a assinatura da geometria muda e os contornos são recalculados. O renderer não cria, move ou amplia colisões.

O terreno é rasterizado em chunks de até 256 × 256 somente quando visível. O cache LRU tem no máximo 96 chunks por fase e é liberado ao trocar de mapa. O teste de um piso de um milhão de pixels exige no máximo três chunks para uma janela de 640 pixels e verifica a reutilização e o limite de memória.

`src/engine/visuals.js` seleciona o ambiente, sprites de inimigos, variantes temáticas, possíveis reforços e referências explícitas da fase. Os testes confirmam menos de vinte atlas ativos por fase e ausência dos ambientes de outros temas. O cache compartilhado de imagens tem 32 entradas. PNGs de teste e assets customizados continuam disponíveis mediante referência explícita.

Sprites, chunks e framebuffer usam `imageSmoothingEnabled=false`. PNGs novos possuem somente alfa 0 ou 255; não usam pixels suavizados na origem. A iluminação nova usa retângulos de pixels e transparência de composição, sem blur ou sombras filtradas.

## Preservação da jogabilidade

A única alteração em `game.js` está em `drawSolids()`: obter as mesmas formas uma vez, entregá-las ao índice visual e desenhá-las. O restante do arquivo é comparado byte a byte com a versão anterior após normalizar somente esse trecho.

`tools/check_environment.py` também protege os módulos dos mapas, geradores, física, inimigos, chefe e reparos com os hashes de `tests/fixtures/pre-environment-hashes.json`. Não houve mudança de dimensões, saltos, gravidade, objetivos, checkpoints, perguntas, habilidades ou arena de VIRUS ZERO.

## Arquivos

- `tools/build_environment_art.py`: gerador original de atlas e referência de Hardware.
- `tools/pixelart/build.py`: preserva os novos atlas no manifesto ao reconstruir a biblioteca anterior.
- `assets/pixelart/environments/*.png`: trinta atlas e `hardware-reference.png`.
- `assets/pixelart/manifest.json` e `src/engine/art-manifest.js`: descritores dos atlas.
- `src/engine/environment-art.js`: autotiling, chunks, cenários e parallax.
- `src/engine/pixel-art.js`: encaminha os ambientes novos e mantém o fallback anterior.
- `src/engine/visuals.js`: seleção e cache dos recursos por fase.
- `index.html` e trecho de desenho em `game.js`: integração do renderer.
- `tests/environment-art.js`, `tests/art.js`, `tests/pixelart.js`, `tests/audit.js` e `tests/run_review.py`: validação e modos de teste visual. Auditorias da biblioteca inteira carregam seus recursos explicitamente, para não depender do conjunto ativo de uma fase.
- `tools/check_environment.py` e `tools/check_generation.py`: proteção da jogabilidade, reconhecendo a alteração estritamente visual.
- `tests/environment-gallery.html`, `tests/phase-NN-environment.png` e `tests/environment-art-results.json`: galeria e resultados específicos.

## Comandos executados

```powershell
python tools/build_environment_art.py --phase 1
python tests/run_review.py --environment-hardware
python tools/build_environment_art.py --all
python tests/run_review.py --environment-only
python tests/run_review.py --pixel-only
python tools/check_environment.py
python tools/check_generation.py
python tests/run_review.py
git diff --check
```

Os testes específicos cobrem conexões, cantos internos, lacunas, junções parciais, atualização após reparos, PNGs sem antialiasing, diferenças estruturais entre temas, carregamento seletivo, cache limitado e ausência de mutação de estado durante o desenho. Há capturas das dez fases em `tests/environment-gallery.html`.

A regressão completa inclui travessia com atributos básicos, minigames, combate, salvamento, perguntas e ataques/etapas do chefe. A busca de travessia usa reposicionamento entre arestas comprovadas e proteção contra dano; não representa uma partida humana contínua. A otimização foi verificada por limites de trabalho e memória, sem medição de FPS em equipamento de baixo desempenho.

Resultado final: 152/152 verifica??es aprovadas, dez fases verificadas, 81 capturas, zero erros de runtime e nenhuma falha. O fingerprint do relat?rio corresponde ao c?digo final.
