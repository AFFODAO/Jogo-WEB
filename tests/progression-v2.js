report.xpAudit=[];
let cumulativeFull=0,cumulativeNormal=0,cumulativeRequired=0;
for(let i=0;i<10;i++)test('progression: stage '+(i+1)+' XP inventory',()=>{
  setup(i);
  const enemyXP=viruses.reduce((n,v)=>n+(v.xp||45),0);
  const repairXP=components.length*30,fragmentXP=collectibles.length*20;
  const objectiveXP=100+100*(phaseData.objectives.repairAllComponents!==false)+100*(phaseData.objectives.defeatAllViruses!==false);
  const caches=pacing.caches.length,cacheXP=caches*8+(i>=5?Math.floor(caches/3)*12:0);
  const total=enemyXP+repairXP+fragmentXP+objectiveXP+cacheXP;
  const mandatoryIds=new Set((phaseData.objectives.goals||[]).filter(g=>g.type==='defeat').flatMap(g=>g.ids));
  const mandatoryEnemyXP=phaseData.objectives.defeatAllViruses!==false?enemyXP:viruses.filter(v=>mandatoryIds.has(v.id)).reduce((n,v)=>n+(v.xp||45),0);
  const required=mandatoryEnemyXP+(phaseData.objectives.repairAllComponents!==false?repairXP:0)+objectiveXP;
  const normal=required+Math.floor(collectibles.length/2)*20;
  cumulativeFull+=total;cumulativeNormal+=normal;cumulativeRequired+=required;
  const row={stage:i+1,enemies:viruses.length,repairs:components.length,fragments:collectibles.length,caches,enemyXP,repairXP,fragmentXP,objectiveXP,cacheXP,total,normal,required,
    requiredLevel:ByteRunner.progression.simulate(cumulativeRequired).level,normalLevel:ByteRunner.progression.simulate(cumulativeNormal).level,fullLevel:ByteRunner.progression.simulate(cumulativeFull).level,legacyFullLevel:ByteRunner.progression.simulate(cumulativeFull,true).level};
  report.xpAudit.push(row);
  assert(row.fullLevel<=12&&row.normalLevel<=row.fullLevel,'early saturation');
  assert(player.damage===1&&player.jumpPower===JUMP_SPEED&&equippedCombat.length===0,'optional skill required for base kit');
  const goals=JSON.stringify(phaseData.objectives);assert(!/skillRank|equippedCombat|unlockedSkills/.test(goals),'skill gate in objectives');
  for(const [kind,entries] of [['enemy',viruses],['repair',components],['fragment',collectibles]])assert(entries.every(e=>typeof e.id==='string')&&new Set(entries.map(e=>e.id)).size===entries.length,'unstable '+kind+' reward IDs');
});

test('progression: real awards over all ten stages match full exploration projection',()=>{
  setup(0);let selections=0;
  for(let i=0;i<10;i++){
    loadPhase(i,true);running=true;
    let stageXP=0;
    const grant=(value,source)=>{const before=xp;assert(awardExperience(value,'cenário de progressão',source),'first source rejected');stageXP+=xp-before;};
    viruses.forEach(v=>grant(v.xp||45,'enemy:'+v.id));
    components.forEach(c=>grant(30,'repair:'+c.id));
    collectibles.forEach(c=>grant(20,'fragment:'+c.id));
    if(phaseData.objectives.repairAllComponents!==false)grant(100,'objective:repairs');
    if(phaseData.objectives.defeatAllViruses!==false)grant(100,'objective:enemies');
    grant(100,'objective:exit');
    pacing.caches.forEach((c,n)=>grant(8+(i>=5&&(n+1)%3===0?12:0),'cache:'+c.id));
    assert(stageXP===report.xpAudit[i].total,'XP inventory differs from awards');
    while(xp>=xpRequired){
      assert(++selections<=24,'upgrade loop');openLevelChoice();
      assert(ui.levelOverlay.querySelectorAll('[data-skill]').length===3,'missing three choices');
      ui.levelOverlay.querySelector('[data-skill]').click();
    }
    assert(level===report.xpAudit[i].fullLevel,'level projection stage '+(i+1));
    assert(equippedCombat.length<=ByteRunner.progression.combatIds.length&&unlockedSkills.every(s=>s.level<=3),'power growth');
    const before=xp;
    loadPhase(i,true);running=true;
    viruses.forEach(v=>awardExperience(v.xp||45,'repetição','enemy:'+v.id));
    components.forEach(c=>awardExperience(30,'repetição','repair:'+c.id));
    collectibles.forEach(c=>awardExperience(20,'repetição','fragment:'+c.id));
    if(phaseData.objectives.repairAllComponents!==false)awardExperience(100,'repetição','objective:repairs');
    if(phaseData.objectives.defeatAllViruses!==false)awardExperience(100,'repetição','objective:enemies');
    awardExperience(100,'repetição','objective:exit');
    pacing.caches.forEach(c=>awardExperience(20,'repetição','cache:'+c.id));
    assert(xp===before,'retry farming stage '+(i+1));
  }
  assert(level===12&&selections===11,'campaign progression target');
  report.progression={fullLevel:level,choices:selections,unlocked:unlockedSkills.length,equipped:[...equippedCombat]};
});

for(const scenario of ['required','normal'])test('progression: real '+scenario+' campaign awards match every stage projection',()=>{
  setup(0);let choices=0;const levels=[];
  for(let i=0;i<10;i++){
    loadPhase(i,true);running=true;
    const before=xp;
    const grant=(amount,source)=>assert(awardExperience(amount,'cenário de progressão',source),'source rejected');
    const mandatoryIds=new Set((phaseData.objectives.goals||[]).filter(g=>g.type==='defeat').flatMap(g=>g.ids));
    viruses.filter(v=>phaseData.objectives.defeatAllViruses!==false||mandatoryIds.has(v.id)).forEach(v=>grant(v.xp||45,'enemy:'+v.id));
    if(phaseData.objectives.repairAllComponents!==false){
      components.forEach(c=>grant(30,'repair:'+c.id));grant(100,'objective:repairs');
    }
    if(phaseData.objectives.defeatAllViruses!==false)grant(100,'objective:enemies');
    grant(100,'objective:exit');
    if(scenario==='normal')collectibles.slice(0,Math.floor(collectibles.length/2)).forEach(c=>grant(20,'fragment:'+c.id));
    assert(xp-before===report.xpAudit[i][scenario],'scenario XP mismatch');
    while(xp>=xpRequired){
      assert(++choices<=24,'unbounded upgrades');openLevelChoice();
      ui.levelOverlay.querySelector('[data-skill]').click();
    }
    assert(level===report.xpAudit[i][scenario+'Level'],'scenario level mismatch');
    levels.push(level);
    const saved=createCampaignSnapshot(),bank=xp;
    restoreCampaign(saved);running=true;
    assert(xp===bank&&level===levels[i],'save changed progression');
    assert(!awardExperience(100,'repetição','objective:exit'),'reload paid twice');
    assert(player.damage===1&&equippedCombat.length<=ByteRunner.progression.combatIds.length,'unbounded combat stats');
  }
  assert(level===(scenario==='normal'?11:10),'campaign target');
  report[scenario+'Scenario']={levels,choices};
});

test('progression: sources persist through save, retry, checkpoint and minion farming',()=>{
  setup(2);const v=viruses.find(v=>v.type==='basic')||viruses.find(v=>v.type==='fast');
  damageVirus(v,100);const earned=xp;assert(earned===v.xp,'enemy XP');
  saveCampaign();const saved=createCampaignSnapshot();restoreCampaign(saved);
  loadPhase(2,true);running=true;const again=viruses.find(e=>e.id===v.id);damageVirus(again,100);assert(xp===earned,'save/retry farming');
  respawnAtCheckpoint();assert(!awardExperience(v.xp,'repetição','enemy:'+v.id)&&xp===earned,'checkpoint farming');
  const p=viruses.find(v=>v.type==='parasite');assert(p,'missing parasite');spawnEnemyMinion(p);
  const minion=viruses.find(v=>v.countsForObjective===false);assert(minion,'missing minion');damageVirus(minion,100);assert(xp===earned,'summon farming');
  const bank=xp;for(const value of [0,-1,NaN,Infinity,1.5])assert(!awardExperience(value,'inválido','bad'),'invalid XP');assert(xp===bank,'invalid XP changed bank');
  for(const source of [undefined,null,'','   ',42])assert(!awardExperience(20,'sem origem',source),'untracked XP accepted');
  assert(xp===bank,'untracked XP changed bank');
});

test('progression: legacy progress is preserved and migration is idempotent',()=>{
  setup(4);const saved=createCampaignSnapshot();delete saved.progressionSchema;delete saved.equippedCombat;delete saved.claimedXP;
  saved.level=25;saved.xp=321;saved.unlockedSkills=ABILITIES.map(a=>({id:a.id,level:3}));
  saved.viruses[0].alive=false;saved.repaired[0]=true;saved.collected[0]=true;saved.levelState.flags['rhythm:legacy:0']=true;
  restoreCampaign(saved);
  assert(level===25&&xp===321&&unlockedSkills.length===8&&unlockedSkills.every(s=>s.level===3),'deleted legacy progress');
  assert(equippedCombat.length===3&&skillRank('repair')===3,'legacy loadout changed on migration');
  const keys=[...claimedXP],ids=[...equippedCombat];const migrated=createCampaignSnapshot();
  restoreCampaign(migrated);assert(JSON.stringify([...claimedXP])===JSON.stringify(keys)&&JSON.stringify(equippedCombat)===JSON.stringify(ids),'migration repeated');
  assert(!awardExperience(20,'já coletado','fragment:'+collectibles[0].id),'legacy collectible farming');
  assert(!awardExperience(8,'já coletado','cache:rhythm:legacy:0'),'legacy cache farming');
  loadPhase(0,true);assert(!awardExperience(45,'fase anterior','enemy:'+viruses[0].id),'legacy earlier-stage farming');
  setup(0);const empty=createCampaignSnapshot();empty.unlockedSkills=[{id:'armor',level:3}];empty.equippedCombat=[];restoreCampaign(empty);assert(!skillRank('armor')&&unlockedRank('armor')===3,'empty loadout was auto-equipped');
});

test('progression: all combat skills can be equipped or reserved through the safe loadout UI',()=>{
  setup(0);viruses=[];unlockedSkills=ABILITIES.map(a=>({id:a.id,level:3,name:a.name,description:a.description(3)}));equippedCombat=['armor','rapid','shield'];restoreSkillEffects();
  assert(skillRank('repair')===3&&skillRank('cannon')===0&&specialCooldown()===6&&skillRank('recovery')===0,'reserve grants combat power');
  assert(!changeLoadout('cannon'),'swapped during combat');pause();
  const health=player.health=40;skillRuntime.state.shieldCooldown=13;skillRuntime.state.recoverySpent=3;
  assert(changeLoadout('cannon')&&equippedCombat.length===4,'loadout still has a three-skill cap');
  document.getElementById('loadoutButton').click();const dialog=document.getElementById('loadoutDialog');assert(dialog.open,'UI did not open');
  const box=dialog.getBoundingClientRect();assert(box.left>=0&&box.right<=innerWidth+1&&box.height<=innerHeight,'dialog viewport');
  assert(dialog.scrollHeight>0&&getComputedStyle(dialog).overflowY==='auto','dialog cannot scroll');
  for(const button of dialog.querySelectorAll('button'))assert(button.getBoundingClientRect().height>=42,'touch target too small');
  assert(!dialog.querySelector('[data-equip="boost"]').disabled,'unlocked reserve skill could not be equipped');
  dialog.querySelector('[data-equip="boost"]').click();dialog.querySelector('[data-equip="rapid"]').click();
  assert(equippedCombat.length===4&&player.fireRate===.32&&specialCooldown()===4.8,'desequip did not recalculate passives');
  dialog.querySelector('[data-equip="rapid"]').click();assert(player.fireRate<.32&&equippedCombat.length===5,'equip did not recalculate passives');
  dialog.querySelector('[data-equip="rapid"]').click();assert(!skillRank('rapid')&&player.fireRate===.32,'second desequip failed');
  assert(player.health===health&&skillRuntime.state.shieldCooldown===13&&skillRuntime.state.recoverySpent===3,'swap refunded costs');
  document.getElementById('closeLoadout').click();assert(!dialog.open&&paused,'close resumed unsafely');
  player.x+=400;assert(changeLoadout('armor'),'could not swap while paused and safe outside checkpoint');
  const start=mapStart();player.x=start.x;player.y=start.y;viruses=[{alive:true,x:player.x+30,y:player.y}];assert(!changeLoadout('armor'),'swapped near enemy');viruses=[];
  saveCampaign();restoreCampaign(createCampaignSnapshot());assert(equippedCombat.includes('cannon')&&!equippedCombat.includes('rapid')&&unlockedRank('rapid')===3,'reserve/loadout save');
  const api=ByteRunner.progression;assert(api.loadout(unlockedSkills,['armor','armor','rapid','bad','shield','cannon']).join(',')==='armor,rapid,shield,cannon','invalid loadout normalization');
});

test('progression: VIRUS ZERO must enter all three stages before defeat',()=>{
  setup(9);components.forEach(c=>c.repaired=true);const boss=viruses.find(v=>v.multiStage);viruses=[boss];player.x=boss.bossBounds.left+150;player.y=boss.groundY-player.height;
  const gate2=boss.maxHp*.67,gate3=boss.maxHp*.34;
  damageVirus(boss,10000);assert(boss.alive&&Math.abs(boss.hp-gate2)<1e-6,'phase 1 crossed its gate');
  damageVirus(boss,10000);assert(boss.alive&&boss.bossStage===1&&Math.abs(boss.hp-gate2)<1e-6,'phase 2 was skipped by stacked damage');
  updateVirusZero(boss,.9,boss.x-180,boss.y);assert(boss.bossStage===2&&boss.bossPhaseTransitionTime===0,'phase 2 transition');
  damageVirus(boss,10000);assert(boss.alive&&Math.abs(boss.hp-gate3)<1e-6,'phase 2 crossed its gate');
  damageVirus(boss,10000);assert(boss.alive&&boss.bossStage===2&&Math.abs(boss.hp-gate3)<1e-6,'phase 3 was skipped by stacked damage');
  updateVirusZero(boss,.9,boss.x-180,boss.y);assert(boss.bossStage===3&&boss.bossPhaseTransitionTime===0,'phase 3 transition');
  damageVirus(boss,10000);assert(!boss.alive,'final stage cannot be defeated');
});

test('progression: diminishing returns, no free level-up and capped fallback stays finite',()=>{
  setup(0);let last=0,previousGain=Infinity;
  for(let r=1;r<=3;r++){const value=ByteRunner.abilities.potency(r),gain=value-last;assert(gain<previousGain,'non-diminishing return');previousGain=gain;last=value;}
  openLevelChoice();assert(level===1&&!levelChoiceOpen&&xp===0,'free upgrade');
  unlockedSkills=ABILITIES.map(a=>({id:a.id,level:3}));equippedCombat=['armor','rapid','shield'];restoreSkillEffects();xp=xpRequired;
  openLevelChoice();ui.levelOverlay.querySelector('[data-skill]').click();const earned=xp;
  openLevelChoice();assert(!levelChoiceOpen&&xp===earned&&level===2,'fallback creates upgrade loop');
});

for(let i=0;i<10;i++)test('progression: stage '+(i+1)+' completion gates work without optional skills',()=>{
  setup(i);
  components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
  for(const v of viruses){
    let hits=0;
    while(v.alive&&hits++<200){v.vulnerableTime=1;v.bossPhaseTransitionTime=0;damageVirus(v,player.damage,v.x-100);if(v.multiStage&&v.alive)updateVirusZero(v,.9,v.x-180,v.y);}
    assert(!v.alive,'base shot cannot defeat '+v.id);
  }
  checkObjectives();
  assert(levelRuntime.goalsComplete()&&phaseExitUnlocked,'skill required by completion gate');
  assert(!unlockedSkills.length&&equippedCombat.length===0&&player.damage===1&&player.jumpPower===JUMP_SPEED,'optional skill used');
});
