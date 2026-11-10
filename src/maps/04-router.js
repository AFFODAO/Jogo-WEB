// Router V3: interlocked tunnel loops, closed cross-walls and elevated gateway.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,W=640,H=512,F=464;
  const regions=[['lan','ENTRADA LAN',0],['maze','LABIRINTO CENTRAL',1],['interfaces','INTERFACES DE REDE',1],['wan','TUNEIS WAN',2],['core','NUCLEO DE ROTEAMENTO',2],['gateway','GATEWAY FINAL',3]].map(([id,name,state])=>({id,name,state}));
  const cells=[
    ['gateway-approach',5,0,'gateway','parkour'],['gateway-tower',6,0,'gateway','repair'],['gateway-exit',7,0,'gateway','exit'],
    ['maze-vault',0,1,'maze','secret'],['maze-upper',1,1,'maze','combat'],['iface-lan',2,1,'interfaces','repair'],['core-west',3,1,'core','combat'],['core-main',4,1,'core','repair'],['core-east',5,1,'core','parkour'],['wan-crown',6,1,'wan','combat'],
    ['lan-rise',0,2,'lan','parkour'],['maze-cross',1,2,'maze','explore'],['maze-well',2,2,'maze','lift'],['core-south',3,2,'core','explore'],['wan-shaft',5,2,'wan','lift'],['wan-relay',6,2,'wan','repair'],
    ['lan-entry',0,3,'lan','entry'],['lan-fork',1,3,'lan','explore'],['maze-lower',2,3,'maze','timing'],['iface-console',3,3,'interfaces','repair'],['iface-cache',4,3,'interfaces','secret'],['wan-under',5,3,'wan','timing'],['wan-trench',6,3,'wan','combat'],
    ['maze-cache',2,4,'maze','secret'],['iface-bypass',3,4,'interfaces','explore'],['iface-wan',4,4,'interfaces','repair'],['wan-intake',5,4,'wan','combat']
  ].map(([id,col,row,region,role])=>({id,col,row,region,role,ports:{}}));
  const byId=new Map(cells.map(c=>[c.id,c]));
  // Adjacency is deliberately authored, not inferred from occupied cells. Closed
  // neighboring faces remain walls, so upper/lower loops are genuine maze choices.
  const edges=[
    ['lan-entry','lan-fork'],['lan-entry','lan-rise'],['lan-rise','maze-vault'],['lan-rise','maze-cross'],['maze-vault','maze-upper'],
    ['lan-fork','maze-cross'],['lan-fork','maze-lower'],['maze-cross','maze-upper'],['maze-cross','maze-well'],['maze-upper','iface-lan'],
    ['maze-lower','maze-well'],['maze-lower','iface-console'],['maze-lower','maze-cache'],['maze-well','iface-lan'],['maze-well','core-south'],
    ['iface-lan','core-west'],['core-west','core-main'],['core-west','core-south'],['core-south','iface-console'],['core-main','core-east'],
    ['core-east','wan-crown'],['core-east','wan-shaft'],['core-east','gateway-approach'],['wan-crown','wan-relay'],['wan-crown','gateway-tower'],
    ['wan-shaft','wan-relay'],['wan-shaft','wan-under'],['wan-relay','wan-trench'],['wan-under','wan-trench'],
    ['iface-console','iface-cache'],['iface-console','iface-bypass'],['maze-cache','iface-bypass'],['iface-bypass','iface-wan'],['iface-cache','iface-wan'],['iface-wan','wan-intake'],['wan-intake','wan-under'],
    ['gateway-approach','gateway-tower'],['gateway-tower','gateway-exit']
  ];
  for(const [a,b] of edges){const first=byId.get(a),second=byId.get(b),dx=second.col-first.col,dy=second.row-first.row;if(Math.abs(dx)+Math.abs(dy)!==1)throw new Error('Nonadjacent router rooms');const side=dx===1?'east':dx===-1?'west':dy===1?'south':'north';first.ports[side]=b;second.ports[({east:'west',west:'east',north:'south',south:'north'})[side]]=a;}
  const repairs={'iface-lan':['lan','CONFIGURAR INTERFACE LAN'],'iface-console':['transit','RECONSTRUIR ROTAS DE TRANSITO'],'iface-wan':['wan','CONFIGURAR INTERFACE WAN'],'wan-relay':['link','SINCRONIZAR TUNEL WAN'],'core-main':['table','RESTAURAR TABELA DE ROTEAMENTO'],'gateway-tower':['gateway','RESTAURAR GATEWAY PADRAO']};
  const outer={all:Object.entries(repairs).slice(0,4).map(([room,[id]])=>({component:room+':'+id}))};
  const routed={component:'core-main:table'},complete={all:Object.entries(repairs).map(([room,[id]])=>({component:room+':'+id}))};
  function build(c,random){
    const r={id:'router-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},exit:{x:544,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const box=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144,style='cable')=>r.entities.platforms.push({...box(id,x,y,width,16),type:'fixed',collision:'one-way',style});
    if(c.ports.south){r.ground.push(box('floor-west',0,F,208,48),box('floor-east',496,F,144,48));fixed('shaft-landing',224,F-64,256);}
    else if(['parkour','timing'].includes(c.role)){
      r.ground.push(box('floor-west',0,F,224,48),box('floor-east',464,F,176,48),box('catch-tray',224,H-16,240,16));fixed('cable-island',280,F-64,c.region==='gateway'?96:128);
    }else r.ground.push(box('tunnel-floor',0,F,W,48));
    for(const side of ['west','east']){
      const x=side==='west'?0:W-16,open=c.ports[side];
      if(!open||c.region!=='wan')r.entities.obstacles.push(box('wall-'+side,x,0,16,open?F-128:F));
      if(open)r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
    }
    if(c.ports.north){
      r.entities.obstacles.push(box('roof-west',16,0,192,16),box('roof-east',496,0,128,16));r.sockets.push({id:'north',direction:'north',x:320,y:0});
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('shaft-riser-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:c.region==='gateway'?96:128);
    }else r.entities.obstacles.push(box('roof',16,0,W-32,16));
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    if(!c.ports.north){fixed('alcove-step',80,F-96,144);fixed('alcove-balcony',184,F-192,160);}
    else if(['repair','secret','combat'].includes(c.role)){fixed('service-step',64,F-96,128);fixed('service-balcony',48,F-192,144);fixed('service-connection',80,F-288,128);}
    if(c.role==='combat'&&!c.ports.north)fixed('sentry-balcony',64,F-192,144);
    const secret=c.role==='secret',cacheX=secret&&random?random.int(5,7)*16:112;
    r.entities.collectibles.push({id:'datagram',x:112,y:F-30,radius:10,secret:false});
    if(secret||!c.ports.north)r.entities.collectibles.push({id:'route-cache',x:secret&&c.ports.north?cacheX:224,y:F-224,radius:10,secret});
    if(secret)r.entities.collectibles.push({id:'backup-config',x:560,y:F-30,radius:10,secret:true});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id],upper=['iface-lan','core-main','gateway-tower'].includes(c.id),y=upper?F-192:F;
      // Upper consoles have their own permanent approach regardless of room orientation.
      if(upper&&c.ports.north){fixed('console-step',64,F-96,128);fixed('console-pad',184,F-192,160);}
      r.entities.components.push({id,x:upper?208:112,y:y-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(3,Object.keys(repairs).indexOf(c.id))});
      fixed('restored-access',448,F-96,144);
      r.entities.platforms.push({...box('powered-route',424,F-192,176,16),type:'fixed',collision:'one-way',style:'cable',requires:{component:id}});
      if(!c.ports.south)fixed('maintenance-pad',304,F-64,112);
      r.mechanics.push({id:'maintenance-tunnel',type:'portals',links:[{id:'shortcut',x:336,y:F-140,width:40,height:76,label:'ATALHO / '+(c.region==='gateway'?'NUCLEO':'ENTRADA LAN'),requires:{component:id},to:{room:c.region==='gateway'?'core-south':'lan-fork',anchor:'entry'}}]});
    }
    // Repair locks have alternative approach loops; no service unlocks access to itself.
    if(c.id==='maze-cross')r.entities.gates.push({...box('lan-shortcut',624,F-128,16,128),opensWhen:{component:'iface-lan:lan'}});
    if(c.id==='maze-vault')r.entities.gates.push({...box('cache-south-lock',208,F,288,16),opensWhen:{component:'iface-lan:lan'}},{...box('cache-east-lock',624,F-128,16,128),opensWhen:{component:'iface-lan:lan'}});
    if(c.id==='iface-cache')r.entities.gates.push({...box('config-west-lock',0,F-128,16,128),opensWhen:{component:'iface-console:transit'}},{...box('config-south-lock',208,F,288,16),opensWhen:{component:'iface-console:transit'}});
    if(c.id==='core-main')r.entities.gates.push({...box('core-west-lock',0,F-128,16,128),opensWhen:outer},{...box('core-east-lock',624,F-128,16,128),opensWhen:outer});
    if(['gateway-approach','gateway-tower'].includes(c.id))r.entities.gates.push({...box('routed-shaft-lock',208,F,288,16),opensWhen:routed});
    if(c.id==='gateway-exit')r.entities.gates.push({...box('gateway-lock',464,16,16,F-16),opensWhen:complete});
    if(['entry','repair','lift','combat'].includes(c.role)||c.id==='lan-fork')r.checkpoints.push({x:64,y:F});
    const count=c.role==='combat'?2:['repair','parkour','timing'].includes(c.role)?1:0;
    for(let i=0;i<count;i++){
      const left=i?80:504,right=i?176:592,type=c.region==='gateway'||c.id==='core-west'?'armored':i?'shooter':c.role==='timing'?'fast':'basic';
      const groundY=i?F-192:F;
      r.entities.enemies.push({id:'route-virus-'+i,type,x:(left+right)/2,y:groundY-24,groundY,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:48,width:608,height:416}});
    }
    if(c.role==='lift'||['wan-under','wan-trench','core-south','gateway-approach'].includes(c.id))r.entities.platforms.push({...box('data-lift',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:c.id==='wan-under'||c.id==='wan-trench'?'x':'y',range:64,speed:.5,phase:0}});
    if(c.role==='timing'||['core-east','gateway-approach'].includes(c.id))r.entities.platforms.push({...box('unstable-route',448,F-288,112,16),type:'temporary',collision:'one-way',style:'signal',duration:2.6,respawnDelay:2.4});
    if(c.role==='timing'||['wan-crown','wan-trench','gateway-approach','core-east'].includes(c.id))r.mechanics.push({id:'tunnel-traps',type:'parkour-hazards',hazards:[{id:'surge',kind:c.region==='wan'?'electric':'laser',x:408,y:F-36,width:24,height:36,warning:1.3,active:.65,period:5.4,damage:8}]});
    const panels=[box('tunnel-shell',32,64,576,240)],cables=[],signals=[];
    for(let i=0;i<4;i++){cables.push(box('conduit-'+i,48,96+i*40,544,8));signals.push(box('data-led-'+i,112+i*112,112+i*24,32,8));}
    if(c.region==='interfaces')for(let i=0;i<3;i++)panels.push(box('console-'+i,96+i*144,128,112,144));
    else if(c.region==='core')panels.push(box('routing-silicon',208,96,256,240));
    else if(c.region==='wan')for(let i=0;i<4;i++)panels.push(box('wan-rib-'+i,48+i*144,48,24,288));
    const region=regions.find(r=>r.id===c.region);
    r.layers.push({id:'tunnel-shells',type:'rects',pass:'background',color:'#102238',rects:panels},{id:'cable-conduits',type:'rects',pass:'background',color:'#213950',rects:cables},{id:'subtle-data-flow',type:'rects',pass:'background',color:'#35536d',rects:signals},
      {id:'network-tunnels',type:'computer-world',theme:'router',pass:'midground',items:[{kind:'tunnel',x:32,y:64,width:576,height:240,label:region.name+' / '+c.id.toUpperCase()},{kind:c.region==='interfaces'?'terminal':c.region==='gateway'?'gateway':c.region==='core'?'core':'cable',x:272,y:128,width:144,height:128,label:''}]});
    return r;
  }
  g.registerGenerator({id:'router-maze-cache',version:5,generate({config,random}){return build(config,random);}});
  const placements=cells.map(c=>{if(c.role==='secret')return {id:c.id,x:c.col*W,y:c.row*H,generator:'router-maze-cache',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.col*W,y:c.row*H,template:room.id};});
  const links=edges.map(([a,b])=>{let x=byId.get(a),y=byId.get(b);if(x.row>y.row||x.row===y.row&&x.col>y.col)[x,y]=[y,x];const side=y.col>x.col?'east':'south';return {from:{room:x.id,socket:side},to:{room:y.id,socket:side==='east'?'west':'north'}};});
  const plan={id:'phase-04',name:'Roteador - O labirinto de rotas',theme:'router',seed:'byte-router-maze-v3-2026',revision:5,layout:'maze',objective:'Explore LAN, tuneis e interfaces; restaure seis servicos de rede, elimine os virus e alcance o gateway elevado.',size:{width:8*W,height:5*H},rooms:placements,links,start:{room:'lan-entry',anchor:'entry'},exit:{room:'gateway-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true}};
  const phase=api.maps.clone(g.compile(plan));phase.map.checkpointMode='free';phase.palette=['#081424','#1a3048','#80c6ff','#426e97','#c6e6ff'];
  phase.map.regions=regions.map(region=>({...region,areas:cells.filter(c=>c.region===region.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'upper-loop',label:'LAN / GALERIA SUPERIOR / INTERFACE LAN'},{id:'lower-loop',label:'LABIRINTO / TRANSITO / INTERFACE WAN'},{id:'wan-loop',label:'WAN / ELEVADORES / NUCLEO'},{id:'gateway',label:'DUAS APROXIMACOES / GATEWAY'}];
  phase.generation.architecture={version:3,mode:'interlocked-multilevel-tunnel-maze',regions:regions.map(r=>r.name),rooms:cells.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:cells.filter(c=>c.role==='secret').map(c=>c.id),targetMinutes:[15,25],durationMinutes:null,pacing:{lan:[2,3],maze:[4,6],interfaces:[3,5],wanAndCore:[4,7],gateway:[2,4]}};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));api.maps.register(phase);
})();
