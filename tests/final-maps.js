// Executed independently for each campaign phase, with three real seeds per scope.
const finalPhase=FINAL_PHASE,finalTheme=ByteRunner.environmentArt.themes[finalPhase-1];
const finalSeeds=['review-alpha','review-beta','review-gamma'].map(s=>'phase-'+String(finalPhase).padStart(2,'0')+'-'+s);
report.cases=[];report.phase=finalPhase;report.theme=finalTheme;report.seeds=finalSeeds;
function finalAtStart(){const p=mapStart();player.x=p.x;player.y=p.y;player.vy=0;player.grounded=true;keys.clear();}
function finalReach(){
  const signature=JSON.stringify(solids());
  try{return reachability();}finally{assert(JSON.stringify(solids())===signature,'collision state changed during frozen-clock probe');}
}
function finalExit(nodes){const e=phaseData.map.exit;return nodes.some(n=>n.z+34>e.x&&n.a<e.x+e.width&&n.y+48>e.y&&n.y<e.y+e.height);}
function finalCanRepair(nodes,c){return nodes.find(n=>Math.abs(c.y+c.height/2-n.y-24)<=78&&n.z+17>=c.x+c.width/2-76&&n.a+17<=c.x+c.width/2+76);}
const fingerprints={campaign:new Set(),procedural:new Set()};
for(const scope of ['campaign','procedural'])for(const seed of finalSeeds) {
  const row={scope,seed,status:'RUNNING',states:[]};report.cases.push(row);
  window.__reviewProgress?.('Final phase '+finalPhase+' // '+scope+' // '+seed);
  test('final audit: '+scope+' / '+finalTheme+' / '+seed,()=>{
    try {
      let map,repeat;const begin=performance.now();
      if(scope==='campaign') {
        const recipe=ByteRunner.maps.clone(PHASES[finalPhase-1].generation.recipe);recipe.seed=seed;
        map=ByteRunner.maps.clone(ByteRunner.mapGeneration.compile(recipe));repeat=ByteRunner.mapGeneration.compile(recipe);
        map.map.checkpointMode=PHASES[finalPhase-1].map.checkpointMode;
      } else {
        const options={seed,theme:finalTheme,difficulty:Math.min(5,1+Math.floor((finalPhase-1)/2)),roomCount:12,optionalRatio:.4,portals:seed.endsWith('gamma')};
        map=ByteRunner.proceduralMaps.generateGameplay(options);repeat=ByteRunner.proceduralMaps.generateGameplay(options);
      }
      row.generationAndReplayMs=performance.now()-begin;
      // Campaign checkpoint policy is an adapter over compile's ordered default.
      const compare=ByteRunner.maps.clone(map);if(scope==='campaign')compare.map.checkpointMode=repeat.map.checkpointMode;
      assert(JSON.stringify(compare)===JSON.stringify(repeat),'same seed differs');
      row.signature=ByteRunner.mapAudit.signature(map);fingerprints[scope].add(row.signature);
      assert(!ByteRunner.maps.validate(map).length,'invalid schema');assert(!ByteRunner.mapAudit.topology(map).isolated.length,'isolated graph rooms');
      setup(finalPhase-1);loadMap(map,true);campaignStarted=false;running=true;paused=false;xpRequired=999999;endPhaseIntro();
      assert(!unlockedSkills.length&&player.jumpPower===JUMP_SPEED,'optional abilities in audit');
      let nodes=[];
      for(let round=0;round<=components.length+phaseData.entities.interactives.length+2;round++) {
        finalAtStart();nodes=finalReach();
        row.states.push({afterRepairs:components.filter(c=>c.repaired).map(c=>c.id),surfaces:nodes.length,exit:finalExit(nodes),remainingRepairs:components.filter(c=>!c.repaired).map(c=>({id:c.id,accessible:Boolean(finalCanRepair(nodes,c))})),activePortals:levelRuntime.connections().map(l=>l.id)});
        const c=components.find(c=>!c.repaired&&finalCanRepair(nodes,c));
        if(c) {
          const n=finalCanRepair(nodes,c);player.x=Math.max(n.a,Math.min(n.z,c.x));player.y=n.y;keys.add('e');updateRepair(0);keys.clear();
          assert(repairSession?.model,'minigame not opened '+c.id);solveRepairUI();updateRepair(.6);assert(c.repaired,'native repair failed '+c.id);
          const returned=finalReach(),start=mapStart();assert(returned.some(s=>start.x>=s.a-1&&start.x<=s.z+1&&Math.abs(s.y-start.y)<3),'repair traps player away from start '+c.id);
          continue;
        }
        let changed=false;
        for(const s of phaseData.entities.interactives) {
          if(levelRuntime.getFlag(s.flag||s.id)||!levelRuntime.matches(s.requires))continue;
          const n=nodes.find(n=>Math.abs(s.y+20-n.y-24)<60&&n.z+34>=s.x-50&&n.a<=s.x+70);if(!n)continue;
          player.x=Math.max(n.a,Math.min(n.z,s.x));player.y=n.y;
          levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
          changed ||= Boolean(levelRuntime.getFlag(s.flag||s.id));
        }
        if(!changed)break;
      }
      assert(components.every(c=>c.repaired),'unreachable repair: '+components.filter(c=>!c.repaired).map(c=>c.id));
      assert(phaseData.entities.interactives.every(s=>levelRuntime.getFlag(s.flag||s.id)),'unreachable interactive');
      finalAtStart();nodes=finalReach();assert(finalExit(nodes),'exit unreachable after repairs');
      row.rooms=phaseData.generation.rooms.length;
      const isolated=phaseData.generation.rooms.filter(r=>!nodes.some(n=>n.a<r.x+r.width&&n.z+34>r.x&&n.y+48>r.y&&n.y<r.y+r.height));
      assert(!isolated.length,'physically isolated room: '+isolated.map(r=>r.id));
      for(const link of levelRuntime.connections()) {
        player.x=link.x;player.y=link.y+link.height-48;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
        assert(player.x===link.to.x&&player.y===link.to.y,'conditional portal redirects '+link.id);
        assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'portal in wall '+link.id);
      }
      const missing=new Set(phaseData.entities.platforms.filter(p=>!nodes.some(n=>n.id===p.id)).map(p=>p.id));
      for(const time of [1.5,4.5])if(missing.size){animationTime=time;finalAtStart();for(const n of finalReach())missing.delete(n.id);}
      row.unprovenPlatforms=[...missing];assert(!missing.size,'platform access not proven: '+[...missing]);
      const boxes=solids();
      const embedded=components.filter(c=>boxes.some(s=>overlaps(c,s))).map(c=>c.id);
      embedded.push(...viruses.filter(v=>boxes.some(s=>v.x+v.radius>s.x&&v.x-v.radius<s.x+s.w&&v.y+v.radius>s.y&&v.y-v.radius<s.y+s.h)).map(v=>v.id));
      embedded.push(...collectibles.filter(c=>boxes.some(s=>c.x+c.radius>s.x&&c.x-c.radius<s.x+s.w&&c.y+c.radius>s.y&&c.y-c.radius<s.y+s.h)).map(c=>c.id));
      row.embedded=embedded;assert(!embedded.length,'embedded elements: '+embedded);
      for(const [i,p] of phaseData.map.checkpoints.entries()) {
        checkpointIndex=i;checkpointX=p.x;checkpointY=p.y;respawnAtCheckpoint();const x=player.x,y=player.y;
        for(let t=0;t<60;t++)movePlayer(1/60);assert(player.grounded&&Math.abs(player.x-x)<.1&&Math.abs(player.y-y)<.1,'unstable checkpoint '+i);
      }
      checkpointIndex=-1;checkpointX=mapStart().x;checkpointY=mapStart().y+48;damageCooldown=0;player.health=1;damagePlayer(20,{x:0});
      assert(player.health===100&&components.every(c=>c.repaired),'death lost repair progress');
      for(let t=0;t<300;t++)updateCombat(1/120);player.health=100;damagePlayer(10,{x:0});assert(player.health<100,'permanent invulnerability after death');
      const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');
      if(temp){finalAtStart();const state=getPlatformState(temp);state.active=true;state.triggered=true;state.elapsed=0;state.respawning=false;for(let t=0;t<Math.ceil(((temp.duration||1.8)+.2)*60);t++)update(1/60);assert(!state.active,'temporary platform never disappears');for(let t=0;t<Math.ceil(((temp.respawnDelay||3)+.2)*60);t++)update(1/60);assert(state.active,'temporary platform permanently disappeared');}
      row.status='PASS';row.repairs=components.length;row.checkpoints=phaseData.map.checkpoints.length;row.surfaces=nodes.length;
    }catch(error){row.status='FAIL';row.error=error.stack;row.diagnostics={graph:phaseData.generation.graph,rooms:phaseData.generation.rooms,platforms:phaseData.entities.platforms,obstacles:phaseData.entities.obstacles,start:mapStart(),player:{x:player.x,y:player.y},reached:finalReach()};throw error;}
  });
  await new Promise(resolve=>setTimeout(resolve,0));
}
test('final audit: compare structures and identity / '+finalTheme,()=>{
  assert(fingerprints.procedural.size===3,'procedural seeds share identical collision geometry');
  report.structuralVariety={campaign:fingerprints.campaign.size,procedural:fingerprints.procedural.size};
  assert(PHASES[finalPhase-1].theme===finalTheme,'campaign identity mismatch');
});
running=false;
