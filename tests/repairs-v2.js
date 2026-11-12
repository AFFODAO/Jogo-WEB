// Integration tests run inside the same isolated game closure as legacy reviews.
function solvePhysicalRepairUI(session=repairSession){
  const host=document.getElementById('repairContent');
  for(let count=0;session.mode==='playing'&&count<180;count++){
    const action=session.model.next();assert(action,'missing next physical action');
    if(action.wait){for(let i=0;i<100&&session.mode==='playing';i++)session.update(.05);continue;}
    const control=session.model.controls().find(c=>c.id===action.id);assert(control,'missing physical control '+action.id);
    const button=host.querySelector(`[data-control="${action.id}"][data-target="false"]`);assert(button&&!button.disabled,'disabled physical action '+action.id);
    if(action.target){button.click();host.querySelector(typeof action.target==='string'?`[data-control="${action.target}"]`:`[data-control="${action.id}"][data-target="true"]`).click();}
    else if(action.value!==undefined){
      button.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
      for(let i=0;i<action.value;i++)button.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    }else button.click();
  }
  assert(session.mode==='won','physical repair stalled: '+session.label());
}

test('repairs v2: 40 rules, 800 deterministic solvable variations',()=>{
  const ids=ByteRunner.repairV2Models.ids;assert(ids.length===40&&new Set(ids).size===40,'catalog count');
  let variants=0;
  for(const id of ids)for(let seed=0;seed<20;seed++){
    const rng=()=>{seedState=(Math.imul(seedState,1664525)+1013904223)>>>0;return seedState/4294967296;};let seedState=seed+1;
    const m=ByteRunner.repairV2Models.create(id,rng);
    for(let n=0;!m.done&&n<180;n++){const a=m.next();assert(a,id+' has no next action');if(a.wait){for(let i=0;i<100;i++)m.tick?.(.05);continue;}assert(m.controls().some(c=>c.id===a.id),id+' has no reachable action');m.apply(a);assert(!m.error,id+' valid solution hit error: '+m.message);}
    assert(m.done,id+' seed '+seed+' impossible');variants++;
  }
  report.v2Variations=variants;
});

test('repairs v2: manifest covers every stable component and saves',()=>{
  ByteRunner.repairV2.enabled=true;
  report.v2Inventory=[];
  for(let stage=0;stage<10;stage++){
    setup(stage);xpRequired=999999;
    const original=PHASES[stage].entities.components.map(c=>c.id);assert(sameIDs(original,components.map(c=>c.id)),'component order changed');
    const counts=new Map();
    for(const component of components){
      assert(component.repair.type.startsWith('v2-'),'legacy component '+stage+'/'+component.id);
      counts.set(component.repair.type,(counts.get(component.repair.type)||0)+1);
      player.x=component.x;player.y=component.y;keys.add('e');updateRepair(0);
      assert(repairSession?.engine==='v2'&&repairSession.blocksWorld,'v2 did not open');
      const before=xp,objectivesBefore=objectives.allRepairs;
      solvePhysicalRepairUI();updateRepair(.6);
      assert(component.repaired&&component.integrity===100&&component.corruption===0,'component not restored');
      assert(xp===before+30+(!objectivesBefore&&objectives.allRepairs?100:0),'XP incorrect');
      const saved=getSavedCampaign();assert(saved.repaired[components.indexOf(component)],'save lost completion');
      const earned=xp;updateRepair(.6);assert(xp===earned,'duplicate XP');
    }
    assert(counts.size===4,'stage does not have four mechanics');
    assert(Math.max(...counts.values())<=(stage===9?3:2),'distribution exceeded intended cap');
    report.v2Inventory.push({phase:stage+1,components:components.map(c=>({id:c.id,type:c.repair.type})),counts:Object.fromEntries(counts)});
  }
  function sameIDs(a,b){return JSON.stringify(a)===JSON.stringify(b);}
});

test('repairs v2: pause, failure, hints, cancel and retry preserve economy',()=>{
  setup(0);const c=components.find(c=>c.repair.type==='v2-cpu-install');player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
  const session=repairSession,host=document.getElementById('repairContent');
  const state=JSON.stringify({player,viruses,projectiles,enemyProjectiles,animationTime,cameraX,cameraY,effects});
  for(let n=0;n<60;n++)update(1/60);
  assert(state===JSON.stringify({player,viruses,projectiles,enemyProjectiles,animationTime,cameraX,cameraY,effects}),'world advanced');
  const revision=session.model.revision;pause();host.querySelector('[data-control="cpu-lever"]').click();session.hint();
  assert(session.model.revision===revision&&session.hints===1,'paused inputs changed puzzle');
  startButton.click();assert(repairSession===session,'resume lost attempt');
  session.hint();assert(session.hints===0&&!c.repaired,'hint solved task');
  const fire=()=>host.querySelector('[data-control="cpu-lever"]').click();fire();fire();fire();
  assert(session.mode==='failed'&&player.health===95&&!c.repaired,'failure penalty incorrect');
  fire();session.update(.6);assert(player.health===95&&repairSession===session,'failure charged twice');
  [...host.querySelectorAll('.repair-v2-tools button')].find(b=>b.textContent==='NOVA TENTATIVA').click();
  assert(session.attempt===2&&session.mode==='playing','retry failed');
  solvePhysicalRepairUI();updateRepair(.6);assert(c.repaired&&player.health===95,'retry did not finish');
  setup(0);player.health=3;const lowHealthCPU=components.find(c=>c.repair.type==='v2-cpu-install');player.x=lowHealthCPU.x;player.y=lowHealthCPU.y;keys.add('e');updateRepair(0);
  const current=repairSession;
  for(let i=0;i<3;i++)document.querySelector('[data-control="cpu-lever"]').click();
  assert(player.health===1,'penalty floor changed');document.getElementById('cancelRepairButton').click();assert(!lowHealthCPU.repaired&&xp===0,'cancel rewarded');
});

test('repairs v2: pointer cancellation, insertion and keyboard have one owner',()=>{
  const panel=document.getElementById('repairPanel'),host=document.getElementById('repairContent');panel.hidden=false;
  const session=ByteRunner.repairs.create({type:'v2-ram-install',seed:'touch'},{});
  try{
    session.mount(host);
    const source=host.querySelector('[data-control="ram0"][data-target="false"]');source.setPointerCapture=()=>{};source.releasePointerCapture=()=>{};
    const destination=session.model.controls().find(c=>c.id==='ram0').targets[session.model.slotTypes.indexOf(0)];
    const box=host.querySelector('.repair-scene-stage').getBoundingClientRect();
    const send=(type,x,y,id=7)=>source.dispatchEvent(new PointerEvent(type,{bubbles:true,isPrimary:true,pointerId:id,pointerType:'touch',button:0,clientX:box.left+x*box.width/640,clientY:box.top+y*box.height/560}));
    send('pointerdown',140,440);send('pointermove',destination.x,destination.y);send('pointercancel',destination.x,destination.y);assert(!session.model.slots.includes(0),'cancel committed insertion');
    send('pointerdown',140,440);send('pointermove',destination.x,destination.y,8);send('pointerup',140,440);assert(!session.model.slots.includes(0),'second pointer stole insertion');
    send('pointerdown',140,440);send('pointermove',destination.x,destination.y);send('pointerup',destination.x,destination.y);assert(session.model.slots.includes(0),'touch insertion failed');
    solvePhysicalRepairUI(session);assert(session.mode==='won','clips did not lock');
    session.dispose();assert(!host.children.length,'scene leaked DOM');session.dispose();
  }finally{session.dispose();panel.hidden=true;}
});

test('repairs v2: renderer is responsive and contains no form or verify controls',()=>{
  const panel=document.getElementById('repairPanel'),host=document.getElementById('repairContent');panel.hidden=false;
  for(const entry of ByteRunner.repairV2.catalog){
    const session=ByteRunner.repairs.create({type:entry.id,seed:'geometry'},{});
    try{
      session.mount(host);assert(host.querySelector('canvas'),'missing equipment art');assert(!host.querySelector('input,select,form,#repair-verify'),'form layout returned');
      assert(panel.scrollWidth<=panel.clientWidth+1,'horizontal overflow '+entry.id);
      const canvas=host.querySelector('canvas');assert(canvas.getContext('2d').getImageData(50,50,1,1).data[3]>0,'blank scene');
      solvePhysicalRepairUI(session);session.update(.6);assert(session.status==='success','scene success failed '+entry.id);
    }finally{session.dispose();}
  }
  panel.hidden=true;
});

test('repairs v2: procedural assignment remains deterministic and accepts explicit extensions',()=>{
  for(const theme of ['hardware','wifi','servers']){
    const phase={id:'procedural',theme,seed:'a',entities:{components:Array.from({length:15},(_,i)=>({id:'component-'+i}))}};
    phase.entities.components[0].repair={type:'hold',duration:2};
    const a=ByteRunner.repairV2.assign(phase),b=ByteRunner.repairV2.assign({...phase,entities:{components:[...phase.entities.components].reverse()}});
    assert(a.get('component-0')===phase.entities.components[0].repair,'explicit extension replaced');
    for(const [id,spec] of a)assert(JSON.stringify(spec)===JSON.stringify(b.get(id)),'order changed assignment');
    assert(new Set([...a.values()].filter(s=>s.type!=='hold').map(s=>s.type)).size===4,'procedural variety missing');
  }
});

test('repairs v2: version 1 legacy save keeps repairs, XP and checkpoint after migration',()=>{
  ByteRunner.repairV2.enabled=false;setup(6);xp=47;xpRequired=999999;
  components[1].repaired=true;components[1].integrity=100;components[2].integrity=42;
  checkpointIndex=1;checkpointX=phaseData.map.checkpoints[1].x;checkpointY=phaseData.map.checkpoints[1].y;
  saveCampaign();const before=getSavedCampaign(),ids=components.map(c=>c.id);ByteRunner.repairV2.enabled=true;
  continueCampaign();
  assert(before.version===1&&xp===47&&components[1].repaired&&!components[0].repaired,'legacy progress changed');
  assert(components[2].integrity===42&&checkpointIndex===1&&checkpointX===before.checkpointX&&checkpointY===before.checkpointY,'checkpoint or integrity lost');
  assert(JSON.stringify(ids)===JSON.stringify(components.map(c=>c.id))&&components.every(c=>c.repair.type.startsWith('v2-')),'save migrated component identities');
});
