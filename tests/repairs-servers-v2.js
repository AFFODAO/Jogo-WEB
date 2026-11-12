// Final-server checks execute inside the isolated game closure, including VIRUS ZERO.
function solveServers(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let n=0;session.mode==='playing'&&n<240;n++){
    const a=session.model.next();assert(a,'server action missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'server control unreachable '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','server repair stalled '+session.label());
}
test('servers: 120 deterministic solvable variants with staged completion',()=>{
  let variations=0;
  for(const id of Object.keys(ByteRunner.serversRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId:seed%2?'c04':'c12'});
    for(let n=0;!m.done&&n<240;n++){const a=m.next();assert(a,'missing server hint');if(a.wait){assert(!m.done,'stabilization skipped');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid action rejected '+m.message);}
    assert(m.done,'unsolvable '+id+'/'+seed);variations++;
  }
  report.serversVariations=variations;
});
test('servers: voltage, redundant feeds, grounding and startup sequence',()=>{
  const m=ByteRunner.repairV2Models.create('rack-busbars',()=>.3);m.apply({id:'boot'});assert(m.error&&!m.starting,'unsafe startup');m.apply({id:'ground'});assert(m.error&&!m.grounded,'grounding bypassed isolation');m.apply({id:'isolate'});m.apply({id:'supply2',target:'bay0'});assert(m.modules.every(v=>v<0),'wrong voltage accepted');
  m.apply({id:'ground'});m.apply({id:'supply0',target:'bay1'});m.apply({id:'supply1',target:'bay0'});m.apply({id:'supply2',target:'bay2'});assert(JSON.stringify(m.modules)==='[1,0,2]','compatible redundant sources cannot interchange');
  m.apply({id:'cable0',target:'port1'});assert(!m.links[0],'crossed power feed accepted');for(let i=0;i<3;i++)m.apply({id:'cable'+i,target:'port'+i});m.apply({id:'boot'});m.tick(.5);assert(m.starting&&m.startup>0&&!m.done,'server startup skipped');m.tick(3);assert(m.done,'power startup failed');
});
test('servers: healthy fans survive and live airflow controls thermal stability',()=>{
  const m=ByteRunner.repairV2Models.create('replica-flywheels',()=>.3);m.apply({id:'restart'});assert(m.error&&!m.running,'broken cooling started');m.apply({id:'damaged1',target:'discard'});assert(!m.removed[1],'healthy fan removed');m.apply({id:'isolate'});
  for(const [part,slot] of [[0,0],[1,2]]){m.apply({id:'damaged'+slot,target:'discard'});m.apply({id:'fan'+part,target:'fanbay'+slot});}m.apply({id:'restart'});m.tick(.5);assert(m.running&&m.temperatures.every(v=>v>55)&&!m.done,'wrong airflow cooled racks');
  for(let i=0;i<3;i++)m.apply({id:'vent'+i,value:0});for(let i=0;i<120;i++)m.tick(.05);assert(m.done&&m.temperatures.every(v=>v<=55)&&!m.removed[1],'temperatures did not stabilize or healthy fan lost');
});
test('servers: capacity rejection, temporary parking and equivalent balanced assignments',()=>{
  const m=ByteRunner.repairV2Models.create('rack-gantry',()=>.3);assert(m.loads()[0]>m.capacities[0],'initial overload missing');m.apply({id:'task3',target:'server0'});assert(m.assignment[3]===1,'overload accepted');m.apply({id:'balance'});assert(m.error&&!m.testing,'bad balance accepted');
  m.apply({id:'task2',target:'parking'});assert(m.assignment[2]===-1,'parking failed');
  for(let n=0;n<80&&!m.done;n++){const a=m.next();if(a.wait)m.tick(2);else m.apply(a);}assert(m.done&&m.valid(),'parking recovery stalled');
  const alt=ByteRunner.repairV2Models.create('rack-gantry',()=>.3);for(const [i,s] of [1,0,2,1,0,2].entries())alt.apply({id:'task'+i,target:'server'+s});assert(alt.valid()&&JSON.stringify(alt.assignment)!==JSON.stringify(alt.plan),'equivalent balance rejected');alt.apply({id:'balance'});alt.tick(.2);assert(!alt.done,'CPU test skipped');alt.tick(2);assert(alt.done,'balanced CPU queues failed');
});
test('servers: core relay keys, dependency branches and full restoration sequence',()=>{
  const m=ByteRunner.repairV2Models.create('backbone-prisms',()=>.3,{componentId:'c04'});m.apply({id:'ignite'});assert(m.error&&!m.restoring,'core activated early');m.apply({id:'link0',target:'relay2'});assert(!m.links[0],'crossed relay accepted');for(let i=0;i<3;i++)m.apply({id:'link'+i,target:'relay'+i});m.tick(1);
  m.apply({id:'mechanism3'});assert(m.error&&!m.engaged[3],'synchronization bypassed prerequisites');m.apply({id:'mechanism0'});m.tick(1);m.apply({id:'mechanism2'});m.apply({id:'mechanism1'});m.tick(1);m.apply({id:'mechanism3'});m.tick(1);assert(m.charge.every(v=>v===1),'equivalent dependency branch order rejected');
  m.apply({id:'ignite'});m.tick(2.2);assert(m.restoring&&m.restoration>.58&&!m.done,'dramatic restoration wave skipped');m.tick(1.1);assert(m.done,'core restoration incomplete');
});
test('servers: twelve actual repairs preserve boss HP, objectives, XP and saves',()=>{
  ByteRunner.repairV2.enabled=true;setup(9);endPhaseIntro();xpRequired=999999;
  const ids=['c01','c02','c05','c06','c07','c03','c08','c09','c10','c11','c12','c04'];assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'server identities/order changed');assert(components.find(c=>c.id==='c04').repair.type==='v2-backbone-prisms','final core objective not mapped to core activation');
  const boss=viruses.find(v=>v.multiStage),bossHp=boss.hp;assert(boss?.alive&&boss.coreShieldRequiresRepairs,'VIRUS ZERO missing or shield changed');report.serversRewards=[];
  for(const c of components){
    const hp=boss.hp;damageVirus(boss,1000);assert(boss.hp===hp,'boss vulnerable with incomplete repairs');
    player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','server integration missing');const before=xp,allBefore=objectives.allRepairs;solveServers();assert(boss.alive&&boss.hp===bossHp&&!c.repaired,'minigame changed boss or bypassed repair lifecycle');updateRepair(.6);const expected=30+(!allBefore&&objectives.allRepairs?100:0);
    assert(c.repaired&&c.integrity===100&&c.corruption===0,'server component not restored');assert(xp===before+expected,'server XP changed');assert(getSavedCampaign().repaired[components.indexOf(c)],'server save lost');const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate server reward');assert(boss.alive&&boss.hp===bossHp&&!campaignComplete&&!phaseQuestionOpen,'repair bypassed VIRUS ZERO or final question');report.serversRewards.push({id:c.id,xp:expected,saved:true});
  }
  assert(objectives.allRepairs&&!solids().some(s=>s.id==='core-access-lock'),'all server repairs did not open existing core gate');
  damageVirus(boss,2);assert(boss.hp<bossHp&&boss.alive,'normal shield release after all repairs changed');
});
test('servers: pause freezes boss and world; cancel, failure and retry preserve economy',()=>{
  setup(9);endPhaseIntro();xpRequired=999999;const c=components.find(c=>c.id==='c04');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,enemyObstacles,cameraX,cameraY,animationTime});for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,enemyObstacles,cameraX,cameraY,animationTime}),'world or boss advanced behind repair');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'ignite'});s.update(.05);assert(s.model.revision===revision,'paused core accepted input');s.setPaused(false);cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded');
  keys.add('e');updateRepair(0);s=repairSession;const health=player.health;for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="ignite"]').click();assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&!c.repaired&&xp===0,'failure changed economy');s.action({id:'ignite'});assert(player.health===Math.max(1,health-5),'penalty repeated');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'core retry failed');solveServers();updateRepair(.6);assert(c.repaired&&xp===30&&viruses.find(v=>v.multiStage).alive&&!campaignComplete,'retry changed boss or reward');
});
test('servers: VIRUS ZERO keeps every relay shield, phase thresholds, grace and final question',()=>{
  setup(9);endPhaseIntro();xpRequired=999999;const boss=viruses.find(v=>v.multiStage),hp=boss.hp;
  for(let i=0;i<components.length;i++){components.forEach(c=>c.repaired=true);components[i].repaired=false;damageVirus(boss,1000);assert(boss.hp===hp&&solids().some(s=>s.id==='core-access-lock'),'missing relay did not protect core '+i);}
  components.forEach(c=>c.repaired=true);viruses.filter(v=>v!==boss).forEach(v=>v.alive=false);Object.assign(player,{x:boss.x-180,y:bossGroundY(boss)-player.height});
  damageVirus(boss,1000);assert(boss.alive&&Math.abs(boss.hp-boss.maxHp*.67)<.01,'first phase threshold skipped');updateVirusZero(boss,1/60,player.x+17,player.y+24);assert(boss.bossStage===2&&boss.bossPhaseTransitionTime>0,'second phase transition lost');damageVirus(boss,1000);assert(Math.abs(boss.hp-boss.maxHp*.67)<.01,'damage during transition grace');
  for(let i=0;i<55;i++)updateVirusZero(boss,1/60,player.x+17,player.y+24);damageVirus(boss,1000);assert(Math.abs(boss.hp-boss.maxHp*.34)<.01,'second phase threshold skipped');updateVirusZero(boss,1/60,player.x+17,player.y+24);assert(boss.alive&&boss.bossStage===3,'third phase lost');for(let i=0;i<55;i++)updateVirusZero(boss,1/60,player.x+17,player.y+24);damageVirus(boss,1000);update(1/60);
  assert(!boss.alive&&phaseQuestionOpen&&!campaignComplete,'final question bypassed');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(campaignComplete&&getSavedCampaign().campaignComplete,'campaign completion not saved');
  report.virusZero={allRelaysRequired:true,phaseThresholds:[.67,.34],transitionGrace:true,finalQuestionRequired:true,victorySaved:true};
});
test('servers: VIRUS ZERO still telegraphs attacks and exposes its weak point',()=>{
  setup(9);endPhaseIntro();components.forEach(c=>c.repaired=true);const boss=viruses.find(v=>v.multiStage);viruses=[boss];Object.assign(player,{x:boss.x-180,y:bossGroundY(boss)-player.height});boss.bossCycleCooldown=0;boss.bossPhaseTransitionTime=0;
  updateVirusZero(boss,.01,player.x+17,player.y+24);assert(boss.attackWindup>0&&boss.bossAttackKind,'attack telegraph lost');
  boss.vulnerableTime=0;const before=boss.hp;damageVirus(boss,2);const guarded=before-boss.hp;boss.vulnerableTime=2;const weakHp=boss.hp;damageVirus(boss,2);assert(weakHp-boss.hp>guarded,'weak-point multiplier lost');
});
