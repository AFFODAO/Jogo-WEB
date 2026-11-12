// DHCP review runs inside the existing isolated campaign game closure.
function solveDhcp(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let n=0;session.mode==='playing'&&n<180;n++){
    const a=session.model.next();assert(a,'DHCP action missing');
    if(a.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const b=host.querySelector(`[data-control="${a.id}"][data-target="false"]`);assert(b&&!b.disabled,'DHCP control unreachable '+a.id);
    if(a.target){b.click();host.querySelector(`[data-control="${a.target}"]`).click();}
    else if(a.value!==undefined){b.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));for(let i=0;i<a.value;i++)b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));}
    else b.click();
  }
  assert(session.mode==='won','DHCP repair stalled '+session.label());
}
test('dhcp: 120 deterministic variants with animated completion',()=>{
  let variations=0;
  for(const id of Object.keys(ByteRunner.dhcpRepairModels))for(let seed=1;seed<=30;seed++){
    let state=seed;const rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
    const componentId=id==='pool-sluice'?(seed%2?'address-office:scope':'gateway-plaza:gateway'):seed%2?'reserve-main:reservation':'distribution-south:relay';
    const m=ByteRunner.repairV2Models.create(id,rng,{componentId});
    for(let n=0;!m.done&&n<180;n++){const a=m.next();assert(a,'missing DHCP hint');if(a.wait){assert(!m.done,'animation skipped');for(let i=0;i<100;i++){m.time+=.05;m.tick(.05);}continue;}assert(m.controls().some(c=>c.id===a.id&&!c.locked),'unreachable '+id+'/'+a.id);m.apply(a);assert(!m.error,'valid action rejected '+m.message);}
    assert(m.done,'unsolvable '+id+'/'+seed);variations++;
  }
  report.dhcpVariations=variations;
});
test('dhcp: subnet, reservations, used addresses and authoritative duplicate ownership',()=>{
  const net=ByteRunner.dhcpNetwork,s=net.scope('192.168.10.0',29,'192.168.10.1');
  for(const ip of ['192.168.10.0','192.168.10.1','192.168.10.7','192.168.11.3','999.1.1.1','bad'])assert(!net.usable(ip,s),'unusable address accepted '+ip);
  assert(net.usable('192.168.10.6',s),'valid host excluded');
  const d=ByteRunner.repairV2Models.create('lease-pneumatics',()=>.3);d.tick(2);
  for(const [chip,device] of [[2,0],[0,1],[3,1],[4,1],[5,1],[1,0]])d.apply({id:'address'+chip,target:'device'+device});
  assert(d.leases.every(v=>v===null),'invalid lease assigned');
  for(const [chip,device] of [[0,0],[1,1],[2,2]])d.apply({id:'address'+chip,target:'device'+device});
  assert(new Set(d.leases).size===3&&d.leases[0]==='192.168.10.3','duplicate IP or lost reservation');assert(!d.done,'activation skipped');d.tick(1);assert(d.done,'clients failed activation');
  const conflict=ByteRunner.repairV2Models.create('conflict-localizer',()=>.3),original=conflict.devices[0].ip;
  conflict.apply({id:'client0'});assert(conflict.selected===null,'legitimate lease selected');conflict.apply({id:'client1'});conflict.apply({id:'replacement1',target:'client1'});assert(conflict.replacement===null,'occupied replacement accepted');
  conflict.apply({id:'replacement2',target:'client1'});assert(conflict.replacement===null,'broadcast replacement accepted');conflict.apply({id:'replacement0',target:'client1'});
  assert(conflict.devices[0].ip===original&&conflict.registry[original]===conflict.devices[0].mac,'registered owner changed');assert(new Set(conflict.devices.map(d=>d.ip)).size===4&&!conflict.done,'duplicate or premature restoration');conflict.tick(2);assert(conflict.done,'communication not restored');
});
test('dhcp: multiple valid intervals, exclusions, capacity and allocator board safety',()=>{
  for(const [componentId,range] of [['gateway-plaza:gateway',[8,13]],['address-office:scope',[11,14]]]){
    const p=ByteRunner.repairV2Models.create('pool-sluice',()=>.3,{componentId});p.apply({id:'allocate'});assert(p.error&&!p.allocating,'invalid full scope accepted');
    p.apply({id:'lower',value:5});p.apply({id:'upper',value:5});p.apply({id:'allocate'});assert(p.error,'insufficient capacity accepted');
    p.apply({id:'lower',value:range[0]});p.apply({id:'upper',value:range[1]});p.apply({id:'allocate'});assert(p.allocating&&!p.done,'alternative valid interval rejected');p.tick(.5);assert(p.slotsLit.some(Boolean)&&!p.done,'slot lights skipped sequence');p.tick(2);assert(p.done&&p.slotsLit.every((lit,i)=>!lit||p.allowed(i)),'reserved address lit');
  }
  const board=ByteRunner.repairV2Models.create('reservation-drum',()=>.3),saved=JSON.stringify([board.records,board.reservations]);
  board.apply({id:'cover'});assert(board.error&&!board.open,'powered board opened');board.apply({id:'restart'});assert(board.error&&!board.booting,'faulty allocator restarted');
  for(let n=0;n<30&&!board.done;n++){const a=board.next();if(a.wait)board.tick(2);else board.apply(a);}
  assert(board.done&&JSON.stringify([board.records,board.reservations])===saved,'allocator lost lease records');
});
test('dhcp: six objectives preserve progression, rewards and saves',()=>{
  ByteRunner.repairV2.enabled=true;setup(6);xpRequired=999999;
  const ids=['gateway-plaza:gateway','address-office:scope','reserve-main:reservation','central-core:server','conflict-core:conflict','distribution-south:relay'];
  assert(JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'DHCP objective identities/order changed');report.dhcpRewards=[];
  for(const c of components){player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);assert(repairSession?.engine==='v2','DHCP integration missing');const before=xp,allBefore=objectives.allRepairs;solveDhcp();updateRepair(.6);const expected=30+(!allBefore&&objectives.allRepairs?100:0);assert(c.repaired&&c.integrity===100&&c.corruption===0,'DHCP component not restored');assert(xp===before+expected,'DHCP XP changed');assert(getSavedCampaign().repaired[components.indexOf(c)],'DHCP save lost');const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate DHCP reward');report.dhcpRewards.push({id:c.id,xp:expected,saved:true});}
  assert(objectives.allRepairs,'DHCP objectives incomplete');
});
test('dhcp: pause, cancel, failure and retry preserve economy',()=>{
  setup(6);xpRequired=999999;const c=components.find(c=>c.id==='central-core:server');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  let s=repairSession;const before=JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime});for(let i=0;i<20;i++)update(1/60);assert(before===JSON.stringify({player,viruses,projectiles,enemyProjectiles,cameraX,cameraY,animationTime}),'world moved behind DHCP repair');
  s.setPaused(true);const revision=s.model.revision;s.action({id:'cover'});s.update(.05);assert(s.model.revision===revision,'paused DHCP accepted input');s.setPaused(false);cancelRepair();assert(!c.repaired&&xp===0,'cancel rewarded');
  keys.add('e');updateRepair(0);s=repairSession;const health=player.health;for(let i=0;i<s.maxMistakes;i++)document.querySelector('[data-control="cover"]').click();assert(s.mode==='failed'&&player.health===Math.max(1,health-5)&&!c.repaired&&xp===0,'failure changed economy');s.action({id:'cover'});assert(player.health===Math.max(1,health-5),'penalty repeated');
  [...document.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();assert(s.mode==='playing'&&s.attempt===2,'DHCP retry failed');solveDhcp();updateRepair(.6);assert(c.repaired&&xp===30,'retry reward changed');
});
