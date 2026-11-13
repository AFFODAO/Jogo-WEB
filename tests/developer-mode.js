// Real DOM navigation in an isolated Chrome profile. Reload resumes this test,
// not the developer session; production has no test state or reload sentinel.
const devIds=id=>document.getElementById(id);
const devToggle=enabled=>{devIds('developerModeToggle').checked=enabled;devIds('developerModeToggle').dispatchEvent(new Event('change',{bubbles:true}));};
const devUnchanged=(saved,history)=>assert(localStorage.getItem(SAVE_KEY)===saved&&localStorage.getItem(QUESTION_HISTORY_KEY)===history,'normal storage changed');
const devFreshPlatforms=()=>[...platformRuntime].every(([id,state])=>phaseData.entities.platforms.some(p=>p.id===id)&&state.elapsed===0&&state.active&&!state.triggered&&!state.respawning);
const reloadRecord=sessionStorage.getItem('byteRunner.developerTestReload');
if(reloadRecord){
  const previous=JSON.parse(reloadRecord);Object.assign(report.systems,previous.systems);
  test('developer: reload starts OFF with untouched campaign and question history',()=>{
    assert(!developerSession&&!devIds('developerModeToggle').checked&&devIds('developerTools').hidden,'test mode survived reload');
    devUnchanged(previous.saved,previous.history);assert(menuScreen&&!running,'reload did not return to menu');
    continueButton.click();assert(phaseIndex===2&&xp===47&&level===3&&player.damage===1&&skillRank('cannon')===2&&components[0].repaired,'normal progress not resumable after reload');
    assert(checkpointIndex===2,'normal checkpoint lost');
  });
  sessionStorage.removeItem('byteRunner.developerTestReload');
}else{
  test('developer: default OFF and no tools in normal menu',()=>assert(!developerSession&&!devIds('developerModeToggle').checked&&devIds('developerTools').hidden&&document.querySelector('.developer-pause-actions').hidden,'tools visible by default'));
  // A real normal campaign with progress, skills, checkpoint and runtime flags.
  setup(2);await levelVisuals.ready;endPhaseIntro();highestUnlockedPhase=2;level=3;xp=47;xpRequired=experienceForLevel(level);unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();
  components[0].repaired=true;collectibles[0].collected=true;viruses[0].alive=false;viruses[0].hp=0;
  const normalPort=phaseData.entities.interactives[0];levelRuntime.setFlag(normalPort.flag);
  checkpointIndex=2;checkpointX=phaseData.map.checkpoints[2].x;checkpointY=phaseData.map.checkpoints[2].y;respawnAtCheckpoint();
  questionHistory={hardware:['hw-01']};saveQuestionHistory();saveCampaign();
  devIds('settingsButton').click();const normalSaved=localStorage.getItem(SAVE_KEY),normalHistory=localStorage.getItem(QUESTION_HISTORY_KEY),normalX=player.x,normalY=player.y;
  test('developer: toggle ON starts a separate base-attribute test session',()=>{
    devToggle(true);assert(developerSession&&devIds('developerModeState').textContent==='LIGADO'&&!devIds('developerTools').hidden,'activation failed');
    assert(xp===0&&level===1&&!unlockedSkills.length&&player.damage===1,'test inherited normal attributes');
    assert(!running&&paused&&devIds('settingsDialog').open,'settings world advanced');devUnchanged(normalSaved,normalHistory);
  });
  test('developer: selector exposes all ten phases and keyboard input stays modal',()=>{
    devIds('developerSelectPhase').click();assert(devIds('developerPhaseDialog').open&&!devIds('settingsDialog').open,'selector absent');
    assert(devIds('developerPhaseList').children.length===10,'phase count');keys.clear();window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));assert(!keys.size,'modal leaked gameplay input');
  });
  test('developer: direct phase 10 has live boss, locked internal objectives and valid spawn',()=>{
    devIds('developerPhaseList').querySelector('[data-phase="9"]').click();assert(phaseIndex===9&&running&&!phaseIntroTime,'direct phase 10 blocked');
    assert(player.x===mapStart().x&&player.y===mapStart().y,'wrong spawn');assert(viruses.some(v=>v.multiStage&&v.alive)&&components.every(c=>!c.repaired)&&!phaseExitUnlocked,'internal systems bypassed');
    assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'spawn in solid');devUnchanged(normalSaved,normalHistory);
  });
  await levelVisuals.ready;
  test('developer: pause navigation returns from phase 10 to phase 1',()=>{
    pause();const actions=document.querySelector('.developer-pause-actions');assert(!actions.hidden,'pause tools missing');actions.querySelector('button').click();
    assert(devIds('developerPhaseList').querySelector('[data-phase="9"]').getAttribute('aria-current')==='true','current phase not highlighted');
    devIds('developerPhaseList').querySelector('[data-phase="0"]').click();assert(phaseIndex===0&&running&&viruses.every(v=>v.alive)&&!gameOver&&!phaseQuestionOpen,'10 to 1 failed');
  });
  for(let i=0;i<10;i++){
    pause();document.querySelector('.developer-pause-actions button').click();devIds('developerPhaseList').querySelector('[data-phase="'+i+'"]').click();await levelVisuals.ready;
    test('developer: live engine and visuals / phase '+(i+1),()=>{
      assert(phaseData===PHASES[i]&&levelVisuals.parallax&&!levelVisuals.errors.length,'wrong map/visuals');
      assert(!projectiles.length&&!enemyProjectiles.length&&!enemyObstacles.length&&devFreshPlatforms()&&checkpointIndex===-1,'previous world leaked');
      const x=player.x;keys.add('d');movePlayer(1/120);keys.clear();assert(player.x>x,'movement blocked');
      for(let t=0;t<120;t++)movePlayer(1/120);assert(player.grounded,'spawn has no support');
      assert(cameraX>=0&&cameraX<=Math.max(0,worldWidth()-width)&&cameraY>=0&&cameraY<=Math.max(0,worldHeight()-height),'camera bounds');
      const c=components[0];player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();assert(repairSession?.model,'missing minigame');solveRepairUI();updateRepair(.6);assert(c.repaired,'minigame failed');
      const cp=phaseData.map.checkpoints[0];checkpointIndex=0;checkpointX=cp.x;checkpointY=cp.y;respawnAtCheckpoint();for(let t=0;t<120;t++)movePlayer(1/120);assert(player.grounded,'checkpoint unstable');
      draw();devUnchanged(normalSaved,normalHistory);
    });
  }
  test('developer: boss shield and stage transitions still run in direct-access session',()=>{
    xpRequired=999999;const boss=viruses.find(v=>v.multiStage),hp=boss.hp;damageVirus(boss,1000);assert(boss.hp===hp,'boss shield bypassed');
    for(const c of components.filter(c=>!c.repaired)){player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();solveRepairUI();updateRepair(.6);assert(c.repaired,'relay repair failed');}
    damageVirus(boss,1000);assert(Math.abs(boss.hp-boss.maxHp*.67)<.001,'boss stage skipped');
    player.x=boss.x-180;player.y=bossGroundY(boss)-48;for(let t=0;t<40;t++)updateVirusZero(boss,1/60,player.x+17,player.y+24);assert(boss.attackWindup>0,'boss AI did not announce attack');
    devUnchanged(normalSaved,normalHistory);
  });
  test('developer: restart clears XP, abilities, enemies, checkpoints, flags and projectiles',()=>{
    xp=99;level=4;unlockedSkills=[{id:'boost',level:2}];restoreSkillEffects();projectiles.push({x:1,y:1});enemyProjectiles.push({x:1,y:1});levelRuntime.setFlag('test-only');platformRuntime.set('test-only',{});
    pause();document.querySelectorAll('.developer-pause-actions button')[1].click();assert(phaseIndex===9&&running&&xp===0&&level===1&&!unlockedSkills.length,'restart progression');
    assert(viruses.every(v=>v.alive&&v.hp===v.maxHp)&&components.every(c=>!c.repaired)&&collectibles.every(c=>!c.collected),'restart objects');
    assert(!levelRuntime.getFlag('test-only')&&devFreshPlatforms()&&!projectiles.length&&!enemyProjectiles.length&&checkpointIndex===-1&&!phaseExitUnlocked,'restart transient state');
    assert(player.x===mapStart().x&&player.y===mapStart().y,'restart spawn');devUnchanged(normalSaved,normalHistory);
  });
  test('developer: questions and test victory cannot alter normal campaign/history',()=>{
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);checkObjectives();assert(phaseExitUnlocked,'real objectives did not unlock exit');
    openPhaseQuestion();assert(phaseQuestionOpen,'question missing');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();
    assert(campaignComplete,'test victory failed');saveCampaign();window.dispatchEvent(new Event('pagehide'));devUnchanged(normalSaved,normalHistory);
  });
  test('developer: disabling restores normal live progress and hides every tool',()=>{
    devIds('settingsButton').click();devToggle(false);assert(!developerSession&&!devIds('developerModeToggle').checked&&devIds('developerTools').hidden&&document.querySelector('.developer-pause-actions').hidden&&document.querySelector('.developer-badge').hidden,'tools survived OFF');
    assert(phaseIndex===2&&level===3&&xp===47&&player.damage===1&&skillRank('cannon')===2&&player.x===normalX&&player.y===normalY,'normal player not restored');
    assert(components[0].repaired&&collectibles[0].collected&&!viruses[0].alive&&levelRuntime.getFlag(normalPort.flag)&&checkpointIndex===2,'normal world not restored');
    assert(!campaignComplete&&highestUnlockedPhase===2&&paused&&!running,'normal screen/progression leaked');devUnchanged(normalSaved,normalHistory);
    devIds('closeSettings').click();startButton.click();assert(running,'normal resume failed');
  });
  test('developer: pending normal question and ability dialogs survive test sessions',()=>{
    openLevelChoice(true);const ability=ui.levelOverlay.firstElementChild;assert(levelChoiceOpen,'ability fixture missing');
    devIds('settingsButton').click();devToggle(true);devIds('developerSelectPhase').click();devIds('developerPhaseList').querySelector('[data-phase="9"]').click();
    devIds('settingsButton').click();devToggle(false);assert(levelChoiceOpen&&ui.levelOverlay.firstElementChild===ability&&ui.levelOverlay.classList.contains('active'),'normal choice lost');
    devIds('closeSettings').click();levelChoiceOpen=false;ui.levelOverlay.classList.remove('active');launchLoadedPhase(false);
    phaseExitUnlocked=true;openPhaseQuestion();const question=currentQuestion,node=ui.questionOverlay.firstElementChild;assert(phaseQuestionOpen,'question fixture missing');
    devIds('settingsButton').click();const saved=localStorage.getItem(SAVE_KEY),history=localStorage.getItem(QUESTION_HISTORY_KEY);
    devToggle(true);devIds('developerSelectPhase').click();devIds('developerPhaseList').querySelector('[data-phase="0"]').click();
    devIds('settingsButton').click();devToggle(false);assert(phaseQuestionOpen&&currentQuestion===question&&ui.questionOverlay.firstElementChild===node,'normal question lost');devUnchanged(saved,history);
    devIds('closeSettings').click();phaseQuestionOpen=false;questionAnswered=false;questionRetryRequired=false;phaseExitUnlocked=false;ui.questionOverlay.classList.remove('active');launchLoadedPhase(false);
  });
  // Save a stable normal state, enter another test, then perform a real page reload.
  saveCampaign();devIds('settingsButton').click();const reloadSaved=localStorage.getItem(SAVE_KEY),reloadHistory=localStorage.getItem(QUESTION_HISTORY_KEY);
  devToggle(true);devIds('developerSelectPhase').click();devIds('developerPhaseList').querySelector('[data-phase="9"]').click();xp=999;saveCampaign();choosePhaseQuestion();
  sessionStorage.setItem('byteRunner.developerTestReload',JSON.stringify({saved:reloadSaved,history:reloadHistory,systems:report.systems}));
  location.reload();await new Promise(()=>{});
}
running=false;
