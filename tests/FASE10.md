# Fase 10 — Servidores e Internet

O mapa reconstruído tem 6.800 × 2.000 unidades e mantém as dez fases da campanha, os controles, o inventário de habilidades, XP, reparos e salvamento existentes.

A definição explícita de revisão 2 está em [src/maps/10-servers.js](../src/maps/10-servers.js). O percurso antigo foi substituído por duas torres, um backbone descontínuo e uma arena elevada. A abertura da pergunta após o chefe é declarada em `completion`, e os sistemas compartilhados continuam em `game.js` e `src/engine/`.

| Área | Percurso |
| --- | --- |
| Exploração, 0–2.500 | Duas torres escaláveis de servidores, corredor inferior e fibra superior. Os relays das torres abrem rotas alternativas. |
| Combate avançado, 2.500–4.800 | Backbone com pisos separados, plataformas móveis/temporárias, lasers, inimigos combinados e subida ao airlock. Reparar energia desliga armadilhas e habilita ponte/elevador. |
| Arena, 4.800–6.600 | Piso próprio em Y=900, plataformas de várias alturas, elevador aéreo, duas coberturas e núcleo digital exclusivo. |

Há cinco checkpoints, indicados por (X, Y dos pés): (640, 1190), (1850, 1050), (2910, 1640), (4450, 1170) e (5000, 900). O último fica dentro da arena. Morrer preserva os reparos e os sistemas existentes de retorno e salvamento.

Os quatro relays abrem o airlock e desativam a proteção do núcleo. As habilidades adquiridas continuam atuando sobre dano, cadência, armadura, salto, escudo e reparo. O acesso aos objetivos e a derrota foram testados também com disparo e salto básicos.

| Etapa do chefe | Comportamento |
| --- | --- |
| 1, acima de 67% de vida | Alterna impacto no chão e investida. A preparação dura 1,05 s. A investida percorre o cenário ao longo de 0,48 s, pode ser interrompida por cobertura sólida e pode ser saltada. |
| 2, entre 34% e 67% | Dispara três projéteis e cria pilares temporários. A preparação dura 0,85 s. A mira é registrada no começo do aviso; não acompanha o jogador no último instante. |
| 3, até 34% | Alterna combo, investida, pilares e rajada. O combo combina impacto, cinco projéteis e alterações no cenário. A preparação dura 0,8 s e a recuperação do combo expõe o ponto fraco por 1,65 s. |

O ponto fraco dobra o dano dos disparos e remove a redução de armadura durante a janela. A barra fixa mostra vida, etapa, proteção, preparação, investida e oportunidade de contra-ataque. O cenário recebe avisos da área do impacto, do caminho da investida, da mira dos projéteis e das posições dos pilares.

VIRUS ZERO tem 90 pontos de vida. Os limiares de 67% e 34% limitam um golpe que ultrapassaria a etapa seguinte. A troca de etapa cancela o ataque anterior, aplica 0,6 s de proteção visível e inicia um aviso novo. Os padrões originais foram preservados; a transição evita uma mudança de ataque surpresa durante o aviso anterior.

Na revisão dos inimigos, as etapas avançadas passaram a manter distância para disparar, e as invocações ganharam aviso de 0,9 s antes do nascimento dos reforços. Arcos orbitais mostram a etapa; preparação, impacto, transição e invocação possuem animação ou áudio próprios. A cobertura dos comportamentos adicionais está em `tests/enemies.js` e em [docs/enemies.md](../docs/enemies.md).

Uma investida bloqueada por cobertura sólida deixa o núcleo vulnerável por 1,8 s, oferecendo uma interação estratégica adicional. Impactos, pilares e marcações usam `groundY` da arena em vez do fundo global do mapa. A ativação do chefe também considera a região da arena, impedindo ataques contra o jogador nos corredores inferiores.

O chefe só começa a agir quando o jogador se aproxima da arena. Pilares não aparecem atravessando o jogador. A morte do chefe remove seus projéteis, pilares e reforços. Quando os demais objetivos obrigatórios também estão cumpridos, a pergunta final abre automaticamente, sem exigir a caminhada restante até a saída. A resposta correta mostra a vitória e salva a conclusão; a resposta errada mantém a repetição obrigatória da fase.

## Verificação

Use `python tests/run_review.py`. A rotina inclui as dez fases para detectar regressões, mais testes específicos de VIRUS ZERO:

- Escudo dos relays, etapas, disparos reais e derrota.
- Impacto e investida atingindo um jogador no chão e sendo evitados com salto normal.
- Mira travada no ponto anunciado, criação de pilares e ausência de sobreposição no jogador.
- Aumento de dano na janela do ponto fraco e limpeza dos perigos após a morte.
- Ausência de ataques remotos antes da arena, preservação das habilidades e retorno/salvamento do checkpoint final.
- Limiares de etapa, proteção transitória, aviso novo, bloqueio de investida por cobertura e pilares alinhados ao piso elevado.
- Renderização dos estados protegido, investida anunciada, pilares anunciados, combo e vulnerabilidade.
- Esquiva da rajada por salto temporizado e esquiva do combo ao abandonar uma plataforma superior usando movimento normal.
- Derrota por projétil abrindo a pergunta obrigatória e resposta correta concluindo e salvando a campanha.

Os resultados ficam em `review-results.json` e as capturas em `snapshots/phase-10-boss-*.png`. Os testes de esquiva usam dano ativo, sem proteção artificial. Os testes gerais de possibilidade de derrotar todos os inimigos continuam usando proteção contra dano para isolar funcionamento de dificuldade. Não houve uma partida humana contínua, teste físico de multitoque ou medição de FPS em equipamento fraco.
