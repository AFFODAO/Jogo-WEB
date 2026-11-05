const procedural=ByteRunner.proceduralMaps;
report.seeds=[];
const fingerprints=new Set();
const collisionFingerprints=new Set();
for(const seed of ['pcb-alpha','pcb-beta','pcb-gamma']){
  const row={seed};report.seeds.push(row);
  test('procedural: deterministic topology and physical traversal // '+seed,()=>{
    const options={seed,roomCount:12,difficulty:2,optionalRatio:.4};
    const definition=procedural.generate(options),repeat=procedural.generate(options);
    assert(JSON.stringify(definition)===JSON.stringify(repeat),'seed not reproducible');
    const graph=definition.generation.graph;
    const fingerprint=JSON.stringify({nodes:graph.nodes,edges:graph.edges});fingerprints.add(fingerprint);
    collisionFingerprints.add(JSON.stringify([...definition.map.ground.segments,...definition.entities.platforms,...definition.entities.obstacles].map(({x,y,width,height})=>[x,y,width,height]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))));
    assert(new Set(graph.nodes.map(n=>n.type)).size===8,'missing room roles');
    assert(graph.nodes.length===12&&graph.edges.length>=12,'missing rooms or cycles');
    assert(!procedural.validate(definition).length&&!ByteRunner.maps.validate(definition).length,'invalid structure/schema');
    const mandatory=ByteRunner.maps.clone(definition);mandatory.entities.platforms=mandatory.entities.platforms.filter(p=>p.type==='fixed');
    setup(0);loadMap(mandatory,true);campaignStarted=false;
    assert(!unlockedSkills.length,'traversal must use base abilities');
    player.x=definition.map.start.x;player.y=definition.map.start.y;player.vy=0;player.grounded=true;
    const reached=reachability();
    const missed=definition.map.checkpoints.filter(p=>!reached.some(n=>p.x>=n.a-1&&p.x<=n.z+1&&Math.abs(p.y-48-n.y)<2));
    assert(!missed.length,'unreachable room checkpoints: '+JSON.stringify(missed));
    const end=definition.map.exit;assert(reached.some(n=>n.z>=end.x&&n.a<=end.x+end.width&&Math.abs(n.y-end.y)<2),'exit unreachable');
    player.x=end.x;player.y=end.y;player.vy=0;player.grounded=true;
    const returned=reachability();assert(definition.map.checkpoints.every(p=>returned.some(n=>p.x>=n.a-1&&p.x<=n.z+1&&Math.abs(p.y-48-n.y)<2)),'return route missing');
    Object.assign(row,{rooms:graph.nodes.length,edges:graph.edges.length,cycles:graph.edges.length-graph.nodes.length+1,optionalRooms:graph.optionalCount,mainRooms:graph.mainPath.length,reachableSurfaces:reached.length,returnSurfaces:returned.length,roomCheckpoints:definition.map.checkpoints.length,status:'PASS'});
    setup(0);
  });
  if(row.status==='PASS'){
    loadMap(procedural.generate({seed,roomCount:12,difficulty:2,optionalRatio:.4}),true);campaignStarted=false;await levelVisuals.ready;
    const old={width,height,pixelRatio,cameraX,cameraY,cw:canvas.width,ch:canvas.height};
    width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);draw();
    report.snapshots.push({phase:1,position:'procedural-'+seed,seed,image:captureCanvas()});
    width=old.width;height=old.height;pixelRatio=old.pixelRatio;cameraX=old.cameraX;cameraY=old.cameraY;canvas.width=old.cw;canvas.height=old.ch;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    setup(0);
  }
}
test('procedural: three seeds differ structurally',()=>assert(fingerprints.size===3&&collisionFingerprints.size===3,'seeds repeat topology/collision geometry'));
test('procedural: configuration limits and varied sizes remain valid',()=>{
  for(const options of [{roomCount:8,difficulty:1,optionalRatio:.2},{roomCount:24,difficulty:5,optionalRatio:.7},{roomCount:16,difficulty:3,optionalRatio:.5,portals:true}]){
    const map=procedural.generate({seed:0,...options});assert(map.generation.graph.nodes.length===options.roomCount&&!procedural.validate(map).length,'configuration not respected');
    if(options.portals)assert(map.mechanics.some(m=>m.type==='portals'&&m.links.length===2),'bidirectional portal absent');
  }
  for(const options of [{roomCount:7},{roomCount:25},{difficulty:0},{optionalRatio:NaN},{seed:Infinity}]){let rejected=false;try{procedural.generate(options);}catch(e){rejected=true;}assert(rejected,'invalid configuration accepted');}
});
setup(0);running=false;
test('procedural: optional diagnostic portals work in both directions',()=>{
  setup(0);const map=procedural.generate({seed:'bus',portals:true});loadMap(map,true);campaignStarted=false;
  const links=levelRuntime.connections();assert(links.length===2,'portal links missing');
  for(const link of links){player.x=link.x;player.y=link.y;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});assert(player.x===link.to.x&&player.y===link.to.y,'portal did not teleport');}
  setup(0);running=false;
});
