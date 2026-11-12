test('software v2: scan distinguishes normal files and only infected files are deleted',()=>{
  const m=ByteRunner.repairV2Models.create('virus-cleanup',()=>.3);
  const infected=m.infected[0],normal=m.names.findIndex((_,i)=>!m.infected.includes(i));
  m.apply({id:'file'+infected,target:'quarantine'});assert(m.quarantined[infected]===null&&!m.error,'unscanned file accepted');
  m.apply({id:'file'+normal});for(let n=0;n<14;n++)m.tick(.05);
  m.apply({id:'file'+normal,target:'quarantine'});assert(m.error&&!m.deleted[normal]&&m.quarantined[normal]===null,'normal file was deleted or not protected');
  for(const i of m.infected){m.apply({id:'file'+i});for(let n=0;n<14;n++)m.tick(.05);m.apply({id:'file'+i,target:'quarantine'});}
  assert(!m.done,'quarantine deletion animation skipped');for(let n=0;n<16;n++)m.tick(.05);
  assert(m.done&&m.infected.every(i=>m.deleted[i])&&m.names.every((_,i)=>m.infected.includes(i)||!m.deleted[i]),'cleanup removed normal data');
});
test('software v2: six fragments reconstruct two images, rejecting incompatible cuts',()=>{
  const m=ByteRunner.repairV2Models.create('file-recovery',()=>.7);
  m.apply({id:'fragment0',target:'recovery-slot4'});assert(m.slots.every(v=>v<0)&&!m.error&&m.rejected==='recovery-slot4','wrong fragment placed or charged');
  for(let i=0;i<6;i++)m.apply({id:'fragment'+i,target:'recovery-slot'+i});
  assert(!m.done,'reconstruction animation skipped');for(let n=0;n<20;n++)m.tick(.05);
  assert(m.done&&m.rebuild.every(v=>v===1)&&new Set(m.slots).size===6,'files not reconstructed');
});
test('software v2: incorrect process order visibly fails and can be repaired',()=>{
  const m=ByteRunner.repairV2Models.create('process-repair',()=>.4);
  m.apply({id:'execute',value:1});assert(m.error&&m.failedAt>=0&&m.running,'incorrect pipeline did not fail visibly');
  for(let n=0;n<80;n++)m.tick(.05);assert(!m.running&&!m.done&&m.needsSync,'failed belt did not return controls');
  for(let n=0;n<10&&m.order.some((v,i)=>v!==i);n++)m.apply(m.next());
  m.apply({id:'execute',value:1});assert(!m.error&&m.running,'valid sequence rejected');
  m.tick(.3);assert(m.travel>0&&m.processed.length===0&&!m.done,'process did not travel through CPU');
  for(let n=0;n<60;n++)m.tick(.05);assert(m.done&&m.processed.join(',')==='0,1,2,3','process execution incomplete');
});
test('software v2: boot needs connected modules and a logical power sequence',()=>{
  const m=ByteRunner.repairV2Models.create('system-restore');
  m.apply({id:'boot-switch2'});assert(m.error&&m.switches.every(v=>!v),'boot bypassed broken modules');
  m.apply({id:'boot-link0',target:'boot-port1'});assert(!m.links[0]&&!m.error,'wrong boot connection accepted or charged');
  m.apply({id:'boot-link0',target:'boot-port0'});m.apply({id:'boot-link1',target:'boot-port1'});
  m.apply({id:'boot-switch1'});assert(m.error&&!m.switches[1],'memory booted before loader');
  for(let i=0;i<3;i++)m.apply({id:'boot-switch'+i});assert(m.rebooting&&!m.done,'boot restart skipped');
  for(let n=0;n<35;n++)m.tick(.05);assert(m.done&&m.restart===1,'operating system did not restart');
});
test('software v2: five campaign components keep IDs, objectives, XP and saved completion',()=>{
  setup(1);xpRequired=999999;
  const expected={'root:index':'v2-file-recovery','scheduler:scheduler':'v2-process-repair','swap:paging':'v2-system-restore','recovery:recovery':'v2-virus-cleanup','kernel-stack:kernel':'v2-process-repair'};
  const ids=components.map(c=>c.id);assert(ids.length===5,'component count changed');
  for(const c of components){
    assert(c.repair.type===expected[c.id],'incorrect Software mapping');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
    const before=xp,allBefore=objectives.allRepairs;solvePhysicalRepairUI();updateRepair(.6);
    assert(c.repaired&&c.integrity===100&&xp===before+30+(!allBefore&&objectives.allRepairs?100:0),'campaign repair/reward changed');
    assert(getSavedCampaign().repaired[components.indexOf(c)],'completion not saved');const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate XP');
  }
  saveCampaign();continueCampaign();assert(JSON.stringify(ids)===JSON.stringify(components.map(c=>c.id))&&components.every(c=>c.repaired),'save lost component identity or flags');
});
test('software v2: pause freezes scans, conveyors, reconstruction and boot timers',()=>{
  const host=document.getElementById('repairContent');
  for(const entry of ByteRunner.repairV2.catalog.filter(c=>c.stage===2)){
    const s=ByteRunner.repairs.create({type:entry.id,seed:'pause'},{});
    try{s.mount(host);const a=s.model.next();s.action(a);s.update(.05);s.setPaused(true);
      const before=JSON.stringify(s.model);for(let n=0;n<100;n++)s.update(.05);
      assert(JSON.stringify(s.model)===before,'paused state changed '+entry.id);
      s.setPaused(false);solvePhysicalRepairUI(s);s.update(.6);assert(s.status==='success','resume failed '+entry.id);
    }finally{s.dispose();}
  }
});
test('software v2: failure penalty, hints and retry still belong to the campaign',()=>{
  setup(1);const c=components.find(c=>c.id==='swap:paging');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  const s=repairSession,host=document.getElementById('repairContent');s.hint();assert(s.hints===0&&!c.repaired,'hint solved restore');
  for(let n=0;n<3;n++)host.querySelector('[data-control="boot-switch2"]').click();
  assert(s.mode==='failed'&&player.health===95&&!c.repaired,'failed restore did not charge exactly one penalty');
  s.action({id:'boot-switch2'});s.update(1);assert(player.health===95,'penalty repeated');
  [...host.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();
  solvePhysicalRepairUI(s);updateRepair(.6);assert(c.repaired&&player.health===95,'retry failed');
});
test('software v2: scan completion updates accessible state without replacing file DOM',()=>{
  const host=document.getElementById('repairContent'),s=ByteRunner.repairs.create({type:'v2-virus-cleanup',seed:'async'},{});
  try{s.mount(host);const file=host.querySelector('[data-control="file0"]');file.click();
    for(let n=0;n<15;n++)s.update(.05);
    assert(file===host.querySelector('[data-control="file0"]'),'scan rebuilt desktop');
    assert(file.getAttribute('aria-label').includes(s.model.infected.includes(0)?'infectado':'íntegro'),'accessible scan result was not updated');
  }finally{s.dispose();}
});
test('software v2: real pause menu resumes repair input immediately and world stays frozen',()=>{
  setup(1);const c=components.find(c=>c.id==='recovery:recovery');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();
  const s=repairSession,world=JSON.stringify({player,viruses,projectiles,enemyProjectiles,animationTime,effects});
  for(let n=0;n<60;n++)update(1/60);assert(JSON.stringify({player,viruses,projectiles,enemyProjectiles,animationTime,effects})===world,'world moved during Software task');
  pause();const revision=s.model.revision;s.hint();assert(s.hints===1&&s.model.revision===revision,'paused task accepted input');
  startButton.click();s.hint();assert(s.hints===0&&s.active()&&!c.repaired,'repair stayed paused after continuing');
  solvePhysicalRepairUI(s);updateRepair(.6);assert(c.repaired,'resumed repair did not complete');
});
test('software v2: reduced motion preserves all four tasks without moving decorative machinery',()=>{
  const host=document.getElementById('repairContent');document.body.classList.add('reduced-effects');
  try{for(const entry of ByteRunner.repairV2.catalog.filter(c=>c.stage===2)){
    const s=ByteRunner.repairs.create({type:entry.id,seed:'reduced'},{});
    try{s.mount(host);assert(!host.querySelector('input,select,form,#repair-verify'),'generic form returned');solvePhysicalRepairUI(s);s.update(.6);assert(s.status==='success','reduced motion prevented '+entry.id);}finally{s.dispose();}
  }}finally{document.body.classList.remove('reduced-effects');}
});
