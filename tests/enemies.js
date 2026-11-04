// Behavioral tests use deterministic geometry and the shipped controllers.
function enemyHarness(type,variant) {
  const e={...ENEMY_PROFILES[type],id:'test-enemy',type,variant,x:240,y:376,baseX:240,baseY:376,
    groundY:400,hp:ENEMY_PROFILES[type].hp,maxHp:ENEMY_PROFILES[type].hp,alive:true,direction:1,phase:0,
    patrolMin:170,patrolMax:300,attackCooldownTimer:0,summonCooldownTimer:0,attackWindup:0,vulnerableTime:0};
  const hits=[],shots=[],sounds=[],spawns=[];
  const c={playerX:380,playerY:376,player:{},width:1000,height:800,components:[],
    shapes:[{id:'floor',x:80,y:400,w:700,h:30,collision:'solid'}],
    damage:(...args)=>hits.push(args),fire:(...args)=>shots.push(args),sound:s=>sounds.push(s),
    spawn:()=>{spawns.push(1);e.totalSummons=(e.totalSummons||0)+1;return true;}};
  function tick(n=1){for(let i=0;i<n;i++){
    for(const k of ['attackCooldownTimer','summonCooldownTimer','vulnerableTime'])e[k]=Math.max(0,(e[k]||0)-1/60);
    e.phase+=1/15;ByteRunner.enemies.update(e,c,1/60);
  }}
  return {e,c,hits,shots,sounds,spawns,tick};
}
test('enemies: patrol detects only reachable visible targets and avoids ledges',()=>{
  const h=enemyHarness('basic');h.tick();assert(h.e.detected&&h.e.x>240,'reachable player not pursued');
  h.c.playerY=200;h.tick();assert(!h.e.detected&&h.e.animationState==='patrol','pursued another floor');
  h.c.playerY=376;h.c.shapes.push({x:300,y:300,w:30,h:100,collision:'solid'});h.tick();assert(!h.e.detected,'saw through wall');
  h.c.shapes=[{x:80,y:400,w:220,h:30,collision:'solid'},{x:400,y:400,w:200,h:30,collision:'solid'}];
  h.c.playerX=450;h.e.x=270;h.tick(600);assert(h.e.x<=300-h.e.radius&&h.e.x>=80+h.e.radius,'walked off ledge');
  assert(!h.e.detected,'pursued across unsupported gap');
});
test('enemies: fast dash has fixed direction, warning, dodge and retreat',()=>{
  const h=enemyHarness('fast');h.tick();assert(h.e.action==='dash'&&h.e.attackWindup>.5&&!h.hits.length,'dash without warning');
  const x=h.e.x;h.tick(20);assert(h.e.x===x&&!h.hits.length,'moved or damaged during warning');
  h.c.playerY=220;h.tick(42);assert(h.e.x>x&&!h.hits.length,'jump did not dodge locked dash');
  h.tick(10);assert(h.e.recovery>0&&h.e.animationState==='retreat','no withdrawal window');
  const d=enemyHarness('fast');d.c.playerX=315;d.tick(60);assert(d.hits.length,'dash never damages');
});
test('enemies: frontal armor, rear weakness and recovery remain killable',()=>{
  setup(0);const h=enemyHarness('armored'),v=h.e;viruses=[v];v.hp=v.maxHp=100;
  damageVirus(v,10,400);const front=100-v.hp;v.hp=100;damageVirus(v,10,100);const rear=100-v.hp;
  assert(rear>front*3,'rear not weaker than front');v.hp=100;v.vulnerableTime=1;damageVirus(v,10,400);assert(100-v.hp>=rear,'recovery did not expose core');
  const a=enemyHarness('armored');a.c.playerX=285;a.tick(65);assert(a.e.vulnerableTime>0&&a.hits.length,'shield never opens after attack');
});
test('enemies: shooters choose range, prepare and fire at a locked aim',()=>{
  const h=enemyHarness('shooter');h.tick();assert(!h.shots.length&&h.e.attackWindup>.6,'instant ranged shot');
  const aim=h.e.aimX;h.c.playerX=520;h.tick(43);assert(h.shots.length===1&&h.shots[0][1]===aim,'shot tracks during preparation');
  const close=enemyHarness('shooter');close.c.playerX=280;close.e.attackCooldownTimer=9;close.tick(10);assert(close.e.x<240&&close.e.animationState==='retreat','no close range retreat');
  const wall=enemyHarness('shooter');wall.c.shapes.push({x:300,y:300,w:30,h:100,collision:'solid'});wall.tick(120);assert(!wall.shots.length,'fired through opaque wall');
});
test('enemies: flyers avoid geometry and alternate approach heights',()=>{
  const h=enemyHarness('flyer');h.e.y=h.e.baseY=260;h.c.playerX=600;h.c.playerY=260;
  h.c.shapes.push({x:320,y:180,w:40,h:160,collision:'solid'});
  for(let i=0;i<360;i++){
    h.tick();assert(!h.c.shapes.some(s=>h.e.x+h.e.radius>s.x&&h.e.x-h.e.radius<s.x+s.w&&h.e.y+h.e.radius>s.y&&h.e.y-h.e.radius<s.y+s.h),'flyer entered geometry');
  }
  assert(h.e.x>360,'flyer did not navigate around wall');
  const a=enemyHarness('flyer');a.c.playerX=320;a.e.y=a.e.baseY=300;a.tick(48);assert(a.e.diveTime>0,'no warned dive');
  a.tick(30);assert(a.e.altitudeIndex===1,'dive did not change next approach height');
});
test('enemies: parasite infection, support, warned capped reinforcements',()=>{
  const h=enemyHarness('parasite');const component={id:'c',x:265,y:356,width:34,corruption:0,integrity:100,repaired:false};h.c.components=[component];
  h.tick(30);assert(component.infected&&component.corruption>0&&!h.spawns.length,'infection or summon warning failed');
  h.tick(60);assert(h.spawns.length===1,'warned summon missing');
  h.tick(3000);assert(h.spawns.length===4,'lifetime summon cap failed');
  component.repaired=true;component.infected=false;const corruption=component.corruption;h.tick(20);assert(component.corruption===corruption&&!h.e.infectedComponent,'undid repaired objective');
  setup(0);const p=enemyHarness('parasite').e,a=enemyHarness('basic').e;p.id='support';a.id='ally';a.x=p.x+60;
  viruses=[p,a];components=[];player.x=600;player.y=352;updateCombat(1/60);assert(a.buffed,'ally not strengthened');
  p.alive=false;updateCombat(1/60);assert(!a.buffed,'buff survived source death');
});
test('enemies: all five thematic variants are present and functional',()=>{
  for(const [index,variant] of [[1,'file'],[2,'packet'],[4,'wifi'],[7,'dns'],[8,'firewall']]){
    setup(index);assert(viruses.some(e=>e.variant===variant),'missing campaign variant '+variant);
  }
  const file=enemyHarness('basic','file');file.e.hp=1;file.tick(56);assert(file.spawns.length===1,'file fork failed');file.tick(100);assert(file.spawns.length===1,'file fork repeated');
  const wifi=enemyHarness('flyer','wifi');wifi.c.playerX=320;wifi.e.y=wifi.e.baseY=300;wifi.tick(48);assert(wifi.shots.length===2&&wifi.shots[0][0].slowOnHit>0,'interference burst missing');
  const dns=enemyHarness('shooter','dns');dns.tick(44);assert(dns.e.echoTime>0&&dns.shots.length===1,'DNS echo not announced');dns.tick(25);assert(dns.shots.length===2,'DNS second resolution missing');
  const firewall=enemyHarness('armored','firewall');firewall.e.variantCooldown=0;firewall.tick(52);assert(firewall.shots.length===1&&firewall.e.vulnerableTime>0,'firewall countermeasure failed');
});
test('enemies: packet hijacker captures at most one shot per preparation',()=>{
  setup(2);const v=viruses.find(e=>e.variant==='packet');viruses=[v];components.forEach(c=>c.repaired=true);
  player.x=v.x-170;player.y=v.y-24;v.direction=-1;v.attackWindup=.7;v.windupTotal=.7;v.action='shot';v.aimX=player.x+17;v.aimY=player.y+24;v.attackCooldownTimer=3;
  const shot=()=>({x:v.x-30,y:v.y,vx:100,life:1,radius:4,damage:1});projectiles=[shot(),shot()];const hp=v.hp;
  updateCombat(1/60);assert(v.intercepted&&v.stolenShot&&projectiles.length===1&&v.hp===hp,'did not capture exactly one shot');
  projectiles=[];enemyProjectiles=[];for(let i=0;i<45;i++)updateCombat(1/60);assert(enemyProjectiles.some(s=>s.damage===v.damage+2),'stolen shot not returned after warning');
});
test('enemies: defeats grant XP exactly once and minions have safe capped spawns',()=>{
  setup(0);const v=viruses[0],old=xp;v.hp=1;damageVirus(v,1e3);assert(!v.alive&&xp===old+v.xp,'XP reward changed');
  const earned=xp;damageVirus(v,100);assert(xp===earned,'duplicate death XP');
  setup(2);const p=viruses.find(v=>v.type==='parasite');viruses=[p];
  for(let i=0;i<12;i++)spawnEnemyMinion(p);
  const minions=viruses.filter(v=>v.summonedBy===p.id);assert(minions.length>0&&minions.length<=2,'active summon cap');
  minions.forEach(m=>assert(ByteRunner.enemies.lane(m,solids()),'summon without support'));
  for(let i=0;i<12;i++){viruses.filter(v=>v.summonedBy===p.id).forEach(v=>v.alive=false);spawnEnemyMinion(p);}
  assert(p.totalSummons===4,'lifetime cap not enforced by real spawn');
});
test('enemies: moving supports carry enemies and disappearing floors cause a safe fall',()=>{
  const h=enemyHarness('basic');h.c.playerY=200;h.c.shapes[0].type='moving';h.tick();
  const old=h.e.x;h.c.shapes[0].x+=40;h.c.shapes[0].y-=20;h.tick();
  assert(h.e.x>old+38&&Math.abs(h.e.baseY-356)<.1,'enemy not carried by moving support');
  h.c.shapes=[{id:'lower',x:80,y:600,w:700,h:30,collision:'solid'}];
  h.tick(10);assert(h.e.y>356&&h.e.animationState==='fall','enemy hovered after floor disappeared');
  h.tick(60);assert(Math.abs(h.e.baseY-576)<.1,'enemy failed to land on lower floor');
});
test('enemies: infection slows actual repair and Wi-Fi hits briefly slow movement',()=>{
  setup(2);const c=components[0];player.x=c.x;player.y=c.y-4;keys.add('e');
  updateRepair(.2);const normal=repairSession.progress;cancelRepair();c.infected=true;updateRepair(.2);
  assert(repairSession.progress<normal&&repairSession.progress>0,'infection does not affect actual repair');cancelRepair();keys.clear();
  setup(4);damageCooldown=0;player.shieldTime=0;
  enemyProjectiles=[{x:player.x+17,y:player.y+24,vx:0,vy:0,life:1,radius:6,damage:6,ownerX:player.x-100,slowOnHit:.7}];
  updateHostileProjectiles(.01);assert(player.interferenceTime>0&&player.health<100,'Wi-Fi hit did not apply interference');
  keys.add('d');movePlayer(.016);assert(player.vx<RUN_SPEED&&player.vx>RUN_SPEED*.6,'interference not applied to movement');
  for(let i=0;i<50;i++)movePlayer(.016);assert(player.interferenceTime===0,'interference did not expire');
  player.interferenceTime=1;respawnAtCheckpoint();assert(!player.interferenceTime,'interference survived checkpoint');
});
test('enemies: summon limits and file fork survive campaign resume',()=>{
  setup(2);const p=viruses.find(v=>v.type==='parasite');p.totalSummons=4;p.minionSerial=4;saveCampaign();continueCampaign();
  const restored=viruses.find(v=>v.id===p.id);assert(restored.totalSummons===4&&!spawnEnemyMinion(restored),'resume reset summon limit');
  setup(1);const file=viruses.find(v=>v.variant==='file');file.forked=true;file.hp=1;saveCampaign();continueCampaign();
  assert(viruses.find(v=>v.id===file.id).forked,'resume reset file fork');
});
test('enemies: VIRUS ZERO interleaves final charges and warns before summoning',()=>{
  setup(9);components.forEach(c=>c.repaired=true);const b=viruses.find(e=>e.multiStage);
  b.hp=b.maxHp*.2;b.bossStage=3;b.bossCycleCooldown=0;b.bossPatternIndex=1;b.specialCooldownTimer=0;b.bossPhaseTransitionTime=0;
  player.x=b.x-200;player.y=bossGroundY(b)-48;const count=viruses.length;
  updateVirusZero(b,.016,player.x+17,player.y+24);
  assert(b.bossAttackKind==='charge'&&b.attackWindup>=.79,'final charge not interleaved');
  assert(b.summonWindup>=.89&&viruses.length===count,'summon without warning');
  updateVirusZero(b,.5,player.x+17,player.y+24);assert(viruses.length===count,'summon occurred before warning ended');
  updateVirusZero(b,.41,player.x+17,player.y+24);assert(viruses.length===count+1,'announced boss summon failed');
});
test('enemies: synthesized attack sounds use distinct oscillator settings',()=>{
  const previous=audioContext,enabled=soundEnabled,frequencies=[];
  audioContext={state:'running',currentTime:0,destination:{},createOscillator:()=>({frequency:{setValueAtTime:f=>frequencies.push(f),exponentialRampToValueAtTime:()=>{}},connect:()=>{},start:()=>{},stop:()=>{}}),
    createGain:()=>({gain:{setValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}},connect:()=>{}})};
  soundEnabled=true;
  try {
    ['enemyDash','enemyShot','enemyStrike','enemyDive','enemySummon','dnsEcho','enemyDeath','bossTransition'].forEach(playSound);
    assert(frequencies.length===8&&new Set(frequencies).size===8,'enemy sounds not distinct or not generated');
  }finally{audioContext=previous;soundEnabled=enabled;}
});
test('enemies: attack and death visual states render in the real canvas',()=>{
  setup(9);cameraX=420;cameraY=Math.max(0,mapStart().y-height*.65);viruses=[];
  const types=['basic','fast','armored','flyer','shooter','parasite'];
  types.forEach((type,i)=>{
    const h=enemyHarness(type,['file',null,'firewall','wifi','dns',null][i]),e=h.e;
    Object.assign(e,{id:'preview-'+type,x:cameraX+70+i*(width-140)/5,y:mapStart().y+24,baseY:mapStart().y+24,attackWindup:.45,windupTotal:.8,
      aimX:player.x+17,aimY:player.y+24,attackDirection:1,animationState:'prepare',action:type==='shooter'?'shot':type==='fast'?'dash':type==='flyer'?'dive':'melee'});
    viruses.push(e);
  });
  draw();report.snapshots.push({phase:10,position:'enemy-preparations',image:canvas.toDataURL()});
  viruses.forEach((e,i)=>{e.attackWindup=0;e.hitFlash=i%2?.1:0;e.vulnerableTime=i%2?0:1;e.animationState='chase';});
  draw();report.snapshots.push({phase:10,position:'enemy-hit-recovery',image:canvas.toDataURL()});
  viruses.forEach(e=>{e.alive=false;e.deathAt=animationTime-.2;});draw();
  report.snapshots.push({phase:10,position:'enemy-deaths',image:canvas.toDataURL()});
});
