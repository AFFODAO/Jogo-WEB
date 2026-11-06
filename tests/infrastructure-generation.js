const infrastructureCanonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const infrastructureEqual=(a,b,label)=>assert(infrastructureCanonical(a)===infrastructureCanonical(b),label);
test('infrastructure generation: original content, checkpoints and completion survive compilation',()=>{
  for(let i=5;i<10;i++) {
    const phase=PHASES[i],original=LAST_FIVE_V2[i-5],blueprint=phase.generation.recipe.rooms[0].config.blueprint;
    infrastructureEqual(blueprint,original,'authored blueprint changed '+phase.id);
    for(const group of ['components','enemies','collectibles','interactives','gates','obstacles'])infrastructureEqual(phase.entities[group],original.entities[group],'entity content/order changed '+phase.id+'/'+group);
    infrastructureEqual(phase.entities.platforms.slice(0,original.entities.platforms.length),original.entities.platforms,'authored traversal changed');
    infrastructureEqual(phase.map.ground,original.map.ground,'floors changed');
    infrastructureEqual(phase.map.checkpoints,original.map.checkpoints,'checkpoints changed');
    infrastructureEqual(phase.map.start,original.map.start,'spawn changed');
    infrastructureEqual(phase.map.exit,original.map.exit,'exit changed');
    infrastructureEqual(phase.objectives,original.objectives,'mandatory objectives changed');
    infrastructureEqual(phase.completion,original.completion,'boss/question completion changed');
    infrastructureEqual(phase.assets,original.assets,'pixel art assets changed');
    infrastructureEqual(phase.mechanics.slice(0,original.mechanics.length),original.mechanics,'authored mechanics changed');
  }
});
function manualArenaSnapshot(phase) {
  const touches=e=>e.x+(e.width||e.radius||0)>4800;
  return {
    ground:phase.map.ground.segments.filter(touches),
    entities:Object.fromEntries(Object.entries(phase.entities).map(([group,items])=>[group,items.filter(touches)])),
    layers:phase.layers.flatMap(l=>(l.items||[]).filter(touches)),
    checkpoints:phase.map.checkpoints.filter(p=>p.x>=4800),
    exit:phase.map.exit,completion:phase.completion,
    lock:phase.entities.gates.find(e=>e.id==='core-access-lock')
  };
}
test('infrastructure generation: manual VIRUS ZERO arena is identical across seeds',()=>{
  const original=manualArenaSnapshot(LAST_FIVE_V2[4]),phase=PHASES[9];
  infrastructureEqual(manualArenaSnapshot(phase),original,'manual arena was changed');
  infrastructureEqual(phase.map.sections,LAST_FIVE_V2[4].map.sections,'data center sectors lost');
  for(const seed of ['arena-a','arena-b','arena-c',0,12345]) {
    const recipe=ByteRunner.maps.clone(phase.generation.recipe);recipe.seed=seed;
    const compiled=ByteRunner.mapGeneration.compile(recipe);
    const normalized=JSON.parse(JSON.stringify(compiled).replaceAll('world:',''));
    infrastructureEqual(manualArenaSnapshot(normalized),original,'seed changed manual arena '+seed);
  }
});
test('infrastructure generation: procedural additions cannot enter the boss arena',()=>{
  for(const kind of ['platform','lift','mechanic','scenery']) {
    const recipe=ByteRunner.maps.clone(PHASES[9].generation.recipe),config=recipe.rooms[0].config;
    if(kind==='platform')config.routes.push({id:'invalid-route',points:[[4790,700]]});
    if(kind==='lift')config.transmission={x:5000,y:700,width:128,range:80};
    if(kind==='mechanic')config.mechanics=[{id:'invalid-environment',type:'environment',zones:[]}];
    if(kind==='scenery')config.scenery=[{kind:'rack',x:5000,y:700,width:128,height:100}];
    let rejected=false;try{ByteRunner.mapGeneration.compile(recipe);}catch(error){rejected=error.message.includes('arena');}
    assert(rejected,'arena accepts generated '+kind);
  }
});
test('infrastructure generation: DHCP conflict region responds to its repair',()=>{
  setup(6);player.x=460;player.y=590;
  assert(levelRuntime.modifiers().speedMultiplier===.85,'duplicate addresses have no effect');
  components.find(c=>c.id==='c02').repaired=true;
  assert(levelRuntime.modifiers().speedMultiplier===1,'repair did not resolve address conflict');
});
test('infrastructure generation: all DNS portals land safely without chained activations',()=>{
  setup(7);const spec=phaseData.mechanics.find(m=>m.id==='ttl-root-shortcut');
  assert(spec.links.every(l=>!levelRuntime.connections().some(active=>active.id===l.id)),'cache shortcut starts unlocked');
  components.forEach(c=>c.repaired=true);
  for(const link of levelRuntime.connections()) {
    player.x=link.x;player.y=link.y+link.height-player.height;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});
    assert(player.x===link.to.x&&player.y===link.to.y,'shortcut did not execute '+link.id);
    assert(solids().some(s=>Math.abs(s.y-player.y-player.height)<2&&player.x<s.x+s.w&&player.x+player.width>s.x),'shortcut arrival lacks support');
    assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'shortcut arrival inside wall');
  }
});
running=false;
