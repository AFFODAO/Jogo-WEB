await levelVisuals.ready;
test('procedural demo: URL loads generated phase 1 and preserves the nine remaining maps',()=>{
  assert(ByteRunner.proceduralDemo&&PHASES[0].id==='procedural-hardware','URL did not activate preview');
  assert(PHASES.length===10&&PHASES.slice(1).every((map,i)=>map===ByteRunner.maps.get('phase-'+String(i+2).padStart(2,'0'))),'later phases replaced');
  assert(SAVE_KEY!== 'byteRunner.campaign.v1'&&SAVE_KEY.includes('pcb-alpha'),'preview storage not isolated');
  assert(levelVisuals.errors.length===0&&levelVisuals.source('r07'),'original pixel art assets missing');
});
test('procedural demo: save and resume keep generated layout and progression',()=>{
  localStorage.setItem('byteRunner.campaign.v1','authored-save-sentinel');
  setup(0);endPhaseIntro();xp=37;const position={x:player.x,y:player.y},recipe=JSON.stringify(phaseData.generation.recipe);
  saveCampaign();xp=0;continueCampaign();endPhaseIntro();
  assert(xp===37&&Math.abs(player.x-position.x)<1&&Math.abs(player.y-position.y)<1,'preview resume changed player');
  assert(JSON.stringify(phaseData.generation.recipe)===recipe,'resume changed seed/recipe');
  assert(localStorage.getItem('byteRunner.campaign.v1')==='authored-save-sentinel','preview overwrote authored campaign');
});
test('procedural demo: mandatory question, wrong-answer retry and next authored phase',()=>{
  setup(0);endPhaseIntro();xpRequired=999999;checkObjectives();assert(!phaseExitUnlocked,'exploration objective unlocked at spawn');const exit=phaseData.map.exit;
  player.x=exit.x+5;player.y=exit.y+5;player.vx=player.vy=0;update(0);
  assert(phaseQuestionOpen&&!phaseTransition,'exit skipped mandatory question');
  ui.questionOverlay.querySelector('[data-correct="false"]').click();assert(questionRetryRequired,'wrong answer accepted');
  continueCampaign();endPhaseIntro();xpRequired=999999;assert(phaseIndex===0&&!phaseExitUnlocked,'wrong answer did not restart generated phase');
  checkObjectives();player.x=exit.x+5;player.y=exit.y+5;update(0);
  ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(phaseTransition,'correct answer did not unlock next phase');
  loadPhase(1,true);assert(phaseData===ByteRunner.maps.get('phase-02'),'phase 2 changed');
});
test('procedural demo: Part 2 saves retain XP and skills while resetting obsolete geometry',()=>{
  setup(0);endPhaseIntro();xp=37;unlockedSkills=[{id:'armor',level:2}];restoreSkillEffects();levelRuntime.setFlag('old-geometry');saveCampaign();
  const old=JSON.parse(localStorage.getItem(SAVE_KEY));old.mapRevision=1;old.player.x=4000;old.player.y=4000;old.checkpointX=4000;old.checkpointY=4000;old.phaseExitUnlocked=true;
  localStorage.setItem(SAVE_KEY,JSON.stringify(old));continueCampaign();endPhaseIntro();
  assert(player.x===mapStart().x&&player.y===mapStart().y&&!phaseExitUnlocked,'obsolete geometry restored');
  assert(xp===37&&unlockedSkills.some(s=>s.id==='armor'&&s.level===2)&&player.armor===.2,'migration lost XP or skills');
  assert(!levelRuntime.getFlag('old-geometry'),'obsolete flags restored');
});
running=false;
