// Focused Stage 4 checks inside the existing isolated campaign review closure.
function solveRouter(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let step=0;session.mode==='playing'&&step<140;step++){
    const a=session.model.next();assert(a,'router action missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'router control unreachable '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','router did not finish '+session.label());
}
test('router: deterministic models, alternate routes and animation completion',()=>{
  let variants=0;
  for(const id of Object.keys(ByteRunner.routerRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId:seed%2?'iface-console:transit':'wan-relay:link'});
    for(let n=0;!m.done&&n<150;n++){
      const a=m.next();assert(a,id+' missing hint');
      if(a.wait){assert(!m.done,'early animation completion');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}
      assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid input rejected '+m.message);
    }
    assert(m.done,'unsolvable '+id+' seed '+seed);variants++;
  }
  report.routerVariations=variants;
  for(const route of [[0,1,2,5],[0,3,4,5]]){
    const m=ByteRunner.repairV2Models.create('route-rail',()=>.3);for(let i=0;i<route.length-1;i++)m.apply({id:'edge'+route[i],target:'node'+route[i+1]});
    m.apply({id:'probe'});assert(JSON.stringify(m.route)===JSON.stringify(route),'alternate topology not accepted');
    m.tick(.1);assert(!m.done&&m.flight.progress>0,'packets skipped travel');
  }
});
test('router: six campaign objectives, rewards, saves and no duplicate XP',()=>{
  ByteRunner.repairV2.enabled=true;setup(3);xpRequired=999999;
  const ids=['gateway-tower:gateway','iface-lan:lan','core-main:table','wan-relay:link','iface-console:transit','iface-wan:wan'];
  assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'campaign identities/order changed');
  report.routerRewards=[];
  for(const c of components){
    player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','router repair missing');
    const before=xp,allBefore=objectives.allRepairs;solveRouter();updateRepair(.6);
    const expected=30+(!allBefore&&objectives.allRepairs?100:0);
    assert(c.repaired&&c.integrity===100&&c.corruption===0,'repair did not restore component');assert(xp===before+expected,'XP reward changed');
    assert(getSavedCampaign().repaired[components.indexOf(c)],'save lost router repair');
    const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate router reward');report.routerRewards.push({id:c.id,xp:expected,saved:true});
  }
  assert(objectives.allRepairs,'router objectives incomplete');
});
test('router: pause, cancel, failure and retry keep campaign economy',()=>{
  setup(3);xpRequired=999999;const c=components.find(c=>c.id==='core-main:table');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime});
  for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime}),'world moved behind router modal');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'cpu'});s.update(.05);assert(s.model.revision===revision,'paused router accepted input');s.setPaused(false);
  cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded repair');
  keys.add('e');updateRepair(0);s=repairSession;const health=player.health;
  for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="cpu"]').click();
  assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&xp===0&&!c.repaired,'failure changed penalty or rewards');
  s.action({id:'cpu'});assert(player.health===Math.max(1,health-5),'failure charged twice');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'retry lost lifecycle');
  solveRouter();updateRepair(.6);assert(c.repaired&&xp===30,'retry reward incorrect');
});
