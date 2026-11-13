test('game over: lethal hits freeze combat and persist one defeat state',()=>{
  setup(0);player.health=12;damageCooldown=0;const earned=xp;
  damagePlayer(20,{x:player.x-40});assert(gameOver&&combatDefeat&&defeatSequence&&player.health===0&&!running,'melee death did not enter shutdown');
  damagePlayer(200,{x:player.x+40});assert(player.health===0&&xp===earned,'duplicate lethal hit changed defeat state or rewards');
  assert(getSavedCampaign().combatDefeat&&getSavedCampaign().gameOver,'defeat was not saved');update(2);assert(!defeatSequence&&!running&&!gameOverScreen.hidden,'shutdown did not show one terminal screen');
});
test('game over: projectile and hazard damage enter the same defeat flow',()=>{
  setup(0);damageCooldown=0;player.health=1;enemyProjectiles=[{x:player.x+17,y:player.y+20,vx:0,vy:0,life:1,radius:8,damage:8,ownerX:player.x-30}];
  updateHostileProjectiles(.01);assert(combatDefeat&&player.health===0,'projectile death bypassed Game Over');
  setup(0);const originalSolids=solids;try{
    player.x=200;player.y=100;player.vy=0;damageCooldown=0;player.health=1;
    solids=()=>[{x:200,y:148,w:80,h:12,collision:'solid',type:'dangerous',hazardDamage:5}];movePlayer(.016);
    assert(combatDefeat&&player.health===0,'environment death bypassed Game Over');
  }finally{solids=originalSolids;}
});
test('game over: final boss defeat is recoverable without resetting objectives',()=>{
  setup(9);components.forEach(c=>c.repaired=true);const boss=viruses.find(v=>v.multiStage);assert(boss?.alive,'final boss missing');
  damageCooldown=0;player.health=1;damagePlayer(30,boss);assert(combatDefeat&&boss.alive,'boss death sequence changed boss state');
  xp=77;components[0].repaired=true;boss.alive=false;const defeated=viruses.filter(v=>!v.alive).length;update(2);
  restartFromCheckpoint();assert(running&&player.health===player.maxHealth&&xp===77&&components[0].repaired&&viruses.filter(v=>!v.alive).length===defeated,'checkpoint restart lost campaign state');
  assert(damageCooldown>0&&damageCooldown<=PLAYER_HIT_INVULNERABILITY,'respawn protection is not brief');
});
test('game over: checkpoint and safe initial spawn restarts work',()=>{
  setup(0);const point=phaseData.map.checkpoints[0];checkpointIndex=0;checkpointX=point.x;checkpointY=Number.isFinite(point.y)?point.y:null;
  damageCooldown=0;player.health=1;damagePlayer(5,{x:player.x+20});update(2);const expected=checkpointX+38;restartFromCheckpoint();assert(Math.abs(player.x-expected)<200&&running,'checkpoint restart failed');
  setup(0);checkpointIndex=-1;const start=mapStart();damageCooldown=0;player.health=1;damagePlayer(5,{x:player.x+20});update(2);restartFromCheckpoint();assert(Math.abs(player.x-start.x)<200&&running,'initial safe spawn failed');
});
test('game over: checkpoint retry resets the active encounter without refunding supplies',()=>{
  setup(9);components.forEach(c=>c.repaired=true);const boss=viruses.find(v=>v.multiStage),dead=viruses.find(v=>v!==boss);assert(boss&&dead,'final encounter roster');
  boss.hp=17;boss.bossStage=3;boss.chargeTime=.2;boss.totalSummons=3;dead.alive=false;
  const live=viruses.find(v=>v!==boss&&v.alive);assert(live,'living encounter enemy');live.hp=1;
  spawnEnemyMinion(boss);const minion=viruses.find(v=>v.summonedBy===boss.id);assert(minion?.alive,'boss minion');
  skillRuntime.state.recoverySpent=2;skillRuntime.state.recoveryCooldown=9;gameOver=true;combatDefeat=true;player.health=0;
  restartFromCheckpoint();
  assert(boss.hp===boss.maxHp&&boss.bossStage===1&&!boss.chargeTime&&boss.totalSummons===0,'boss progress carried across defeat');
  assert(live.hp===live.maxHp&&!dead.alive&&!minion.alive,'active encounter state was not restored');
  assert(skillRuntime.state.recoverySpent===2&&skillRuntime.state.recoveryCooldown===9,'retry refunded recovery');
});
test('game over: reload and menu cannot bypass defeat, and controls return after restart',()=>{
  setup(0);components[0].repaired=true;xp=53;damageCooldown=0;player.health=1;damagePlayer(5,{x:player.x+20});update(2);
  const save=getSavedCampaign();restoreCampaign(save);assert(combatDefeat&&gameOver&&!running&&!gameOverScreen.hidden&&player.health===0,'reload bypassed defeat');
  document.getElementById('returnMenuButton').click();assert(menuScreen&&!running&&getSavedCampaign().combatDefeat,'menu discarded defeat save');
  continueCampaign();assert(combatDefeat&&!running,'continue bypassed defeat');restartFromCheckpoint();assert(running&&player.health>0,'restart did not restore controls');
  keys.clear();keys.add('d');const x=player.x;movePlayer(.02);assert(player.x>x,'movement unavailable after restart');keys.clear();
});
