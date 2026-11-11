const infrastructureCanonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const infrastructureEqual=(a,b,label)=>assert(infrastructureCanonical(a)===infrastructureCanonical(b),label);
test('infrastructure generation: original content, checkpoints and completion survive compilation',()=>{
  for(let i=5;i<10;i++) {
    if(i===8){
      const phase=PHASES[i],replay=ByteRunner.mapGeneration.compile(phase.generation.recipe);
      const normalized=JSON.parse(JSON.stringify(replay).replaceAll('world:',''));
      infrastructureEqual(normalized.entities,phase.entities,'Firewall replay entities');
      infrastructureEqual(normalized.mechanics,phase.mechanics,'Firewall replay mechanics');
      assert(phase.map.regions.length===6&&phase.map.checkpoints.length===18,'Firewall sector contract');
      continue;
    }
    if(i===7){const phase=PHASES[i],replay=ByteRunner.mapGeneration.compile(phase.generation.recipe);infrastructureEqual(replay.entities,phase.entities,'DNS replay entities');infrastructureEqual(replay.objectives,phase.objectives,'DNS replay objectives');assert(phase.generation.rooms.length===33&&phase.entities.components.length===7,'DNS domain contract');continue;}
    if(i===6){const phase=PHASES[i],replay=ByteRunner.mapGeneration.compile(phase.generation.recipe);infrastructureEqual(replay.entities,phase.entities,'DHCP replay entities');infrastructureEqual(replay.objectives,phase.objectives,'DHCP replay objectives');assert(phase.generation.rooms.length===25&&phase.entities.components.length===6,'DHCP city contract');continue;}
    if(i===5){const phase=PHASES[i],replay=ByteRunner.mapGeneration.compile(phase.generation.recipe);infrastructureEqual(replay.entities,phase.entities,'Cabling replay entities');infrastructureEqual(replay.objectives,phase.objectives,'Cabling replay objectives');assert(phase.generation.rooms.length===41&&phase.entities.components.length===7,'Cabling replacement contract');continue;}
    const phase=PHASES[i],replay=ByteRunner.mapGeneration.compile(phase.generation.recipe);
    const normalized=JSON.parse(JSON.stringify(replay).replaceAll('world:',''));
    for(const key of ['entities','objectives','mechanics','completion'])infrastructureEqual(normalized[key],phase[key],'Servers replay '+key);
    assert(phase.map.regions.length===7&&phase.map.checkpoints.length===32,'Servers region and checkpoint contract');
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
  const rebuilt=manualArenaSnapshot(phase), preserved=ByteRunner.maps.clone(rebuilt);
  const boundary=preserved.entities.obstacles.pop();
  assert(boundary.id==='arena-east-bulkhead'&&boundary.x===6600&&boundary.y===0&&boundary.height===960,'arena boundary changed');
  preserved.lock.opensWhen=original.lock.opensWhen;
  infrastructureEqual(preserved,original,'original manual arena geometry or boss was changed');
  infrastructureEqual(rebuilt.lock.opensWhen.all.map(c=>c.component),phase.entities.components.map(c=>c.id),'arena gate misses a repair');
  for(const seed of ['arena-a','arena-b','arena-c',0,12345]) {
    const recipe=ByteRunner.maps.clone(phase.generation.recipe);recipe.seed=seed;
    const compiled=ByteRunner.mapGeneration.compile(recipe);
    const normalized=JSON.parse(JSON.stringify(compiled).replaceAll('world:',''));
    infrastructureEqual(manualArenaSnapshot(normalized),rebuilt,'seed changed manual arena '+seed);
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
  setup(6);const zone=phaseData.mechanics.filter(m=>m.type==='environment').flatMap(m=>m.zones).find(z=>z.speedMultiplier===.85);player.x=zone.x+24;player.y=zone.y+16;
  assert(levelRuntime.modifiers().speedMultiplier===.85,'duplicate addresses have no effect');
  components.find(c=>c.id===zone.disabledWhen.component).repaired=true;
  assert(levelRuntime.modifiers().speedMultiplier===1,'repair did not resolve address conflict');
});
test('infrastructure generation: all DNS portals land safely without chained activations',()=>{
  setup(7);const spec={links:phaseData.mechanics.filter(m=>m.type==='portals').flatMap(m=>m.links).filter(l=>l.requires?.component==='cache-crown:ttl')};assert(spec.links.length>=2,'TTL shortcuts missing');
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
