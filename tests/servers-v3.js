function serversReach() {
  Object.assign(player,mapStart(),{vy:0,grounded:true});
  return reachability();
}

test('Servers V3: mede área útil alcançável contra a revisão anterior',()=>{
  setup(9);
  function measure() {
    components.forEach(c=>c.repaired=true);
    const nodes=serversReach();
    return {surfaces:nodes.length,areaPx2:Math.round(reachableNavigationArea(nodes))};
  }
  const rebuilt=measure();
  loadMap(SERVERS_BASELINE,true);
  const baseline=measure();
  report.serversArea={baseline,rebuilt,ratio:rebuilt.areaPx2/baseline.areaPx2};
  assert(report.serversArea.ratio>=3&&report.serversArea.ratio<=5,'área alcançável fora da meta');
});

test('Servers V3: escotilhas independentes e arena selada até o último reparo',()=>{
  setup(9);
  const map=phaseData.map, gates=phaseData.entities.gates;
  const solidIds=()=>new Set(solids().map(s=>s.id));
  assert(!serversReach().some(n=>n.id?.startsWith('towers-floor')),'torres disponíveis antes do reparo de entrada');
  for(const gate of gates.filter(g=>g.id.endsWith('-0')||g.id.endsWith('-1'))){
    assert(solidIds().has(gate.id),'escotilha sem bloqueio inicial '+gate.id);
    const repair=components.find(c=>c.id===gate.opensWhen.component);
    repair.repaired=true;
    assert(!solidIds().has(gate.id),'escotilha fechada após reparo '+gate.id);
    repair.repaired=false;
  }
  components.forEach(c=>c.repaired=c.id!=='c04');
  const arenaReachable=()=>serversReach().some(n=>n.id==='virus-zero-arena');
  assert(!arenaReachable(),'acesso físico à arena antes do último reparo');
  unlockedSkills=[{id:'boost',level:5}];restoreSkillEffects();
  Object.assign(player,{x:4708,y:990-player.height,vy:0,grounded:true});
  jumpQueued=true;keys.add('d');
  for(let i=0;i<85;i++){
    movePlayer(1/60);
    assert(player.x+player.width<=4770.01,'propulsores ultrapassaram a escotilha fechada');
  }
  keys.clear();unlockedSkills=[];restoreSkillEffects();
  components.find(c=>c.id==='c04').repaired=true;
  assert(arenaReachable(),'arena inacessível após os reparos');
  assert(map.regions.length===7,'regiões do data center incompletas');
});

test('Servers V3: cofres, atalhos e recuperação da antecâmara',()=>{
  setup(9);
  assert(levelRuntime.connections().length===0,'atalhos ativos na entrada');
  components.forEach(c=>c.repaired=true);
  assert(levelRuntime.connections().length===10,'ligação de manutenção indisponível');
  for(const link of levelRuntime.connections()){
    Object.assign(player,{x:link.x,y:link.y+link.height-player.height});
    const use=keys=>levelRuntime.update(.6,{keys,repairNearby:false});
    use(new Set());use(new Set(['e']));use(new Set(['e']));
    assert(player.x===link.to.x&&player.y===link.to.y,'destino ou repetição incorreta '+link.id);
    assert(solids().some(s=>s.y===player.y+player.height&&player.x>=s.x&&player.x+player.width<=s.x+s.w),'destino sem apoio '+link.id);
  }
  const safe=phaseData.map.checkpoints.find(p=>p.x===4450&&p.y===1170);
  assert(safe,'checkpoint da antecâmara ausente');
  assert(viruses.every(v=>!v.activationRegion||safe.y<=v.activationRegion.y||safe.y-48>=v.activationRegion.y+v.activationRegion.height||safe.x+72<=v.activationRegion.x||safe.x+38>=v.activationRegion.x+v.activationRegion.width),'antecâmara sob ativação inimiga');
  Object.assign(player,{x:safe.x,y:safe.y-player.height});
  updateCheckpoints();damageCooldown=0;player.health=1;damagePlayer(20,{x:0});
  assert(player.x===safe.x+38&&player.y===safe.y-player.height,'respawn fora da baia da antecâmara');
  assert(components.every(c=>c.repaired),'respawn da antecâmara perdeu reparos');
});

test('Servers V3: VIRUS ZERO conserva proteção, limiares e vitória',()=>{
  setup(9);endPhaseIntro();xpRequired=999999;
  const boss=viruses.find(v=>v.multiStage);
  const hp=boss.hp;
  damageVirus(boss,1000);
  assert(boss.hp===hp,'escudo do núcleo ignorado');
  components.forEach(c=>c.repaired=true);
  viruses.filter(v=>v!==boss).forEach(v=>v.alive=false);
  Object.assign(player,{x:boss.x-180,y:bossGroundY(boss)-player.height});
  damageVirus(boss,1000);
  assert(boss.alive&&Math.abs(boss.hp-boss.maxHp*.67)<.01,'primeiro limiar ignorado');
  updateVirusZero(boss,1/60,player.x+17,player.y+24);
  assert(boss.bossStage===2&&boss.bossPhaseTransitionTime>0,'segunda fase sem transição');
  damageVirus(boss,1000);
  assert(Math.abs(boss.hp-boss.maxHp*.67)<.01,'dano durante transição');
  for(let i=0;i<55;i++)updateVirusZero(boss,1/60,player.x+17,player.y+24);
  damageVirus(boss,1000);
  updateVirusZero(boss,1/60,player.x+17,player.y+24);
  assert(boss.alive&&boss.bossStage===3,'terceira fase ignorada');
  for(let i=0;i<55;i++)updateVirusZero(boss,1/60,player.x+17,player.y+24);
  damageVirus(boss,1000);
  update(1/60);
  assert(!boss.alive&&phaseQuestionOpen&&!campaignComplete,'vitória pulou a pergunta final');
  ui.questionOverlay.querySelector('[data-correct="true"]').click();
  ui.questionOverlay.querySelector('.question-action').click();
  assert(campaignComplete&&getSavedCampaign().campaignComplete,'final da campanha não persistiu');
});

test('Servers V3: apoios temporários reaparecem e elevadores carregam o jogador',()=>{
  setup(9);endPhaseIntro();
  for(const spec of phaseData.entities.platforms.filter(p=>p.type==='temporary')){
    getPlatformState(spec).triggered=true;
    for(let t=0;t<Math.ceil((spec.duration+.1)*60);t++)update(1/60);
    assert(!platformShape(spec),'apoio não desapareceu '+spec.id);
    for(let t=0;t<Math.ceil((spec.respawnDelay+.1)*60);t++)update(1/60);
    assert(platformShape(spec),'apoio não retornou '+spec.id);
  }
  components.forEach(c=>c.repaired=true);
  for(const spec of phaseData.entities.platforms.filter(p=>p.type==='moving')){
    advancePlatformMotion(.1);
    const before=platformShape(spec);
    Object.assign(player,{x:before.x+16,y:before.y-player.height,grounded:true});
    advancePlatformMotion(.2);
    const after=platformShape(spec);
    assert(after.x!==before.x||after.y!==before.y,'apoio estático '+spec.id);
    assert(Math.abs(player.x-after.x-16)<.01&&Math.abs(player.y-after.y+player.height)<.01,'apoio não carregou '+spec.id);
  }
});

setup(9);
await levelVisuals.ready;
test('Servers V3: custo local de update e draw e caches limitados',()=>{
  endPhaseIntro();xpRequired=999999;
  components.forEach(c=>c.repaired=true);
  const samples=[];
  for(const [x,y] of [[128,4200],[2750,2280],[5480,900]]){
    Object.assign(player,{x,y:y-player.height,vy:0,grounded:true});
    for(let i=0;i<90;i++){
      const start=performance.now();
      update(1/60);
      cameraX=Math.max(0,Math.min(worldWidth()-width,x-width*.45));
      cameraY=Math.max(0,Math.min(worldHeight()-height,y-height*.78));
      draw();
      if(i>=30)samples.push(performance.now()-start);
    }
  }
  const values=samples.sort((a,b)=>a-b);
  const p95=values[Math.floor(values.length*.95)];
  const cacheSize=levelVisuals.terrain.cacheSize, parallaxBytes=levelVisuals.parallax.stats.totalBytes;
  report.serversPerformance={viewport:[width,height],samples:values.length,p50Ms:values[Math.floor(values.length*.5)],p95Ms:p95,cacheSize,parallaxBytes};
  assert(cacheSize>0&&cacheSize<=96&&parallaxBytes>0&&parallaxBytes<=4*1024*1024,'caches ausentes ou acima do limite local');
  assert(p95<=16.7,'p95 excedeu orçamento local de 60 Hz');
});
