// Injected into an isolated copy by run_review.py; never shipped in game.js.
window.requestAnimationFrame = () => 0;
soundEnabled = false;
const report = { phases: [], systems: {}, errors: [], snapshots: [] };
function assert(value, message) { if (!value) throw new Error(message); }
function test(name, fn) { try { fn(); report.systems[name] = 'PASS'; } catch(e) { report.systems[name] = e.message; } }
function setup(i) { resetCampaign(); loadPhase(i,true); running=true; campaignStarted=true; damageCooldown=99999; keys.clear(); }
function surfaces() {
  const all=solids(); const result=[];
  for(const s of all) {
    if(s.y<ROBOT_HEIGHT || s.type==='interference') continue;
    let spans=[[s.x,s.x+s.w-player.width]];
    for(const b of all) {
      if(b===s || b.collision==='one-way' || b.y>=s.y-1 || b.y+b.h<=s.y-player.height+1) continue;
      spans=spans.flatMap(([a,z])=> b.x>=z+player.width || b.x+b.w<=a ? [[a,z]] : [[a,Math.min(z,b.x-player.width)],[Math.max(a,b.x+b.w),z]]).filter(([a,z])=>z>=a);
    }
    spans.forEach(([a,z])=>result.push({a:Math.max(0,a),z:Math.min(worldWidth()-player.width,z),y:s.y-player.height,id:s.id||'floor'}));
  }
  return result;
}
function reachability() {
  const nodes=surfaces(), reached=new Set();
  const start=nodes.findIndex(n=>player.x>=n.a-1 && player.x<=n.z+1 && Math.abs(player.y-n.y)<3);
  assert(start>=0,'spawn without support'); reached.add(start);
  const queue=[start];
  for(let q=0;q<queue.length;q++) {
    const src=nodes[queue[q]];
    for(let j=0;j<nodes.length;j++) {
      if(reached.has(j)) continue;
      const dst=nodes[j];
      if(src.y-dst.y>126 || Math.max(dst.a-src.z,src.a-dst.z)>230) continue;
      let found=false;
      const targets=[dst.a,dst.z,(dst.a+dst.z)/2];
      for(const target of targets) {
        const launches=[Math.max(src.a,Math.min(src.z,target)),src.a,src.z,(src.a+src.z)/2];
        for(const launch of launches) {
          for(const mode of ['jump','walk-left','walk-right']) {
          if(mode!=='jump' && dst.y<=src.y) continue;
          player.x=launch; player.y=src.y; player.vy=0; player.grounded=true; jumpQueued=true;
          jumpQueued=mode==='jump';
          let leftSurface=false;
          for(let t=0;t<110;t++) {
            keys.clear();
            const aim=mode==='jump'||leftSurface?target:mode==='walk-left'?src.a-36:src.z+36;
            if(Math.abs(aim-player.x)>2) keys.add(aim>player.x?'d':'a');
            movePlayer(1/60);
            if(!player.grounded) leftSurface=true;
            if(player.y>floorY()+70) break;
            if(player.grounded && leftSurface && t>1) {
              if(player.x>=dst.a-2 && player.x<=dst.z+2 && Math.abs(player.y-dst.y)<3) found=true;
              break;
            }
          }
          if(found) break;
          }
          if(found) break;
        }
        if(found) break;
      }
      if(found) { reached.add(j); queue.push(j); }
    }
  }
  keys.clear(); return [...reached].map(i=>nodes[i]);
}
for(let i=0;i<10;i++) {
  const r={phase:i+1}; report.phases.push(r);
  try {
    setup(i);
    for(const position of [0,.5,1]) {
      cameraX=Math.max(0,worldWidth()-width)*position;cameraY=Math.max(0,worldHeight()-height)*(1-position);draw();
      report.snapshots.push({phase:i+1,position,image:canvas.toDataURL()});
    }
    r.render='PASS';
    viruses.forEach(v=>v.alive=false);xpRequired=999999;
    player.x=worldWidth()-player.width-8;player.y=phaseData.map.layout==='vertical'?400:floorY()-player.height;
    for(let t=0;t<90;t++) update(1/60);
    assert(cameraX>=0&&cameraX<=Math.max(0,worldWidth()-width)&&cameraY>=0&&cameraY<=Math.max(0,worldHeight()-height),'camera outside map');
    assert(player.x-cameraX>=-1&&player.x-cameraX+player.width<=width+1,'camera lost player');r.camera='PASS';
    setup(i);
    const start=mapStart(); let reachable=[];
    for(let round=0;round<=components.length;round++) {
      player.x=start.x;player.y=start.y;player.vy=0;player.grounded=true;
      reachable=reachability(); let changed=false;
      for(const c of components.filter(c=>!c.repaired)) {
        const n=reachable.find(n=>Math.abs(c.y+c.height/2-(n.y+player.height/2))<=78 && n.z+player.width/2>=c.x+c.width/2-76 && n.a+player.width/2<=c.x+c.width/2+76);
        if(!n) continue;
        player.x=Math.max(n.a,Math.min(n.z,c.x));player.y=n.y;keys.add('e');
        for(let t=0;t<60;t++) updateRepair(1/60);
        keys.clear();assert(c.repaired,'repair interaction failed'); changed=true;
      }
      if(!changed) break;
    }
    r.reachableSurfaces=reachable.length;
    r.repairAccess=components.every(c=>c.repaired)?'PASS':'UNREACHABLE: '+components.filter(c=>!c.repaired).map(c=>c.id);
    if(r.repairAccess!=='PASS') r.debug={nodes:reachable,components:components.map(c=>({id:c.id,x:c.x,y:c.y,repaired:c.repaired}))};
    r.platformAccess=phaseData.entities.platforms.filter(s=>!reachable.some(n=>n.id===s.id)).map(s=>s.id);
    phaseExitUnlocked=true;
    player.x=start.x;player.y=start.y;player.grounded=true;
    const exitNodes=reachability();
    r.exitAccess=exitNodes.some(n=>phaseData.map.layout==='vertical'? Math.hypot(Math.max(n.a,Math.min(n.z,phaseData.map.exit.x))+17-phaseData.map.exit.x,n.y+24-phaseData.map.exit.y)<74:n.z+34>=phaseData.map.exit.x+20)?'PASS':'FAIL';
    r.enemyAccess=viruses.every(v=>reachable.some(n=> Math.abs(n.y+22-v.y)<v.radius+5+126 && n.z+800>=v.x && n.a-800<=v.x))?'PASS':'FAIL';
    r.combat=[];
    for(const enemy of viruses.filter(v=>v.countsForObjective!==false)) {
      const options=reachable.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3})))
        .filter(p=>p.n.y+22-enemy.y>=-enemy.radius-5 && p.n.y+22-enemy.y<125+enemy.radius).sort((a,b)=>a.score-b.score);
      for(const p of options.slice(0,8)) {
        player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;damageCooldown=99999;keys.clear();keys.add('j');projectiles=[];
        for(let t=0;t<600&&enemy.alive;t++) {
          player.facing=enemy.x>=player.x+17?1:-1;
          if(player.y+22>enemy.y+enemy.radius+5&&player.grounded) jumpQueued=true;
          movePlayer(1/60);updateCombat(1/60);
        }
        if(!enemy.alive) break;
      }
      keys.clear();r.combat.push({id:enemy.id,type:enemy.type,result:enemy.alive?'FAIL':'PASS'});
    }
    for(const point of phaseData.map.checkpoints) {
      player.x=typeof point==='number'?point:point.x; player.y=(typeof point==='number'?floorY():point.y)-player.height;updateCheckpoints();respawnAtCheckpoint();
      assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'checkpoint inside solid');
      assert(!(phaseData.map.pits||[]).some(p=>player.x+player.width>p.x&&player.x<p.x+p.width),'checkpoint over pit');
    } r.checkpoints='PASS';
    const checkpointProgress=components.map(c=>c.repaired).join();
    if(phaseData.map.pits?.length) {const pit=phaseData.map.pits[0];player.x=pit.x+pit.width/2-17;player.y=floorY()+120;player.vy=400;movePlayer(1/60);assert(player.health===100&&player.y<floorY(),'pit respawn');}
    damageCooldown=0;player.health=1;damagePlayer(20,{x:0});assert(player.health===100&&damageCooldown>0&&components.map(c=>c.repaired).join()===checkpointProgress,'death checkpoint progress');r.respawn='PASS';
    player.x=-10;player.y=-10; movePlayer(1/60);assert(player.x>=0&&player.y>=0,'left/top bounds');
    player.x=worldWidth()+10; movePlayer(1/60);assert(player.x+player.width<=worldWidth(),'right bounds');r.bounds='PASS';
    setup(i); const c=components[0];c.repaired=true;viruses[0].alive=false;viruses[0].hp=0;xp=37;checkpointX=typeof phaseData.map.checkpoints[0]==='number'?phaseData.map.checkpoints[0]:phaseData.map.checkpoints[0].x;
    saveCampaign();continueCampaign();assert(components[0].repaired&&!viruses[0].alive&&xp===37,'save restoration');r.save='PASS';
    setup(i);assert(!phaseExitUnlocked,'exit initially unlocked');openPhaseQuestion();assert(!phaseQuestionOpen,'premature question');
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>{v.alive=false;v.hp=0;});checkObjectives();assert(phaseExitUnlocked,'objectives');openPhaseQuestion();
    ui.questionOverlay.querySelector('[data-correct="false"]').click();assert(getSavedCampaign().questionRetryRequired,'wrong answer not saved');continueCampaign();assert(components.every(c=>!c.repaired)&&viruses.every(v=>v.alive),'reload bypassed retry');
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);checkObjectives();openPhaseQuestion();ui.questionOverlay.querySelector('[data-correct="false"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(running&&!phaseQuestionOpen&&!phaseExitUnlocked,'retry stuck');
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);checkObjectives();openPhaseQuestion();ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(i===9?campaignComplete:phaseTransition,'correct answer progression');r.questions='PASS';
    if(i<9) {continueCampaign();assert(phaseIndex===i+1&&running&&!phaseExitUnlocked,'next phase restoration');} else assert(getSavedCampaign().campaignComplete,'victory not saved');r.transitionSave='PASS';
  } catch(e) {r.error=e.stack;}
}
test('skills and pending choice',()=>{
  setup(0);xp=100;openLevelChoice();assert(level===2&&levelChoiceOpen,'level');saveCampaign();continueCampaign();assert(level===2&&levelChoiceOpen,'pending choice lost');
  let b=ui.levelOverlay.querySelector('[data-skill]');b.click();assert(unlockedSkills.length===1&&running,'ability selection');
  for(const ability of ABILITIES) {unlockedSkills=[{id:ability.id,level:2}];restoreSkillEffects();}
  unlockedSkills=[{id:'armor',level:3},{id:'cannon',level:2},{id:'rapid',level:2},{id:'boost',level:2},{id:'repair',level:2}];restoreSkillEffects();assert(player.armor===.3||Math.abs(player.armor-.3)<1e-9,'armor');assert(player.damage===3&&player.fireRate<.32&&player.jumpPower>690&&repairDuration<.8,'effects');
  unlockedSkills=[{id:'cannon',level:1}];xp=xpRequired;openLevelChoice();selectAbility('cannon',2);assert(unlockedSkills[0].level===2&&player.damage===3,'upgrade');
});
test('enemy attacks',()=>{
  for(const type of ['basic','fast','armored','flyer','shooter','parasite']) {
    setup(0);viruses=[createViruses()[0]];const v=viruses[0];Object.assign(v,ENEMY_PROFILES[type],{type,x:300,baseX:300,y:floorY()-24,baseY:floorY()-24,alive:true,attackCooldownTimer:0,specialCooldownTimer:0,summonCooldownTimer:0});
    player.x=315;player.y=floorY()-48;damageCooldown=0;const hp=player.health;
    for(let t=0;t<180;t++) updateCombat(1/60);
    assert(type==='parasite'?viruses.length>1:player.health<hp,type+' attack failed');
  }
});
test('boss stages, shield and projectile defeat',()=>{
  setup(9);const boss=viruses.find(v=>v.type==='boss');let hp=boss.hp;damageVirus(boss,10);assert(boss.hp===hp,'shield');components.forEach(c=>c.repaired=true);
  for(const ratio of [.9,.6,.2]) {boss.hp=boss.maxHp*ratio;boss.bossCycleCooldown=0;boss.attackWindup=0;updateVirusZero(boss,.01,boss.x-180,boss.y);updateVirusZero(boss,1,boss.x-180,boss.y);assert(boss.bossStage===(ratio>.67?1:ratio>.34?2:3),'stage');}
  boss.hp=boss.maxHp;viruses=viruses.filter(v=>v===boss);player.x=boss.x-150;player.y=boss.y-22;player.facing=1;keys.add('j');
  for(let t=0;t<1600&&boss.alive;t++) {boss.speed=0;updateCombat(1/60);}
  assert(!boss.alive,'boss survived actual shots');
});
test('temporary and moving platforms',()=>{
  setup(0);const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');const state=getPlatformState(temp);state.triggered=true;player.x=70;
  for(let t=0;t<140;t++) update(1/60);assert(!platformShape(temp),'temporary did not vanish');
  for(let t=0;t<200;t++) update(1/60);assert(platformShape(temp),'temporary did not return');
  const moving=phaseData.entities.platforms.find(p=>p.type==='moving');const s=platformShape(moving);player.x=s.x+10;player.y=s.y-player.height;player.grounded=true;advancePlatformMotion(.01);const x=player.x;advancePlatformMotion(.1);assert(player.x!==x,'moving platform carry');
});
test('keyboard controls',()=>{
  setup(0);const x=player.x;window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));movePlayer(.1);window.dispatchEvent(new KeyboardEvent('keyup',{key:'d'}));assert(player.x>x&&!keys.has('d'),'movement');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:' '}));movePlayer(1/60);assert(player.vy<0&&!player.grounded,'jump');window.dispatchEvent(new KeyboardEvent('keyup',{key:' '}));
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'j'}));updateCombat(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{key:'j'}));assert(projectiles.length>0,'shoot');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));window.dispatchEvent(new Event('blur'));assert(!keys.size,'stuck keys');
});
test('resize and particle budget',()=>{
  setup(0);player.x=70;player.y=floorY()-player.height;const y=player.y,oldFloor=floorY();
  canvas.style.height='400px';resize();assert(Math.abs(player.y-y-(floorY()-oldFloor))<1,'floor resize drift');draw();
  setup(5);const verticalY=player.y;canvas.style.height='460px';resize();assert(player.y===verticalY,'vertical map resized');draw();
  effects=[];for(let i=0;i<100;i++)emitParticles(50,50,'white',35);assert(effects.length===240,'unbounded particles');
  canvas.style.height='';resize();
});
test('frame rate independent jump',()=>{
  const heights=[];
  for(const dt of [1/30,1/60,1/144]) {
    setup(0);const startY=player.y;let peak=startY;jumpQueued=true;
    for(let t=0;t<Math.ceil(1/dt);t++) {movePlayer(dt);peak=Math.min(peak,player.y);}
    heights.push(startY-peak);assert(player.grounded,'jump failed to land');
  }
  assert(Math.max(...heights)-Math.min(...heights)<1,'different jump heights: '+heights.join());
});
test('damage, shield, healing and repair upgrades',()=>{
  setup(0);unlockedSkills=[{id:'armor',level:3}];restoreSkillEffects();damageCooldown=0;damagePlayer(20,{x:0});assert(player.health===86,'armor damage');
  unlockedSkills=[{id:'shield',level:2}];restoreSkillEffects();player.shieldTime=1;damageCooldown=0;const hp=player.health;damagePlayer(20,{x:0});assert(player.health===hp,'shield damage');
  viruses=[];updateCombat(1);assert(player.shieldTime===0&&player.shieldCooldown>0,'shield expiry');updateCombat(player.shieldCooldown);updateCombat(.01);assert(player.shieldTime>0,'shield recharge');
  player.health=30;ABILITIES.find(a=>a.id==='recovery').apply(2);assert(player.health===60,'healing');
  ABILITIES.find(a=>a.id==='repair').apply(3);assert(Math.abs(repairDuration-.56)<.001,'repair upgrade');
});
test('distinct layouts and themes',()=>{
  assert(PHASES.length===10&&new Set(PHASES.map(p=>p.theme)).size===10,'themes');
  assert(new Set(PHASES.map(p=>JSON.stringify(p.entities.platforms))).size===10,'duplicate geometry');
  for(const type of ['horizontal','vertical','maze','multi-route'])assert(PHASES.some(p=>p.map.layout===type),'missing layout '+type);
});
test('final boss telegraphs, dodge and weak point',()=>{
  const arena=()=>{setup(9);components.forEach(c=>c.repaired=true);const b=viruses.find(v=>v.multiStage);viruses=[b];b.x=3700;b.baseX=3700;b.speed=0;player.x=3830;player.y=floorY()-48;damageCooldown=0;return b;};
  let b=arena();b.bossAttackKind='slam';triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(player.health<100,'slam does not hit ground');
  b=arena();jumpQueued=true;for(let t=0;t<12;t++)movePlayer(1/60);triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(player.health===100,'normal jump cannot dodge slam');
  for(const jumping of [false,true]) {
    b=arena();b.bossAttackKind='charge';b.bossAttackDirection=1;const oldX=b.x;triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(b.x===oldX&&b.chargeTime>0,'charge still teleports');
    if(jumping)jumpQueued=true;
    for(let t=0;t<32;t++){movePlayer(1/60);updateCombat(1/60);}
    assert(jumping?player.health===100:player.health<100,'charge dodge/hit '+jumping);
    assert(b.vulnerableTime>0,'charge recovery');
  }
  b=arena();b.hp=b.maxHp*.6;b.bossCycleCooldown=0;b.bossPatternIndex=0;
  updateVirusZero(b,.01,player.x+17,player.y+24);const aimX=b.bossAimX,aimY=b.bossAimY;
  triggerVirusZeroAttack(b,player.x+200,player.y-100);const center=enemyProjectiles[1];
  assert(Math.abs(Math.atan2(center.vy,center.vx)-Math.atan2(aimY-b.y,aimX-b.x))<.001,'volley ignores target telegraph');
  enemyProjectiles=[];b.bossAttackKind='surge';triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(enemyObstacles.some(o=>o.bossOwned),'no scenario change');
  assert(!enemyObstacles.some(o=>overlaps(player,o)),'pillar traps player');
  b.vulnerableTime=0;let before=b.hp;damageVirus(b,2);const guarded=before-b.hp;b.vulnerableTime=1;before=b.hp;damageVirus(b,2);assert(before-b.hp>guarded,'weak point has no effect');
  spawnEnemyMinion(b);enemyProjectiles.push({bossOwned:true});b.hp=1;damageVirus(b,5);assert(!b.alive&&!viruses.some(v=>v.alive&&v.summonedBy===b.id)&&!enemyObstacles.some(o=>o.bossOwned)&&!enemyProjectiles.some(p=>p.bossOwned),'boss hazards survive death');
});
test('boss activation, skills and final checkpoint',()=>{
  setup(9);const b=viruses.find(v=>v.multiStage);for(let t=0;t<300;t++)updateEnemyBrain(b,1/60,100,floorY()-24);assert(!enemyProjectiles.some(p=>p.bossOwned)&&b.x===3970,'boss attacks before arena');
  unlockedSkills=[{id:'cannon',level:3},{id:'armor',level:3},{id:'boost',level:2}];restoreSkillEffects();saveCampaign();continueCampaign();assert(player.damage===4&&player.armor>.29&&player.jumpPower>690,'campaign abilities lost');
  player.x=3540;player.y=floorY()-48;components.forEach(c=>c.repaired=true);updateCheckpoints();respawnAtCheckpoint();assert(checkpointX===3540&&components.every(c=>c.repaired)&&!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'arena checkpoint');
  saveCampaign();continueCampaign();assert(checkpointX===3540&&components.every(c=>c.repaired),'arena save');
});
test('boss visual states',()=>{
  setup(9);const b=viruses.find(v=>v.multiStage);player.x=b.x-180;player.y=floorY()-48;cameraX=b.x-width*.55;
  const snapshot=name=>{draw();report.snapshots.push({phase:10,position:'boss-'+name,image:canvas.toDataURL()});};
  updateVirusZero(b,.01,player.x+17,player.y+24);snapshot('protected');
  components.forEach(c=>c.repaired=true);updateVirusZero(b,.01,player.x+17,player.y+24);
  b.bossAttackKind='charge';b.bossAttackDirection=-1;b.attackWindup=1.05;snapshot('charge');
  b.hp=b.maxHp*.6;b.bossStage=2;b.bossAttackKind='surge';b.attackWindup=.85;snapshot('surge');
  b.hp=b.maxHp*.2;b.bossStage=3;b.bossAttackKind='combo';b.bossAimX=player.x+17;b.bossAimY=player.y+24;b.attackWindup=.8;snapshot('combo');
  b.attackWindup=0;b.vulnerableTime=1.65;snapshot('weak-point');
});
test('volley and final combo can be dodged',()=>{
  setup(9);components.forEach(c=>c.repaired=true);let b=viruses.find(v=>v.multiStage);viruses=[b];b.speed=0;b.bossStage=2;b.hp=b.maxHp*.6;b.specialCooldownTimer=99;
  player.x=b.x-250;player.y=floorY()-48;damageCooldown=0;b.bossAttackKind='volley';b.bossAimX=player.x+17;b.bossAimY=player.y+24;
  triggerVirusZeroAttack(b,player.x+17,player.y+24);
  for(let t=0;t<90;t++){if(t===24)jumpQueued=true;movePlayer(1/60);updateHostileProjectiles(1/60);}
  assert(player.health===100,'volley cannot be jumped');
  setup(9);components.forEach(c=>c.repaired=true);b=viruses.find(v=>v.multiStage);viruses=[b];b.speed=0;b.hp=b.maxHp*.2;b.specialCooldownTimer=99;b.bossCycleCooldown=0;
  player.x=3790;player.y=floorY()-166-player.height;player.grounded=true;damageCooldown=0;
  updateVirusZero(b,.01,player.x+17,player.y+24);keys.add('a');
  for(let t=0;t<110;t++){movePlayer(1/60);updateCombat(1/60);}
  keys.clear();assert(player.health===100,'combo cannot be dodged by leaving upper platform');
});
test('boss defeat opens mandatory final question and victory',()=>{
  setup(9);xpRequired=999999;components.forEach(c=>c.repaired=true);const b=viruses.find(v=>v.multiStage);viruses.filter(v=>v!==b).forEach(v=>v.alive=false);b.hp=1;
  player.x=b.x-120;player.y=floorY()-48;player.facing=1;keys.add('j');
  for(let t=0;t<120&&!phaseQuestionOpen;t++)update(1/60);
  assert(!b.alive&&phaseQuestionOpen&&!campaignComplete,'final question does not open after projectile defeat');
  ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();
  assert(campaignComplete&&getSavedCampaign().campaignComplete&&!overlay.classList.contains('hidden'),'victory flow');
});
running=false;
const output=document.createElement('pre');output.id='review-result';output.textContent=JSON.stringify(report);document.body.replaceChildren(output);
