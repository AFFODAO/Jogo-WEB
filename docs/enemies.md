# Comportamentos dos inimigos

`src/engine/enemies.js` contém os perfis, o registro de controladores, a navegação local, as variantes e os indicadores visuais. `game.js` fornece o contexto do mundo e mantém dano, projéteis, XP, objetivos, áudio e o controlador de VIRUS ZERO. Os mapas existentes não foram redesenhados nesta revisão.

| Tipo | Decisões e ataques |
| --- | --- |
| Básico | Patrulha; detecta por linha de visão e piso conectado; persegue somente no mesmo percurso alcançável; para para preparar o golpe. |
| Rápido | Aproximação, aviso de 0,58 s, investida com direção fixada, recuo de 0,7 s. Para em paredes e bordas. Pular evita a investida. |
| Blindado | Escudo voltado para a direção do movimento; dano frontal reduzido, dano traseiro aumentado; ataque preparado abre o núcleo por 1,35 s. Nunca bloqueia todo o dano. |
| Voador | Deslocamento com testes de colisão, desvio pelos eixos e tangente, aproximações em três alturas, mergulho anunciado de 0,75 s para uma posição fixada. |
| Atirador | Avalia posições do piso por visibilidade e distância; recua perto do jogador; mira fixada durante aviso de 0,7 s; não dispara através de paredes opacas. |
| Parasita | Procura componentes visíveis próximos; infecta e reduz a velocidade de reparo para 65%, sem impedir sua conclusão; fortalece aliados visíveis; invocação anunciada de 1 s, até dois reforços vivos e quatro ao todo. Não desfaz reparos concluídos. |

Ataques de contato conferem distância e visibilidade ao executar. Os reforços precisam de piso livre, expiram em 13 segundos e mantêm a recompensa de XP reduzida. Os limites de invocação e o fork de arquivos persistem no salvamento. Inimigos terrestres acompanham pisos móveis; se o apoio desaparecer, caem e aterrissam. O início de cada inimigo respeita seus limites de navegação, corrigindo inclusive o atirador da fase 2 que estava além da plataforma de origem.

## Variantes na campanha

- Fase 2: vírus de arquivo produz um único fork anunciado após receber dano.
- Fase 3: sequestrador de pacotes captura somente um projétil por preparação e devolve um disparo fortalecido após o aviso; os demais tiros continuam acertando.
- Fase 5: interferência Wi-Fi lança dois sinais durante o mergulho. Acertos causam lentidão de 18% por 0,7 s, sem reduzir o pulo.
- Fase 8: vírus DNS anuncia uma resolução e seu eco, disparando duas vezes contra a mesma posição, sem perseguir o jogador com a mira.
- Fase 9: invasor de firewall combina escudo frontal com contramedida à distância anunciada por 0,8 s; o disparo expõe seu núcleo.

VIRUS ZERO conserva as três etapas e todos os requisitos dos relays e da pergunta final. A etapa final também intercala investidas entre os padrões existentes. Nas etapas avançadas ele mantém distância para disparar; as invocações possuem aviso próprio. Arcos orbitais indicam a etapa, o corpo comprime durante preparação e expande no impacto, e cada transição/aviso/impacto possui áudio sintetizado distinto. Colisões com coberturas continuam expondo o núcleo.

## Extensão

Carregue um script após `enemies.js` e antes de `game.js`:

```js
ByteRunner.enemies.register('novo-tipo', (enemy, context, dt) => {
  // Atualize a máquina de estados usando context.shapes, playerX/playerY,
  // damage, fire, spawn e sound. Consulte lane() e sight() para navegação.
}, { hp:3, radius:15, speed:50, damage:8, xp:60, color:'#98f8ff' });
```

Uma entidade do mapa pode selecionar `type` e `variant`; controladores específicos já registrados em `ByteRunner.levels` continuam tendo prioridade. O renderizador aceita animações por estado e possui animação vetorial como fallback. Morte emite partículas e anel expansivo; dano aplica flash e oscilação. Os sons respeitam o botão de áudio e as restrições de autoplay do navegador.

## Verificação e limites

`python tests/run_review.py` executa o jogo real por `file://` no Chrome headless. `tests/enemies.js` verifica alcance, paredes, bordas, investida e esquiva, armadura direcional, preparação e mira fixada, desvio aéreo, infecção e suporte, variantes, invocações, XP único, pisos móveis, queda, efeitos de reparo/movimento e persistência. As verificações anteriores continuam exercitando combate nas dez fases, habilidades, perguntas, checkpoints, salvamento, etapas do chefe e vitória.

A navegação terrestre é local ao piso conectado: os inimigos não planejam saltos entre andares nem atravessam portais. Os testes não substituem uma sessão humana de balanceamento, medição de FPS em aparelhos fracos ou avaliação auditiva dos sons.
