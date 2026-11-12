// DNS checks run inside the existing isolated campaign closure.
function solveDns(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let n=0;session.mode==='playing'&&n<180;n++){
    const a=session.model.next();assert(a,'DNS action missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'DNS control unreachable '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','DNS repair stalled '+session.label());
}
test('dns: 120 deterministic variants and delayed resolution completion',()=>{
  let variations=0;
  for(const id of Object.keys(ByteRunner.dnsRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const componentId=id==='record-engraver'?(seed%2?'com-records:records':'org-records:records'):seed%2?'cache-terminal:recursive':'resolve-core:resolution';
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId});
    for(let n=0;!m.done&&n<180;n++){const a=m.next();assert(a,'missing DNS hint');if(a.wait){assert(!m.done,'resolution animation skipped');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid DNS action rejected '+m.message);}
    assert(m.done,'unsolvable '+id+'/'+seed);variations++;
  }
  report.dnsVariations=variations;
});
test('dns: CNAME follows A records, shared IPs work and hierarchy preserves parents',()=>{
  const m=ByteRunner.repairV2Models.create('record-engraver',()=>.3,{componentId:'org-records:records'});
  assert(ByteRunner.dnsResolution.resolve('www.example.org',m.records)==='198.51.100.10','alias not resolved to A');
  assert(ByteRunner.dnsResolution.resolve('missing.example.org',m.records)===null,'invented record');
  assert(ByteRunner.dnsResolution.resolve('a',[{name:'a',type:'CNAME',value:'b'},{name:'b',type:'CNAME',value:'a'}])===null,'alias cycle accepted');
  m.apply({id:'domain0',target:'ip0'});assert(m.links[0]===-1,'wrong IP accepted');m.apply({id:'domain0',target:'ip2'});m.apply({id:'domain2',target:'ip2'});assert(m.links[0]===2&&m.links[2]===2&&!m.done,'shared IP or delayed resolution broken');
  const tree=ByteRunner.repairV2Models.create('delegation-hoist',()=>.3);tree.apply({id:'server3',target:'seat3'});assert(!tree.placed[3],'orphan authority published');tree.apply({id:'server0',target:'seat1'});assert(!tree.placed[0],'root in TLD slot');tree.apply({id:'server0',target:'seat0'});tree.apply({id:'server1',target:'seat1'});tree.apply({id:'server3',target:'seat3'});assert(tree.placed[3]&&!tree.done,'valid delegation failed or skipped animation');
});
test('dns: expired TTLs require replacement and valid cache records survive',()=>{
  const cache=ByteRunner.repairV2Models.create('cache-carousel',()=>.3),original=JSON.stringify([cache.entries[0],cache.entries[2]]);
  assert(cache.remaining(0)===200&&cache.remaining(1)===0&&cache.remaining(2)===400&&cache.remaining(3)===0,'TTL arithmetic incorrect');
  cache.apply({id:'cartridge0',target:'discard'});assert(!cache.removed[0],'valid cache entry removed');cache.apply({id:'stabilize'});assert(cache.error&&!cache.syncing,'expired cache accepted');
  cache.apply({id:'fresh0',target:'slot1'});assert(!cache.inserted[1],'occupied memory overwritten');cache.apply({id:'cartridge1',target:'discard'});cache.apply({id:'fresh0',target:'slot3'});assert(!cache.inserted[3],'record name/type ignored');
  cache.replacements[0].authoritative=false;cache.apply({id:'fresh0',target:'slot1'});assert(!cache.inserted[1],'unverified replacement accepted');cache.replacements[0].authoritative=true;
  for(let n=0;n<30&&!cache.done;n++){const a=cache.next();if(a.wait)cache.tick(2);else cache.apply(a);}
  assert(cache.done&&cache.entries.every((_,i)=>cache.remaining(i)>0),'cache did not stabilize');assert(JSON.stringify([cache.entries[0],cache.entries[2]])===original,'valid records modified');
});
test('dns: referrals return to resolver before authority answer',()=>{
  for(const componentId of ['cache-terminal:recursive','resolve-core:resolution']){
    const q=ByteRunner.repairV2Models.create('query-courier',()=>.3,{componentId});q.apply({id:'gate2',value:2});assert(q.gates[2]===0,'future gate changed query');q.apply({id:'send'});assert(q.error&&q.flight&&!q.flight.correct,'wrong root accepted');q.tick(2);assert(q.step===0&&q.answer===null&&q.visited.length===0,'incorrect answer accepted');
    for(let step=0;step<3;step++){q.apply({id:'gate'+step,value:q.options[step].indexOf(q.expected[step])});q.apply({id:'send'});q.tick(.9);assert(q.step===step&&q.answer===null&&!q.done,'answer delivered before return');q.tick(.8);assert(q.step===step+1,'referral did not reach resolver');if(step<2)assert(q.answer===null,'non-authority answered host record');}
    assert(q.done&&q.answer===q.ip&&JSON.stringify(q.visited)===JSON.stringify(q.expected),'wrong authority path or final answer');
  }
});
test('dns: seven campaign objectives preserve XP, progression and saves',()=>{
  ByteRunner.repairV2.enabled=true;setup(7);xpRequired=999999;
  const ids=['root-core:hints','com-records:records','com-zone:delegation','org-records:records','cache-crown:ttl','cache-terminal:recursive','resolve-core:resolution'];
  assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'DNS identities/order changed');report.dnsRewards=[];
  for(const c of components){player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','DNS integration missing');const before=xp,allBefore=objectives.allRepairs;solveDns();updateRepair(.6);const expected=30+(!allBefore&&objectives.allRepairs?100:0);assert(c.repaired&&c.integrity===100&&c.corruption===0,'DNS component not restored');assert(xp===before+expected,'DNS XP changed');assert(getSavedCampaign().repaired[components.indexOf(c)],'DNS save lost');const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate DNS reward');report.dnsRewards.push({id:c.id,xp:expected,saved:true});}
  assert(objectives.allRepairs,'DNS objectives incomplete');
});
test('dns: pause, cancel, failure and retry preserve economy',()=>{
  setup(7);xpRequired=999999;const c=components.find(c=>c.id==='cache-crown:ttl');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime});for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime}),'world moved behind DNS repair');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'stabilize'});s.update(.05);assert(s.model.revision===revision,'paused DNS accepted input');s.setPaused(false);cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded');
  keys.add('e');updateRepair(0);s=repairSession;const health=player.health;for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="stabilize"]').click();assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&!c.repaired&&xp===0,'failure changed economy');s.action({id:'stabilize'});assert(player.health===Math.max(1,health-5),'penalty repeated');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'DNS retry failed');solveDns();updateRepair(.6);assert(c.repaired&&xp===30,'retry reward changed');
});
