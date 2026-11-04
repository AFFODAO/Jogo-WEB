# Contrato de mapas e extensões

O motor carrega scripts clássicos em ordem, sem `fetch`, imports ESM ou build obrigatório. `src/engine/*` instala os serviços em `window.ByteRunner`; cada arquivo de mapa chama `ByteRunner.maps.register(definition)` e `campaign.js` relaciona os IDs. `game.js` instancia os serviços de uma fase e continua responsável pelos sistemas compartilhados.

## Definição de uma fase

Cada mapa possui `schemaVersion: 2`, `id`, `name`, `theme`, `objective`, `palette`, `map`, `entities` e `objectives`. `assets`, `layers`, `mechanics`, `presentation`, `playerVisual` e `completion` são extensões opcionais. Não coloque funções dentro da definição: comportamentos ficam nos registros de extensões.

| Campo | Contrato |
| --- | --- |
| `map.width`, `map.height` | Dimensões do mundo. A altura pode ser `"viewport"` para conservar o comportamento legado. |
| `map.layout` | `horizontal`, `vertical`, `maze`, `multi-route`, `arena` ou `hub`. Não gera plataformas. |
| `map.start` | `x`, `y` absoluto, ou `anchor: "floor"` e `offset`. |
| `map.bounds` | Limites `left`, `right`, `ceiling`, `floor`. Em chão explícito, `floor` não cria um piso sintético. |
| `map.camera` | `axes: ["x", "y"]`, `followOffsetX`, `followOffsetY`. Desative um eixo removendo-o da lista. |
| `map.ground` | Ausente: piso legado com `map.pits`. `mode: "explicit"`: somente `segments` com `id`, `x`, `y`, `width`, `height` e colisão opcional. |
| `map.exit` | Formato legado ou `{mode:"region", x, y, width, height}`. Uma região não cria parede invisível. Use uma entidade de porta se precisar de bloqueio físico. |
| `map.checkpoints` | Lista de coordenadas X ou objetos `{x,y}`; Y é a posição dos pés. O índice permite avançar mesmo quando o próximo ponto fica abaixo ou à esquerda. |
| `map.checkpointMode` | `legacy` conserva a travessia horizontal; `proximity` usa proximidade; `ordered` exige alcançar os pontos na ordem e permite voltar à mesma sala sem ativar prematuramente um ponto posterior. |
| `map.progress.axis` | `x`, `y` ou `objectives`. Na última opção, mede a proporção de objetivos declarados em `goals`. |
| `entities` | Listas independentes de `platforms`, `obstacles`, `gates`, `components`, `enemies`, `collectibles`, `features`, `interactives`. |

Entidades têm IDs únicos dentro da fase. Coordenadas Y absolutas têm prioridade; `anchor: "floor"` com `offset` mantém elementos relativos ao chão legado. Plataformas definem `fixed`, `moving`, `temporary` ou `dangerous`, dimensões, colisão e seus próprios parâmetros de movimento/ciclo. Nenhum tipo é escolhido pela posição na lista. As plataformas móveis e temporárias continuam usando a implementação compartilhada da física.

## Condições e objetivos

Plataformas, obstáculos, pisos explícitos e interativos aceitam `requires`. Obstáculos também aceitam `disabledWhen`; portas aceitam `opensWhen`. Os campos legados `requiresComponentId` continuam funcionando.

```js
{
  id: "maintenance-door", x: 840, y: 400, width: 24, height: 100,
  opensWhen: {
    all: [{ component: "relay-a" }, { flag: "power" }]
  }
}
```

Condições disponíveis: `{component:"id"}`, `{enemyDefeated:"id"}`, `{flag:"name",value:true}`, `{all:[...]}`, `{any:[...]}` e `{not:condition}`. Flags pertencem ao runtime, não ao mapa congelado.

Em `entities.interactives`, um `type: "switch"` ativa uma flag por proximidade e pressão de E; `toggle:true` alterna o valor. `type: "trigger"` ativa por contato. `once:true` limita a uma utilização. Um reparo próximo tem prioridade sobre um interruptor para não executar as duas ações com a mesma tecla. Interativos podem ter `requires`, `visual`, `label`, `message`, `range` e `hidden`.

`objectives` conserva `repairAllComponents`, `defeatAllViruses`, contagens legadas e `requireExitQuestion`. A campanha mantém esse último campo verdadeiro nas dez fases. `goals` adiciona requisitos locais:

```js
goals: [
  { id: "restore", type: "repair", ids: ["relay-a"] },
  { id: "clear", type: "defeat", ids: ["guard-a"] },
  { id: "data", type: "collect", ids: ["packet-a"] },
  { id: "power", type: "condition", condition: { flag: "power" } },
  { id: "room", type: "region", x: 600, y: 640, width: 90, height: 60 }
]
```

Todos os requisitos habilitados precisam ser concluídos. Um mapa pode desligar as duas metas legadas e usar somente `goals`. A fase 10 declara `completion: {type:"boss-question",enemyId:"e08"}` para abrir a pergunta após o chefe e os demais objetivos, sem uma regra baseada no índice da fase.

## Mecânicas e inimigos

Crie um script de comportamento, carregue-o antes de `game.js` e registre um tipo:

```js
ByteRunner.levels.registerMechanic("power-grid", (spec, state) => {
  let repairs = 0;
  return {
    onEvent(name, entity) {
      if (name === "repair") {
        repairs++;
        state.setFlag(spec.flag, repairs >= spec.required);
      }
    },
    save: () => ({ repairs }),
    restore(saved) { repairs = saved?.repairs || 0; },
    dispose() { /* Remova listeners ou recursos externos, se existirem. */ }
  };
});
```

Somente a fase que declara `mechanics: [{id:"grid-a",type:"power-grid",flag:"power",required:2}]` instancia essa mecânica. Métodos opcionais: `update(dt,input)`, `onEvent(name,entity)`, `save()`, `restore(data)` e `dispose()`. Eventos: `repair`, `enemyDefeated`, `interact`.

`state.context` expõe getters de jogador, componentes, inimigos e coletáveis, além de `solids`, dimensões do mundo, partículas, feedback, dano e disparos. Use os getters para consultar o estado atual. Cada troca de mapa descarta os controladores anteriores.

Inimigos continuam usando os perfis conhecidos, com valores próprios declarados no mapa. Comportamentos novos podem ser registrados por `ByteRunner.levels.registerEnemyBehavior(type, (enemy, state) => {})`; a entidade escolhe o tipo em `controller`. Esse handler substitui o cérebro padrão e recebe `dt`, posição do jogador e o contexto. Guarde seu estado serializável em `enemy.state`; os temporizadores e as regras desse comportamento são responsabilidade do handler.

## Sprites, animações, cenário e efeitos

```js
assets: [{
  id: "robot-sheet", src: "assets/robot.png",
  frameWidth: 32, frameHeight: 48, columns: 6,
  animations: {
    idle: { frames: [0], fps: 1 },
    run: { frames: [1,2,3,4], fps: 10 },
    attack: { frames: [4,5], fps: 8, loop: false }
  }
}],
playerVisual: { asset: "robot-sheet" },
layers: [{
  id: "distant-racks", type: "image", asset: "racks",
  pass: "background", parallaxX: 0.25, parallaxY: 0.1,
  x: 0, y: 0, width: 2400, height: 1000
}]
```

Declare também o asset `racks` no exemplo acima. Os caminhos `src` são relativos ao documento `index.html`. Assets carregam sem bloquear a campanha; enquanto uma imagem não está pronta ou falha, os atores conservam o desenho procedural. Falhas ficam em `levelVisuals.errors` para diagnóstico. Não foram incluídos novos sprites nesta etapa.

Estados do jogador: `idle`, `run`, `jump`. Inimigos: `idle`, `attack`, `hit`, `vulnerable`. Componentes: `idle`, `repaired`. Interativos: `idle`, `active`. Animações por ator reiniciam ao mudar de estado; sequências sem repetição seguram o último quadro. `visual.animation` seleciona uma animação explicitamente. `visual.flipX`, `offsetX`, `offsetY` e `smoothing` ajustam a apresentação. Um `visual` em plataformas, obstáculos e portas usa suas dimensões físicas.

Camadas têm ordem `z`, opacidade, espaço `world` ou `screen`, paralaxe em X/Y e passes `background`, `midground`, `foreground`. Os tipos básicos são `image` e `rects`. Para efeitos, iluminação ou um tilemap futuro, registre `ByteRunner.visuals.registerLayer(type, (ctx,layer,view,time,visuals) => {})`. A API não inclui editor de tilemaps nem um sistema completo de iluminação nesta etapa. `presentation.procedural:false` desliga o cenário temático antigo de uma fase; pisos e obstáculos continuam visíveis e colidíveis.

## Minigames de reparo

Cada componente pode escolher `repair: {type:"hold"}` ou outro tipo registrado. A ausência desse campo mantém o reparo atual, inclusive o aprimoramento de velocidade. `sequence` é um exemplo opcional com `keys:["1","2","3"]`, sem aplicação à campanha nesta etapa.

```js
ByteRunner.repairs.register("packet-order", (spec, context) => ({
  blocksWorld: true,
  progress: 0,
  status: "running",
  mount(container) { /* Monte aqui botões, SVG ou canvas próprios. */ },
  update(dt, input) { /* input.keys; altere progress e status. */ },
  label() { return "ORDENE OS PACOTES"; },
  cancel() { this.status = "cancelled"; },
  dispose() { /* Libere listeners e recursos criados em mount. */ }
}));
```

O contexto fornece duração ajustada pelas habilidades, componente e jogador. `progress` vai de 0 a 1; `status` pode ser `running`, `success`, `failed`, `cancelled`. `blocksWorld:true` suspende física e ataques enquanto o minigame recebe entrada. O host monta a interface, oferece cancelamento e pausa e descarta os recursos ao concluir ou trocar de fase. Somente `success` repara, concede XP e emite o evento; falhar ou cancelar permite outra tentativa. Um reparo incompleto reinicia após recarregar, sem conceder XP indevido. O estado persistente do cenário fica nas flags e mecânicas da fase.

## Testes e ferramentas

- `python tools/check_maps.py`: audita módulos de dados e manifesto, sem abrir navegador.
- `python tests/run_review.py`: regressão das dez fases e testes da arquitetura no Chrome, com perfil isolado.
- `tests/map-baseline.json`: referência dos mapas anteriores à reconstrução; o teste confirma que os dez layouts foram substituídos. `tests/fixtures/first-five-v2.json` protege os mapas 1–5 contra alterações durante a reconstrução das fases 6–10.
- `python tools/import_maps.py arquivo.json`: importa um array de definições explícitas para os arquivos de mapa. Não desenha plataformas nem escolhe uma geometria compartilhada. Exige `--overwrite` para substituir arquivos existentes. Confira as inclusões de scripts em `index.html` se importar arquivos novos.

O mapa `tests/fixtures/room-map.json` e seu controlador só são registrados na cópia de teste. Eles comprovam pisos descontínuos, objetivos compostos, porta/ponte condicionais, reparo substituível e checkpoint descendente sem acrescentar uma fase à campanha.
