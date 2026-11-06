// Additional regressions for requirements that were previously implicit.
report.audit={respawn:[],temporaryPlatforms:[],repairConsequences:[],geometry:[],pairs:[]};
test('audit: respawn protection expires in all phases and skill combinations',()=>{
  for(let phase=0;phase<10;phase++)for(const mode of ['base','armor','shield','all']) {
    setup(phase);viruses=[];xpRequired=999999;
    unlockedSkills=mode==='all'?ABILITIES.map(a=>({id:a.id,level:5})):mode==='base'?[]:[{id:mode,level:5}];restoreSkillEffects();
    respawnAtCheckpoint();const initial=player.health;
    damagePlayer(10,{x:0});assert(player.health===initial,'no initial protection '+phase+'/'+mode);
    for(let t=0;t<253;t++)updateCombat(1/120);
    damagePlayer(10,{x:0});assert(player.health<initial,'protection permanent '+phase+'/'+mode);
    let vulnerableTicks=0,shieldTicks=0;
    for(let t=0;t<3600;t++) {
      updateCombat(1/120);
      if(player.shieldTime>0)shieldTicks++;
      if(t%30===0){player.health=100;damagePlayer(10,{x:0});if(player.health<100)vulnerableTicks++;}
    }
    assert(vulnerableTicks>12,'no repeated vulnerability '+phase+'/'+mode);
    if(mode==='shield'||mode==='all')assert(shieldTicks>0,'shield did not activate');
    report.audit.respawn.push({phase:phase+1,mode,damageAfterProtection:true,vulnerableSamples:vulnerableTicks,shieldActiveSamples:shieldTicks});
  }
});
test('audit: stale shield without skill never blocks real damage',()=>{
  setup(0);unlockedSkills=[];damageCooldown=0;player.shieldTime=99999;
  damagePlayer(10,{x:0});assert(player.health===90,'stale shield granted invulnerability');
});
test('audit: every temporary platform disappears, returns and waits for occupied space',()=>{
  for(let phase=0;phase<10;phase++) {
    setup(phase);components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();viruses=[];xpRequired=999999;
    for(const spec of phaseData.entities.platforms.filter(p=>p.type==='temporary')) {
      const shape=platformShape(spec);assert(shape,'temporary never enabled '+spec.id);
      const state=getPlatformState(spec);state.triggered=true;
      player.x=mapStart().x;player.y=mapStart().y;player.vy=0;
      const duration=spec.duration ?? 1.8,delay=spec.respawnDelay ?? 3;
      for(let t=0;t<Math.ceil((duration+.1)*60);t++)update(1/60);
      assert(!state.active,'temporary failed to vanish '+spec.id);
      // Keep the robot inside its respawn rectangle while only platform time advances.
      player.x=shape.x+5;player.y=shape.y+1;player.vy=0;
      state.elapsed=delay+.1;state.active=false;state.respawning=true;
      // Freeze movement by temporarily using a remote player position in movement itself
      // is avoided: dt=0 executes the actual occupied-space guard without moving R-07.
      update(0);assert(!state.active,'temporary reappeared inside robot '+spec.id);
      player.x=mapStart().x;player.y=mapStart().y;player.vy=0;
      for(let t=0;t<Math.ceil((delay+.1)*60);t++)update(1/60);
      assert(state.active&&platformShape(spec),'temporary failed to return '+spec.id);
      report.audit.temporaryPlatforms.push({phase:phase+1,id:spec.id,disappeared:true,returned:true,occupancyGuard:true});
    }
  }
});
test('audit: actual minigame success changes world state for every component',()=>{
  const signature=()=>JSON.stringify({shapes:solids().map(s=>[s.id,s.x,s.y,s.w,s.h]),links:levelRuntime.connections().map(p=>p.id),zones:phaseData.mechanics.filter(m=>m.type==='environment').flatMap(m=>m.zones.filter(z=>levelRuntime.matches(z.requires)&&!(z.disabledWhen&&levelRuntime.matches(z.disabledWhen))).map(z=>z.id)),cameras:phaseData.mechanics.filter(m=>m.type==='security-grid').flatMap(m=>m.cameras.filter(c=>!(c.disabledWhen&&levelRuntime.matches(c.disabledWhen))).map(c=>c.id))});
  for(let phase=0;phase<10;phase++) {
    setup(phase);xpRequired=999999;
    for(const c of components) {
      player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
      const before=signature();solveRepairUI();updateRepair(.6);
      assert(c.repaired&&before!==signature(),'minigame repair has no world consequence '+phase+'/'+c.id);
      report.audit.repairConsequences.push({phase:phase+1,id:c.id,changed:true});
    }
  }
});
test('audit: holding E cannot complete any campaign minigame',()=>{
  for(let phase=0;phase<10;phase++) {
    setup(phase);const c=components[0];player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
    for(let t=0;t<600;t++){keys.add('e');update(1/60);}
    assert(!c.repaired&&repairSession?.blocksWorld,'passive repair still works '+phase);
    cancelRepair();
  }
});
test('audit: physical exit opens mandatory question and wrong answer resets on reload',()=>{
  for(let phase=0;phase<10;phase++) {
    setup(phase);xpRequired=999999;components.forEach(c=>c.repaired=true);viruses.forEach(v=>{v.alive=false;v.hp=0;});fulfilGoalsForQuestionTest();checkObjectives();
    const exit=phaseData.map.exit;
    player.x=exit.mode==='region'?exit.x+5:exit.x;player.y=exit.mode==='region'?exit.y+5:(Number.isFinite(exit.y)?exit.y:floorY()-63)-24;
    player.vx=player.vy=0;update(0);
    assert(phaseQuestionOpen&&!phaseTransition&&!campaignComplete,'exit skipped question '+phase);
    assert(QUESTION_BANK[phaseData.theme]?.length,'missing question bank');
    ui.questionOverlay.querySelector('[data-correct="false"]').click();
    ui.questionOverlay.querySelector('[data-correct="true"]').click();
    assert(questionRetryRequired,'second click bypassed wrong answer');
    continueCampaign();
    assert(phaseIndex===phase&&!phaseExitUnlocked&&!phaseTransition&&components.every(c=>!c.repaired)&&viruses.every(v=>v.alive),'reload bypassed replay '+phase);
    endPhaseIntro();
  }
});
// Geometry comparison ignores colors, labels, background art and sprite content.
const masks=[];
for(let phase=0;phase<10;phase++) {
  setup(phase);await levelVisuals.ready;components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
  const shapes=solids(),W=128,H=96,mask=new Uint8Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(shapes.some(s=>x/W*worldWidth()>=s.x&&x/W*worldWidth()<s.x+s.w&&y/H*worldHeight()>=s.y&&y/H*worldHeight()<s.y+s.h))mask[y*W+x]=1;
  masks.push(mask);
  const image=document.createElement('canvas');image.width=960;image.height=600;const c=image.getContext('2d');
  c.fillStyle='#080d17';c.fillRect(0,0,960,600);const scale=Math.min(920/worldWidth(),520/worldHeight()),ox=(960-worldWidth()*scale)/2,oy=55;
  c.font='bold 16px monospace';c.fillStyle='#eef6ff';c.fillText(String(phase+1).padStart(2,'0')+' · '+phaseData.name+' · '+worldWidth()+' × '+worldHeight(),20,28);
  for(const s of shapes){c.fillStyle=s.kind==='floor'?'#d9e1ed':s.kind==='platform'?'#78a9c7':'#687787';c.fillRect(ox+s.x*scale,oy+s.y*scale,Math.max(1,s.w*scale),Math.max(2,s.h*scale));}
  for(const link of levelRuntime.connections()){c.strokeStyle='#9effd9';c.beginPath();c.moveTo(ox+link.x*scale,oy+link.y*scale);c.lineTo(ox+link.to.x*scale,oy+link.to.y*scale);c.stroke();}
  c.fillStyle='#ff9a82';components.forEach(p=>c.fillRect(ox+p.x*scale-2,oy+p.y*scale-3,5,6));
  const start=mapStart();c.fillStyle='#9affba';c.fillRect(ox+start.x*scale-3,oy+start.y*scale-3,6,6);
  c.fillStyle='#ffe397';c.fillRect(ox+phaseData.map.exit.x*scale-3,oy+(phaseData.map.exit.y ?? floorY())*scale-3,6,6);
  report.snapshots.push({phase:phase+1,position:'structure',image:image.toDataURL()});
  report.audit.geometry.push({phase:phase+1,name:phaseData.name,layout:phaseData.map.layout,width:worldWidth(),height:worldHeight(),ground:phaseData.map.ground.segments.length,platforms:phaseData.entities.platforms.length,connections:levelRuntime.connections().length,occupiedCells:mask.reduce((a,b)=>a+b,0)});
}
test('audit: all 45 map pairs have different normalized collision structures',()=>{
  for(let a=0;a<10;a++)for(let b=a+1;b<10;b++) {
    let intersection=0,union=0;for(let i=0;i<masks[a].length;i++){intersection+=masks[a][i]&&masks[b][i];union+=masks[a][i]||masks[b][i];}
    const iou=intersection/union;report.audit.pairs.push({phases:[a+1,b+1],normalizedIoU:Number(iou.toFixed(4))});
    assert(iou<.97,'near-identical geometry '+(a+1)+'/'+(b+1)+': '+iou);
  }
});
// Audit the complete actor library explicitly; campaign phases load only their actors.
const animationLibrary=ByteRunner.visuals.create({assets:ByteRunner.artAssets.filter(a=>a.id==='r07'||a.id.startsWith('virus-'))});
await animationLibrary.ready;
test('audit: animated robot and enemy states change pixels over time',()=>{
  const surface=document.createElement('canvas');surface.width=64;surface.height=64;const c=surface.getContext('2d');
  for(const asset of ByteRunner.artAssets.filter(a=>a.id==='r07'||a.id.startsWith('virus-')))for(const state of Object.keys(asset.animations)) {
    const hashes=new Set();
    for(let frame=0;frame<asset.animations[state].frames.length;frame++) {
      c.clearRect(0,0,64,64);animationLibrary.sprite(c,{asset:asset.id,animation:state},{x:0,y:0,width:64,height:64},frame/asset.animations[state].fps+.00001);
      let hash=2166136261;for(const value of c.getImageData(0,0,64,64).data)hash=Math.imul(hash^value,16777619);hashes.add(hash>>>0);
    }
    assert(hashes.size>1,'animation is static '+asset.id+'/'+state);
  }
});
animationLibrary.dispose();
running=false;
