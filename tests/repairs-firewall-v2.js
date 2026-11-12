// Firewall checks execute inside the existing isolated campaign closure.
function solveFirewall(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let n=0;session.mode==='playing'&&n<220;n++){
    const a=session.model.next();assert(a,'firewall action missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'firewall control unreachable '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','firewall repair stalled '+session.label());
}
test('firewall: 120 deterministic variants and delayed completion',()=>{
  let variations=0;
  for(const id of Object.keys(ByteRunner.firewallRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const componentId=id==='shield-iris'?(seed%2?'c05':'c06'):seed%2?'c07':'c08';
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId});
    for(let n=0;!m.done&&n<220;n++){const a=m.next();assert(a,'missing firewall hint');if(a.wait){assert(!m.done,'animation skipped');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid action rejected '+m.message);}
    assert(m.done,'unsolvable '+id+'/'+seed);variations++;
  }
  report.firewallVariations=variations;
});
test('firewall: header policy, gate interlock and inspection evidence are distinct',()=>{
  const logic=ByteRunner.firewallLogic,web={src:'198.51.100.20',dst:'192.0.2.10',protocol:'TCP',port:443,state:'NOVA'};
  assert(logic.allowPacket(web),'valid HTTPS blocked');assert(!logic.allowPacket({...web,src:'203.0.113.66',state:'ESTABELECIDA'}),'denylisted established source allowed');assert(!logic.allowPacket({...web,state:'INVÁLIDA'}),'invalid state allowed');
  assert(logic.allowPacket({...web,src:'10.0.0.10',port:22})&&!logic.allowPacket({...web,port:22}),'SSH administrator condition ignored');
  assert(logic.allowPacket({...web,protocol:'UDP',port:53,dst:'192.0.2.53'})&&!logic.allowPacket({...web,protocol:'UDP',port:53,dst:'198.51.100.53'}),'DNS destination restriction ignored');
  assert(logic.allowPacket({...web,signature:'MAL-01'})&&logic.malicious({signature:'MAL-01',integrity:true}),'transport filtering incorrectly replaced payload inspection');
  const gates=ByteRunner.repairV2Models.create('inspection-airlock',()=>.3);gates.tick(1);gates.apply({id:'process'});assert(gates.error&&gates.flight&&!gates.flight.correct,'dangerous packet allowed');gates.tick(1);assert(gates.index===0&&gates.history.length===0,'wrong decision advanced');gates.apply({id:'gate0'});gates.apply({id:'process'});assert(gates.flight.decision==='reter'&&!gates.flight.correct,'incoherent gate state accepted');
  const scanner=ByteRunner.repairV2Models.create('threat-triangulation',()=>.3,{componentId:'c08'});scanner.apply({id:'packet',target:'clean'});assert(!scanner.flight,'uninspected packet routed');scanner.apply({id:'scan'});scanner.tick(.2);assert(!scanner.inspected,'scan skipped animation');scanner.tick(1);scanner.apply({id:'packet',target:'clean'});assert(scanner.error&&!scanner.flight.correct,'known threat released');scanner.tick(1);assert(scanner.index===0&&scanner.forwarded.length===0,'bad classification advanced');
  for(let n=0;n<80&&!scanner.done;n++){const a=scanner.next();if(a.wait)scanner.tick(1);else scanner.apply(a);}
  assert(scanner.done&&scanner.quarantine.length===3&&scanner.forwarded.length===2,'quarantine or legitimate count wrong');assert(scanner.quarantine.every(logic.malicious)&&scanner.forwarded.every(p=>!logic.malicious(p)),'traffic misclassified');
});
test('firewall: shield requires orientation and complete circuit before power',()=>{
  const s=ByteRunner.repairV2Models.create('shield-iris',()=>.3,{componentId:'c06'});s.apply({id:'energize'});assert(s.error&&!s.powering,'broken field powered');s.apply({id:'powerlink0',target:'coupler0'});assert(!s.links[0],'unaligned emitter connected');
  for(let i=0;i<3;i++){s.apply({id:'rotor'+i,value:s.target[i]});s.apply({id:'powerlink'+i,target:'coupler'+i});}s.apply({id:'energize'});s.tick(.2);assert(!s.done&&s.segments[0]>0&&s.segments[2]===0,'power sequence skipped');s.tick(2);assert(s.done&&s.segments.every(v=>v===1),'full barrier not restored');
});
test('firewall: first match stops evaluation and equivalent valid orders are accepted',()=>{
  const logic=ByteRunner.firewallLogic,p={src:'203.0.113.66',protocol:'TCP',port:443};
  const wrong=logic.firstMatch(p,[1,0,2,3]),right=logic.firstMatch(p,[0,1,2,3]);assert(wrong.rule===1&&wrong.slot===0&&wrong.decision==='permitir','first match did not terminate');assert(right.rule===0&&right.decision==='bloquear','specific deny ignored');
  const m=ByteRunner.repairV2Models.create('policy-camshaft',()=>.3);m.apply({id:'run'});assert(m.error&&!m.testing,'incomplete rule board tested');
  for(const [slot,id] of [1,0,2,3].entries())m.apply({id:'rule'+id,target:'priority'+slot});m.apply({id:'run'});assert(m.error&&m.testing,'broad allow shadowing not detected');for(let i=0;i<4;i++)m.tick(1);assert(!m.done&&m.results.some(r=>!r.passed),'bad first-match order passed');
  for(const [slot,id] of [2,0,1,3].entries())m.apply({id:'rule'+id,target:'priority'+slot});assert(JSON.stringify(m.slots)==='[2,0,1,3]','physical swaps lost rule modules');m.apply({id:'run'});assert(!m.error,'equivalent valid order rejected');m.tick(.2);assert(!m.done&&m.cursor===0,'test packet animation skipped');for(let i=0;i<4;i++)m.tick(1);assert(m.done&&m.results.every(r=>r.passed),'equivalent first-match order failed');
});
test('firewall: eight campaign objectives preserve rewards, progression and saves',()=>{
  ByteRunner.repairV2.enabled=true;setup(8);xpRequired=999999;
  const ids=['c01','c02','c05','c06','c03','c07','c04','c08'];assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'firewall identities/order changed');report.firewallRewards=[];
  for(const c of components){player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','firewall integration missing');const before=xp,allBefore=objectives.allRepairs;solveFirewall();updateRepair(.6);const expected=30+(!allBefore&&objectives.allRepairs?100:0);assert(c.repaired&&c.integrity===100&&c.corruption===0,'firewall component not restored');assert(xp===before+expected,'firewall XP changed');assert(getSavedCampaign().repaired[components.indexOf(c)],'firewall save lost');const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate firewall reward');report.firewallRewards.push({id:c.id,xp:expected,saved:true});}
  assert(objectives.allRepairs,'firewall objectives incomplete');
});
test('firewall: pause, cancel, failure and retry preserve economy',()=>{
  setup(8);xpRequired=999999;const c=components.find(c=>c.id==='c05');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime});for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime}),'world moved behind firewall repair');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'energize'});s.update(.05);assert(s.model.revision===revision,'paused firewall accepted input');s.setPaused(false);cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded');
  keys.add('e');updateRepair(0);s=repairSession;const health=player.health;for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="energize"]').click();assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&!c.repaired&&xp===0,'failure changed economy');s.action({id:'energize'});assert(player.health===Math.max(1,health-5),'penalty repeated');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'firewall retry failed');solveFirewall();updateRepair(.6);assert(c.repaired&&xp===30,'retry reward changed');
});
