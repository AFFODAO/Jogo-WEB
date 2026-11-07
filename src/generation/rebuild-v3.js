// Opt-in authoring contracts. Never registers maps or changes the campaign.
(() => {
  'use strict';
  const api=window.ByteRunner,ns=api.mapGeneration,P=api.platformPhysics;
  const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
  const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  const rows=[
    ['hardware',874140.81,'espinha com quatro braços escalonados','CPU|RAM|GPU|barramentos',4],
    ['software',752881.57,'janelas encaixadas ao redor de um núcleo vazio','desktop|processos|arquivos|scheduler',5],
    ['switch',902666.32,'backplane central com galerias de portas paralelas','backplane|portas A|portas B|uplink',4],
    ['router',1204002.43,'duas malhas laterais ligadas por anéis de trânsito','LAN|trânsito|WAN|redundância',5],
    ['wifi',1000871.19,'arquipélago vertical com duas torres assimétricas','associação|antenas|repetidores|uplink',7],
    ['cabling',1972902,'três shafts com travessias em alturas alternadas','subsolo|dutos|manutenção|cobertura',8],
    ['dhcp',948567.68,'hub distribuidor e três bairros em terraços','distribuidor|reservas|APIPA|relay',5],
    ['dns',2000615.62,'árvore de domínios com retorno recursivo lateral','raiz|domínios|subdomínios|cache',6],
    ['firewall',1576519.62,'fortaleza em muralhas concêntricas abertas','perímetro|bastiões|anel interno|cidadela',6],
    ['servers',2315941.73,'racks bifurcados e backbone até arena isolada','racks|fibra|backbone|airlock|VIRUS ZERO',6]
  ];
  const catalog=freeze(rows.map(([theme,baseline,silhouette,regions,floors],i)=>({
    phase:i+1,theme,seed:'byte-runner-v3-'+theme,minimumRevision:5,silhouette,regions:regions.split('|'),floors,
    area:{baselineCandidatePixels:baseline,targetCandidatePixels:[Math.ceil(baseline*3),Math.ceil(baseline*5)],status:'planning-proxy-not-reachable-area'},
    duration:{targetMinutes:[15,25],measuredMinutes:null},roomBudget:[24,40],
    requiredRoles:['entry','exploration','combat','parkour','repair','checkpoint','alternative','shortcut','secret','optional','exit'],
    presentation:{...ns.config.materials[theme],pixelScale:2,parallax:'existing-multilayer',lighting:'discreet',regionBlendPixels:512}
  })));
  const capabilities=freeze({moving:'platform:moving',elevator:'platform:moving/axis:y',temporary:'platform:temporary/respawnDelay',trap:'platform:falling',laser:'parkour-hazards:laser',electric:'parkour-hazards:electric',repairDoor:'gate:opensWhen/component',environment:'environment:zones'});
  const blueprints=freeze(catalog.map(p=>{
    const rooms=[],links=[],mainPath=[],repairs=[];
    for(let i=0;i<p.regions.length;i++){
      const id=role=>p.theme+'-'+i+'-'+role;
      const roles=['checkpoint','exploration','combat','repair','parkour','junction','secret','optional'];
      for(const role of roles)rooms.push({id:id(role),region:p.regions[i],role,source:['exploration','secret','optional'].includes(role)?'procedural':'manual',required:!['secret','optional'].includes(role)});
      const path=roles.slice(0,6).map(id);mainPath.push(...path);
      for(let j=1;j<path.length;j++)links.push({from:path[j-1],to:path[j],kind:'main'});
      links.push({from:id('exploration'),to:id('secret'),kind:'secret'},{from:id('junction'),to:id('optional'),kind:'optional'},
        {from:id('exploration'),to:id('parkour'),kind:'alternative'},
        {from:id('junction'),to:id('checkpoint'),kind:'shortcut',requires:[id('relay')]});
      repairs.push({id:id('relay'),room:id('repair'),requires:[]});
      if(i)links.push({from:p.theme+'-'+(i-1)+'-junction',to:id('checkpoint'),kind:'main'});
    }
    const cross={hardware:[[0,2],[0,3]],software:[[0,2],[1,3]],switch:[[0,2],[0,3],[1,3]],router:[[0,3]],wifi:[[1,3]],cabling:[[0,2],[1,3],[0,3]],dhcp:[[0,2],[0,3],[0,1]],dns:[[0,2],[0,3],[1,3]],firewall:[[0,2]],servers:[[0,2],[1,3]]}[p.theme];
    for(const [a,b] of cross)links.push({from:p.theme+'-'+a+'-junction',to:p.theme+'-'+b+'-exploration',kind:'regional-alternative'});
    return {theme:p.theme,seed:p.seed,planningOnly:true,silhouette:p.silhouette,plannedFloors:p.floors,rooms,links,repairs,mainPath,start:mainPath[0],exit:mainPath.at(-1),
      placementStatus:'manual thematic footprint required; no geometry or duration claim'};
  }));
  // Offline sweep; never called in the draw/update loop. Overlapping bands count once.
  function navigationArea(nodes,shapes,width,height){
    const clip=r=>({x:Math.max(0,r.x),y:Math.max(0,r.y),width:Math.max(0,Math.min(width,r.x+r.width)-Math.max(0,r.x)),height:Math.max(0,Math.min(height,r.y+r.height)-Math.max(0,r.y))});
    const solids=shapes.map(s=>clip({x:s.x,y:s.y,width:s.w,height:s.h}));
    const bands=nodes.map(n=>clip({x:n.a,y:n.y-P.jumpHeight,width:n.z-n.a+P.base.width,height:P.base.height+P.jumpHeight}));
    const union=rects=>{
      const xs=[...new Set(rects.flatMap(r=>[r.x,r.x+r.width]))].sort((a,b)=>a-b);let area=0;
      for(let i=1;i<xs.length;i++){
        const intervals=rects.filter(r=>r.width>0&&r.height>0&&r.x<xs[i]&&r.x+r.width>xs[i-1]).map(r=>[r.y,r.y+r.height]).sort((a,b)=>a[0]-b[0]);
        let length=0,end=-Infinity;
        for(const [a,b] of intervals){length+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}
        area+=(xs[i]-xs[i-1])*length;
      }
      return area;
    };
    return union([...solids,...bands])-union(solids);
  }

  // Progression contracts deliberately allow only monotone repair prerequisites.
  // Conditions involving flags/enemies remain runtime mechanics, never implicit keys.
  function validateContract(c){
    const errors=[];
    if(!c||!Array.isArray(c.rooms)||!Array.isArray(c.links)||!Array.isArray(c.repairs)||!Array.isArray(c.objectives))return ['invalid architecture contract'];
    const rooms=new Map(),repairs=new Map();
    for(const r of c.rooms){
      if(!r.id||rooms.has(r.id))errors.push('duplicate/invalid room');
      if(![r.x,r.y,r.width,r.height].every(Number.isSafeInteger)||r.x<0||r.y<0||r.width<=0||r.height<=0)errors.push('invalid room bounds: '+r.id);
      if(!['manual','procedural'].includes(r.source))errors.push('missing room source: '+r.id);
      for(const p of rooms.values())if(overlap(r,p))errors.push('room overlap: '+r.id+'/'+p.id);
      rooms.set(r.id,r);
    }
    if(!rooms.has(c.start)||!rooms.has(c.exit))errors.push('unknown start/exit');
    if(!(typeof c.seed==='string'||Number.isSafeInteger(c.seed)))errors.push('explicit seed required');
    for(const r of c.repairs){if(!r.id||repairs.has(r.id)||!rooms.has(r.room))errors.push('invalid repair: '+r.id);repairs.set(r.id,r);}
    const requirements=(r,label)=>{
      if(r!==undefined&&(!Array.isArray(r)||r.some(id=>!repairs.has(id))))errors.push('unknown repair prerequisite: '+label);
    };
    for(const r of c.repairs)requirements(r.requires,r.id);
    for(const e of c.links){if(!rooms.has(e.from)||!rooms.has(e.to)||e.from===e.to)errors.push('invalid link');requirements(e.requires,e.from);}
    for(const o of c.objectives){if(!o.id||!rooms.has(o.room))errors.push('invalid objective');requirements(o.requires,o.id);}
    if(errors.length)return [...new Set(errors)];
    const visiting=new Set(),done=new Set();
    const visit=id=>{if(visiting.has(id)){errors.push('circular repairs: '+id);return;}if(done.has(id))return;visiting.add(id);for(const dep of repairs.get(id)?.requires||[])if(repairs.has(dep))visit(dep);visiting.delete(id);done.add(id);};
    for(const id of repairs.keys())visit(id);
    const unlocked=new Set(),reached=new Set([c.start]),has=r=>(r||[]).every(id=>unlocked.has(id));
    let changed=true;
    while(changed){changed=false;
      for(const e of c.links)if(has(e.requires)){
        if(reached.has(e.from)&&!reached.has(e.to)){reached.add(e.to);changed=true;}
        if(!e.oneWay&&reached.has(e.to)&&!reached.has(e.from)){reached.add(e.from);changed=true;}
      }
      for(const r of c.repairs)if(reached.has(r.room)&&has(r.requires)&&!unlocked.has(r.id)){unlocked.add(r.id);changed=true;}
    }
    for(const r of c.rooms)if(!reached.has(r.id))errors.push('unreachable room: '+r.id);
    for(const r of c.repairs)if(!unlocked.has(r.id))errors.push('unreachable repair: '+r.id);
    for(const o of c.objectives)if(o.required!==false&&(!reached.has(o.room)||!has(o.requires)))errors.push('unreachable objective: '+o.id);
    if(!reached.has(c.exit))errors.push('unreachable exit');
    return [...new Set(errors)];
  }

  function validateGeometry(phase,certificate){
    const errors=ns.validation.definition(phase),entities=phase.entities;
    const permanent=[...phase.map.ground.segments,...entities.platforms.filter(p=>(p.type||'fixed')==='fixed')].filter(p=>!p.requires&&!p.requiresComponentId);
    const hazards=(phase.mechanics||[]).filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards);
    const blockers=[...entities.obstacles,...entities.gates];
    const safe=(x,y,label)=>{
      const body={x,y:y-P.base.height,width:P.base.width,height:P.base.height};
      if(!permanent.some(s=>s.y===y&&s.x<=x&&s.x+s.width>=x+body.width)||body.y<0||x<0||x+body.width>phase.map.width)errors.push('unsafe support: '+label);
      if([...blockers,...hazards].some(s=>overlap(body,s)))errors.push('unsafe respawn: '+label);
    };
    safe(phase.map.start.x,phase.map.start.y+P.base.height,'start');
    phase.map.checkpoints.forEach((c,i)=>{safe(c.x+38,c.y,'checkpoint-'+i);safe(c.x,c.y,'checkpoint-trigger-'+i);});
    const surfaces=new Map(permanent.map(s=>[s.id,s]));
    if(!certificate||!Array.isArray(certificate.jumps)||!Array.isArray(certificate.landings))errors.push('missing traversal certificate');
    for(const jump of certificate?.jumps||[]){
      if(!certificate.landings.some(l=>l.surface===jump.to))errors.push('missing landing view: '+jump.to);
      const a=surfaces.get(jump.from),b=surfaces.get(jump.to);
      if(!a||!b||!P.canReach(a,b))errors.push('impossible base jump: '+jump.from+'/'+jump.to);
      else {
        const shapes=[...permanent,...blockers].map(s=>({...s,w:s.width,h:s.height}));
        const source=api.mapAudit.surfaces(shapes,phase.map.width).filter(n=>Math.abs(n.y+P.base.height-a.y)<1&&n.a<a.x+a.width&&n.z>=a.x);
        const target=api.mapAudit.surfaces(shapes,phase.map.width).filter(n=>Math.abs(n.y+P.base.height-b.y)<1&&n.a<b.x+b.width&&n.z>=b.x);
        if(!source.some(s=>target.some(t=>api.mapAudit.edge(s,t,shapes,phase.map))))errors.push('blocked simulated jump: '+jump.from+'/'+jump.to);
      }
    }
    for(const landing of certificate?.landings||[]){
      const s=surfaces.get(landing.surface),v=landing.view;
      if(!s||!v||![v.x,v.y,v.width,v.height].every(Number.isFinite)||v.width<=0||v.height<=0||s.x<v.x||s.x+s.width>v.x+v.width||s.y-P.base.height<v.y||s.y>v.y+v.height)errors.push('blind landing: '+landing.surface);
    }
    for(const p of entities.platforms){
      if(p.type==='falling'&&(!(p.duration>=.6)||!(p.respawnDelay>0)||!(p.dropDistance>0)))errors.push('unsafe falling: '+p.id);
      if(p.type==='temporary'&&(!(p.duration>P.flightTime+.4)||!(p.respawnDelay>0)))errors.push('unsafe temporary: '+p.id);
      if(p.type==='moving'){
        const m=p.motion;
        if(!m||!['x','y'].includes(m.axis)||!Number.isFinite(m.range)||m.range<0||!Number.isFinite(m.speed)||m.speed<=0||m.range*m.speed>P.base.speed*.6)errors.push('unsafe moving: '+p.id);
        else {const box={x:p.x-(m.axis==='x'?m.range:0),y:p.y-(m.axis==='y'?m.range:0),width:p.width+(m.axis==='x'?2*m.range:0),height:p.height+(m.axis==='y'?2*m.range:0)};if(box.x<0||box.y<0||box.x+box.width>phase.map.width||box.y+box.height>phase.map.height||blockers.some(b=>overlap(box,b)))errors.push('blocked moving envelope: '+p.id);}
      }
    }
    return errors;
  }
  function compile(plan,contract,certificate){
    const errors=validateContract(contract);
    if(errors.length)throw new Error(errors.join('; '));
    if(plan.seed!==contract.seed)errors.push('contract seed differs from recipe');
    if(!Number.isSafeInteger(plan.revision)||plan.revision<5)errors.push('new maps require effective revision >=5');
    if(plan.rooms.length!==contract.rooms.length||plan.rooms.some(r=>!contract.rooms.some(c=>c.id===r.id&&c.x===r.x&&c.y===r.y&&c.source===(r.template?'manual':'procedural'))))errors.push('recipe/contract room mismatch');
    if(plan.start.room!==contract.start||plan.exit.room!==contract.exit)errors.push('recipe/contract endpoints differ');
    const pairs=links=>links.map(e=>[e.from.room||e.from,e.to.room||e.to].sort().join('|')).sort().join(',');
    if(pairs(plan.links)!==pairs(contract.links))errors.push('recipe/contract links differ');
    if(errors.length)throw new Error(errors.join('; '));
    const phase=ns.compile(plan);
    for(const room of phase.generation.rooms){const c=contract.rooms.find(r=>r.id===room.id);if(c.width!==room.width||c.height!==room.height)errors.push('recipe/contract dimensions differ: '+room.id);}
    for(const r of contract.repairs)if(!phase.entities.components.some(e=>e.id===r.id&&e.id.startsWith(r.room+':')))errors.push('missing compiled repair: '+r.id);
    errors.push(...validateGeometry(phase,certificate));
    if(errors.length)throw new Error(errors.join('; '));
    return phase;
  }
  // Conservative static proof: always starts at the real spawn; never teleports,
  // grants optional abilities or relies on the timing of moving platforms.
  async function audit(phase,certificate){
    const errors=validateGeometry(phase,certificate),repaired=new Set(),unsupported=new Set();
    const matches=c=>{
      if(!c)return true;
      if(c.all)return c.all.every(matches);
      if(c.any)return c.any.some(matches);
      if(c.component)return repaired.has(c.component);
      unsupported.add(JSON.stringify(c));return false;
    };
    let result,finalShapes,changed=true,passes=0;
    while(changed){
      changed=false;passes++;
      const active=s=>matches(s.requires);
      const shapes=[...phase.map.ground.segments.filter(active),
        ...phase.entities.platforms.filter(p=>(p.type||'fixed')==='fixed'&&active(p)&&(!p.requiresComponentId||repaired.has(p.requiresComponentId))),
        ...phase.entities.obstacles.filter(o=>active(o)&&(!o.requiresComponentId||!repaired.has(o.requiresComponentId))),
        ...phase.entities.gates.filter(g=>active(g)&&(!g.opensWhen||!matches(g.opensWhen))&&(!g.requiresComponentId||!repaired.has(g.requiresComponentId)))]
        .map(s=>({...s,w:s.width,h:s.height}));
      result=await api.mapAudit.analyze(phase,shapes,[],phase.map.start,{yieldEvery:12});
      finalShapes=shapes;
      for(const r of result.repairs)if(r.reached&&matches(phase.entities.components.find(c=>c.id===r.id)?.requires)&&!repaired.has(r.id)){repaired.add(r.id);changed=true;}
    }
    if(!result.spawnSupported)errors.push('spawn not reachable');
    if(!result.exitReached)errors.push('exit not proven by base physics');
    for(const r of result.repairs)if(!repaired.has(r.id))errors.push('repair not proven: '+r.id);
    const near=(box,range=0)=>result.reached.some(n=>n.z+P.base.width+range>box.x&&n.a-range<box.x+box.width&&n.y+P.base.height+range>box.y&&n.y-range<box.y+box.height);
    for(const c of phase.map.checkpoints)if(!near({x:c.x,y:c.y-P.base.height,width:72,height:P.base.height}))errors.push('checkpoint not reachable');
    for(const e of phase.entities.enemies)if(!near({x:e.x-(e.radius||20),y:e.y-(e.radius||20),width:2*(e.radius||20),height:2*(e.radius||20)},76))errors.push('enemy access not proven: '+e.id);
    for(const g of phase.objectives.goals||[]){
      if(g.type==='repair'){for(const id of g.ids||[])if(!repaired.has(id))errors.push('objective repair not proven: '+id);}
      else if(g.type==='region'){if(!near(g.region||g))errors.push('objective region not proven: '+g.id);}
      else if(g.type==='condition'){if(!matches(g.condition))errors.push('objective condition not proven: '+g.id);}
      else if(g.type==='collect'){for(const id of g.ids||[]){const e=phase.entities.collectibles.find(e=>e.id===id);if(!e||!near({x:e.x-10,y:e.y-10,width:20,height:20}))errors.push('objective collectible not proven: '+id);}}
      else if(g.type!=='defeat')errors.push('unsupported objective proof: '+g.type);
    }
    for(const c of unsupported)errors.push('unsupported progression condition: '+c);
    return {ok:errors.length===0,errors,passes,repaired:[...repaired],traversal:result,
      area:{model:'union of jump-height bands above proven standing spans minus frozen solids; not a trajectory area',reachableStaticBandPixels:navigationArea(result.reached,finalShapes,phase.map.width,phase.map.height),candidateStaticBandPixels:navigationArea([...result.reached,...result.unproven],finalShapes,phase.map.width,phase.map.height)},
      model:'conservative static base physics; no timed-platform/portal/combat proof'};
  }
  api.mapRebuildV3=freeze({catalog,blueprints,capabilities,validateContract,validateGeometry,compile,
    audit,navigationArea,
    async prepare(plan,contract,certificate){const phase=compile(plan,contract,certificate),proof=await audit(phase,certificate);if(!proof.ok)throw new Error(proof.errors.join('; '));return freeze({phase,proof});},
    physics:{jumpHeight:P.jumpHeight,flightSeconds:P.flightTime,horizontalAtEqualHeight:P.maxHorizontal,landingMargin:6,reachSafetyFactor:.82},
    // Shared broad phase also serves future room/viewport culling; rebuild on geometry changes.
    spatialIndex:api.mapAudit.spatialIndex});
})();
