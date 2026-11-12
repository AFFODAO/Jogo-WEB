test('hardware v2: CPU rejects orientation, then locks and activates automatically',()=>{
  const m=ByteRunner.repairV2Models.create('cpu-install',()=>.3);
  m.apply({id:'cpu',target:'cpu-socket'});assert(!m.seated&&m.rejected==='cpu-socket'&&!m.error,'wrong CPU orientation accepted or charged');
  while(m.orientation!==0)m.apply({id:'rotate-cpu'});
  m.apply({id:'cpu',target:'cpu-socket'});assert(m.seated&&!m.done,'insertion completed before retention');
  m.apply({id:'cpu-lever'});assert(m.leverClosed&&!m.done,'locking activation skipped');
  for(let i=0;i<20;i++)m.tick(.05);assert(m.done&&m.activation===1,'CPU did not activate');
});
test('hardware v2: three DIMMs require matching notches and unique empty slots',()=>{
  const m=ByteRunner.repairV2Models.create('ram-install',()=>.2);
  const wrong=m.slotTypes.findIndex(v=>v!==0);
  m.apply({id:'ram0',target:'dimm-slot'+wrong});assert(m.slots.every(v=>v<0)&&m.rejected==='dimm-slot'+wrong&&!m.error,'incompatible module placed');
  for(let i=0;i<3;i++){m.apply({id:'ram'+i,target:'dimm-slot'+m.slotTypes.indexOf(i)});assert(m.slots.filter(v=>v>=0).length===i+1,'module failed to seat');}
  assert(!m.done,'clip/LED animation skipped');for(let i=0;i<12;i++)m.tick(.05);assert(m.done,'DIMM locks did not settle');
});
test('hardware v2: power connectors reject mismatched pin counts before activation',()=>{
  const m=ByteRunner.repairV2Models.create('power-wiring',()=>.7),wrong=m.socketTypes.findIndex(v=>v!==0);
  m.apply({id:'power-cable0',target:'power-socket'+wrong});assert(m.connections.every(v=>v<0)&&!m.error,'wrong power connector accepted or charged');
  for(let i=0;i<3;i++)m.apply({id:'power-cable'+i,target:'power-socket'+m.socketTypes.indexOf(i)});
  assert(!m.done,'power activated without charge animation');for(let i=0;i<20;i++)m.tick(.05);assert(m.done&&m.charge===1,'power did not stabilize');
});
test('hardware v2: replacement fan needs removal, four mounts and cable before cooling',()=>{
  const m=ByteRunner.repairV2Models.create('fan-replacement');
  m.apply({id:'new-fan',target:'fan-mount'});assert(!m.installed,'replacement bypassed old fan');
  m.apply({id:'old-fan',target:'fan-bin'});assert(!m.oldRemoved,'live cable bypassed');
  m.apply({id:'unplug-old'});m.apply({id:'old-fan',target:'fan-bin'});m.apply({id:'new-fan',target:'fan-mount'});
  m.apply({id:'fan-cable',target:'fan-header'});assert(!m.connected,'cable bypassed mounting points');
  for(let i=0;i<4;i++)m.apply({id:'fan-screw'+i,value:2});m.apply({id:'fan-cable',target:'fan-header'});
  m.tick(.05);assert(m.rpm>0&&m.temperature<86&&!m.done,'fan skipped cooling phase');
  for(let i=0;i<80;i++)m.tick(.05);assert(m.done&&m.temperature===54&&m.rpm===1600,'temperature did not stabilize');
});
test('hardware v2: only Stage 1 mappings change and the four objectives persist',()=>{
  setup(0);xpRequired=999999;
  const expected={'socket:cpu-relay':'v2-fan-replacement','ram-base:ram-relay':'v2-ram-install','bus-west:bus-relay':'v2-cpu-install','gpu-east:gpu-relay':'v2-power-wiring'};
  assert(components.length===4,'component count changed');
  for(const c of components){assert(c.repair.type===expected[c.id],'incorrect Stage 1 mapping');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
    const before=xp,objectiveBefore=objectives.allRepairs;solvePhysicalRepairUI();updateRepair(.6);
    assert(c.repaired&&xp===before+30+(!objectiveBefore&&objectives.allRepairs?100:0),'repair event or reward changed');
    assert(getSavedCampaign().repaired[components.indexOf(c)],'repair not saved');}
  assert(objectives.allRepairs,'stage objective did not complete');
  const old=JSON.stringify(components.map(c=>c.id));saveCampaign();continueCampaign();assert(JSON.stringify(components.map(c=>c.id))===old&&components.every(c=>c.repaired),'save lost IDs or repair flags');
});
test('hardware v2: laboratory controls retain DOM, rotate the held CPU and reject bad DIMMs',()=>{
  const host=document.getElementById('repairContent'),panel=document.getElementById('repairPanel');panel.hidden=false;
  let session=ByteRunner.repairs.create({type:'v2-cpu-install',seed:'hardware'},{});
  try{
    session.mount(host);const source=host.querySelector('[data-control="cpu"]'),stage=host.querySelector('.repair-scene-stage');
    source.click();const orientation=session.model.orientation;source.dispatchEvent(new KeyboardEvent('keydown',{key:'r',bubbles:true,cancelable:true}));assert(session.model.orientation===(orientation+1)%4,'held CPU did not rotate');
    assert(stage===host.querySelector('.repair-scene-stage')&&source===host.querySelector('[data-control="cpu"]'),'rotation rebuilt equipment');
    solvePhysicalRepairUI(session);session.dispose();
    session=ByteRunner.repairs.create({type:'v2-ram-install',seed:'hardware'},{});session.mount(host);
    const wrong=session.model.slotTypes.findIndex(v=>v!==0);host.querySelector('[data-control="ram0"]').click();host.querySelector('[data-control="dimm-slot'+wrong+'"]').click();
    assert(session.model.slots.every(v=>v<0)&&session.mistakes===0&&host.querySelector('[role="status"]').textContent.includes('entalhe'),'wrong slot had no visual/accessible rejection');
    solvePhysicalRepairUI(session);
  }finally{session.dispose();panel.hidden=true;}
});
test('hardware v2: cooling and socket activation freeze when the session pauses',()=>{
  const host=document.getElementById('repairContent');let active=true;
  const s=ByteRunner.repairs.create({type:'v2-fan-replacement',seed:'pause'},{isActive:()=>active});
  try{s.mount(host);for(let i=0;i<20&&!s.model.connected;i++){const a=s.model.next();s.action(a);}
    assert(s.model.connected,'fan setup did not finish');s.update(.05);const temp=s.model.temperature,rpm=s.model.rpm,time=s.model.time;
    active=false;s.setPaused(true);for(let i=0;i<120;i++)s.update(.05);assert(s.model.temperature===temp&&s.model.rpm===rpm&&s.model.time===time,'paused machinery advanced');
    active=true;s.update(.05);assert(s.model.temperature===temp&&s.model.time===time,'explicit pause was ignored');
    s.setPaused(false);for(let i=0;i<100;i++)s.update(.05);assert(s.status==='success','fan did not resume');
  }finally{s.dispose();}
});
test('hardware v2: reduced motion freezes blades while cooling remains functional',()=>{
  const host=document.getElementById('repairContent');document.body.classList.add('reduced-effects');
  const s=ByteRunner.repairs.create({type:'v2-fan-replacement',seed:'reduce'},{});
  try{
    s.mount(host);for(let i=0;i<20&&!s.model.connected;i++)s.action(s.model.next());
    for(let i=0;i<20;i++)s.update(.05);
    const ctx=host.querySelector('canvas').getContext('2d'),before=[...ctx.getImageData(125,55,70,70).data],temp=s.model.temperature;
    s.update(.05);const after=[...ctx.getImageData(125,55,70,70).data];
    assert(JSON.stringify(before)===JSON.stringify(after)&&s.model.temperature<temp,'reduced-motion blades moved or cooling stopped');
    for(let i=0;i<80;i++)s.update(.05);assert(s.status==='success','reduced motion prevented completion');
  }finally{s.dispose();document.body.classList.remove('reduced-effects');}
});
