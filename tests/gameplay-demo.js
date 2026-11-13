await levelVisuals.ready;
test('room demo: gameplay is active and campaign storage stays isolated',()=>{
  assert(ByteRunner.proceduralDemo&&phaseData.generation.gameplay,'new content not activated');
  assert(SAVE_KEY.startsWith('byteRunner.rooms.v1:')&&PHASES.length===10,'save isolation or campaign progression changed');
  assert(PHASES.slice(1).every((p,i)=>p===ByteRunner.maps.get('phase-'+String(i+2).padStart(2,'0'))),'authored later phases replaced');
});
function completeGeneratedRepairs() {
  for(const c of components)if(!c.repaired){player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();assert(repairSession?.model,'repair model missing');solveRepairUI();updateRepair(.6);assert(c.repaired,'repair failed');}
}
test('room demo: completed repairs, XP, skills and checkpoints survive death and campaign restore',()=>{
  localStorage.setItem('byteRunner.campaign.v1','authored-campaign-sentinel');setup(0);endPhaseIntro();xpRequired=999999;
  completeGeneratedRepairs();const ids=components.map(c=>c.id),recipe=JSON.stringify(phaseData.generation.recipe);
  const panels=phaseData.entities.interactives.filter(p=>p.id.endsWith(':secret-panel'));
  for(const panel of panels){player.x=panel.x;player.y=panel.y-8;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});assert(levelRuntime.getFlag(panel.flag),'secret was not discovered');}
  xp=37;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();
  const point=phaseData.map.checkpoints[0];checkpointX=point.x;checkpointY=point.y;checkpointIndex=0;saveCampaign();
  damageCooldown=0;player.health=1;damagePlayer(20,{x:0});assert(components.every(c=>c.repaired)&&combatDefeat&&player.health===0,'death lost repairs');restartFromCheckpoint();
  saveCampaign();components.forEach(c=>c.repaired=false);xp=0;continueCampaign();endPhaseIntro();
  assert(components.every(c=>c.repaired)&&JSON.stringify(components.map(c=>c.id))===JSON.stringify(ids),'repair indices lost on restore');
  assert(xp===37&&player.damage===1&&skillRank('cannon')===2&&checkpointX===point.x&&checkpointY===point.y,'progress/checkpoint lost');
  assert(panels.every(p=>levelRuntime.getFlag(p.flag)),'secret discovery lost on restore');
  assert(JSON.stringify(phaseData.generation.recipe)===recipe,'restored a different recipe');
  assert(localStorage.getItem('byteRunner.campaign.v1')==='authored-campaign-sentinel','authored campaign save overwritten');
});
test('room demo: required repairs gate final question, wrong answers replay and correct answers advance',()=>{
  setup(0);endPhaseIntro();xpRequired=999999;
  const exit=phaseData.map.exit;player.x=exit.x+5;player.y=exit.y;update(0);assert(!phaseQuestionOpen,'mandatory repair bypassed');
  completeGeneratedRepairs();player.x=exit.x+5;player.y=exit.y;update(0);assert(phaseQuestionOpen,'repaired mission did not open final question');
  ui.questionOverlay.querySelector('[data-correct="false"]').click();continueCampaign();endPhaseIntro();assert(components.every(c=>!c.repaired)&&!phaseExitUnlocked,'wrong-answer retry skipped');
  xpRequired=999999;completeGeneratedRepairs();player.x=exit.x+5;player.y=exit.y;update(0);
  ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();
  assert(phaseTransition,'correct answer did not advance');continueCampaign();assert(phaseData.id==='phase-02','next authored phase missing');
});
running=false;
