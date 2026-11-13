const bossRuns=[];
const bossBuilds=[
  {name:'sem aprimoramentos',skills:[]},
  {name:'build intermediária',skills:[['cannon',1],['rapid',1],['armor',1]]},
  {name:'ofensiva máxima',skills:[['precision',3],['cannon',3],['rapid',3]]},
  {name:'defensiva máxima',skills:[['armor',3],['shield',3],['recovery',3]]},
  {name:'foco em mobilidade',skills:[['boost',3],['rapid',1],['armor',1]]},
  {name:'foco em reparo',skills:[['repair',3]]}
];
const bossNativeDamage=damagePlayer;
const bossNativeHurt=damageVirus;
for(const build of bossBuilds){
  setup(9);components.forEach(c=>{c.repaired=true;c.corruption=0;c.integrity=100;});
  unlockedSkills=build.skills.map(([id,level])=>({id,level}));equippedCombat=build.skills.map(([id])=>id);restoreSkillEffects();
  player.health=100;player.x=5300;player.y=852;player.vx=player.vy=0;player.grounded=true;player.facing=1;
  viruses=createViruses().filter(v=>v.multiStage);const boss=viruses[0];
  projectiles=[];enemyProjectiles=[];enemyObstacles=[];damageCooldown=0;running=true;gameOver=false;combatDefeat=false;
  keys.clear();keys.add('j');let elapsed=0,incoming=0,damageEvents=0,bossDamage=0,weakPointDamage=0,lastDamageCause='nenhum',phaseTimes=[],lastStage=boss.bossStage,minDistance=Infinity,maxDistance=0;
  const incomingEvents=[],phaseDamage=[0,0,0],attackStarts=[];let priorWindup=0,shieldUses=0,dashUses=0,healingUses=0;
  damagePlayer=(amount,source)=>{const health=player.health;bossNativeDamage(amount,source);if(player.health<health){const dealt=health-player.health;incoming+=dealt;damageEvents++;lastDamageCause=source?.attackKind||boss.bossAttackKind||'ameaça ambiental';incomingEvents.push({at:Number(elapsed.toFixed(2)),attack:lastDamageCause,damage:dealt});}};
  damageVirus=(enemy,amount,sourceX)=>{const hp=enemy.hp,exposed=enemy===boss&&enemy.vulnerableTime>0;bossNativeHurt(enemy,amount,sourceX);if(enemy===boss){const dealt=hp-enemy.hp;bossDamage+=dealt;phaseDamage[Math.max(0,(enemy.bossStage||1)-1)]+=dealt;if(exposed)weakPointDamage+=dealt;}};
  let warningKind='',warningHandled=false,volleyMove=0,volleyMoveTime=0;
  for(let frame=0;frame<180*60&&boss.alive&&player.health>0;frame++){
    const dt=1/60;elapsed+=dt;const gap=Math.abs(player.x+17-boss.x);minDistance=Math.min(minDistance,gap);maxDistance=Math.max(maxDistance,gap);
    player.facing=boss.x>player.x+player.width/2?1:-1;
    if(boss.bossStage!==lastStage){phaseTimes.push({stage:lastStage,at:elapsed});lastStage=boss.bossStage;}
    if(boss.attackWindup>0&&priorWindup<=0)attackStarts.push({at:Number(elapsed.toFixed(2)),stage:boss.bossStage,kind:boss.bossAttackKind,telegraphSeconds:Number(boss.attackWindup.toFixed(2))});
    priorWindup=boss.attackWindup;
    if(boss.attackWindup<=0){warningKind='';warningHandled=false;}
    else if(boss.bossAttackKind!==warningKind){warningKind=boss.bossAttackKind;warningHandled=false;}
    if(boss.attackWindup>0&&!warningHandled){
      warningHandled=true;
      if(['slam','combo','charge'].includes(boss.bossAttackKind)&&player.grounded&&boss.attackWindup<(boss.bossAttackKind==='charge'?.45:.7))jumpQueued=true;
      if(['volley','combo'].includes(boss.bossAttackKind)){volleyMove=player.x<5700?1:-1;volleyMoveTime=1.65;}
    }
    if(volleyMoveTime>0){keys.add(volleyMove>0?'d':'a');volleyMoveTime=Math.max(0,volleyMoveTime-dt);}
    else {keys.delete('a');keys.delete('d');}
    if(skillRank('shield')&&skillRuntime.state.shieldCooldown<=0&&enemyProjectiles.some(p=>{
      const nearestX=Math.max(player.x,Math.min(p.x,player.x+player.width)),nearestY=Math.max(player.y,Math.min(p.y,player.y+player.height));
      return Math.hypot(p.x-nearestX,p.y-nearestY)<115&&p.vx*(player.x+17-p.x)+p.vy*(player.y+24-p.y)>0;
    })||skillRank('shield')&&skillRuntime.state.shieldCooldown<=0&&boss.attackWindup>0&&boss.bossAttackKind==='charge'&&boss.attackWindup<.12)skillRequests.add('q');
    const shieldCooldownBefore=skillRuntime.state.shieldCooldown,dashCooldownBefore=skillRuntime.state.dashCooldown;
    if(skillRank('boost')&&skillRuntime.state.dashCooldown<=0&&player.grounded&&boss.attackWindup>0&&['charge','combo','volley'].includes(boss.bossAttackKind)&&boss.attackWindup<.38){
      player.facing=boss.x>player.x+17?-1:1;skillRequests.add('l');
    }
    if(skillRank('recovery')&&player.health<player.maxHealth&&skillRuntime.state.recoveryCooldown<=0&&skillRuntime.state.recoverySpent<1+skillRank('recovery'))skillRequests.add('h');
    const recoverySpentBefore=skillRuntime.state.recoverySpent;
    if(!combatAttack.charging&&combatAttack.remaining<=0)attackInput('k','keyboard',true);
    update(dt);
    if(shieldCooldownBefore<=0&&skillRuntime.state.shieldCooldown>0)shieldUses++;
    if(dashCooldownBefore<=0&&skillRuntime.state.dashCooldown>0)dashUses++;
    if(skillRuntime.state.recoverySpent>recoverySpentBefore)healingUses++;
    attackInput('k','keyboard',false);
  }
  damagePlayer=bossNativeDamage;damageVirus=bossNativeHurt;
  const result={build:build.name,equippedSkills:build.skills.map(([id,level])=>({id,level})),durationSeconds:Number(elapsed.toFixed(2)),incomingDamage:incoming,damageEvents,endingHealth:player.health,
    defeated:!boss.alive,failure:!boss.alive?'nenhuma':player.health<=0?'integridade esgotada por '+lastDamageCause:'limite de 180 s',phaseTransitions:phaseTimes,
    initialHp:boss.maxHp,remainingBossHp:boss.hp,bossDamage:Number(bossDamage.toFixed(1)),weakPointDamage:Number(weakPointDamage.toFixed(1)),stageDamage:phaseDamage.map(n=>Number(n.toFixed(1))),attackStarts,incomingEvents,defensiveActions:{shieldUses,dashUses},
    playerX:Math.round(player.x),bossX:Math.round(boss.x),distanceRange:[Math.round(minDistance),Math.round(maxDistance)],healingUses};
  bossRuns.push(result);
}
report.bossBalance=bossRuns;
test('VIRUS ZERO: six legal builds complete measurable combat simulations',()=>{
  assert(bossRuns.length===6&&bossRuns.every(r=>r.defeated&&r.durationSeconds>=15&&r.durationSeconds<=35),'a required build failed or produced an implausible fight duration');
  assert(bossRuns.every(r=>r.phaseTransitions.length===2&&r.weakPointDamage>0),'a phase or weak-point opportunity was skipped');
  assert(bossRuns[2].durationSeconds<bossRuns[0].durationSeconds*.9&&bossRuns[2].durationSeconds>=bossRuns[0].durationSeconds*.6,'offensive build had no bounded advantage');
  assert(bossRuns.every(r=>[1,2,3].every(stage=>r.attackStarts.some(a=>a.stage===stage))&&r.attackStarts.every(a=>a.telegraphSeconds>=.8)),'a phase lacked a readable attack warning');
  assert(bossRuns.every(r=>r.attackStarts.every((a,i)=>!r.attackStarts.slice(0,i).some(p=>p.stage===a.stage)||a.at-r.attackStarts.slice(0,i).filter(p=>p.stage===a.stage).at(-1).at>=3.2)),'major attacks did not leave a recovery window');
  assert(bossRuns[3].defensiveActions.shieldUses>0&&bossRuns[3].healingUses>0,'defensive build did not exercise bounded shield and recovery');
  assert(bossRuns[4].defensiveActions.dashUses>0,'mobility build did not exercise the dash');
  assert(bossRuns[5].durationSeconds>=bossRuns[0].durationSeconds*.95,'repair-only skill changed boss damage output');
});
test('VIRUS ZERO: phase transition removes active boss projectiles and hazards',()=>{
  setup(9);viruses=createViruses().filter(v=>v.multiStage);const boss=viruses[0];
  player.x=boss.x-180;player.y=bossGroundY(boss)-player.height;player.grounded=true;
  boss.hp=boss.maxHp*.66;enemyProjectiles=[{bossOwned:true,life:2},{bossOwned:false,life:2}];enemyObstacles=[{bossOwned:true,life:2},{bossOwned:false,life:2}];
  updateVirusZero(boss,1/60,player.x+17,player.y+24);
  assert(boss.bossStage===2&&boss.bossPhaseTransitionTime>0,'phase transition not signaled');
  assert(enemyProjectiles.length===1&&!enemyProjectiles[0].bossOwned&&enemyObstacles.length===1&&!enemyObstacles[0].bossOwned,'old boss attack crossed the phase transition');
});
test('VIRUS ZERO: reinforcement identity remains with a finite lifetime cap',()=>{
  setup(9);viruses=createViruses().filter(v=>v.multiStage);const boss=viruses[0];boss.summonLimit=3;
  for(let i=0;i<4;i++){assert(spawnEnemyMinion(boss),'expected reinforcement '+(i+1));viruses.filter(v=>v.summonedBy===boss.id).forEach(v=>v.alive=false);}
  assert(boss.totalSummons===4&&!spawnEnemyMinion(boss),'boss reinforcement cap was not finite');
});
