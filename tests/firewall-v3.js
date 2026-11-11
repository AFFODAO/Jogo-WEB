const firewallGuards = condition => condition.all
  ? condition.all.flatMap(firewallGuards)
  : [condition.component];

function firewallReach() {
  Object.assign(player,mapStart(),{vy:0,grounded:true});
  return reachability();
}


test('Firewall V3: setor, escotilha e retorno com salto básico',()=>{
  setup(8);
  const gates=phaseData.entities.gates.filter(g=>g.id.includes('-hatch-'));
  const regionOf=n=>phaseData.map.regions.findIndex(r=>n.y>=r.areas[0].y&&n.y<r.areas[0].y+r.areas[0].height-80);
  const reachedRegions=()=>new Set(firewallReach().map(regionOf).filter(i=>i>=0)).size;
  assert(reachedRegions()===1,'setor superior acessível sem reparos');
  for(let i=1;i<=5;i++){
    const sectorGates=gates.filter(g=>g.id.startsWith('sector-'+i+'-'));
    const closed=new Set(solids().map(s=>s.id));
    assert(sectorGates.every(g=>closed.has(g.id)),'escotilha aberta cedo no setor '+i);
    for(const id of sectorGates.flatMap(g=>firewallGuards(g.opensWhen)))components.find(c=>c.id===id).repaired=true;
    const open=new Set(solids().map(s=>s.id));
    assert(sectorGates.every(g=>!open.has(g.id)),'escotilha fechada após reparo no setor '+i);
    assert(reachedRegions()===i+1,'progressão física interrompida ou antecipada no setor '+i);
  }
  for(const gate of gates){
    const start={x:gate.x-38,y:gate.y-player.height};
    Object.assign(player,start,{vy:0,grounded:true});
    assert(reachability().some(n=>n.y===gate.y+480-player.height),'sem retorno pelo setor de '+gate.id);
  }
});

test('Firewall V3: atalhos, plataformas e checkpoints',()=>{
  setup(8);
  assert(levelRuntime.connections().length===0,'atalho começa desbloqueado');
  components.find(c=>c.id==='c06').repaired=true;
  assert(levelRuntime.connections().length===2,'atalhos de duto indisponíveis');
  for(const link of levelRuntime.connections()){
    Object.assign(player,{x:link.x,y:link.y+link.height-player.height});
    const use=keys=>levelRuntime.update(.6,{keys,repairNearby:false});
    use(new Set());use(new Set(['e']));use(new Set(['e']));
    assert(player.x===link.to.x&&player.y===link.to.y,'destino instável '+link.id);
    assert(solids().some(s=>s.y===player.y+player.height&&player.x>=s.x&&player.x+player.width<=s.x+s.w),'destino sem apoio');
  }
  for(const point of phaseData.map.checkpoints){
    const center=point.x+player.width/2;
    assert(phaseData.entities.enemies.every(e=>Math.abs(point.y-e.groundY)>200||center<e.activationRegion.x-24||center>e.activationRegion.x+e.activationRegion.width+24),'checkpoint ativa inimigos');
    assert(phaseData.mechanics.find(m=>m.type==='security-grid').cameras.every(({region:r})=>point.y<=r.y||point.y-48>=r.y+r.height||center<r.x||center>r.x+r.width),'checkpoint sob vigilância');
  }
  for(const platform of phaseData.entities.platforms.filter(p=>p.type==='moving')){
    advancePlatformMotion(.2);const before=platformShape(platform);
    Object.assign(player,{x:before.x+16,y:before.y-player.height,grounded:true});
    advancePlatformMotion(.3);const after=platformShape(platform);
    assert((after.x!==before.x||after.y!==before.y)&&Math.abs(player.x-after.x-16)<.01&&Math.abs(player.y-after.y+player.height)<.01,'plataforma não transportou o jogador '+platform.id);
  }
});

test('Firewall V3: núcleo exige terminal, ACL e guardiões',()=>{
  setup(8);
  components.forEach(c=>c.repaired=c.id!=='c08');
  const acl=phaseData.entities.interactives[0];
  const use=()=>{
    Object.assign(player,{x:acl.x,y:acl.y+acl.height-player.height});
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});
    levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});
  };
  use();assert(!levelRuntime.getFlag('rules-on'),'ACL disponível antes da restauração');
  components.find(c=>c.id==='c08').repaired=true;
  use();assert(levelRuntime.getFlag('rules-on'),'ACL não confirmou restauração');
  checkObjectives();assert(!phaseExitUnlocked,'saída ignora combate');
  viruses.forEach(v=>v.alive=false);
  checkObjectives();assert(phaseExitUnlocked,'objetivos completos não liberam saída');
});

test('Firewall V3: mede área útil alcançável contra a revisão anterior',()=>{
  setup(8);
  function measure(){
    components.forEach(c=>c.repaired=true);
    levelRuntime.setFlag('rules-on',true);
    const nodes=firewallReach();
    return {surfaces:nodes.length,areaPx2:Math.round(reachableNavigationArea(nodes))};
  }
  const rebuilt=measure();
  loadMap(FIREWALL_BASELINE,true);
  const baseline=measure();
  report.firewallArea={baseline,rebuilt,ratio:rebuilt.areaPx2/baseline.areaPx2};
  assert(report.firewallArea.ratio>=3&&report.firewallArea.ratio<=5,'área alcançável fora da meta');
});
