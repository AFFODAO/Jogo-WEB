// Injected into an isolated copy by run_review.py; never shipped in game.js.
window.requestAnimationFrame = () => 0;
soundEnabled = false;
const report = { phases: [], systems: {}, errors: [], snapshots: [] };
function assert(value, message) { if (!value) throw new Error(message); }
function test(name, fn) { window.__reviewProgress?.(name);try { fn(); report.systems[name] = 'PASS'; } catch(e) { report.systems[name] = e.message; } }
function captureCanvas(){
  const scale=Math.min(1,1600/canvas.width,1000/canvas.height);
  if(scale===1)return canvas.toDataURL();
  const snapshot=document.createElement('canvas');snapshot.width=Math.round(canvas.width*scale);snapshot.height=Math.round(canvas.height*scale);
  const target=snapshot.getContext('2d');target.imageSmoothingEnabled=false;target.drawImage(canvas,0,0,snapshot.width,snapshot.height);return snapshot.toDataURL();
}
let traversedPortals=new Set();
function setup(i) { resetCampaign(); loadPhase(i,true); running=true; paused=false; campaignStarted=true; damageCooldown=99999; keys.clear();traversedPortals=new Set(); }
function equipTestSkills(){equippedCombat=ByteRunner.progression.loadout(unlockedSkills);restoreSkillEffects();}
function fulfilGoalsForQuestionTest() {
  const mark=c=>{if(c.flag)levelRuntime.setFlag(c.flag,c.value??true);(c.all||c.any||[]).forEach(mark);};
  (phaseData.objectives.goals||[]).forEach(goal=>{if(goal.type==='condition')mark(goal.condition);});
}
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
function reachability({stopAt,edges}={}) {
  const liveSolids=solids,liveMove=movePlayer,snapshot=solids(),index=ByteRunner.mapAudit.spatialIndex(snapshot);
  solids=()=>snapshot;
  movePlayer=dt=>{solids=()=>index.near(player);try{liveMove(dt);}finally{solids=()=>snapshot;}};
  try{return rawReachability(stopAt,edges);}finally{solids=liveSolids;movePlayer=liveMove;}
}
function rawReachability(stopAt,edges) {
  const nodes=surfaces(), reached=new Set();
  const start=nodes.findIndex(n=>player.x>=n.a-1 && player.x<=n.z+1 && Math.abs(player.y-n.y)<3);
  assert(start>=0,'spawn without support'); reached.add(start);
  const queue=[start];
  search: for(let q=0;q<queue.length;q++) {
    const src=nodes[queue[q]];
    if(stopAt?.(src))break;
    for (const link of levelRuntime.connections()) {
      const px=Math.max(src.a,Math.min(src.z,link.x));
      if(Math.hypot(px+17-link.x-link.width/2,src.y+24-link.y-link.height/2)>=72)continue;
      player.x=px;player.y=src.y;player.vy=0;player.grounded=true;
      levelRuntime.update(.6,{keys:new Set(),repairNearby:false});
      levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
      if(Math.abs(player.x-link.to.x)>1||Math.abs(player.y-link.to.y)>1)continue;
      traversedPortals.add(link.id);
      const j=nodes.findIndex(n=>player.x>=n.a-1&&player.x<=n.z+1&&Math.abs(player.y-n.y)<3);
      if(j>=0&&!reached.has(j)){
        reached.add(j);queue.push(j);
        if(stopAt?.(nodes[j]))break search;
      }
    }
    for(let j=0;j<nodes.length;j++) {
      if(reached.has(j)) continue;
      const dst=nodes[j];
      if(src.y-dst.y>126 || Math.max(dst.a-src.z,src.a-dst.z)>230) continue;
      const edge=queue[q]*nodes.length+j;
      if(edges?.has(edge)){
        if(edges.get(edge)){
          reached.add(j);queue.push(j);
          if(stopAt?.(dst))break search;
        }
        continue;
      }
      let found=false;
      const targets=[dst.a,dst.z,(dst.a+dst.z)/2];
      for(const target of targets) {
        const launches=[Math.max(src.a,Math.min(src.z,target)),src.a,src.z,(src.a+src.z)/2];
        for(const launch of launches) {
          for(const mode of ['jump','walk-left','walk-right']) {
            if(mode!=='jump' && dst.y<src.y) continue;
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
              if(player.grounded && (leftSurface||mode!=='jump') && t>1) {
              if(player.x>=dst.a-2 && player.x<=dst.z+2 && Math.abs(player.y-dst.y)<3) found=true;
              // A real landing may first support only the front of the body.
              // Continue walking on the same surface until the full box is over it.
              // This matters when stepping off narrow precision ledges in reverse.
                if(found || (leftSurface&&(Math.abs(player.y-dst.y)>=3 || player.x+player.width<=dst.a || player.x>=dst.z+player.width))) break;
            }
          }
          if(found) break;
          }
          if(found) break;
        }
        if(found) break;
      }
      edges?.set(edge,found);
      if(found) {
        reached.add(j);queue.push(j);
        if(stopAt?.(dst))break search;
      }
    }
  }
  keys.clear(); return [...reached].map(i=>nodes[i]);
}
function reachableNavigationArea(nodes) {
  const jump=ByteRunner.platformPhysics.jumpHeight;
  const bands=nodes.filter(n=>n.a<=n.z).map(n=>[n.a,Math.max(0,n.y-jump),n.z+player.width,n.y+player.height]);
  const boxes=solids().map(s=>[s.x,s.y,s.x+s.w,s.y+s.h]);
  const edges=[...new Set([...bands,...boxes].flatMap(r=>[r[0],r[2]]))].sort((a,b)=>a-b);
  function length(rects,left,right) {
    let end=0,total=0;
    for(const [,top,,bottom] of rects.filter(r=>r[0]<right&&r[2]>left).sort((a,b)=>a[1]-b[1])){
      total+=Math.max(0,bottom-Math.max(top,end));
      end=Math.max(end,bottom);
    }
    return total;
  }
  return edges.slice(1).reduce((area,right,i)=>{
    const left=edges[i];
    return area+(right-left)*(length([...bands,...boxes],left,right)-length(boxes,left,right));
  },0);
}

for(let i=0;i<10;i++) {
  window.__reviewProgress?.('Phase '+(i+1));
  const r={phase:i+1}; report.phases.push(r);
  try {
    setup(i);
    await levelVisuals.ready;
    assert(levelVisuals.errors.length===0,'phase image load failures: '+levelVisuals.errors);
    r.assetLoad='PASS';
    if(phaseData.map.ground?.mode==='explicit') {
      const previous={width,height,pixelRatio,cameraX,cameraY,cw:canvas.width,ch:canvas.height};
      width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);
      draw();report.snapshots.push({phase:i+1,position:'overview',image:captureCanvas()});
      width=previous.width;height=previous.height;pixelRatio=previous.pixelRatio;cameraX=previous.cameraX;cameraY=previous.cameraY;canvas.width=previous.cw;canvas.height=previous.ch;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    }
    for(const position of [0,.5,1]) {
      cameraX=Math.max(0,worldWidth()-width)*position;cameraY=Math.max(0,worldHeight()-height)*(1-position);draw();
      report.snapshots.push({phase:i+1,position,image:captureCanvas()});
    }
    r.render='PASS';
    if(i>=5) {
      const boxes=solids();
      const embedded=components.filter(c=>boxes.some(s=>overlaps(c,s))).map(c=>c.id);
      embedded.push(...collectibles.filter(c=>boxes.some(s=>c.x+c.radius>s.x&&c.x-c.radius<s.x+s.w&&c.y+c.radius>s.y&&c.y-c.radius<s.y+s.h)).map(c=>c.id));
      embedded.push(...viruses.filter(v=>boxes.some(s=>v.x+v.radius>s.x&&v.x-v.radius<s.x+s.w&&v.y+v.radius>s.y&&v.y-v.radius<s.y+s.h)).map(v=>v.id));
      r.objectPlacement=embedded.length?'EMBEDDED: '+embedded.join(','):'PASS';
    }
    viruses.forEach(v=>v.alive=false);xpRequired=999999;
    const cameraSupport=solids().filter(s=>s.collision!=='one-way'&&s.w>=player.width+64&&s.y>player.height).sort((a,b)=>(b.x+b.w)-(a.x+a.w)||b.y-a.y)[0];
    player.x=cameraSupport?cameraSupport.x+cameraSupport.w-player.width-16:worldWidth()-player.width-80;
    player.y=cameraSupport?cameraSupport.y-player.height:phaseData.map.layout==='vertical'?400:floorY()-player.height;
    player.vy=0;player.grounded=Boolean(cameraSupport);
    for(let t=0;t<90;t++) update(1/60);
    assert(cameraX>=0&&cameraX<=Math.max(0,worldWidth()-width)&&cameraY>=0&&cameraY<=Math.max(0,worldHeight()-height),'camera outside map');
    assert(player.x-cameraX>=-1&&player.x-cameraX+player.width<=width+1,'camera lost player');r.camera='PASS';
    assert(player.y-cameraY>=-1&&player.y-cameraY+player.height<=height+1,'vertical camera lost player '+JSON.stringify({playerY:player.y,cameraY,height,grounded:player.grounded,combatDefeat,running,worldHeight:worldHeight()}));
    setup(i);
    assert(!unlockedSkills.length&&player.jumpPower===JUMP_SPEED&&player.damage===1&&player.armor===0,'optional skill in traversal');
    r.baseAbilities='PASS';
    const start=mapStart(); let reachable=[];
    for(let round=0;round<=components.length+phaseData.entities.interactives.length+2;round++) {
      player.x=start.x;player.y=start.y;player.vy=0;player.grounded=true;
      reachable=reachability(); let changed=false;
      for(const c of components.filter(c=>!c.repaired)) {
        const n=reachable.find(n=>Math.abs(c.y+c.height/2-(n.y+player.height/2))<=78 && n.z+player.width/2>=c.x+c.width/2-76 && n.a+player.width/2<=c.x+c.width/2+76);
        if(!n) continue;
        player.x=Math.max(n.a,Math.min(n.z,c.x));player.y=n.y;keys.add('e');
        updateRepair(0);assert(repairSession?.model,'component minigame unavailable');solveRepairUI();updateRepair(.6);
        keys.clear();assert(c.repaired,'repair interaction failed'); changed=true;
      }
      for(const interactive of phaseData.entities.interactives) {
        if(levelRuntime.getFlag(interactive.flag || interactive.id))continue;
        const n=reachable.find(n=>Math.abs(interactive.y+20-(n.y+24))<60&&n.z+34>=interactive.x-50&&n.a<=interactive.x+70);
        if(!n)continue;
        player.x=Math.max(n.a,Math.min(n.z,interactive.x));player.y=n.y;
        levelRuntime.update(.6,{keys:new Set(),repairNearby:false});
        levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
        if(levelRuntime.getFlag(interactive.flag || interactive.id))changed=true;
      }
      if(!changed) break;
    }
    r.reachableSurfaces=reachable.length;
    r.repairAccess=components.every(c=>c.repaired)?'PASS':'UNREACHABLE: '+components.filter(c=>!c.repaired).map(c=>c.id);
    if(r.repairAccess!=='PASS') r.debug={nodes:reachable,components:components.map(c=>({id:c.id,x:c.x,y:c.y,repaired:c.repaired}))};
    r.platformAccess=phaseData.entities.platforms.filter(s=>!reachable.some(n=>n.id===s.id)).map(s=>s.id);
    r.switchAccess=phaseData.entities.interactives.every(spec=>levelRuntime.getFlag(spec.flag || spec.id))?'PASS':'FAIL';
    r.portals=[...traversedPortals];
    if(phaseData.map.ground?.mode==='explicit') {
      for(const item of collectibles) {
        const options=reachable.filter(n=>n.z+34>=item.x-item.radius&&n.a<=item.x+item.radius&&n.y+24-item.y>=-35&&n.y+24-item.y<165);
        for(const n of options) {
          player.x=Math.max(n.a,Math.min(n.z,item.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();
          for(let t=0;t<80&&!item.collected;t++){movePlayer(1/60);updateCollectibles(1/60);}
          if(item.collected)break;
        }
      }
      r.collectibleAccess=collectibles.every(item=>item.collected)?'PASS':'UNREACHABLE: '+collectibles.filter(item=>!item.collected).map(item=>item.id).join(',');
    }
    phaseExitUnlocked=true;
    player.x=start.x;player.y=start.y;player.grounded=true;
    const exitNodes=reachability();
    r.exitAccess=exitNodes.some(n=>phaseData.map.exit.mode==='region'?Math.max(n.a,Math.min(n.z,phaseData.map.exit.x))+34>phaseData.map.exit.x&&n.a<phaseData.map.exit.x+phaseData.map.exit.width&&n.y+48>phaseData.map.exit.y&&n.y<phaseData.map.exit.y+phaseData.map.exit.height:phaseData.map.layout==='vertical'? Math.hypot(Math.max(n.a,Math.min(n.z,phaseData.map.exit.x))+17-phaseData.map.exit.x,n.y+24-phaseData.map.exit.y)<74:n.z+34>=phaseData.map.exit.x+20)?'PASS':'FAIL';
    r.enemyAccess=viruses.every(v=>reachable.some(n=> Math.abs(n.y+22-v.y)<v.radius+5+126 && n.z+800>=v.x && n.a-800<=v.x))?'PASS':'FAIL';
    r.combat=[];
    for(const enemy of viruses.filter(v=>v.countsForObjective!==false)) {
      const options=reachable.flatMap(n=>[n.a,n.z,(n.a+n.z)/2,enemy.x-157,enemy.x+123]
        .map(x=>Math.max(n.a,Math.min(n.z,x))).filter((x,i,positions)=>positions.indexOf(x)===i)
        .map(x=>({n,x,score:Math.abs(Math.abs(x+17-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3})))
        .filter(p=>p.n.y+22-enemy.y>=-enemy.radius-5 && p.n.y+22-enemy.y<125+enemy.radius&&(!enemy.activationRegion||(p.x+17>=enemy.activationRegion.x&&p.x+17<=enemy.activationRegion.x+enemy.activationRegion.width&&p.n.y+24>=enemy.activationRegion.y&&p.n.y+24<=enemy.activationRegion.y+enemy.activationRegion.height))).sort((a,b)=>a.score-b.score);
      for(const p of options.slice(0,8)) {
        player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;damageCooldown=99999;keys.clear();keys.add('j');projectiles=[];
        for(let t=0;t<600&&enemy.alive;t++) {
          player.facing=enemy.x>=player.x+17?1:-1;
          if(player.y+22>enemy.y+enemy.radius+5&&player.grounded) jumpQueued=true;
          movePlayer(1/60);updateCombat(1/60);
        }
        if(!enemy.alive) break;
      }
      keys.clear();r.combat.push({id:enemy.id,type:enemy.type,result:enemy.alive?'FAIL':'PASS',...(enemy.alive?{position:{x:enemy.x,y:enemy.y,baseY:enemy.baseY,hp:enemy.hp},player:{x:player.x,y:player.y},support:ByteRunner.enemies.lane(enemy,solids())}: {})});
    }
    for(const point of phaseData.map.checkpoints) {
      player.x=typeof point==='number'?point:point.x; player.y=(typeof point==='number'?floorY():point.y)-player.height;updateCheckpoints();respawnAtCheckpoint();
      assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'checkpoint inside solid');
      assert(!(phaseData.map.pits||[]).some(p=>player.x+player.width>p.x&&player.x<p.x+p.width),'checkpoint over pit');
    } r.checkpoints='PASS';
    const checkpointProgress=components.map(c=>c.repaired).join();
    if(phaseData.map.pits?.length) {const pit=phaseData.map.pits[0];player.x=pit.x+pit.width/2-17;player.y=floorY()+120;player.vy=400;movePlayer(1/60);assert(combatDefeat&&player.health===0,'pit did not enter Game Over');restartFromCheckpoint();}
    damageCooldown=0;player.health=1;damagePlayer(20,{x:0});assert(combatDefeat&&player.health===0&&components.map(c=>c.repaired).join()===checkpointProgress,'death checkpoint progress');restartFromCheckpoint();assert(player.health===player.maxHealth&&damageCooldown>0,'checkpoint restart protection');r.respawn='PASS';
    player.x=-10;player.y=-10; movePlayer(1/60);assert(player.x>=0&&player.y>=0,'left/top bounds');
    player.x=worldWidth()+10; movePlayer(1/60);assert(player.x+player.width<=worldWidth(),'right bounds');r.bounds='PASS';
    setup(i); const c=components[0];c.repaired=true;viruses[0].alive=false;viruses[0].hp=0;xp=37;checkpointX=typeof phaseData.map.checkpoints[0]==='number'?phaseData.map.checkpoints[0]:phaseData.map.checkpoints[0].x;
    saveCampaign();continueCampaign();assert(components[0].repaired&&!viruses[0].alive&&xp===37,'save restoration');r.save='PASS';
    setup(i);assert(!phaseExitUnlocked,'exit initially unlocked');openPhaseQuestion();assert(!phaseQuestionOpen,'premature question');
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>{v.alive=false;v.hp=0;});fulfilGoalsForQuestionTest();checkObjectives();assert(phaseExitUnlocked,'objectives');openPhaseQuestion();
    ui.questionOverlay.querySelector('[data-correct="false"]').click();assert(getSavedCampaign().questionRetryRequired,'wrong answer not saved');continueCampaign();assert(components.every(c=>!c.repaired)&&viruses.every(v=>v.alive),'reload bypassed retry');
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);fulfilGoalsForQuestionTest();checkObjectives();openPhaseQuestion();ui.questionOverlay.querySelector('[data-correct="false"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(running&&!phaseQuestionOpen&&!phaseExitUnlocked,'retry stuck');
    components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);fulfilGoalsForQuestionTest();checkObjectives();openPhaseQuestion();ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(i===9?campaignComplete:phaseTransition,'correct answer progression');r.questions='PASS';
    if(i<9) {continueCampaign();assert(phaseIndex===i+1&&running&&!phaseExitUnlocked,'next phase restoration');} else assert(getSavedCampaign().campaignComplete,'victory not saved');r.transitionSave='PASS';
  } catch(e) {r.error=e.stack;}
}
test('skills and pending choice',()=>{
  setup(0);xp=xpRequired;openLevelChoice();assert(level===2&&levelChoiceOpen,'level');saveCampaign();continueCampaign();assert(level===2&&levelChoiceOpen,'pending choice lost');
  let b=ui.levelOverlay.querySelector('[data-skill]');b.click();assert(unlockedSkills.length===1&&running,'ability selection');
  for(const ability of ABILITIES) {unlockedSkills=[{id:ability.id,level:2}];equipTestSkills();}
  unlockedSkills=[{id:'armor',level:3},{id:'cannon',level:2},{id:'rapid',level:2},{id:'boost',level:2},{id:'repair',level:2}];equipTestSkills();assert(Math.abs(player.armor-.2)<1e-9,'armor');assert(player.damage===1&&player.fireRate<.32&&player.jumpPower===JUMP_SPEED&&repairDuration<.8,'effects');
  unlockedSkills=[{id:'cannon',level:1}];xp=xpRequired;openLevelChoice();selectAbility('cannon',2);assert(unlockedSkills[0].level===2&&player.damage===1,'upgrade');
});
test('enemy attacks',()=>{
  for(const type of ['basic','fast','armored','flyer','shooter','parasite']) {
    setup(9);const ground=mapStart().y+48;viruses=[createViruses()[0]];const v=viruses[0];Object.assign(v,ENEMY_PROFILES[type],{type,x:300,baseX:300,y:ground-24,baseY:ground-24,groundY:ground,navigationBounds:undefined,activationRegion:undefined,alive:true,attackCooldownTimer:0,specialCooldownTimer:0,summonCooldownTimer:0});
    player.x=315;player.y=ground-48;damageCooldown=0;const hp=player.health;
    for(let t=0;t<180;t++) updateCombat(1/60);
    assert(type==='parasite'?viruses.length>1:player.health<hp,type+' attack failed');
  }
});
test('boss stages, shield and projectile defeat',()=>{
  setup(9);const boss=viruses.find(v=>v.type==='boss');let hp=boss.hp;damageVirus(boss,10);assert(boss.hp===hp,'shield');components.forEach(c=>c.repaired=true);
  for(const ratio of [.9,.6,.2]) {boss.hp=boss.maxHp*ratio;boss.bossCycleCooldown=0;boss.bossPatternIndex=0;boss.attackWindup=0;boss.chargeTime=0;boss.bossPhaseTransitionTime=0;for(let t=0;t<95;t++)updateVirusZero(boss,1/60,boss.x-180,boss.y);assert(boss.bossStage===(ratio>.67?1:ratio>.34?2:3),'stage');}
  player.x=boss.bossBounds.left+150;player.y=boss.groundY-player.height;boss.alive=true;boss.hp=boss.maxHp;boss.bossStage=1;boss.bossPhaseTransitionTime=0;boss.vulnerableTime=0;
  const phaseTwoGate=boss.maxHp*.67,phaseThreeGate=boss.maxHp*.34;
  damageVirus(boss,10000);assert(Math.abs(boss.hp-phaseTwoGate)<1e-6&&boss.alive,'phase 1 did not stop at its health gate');
  damageVirus(boss,10000);assert(boss.alive&&boss.bossStage===1&&Math.abs(boss.hp-phaseTwoGate)<1e-6,'extra hit skipped phase 2');
  updateVirusZero(boss,.9,boss.x-180,boss.y);assert(boss.bossStage===2&&boss.bossPhaseTransitionTime===0,'phase 2 did not begin');
  damageVirus(boss,10000);assert(Math.abs(boss.hp-phaseThreeGate)<1e-6&&boss.alive,'phase 2 did not stop at its health gate');
  damageVirus(boss,10000);assert(boss.alive&&boss.bossStage===2&&Math.abs(boss.hp-phaseThreeGate)<1e-6,'extra hit skipped phase 3');
  updateVirusZero(boss,.9,boss.x-180,boss.y);assert(boss.bossStage===3&&boss.bossPhaseTransitionTime===0,'phase 3 did not begin');
  damageVirus(boss,10000);assert(!boss.alive,'phase 3 could not defeat boss');
  boss.alive=true;boss.hp=boss.maxHp;boss.bossStage=1;boss.bossPhaseTransitionTime=0;boss.vulnerableTime=0;boss.attackWindup=0;boss.bossCycleCooldown=1.2;enemyProjectiles=[];enemyObstacles=[];viruses=viruses.filter(v=>v===boss);player.x=boss.x-150;player.y=boss.y-22;player.facing=1;keys.add('j');
  for(let t=0;t<2400&&boss.alive;t++) {
    boss.speed=0;player.facing=boss.x>player.x+17?1:-1;
    if(!combatAttack.charging&&combatAttack.remaining<=0&&combatAttack.energy>=25)combatAttack.request('k');
    updateCombat(1/60);
  }
  assert(!boss.alive,'boss survived actual shots');
});
test('keyboard controls',()=>{
  setup(0);const x=player.x;window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));movePlayer(.1);window.dispatchEvent(new KeyboardEvent('keyup',{key:'d'}));assert(player.x>x&&!keys.has('d'),'movement');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:' '}));movePlayer(1/60);assert(player.vy<0&&!player.grounded,'jump');window.dispatchEvent(new KeyboardEvent('keyup',{key:' '}));
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'j'}));updateCombat(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{key:'j'}));assert(projectiles.length>0,'shoot');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}));window.dispatchEvent(new Event('blur'));assert(!keys.size,'stuck keys');
});
test('resize and particle budget',()=>{
  setup(9);const viewportMap=ByteRunner.maps.clone(PHASES[0]);viewportMap.id='test-viewport';viewportMap.map.height='viewport';delete viewportMap.map.ground;viewportMap.map.start={x:70,anchor:'floor',offset:0};loadMap(viewportMap,true);player.x=70;player.y=floorY()-player.height;const y=player.y,oldFloor=floorY();
  canvas.style.height='400px';resize();assert(Math.abs(player.y-y-(floorY()-oldFloor))<1,'floor resize drift');draw();
  setup(5);const verticalY=player.y;canvas.style.height='460px';resize();assert(player.y===verticalY,'vertical map resized');draw();
  effects=[];for(let i=0;i<100;i++)emitParticles(50,50,'white',35);assert(effects.length===96,'unbounded particles');
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
  setup(0);unlockedSkills=[{id:'armor',level:3}];equipTestSkills();damageCooldown=0;damagePlayer(20,{x:0});assert(player.health===84,'armor damage');
  unlockedSkills=[{id:'shield',level:2}];equipTestSkills();player.shieldTime=1;damageCooldown=0;const hp=player.health;damagePlayer(20,{x:0});assert(player.health===hp,'shield damage');
  viruses=[];skillRuntime.activate('shield',2,player);updateCombat(1);assert(player.shieldTime===0&&player.shieldCooldown>0,'shield expiry');updateCombat(player.shieldCooldown);updateCombat(.01);assert(player.shieldTime===0,'automatic shield recharge');
  player.health=30;assert(skillRuntime.activate('recovery',2,player)&&player.health===50,'limited healing');
  ABILITIES.find(a=>a.id==='repair').apply(3);assert(Math.abs(repairDuration-.56)<.001,'repair upgrade');
});
test('distinct layouts and themes',()=>{
  assert(PHASES.length===10&&new Set(PHASES.map(p=>p.theme)).size===10,'themes');
  assert(new Set(PHASES.map(p=>JSON.stringify(p.entities.platforms))).size===10,'duplicate geometry');
  for(const type of ['hub','vertical','maze','multi-route'])assert(PHASES.some(p=>p.map.layout===type),'missing layout '+type);
  assert(PHASES[0].map.layout==='multi-route'&&PHASES[0].map.camera.axes.includes('y'),'Hardware must explore vertically as well as horizontally');
});
test('final boss telegraphs, dodge and weak point',()=>{
  const arena=()=>{setup(9);components.forEach(c=>c.repaired=true);const b=viruses.find(v=>v.multiStage);viruses=[b];b.x=5600;b.baseX=5600;b.speed=0;player.x=5730;player.y=bossGroundY(b)-48;damageCooldown=0;return b;};
  let b=arena();b.bossAttackKind='slam';triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(player.health<100,'slam does not hit ground');
  b=arena();jumpQueued=true;for(let t=0;t<12;t++)movePlayer(1/60);triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(player.health===100,'normal jump cannot dodge slam');
  for(const jumping of [false,true]) {
    b=arena();b.bossAttackKind='charge';b.bossAttackDirection=1;const oldX=b.x;triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(b.x===oldX&&b.chargeTime>0,'charge still teleports');
    if(jumping)jumpQueued=true;
    for(let t=0;t<32;t++){movePlayer(1/60);updateCombat(1/60);}
    assert(jumping?player.health===100:player.health<100,'charge dodge/hit '+jumping);
    assert(b.vulnerableTime>0,'charge recovery');
  }
  b=arena();b.hp=b.maxHp*.6;b.bossStage=2;b.bossAttackKind='volley';b.bossCycleCooldown=0;b.bossPatternIndex=0;b.specialCooldownTimer=99;
  updateVirusZero(b,.01,player.x+17,player.y+24);const aimX=b.bossAimX,aimY=b.bossAimY;
  updateVirusZero(b,1.1,player.x+200,player.y-100);const center=enemyProjectiles[1];
  assert(Math.abs(Math.atan2(center.vy,center.vx)-Math.atan2(aimY-b.y,aimX-b.x))<.001,'volley ignores target telegraph');
  enemyProjectiles=[];b.bossAttackKind='surge';triggerVirusZeroAttack(b,player.x+17,player.y+24);assert(enemyObstacles.some(o=>o.bossOwned),'no scenario change');
  assert(!enemyObstacles.some(o=>overlaps(player,o)),'pillar traps player');
  b.vulnerableTime=0;let before=b.hp;damageVirus(b,2);const guarded=before-b.hp;b.vulnerableTime=1;before=b.hp;damageVirus(b,2);assert(before-b.hp>guarded,'weak point has no effect');
  spawnEnemyMinion(b);enemyProjectiles.push({bossOwned:true});b.hp=1;damageVirus(b,5);assert(!b.alive&&!viruses.some(v=>v.alive&&v.summonedBy===b.id)&&!enemyObstacles.some(o=>o.bossOwned)&&!enemyProjectiles.some(p=>p.bossOwned),'boss hazards survive death');
});
test('boss activation, skills and final checkpoint',()=>{
  setup(9);const b=viruses.find(v=>v.multiStage),origin=b.x;for(let t=0;t<300;t++)updateEnemyBrain(b,1/60,100,mapStart().y+24);assert(!enemyProjectiles.some(p=>p.bossOwned)&&b.x===origin,'boss attacks before arena');
  unlockedSkills=[{id:'cannon',level:3},{id:'armor',level:3},{id:'boost',level:2}];equipTestSkills();saveCampaign();continueCampaign();assert(player.damage===1&&player.armor===.2&&player.jumpPower===JUMP_SPEED,'campaign abilities lost');
  const cp=phaseData.map.checkpoints.at(-1);player.x=cp.x;player.y=cp.y-48;components.forEach(c=>c.repaired=true);updateCheckpoints();respawnAtCheckpoint();assert(checkpointX===cp.x&&checkpointY===cp.y&&components.every(c=>c.repaired)&&!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'arena checkpoint');
  saveCampaign();continueCampaign();assert(checkpointX===cp.x&&components.every(c=>c.repaired),'arena save');
});
test('boss visual states',()=>{
  setup(9);const b=viruses.find(v=>v.multiStage);player.x=b.x-180;player.y=bossGroundY(b)-48;cameraX=b.x-width*.55;cameraY=Math.max(0,bossGroundY(b)-height*.78);
  const snapshot=name=>{draw();report.snapshots.push({phase:10,position:'boss-'+name,image:captureCanvas()});};
  updateVirusZero(b,.01,player.x+17,player.y+24);snapshot('protected');
  components.forEach(c=>c.repaired=true);updateVirusZero(b,.01,player.x+17,player.y+24);
  b.bossAttackKind='charge';b.bossAttackDirection=-1;b.attackWindup=1.05;snapshot('charge');
  b.hp=b.maxHp*.6;b.bossStage=2;b.bossAttackKind='surge';b.attackWindup=.85;snapshot('surge');
  b.hp=b.maxHp*.2;b.bossStage=3;b.bossAttackKind='combo';b.bossAimX=player.x+17;b.bossAimY=player.y+24;b.attackWindup=.8;snapshot('combo');
  b.attackWindup=0;b.vulnerableTime=1.65;snapshot('weak-point');
});
test('volley and final combo can be dodged',()=>{
  setup(9);components.forEach(c=>c.repaired=true);let b=viruses.find(v=>v.multiStage);viruses=[b];b.speed=0;b.bossStage=2;b.hp=b.maxHp*.6;b.specialCooldownTimer=99;
  player.x=b.x-250;player.y=bossGroundY(b)-48;damageCooldown=0;b.bossAttackKind='volley';b.bossAimX=player.x+17;b.bossAimY=player.y+24;
  triggerVirusZeroAttack(b,player.x+17,player.y+24);
  for(let t=0;t<90;t++){if(t===24)jumpQueued=true;movePlayer(1/60);updateHostileProjectiles(1/60);}
  assert(player.health===100,'volley cannot be jumped');
  setup(9);components.forEach(c=>c.repaired=true);b=viruses.find(v=>v.multiStage);viruses=[b];b.speed=0;b.hp=b.maxHp*.2;b.specialCooldownTimer=99;b.bossCycleCooldown=0;
  b.x=5400;b.baseX=5400;b.bossStage=3;b.bossPhaseTransitionTime=0;player.x=5280;player.y=700-player.height;player.grounded=true;damageCooldown=0;
  updateVirusZero(b,.01,player.x+17,player.y+24);keys.add('a');
  for(let t=0;t<110;t++){movePlayer(1/60);updateCombat(1/60);}
  keys.clear();assert(player.health===100,'combo cannot be dodged by leaving upper platform');
});
test('boss defeat opens mandatory final question and victory',()=>{
  setup(9);xpRequired=999999;components.forEach(c=>c.repaired=true);const b=viruses.find(v=>v.multiStage);viruses.filter(v=>v!==b).forEach(v=>v.alive=false);b.hp=1;
  player.x=b.x-120;player.y=bossGroundY(b)-48;player.facing=1;keys.add('j');
  for(let t=0;t<120&&!phaseQuestionOpen;t++)update(1/60);
  assert(!b.alive&&phaseQuestionOpen&&!campaignComplete,'final question does not open after projectile defeat');
  ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();
  assert(campaignComplete&&getSavedCampaign().campaignComplete&&!overlay.classList.contains('hidden'),'victory flow');
});
running=false;
await new Promise(resolve=>setTimeout(resolve,0));
report.errors=window.__reviewErrors || [];
report.systems['audit: no runtime errors, unhandled rejections or console.error']=report.errors.length?JSON.stringify(report.errors):'PASS';
const output=document.createElement('pre');output.id='review-result';output.textContent=JSON.stringify(report);document.body.replaceChildren(output);
