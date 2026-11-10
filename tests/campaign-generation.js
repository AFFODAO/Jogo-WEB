const campaignCanonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
test('hybrid campaign: ten independent recipes reproduce without shared source state',()=>{
  const seeds=new Set(),generators=new Set();
  for(const phase of PHASES) {
    const metadata=phase.generation;
    assert(metadata&&phase.revision===(['phase-01','phase-02','phase-03','phase-04','phase-05','phase-06','phase-07','phase-08'].includes(phase.id)?5:3),'hybrid generation not active '+phase.id);
    seeds.add(metadata.seed);generators.add(metadata.recipe.rooms.find(r=>r.generator).generator);
    const recipe=ByteRunner.maps.clone(metadata.recipe),before=JSON.stringify(recipe);
    const a=ByteRunner.mapGeneration.compile(recipe),b=ByteRunner.mapGeneration.compile(JSON.parse(before));
    assert(campaignCanonical(a)===campaignCanonical(b)&&JSON.stringify(recipe)===before,'recipe is not reproducible/pure');
    const entities=JSON.parse(JSON.stringify(a.entities).replaceAll('world:',''));
    assert(campaignCanonical(entities)===campaignCanonical(phase.entities),'replay differs from campaign');
    assert(!ByteRunner.maps.validate(phase).length,'invalid map');
    if(phase.id==='phase-01'){
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'Hardware V3 objective replay differs');
      assert(metadata.rooms.length===22&&metadata.architecture.optionalRooms.length===4,'Hardware V3 room network missing');
    }else if(phase.id==='phase-02'){
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'Software V3 objective replay differs');
      assert(metadata.rooms.length===19&&metadata.architecture.optionalRooms.length===4&&recipe.connectivity==='portal-network','Software V3 constellation missing');
    }else if(phase.id==='phase-03'){
      assert(metadata.rooms.length===25&&metadata.architecture.optionalRooms.length===4&&metadata.links.length===36,'Switch radial network');
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'Switch objective replay differs');
    }else if(phase.id==='phase-04'){
      assert(metadata.rooms.length===27&&metadata.architecture.optionalRooms.length===3&&metadata.links.length===38,'Router tunnel maze');
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'Router objective replay');
    }else if(phase.id==='phase-05'){
      assert(metadata.rooms.length===27&&metadata.architecture.optionalRooms.length===4&&metadata.links.length===37,'Wifi twin masts');
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'Wifi objective replay');
    }else if(phase.id==='phase-06'){
      assert(metadata.rooms.length===41&&metadata.architecture.optionalRooms.length===4&&metadata.links.length===66,'Cabling industrial floors');
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'Cabling objective replay');
    }else if(phase.id==='phase-07'){
      assert(metadata.rooms.length===25&&metadata.architecture.optionalRooms.length===4&&metadata.links.length===35,'DHCP digital city');
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'DHCP objective replay');
    }else if(phase.id==='phase-08'){
      assert(metadata.rooms.length===33&&metadata.architecture.portalEdges.length===24&&metadata.architecture.optionalEnemies.length===4,'DNS domains and optional risk');
      assert(campaignCanonical(a.objectives)===campaignCanonical(phase.objectives),'DNS objective replay');
    }else{
      const original=recipe.rooms[0].config.blueprint;
      assert(campaignCanonical(original.objectives)===campaignCanonical(phase.objectives),'objective contract changed');
      for(const group of ['components','enemies','collectibles','interactives'])assert(campaignCanonical(original.entities[group])===campaignCanonical(phase.entities[group]),'entity content/order changed');
    }
    for(const route of metadata.architecture.routes||[]) {
      const steps=phase.entities.platforms.filter(p=>p.id.startsWith(route.id+'-'));
      assert(steps.length===route.points.length,'service route missing');
      for(let i=1;i<steps.length;i++)assert(Math.abs(steps[i].y-steps[i-1].y)<=ByteRunner.platformPhysics.jumpHeight*.82,'route requires optional jump skill');
    }
  }
  assert(seeds.size===10&&generators.size===10,'shared theme configuration');
});
test('hybrid campaign: architectures carry different traversal mechanics',()=>{
  const [pcb,desktop,backplane,router,radio]=PHASES;
  assert(pcb.layers.some(l=>l.items?.some(i=>i.kind==='cpu'))&&pcb.layers.some(l=>l.items?.some(i=>i.kind==='ram'))&&pcb.layers.some(l=>l.items?.some(i=>i.kind==='gpu')),'motherboard regions missing');
  assert(desktop.map.layout==='hub'&&desktop.generation.rooms.length===19&&desktop.mechanics.filter(m=>m.type==='portals').reduce((n,m)=>n+m.links.length,0)>=50,'directory graph missing');
  assert(backplane.entities.interactives.length>=2&&backplane.entities.platforms.some(p=>p.id==='hub-north:transmission-lift'),'backplane transmission missing');
  assert(router.map.layout==='maze'&&router.mechanics.some(m=>m.type==='portals'&&m.links.some(l=>l.requires)),'repair shortcuts missing');
  assert(radio.map.height>radio.map.width&&radio.mechanics.some(m=>m.type==='environment')&&radio.entities.platforms.some(p=>p.type==='temporary'),'radio vertical/unstable architecture missing');
});
test('hybrid campaign: transmission elevator carries R-07 with base attributes',()=>{
  setup(2);const lift=phaseData.entities.platforms.find(p=>p.id==='hub-north:transmission-lift');
  advancePlatformMotion(.1);const shape=platformShape(lift);player.x=shape.x+30;player.y=shape.y-player.height;player.grounded=true;
  const y=player.y;advancePlatformMotion(.1);assert(player.y!==y,'transmission elevator did not carry R-07');
});
running=false;
