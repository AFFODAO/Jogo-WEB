// Focused Wi-Fi review inside the existing isolated game closure.
function solveWifi(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let n=0;session.mode==='playing'&&n<160;n++){
    const a=session.model.next();assert(a,'Wi-Fi action missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'Wi-Fi control unreachable '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','Wi-Fi repair stalled '+session.label());
}
test('wifi: 120 deterministic variations and completion after signal stabilization',()=>{
  let variations=0;
  for(const id of Object.keys(ByteRunner.wifiRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId:seed%2?'repeater-east:east':'repeater-west:west'});
    for(let n=0;!m.done&&n<150;n++){
      const a=m.next();assert(a,'Wi-Fi missing hint');
      if(a.wait){assert(!m.done,'signal skipped stabilization');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}
      assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid input rejected '+m.message);
    }
    assert(m.done,'unsolvable '+id+'/'+seed);variations++;
  }
  report.wifiVariations=variations;
});
test('wifi: frequency protection, geometric coverage, repositioning and thermal safety',()=>{
  const spectrum=ByteRunner.repairV2Models.create('spectrum-tuner',()=>.3);
  spectrum.apply({id:'filter0',target:'band'+spectrum.channel});assert(spectrum.filters[0]===-1,'useful signal destroyed');
  spectrum.apply({id:'transmit'});assert(spectrum.error&&!spectrum.cleaning,'noise bypassed');
  const map=ByteRunner.repairV2Models.create('repeater-mast',()=>.3);
  map.apply({id:'repeater0',target:'pad4'});assert(map.slots[0]===-1,'blocked mount accepted');
  map.apply({id:'repeater0',target:'pad2'});assert(map.network().active.length===0,'range constraint ignored');
  map.apply({id:'repeater1',target:'pad2'});assert(map.slots[1]===-1,'occupied mount accepted');
  map.apply({id:'connect'});assert(map.error&&!map.testing,'disconnected coverage accepted');
  // Wrong and swapped placements can be recovered using the ordinary hint path.
  map.apply({id:'repeater1',target:'pad0'});map.apply({id:'repeater2',target:'pad1'});
  for(let n=0;n<30&&!map.done;n++){const a=map.next();if(a.wait)map.tick(2);else map.apply(a);}
  assert(map.done&&map.network().covered.every(Boolean),'repositioning deadlocked');
  const tx=ByteRunner.repairV2Models.create('rf-compressor',()=>.95);
  tx.apply({id:'gain',value:tx.required});tx.apply({id:'emit'});assert(tx.error&&!tx.running,'overheated transmitter accepted');
  tx.apply({id:'cooling',value:4});tx.apply({id:'emit'});tx.tick(.05);assert(!tx.done&&tx.temperature<60,'temperature animation skipped');
  for(let i=0;i<100;i++)tx.tick(.05);assert(tx.done&&tx.signal>=90&&tx.temperature<=60,'calibrated transmitter did not stabilize');
});
test('wifi: six campaign objectives preserve XP, saves and repair integration',()=>{
  ByteRunner.repairV2.enabled=true;setup(4);xpRequired=999999;
  const ids=['main-array:uplink','repeater-west:west','repeater-east:east','noise-center:spectrum','transmit-west:carrier','base-west:association'];
  assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'Wi-Fi campaign identities/order changed');report.wifiRewards=[];
  for(const c of components){
    player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','Wi-Fi integration missing');
    const before=xp,allBefore=objectives.allRepairs;solveWifi();updateRepair(.6);const expected=30+(!allBefore&&objectives.allRepairs?100:0);
    assert(c.repaired&&c.integrity===100&&c.corruption===0,'Wi-Fi component not restored');assert(xp===before+expected,'repair XP changed');assert(getSavedCampaign().repaired[components.indexOf(c)],'save lost Wi-Fi repair');
    const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate Wi-Fi reward');report.wifiRewards.push({id:c.id,xp:expected,saved:true});
  }
  assert(objectives.allRepairs,'Wi-Fi objectives incomplete');
});
test('wifi: pause, cancel, failure and retry preserve campaign economy',()=>{
  setup(4);xpRequired=999999;const c=components.find(c=>c.id==='main-array:uplink');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime});
  for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime}),'world moved behind Wi-Fi repair');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'lock'});s.update(.05);assert(s.model.revision===revision,'paused Wi-Fi accepted input');s.setPaused(false);
  cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded repair');keys.add('e');updateRepair(0);s=repairSession;const health=player.health;
  for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="lock"]').click();
  assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&xp===0&&!c.repaired,'failure changed penalty or rewards');s.action({id:'lock'});assert(player.health===Math.max(1,health-5),'failure charged twice');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'Wi-Fi retry failed');solveWifi();updateRepair(.6);assert(c.repaired&&xp===30,'retry reward incorrect');
});
