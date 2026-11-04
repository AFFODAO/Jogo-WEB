# Fases 6–10: percursos novos

As cinco plantas anteriores foram substituídas por mundos de revisão 2, com dimensões fixas, chão explícito e câmera nos dois eixos. As definições das fases 1–5 foram preservadas e comparadas com uma referência capturada antes deste trabalho.

| Fase | Dimensões | Diferença estrutural | Reparos / checkpoints |
| --- | --- | --- | --- |
| 6 — Cabeamento | 1.600 × 3.000 | Prédio de cinco níveis com dois shafts, eletrocalhas alternadas e poço central de elevadores. | 3 / 4 |
| 7 — IP/DHCP | 2.800 × 1.700 | Núcleo DHCP cercado por quatro setores em alturas diferentes; gateways e rotas de concessões conectam os escopos. | 3 / 4 |
| 8 — DNS | 3.400 × 2.100 | Árvore de domínios com corredores físicos, subdomínios, resolução por portais, cache inferior e ramal NXDOMAIN. | 3 / 4 |
| 9 — Firewall | 3.600 × 1.800 | Fortaleza que exige atravessar o perímetro, subir ao bastião, voltar pelo anel interno e alcançar a cidadela. | 4 / 5 |
| 10 — Internet | 6.800 × 2.000 | Duas torres de data center, backbone descontínuo sob combate, airlock e arena elevada independente. | 4 / 5 |

São 145 plataformas declaradas, 17 reparos, 26 inimigos originais e 23 coletáveis nas cinco fases. As rotas obrigatórias foram verificadas com o salto básico; os aprimoramentos da campanha continuam disponíveis como vantagens.

## 6 — Cabeamento e infraestrutura

O jogador começa no subsolo. O percurso sobe pelo shaft oeste até o primeiro quadro, cruza para o leste, volta ao oeste no andar seguinte e finalmente segue ao telhado. Os pisos intermediários representam grades/eletrocalhas atravessáveis de baixo para cima, com degraus de manutenção a cada 100 unidades.

Cada reparo restaura uma travessia entre os shafts, habilita um elevador e desliga um trecho de cabo energizado. Os elevadores transportam o jogador verticalmente e servem como opções de circulação; o percurso de manutenção permite concluir sem depender de esperar um elevador ou possuir propulsores. As docas ficam ao lado das cabines, sem ocupar a mesma faixa de embarque.

Racks, dutos, quadro de patch e cabos compõem o prédio. Os checkpoints ficam nos andares estáveis, e os caches opcionais ocupam passarelas laterais.

[Planta completa](../tests/snapshots/phase-06-overview.png).

## 7 — Endereçamento IP e DHCP

O núcleo central conecta o escopo de reservas, a rede de diagnóstico, o relay e o gateway de saída. Os setores não são apenas uma sequência de salas: rotas diagonais de concessões móveis passam a ligá-los depois dos reparos, oferecendo retornos físicos além dos gateways.

- O serviço DHCP reparado habilita concessões; seu terminal também precisa ser ativado com E.
- A restauração do pool remove a barreira de conflito e libera a reserva de endereço, que exige outra ativação.
- O relay restaura o gateway para o setor superior direito e outra rota de acesso.
- A porta de saída exige DHCP e reserva ativos. Os estados dos serviços são salvos.

A rede de diagnóstico contém um inimigo obrigatório e um cache, incentivando a investigação do escopo APIPA. Os quatro checkpoints podem ser selecionados novamente ao retornar a um setor anterior.

[Planta completa](../tests/snapshots/phase-07-overview.png).

## 8 — DNS

O percurso começa na raiz e se ramifica em `.com` e `.org`, depois em `mail.com` e `api.org`. As áreas têm servidores próprios, paredes corrompidas, escadas de desvio e conexões físicas de retorno. Os portais resolvem nomes e criam atalhos condicionados aos registros restaurados.

- O registro de `.com` remove suas divisórias e libera uma ponte CNAME e resolução para o outro domínio.
- O registro de `.org` restaura sua conexão ao cache recursivo e a outra metade da ponte entre domínios.
- O cache recursivo elimina a corrupção da raiz e habilita a resolução direta de retorno.
- O domínio inexistente leva ao ramal NXDOMAIN, com recompensa e portal de volta explicitamente sinalizado. O arquivo inferior também tem escada e retorno ao cache.

As decisões incluem qual domínio investigar primeiro, quando usar resolução ou percurso físico, se explorar o nome inexistente e como voltar à raiz após limpar o cache.

[Planta completa](../tests/snapshots/phase-08-overview.png).

## 9 — Firewall e segurança

A infiltração atravessa duas barreiras altas no perímetro, usa plataformas sobre falhas no piso, sobe pelo lado leste, retorna pelo anel interno e sobe à cidadela. O caminho final combina combate, cobertura e ativação do terminal ACL.

Quatro reparos removem bloqueios, desligam lasers/câmeras e criam a primeira etapa da escadaria final. Há uma plataforma temporária sobre o segundo vão e uma plataforma móvel na inspeção. As câmeras anunciam sua varredura antes de disparar para a posição adquirida durante o aviso; restaurar a política desliga o respectivo equipamento. Os lasers têm ciclos fixos, períodos desligados e altura que pode ser vencida com salto normal.

Os cinco inimigos ocupam corredores e áreas de combate diferentes. Os cinco checkpoints separam as camadas para permitir tentativas sem refazer toda a fortaleza.

[Planta completa](../tests/snapshots/phase-09-overview.png).

## 10 — Servidores e Internet

É o maior mundo da campanha. O data center inicial possui duas torres escaláveis, corredor inferior e rota de fibra superior. O backbone seguinte reúne inimigos conhecidos, plataformas móveis/temporárias, descontinuidades do piso e lasers. O airlock conduz a uma arena própria, com piso a Y=900, acima do restante do mundo.

Os quatro relays abrem rotas na exploração e no backbone e, juntos, liberam a entrada e a proteção do núcleo. A arena possui plataformas de várias alturas, elevador aéreo e duas coberturas sólidas. VIRUS ZERO conserva os três grupos de padrões, os avisos, a mira anunciada, os períodos de vulnerabilidade e as invocações. As melhorias são:

- Ataques, pilares e avisos usam o piso real da arena, não o fundo global do mapa.
- Cada troca de etapa ganha uma pausa protegida de 0,6 s e começa com um aviso novo. Dano alto encontra os limiares de etapa, evitando pular diretamente a apresentação de uma fase do chefe.
- Uma investida bloqueada por cobertura expõe o ponto fraco por 1,8 s; o dano na janela é dobrado.
- Ao morrer, o chefe remove seus pilares, projéteis e reforços. A pergunta obrigatória abre após concluir também os demais objetivos, e a resposta correta conclui/salva a campanha.

Os detalhes de padrões e validação estão em [FASE10.md](../tests/FASE10.md).

[Planta completa](../tests/snapshots/phase-10-overview.png).

## Arquivos e salvamento

As plantas estão em `src/maps/06-cabling.js` até `10-servers.js`. `tools/build_last_five.py` é sua fonte de autoria por coordenadas explícitas e modifica somente esses cinco arquivos. `src/content/last-five.js` implementa vigilância e o cenário vetorial; o motor compartilhado mantém combate, perguntas, habilidades e XP.

Saves das plantas antigas dessas fases reiniciam a fase atual na entrada reconstruída, preservando nível, XP e habilidades. O jogo avisa sobre essa migração. Novos checkpoints, reparos, serviços e progresso são gravados normalmente. A campanha continua com dez fases.

## Testes executados

`python tools/check_maps.py` e `python tests/run_review.py` passaram. A rotina inclui as dez fases e 39 grupos de verificação, além das capturas e das checagens individuais por fase.

Nos novos mapas foram verificados: acesso a todas as plataformas, reparos, inimigos, coletáveis e saídas; câmera nos dois eixos; colisões e limites; ausência de sobreposição inicial de componentes/inimigos/coletáveis com a geometria e nova checagem após restauração; estabilidade de todos os checkpoints antes dos reparos; transporte em elevadores/concessões; efeitos de cada reparo; ativação e salvamento dos serviços; destinos reais de todos os gateways/resolvedores; aviso, disparo e desligamento das câmeras; ciclo e esquiva dos lasers; proteção dos quatro relays; mudanças de etapa e esquivas do chefe; pergunta final, vitória e retomada.

Os percursos são explorados por trechos simulados com a física real e salto básico. O teste de possibilidade de derrotar cada inimigo usa proteção contra dano; os testes específicos de câmera, laser e esquiva do chefe usam dano ativo. As definições das fases 1–5 também são comparadas integralmente com a referência anterior a esta entrega.

Não houve uma partida humana contínua para medir dificuldade, testes físicos de multitoque ou medição de FPS em equipamento fraco. A busca amostra posições de plataformas móveis e não verifica todas as combinações de tempo de armadilhas/inimigos. Os resultados demonstram funcionamento e acesso dentro dessa cobertura.
