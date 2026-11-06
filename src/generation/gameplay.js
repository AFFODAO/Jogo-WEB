// Content generation over certified rooms. Never replaces the authored campaign/boss arena.
(() => {
  'use strict';
  const api=ByteRunner,service=api.proceduralMaps,ns=api.mapGeneration,copy=api.maps.clone;
  const generateGeometry=service.generate;
  const themes=['hardware','software','switch','router','wifi','cabling','dhcp','dns','firewall','servers'];
  const pools=[['basic','armored','fast'],['basic','shooter','fast'],['shooter','basic','fast'],['fast','shooter','armored'],['flyer','basic','shooter'],['basic','parasite','armored'],['basic','fast','shooter'],['shooter','parasite','basic'],['armored','shooter','fast'],['shooter','armored','parasite']];
  const costs={basic:1,fast:2,flyer:2,shooter:2,armored:3,parasite:3};
  const spans={basic:96,fast:192,flyer:128,shooter:160,armored:160,parasite:176};
  const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  const circle=e=>({x:e.x-e.radius,y:e.y-e.radius,width:e.radius*2,height:e.radius*2});
  const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
  const encounter=(type,rest,difficulty,progress,theme)=>{
    const allow=type==='combat'||(!rest&&type==='exploration'&&difficulty>=3)||(['secret','reward'].includes(type)&&difficulty>=4);
    const minimum=type==='combat'?costs[pools[themes.indexOf(theme)][0]]:1;
    return {budget:allow?Math.max(minimum,Math.min(6,1+Math.ceil(difficulty*progress))):0,maximum:type==='combat'?Math.ceil(difficulty/2):allow?1:0};
  };
  function envelope(p){const r=p.motion?.range||0;return {...p,x:p.x-(p.motion?.axis==='x'?r:0),y:p.y-(p.motion?.axis==='y'?r:0),width:p.width+(p.motion?.axis==='x'?r*2:0),height:p.height+(p.motion?.axis==='y'?r*2:0)};}
  function populate({config,random}) {
    const room=service.roomGeometry(config),g=config.gameplay,index=themes.indexOf(g.theme),floor=service.metrics.floor;
    room.id='gameplay-'+g.theme+'-'+config.type;room.version=2;
    for(const group of ['components','enemies','gates','interactives'])room.entities[group]??=[];
    room.goals=[];
    for(const layer of room.layers){layer.theme=g.theme;layer.type=index<5?'computer-world':'infrastructure-world';}
    if(config.type==='combat')for(const item of room.layers[0].items)if(item.kind==='cable')item.label='COMBATE / ROTA DE FUGA';
    if(['secret','reward'].includes(config.type)) {
      const ledge=room.entities.platforms.find(p=>p.id==='upper-1'),reward=room.entities.collectibles.find(c=>c.id==='reward');
      if(ledge&&reward)Object.assign(reward,{x:ledge.x+ledge.width-28,y:ledge.y-30,secret:true});
    }
    if(config.type==='secret') {
      room.entities.interactives.push({id:'secret-panel',type:'switch',x:512,y:floor-40,width:28,height:40,flag:'secret-found',once:true,label:'BUS',message:'PASSAGEM DE CACHE ENCONTRADA'});
      room.entities.platforms.push({id:'secret-cache-step',x:512,y:floor-240,width:96,height:16,type:'fixed',collision:'one-way',requires:{flag:'secret-found'}});
      room.entities.collectibles.push({id:'secret-cache',x:560,y:floor-270,radius:10,secret:true});
    }
    if(config.type==='repair') {
      room.entities.components.push({id:'relay',x:208,y:floor-44,width:34,height:44,label:'RESTAURAR SERVICO',repair:api.repairChallenges.forPhase(index,g.ordinal)});
      if(g.mandatory)room.goals.push({id:'restore-service',type:'repair',ids:['relay']});
      // Removing the maintenance roof opens headroom; the fixed deck remains a
      // base-jump alternative to the newly powered lift. Neither blocks a socket.
      for(const obstacle of room.entities.obstacles)if(obstacle.id.includes('roof'))obstacle.requiresComponentId='relay';
      room.entities.platforms.push({id:'service-deck',x:80,y:floor-160,width:160,height:16,type:'fixed',collision:'one-way',requiresComponentId:'relay'},
        {id:'service-lift',x:80,y:floor-240,width:128,height:16,type:'moving',collision:'one-way',requiresComponentId:'relay',style:'elevator',motion:{axis:'y',range:48,speed:.45,phase:0}});
      room.entities.collectibles.push({id:'service-cache',x:224,y:floor-190,radius:10,secret:true});
      if(g.shortcut)room.mechanics.push({id:'service-shortcut',type:'portals',links:[{id:'service-out',x:560,y:floor-76,width:40,height:76,label:'CACHE / ATALHO',requires:{component:'relay'},to:{room:g.shortcut,anchor:'entry'}}]});
    }
    if(config.type==='reward'&&g.primaryRelay) {
      const relay=g.primaryRelay+':relay';
      const lift=room.entities.platforms.find(p=>p.id==='elevator');if(lift)lift.requiresComponentId=relay;
      room.entities.gates.push({id:'cache-door',x:552,y:floor-544,width:16,height:64,opensWhen:{component:relay}});
      room.entities.collectibles.push({id:'locked-cache',x:610,y:floor-510,radius:10,secret:true});
      if(g.primaryReward)room.mechanics.push({id:'cache-return',type:'portals',links:[{id:'cache-back',x:192,y:floor-76,width:40,height:76,label:'MANUTENCAO / VOLTAR',requires:{component:relay},to:{room:g.primaryRelay,anchor:'entry'}}]});
    }
    // Rest/repair/parkour spaces deliberately do not stack enemy pressure on jumps.
    const quota=encounter(config.type,config.rest,g.difficulty,g.progress,g.theme);let budget=quota.budget;
    const maximum=quota.maximum;
    const supports=[...room.ground,...room.entities.platforms.filter(p=>p.type==='fixed'&&!p.requiresComponentId&&!p.requires)].sort((a,b)=>b.width-a.width||b.y-a.y);
    const hazards=room.mechanics.filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards);
    const boxes=[...room.entities.obstacles,...room.entities.gates,...room.entities.platforms.map(envelope),...hazards];
    const order=[pools[index][0],...random.fork('combination').pick([pools[index],pools[index].slice().reverse()]),'basic'];
    for(let slot=0;slot<maximum;slot++) {
      let chosen;
      const choices=[...new Set([...order.slice(slot),...order])];
      if(slot)choices.sort((a,b)=>Number(room.entities.enemies.some(e=>e.type===a))-Number(room.entities.enemies.some(e=>e.type===b)));
      for(const type of choices) {
        if(costs[type]>budget)continue;
        const profile=api.enemies.profiles[type];
        for(const surface of supports) {
          if(surface.width<spans[type])continue;
          for(const fraction of random.fork('slot-'+slot+'-'+type+'-'+surface.id).pick([[.7,.5,.3],[.5,.3,.7],[.3,.7,.5]])) {
            const radius=profile.radius,x=surface.x+24+radius+(surface.width-48-radius*2)*fraction,y=surface.y-(profile.flying?92:24);
            const enemy={id:'enemy-'+slot,type,x,y,radius,groundY:surface.y,
              patrolMin:surface.x+radius+12,patrolMax:surface.x+surface.width-radius-12,
              navigationBounds:{left:surface.x+radius+12,right:surface.x+surface.width-radius-12},
              activationRegion:{x:320,y:16,width:432,height:704},variant:api.enemies.variantFor(index+1,type)};
            if(g.checkpoints.some(p=>Math.hypot(x-(p.x+55),y-(p.y-24))<260))continue;
            if(boxes.some(b=>b!==surface&&overlap(circle(enemy),b)))continue;
            if(room.entities.enemies.some(e=>Math.hypot(x-e.x,y-e.y)<140))continue;
            // Restrict patrol to a clear interval around this spawn, including
            // dynamic-platform envelopes and warned hazard columns.
            for(const b of boxes)if(b.y<y+radius&&b.y+b.height>y-radius){if(b.x+b.width<x)enemy.patrolMin=Math.max(enemy.patrolMin,b.x+b.width+radius+8);else if(b.x>x)enemy.patrolMax=Math.min(enemy.patrolMax,b.x-radius-8);}
            if(enemy.patrolMax-enemy.patrolMin<32)continue;
            enemy.navigationBounds={left:enemy.patrolMin,right:enemy.patrolMax};chosen=enemy;break;
          }
          if(chosen)break;
        }
        if(chosen)break;
      }
      if(!chosen)break;room.entities.enemies.push(chosen);budget-=costs[chosen.type];
    }
    return room;
  }
  let installed=false;
  function generateGameplay(options={}) {
    const theme=options.theme||'hardware',themeIndex=themes.indexOf(theme);if(themeIndex<0)throw new Error('Unknown gameplay theme');
    const base=generateGeometry({...options,difficulty:options.difficulty??Math.min(5,1+Math.floor(themeIndex/2))}),graph=copy(base.generation.graph),plan=copy(base.generation.recipe);
    if(!installed){ns.registerGenerator({id:'gameplay-room-v1',version:2,generate:populate});installed=true;}
    const repair=graph.nodes.find(n=>n.type==='repair'&&n.main)||graph.nodes.find(n=>n.type==='repair');
    const reward=graph.nodes.find(n=>n.type==='reward');let ordinal=0;
    plan.theme=theme;plan.name='Salas // '+theme;plan.revision=4;
    plan.objective='Explore os setores, restaure os servicos obrigatorios e alcance a verificacao final.';
    plan.objectives.repairAllComponents=false;plan.objectives.defeatAllViruses=false;
    for(const placement of plan.rooms) {
      const node=graph.nodes.find(n=>n.id===placement.id),pathIndex=graph.mainPath.indexOf(node.id);
      placement.generator='gameplay-room-v1';placement.config.gameplay={theme,difficulty:graph.options.difficulty,
        checkpoints:base.map.checkpoints.map(p=>({x:p.x-placement.x,y:p.y-placement.y})),
        progress:node.main?Math.max(.2,pathIndex/(graph.mainPath.length-1)):.85,ordinal:ordinal++,
        mandatory:node.main||node.id===repair.id,primaryRelay:repair.id,
        primaryReward:node.id===reward.id,
        shortcut:node.id===repair.id?reward.id:null};
    }
    const result=copy(ns.compile(plan));result.map.checkpointMode='free';
    result.generation.graph=graph;result.generation.physics=copy(base.generation.physics);
    // Keep legacy diagnostic bus behavior, in addition to repair-controlled links.
    if(options.portals)result.mechanics.push(...copy(base.mechanics.filter(m=>m.id==='diagnostic-bus')));
    result.generation.gameplay={version:2,theme,difficulty:graph.options.difficulty,respawnClearance:220,
      mandatoryRepairs:result.objectives.goals.filter(g=>g.type==='repair').flatMap(g=>g.ids),
      rooms:graph.nodes.map(n=>{
        const config=plan.rooms.find(r=>r.id===n.id).config,enemies=result.entities.enemies.filter(e=>e.id.startsWith(n.id+':'));
        return {id:n.id,type:n.type,main:n.main,progress:config.gameplay.progress,
          ...encounter(n.type,config.rest,graph.options.difficulty,config.gameplay.progress,theme),spent:enemies.reduce((sum,e)=>sum+costs[e.type],0),
          enemies:enemies.map(e=>e.id),repairs:result.entities.components.filter(c=>c.id.startsWith(n.id+':')).map(c=>c.id)};
      })};
    const errors=[...ns.validation.definition(result),...service.validate(result),...service.validateParkour(result),...validateGameplay(result)];
    if(errors.length)throw new Error('Gameplay quality: '+errors.join('; '));return freeze(result);
  }
  function validateGameplay(map) {
    const errors=[],physics=api.platformPhysics.base,components=map.entities.components;
    for(const room of map.generation.gameplay.rooms) {
      const actual=map.entities.enemies.filter(e=>e.id.startsWith(room.id+':')),spent=actual.reduce((sum,e)=>sum+(costs[e.type]??Infinity),0);
      if(spent>room.budget||actual.length>room.maximum)errors.push('encounter exceeds budget: '+room.id);
      if(room.type==='combat'&&!actual.length)errors.push('combat room lacks safe encounter: '+room.id);
    }
    const required=new Set([...(map.objectives.repairAllComponents?components.map(c=>c.id):[]),...map.objectives.goals.filter(g=>g.type==='repair').flatMap(g=>g.ids)]),repaired=new Set();
    const matches=c=>{
      if(!c)return true;
      if(c.all)return c.all.every(matches);
      if(c.any)return c.any.some(matches);
      if(c.not)return !matches(c.not);
      return c.component?repaired.has(c.component):false;
    };
    const enabled=p=>(!p.requiresComponentId||repaired.has(p.requiresComponentId))&&matches(p.requires);
    const solids=()=>[...map.map.ground.segments,...map.entities.platforms.filter(p=>p.type==='fixed'&&enabled(p)),...map.entities.obstacles.filter(p=>!p.requiresComponentId||!repaired.has(p.requiresComponentId)),...map.entities.gates.filter(p=>!matches(p.opensWhen))];
    for(let round=0;round<=components.length;round++) {
      let change=false;
      for(const c of components) {
        if(repaired.has(c.id)||!matches(c.requires))continue;
        const room=map.generation.rooms.find(r=>c.id.startsWith(r.id+':'));
        const checkpoint=map.map.checkpoints.find(p=>p.x>=room.x&&p.x<room.x+room.width&&p.y>=room.y&&p.y<=room.y+room.height);
        if(!checkpoint)continue;
        const boxes=solids(),support=boxes.find(p=>enabled(p)&&Math.abs(p.y-c.y-c.height)<2&&c.x>=p.x&&c.x+c.width<=p.x+p.width);
        if(!support)continue;
        const corridor={x:Math.min(checkpoint.x,c.x),y:c.y,width:Math.abs(checkpoint.x-c.x)+c.width,height:c.height};
        const blockers=[...map.entities.obstacles.filter(p=>!p.requiresComponentId||!repaired.has(p.requiresComponentId)),...map.entities.gates.filter(p=>!matches(p.opensWhen))];
        if(blockers.some(p=>overlap(corridor,p)))continue;
        repaired.add(c.id);change=true;
      }
      if(!change)break;
    }
    for(const id of required)if(!repaired.has(id))errors.push('unreachable/cyclic mandatory repair: '+id);
    const boxes=[...map.map.ground.segments,...map.entities.obstacles,...map.entities.gates,...map.entities.platforms.map(envelope),...map.mechanics.filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards)];
    for(const enemy of map.entities.enemies) {
      if(boxes.some(b=>overlap(circle(enemy),b)))errors.push('enemy embedded: '+enemy.id);
      for(const p of map.map.checkpoints)if(Math.hypot(enemy.x-p.x-55,enemy.y-p.y+24)<220)errors.push('enemy too close to respawn: '+enemy.id);
      if(!map.map.ground.segments.concat(map.entities.platforms.filter(p=>p.type==='fixed'&&!p.requiresComponentId&&!p.requires)).some(p=>p.y===enemy.groundY&&enemy.x-enemy.radius>=p.x&&enemy.x+enemy.radius<=p.x+p.width))errors.push('enemy lacks support: '+enemy.id);
    }
    for(const point of map.map.checkpoints)if(!map.map.ground.segments.concat(map.entities.platforms.filter(p=>p.type==='fixed'&&!p.requiresComponentId&&!p.requires)).some(p=>p.y===point.y&&point.x+38>=p.x&&point.x+38+physics.width<=p.x+p.width)) {
      // Two touching floor rectangles may jointly support the existing +38 offset.
      const supports=map.map.ground.segments.concat(map.entities.platforms.filter(p=>p.type==='fixed'&&!p.requiresComponentId&&!p.requires)).filter(p=>p.y===point.y).sort((a,b)=>a.x-b.x);
      let end=point.x+38;for(const p of supports)if(p.x<=end&&p.x+p.width>=end)end=Math.max(end,p.x+p.width);if(end<point.x+38+physics.width)errors.push('unsafe checkpoint');
    }
    return errors;
  }
  Object.assign(service,{generateGameplay,validateGameplay,generate(options={}){return options.gameplay?generateGameplay(options):generateGeometry(options);}});
})();
