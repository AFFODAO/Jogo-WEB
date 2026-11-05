// Exposed only in the temporary copy used by run_browser_audit.py.
const nativeAuditRAF=window.requestAnimationFrame;
window.requestAnimationFrame=()=>0;
window.__auditUI={
  reset(index=0){
    running=false;window.requestAnimationFrame=()=>0;
    if(document.getElementById('settingsDialog').open)document.getElementById('settingsDialog').close();
    soundEnabled=false;resetCampaign();loadPhase(index,true);paused=false;campaignStarted=true;running=true;xpRequired=999999;
    overlay.classList.add('hidden');document.querySelector('.game-shell').classList.add('playing');animationTime=1;actorAnimationTime=1;updateHud();draw();
  },
  show(mode,phase=0){
    this.reset(phase);
    if(mode==='menu'){running=false;document.querySelector('.game-shell').classList.remove('playing');setupMenu();overlay.classList.remove('hidden');}
    if(mode==='pause')pause();
    if(mode==='intro')beginPhaseIntro();
    if(mode==='repair'){
      const c=components[phase===0?components.length-1:0];player.x=c.x;player.y=c.y;
      window.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true}));window.dispatchEvent(new KeyboardEvent('keyup',{key:'e',bubbles:true}));
    }
    if(mode==='question'){
      components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);
      const mark=c=>{if(c.flag)levelRuntime.setFlag(c.flag,c.value??true);(c.all||c.any||[]).forEach(mark);};
      (phaseData.objectives.goals||[]).filter(g=>g.type==='condition').forEach(g=>mark(g.condition));
      checkObjectives();openPhaseQuestion();
    }
    if(mode==='skills'){xp=xpRequired;openLevelChoice();}
    if(mode==='settings')document.getElementById('settingsButton').click();
    draw();return {phase:phaseIndex+1,mode,repair:Boolean(repairSession),question:phaseQuestionOpen};
  },
  play(){this.reset(0);window.requestAnimationFrame=nativeAuditRAF;launchLoadedPhase(false);},
  position(){return {x:player.x,y:player.y,running,keys:[...keys],repair:Boolean(repairSession)};},
  freeze(){running=false;keys.clear();window.requestAnimationFrame=()=>0;},
  persisted(){return {phase:phaseIndex,x:player.x,y:player.y,xp,components:components.map(c=>c.repaired),enemies:viruses.map(v=>v.alive),skills:unlockedSkills.map(s=>[s.id,s.level]),flag:levelRuntime.getFlag('audit:page-reload')};},
  seedSave(){this.reset(2);components[0].repaired=true;viruses[0].alive=false;viruses[0].hp=0;xp=37;unlockedSkills=[{id:'armor',level:2}];restoreSkillEffects();levelRuntime.setFlag('audit:page-reload',true);saveCampaign();return this.persisted();},
  loadAll:async function(){const results=[];for(let i=0;i<10;i++){this.reset(i);await levelVisuals.ready;draw();results.push({phase:i+1,assetErrors:[...levelVisuals.errors]});}return results;}
};
