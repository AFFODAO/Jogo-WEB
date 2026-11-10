// Software V3: an asymmetric constellation of OS windows, not a physical room grid.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,copy=api.maps.clone;
  const regions=[{id:'desktop',name:'AREA DE TRABALHO',state:0},{id:'files',name:'SISTEMA DE ARQUIVOS',state:1},{id:'process',name:'GERENCIADOR DE PROCESSOS',state:2},{id:'virtual',name:'MEMORIA VIRTUAL',state:1},{id:'corrupt',name:'ARQUIVOS CORROMPIDOS',state:2},{id:'kernel',name:'NUCLEO DO SISTEMA',state:3}];
  const rooms=[
    ['desktop',1792,2048,1024,640,'desktop','hub'],['dock',2112,2720,640,512,'desktop','secret'],
    ['root',640,1536,640,640,'files','repair'],['documents',0,2240,640,640,'files','combat'],['archive',1024,2944,640,640,'files','exploration'],['recycle',0,3008,640,576,'files','secret'],
    ['scheduler',3136,1536,768,640,'process','repair'],['worker',4224,1856,640,640,'process','combat'],['clock',3392,2240,640,576,'process','timing'],
    ['swap',3328,640,640,768,'virtual','repair'],['pages',4224,512,640,1152,'virtual','tower'],['swap-cache',3328,0,640,512,'virtual','secret'],
    ['quarantine',3072,3008,768,640,'corrupt','combat'],['recovery',4224,2752,640,768,'corrupt','repair'],['infected-vault',4224,3648,640,512,'corrupt','secret'],
    ['kernel-gateway',1792,1024,768,768,'kernel','exploration'],['kernel-io',640,640,640,768,'kernel','combat'],['kernel-stack',1792,256,768,640,'kernel','stack'],['kernel-exit',0,0,1024,512,'kernel','exit']
  ].map(([id,x,y,width,height,region,role])=>({id,x,y,width,height,region,role,doors:[]}));
  const byId=new Map(rooms.map(r=>[r.id,r]));
  const repairs={root:['index','RESTAURAR INDICE DE ARQUIVOS'],scheduler:['scheduler','RESTAURAR ESCALONADOR'],swap:['paging','RESTAURAR PAGINACAO'],recovery:['recovery','RECONSTRUIR ARQUIVOS'],'kernel-stack':['kernel','RESTAURAR PROCESSOS DO NUCLEO']};
  const restored={all:Object.entries(repairs).slice(0,4).map(([room,[id]])=>({component:room+':'+id}))};
  const edges=[
    ['desktop','dock'],['desktop','root'],['root','documents'],['documents','archive'],['archive','root'],['documents','recycle'],
    ['desktop','scheduler'],['scheduler','worker'],['worker','clock'],['clock','scheduler'],
    ['desktop','swap',{component:'scheduler:scheduler'}],['swap','pages'],['pages','swap-cache'],['pages','scheduler'],['archive','swap'],
    ['desktop','quarantine'],['quarantine','recovery'],['recovery','infected-vault',{component:'recovery:recovery'}],['clock','quarantine'],['archive','quarantine',{component:'root:index'}],
    ['desktop','kernel-gateway',restored],['kernel-gateway','kernel-io'],['kernel-io','kernel-stack'],['kernel-stack','kernel-exit'],['kernel-exit','kernel-gateway',{component:'kernel-stack:kernel'}]
  ];
  for(const [a,b,requires] of edges){byId.get(a).doors.push({to:b,requires});byId.get(b).doors.push({to:a,requires});}
  function build(c,random){
    const w=c.width,h=c.height,f=h-48,mid=w/2,r={id:'sw-'+c.id,version:5,width:w,height:h,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:f-48}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const box=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144)=>r.entities.platforms.push({...box(id,x,y,width,16),type:'fixed',collision:'one-way',style:'window'});
    const gap=c.role==='timing';
    if(gap){r.ground.push(box('left-interface',0,f,mid-96,48),box('right-interface',mid+128,f,w-mid-128,48),box('recovery-floor',mid-96,h-16,224,16));fixed('safe-thread',mid-32,f-64,112);}
    else r.ground.push(box('interface',0,f,w,48));
    r.entities.obstacles.push(box('frame-left',0,0,16,f),box('frame-right',w-16,0,16,f),box('title-frame',16,0,w-32,16));
    // Portals land only on permanent supports. Tall windows have genuine vertical courses.
    const slots=c.doors.map((door,i)=>{
      if(c.role==='tower'&&i===1)return {x:mid-24,y:96};
      if(c.role==='tower'&&i===2)return {x:mid-24,y:f-384};
      if(c.role==='stack'&&i>0)return {x:mid-24,y:128};
      return [{x:48,y:f},{x:w-96,y:f},{x:mid-24,y:f-192},{x:96,y:f-288},{x:w-160,y:f-288},{x:mid-24,y:f-384}][i];
    });
    const highest=Math.min(f-96,...slots.map(s=>s.y));
    const steps=Math.floor((f-highest)/96),tread=c.role==='stack'?96:c.role==='tower'?112:128;
    for(let i=1;i<=steps;i++)fixed('thread-'+i,mid+(i%2?-208:-80),f-i*96,tread);
    for(let i=0;i<slots.length;i++)if(slots[i].y!==f)fixed('door-pad-'+i,Math.max(32,Math.min(w-256,slots[i].x-72)),slots[i].y,224);
    if(slots.some(s=>s.x>w-200&&s.y<f))fixed('thread-east',mid+16,f-288,160);
    if(c.role==='tower'||c.role==='stack')fixed('upper-rest',mid-112,highest,224);
    if(c.role==='secret'){
      const x=random.int(5,8)*16;fixed('hidden-shelf',x,f-96,144);
      r.entities.collectibles.push({id:'hidden-file',x:x+64,y:f-128,radius:10,secret:true},{id:'backup',x:w-176,y:f-30,radius:10,secret:true});
    }else r.entities.collectibles.push({id:'file',x:112,y:f-30,radius:10,secret:false});
    if(['tower','stack'].includes(c.role))r.entities.collectibles.push({id:'upper-file',x:mid,y:highest-30,radius:10,secret:false});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id];r.entities.components.push({id,x:192,y:f-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(1,Object.keys(repairs).indexOf(c.id))});
      r.entities.platforms.push({...box('restored-interface',w-256,f-96,192,16),type:'fixed',collision:'one-way',style:'window',requires:{component:id}});
    }
    if(['desktop','root','scheduler','swap','recovery','kernel-gateway','kernel-stack','kernel-exit','documents'].includes(c.id))r.checkpoints.push({x:64,y:f});
    const enemies=c.role==='combat'?2:['repair','tower','timing','stack','exit'].includes(c.role)?1:0;
    for(let i=0;i<enemies;i++){
      const x=i?mid-64:c.role==='timing'?w-96:w-176,type=c.region==='corrupt'?'armored':i?'shooter':c.region==='process'?'fast':'basic';
      r.entities.enemies.push({id:'process-'+i,type,x,y:f-24,groundY:f,patrolMin:x-48,patrolMax:x+48,navigationBounds:{left:x-48,right:x+48},activationRegion:{x:16,y:32,width:w-32,height:h-48}});
    }
    if(['scheduler','worker','clock','swap','pages'].includes(c.id))r.entities.platforms.push({...box('moving-interface',80,f-208,144,16),type:'moving',collision:'one-way',style:'window',motion:{axis:c.region==='process'?'x':'y',range:48,speed:.55,phase:0}});
    if(['swap','pages','clock','kernel-stack'].includes(c.id))r.entities.platforms.push({...box('volatile-page',w-240,f-288,128,16),type:'temporary',collision:'one-way',style:'window',duration:2.8,respawnDelay:2.2});
    if(['clock','worker','quarantine','kernel-stack'].includes(c.id))r.mechanics.push({id:'process-deadline',type:'parkour-hazards',hazards:[{id:'overload',kind:'laser',x:mid+64,y:f-40,width:24,height:40,warning:1.25,active:.7,period:5.2,damage:8}]});
    const links=c.doors.map((door,i)=>{
      const s=slots[i],target=byId.get(door.to),targetIndex=target.doors.findIndex(d=>d.to===c.id);
      r.anchors['port-'+i]={x:s.x+4,y:s.y-48};
      return {id:'to-'+door.to,x:s.x,y:s.y-76,width:40,height:76,label:target.id.toUpperCase()+(door.requires?' / REPARAR':''),...(door.requires?{requires:door.requires}:{}),to:{room:door.to,anchor:'port-'+targetIndex}};
    });
    r.mechanics.push({id:'directories',type:'portals',links});
    if(c.id==='infected-vault')r.entities.gates.push({...box('quarantine-door',352,32,16,f-32),opensWhen:{component:'recovery:recovery'}});
    if(c.role==='exit'){
      fixed('exit-step',w-448,f-96,160);fixed('exit-shelf',w-304,f-192,160);fixed('exit-dais',w-128,f-192,112);
      r.entities.gates.push({...box('system-lock',w-144,64,16,f-64),opensWhen:{component:'kernel-stack:kernel'}});
      r.anchors.exit={x:w-96,y:f-256};
    }
    const region=regions.find(d=>d.id===c.region),frames=[box('header',24,24,w-48,32),box('pane-a',mid-144,96,288,128)],icons=[];
    if(c.region==='files')for(let i=0;i<3;i++)icons.push(box('folder-'+i,64+i*80,104,48,32));
    else if(c.region==='virtual')for(let i=0;i<3;i++)icons.push(box('page-'+i,mid-96+i*64,128+i*32,40,64));
    else for(let i=0;i<3;i++)icons.push(box('status-'+i,w-152+i*32,32,16,16));
    r.layers.push({id:'window-body',type:'rects',pass:'background',color:'#26223f',rects:frames},{id:'window-icons',type:'rects',pass:'background',color:c.region==='virtual'?'#37536c':'#785078',rects:icons},
      {id:'window-content',type:'computer-world',theme:'software',pass:'midground',items:[{kind:'window-room',x:24,y:72,width:w-48,height:h-128,label:region.name+' / '+c.id.toUpperCase()},{kind:c.region==='files'?'folder':c.region==='kernel'?'core':'terminal',x:mid-96,y:96,width:192,height:128,label:c.region==='corrupt'?'ERRO / DADOS DANIFICADOS':''}]});
    return r;
  }
  g.registerGenerator({id:'software-v3-vault',version:5,generate({config,random}){return build(config,random);}});
  const placements=rooms.map(c=>{if(c.role==='secret')return {id:c.id,x:c.x,y:c.y,generator:'software-v3-vault',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.x,y:c.y,template:room.id};});
  const plan={id:'phase-02',name:'Software — O sistema corrompido',theme:'software',seed:'byte-software-v3-2026',revision:5,layout:'hub',connectivity:'portal-network',
    objective:'Explore as janelas, restaure arquivos, processos e memoria virtual, remova a corrupcao e recupere o nucleo do sistema.',size:{width:5120,height:4224},rooms:placements,links:[],start:{room:'desktop',anchor:'entry'},exit:{room:'kernel-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true}};
  const phase=copy(g.compile(plan));phase.map.checkpointMode='free';
  phase.map.regions=regions.map(r=>({...r,areas:rooms.filter(c=>c.region===r.id).map(c=>({x:c.x,y:c.y,width:c.width,height:c.height}))}));
  phase.generation.architecture={version:3,mode:'asymmetric-window-constellation',regions:regions.map(r=>r.name),rooms:rooms.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:rooms.filter(c=>c.role==='secret').map(c=>c.id),portalEdges:edges.map(([from,to,requires])=>({from,to,requires})),durationMinutes:null,targetMinutes:[15,25]};
  api.maps.register(phase);
})();
