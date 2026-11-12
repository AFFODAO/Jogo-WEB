# Infraestrutura das cenas de reparo

Esta etapa prepara o redesenho. Nenhum puzzle foi migrado para uma nova cena. O catálogo mantém 43 tipos registrados, 40 usados pelos 67 componentes da campanha. IDs, distribuição, respostas, dificuldade, pistas, tentativas e recompensas continuam sob os contratos existentes de `repairs.js`, `repair-games.js` e `game.js`.

`src/engine/repair-scene.js` exporta `ByteRunner.repairScene`, carregado antes de `repair-games.js` na campanha e no laboratório. A política de movimento reduzido já é compartilhada com os reparos existentes.

## Contrato de cena

`create(host, {width, height, label, isActive})` cria apenas um espaço de coordenadas lógico, sem moldura, painel, instruções ou arte predefinida. O tamanho padrão é 640 × 360. Cada mecânica fornece composição, equipamento e arte pixel original próprios. As quatro imagens em `assets/referencias-minigames` foram inspecionadas como referências de composição e interação; não foram incorporadas nem copiadas.

O viewport ajusta a altura e a escala à largura disponível, sem ampliar acima de 1. `point(clientX, clientY)` converte coordenadas de tela para a cena após escala e rolagem. `fit()` força o ajuste; `ResizeObserver` acompanha mudanças. `hitTest(x, y, selector)` encontra destinos somente dentro da própria cena. Regiões interativas devem ter tamanho lógico suficiente para continuar utilizáveis no menor viewport; a escala não substitui a revisão de acessibilidade de cada puzzle.

`bindPointer(element, {start, move, end, cancel})` captura um ponteiro primário por cena, aceitando mouse, caneta e toque. `start` pode retornar `false` para rejeitar o gesto. `move` e `end` recebem posição atual, posição inicial e evento; `cancel` recebe a última posição. Cancelamento, perda de captura, desfoque, pausa, ocultação e descarte devolvem a peça ao proprietário por `cancel`, sem confirmar a alteração. O proprietário mantém a prévia visual separada do modelo e só confirma encaixe/conexão válida em `end`. Não reconstruir o DOM durante um gesto.

`angle`, `angleDelta`, `snap` e `clamp` permitem implementar rotação com travas, arraste limitado e alinhamento. `cablePath` produz uma curva entre âncoras lógicas, que a cena pode desenhar com sua própria identidade visual. `animate(element, frames, options)` aceita keyframes de translação para inserção/encaixe, rotação para chaves e mudanças visuais para indicadores. Usa passos por padrão, rastreia animações e retorna `null` com movimento reduzido ou cena inativa. O estado final deve vir do modelo/DOM, nunca depender do término de uma animação.

`onTick(callback)` registra maquinaria e retorna uma função de remoção. `update(dt)` usa segundos, limita cada passo a 50 ms e entrega `(delta, elapsed, reducedMotion)` ao callback. Não existe um segundo loop de `requestAnimationFrame`: o proprietário chama `update` no ciclo da sessão. `setPaused(true)` cancela gestos e pausa animações imediatamente. A função `isActive` deve consultar o mesmo bloqueio da sessão; mudanças nessa função são sincronizadas em `update`. Ao pausar o jogo, chamar também `setPaused`, pois o loop da sessão pode deixar de executar. Indicadores e animações CSS da cena acompanham a pausa.

`completion(check, commit)` retorna uma função de conclusão única. Chamar após uma alteração física confirmada; `check` deve consultar o validador existente e `commit` deve chamar `session.verify()`. Estados intermediários inválidos não chamam `verify`, não gastam tentativas e não concedem XP. Não usar esta conclusão automática em desafios cuja ação explícita faça parte da regra. Criar uma nova guarda para cada tentativa.

`dispose()` é idempotente e cancela gesto, listeners, observação, animações e callbacks antes de remover o viewport. O futuro renderizador deve descartar sua cena antes de remontar, reiniciar, cancelar ou fechar o reparo. A infraestrutura não grava saves nem modifica integridade, progresso ou estado do mundo.

## Migração futura

Cada puzzle deve manter seu gerador e validador e fornecer uma cena própria centrada no equipamento. Usar objetos, cabos, interruptores, medidores e feedback físico com pouco texto; todos os rótulos, nomes acessíveis e mensagens devem estar em pt-BR. Manter alternativa por clique/toque e teclado para todo gesto, foco visível e comandos de dica/pausa/fechamento. Não transformar o espaço lógico compartilhado em um único painel visual para todo o catálogo.

A integração com o Modo Desenvolvedor e a bancada mantém o mesmo carregamento da campanha. Os testes em `tests/repairs.js` exercitam a nova infraestrutura e as regras existentes pelo DOM. Resultados desta etapa: `tests/shared-scene-desktop-results.json` e `tests/shared-scene-mobile-results.json`.
