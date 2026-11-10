// DNS V3: physical domain campuses joined by one coherent portal network.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,W=640,H=512,F=464;
  const regions=[['root','SERVIDOR RAIZ',0],['com','REGIAO .COM',0],['org','REGIAO .ORG',1],['cache','CACHE RECURSIVO',1],['nx','REGIAO NXDOMAIN / OPCIONAL',2],['resolution','RESOLUCAO FINAL',3]].map(([id,name,state])=>({id,name,state}));
  const cells=[
    ['root-core',4,3,'root','repair'],['root-east',5,3,'root','explore'],['root-lower',4,4,'root','explore'],['root-dock',5,4,'root','explore'],
    ['com-crown',1,1,'com','secret'],['com-records',0,2,'com','repair'],['com-zone',1,2,'com','repair'],['com-files',2,2,'com','combat'],['com-base',0,3,'com','explore'],['com-stacks',1,3,'com','parkour'],['com-vault',2,3,'com','secret'],
    ['org-archive',8,2,'org','combat'],['org-records',9,2,'org','repair'],['org-terrace',10,2,'org','parkour'],['org-entry',8,3,'org','explore'],['org-bridge',9,3,'org','parkour'],['org-vault',10,3,'org','secret'],
    ['cache-crown',4,6,'cache','repair'],['cache-bypass',5,6,'cache','parkour'],['cache-loop',4,7,'cache','combat'],['cache-east',5,7,'cache','lift'],['cache-stairs',4,8,'cache','parkour'],['cache-terminal',5,8,'cache','repair'],['cache-vault',4,9,'cache','secret'],['cache-bottom',5,9,'cache','explore'],
    ['nx-entry',0,6,'nx','explore'],['nx-breach',1,6,'nx','combat'],['nx-cavern',0,7,'nx','combat'],['nx-vault',1,7,'nx','secret'],
    ['resolve-core',8,6,'resolution','repair'],['resolve-exit',9,6,'resolution','exit'],['resolve-entry',8,7,'resolution','parkour'],['resolve-stack',9,7,'resolution','combat']
  ].map(([id,col,row,region,role])=>({id,col,row,region,role,portals:[]}));
  const grid=new Map(cells.map(c=>[c.col+','+c.row,c])),byId=new Map(cells.map(c=>[c.id,c])),directions={west:[-1,0],east:[1,0],north:[0,-1],south:[0,1]};
  const closed=(a,b)=>[a,b].sort().join('|')===['cache-loop','cache-east'].sort().join('|');
  for(const c of cells)c.ports=Object.fromEntries(Object.entries(directions).map(([side,[dx,dy]])=>{const n=grid.get((c.col+dx)+','+(c.row+dy));return [side,Boolean(n&&!closed(c.id,n.id))];}));
  const repairs={'root-core':['hints','RESTAURAR REFERENCIAS DA RAIZ'],'com-records':['records','RECONSTRUIR REGISTROS A / AAAA'],'com-zone':['delegation','RESTAURAR DELEGACAO .COM'],'org-records':['records','RECONSTRUIR REGISTROS .ORG'],'cache-terminal':['recursive','RESTAURAR RESOLVEDOR RECURSIVO'],'cache-crown':['ttl','RENOVAR CACHE / TTL'],'resolve-core':['resolution','CONCLUIR RESOLUCAO DNS']};
  const outer={all:Object.entries(repairs).slice(0,6).map(([room,[id]])=>({component:room+':'+id}))};
  const complete={all:Object.entries(repairs).map(([room,[id]])=>({component:room+':'+id}))};
  const portalEdges=[];
  function portal(from,to,id,label,requires){byId.get(from).portals.push({id,to,label,requires});portalEdges.push({from,to,id,label,...(requires?{requires}:{} )});}
  portal('root-core','com-base','query-com','CONSULTAR .COM');portal('com-base','root-core','root-return','SERVIDOR RAIZ');
  portal('root-core','org-entry','query-org','CONSULTAR .ORG');portal('org-entry','root-core','root-return','SERVIDOR RAIZ');
  portal('root-east','cache-bottom','query-cache','CACHE RECURSIVO');portal('cache-bottom','root-core','root-return','SERVIDOR RAIZ');
  portal('root-east','nx-entry','query-nx','NXDOMAIN / RISCO OPCIONAL');portal('nx-entry','root-east','safe-return','RAIZ / RETORNO SEGURO');
  portal('root-lower','resolve-entry','final-query','RESOLUCAO FINAL',outer);portal('resolve-entry','root-lower','root-return','SERVIDOR RAIZ');
  portal('root-core','cache-terminal','hints-shortcut','ATALHO / RESOLVEDOR',{component:'root-core:hints'});
  portal('root-dock','cache-crown','ttl-shortcut','CACHE TTL / ATALHO',{component:'cache-crown:ttl'});
  for(const [room,[id]] of Object.entries(repairs))if(room!=='root-core')portal(room,'root-core','restored-return','RAIZ / SERVICO RESTAURADO',{component:room+':'+id});
  portal('com-files','org-archive','delegation-org','.ORG / DELEGACAO',{component:'com-zone:delegation'});portal('org-archive','com-files','delegation-com','.COM / DELEGACAO',{component:'com-zone:delegation'});
  portal('org-terrace','cache-bypass','cache-route','CACHE / ROTA ALTERNATIVA',{component:'org-records:records'});portal('cache-bypass','org-terrace','org-route','.ORG / ROTA ALTERNATIVA',{component:'org-records:records'});
  portal('cache-vault','com-vault','vault-shortcut','ARQUIVOS .COM / ATALHO',{component:'cache-crown:ttl'});
  portal('nx-vault','cache-vault','risk-reward-return','CACHE / RECOMPENSA OPCIONAL',{component:'cache-crown:ttl'});
  const enemyCount=c=>c.region==='root'?0:c.role==='combat'?2:['repair','parkour'].includes(c.role)?1:0;
  function build(c,random){
    const r={id:'dns-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},reception:{x:16,y:F-48},exit:{x:544,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const box=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144)=>r.entities.platforms.push({...box(id,x,y,width,16),type:'fixed',collision:'one-way',style:'packet'});
    if(c.ports.south){r.ground.push(box('floor-west',0,F,208,48),box('floor-east',496,F,144,48));fixed('directory-crossbar',224,F-64,256);}
    else if(c.role==='parkour'){
      r.ground.push(box('floor-west',0,F,224,48),box('floor-east',464,F,176,48),box('recovery-layer',224,H-16,240,16));fixed('record-island',280,F-64,c.region==='resolution'?96:128);
    }else r.ground.push(box('server-deck',0,F,W,48));
    for(const side of ['west','east']){
      if(c.ports[side])r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
      if(c.region!=='org')r.entities.obstacles.push(box('wall-'+side,side==='west'?0:W-16,0,16,c.ports[side]?F-128:F));
    }
    if(c.ports.north){
      r.sockets.push({id:'north',direction:'north',x:320,y:0});
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('index-step-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:c.region==='resolution'?96:128);
    }
    if(c.region!=='org')r.entities.obstacles.push(...(c.ports.north?[box('roof-west',16,0,192,16),box('roof-east',496,0,128,16)]:[box('roof',16,0,W-32,16)]));
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    if(!c.ports.north){fixed('archive-step',80,F-96);fixed('archive-balcony',184,F-192,160);}
    else if(['repair','combat','secret','lift'].includes(c.role)){fixed('service-step',64,F-96,128);fixed('archive-balcony',48,F-192);fixed('balcony-link',80,F-288,128);}
    if(c.role==='combat'&&!c.ports.north)fixed('sentry-deck',64,F-192);
    const secret=c.role==='secret',cacheX=secret&&random?random.int(5,7)*16:112;
    r.entities.collectibles.push({id:'record-fragment',x:112,y:F-30,radius:10,secret:c.region==='nx'});
    if(secret||!c.ports.north)r.entities.collectibles.push({id:'record-cache',x:secret&&c.ports.north?cacheX:224,y:F-224,radius:10,secret:secret||c.region==='nx'});
    if(secret)r.entities.collectibles.push({id:'zone-backup',x:560,y:F-30,radius:10,secret:true});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id];r.entities.components.push({id,x:112,y:F-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(7,Object.keys(repairs).indexOf(c.id))});
      fixed('restored-access',448,F-96);
      r.entities.platforms.push({...box('restored-index',424,F-192,176,16),type:'fixed',collision:'one-way',style:'packet',requires:{component:id}});
    }
    const slots=[{x:544,y:F},{x:336,y:F-64},{x:80,y:F-192}];
    for(const [i,p] of c.portals.entries()){
      const s=slots[i];if(!s)throw new Error('Too many DNS portal slots');
      if(i===1&&!c.ports.south)fixed('portal-reception-'+i,304,s.y,144);
      if(i===2){fixed('portal-step',64,F-96,128);fixed('portal-balcony',48,s.y,144);}
    }
    if(c.portals.length)r.mechanics.push({id:'dns-links',type:'portals',links:c.portals.map((p,i)=>({...box(p.id,slots[i].x,slots[i].y-76,40,76),label:p.label,...(p.requires?{requires:p.requires}:{}),to:{room:p.to,anchor:'reception'}}))});
    if(c.role==='lift'||['com-stacks','org-bridge','cache-stairs','cache-terminal','cache-bypass'].includes(c.id))r.entities.platforms.push({...box('recursive-platform',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:c.region==='org'||c.id==='cache-bypass'?'x':'y',range:64,speed:.5,phase:0}});
    if(['org-terrace','cache-bypass','cache-stairs','resolve-entry'].includes(c.id)){
      if(c.id==='resolve-entry')fixed('temporary-approach',480,F-96,128);
      fixed('temporary-rest',432,F-192);
      r.entities.platforms.push({...box('temporary-record',448,F-288,112,16),type:'temporary',collision:'one-way',style:'signal',duration:2.7,respawnDelay:2.4});
    }
    for(let i=0;i<enemyCount(c);i++){
      const left=i?80:504,right=i?176:592,groundY=i?F-192:F,type=i?'shooter':c.region==='resolution'||c.id==='org-archive'||c.id==='nx-breach'?'armored':c.region==='nx'||c.id==='cache-loop'?'fast':'basic';
      const bonus=c.region==='nx';
      r.entities.enemies.push({id:'domain-virus-'+i,type,x:(left+right)/2,y:groundY-24,groundY,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:48,width:608,height:416},...(bonus?{hp:i?4:type==='armored'?11:3,xp:i?80:110}:{} )});
    }
    if(['repair','lift','combat'].includes(c.role)||['root-east','root-lower','com-base','org-entry','cache-bottom','nx-entry','resolve-entry'].includes(c.id))r.checkpoints.push({x:64,y:F});
    if(['org-terrace','org-bridge','cache-loop','cache-stairs','nx-breach','nx-cavern','resolve-entry','resolve-stack'].includes(c.id))r.mechanics.push({id:'query-overload',type:'parkour-hazards',hazards:[{id:'pulse',kind:c.region==='nx'?'laser':'electric',x:408,y:F-36,width:24,height:36,warning:1.3,active:.65,period:5.4,damage:8}]});
    if(c.id==='cache-stairs')r.entities.gates.push({...box('ttl-shortcut',624,F-128,16,128),opensWhen:{component:'cache-crown:ttl'}});
    if(c.id==='resolve-exit')r.entities.gates.push({...box('resolution-lock',464,16,16,F-16),opensWhen:complete});
    const blocks=[],traces=[],lights=[];
    if(c.region==='com')for(let i=0;i<3;i++){blocks.push(box('file-tower-'+i,80+i*176,64,112,288));for(let j=0;j<4;j++)traces.push(box('file-slot-'+i+'-'+j,96+i*176,96+j*56,80,8));}
    else if(c.region==='org')for(let i=0;i<4;i++){blocks.push(box('org-terrace-'+i,48+i*144,208-i*32,112,32));traces.push(box('org-column-'+i,88+i*144,96,16,240));}
    else if(c.region==='cache')for(let i=0;i<4;i++){blocks.push(box('cache-bank-'+i,96,80+i*64,448,32));traces.push(box('recursive-path-'+i,160+i*96,64,8,288));}
    else {blocks.push(box('resolver-server',224,96,256,240));for(let i=0;i<4;i++)traces.push(box('resolver-path-'+i,48,128+i*48,544,8));}
    for(let i=0;i<4;i++)lights.push(box('query-led-'+i,112+i*128,64,16,8));
    const region=regions.find(r=>r.id===c.region);
    r.layers.push({id:'domain-architecture',type:'rects',pass:'background',color:c.region==='nx'?'#302038':'#20243c',rects:blocks},{id:'dns-traces',type:'rects',pass:'background',color:'#3c395c',rects:traces},{id:'quiet-query-lights',type:'rects',pass:'background',color:c.region==='nx'?'#79566c':'#5a648b',rects:lights},
      {id:'dns-landmarks',type:'computer-world',theme:'dns',pass:'midground',items:[{kind:c.region==='root'?'domain-root':c.region==='nx'?'domain-false':c.region==='cache'?'terminal':c.region==='resolution'?'gateway':'domain-room',x:240,y:112,width:192,height:176,label:region.name+' / '+c.id.toUpperCase()},{kind:'rack',x:480,y:80,width:80,height:128,label:''}]});
    return r;
  }
  g.registerGenerator({id:'dns-domain-vault',version:5,generate({config,random}){return build(config,random);}});
  const placements=cells.map(c=>{if(c.role==='secret')return {id:c.id,x:c.col*W,y:c.row*H,generator:'dns-domain-vault',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.col*W,y:c.row*H,template:room.id};});
  const links=[];
  for(const c of cells)for(const side of ['east','south'])if(c.ports[side]){const [dx,dy]=directions[side],other=grid.get((c.col+dx)+','+(c.row+dy));links.push({from:{room:c.id,socket:side},to:{room:other.id,socket:side==='east'?'west':'north'}});}
  const requiredGuardians=cells.filter(c=>c.region!=='nx').flatMap(c=>Array.from({length:enemyCount(c)},(_,i)=>c.id+':domain-virus-'+i));
  const plan={id:'phase-08',name:'DNS - O complexo dos dominios',theme:'dns',seed:'byte-dns-domains-v3-2026',revision:5,layout:'maze',connectivity:'portal-network',objective:'Restaure sete servicos DNS, navegue entre dominios e elimine os guardioes obrigatorios. NXDOMAIN e um desvio opcional de risco.',size:{width:11*W,height:10*H},rooms:placements,links,start:{room:'root-core',anchor:'entry'},exit:{room:'resolve-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:false,enemiesToDefeat:requiredGuardians.length,requireExitQuestion:true,goals:[{id:'required-guardians',type:'defeat',ids:requiredGuardians}]}};
  const phase=api.maps.clone(g.compile(plan));phase.map.checkpointMode='free';phase.palette=['#101329','#2d2a4a','#c6afff','#70648f','#8accea'];
  phase.map.regions=regions.map(region=>({...region,areas:cells.filter(c=>c.region===region.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'root-queries',label:'RAIZ / .COM / .ORG / CACHE'},{id:'delegations',label:'DELEGACOES ENTRE DOMINIOS'},{id:'recursive-loop',label:'CACHE VERTICAL / TTL / ATALHOS'},{id:'nxdomain',label:'RISCO OPCIONAL / RECOMPENSAS'},{id:'resolution',label:'RESOLUCAO / RETORNO / SAIDA'}];
  phase.generation.architecture={version:3,mode:'domain-campuses-and-recursive-portals',regions:regions.map(r=>r.name),rooms:cells.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:cells.filter(c=>c.region==='nx'||c.role==='secret').map(c=>c.id),optionalEnemies:cells.filter(c=>c.region==='nx').flatMap(c=>Array.from({length:enemyCount(c)},(_,i)=>c.id+':domain-virus-'+i)),portalEdges,targetMinutes:[15,25],durationMinutes:null,pacing:{root:[2,3],com:[3,5],org:[3,5],cache:[4,7],resolution:[3,5]},optionalRiskMinutes:[2,5]};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));api.maps.register(phase);
})();
