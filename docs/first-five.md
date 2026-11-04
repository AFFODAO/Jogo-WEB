# Fases 1–5 reconstruídas

Todas as cinco plantas anteriores foram substituídas. Elas usam dimensões fixas, piso explícito, câmera nos dois eixos, percursos próprios e perguntas obrigatórias na saída. Este documento registra a primeira etapa; a reconstrução posterior das fases 6–10 está documentada em [last-five.md](last-five.md).

| Fase | Dimensões | Silhueta e percurso | Checkpoints |
| --- | --- | --- | --- |
| Hardware | 2.800 × 1.000 | Placa-mãe horizontal, CPU elevada à esquerda, torre de RAM central, GPU à direita e circuitos atravessando lacunas. | 3 |
| Software | 1.900 × 1.400 | Quatro salas separadas em dois andares, ligadas por oito diretórios direcionais. | 3 |
| Switch | 2.200 × 1.200 | Backplane vertical central e quatro ramais ligados às portas Ethernet, com uplink no topo. | 3 |
| Roteador | 2.200 × 1.500 | Túneis em três andares, desvios, shafts laterais e interfaces que fecham circuitos de retorno. | 3 |
| Wi-Fi | 1.550 × 2.400 | Longa subida em zigue-zague, ilhas de antenas, sinais instáveis e canal alternativo lateral. | 4 |

## Hardware

CPU, RAM e GPU formam plataformas elevadas, com pinos/degraus e trilhas inferiores de acesso. A ventoinha aplica força horizontal real, inclusive quando o jogador solta os controles. A área de vento tem indicação no cenário e pode ser evitada pela rota superior. O circuito eletrificado causa dano; o dissipador funciona como obstáculo sólido.

- Reparo da CPU: restaura um barramento e interrompe o fluxo defeituoso da ventoinha.
- Reparo da RAM: desliga a área eletrificada e ativa uma passarela.
- Reparo da GPU: ativa uma conexão adicional à direita.
- Caches opcionais ficam acima da CPU, da memória e da GPU. O primeiro checkpoint está fora do fluxo da ventoinha para permitir retorno estável mesmo sem reparos.

[Planta completa de Hardware](../tests/snapshots/phase-01-overview.png).

## Software

Desktop, Processos, Sistema de Arquivos e Escalonador ocupam salas próprias, com pisos e paredes separados. Janelas móveis criam os acessos superiores; pastas/cache e processos compõem as plataformas. Os diretórios são portais reais: aproxime-se e pressione E. Segurar E não cria um ciclo de teletransporte.

- Restaurar o processo abre as ligações Desktop–Escalonador e Processos–Arquivos, remove o processo travado e cria uma janela adicional.
- Restaurar o índice remove o arquivo corrompido e disponibiliza uma janela superior.
- Restaurar o escalonador cria outra janela de acesso.
- Inimigos ficam ativos em suas salas. Checkpoints podem ser selecionados novamente ao voltar a uma sala anterior.

[Planta completa de Software](../tests/snapshots/phase-02-overview.png).

## Switch

O jogador começa no centro do chassi. O backplane sobe até o uplink; os ramais levam às portas 01–04. Plataformas de pacotes e cabos conectam as regiões. Os ramais superiores esquerdo e inferior direito também oferecem exploração e fragmentos opcionais.

- Reparar o conector da porta 01 e o enlace da porta 04 restaura plataformas nos respectivos ramais.
- Reparar o backplane cria uma conexão central adicional.
- As portas 01 e 04 precisam ser ativadas com E, além dos reparos e da derrota dos inimigos. Elas habilitam plataformas de pacotes e seu estado é salvo. A saída permanece bloqueada enquanto alguma ativação obrigatória faltar.

[Planta completa do Switch](../tests/snapshots/phase-03-overview.png).

## Roteador

O túnel LAN inferior, o trânsito intermediário e o túnel WAN superior formam um percurso físico em três níveis. Shafts permitem subir sem usar interfaces; atalhos por interfaces oferecem outra forma de explorar. Paredes de falhas de roteamento exigem um desvio de parkour ou sua remoção após o reparo.

- Tabela LAN: remove a falha inferior e libera a interface para o andar intermediário.
- Tabela de trânsito: cria uma ponte sobre o vão e libera a interface WAN. Junto com o reparo LAN, habilita a rota de reserva.
- Tabela WAN: remove a parede superior para facilitar o retorno e o acesso à saída.
- A rota de diagnóstico é um ramal opcional elevado.

[Planta completa do Roteador](../tests/snapshots/phase-04-overview.png).

## Rede Wi-Fi

As antenas são ilhas estáveis entre sequências de sinais em alturas distintas. Há plataformas móveis e sinais que desaparecem 2,4 s após serem pisados e retornam após 2,2 s. O percurso principal alterna o lado da subida; o canal limpo abre outro caminho à esquerda.

- Zonas de interferência reduzem a velocidade de deslocamento e dos disparos e aumentam o intervalo entre tiros. O salto conserva sua potência; armadura, canhão e cadência adquiridos continuam funcionando.
- Cada um dos três reparos desliga uma faixa de interferência.
- O repetidor também cria seis plataformas do canal limpo, com sinal mais favorável ao deslocamento.
- A aproximação final da antena é feita pela lateral, evitando uma plataforma sob sua base sólida. Há segredos abaixo da entrada, no canal limpo e na antena auxiliar lateral.

[Planta completa do Wi-Fi](../tests/snapshots/phase-05-overview.png).

## Arquivos e autoria

- `src/maps/01-hardware.js` a `05-wifi.js`: cinco definições completas de revisão 2.
- `src/content/first-five.js`: vento, interferência, diretórios/interfaces e cenário vetorial.
- `tools/build_first_five.py`: fonte de autoria das cinco plantas, com coordenadas explícitas e distintas. Reexecutá-lo substitui somente esses cinco arquivos; ele não usa uma geometria comum para gerar as cinco fases.
- `tests/first-five.js`: verificações específicas dos efeitos dos reparos, vento, eletricidade, interferência, portais, portas obrigatórias, checkpoints e migração de saves.

O minimapa acompanha a geometria, as plataformas ativadas e os componentes restantes. A revisão do mapa é salva; ao retomar uma planta antiga das fases 1–5, o jogo reinicia a fase na entrada nova e conserva XP, nível, habilidades e escolha de habilidade pendente. A interface avisa sobre essa migração.

## Cobertura dos testes

Execute `python tools/check_maps.py` e `python tests/run_review.py`. A rotina executa as dez fases para conferir regressões; os testes específicos desta reconstrução ficam limitados às fases 1–5.

A busca de acesso simula trechos de caminhada, salto e queda com a física do jogador e sem propulsores. Considera os modificadores de vento/sinal, executa portais com E, repara os componentes e ativa os interruptores alcançáveis antes de reavaliar a geometria. São conferidos todos os componentes obrigatórios, plataformas, coletáveis/segredos e saídas das cinco fases. O combate usa disparos reais a partir de regiões alcançáveis, com proteção contra dano para separar acesso de dificuldade. Os testes específicos de eletricidade usam dano ativo.

Também são verificados: efeito de cada reparo no mundo; destino e suporte físico de todos os portais; ausência de ciclos ao segurar E; ativação obrigatória e persistência das portas do Switch; retorno entre checkpoints; estabilidade dos checkpoints antes de qualquer reparo; perguntas corretas/incorretas e reinício; compatibilidade de saves e habilidades.

As capturas incluem vistas do início/meio/fim e uma vista completa de cada planta. Não houve uma partida humana contínua, medição de FPS em máquinas fracas ou teste físico de toque. A exploração usa posições amostradas das plataformas móveis, não todas as combinações de tempo de plataformas e inimigos. O resultado comprova acesso nas condições testadas, sem substituir avaliação humana de dificuldade.
