// Solve through DOM controls; no success flags are assigned by these tests.
function solveRepairUI(session=repairSession) {
  const m=session.model,host=document.getElementById('repairContent');
  const click=id=>host.querySelector('#repair-'+id).click();
  if(m.kind==='equipment'){
    for(const step of m.solution){
      const [id,value]=step.split(':');
      if(value===undefined)click(id);
      else {
        const input=host.querySelector('#repair-'+id);
        input.value=value;
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
  } else if(m.kind==='circuit') {
    for(let i=0;i<m.values.length;i++) {
      let turns=0;
      while(m.values[i]!==m.answer[i] && turns++<4)host.querySelector('#repair-cell-'+i).click();
      assert(m.values[i]===m.answer[i],'unorientable pipe '+i);
    }
  } else if(m.kind==='route') {
    host.querySelectorAll('.repair-actions button')[2]?.click();
    for(const index of m.answer.slice(1))host.querySelector('#repair-cell-'+index).click();
  } else if(m.kind==='wifi') {
    host.querySelectorAll('input').forEach((input,i)=>{input.value=m.answer[i];input.dispatchEvent(new Event('input',{bubbles:true}));});
  } else if(m.kind==='software'){
    while(m.values.length)click('undo');
    for(const value of m.answer)click('action-'+m.options.indexOf(value));
  } else if(m.kind==='ethernet'){
    for(const [i,value] of m.answer.entries()){click('port-'+i);click('socket-'+m.options.indexOf(value));}
  } else if(m.kind==='cabling'){
    if(m.selected!==null)click('wire-'+m.selected);
    for(const [i,value] of m.answer.entries())if(m.values[i]!==value){
      const other=m.values.indexOf(value);click('wire-'+i);click('wire-'+other);
    }
  } else if(m.kind==='dns'){
    for(const [i,value] of m.answer.entries()){
      click('hop-'+i+'-'+m.options.indexOf(m.aliases[i]));
      click('address-'+i+'-'+m.addresses.indexOf(value));
    }
  } else if(m.kind==='firewall'){
    for(const [i,allow] of m.answer.entries())click('rule-'+i+'-'+Number(allow));
  } else if(m.kind==='servers'){
    for(const [i,value] of m.answer.entries())for(let n=0;n<9&&m.values[i]!==value;n++)click('epoch-'+i);
    if(!m.relay)click('relay');
  } else if(m.kind==='dhcp'){
    host.querySelectorAll('select').forEach((select,i)=>{select.value=m.answer[i];select.dispatchEvent(new Event('change',{bubbles:true}));});
  } else throw new Error('Unknown repair interaction: '+m.kind);
  host.querySelector('#repair-verify').click();
}
test('repairs: circuit panel tracks live power, focus and reset',()=>{
  const session=ByteRunner.repairs.create({type:'circuit',stage:9,seed:'panel'}, {});
  const panel=document.getElementById('repairPanel'),host=document.getElementById('repairContent');
  panel.hidden=false;
  try {
    session.mount(host);
    const cell=i=>host.querySelector('#repair-cell-'+i);
    const frame=()=>host.querySelector('.repair-console');
    assert(frame().dataset.theme==='firewall'&&cell(15),'incorrect theme or board size');
    assert(frame().dataset.ready==='false','scrambled circuit powered the output');
    session.handleKey(new KeyboardEvent('keydown',{key:'ArrowRight',cancelable:true}));
    assert(document.activeElement===cell(1),'arrow key did not move focus');
    cell(1).click();
    assert(cell(1).classList.contains('selected')&&document.activeElement===cell(1),'rotation lost selection or focus');
    session.verify();
    host.querySelector('#repair-reset').click();
    assert(session.model.values.every((value,i)=>value===session.model.initial[i])&&session.mistakes===1,'reset changed attempt budget or failed to restore tiles');
    solveRepairUI(session);
    assert(frame().dataset.ready==='true'&&frame().dataset.state==='won','output or confirmation state missing');
    assert(host.querySelectorAll('.powered').length===16,'solved circuit did not energize all tiles');
    session.update(.46);
    assert(session.status==='success','confirmation did not complete');
  } finally {
    session.dispose();
    panel.hidden=true;
  }
});
test('repairs: campaign distributes distinct mechanics with a cap of two',()=>{
  const api=ByteRunner.repairChallenges;
  report.repairInventory=[];
  const themes=[
    ['circuit','ram','cooling','gpu'],
    ['files','quarantine','software','boot'],
    ['ethernet','packets','vlan','uplink'],
    ['route','interfaces','gateway','route-table'],
    ['antenna','channel','power-signal','repeaters'],
    ['cabling','continuity','connectors','fiber'],
    ['ip-distribution','ip-conflicts','ip-reservations','ip-pool'],
    ['dns-records','dns-tree','dns-cache','dns-query'],
    ['firewall','policy-order','threats','barriers'],
    ['servers','rack-power','rack-load','core-relays','fiber','circuit']
  ];
  assert(new Set(api.catalog.map(g=>g.id)).size===api.catalog.length&&new Set(api.catalog.map(g=>g.mechanic)).size===api.catalog.length,'invalid catalog');
  for(let phase=0;phase<10;phase++){
    setup(phase);
    const counts=new Map();
    for(const component of components)counts.set(component.repair.type,(counts.get(component.repair.type)||0)+1);
    assert(counts.size>=Math.min(3,components.length)&&Math.max(...counts.values())<=2,'invalid campaign distribution '+phase);
    assert(counts.size===themes[phase].length&&themes[phase].every(type=>counts.has(type)),'missing thematic repair in phase '+phase);
    const first=api.assign(phaseData);
    report.repairInventory.push({phase:phase+1,components:phaseData.entities.components.map(component=>{
      const type=first.get(component.id).type;
      return {id:component.id,label:component.label,type,mechanic:api.catalog.find(entry=>entry.id===type)?.mechanic};
    })});
    const reversed=ByteRunner.maps.clone(phaseData);reversed.entities.components.reverse();
    const second=api.assign(reversed);
    for(const [id,spec] of first)assert(JSON.stringify(second.get(id))===JSON.stringify(spec),'unstable distribution '+id);
  }
});
test('repairs: themed equipment variants solve through the panel',()=>{
  setup(0);
  const host=document.getElementById('repairContent');
  for(const {id} of ByteRunner.repairChallenges.catalog){
    if(ByteRunner.repairChallenges.types.includes(id))continue;
    for(let seed=0;seed<8;seed++){
      const session=ByteRunner.repairs.create({type:id,seed:'equipment-'+seed},{});
      session.mount(host);
      try{
        assert(!session.model.check(session.model),'already solved '+id);
        solveRepairUI(session);session.update(.6);
        assert(session.status==='success','unsolvable '+id+' seed '+seed);
      }finally{session.dispose();}
    }
  }
});
test('repairs: placement accepts touch drop and click selection',()=>{
  setup(0);
  const panel=document.getElementById('repairPanel'),host=document.getElementById('repairContent');
  const session=ByteRunner.repairs.create({type:'ram',seed:'placement'},{});
  panel.hidden=false;session.mount(host);
  try{
    const part=host.querySelector('#repair-part-'+session.model.answer[0]);
    const slot=host.querySelector('#repair-slot-0');
    part.setPointerCapture=()=>{};
    slot.scrollIntoView({block:'nearest'});
    const bounds=slot.getBoundingClientRect(),x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
    const pointer=(type,clientX)=>part.dispatchEvent(new PointerEvent(type,{
      pointerId:12,pointerType:'touch',isPrimary:true,clientX,clientY:y,bubbles:true
    }));
    pointer('pointerdown',x-20);pointer('pointermove',x);pointer('pointerup',x);
    assert(session.model.values[0]===session.model.answer[0],'touch drop did not place the module');
    host.querySelector('#repair-part-'+session.model.answer[1]).click();
    host.querySelector('#repair-slot-1').click();
    assert(session.model.values[1]===session.model.answer[1],'click fallback did not place the module');
  }finally{session.dispose();panel.hidden=true;}
});
test('repairs: explicit specs reserve capacity and procedural repairs use the map theme and seed',()=>{
  const api=ByteRunner.repairChallenges,explicit={type:'hold',duration:2},custom={type:'sequence',keys:['1']};
  const ids=['cpu','ram','ethernet','signal','cable','replica','route','archive'];
  const phase={id:'test-repair-distribution',theme:'hardware',seed:'a',entities:{components:[
    {id:'fixed-a',repair:explicit},{id:'fixed-b',repair:custom},
    {id:'fixed-c',repair:{type:'circuit'}},{id:'fixed-d',repair:{type:'circuit'}},
    ...ids.map(id=>({id,region:'hardware'}))
  ]}};
  const assigned=api.assign(phase);
  assert(assigned.get('fixed-a')===explicit&&assigned.get('fixed-b')===custom,'explicit spec changed');
  assert(ids.every(id=>assigned.get(id).type!=='circuit'),'automatic assignment exceeded reserved cap');
  const different=api.assign({...phase,seed:'b'});
  assert(ids.every(id=>different.get(id).seed!==assigned.get(id).seed),'seed did not reach the session');
  for(const theme of ['wifi','dns','servers']){
    const map=ByteRunner.proceduralMaps.generateGameplay({seed:'repair-distribution',theme,difficulty:3,roomCount:12});
    setup(0);loadMap(map,true);
    assert(components.length>0&&components.every(c=>c.repair.stage===ByteRunner.environmentArt.themes.indexOf(theme)+1&&c.repair.difficulty===3),'procedural theme or difficulty lost');
    const counts=new Map();
    for(const c of components)counts.set(c.repair.type,(counts.get(c.repair.type)||0)+1);
    assert(counts.size>=Math.min(3,components.length)&&Math.max(...counts.values())<=2,'invalid procedural distribution');
  }
});
test('repairs: all campaign components have solvable modal challenges and persist once',()=>{
  for(let phase=0;phase<10;phase++) {
    setup(phase);xpRequired=999999;paused=false;
    for(const component of components) {
      player.x=component.x;player.y=component.y;keys.add('e');updateRepair(0);
      assert(repairSession?.blocksWorld && repairSession.model,'challenge missing '+phase+'/'+component.id);
      const panel=document.getElementById('repairPanel');
      assert(panel.scrollWidth<=panel.clientWidth+1,'horizontal overflow '+phase+'/'+component.id);
      const before=xp,allBefore=objectives.allRepairs;
      solveRepairUI();updateRepair(.6);
      const expected=before+30+(!allBefore&&objectives.allRepairs?100:0);
      assert(component.repaired&&!repairSession&&xp===expected,'repair success/XP '+phase+'/'+component.id);
      updateRepair(.6);assert(xp===expected,'duplicate XP');
      assert(getSavedCampaign().repaired[components.indexOf(component)],'completion not saved');
    }
  }
});
test('repairs: keyboard tap opens immediately and freezes movement, combat and timers',()=>{
  setup(0);paused=false;const c=components.find(c=>c.repair.type==='circuit');player.x=c.x;player.y=c.y;player.vx=100;player.vy=20;
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true}));
  window.dispatchEvent(new KeyboardEvent('keyup',{key:'e',bubbles:true}));
  assert(repairSession?.blocksWorld,'single tap did not open');
  const snapshot=JSON.stringify({player,viruses,projectiles,enemyProjectiles,animationTime,cameraX,cameraY,effects});
  for(let i=0;i<60;i++){keys.add('d');keys.add('j');update(1/60);}
  assert(snapshot===JSON.stringify({player,viruses,projectiles,enemyProjectiles,animationTime,cameraX,cameraY,effects}),'world advanced during repair');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));assert(!jumpQueued,'modal queued jump');
  const session=repairSession;document.getElementById('repairPauseButton').click();assert(!running&&document.getElementById('repairPanel').hidden,'pause panel');
  const rotations=[...session.model.values];session.hint();assert(JSON.stringify(rotations)===JSON.stringify(session.model.values),'paused UI changed puzzle');
  startButton.click();assert(repairSession===session,'pause lost puzzle');
  document.getElementById('cancelRepairButton').click();assert(!repairSession&&!c.repaired&&!keys.size,'cancel state');
});
test('repairs: failure penalizes once, retry varies, cancel does not repair',()=>{
  setup(0);paused=false;const c=components.find(c=>c.repair.type==='circuit');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  const session=repairSession;session.model.values.fill(0); // deliberately disconnected board
  for(let i=0;i<session.maxMistakes;i++)session.verify();
  assert(session.mode==='failed'&&player.health===95&&!c.repaired,'failure penalty');
  session.verify();updateRepair(1);assert(player.health===95&&repairSession===session,'repeated penalty or world resumed');
  document.querySelector('#repairContent .repair-actions button').click();assert(session.mode==='playing'&&session.attempt===2,'retry unavailable');
  solveRepairUI();updateRepair(.6);assert(c.repaired&&player.health===95,'retry impossible');
  setup(0);paused=false;player.health=3;player.x=components[0].x;player.y=components[0].y;keys.add('e');updateRepair(0);
  repairSession.model.values.fill(0);for(let i=0;i<3;i++)repairSession.verify();assert(player.health===1,'penalty killed player');
  document.getElementById('cancelRepairButton').click();assert(!components[0].repaired&&xp===0,'cancel granted repair');
});
test('repairs: skill supplies hints and tolerance without solving the challenge',()=>{
  setup(0);paused=false;unlockedSkills=[{id:'repair',level:4}];const c=components.find(c=>c.repair.type==='circuit');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  assert(repairSession.hints===5&&repairSession.maxMistakes===5,'skill advantage missing');
  const before=repairSession.hints;repairSession.hint();assert(repairSession.hints===before-1&&!c.repaired,'hint bypassed challenge');
  assert(repairSession.model.values.length>=9,'skill removed board');cancelRepair();
});
test('repairs: generated variations remain solvable across all ten types',()=>{
  setup(0);paused=false;const signatures=new Set();
  for(let phase=0;phase<10;phase++)for(let variation=0;variation<8;variation++) {
    let seed=phase*101+variation+1;
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const session=ByteRunner.repairs.create(ByteRunner.repairChallenges.forPhase(phase,variation%3),{repairRank:0,random});
    session.mount(document.getElementById('repairContent'));
    signatures.add(JSON.stringify(session.model));solveRepairUI(session);session.update(.6);
    assert(session.status==='success','unsolvable variation '+phase+'/'+variation);session.dispose();
  }
  assert(signatures.size>50,'insufficient variation');
});
test('repairs: type-specific controls enforce different rules',()=>{
  setup(0);
  const host=document.getElementById('repairContent');
  function run(type,verify){
    const session=ByteRunner.repairs.create({type,seed:'rules-test'},{});
    session.mount(host);
    try{verify(session.model,id=>host.querySelector('#repair-'+id));}
    finally{session.dispose();}
  }
  run('software',(m,control)=>{
    control('action-'+m.options.indexOf(m.answer[1])).click();
    assert(m.values[0]===m.answer[1]&&!m.check(m),'wrong boot order accepted');
    control('undo').click();assert(!m.values.length,'queue undo failed');
  });
  run('ethernet',(m,control)=>{
    control('socket-0').click();control('port-1').click();control('socket-0').click();
    assert(!m.values[0]&&m.values[1]===m.options[0],'socket occupied twice');
  });
  run('cabling',(m,control)=>{
    const before=m.values.slice();
    control('wire-0').click();control('wire-1').click();
    assert(m.values[0]===before[1]&&m.values[1]===before[0],'wire swap failed');
  });
  run('dhcp',(m)=>{
    m.values.fill(m.answer[0]);assert(!m.check(m),'duplicate lease accepted');
    m.values=m.answer.slice();m.values[0]=m.options.find(value=>value.endsWith('.255'));
    assert(!m.check(m),'broadcast lease accepted');
  });
  run('dns',(m,control)=>{
    assert(!control('address-0-0'),'address available before lookup');
    control('hop-0-'+m.options.indexOf(m.aliases[1])).click();
    control('address-0-'+m.addresses.indexOf(m.answer[0])).click();
    assert(!m.check(m),'wrong lookup accepted');
  });
  run('firewall',(m,control)=>{
    control('rule-0-0').click();assert(m.values[0]===false,'decision did not block');
    control('rule-0-1').click();assert(m.values[0]===true,'decision did not allow');
  });
  run('servers',(m,control)=>{
    assert(control('relay').disabled,'relay enabled before synchronization');
    for(const [i,value] of m.answer.entries())for(let n=0;n<9&&m.values[i]!==value;n++)control('epoch-'+i).click();
    control('relay').click();assert(m.check(m),'synchronized relay failed');
    control('epoch-0').click();assert(!m.relay&&!m.check(m),'relay stayed active after clock drift');
  });
  run('fiber',(m,control)=>{
    assert(control('fiber-lock').disabled,'fiber lock enabled without alignment');
    const dial=(axis,value)=>{
      const input=control('dial-fiber-'+axis);input.value=value;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    };
    dial('x',m.answer[0]);dial('y',m.answer[1]);
    control('fiber-lock').click();assert(m.check(m),'optical lock failed');
    dial('x',0);assert(!m.values[2]&&!m.check(m),'alignment change kept lock');
  });
  run('ip-distribution',(m,control)=>{
    control('lease-4').click();control('device-0').click();
    assert(control('device-0').dataset.signal==='bad'&&!m.check(m),'broadcast did not show invalid feedback');
    control('lease-0').click();control('device-0').click();
    control('lease-0').click();control('device-1').click();
    assert(m.values[0]===-1&&m.values[1]===0,'lease occupied two devices');
  });
  run('barriers',(m,control)=>{
    const initial=m.values.slice();
    control('barrier-0').click();
    assert(m.values.every((value,i)=>value===(i===0||i===1||i===4?1-initial[i]:initial[i])),'barrier failed to wrap');
    control('barrier-0').click();assert(m.values.every((value,i)=>value===initial[i]),'barrier toggle irreversible');
  });
  run('core-relays',(m,control)=>{
    assert(control('core-4').disabled,'core enabled before its dependencies');
    for(const step of m.solution)control(step).click();
    assert(m.check(m),'relay chain did not complete');
    control('core-0').click();
    assert(!m.check(m)&&!m.values[2]&&!m.values[3]&&!m.values[4],'dependent relays stayed enabled');
  });
});
running=false;
