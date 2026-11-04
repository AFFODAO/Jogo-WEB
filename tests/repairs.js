// Solve through DOM controls; no success flags are assigned by these tests.
function solveRepairUI(session=repairSession) {
  const m=session.model,host=document.getElementById('repairContent');
  if(m.kind==='circuit') {
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
  } else {
    host.querySelectorAll('select').forEach((select,i)=>{select.value=m.answer[i];select.dispatchEvent(new Event('change',{bubbles:true}));});
  }
  host.querySelector('#repair-verify').click();
}
test('repairs: all campaign components have solvable modal challenges and persist once',()=>{
  for(let phase=0;phase<10;phase++) {
    setup(phase);xpRequired=999999;paused=false;
    for(const component of components) {
      player.x=component.x;player.y=component.y;keys.add('e');updateRepair(0);
      assert(repairSession?.blocksWorld && repairSession.model,'challenge missing '+phase+'/'+component.id);
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
  setup(0);paused=false;const c=components[0];player.x=c.x;player.y=c.y;player.vx=100;player.vy=20;
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
  setup(0);paused=false;const c=components[0];player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);
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
  setup(0);paused=false;unlockedSkills=[{id:'repair',level:4}];player.x=components[0].x;player.y=components[0].y;keys.add('e');updateRepair(0);
  assert(repairSession.hints===5&&repairSession.maxMistakes===5,'skill advantage missing');
  const before=repairSession.hints;repairSession.hint();assert(repairSession.hints===before-1&&!components[0].repaired,'hint bypassed challenge');
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
running=false;
