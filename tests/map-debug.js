test('debug audit: isolated topology and model parity with real base movement',()=>{
  setup(0);const map=ByteRunner.maps.clone(PHASES[0]);map.map.width=1000;map.map.height=900;map.map.start={x:100,y:752};map.map.ground.segments=[{id:'floor',x:0,y:800,width:1000,height:100}];map.entities.platforms=[{id:'ledge',x:250,y:650,width:144,height:16,type:'fixed',collision:'one-way'}];map.entities.obstacles=[{id:'wall',x:500,y:680,width:32,height:120,collision:'solid'}];map.mechanics=[];
  loadMap(map,true);campaignStarted=false;running=true;player.x=100;player.y=752;player.vy=0;player.grounded=true;const shapes=solids(),index=ByteRunner.mapAudit.spatialIndex(shapes);let model={...player},indexed={...player};
  for(let i=0;i<240;i++) {
    const dir=i<150?1:-1,jump=i===0||i===170;keys.clear();keys.add(dir>0?'d':'a');jumpQueued=jump;
    model=ByteRunner.mapAudit.step(model,dir,jump,shapes,map.map);indexed=ByteRunner.mapAudit.step(indexed,dir,jump,index.near(indexed),map.map);movePlayer(1/60);
    assert(Math.abs(player.x-model.x)<.00001&&Math.abs(player.y-model.y)<.00001&&Math.abs(player.vy-model.vy)<.00001&&player.grounded===model.grounded,'read-only physics model differs at step '+i);
    assert(Math.abs(indexed.x-model.x)<.00001&&Math.abs(indexed.y-model.y)<.00001&&indexed.grounded===model.grounded,'spatial index changed collisions');
  }
  keys.clear();
});
test('debug audit: walk between contiguous supports below a low ceiling',()=>{
  const shapes=[{x:0,y:600,w:200,h:32,collision:'solid'},{x:200,y:600,w:200,h:32,collision:'solid'},{x:0,y:520,w:400,h:16,collision:'solid'}];
  const map={width:400,height:800,bounds:{left:true,right:true,ceiling:true}};
  assert(ByteRunner.mapAudit.edge({a:0,z:166,y:552},{a:200,z:366,y:552},shapes,map),'continuous walk falsely requires a jump');
});
const debugFixture={name:'Isolated test',map:{width:1200,height:800,start:{x:100,y:552},exit:{x:1080,y:536,width:64,height:64},bounds:{left:true,right:true,ceiling:true,floor:true}},entities:{components:[]},generation:{recipe:{start:{room:'a'}},rooms:[{id:'a',x:0,y:0,width:400,height:800},{id:'b',x:400,y:0,width:400,height:800},{id:'c',x:800,y:0,width:400,height:800}],links:[{from:{room:'a'},to:{room:'b'}}]}};
const debugShapes=[{id:'near',x:0,y:600,w:400,h:32,kind:'floor',collision:'solid'},{id:'far',x:800,y:600,w:400,h:32,kind:'floor',collision:'solid'},{id:'impossible',x:200,y:100,w:96,h:16,kind:'platform',collision:'one-way'}];
const debugBefore=JSON.stringify([debugFixture,debugShapes]),debugAnalysis=await ByteRunner.mapAudit.analyze(debugFixture,debugShapes);
test('debug audit: detect isolation, impossible ledge and missing exit without mutation',()=>{
  assert(debugAnalysis.topology.isolated.includes('c')&&debugAnalysis.unreachableRooms.includes('c'),'isolated room not detected');
  assert(!debugAnalysis.exitReached&&debugAnalysis.unproven.some(n=>n.id==='impossible'),'impossible platform/exit not detected');
  assert(JSON.stringify([debugFixture,debugShapes])===debugBefore,'analysis mutated map data');
});
const debugPortal=await ByteRunner.mapAudit.analyze(debugFixture,debugShapes,[{id:'route',x:320,y:524,width:40,height:76,to:{x:900,y:552}}]);
test('debug audit: active conditional portal updates reachability',()=>assert(debugPortal.exitReached&&!debugPortal.unreachableRooms.includes('c')&&!debugPortal.topology.isolated.includes('c'),'active portal ignored'));
setup(0);await levelVisuals.ready;draw();
if(ByteRunner.mapDebug.enabled) {
  const debugPanel=document.getElementById('map-debug'),debugState=JSON.stringify({player,components,xp,checkpointX,checkpointY,flags:levelRuntime.save()});
  debugPanel.querySelector('[data-action="analyze"]').click();
  const deadline=performance.now()+30000;while(!ByteRunner.mapDebug.analysis&&performance.now()<deadline)await new Promise(r=>setTimeout(r,20));
  test('debug audit: development overview, toggles, seed and readonly analysis',()=>{
    assert(debugPanel&&debugPanel.querySelectorAll('input[data-layer]').length===6,'debug layers missing');
    assert(debugPanel.textContent.includes('Seed:')&&ByteRunner.mapDebug.analysis,'seed/analysis absent');
    assert(JSON.stringify({player,components,xp,checkpointX,checkpointY,flags:levelRuntime.save()})===debugState,'debug changed gameplay');
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'F9'}));assert(debugPanel.hidden,'F9 did not hide debug');window.dispatchEvent(new KeyboardEvent('keydown',{key:'F9'}));assert(!debugPanel.hidden,'F9 did not show debug');
  });
  report.snapshots.push({phase:1,position:'map-debug',image:debugPanel.querySelector('canvas').toDataURL()});
  test('debug audit: loading another seed with same IDs invalidates the old analysis',()=>{
    assert(ByteRunner.mapDebug.analysis,'analysis fixture missing');
    const phase=ByteRunner.maps.clone(phaseData);phase.generation.seed='debug-reloaded-seed';
    ByteRunner.mapDebug.frame({phase,shapes:solids(),links:levelRuntime.connections(),player,repaired:components.filter(c=>c.repaired).map(c=>c.id),cacheSize:0});
    assert(!ByteRunner.mapDebug.analysis,'previous seed analysis remained visible');
  });
} else test('debug audit: disabled in normal campaign',()=>assert(!document.getElementById('map-debug'),'debug UI present in normal game'));
running=false;
