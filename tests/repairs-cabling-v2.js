// Focused cabling checks run inside the existing isolated campaign closure.
function solveCabling(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let n=0;session.mode==='playing'&&n<180;n++){
    const a=session.model.next();assert(a,'cabling hint missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'unreachable cabling control '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','cabling repair stalled '+session.label());
}
test('cabling: 120 deterministic variations and delayed physical completion',()=>{
  let variations=0;
  for(const id of Object.keys(ByteRunner.cablingRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const componentId=id==='rj45-comb'?(seed%2?'maintenance-west:service':'central-east:trunk'):seed%2?'basement-power:power':'shaft-west-mid:motor';
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId});
    for(let n=0;!m.done&&n<180;n++){
      const a=m.next();assert(a,'cabling missing action');
      if(a.wait){assert(!m.done,'animation skipped');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}
      assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid action rejected '+m.message);
    }
    assert(m.done,'unsolvable '+id+'/'+seed);variations++;
  }
  report.cablingVariations=variations;
});
test('cabling: actual T568A/T568B pinouts, stripped ends, optical alignment and mandatory retest',()=>{
  const names=ByteRunner.cablingPinout.names;
  const expected={T568A:['branco e verde','verde','branco e laranja','azul','branco e azul','laranja','branco e marrom','marrom'],T568B:['branco e laranja','laranja','branco e verde','azul','branco e azul','verde','branco e marrom','marrom']};
  for(const [componentId,standard] of [['maintenance-west:service','T568A'],['central-east:trunk','T568B']]){
    const m=ByteRunner.repairV2Models.create('rj45-comb',()=>.3,{componentId});assert(m.standard===standard,'wrong objective standard');assert(JSON.stringify(m.expected.map(i=>names[i]))===JSON.stringify(expected[standard]),'pinout mismatch');
    m.apply({id:'crimp',value:3});assert(m.error&&!m.crimping,'premature crimp');
    const wrong=m.expected.findIndex(v=>v!==0);m.apply({id:'wire0',target:'pin'+wrong});assert(m.pins.every(v=>v===-1),'wrong pin inserted');
    for(let i=0;i<8;i++)m.apply({id:'wire'+m.expected[i],target:'pin'+i});m.apply({id:'crimp',value:3});assert(m.crimping&&!m.done,'crimp animation bypassed');
  }
  const splice=ByteRunner.repairV2Models.create('cable-reel',()=>.3);splice.apply({id:'join'});assert(splice.error&&!splice.joining,'covered ends joined');
  splice.apply({id:'conductor0',target:'contact0'});assert(!splice.joins[0],'conductor bypassed stripping');
  for(let i=0;i<2;i++){splice.apply({id:'stripper',target:'end'+i});splice.tick(.8);}splice.apply({id:'conductor0',target:'contact1'});assert(!splice.joins[0],'wrong color joined');
  const fiber=ByteRunner.repairV2Models.create('fiber-splice',()=>.3);fiber.apply({id:'lock'});assert(fiber.error&&!fiber.locked,'misaligned fiber locked');
  fiber.apply({id:'core0',value:4});fiber.apply({id:'core1',value:4});assert(fiber.signal()===100,'aligned cores lack full signal');fiber.apply({id:'lock'});assert(!fiber.done,'optical confirmation skipped');
  const tester=ByteRunner.repairV2Models.create('continuity-trace',()=>.3,{componentId:'basement-power:power'});assert(tester.faults.length===2,'basement lost second fault');
  tester.apply({id:'repair',target:'trace'+tester.faults[0]});assert(tester.repaired.every(v=>!v),'repair bypassed diagnosis');
  tester.apply({id:'scan'});assert(tester.error&&!tester.scanning,'scan without probes');
  tester.apply({id:'probe0',target:'endpoint0'});tester.apply({id:'probe1',target:'endpoint1'});tester.apply({id:'scan'});tester.tick(.1);assert(!tester.done&&tester.leds.some(v=>v!==null)&&tester.leds.some(v=>v===null),'LEDs did not scan sequentially');tester.tick(2);
  assert(tester.diagnosed&&!tester.done,'broken cable passed');for(const i of tester.faults)tester.apply({id:'repair',target:'trace'+i});tester.tick(2);assert(!tester.done,'repair bypassed confirmation scan');tester.apply({id:'scan'});tester.tick(2);assert(tester.done&&tester.leds.every(Boolean),'continuity not restored');
});
test('cabling: seven campaign repairs preserve rewards, progression and saves',()=>{
  ByteRunner.repairV2.enabled=true;setup(5);xpRequired=999999;
  const ids=['roof-controls:antenna','upper-hub:distribution','shaft-west-mid:motor','maintenance-west:service','central-main:patch','central-east:trunk','basement-power:power'];
  assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'cabling identities/order changed');report.cablingRewards=[];
  for(const c of components){
    player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','cabling integration missing');
    const before=xp,allBefore=objectives.allRepairs;solveCabling();updateRepair(.6);const expected=30+(!allBefore&&objectives.allRepairs?100:0);
    assert(c.repaired&&c.integrity===100&&c.corruption===0,'cabling component not restored');assert(xp===before+expected,'cabling XP changed');assert(getSavedCampaign().repaired[components.indexOf(c)],'save lost cabling repair');
    const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate reward');report.cablingRewards.push({id:c.id,xp:expected,saved:true});
  }
  assert(objectives.allRepairs,'cabling objectives incomplete');
});
test('cabling: pause, cancel, failure and retry preserve campaign economy',()=>{
  setup(5);xpRequired=999999;const c=components.find(c=>c.id==='roof-controls:antenna');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime});for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime}),'world moved behind cabling repair');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'lock'});s.update(.05);assert(s.model.revision===revision,'paused repair accepted input');s.setPaused(false);cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded');
  keys.add('e');updateRepair(0);s=repairSession;const health=player.health;for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="lock"]').click();assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&!c.repaired&&xp===0,'failure changed economy');s.action({id:'lock'});assert(player.health===Math.max(1,health-5),'penalty charged twice');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'retry failed');solveCabling();updateRepair(.6);assert(c.repaired&&xp===30,'retry reward changed');
});
