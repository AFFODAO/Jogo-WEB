# Fase 10 — Servidores e Internet

O mapa tem 5.200 unidades de largura e mantém as dez fases da campanha, os controles, o inventário de habilidades, XP, reparos e salvamento existentes.

| Área | Percurso |
| --- | --- |
| Exploração, 0–1.800 | Corredores de racks, rota elevada até 310 unidades acima do chão, caminho inferior e atalho liberado por reparo. O segundo relay está sobre uma plataforma elevada. |
| Combate avançado, 1.800–3.340 | Voadores, atiradores, parasita, inimigos rápidos e blindados; poços, plataformas móveis e temporárias; lasers temporizados. Reparar o terceiro relay desativa um laser. |
| Arena, a partir de 3.340 | Coberturas, plataformas altas e baixas, elevador móvel, duas laterais para esquiva e acesso ao terminal da Internet. |

Há quatro checkpoints: 1.210, 2.460, 3.260 e 3.540. O último fica dentro da arena. Morrer preserva os reparos e os sistemas existentes de retorno e salvamento.

Os quatro relays desativam a proteção do núcleo. As habilidades adquiridas continuam atuando sobre dano, cadência, armadura, salto, escudo e reparo.

| Etapa do chefe | Comportamento |
| --- | --- |
| 1, acima de 67% de vida | Alterna impacto no chão e investida. A preparação dura 1,05 s. A investida percorre o cenário ao longo de 0,48 s, pode ser interrompida por cobertura sólida e pode ser saltada. |
| 2, entre 34% e 67% | Dispara três projéteis e cria pilares temporários. A preparação dura 0,85 s. A mira é registrada no começo do aviso; não acompanha o jogador no último instante. |
| 3, até 34% | Combina impacto, cinco projéteis e alterações no cenário. A preparação dura 0,8 s e a recuperação do combo expõe o ponto fraco por 1,65 s. |

O ponto fraco dobra o dano dos disparos e remove a redução de armadura durante a janela. A barra fixa mostra vida, etapa, proteção, preparação, investida e oportunidade de contra-ataque. O cenário recebe avisos da área do impacto, do caminho da investida, da mira dos projéteis e das posições dos pilares.

O chefe só começa a agir quando o jogador se aproxima da arena. Pilares não aparecem atravessando o jogador. A morte do chefe remove seus projéteis, pilares e reforços. Quando os demais objetivos obrigatórios também estão cumpridos, a pergunta final abre automaticamente, sem exigir a caminhada restante até a saída. A resposta correta mostra a vitória e salva a conclusão; a resposta errada mantém a repetição obrigatória da fase.

## Verificação

Use `python tests/run_review.py`. A rotina inclui as dez fases para detectar regressões, mais testes específicos de VIRUS ZERO:

- Escudo dos relays, etapas, disparos reais e derrota.
- Impacto e investida atingindo um jogador no chão e sendo evitados com salto normal.
- Mira travada no ponto anunciado, criação de pilares e ausência de sobreposição no jogador.
- Aumento de dano na janela do ponto fraco e limpeza dos perigos após a morte.
- Ausência de ataques remotos antes da arena, preservação das habilidades e retorno/salvamento do checkpoint final.
- Renderização dos estados protegido, investida anunciada, pilares anunciados, combo e vulnerabilidade.
- Esquiva da rajada por salto temporizado e esquiva do combo ao abandonar uma plataforma superior usando movimento normal.
- Derrota por projétil abrindo a pergunta obrigatória e resposta correta concluindo e salvando a campanha.

Os resultados ficam em `review-results.json` e as capturas em `snapshots/phase-10-boss-*.png`. Os testes de esquiva usam dano ativo, sem proteção artificial. Os testes gerais de possibilidade de derrotar todos os inimigos continuam usando proteção contra dano para isolar funcionamento de dificuldade. Não houve uma partida humana contínua, teste físico de multitoque ou medição de FPS em equipamento fraco.
