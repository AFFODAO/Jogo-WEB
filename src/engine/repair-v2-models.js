/* Physical repair rules. No DOM, canvas, clock or campaign mutations here. */
(() => {
  'use strict';
  const factories=new Map();
  const mod=(n,d)=>(n%d+d)%d,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const control=(id,label,x,y,kind='lever',extra={})=>({id,label,x,y,w:104,h:104,kind,...extra});
  const tap=id=>({id}),set=(id,value)=>({id,value}),drop=(id,target)=>({id,target});
  function base(random,options={}){
    const m={done:false,error:false,message:'',revision:0,time:0,difficulty:clamp(options.difficulty??3,1,5),componentId:options.componentId,controls:()=>[],next:()=>null,
      int:n=>Math.floor(random()*n),fail(text='O mecanismo não está pronto.'){this.error=true;this.message=text;},
      apply(action){this.error=false;this.message='';this.act(action);this.revision++;},
      shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=this.int(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}};
    return m;
  }
  function register(id,build){factories.set(id,build);}
  for(const [id,build] of Object.entries(ByteRunner.hardwareRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.softwareRepairModels))register(id,build);
  register('packet-diverter',m=>{
    m.routes=[0,0];m.packets=m.shuffle(Array.from({length:4+m.difficulty},(_,i)=>i%3));m.index=0;
    m.controls=()=>[control('fork0','Desviador principal',210,260,'fork',{mode:'dial',value:m.routes[0],max:1,mark:m.packets[m.index]===0?0:1}),
      control('fork1','Desviador secundário',425,260,'fork',{mode:'dial',value:m.routes[1],max:1,mark:m.packets[m.index]===2?1:0}),control('send','Soltar pacote',100,440,'escapement')];
    m.act=a=>{if(a.id.startsWith('fork'))m.routes[+a.id.at(-1)]=mod(a.value??m.routes[+a.id.at(-1)]+1,2);
      if(a.id==='send'){const destination=m.routes[0]===0?0:m.routes[1]===0?1:2;if(destination===m.packets[m.index]){m.index++;m.done=m.index===m.packets.length;}else m.fail('O pacote chegou a uma saída diferente do selo.');}};
    m.next=()=>m.routes[0]!==Number(m.packets[m.index]!==0)?set('fork0',Number(m.packets[m.index]!==0)):m.packets[m.index]>0&&m.routes[1]!==Number(m.packets[m.index]===2)?set('fork1',Number(m.packets[m.index]===2)):tap('send');
  });
  register('patch-leads',m=>{
    m.order=m.shuffle([0,1,2]);m.links=[-1,-1,-1];
    m.controls=()=>m.links.map((v,i)=>control('lead'+i,'Conectar cabo '+(i+1)+' à porta '+(m.order[i]+1),v<0?140:490,130+(v<0?i:v)*155,'plug',{
      mode:'drag',target:{x:490,y:130+m.order[i]*155},locked:v>=0,number:i+1}));
    m.act=a=>{if(a.id.startsWith('lead')&&a.target)m.links[+a.id.at(-1)]=m.order[+a.id.at(-1)];m.done=m.links.every(v=>v>=0);};
    m.next=()=>{const i=m.links.findIndex(v=>v<0);return drop('lead'+i,true);};
  });
  register('vlan-shutters',m=>{
    m.shutters=[0,0,0];m.target=[1,2,1];
    m.controls=()=>m.shutters.map((v,i)=>control('shutter'+i,'Mover divisória '+(i+1),130+i*190,280,'shutter',{mode:'rail',value:v,max:2,mark:m.target[i]})).concat(control('pulse','Liberar sinal',520,455,'power'));
    m.act=a=>{if(a.id.startsWith('shutter'))m.shutters[+a.id.at(-1)]=clamp(a.value??m.shutters[+a.id.at(-1)]+1,0,2);if(a.id==='pulse'){if(same(m.shutters,m.target))m.done=true;else m.fail('O sinal vazou entre os grupos.');}};
    m.next=()=>{const i=m.shutters.findIndex((v,i)=>v!==m.target[i]);return i<0?tap('pulse'):set('shutter'+i,m.target[i]);};
  });
  register('uplink-clutch',m=>{
    m.speed=[0,0];m.lock=[false,false];m.target=[1+m.int(3),1+m.int(3)];
    m.controls=()=>m.speed.flatMap((v,i)=>[control('wheel'+i,'Regular volante '+(i+1),170+i*300,200,'wheel',{mode:'dial',value:v,max:4,mark:m.target[i],locked:m.lock[i]}),control('clutch'+i,'Acoplar transmissão '+(i+1),170+i*300,410,'clutch',{on:m.lock[i]})]);
    m.act=a=>{const i=+a.id.at(-1);if(a.id.startsWith('wheel')&&!m.lock[i])m.speed[i]=mod(a.value??m.speed[i]+1,5);
      if(a.id.startsWith('clutch')){if(m.speed[i]===m.target[i])m.lock[i]=true;else m.fail('Iguale as marcas antes de engatar.');}m.done=m.lock.every(Boolean);};
    m.next=()=>{const i=m.lock.findIndex(v=>!v);return m.speed[i]===m.target[i]?tap('clutch'+i):set('wheel'+i,m.target[i]);};
  });
  register('route-rail',m=>{
    m.tiles=[0,1,2,3,4,5];m.history=[];let blank=5;
    const neighbors=i=>[i%3?i-1:-1,i%3<2?i+1:-1,i>2?i-3:i+3].filter(v=>v>=0);
    for(let n=0;n<14;n++){const next=m.shuffle(neighbors(blank))[0];[m.tiles[blank],m.tiles[next]]=[m.tiles[next],m.tiles[blank]];m.history.push(blank);blank=next;}
    if(same(m.tiles,[0,1,2,3,4,5])){[m.tiles[5],m.tiles[4]]=[m.tiles[4],m.tiles[5]];m.history.push(5);}
    m.controls=()=>m.tiles.flatMap((v,i)=>v===5?[]:[control('tile'+i,'Deslizar trilho '+(v+1),155+(i%3)*165,175+Math.floor(i/3)*165,'rail',{number:v+1})]);
    m.act=a=>{const i=+a.id.slice(4),empty=m.tiles.indexOf(5);if(neighbors(empty).includes(i)){[m.tiles[i],m.tiles[empty]]=[m.tiles[empty],m.tiles[i]];
      if(m.history.at(-1)===i)m.history.pop();else m.history.push(empty);}m.done=same(m.tiles,[0,1,2,3,4,5]);};
    m.next=()=>tap('tile'+m.history.at(-1));
  });
  register('interface-crimp',m=>{
    m.strip=0;m.contact=0;m.phase=0;m.target=2+m.int(2);
    m.controls=()=>[control('strip','Desencapar até a marca',200,220,'stripper',{mode:'rail',value:m.strip,max:4,mark:m.target}),
      control('contact','Alinhar contatos',440,220,'comb',{mode:'rail',value:m.contact,max:3,mark:2}),control('press','Prensar terminação',320,430,'press')];
    m.act=a=>{if(a.id==='strip')m.strip=clamp(a.value??m.strip+1,0,4);if(a.id==='contact')m.contact=clamp(a.value??m.contact+1,0,3);
      if(a.id==='press'){if(m.strip===m.target&&m.contact===2)m.done=true;else m.fail('Alinhe a bainha e os contatos às marcas da prensa.');}};
    m.next=()=>m.strip!==m.target?set('strip',m.target):m.contact!==2?set('contact',2):tap('press');
  });
  register('gateway-periscope',m=>{
    m.tunnel=0;m.target=1+m.int(3);m.open=[false,false,false,false];
    m.controls=()=>[control('scope','Girar periscópio',240,260,'scope',{mode:'dial',value:m.tunnel,max:3,mark:m.target}),control('shutter','Abrir túnel observado',500,190,'gate',{on:m.open[m.tunnel]}),control('probe','Enviar sonda',500,410,'probe')];
    m.act=a=>{if(a.id==='scope')m.tunnel=mod(a.value??m.tunnel+1,4);if(a.id==='shutter')m.open[m.tunnel]=!m.open[m.tunnel];
      if(a.id==='probe'){if(m.tunnel===m.target&&m.open[m.tunnel])m.done=true;else m.fail('A sonda precisa alcançar o farol de retorno.');}};
    m.next=()=>m.tunnel!==m.target?set('scope',m.target):!m.open[m.tunnel]?tap('shutter'):tap('probe');
  });
  register('prefix-cams',m=>{
    m.rings=[0,0];m.target=[1+m.int(3),1+m.int(3)];m.case=0;
    m.controls=()=>m.rings.map((v,i)=>control('cam'+i,'Ajustar faixa '+(i+1),190+i*270,230,'cam',{mode:'dial',value:v,max:4,mark:m.target[i]})).concat(control('test','Soltar esfera de endereço',320,450,'probe'));
    m.act=a=>{if(a.id.startsWith('cam'))m.rings[+a.id.at(-1)]=mod(a.value??m.rings[+a.id.at(-1)]+1,5);
      if(a.id==='test'){if(same(m.rings,m.target)){m.case++;m.done=m.case===3;}else m.fail('A faixa mais específica ainda aponta para outra saída.');}};
    m.next=()=>{const i=m.rings.findIndex((v,i)=>v!==m.target[i]);return i<0?tap('test'):set('cam'+i,m.target[i]);};
  });
  register('dish-gimbal',m=>{
    m.aim=[0,0];m.target=[1+m.int(3),1+m.int(3)];m.fixed=false;
    m.controls=()=>[control('azimuth','Girar azimute',160,410,'wheel',{mode:'dial',value:m.aim[0],max:4,mark:m.target[0]}),control('elevation','Inclinar elevação',470,410,'wheel',{mode:'rail',value:m.aim[1],max:4,mark:m.target[1]}),control('fix','Travar gimbal',530,150,'screw')];
    m.act=a=>{if(a.id==='azimuth')m.aim[0]=mod(a.value??m.aim[0]+1,5);if(a.id==='elevation')m.aim[1]=clamp(a.value??m.aim[1]+1,0,4);
      if(a.id==='fix'){if(same(m.aim,m.target))m.done=true;else m.fail('O feixe ainda está fora do receptor.');}};
    m.next=()=>m.aim[0]!==m.target[0]?set('azimuth',m.target[0]):m.aim[1]!==m.target[1]?set('elevation',m.target[1]):tap('fix');
  });
  register('spectrum-tuner',m=>{
    m.frequency=0;m.width=0;m.clean=2+m.int(2);
    m.controls=()=>[control('frequency','Sintonizar frequência',180,370,'tuner',{mode:'dial',value:m.frequency,max:5,mark:m.clean}),control('width','Regular largura da faixa',440,370,'lever',{mode:'rail',value:m.width,max:2,mark:1}),control('transmit','Transmitir portadora',530,160,'power')];
    m.act=a=>{if(a.id==='frequency')m.frequency=mod(a.value??m.frequency+1,6);if(a.id==='width')m.width=clamp(a.value??m.width+1,0,2);
      if(a.id==='transmit'){if(m.frequency===m.clean&&m.width===1)m.done=true;else m.fail('A faixa precisa caber no intervalo sem ruído.');}};
    m.next=()=>m.frequency!==m.clean?set('frequency',m.clean):m.width!==1?set('width',1):tap('transmit');
  });
  register('rf-compressor',m=>{
    m.pressure=0;m.pulses=0;m.target=2+m.int(3);
    m.controls=()=>[control('pump','Bombear amplificador',145,370,'pump'),control('bleed','Aliviar pressão',470,370,'valve'),control('pulse','Emitir pulso',320,165,'power')];
    m.act=a=>{if(a.id==='pump')m.pressure=Math.min(6,m.pressure+1);if(a.id==='bleed')m.pressure=Math.max(0,m.pressure-1);
      if(a.id==='pulse'){if(m.pressure===m.target){m.pulses++;m.pressure=0;m.done=m.pulses===3;}else m.fail('A pressão deve ficar na faixa iluminada.');}};
    m.next=()=>m.pressure<m.target?tap('pump'):m.pressure>m.target?tap('bleed'):tap('pulse');
  });
  register('repeater-mast',m=>{
    m.height=[0,0];m.reflector=0;m.target=[2+m.int(2),1+m.int(2),1+m.int(3)];
    m.controls=()=>[0,1].map(i=>control('mast'+i,'Estender mastro '+(i+1),150+i*330,300,'mast',{mode:'rail',value:m.height[i],max:3,mark:m.target[i]})).concat(control('reflector','Orientar rebatedor',320,455,'mirror',{mode:'dial',value:m.reflector,max:3,mark:m.target[2]}));
    m.act=a=>{if(a.id.startsWith('mast'))m.height[+a.id.at(-1)]=clamp(a.value??m.height[+a.id.at(-1)]+1,0,3);if(a.id==='reflector')m.reflector=mod(a.value??m.reflector+1,4);m.done=same([...m.height,m.reflector],m.target);};
    m.next=()=>{const i=m.height.findIndex((v,i)=>v!==m.target[i]);return i<0?set('reflector',m.target[2]):set('mast'+i,m.target[i]);};
  });
  register('rj45-comb',m=>{
    m.order=m.shuffle([0,1,2,3,4,5,6,7]);m.pins=Array(8).fill(-1);m.cut=false;
    const pos=(i,base)=>({x:85+(i%4)*155,y:base+Math.floor(i/4)*105});
    m.controls=()=>m.order.map((v,i)=>{const placed=m.pins.indexOf(i),p=pos(placed<0?i:placed,placed<0?100:308);return control('wire'+i,'Fio '+(i+1)+' no pino '+(v+1),p.x,p.y,'wire',{mode:'drag',target:pos(v,308),locked:placed>=0,number:i+1,w:96,h:96});}).concat(control('press','Cortar e crimpar',320,510,'press',{w:200,h:96}));
    m.act=a=>{if(a.id.startsWith('wire')&&a.target){const i=+a.id.slice(4);m.pins[m.order[i]]=i;}if(a.id==='press'){if(m.pins.every(v=>v>=0))m.done=true;else m.fail('Passe todos os fios pelo pente antes de prensar.');}};
    m.next=()=>{const i=m.order.findIndex((v,i)=>!m.pins.includes(i));return i<0?tap('press'):drop('wire'+i,true);};
  });
  register('continuity-trace',m=>{
    m.probe=-1;m.measured=[false,false,false];m.repaired=[false,false,false];m.break=m.int(3);
    m.controls=()=>[control('probe','Levar ponta de prova à ruptura',110,420,'probe',{mode:'drag',target:{x:160+m.break*160,y:200}}),...m.measured.map((v,i)=>control('section'+i,'Medir trecho '+(i+1),160+i*160,200,'junction',{on:v})),control('patch','Aplicar emenda',490,420,'solder')];
    m.act=a=>{if(a.id==='probe'&&a.target){m.probe=m.break;m.measured[m.break]=true;}if(a.id.startsWith('section')){m.probe=+a.id.at(-1);m.measured[m.probe]=true;}
      if(a.id==='patch'){if(m.probe===m.break&&m.measured[m.break])m.done=true;else m.fail('Localize o trecho sem continuidade antes de emendar.');}};
    m.next=()=>m.probe!==m.break?drop('probe',true):tap('patch');
  });
  register('cable-reel',m=>{
    m.conduit=0;m.length=0;m.required=3+m.int(3);m.target=1+m.int(2);
    m.controls=()=>[control('conduit','Escolher conduíte',450,200,'fork',{mode:'dial',value:m.conduit,max:2,mark:m.target}),control('reel','Desenrolar carretel',170,340,'reel',{mode:'dial',value:m.length,max:6,mark:m.required}),control('tension','Travar chegada',500,440,'clip')];
    m.act=a=>{if(a.id==='conduit')m.conduit=mod(a.value??m.conduit+1,3);if(a.id==='reel')m.length=mod(a.value??m.length+1,7);
      if(a.id==='tension'){if(m.conduit===m.target&&m.length===m.required)m.done=true;else m.fail('Use o conduíte aberto e deixe a folga na marca.');}};
    m.next=()=>m.conduit!==m.target?set('conduit',m.target):m.length!==m.required?set('reel',m.required):tap('tension');
  });
  register('fiber-splice',m=>{
    m.clean=[0,0];m.align=[0,0];m.target=[1+m.int(3),1+m.int(3)];
    m.controls=()=>[0,1].flatMap(i=>[control('face'+i,'Limpar face '+(i+1),170+i*300,140,'fiber',{mode:'stroke',value:m.clean[i],max:3}),control('axis'+i,'Alinhar núcleo '+(i+1),170+i*300,330,'micrometer',{mode:'rail',value:m.align[i],max:4,mark:m.target[i]})]).concat(control('fuse','Fundir fibra',320,470,'power'));
    m.act=a=>{const i=+a.id.at(-1);if(a.id.startsWith('face'))m.clean[i]=clamp(a.value??m.clean[i]+1,0,3);if(a.id.startsWith('axis'))m.align[i]=clamp(a.value??m.align[i]+1,0,4);
      if(a.id==='fuse'){if(m.clean.every(v=>v===3)&&same(m.align,m.target))m.done=true;else m.fail('Limpe as faces e alinhe os núcleos antes da fusão.');}};
    m.next=()=>{let i=m.clean.findIndex(v=>v<3);if(i>=0)return set('face'+i,3);i=m.align.findIndex((v,i)=>v!==m.target[i]);return i<0?tap('fuse'):set('axis'+i,m.target[i]);};
  });
  register('lease-pneumatics',m=>{
    m.valve=0;m.address=0;m.client=0;m.leases=[-1,-1,-1];m.order=m.shuffle([0,1,2]);
    m.controls=()=>[control('valve','Direcionar tubo do cliente',190,210,'valve',{mode:'dial',value:m.valve,max:2,mark:m.order[m.client]}),control('address','Girar tambor de endereços',450,210,'drum',{mode:'dial',value:m.address,max:3,mark:m.client+1}),control('emit','Emitir concessão',320,440,'pump')];
    m.act=a=>{if(a.id==='valve')m.valve=mod(a.value??m.valve+1,3);if(a.id==='address')m.address=mod(a.value??m.address+1,4);
      if(a.id==='emit'){if(m.valve===m.order[m.client]&&m.address>0&&!m.leases.includes(m.address)){m.leases[m.valve]=m.address;m.client++;m.done=m.client===3;}else m.fail('O tubo deve atender o cliente aceso com endereço livre.');}};
    m.next=()=>m.valve!==m.order[m.client]?set('valve',m.order[m.client]):m.address!==m.client+1?set('address',m.client+1):tap('emit');
  });
  register('conflict-localizer',m=>{
    m.head=0;m.duplicate=1+m.int(2);m.scanned=[false,false,false];
    m.controls=()=>[control('head','Deslocar sonda no barramento',320,200,'scanner',{mode:'rail',value:m.head,max:2,mark:m.duplicate}),control('sample','Ler eco da concessão',140,420,'probe'),control('cut','Reemitir concessão recente',500,420,'breaker')];
    m.act=a=>{if(a.id==='head')m.head=clamp(a.value??m.head+1,0,2);if(a.id==='sample')m.scanned[m.head]=true;
      if(a.id==='cut'){if(m.head===m.duplicate&&m.scanned[m.head])m.done=true;else m.fail('Isole somente o eco duplicado mais recente.');}};
    m.next=()=>m.head!==m.duplicate?set('head',m.duplicate):!m.scanned[m.head]?tap('sample'):tap('cut');
  });
  register('reservation-drum',m=>{
    m.identity=0;m.hole=0;m.bound=0;m.order=m.shuffle([0,1,2]);
    m.controls=()=>[control('drum','Girar identidade MAC',190,240,'drum',{mode:'dial',value:m.identity,max:2,mark:m.order[m.bound]}),control('template','Deslizar gabarito reservado',460,240,'comb',{mode:'rail',value:m.hole,max:2,mark:m.bound}),control('punch','Perfurar reserva',320,450,'press')];
    m.act=a=>{if(a.id==='drum')m.identity=mod(a.value??m.identity+1,3);if(a.id==='template')m.hole=clamp(a.value??m.hole+1,0,2);
      if(a.id==='punch'){if(m.identity===m.order[m.bound]&&m.hole===m.bound){m.bound++;m.done=m.bound===3;}else m.fail('A identidade precisa coincidir com o gabarito reservado.');}};
    m.next=()=>m.identity!==m.order[m.bound]?set('drum',m.order[m.bound]):m.hole!==m.bound?set('template',m.bound):tap('punch');
  });
  register('pool-sluice',m=>{
    m.bounds=[0,6];m.target=[1+m.int(2),4+m.int(2)];m.block=false;
    m.controls=()=>[control('lower','Mover limite inicial',160,230,'sluice',{mode:'rail',value:m.bounds[0],max:6,mark:m.target[0]}),control('upper','Mover limite final',480,230,'sluice',{mode:'rail',value:m.bounds[1],max:6,mark:m.target[1]}),control('reserved','Bloquear reserva interna',160,450,'stop',{on:m.block}),control('flow','Abrir fluxo de concessões',480,450,'valve')];
    m.act=a=>{if(a.id==='lower')m.bounds[0]=clamp(a.value??m.bounds[0]+1,0,6);if(a.id==='upper')m.bounds[1]=clamp(a.value??m.bounds[1]+1,0,6);if(a.id==='reserved')m.block=!m.block;
      if(a.id==='flow'){if(same(m.bounds,m.target)&&m.block)m.done=true;else m.fail('A eclusa deve excluir as extremidades e a reserva.');}};
    m.next=()=>m.bounds[0]!==m.target[0]?set('lower',m.target[0]):m.bounds[1]!==m.target[1]?set('upper',m.target[1]):!m.block?tap('reserved'):tap('flow');
  });
  register('record-engraver',m=>{
    m.stroke=0;m.name=m.int(3);m.plate=false;m.points=[[110,300],[190,150],[290,310],[385,170],[530,300]];
    m.controls=()=>[control('engrave','Guiar estilete pelo molde',320,250,'engraver',{mode:'stroke',value:m.stroke,max:6,w:450,h:180}),control('read','Inserir placa gravada',500,455,'reader')];
    m.act=a=>{if(a.id==='engrave')m.stroke=clamp(a.value??m.stroke+1,0,6);if(a.id==='read'){if(m.stroke===6)m.done=true;else m.fail('Complete o sulco do nome até o endereço.');}};
    m.next=()=>m.stroke<6?set('engrave',6):tap('read');
  });
  register('delegation-hoist',m=>{
    m.parent=[-1,-1,-1];m.tree=[0,0,1];
    m.controls=()=>m.parent.map((v,i)=>control('branch'+i,'Içar ramo '+(i+1)+' ao pai '+(m.tree[i]+1),v<0?130+i*180:210+m.tree[i]*230,v<0?420:170+i*70,'branch',{mode:'drag',target:{x:210+m.tree[i]*230,y:170+i*70},locked:v>=0,number:i+1}));
    m.act=a=>{if(a.id.startsWith('branch')&&a.target){const i=+a.id.at(-1);m.parent[i]=m.tree[i];}m.done=same(m.parent,m.tree);};
    m.next=()=>drop('branch'+m.parent.findIndex(v=>v<0),true);
  });
  register('cache-carousel',m=>{
    m.items=m.shuffle([true,false,true,false,true,false]);m.index=0;
    m.controls=()=>[control('keep','Devolver registro válido',160,430,'gate'),control('eject','Ejetar registro vencido',490,430,'eject')];
    m.act=a=>{if((a.id==='keep')===m.items[m.index]){m.index++;m.done=m.index===m.items.length;}else m.fail('Confira o lacre: inteiro permanece, rachado sai.');};
    m.next=()=>tap(m.items[m.index]?'keep':'eject');
  });
  register('query-courier',m=>{
    m.path=[0,1+m.int(2),3,4];m.station=0;m.visited=[0];m.returning=false;
    m.controls=()=>[0,1,2,3,4].map(i=>control('station'+i,['Origem','Raiz','Raiz alternativa','Zona','Autoridade'][i],i===0?100:i===4?540:i===3?430:260,i===1?130:i===2?420:280,'station',{on:m.station===i,number:i+1}));
    m.act=a=>{const i=+a.id.at(-1),target=m.returning?m.path[m.visited.length-2]:m.path[m.visited.length];
      if(i!==target){m.fail('Siga o selo luminoso da próxima referência.');return;}m.station=i;
      if(m.returning){m.visited.pop();m.done=m.visited.length===1;}else{m.visited.push(i);if(i===4)m.returning=true;}};
    m.next=()=>tap('station'+(m.returning?m.path[m.visited.length-2]:m.path[m.visited.length]));
  });
  register('policy-camshaft',m=>{
    m.order=[2,0,1];m.target=[0,1,2];m.selected=null;
    m.controls=()=>m.order.map((v,i)=>control('cam'+i,'Mover came '+(v+1)+' à posição '+(v+1),150+i*170,230,'cam',{mode:'drag',target:{x:150+v*170,y:230},number:v+1})).concat(control('test','Acionar fluxo de teste',320,450,'probe'));
    m.act=a=>{if(a.id.startsWith('cam')&&a.target){const i=+a.id.at(-1),j=m.order[i];[m.order[i],m.order[j]]=[m.order[j],m.order[i]];}
      if(a.id==='test'){if(same(m.order,m.target))m.done=true;else m.fail('A exceção precisa atuar antes da política geral.');}};
    m.next=()=>{const i=m.order.findIndex((v,i)=>v!==i);return i<0?tap('test'):drop('cam'+i,true);};
  });
  register('inspection-airlock',m=>{
    m.gates=[false,false];m.inspected=false;m.cleared=0;m.rules=m.shuffle([true,false,true,false]);
    m.controls=()=>[control('entry','Abrir entrada da eclusa',140,260,'gate',{on:m.gates[0]}),control('inspect','Examinar lacre do fluxo',320,430,'scanner'),control('exit','Liberar saída',500,260,'gate',{on:m.gates[1]}),control('isolate','Desviar para contenção',500,450,'eject')];
    m.act=a=>{if(a.id==='entry'){m.gates[0]=!m.gates[0];if(m.gates[0]&&m.gates[1])m.fail('As duas portas não podem abrir juntas.');}
      if(a.id==='inspect'&&m.gates[0]){m.inspected=true;m.gates[0]=false;}
      if(a.id==='exit'||a.id==='isolate'){
        if(m.inspected&&!m.gates[0]&&((a.id==='exit')===m.rules[m.cleared])){m.cleared++;m.inspected=false;m.gates=[false,false];m.done=m.cleared===4;}
        else m.fail('Examine o lacre e feche a entrada antes de liberar.');}};
    m.next=()=>!m.inspected?tap(m.gates[0]?'inspect':'entry'):tap(m.rules[m.cleared]?'exit':'isolate');
  });
  register('threat-triangulation',m=>{
    m.sensors=[0,0,0];m.target=[1+m.int(3),1+m.int(3),1+m.int(3)];
    m.controls=()=>m.sensors.map((v,i)=>control('sensor'+i,'Orientar sensor '+(i+1),130+i*190,i===1?150:330,'sensor',{mode:'dial',value:v,max:4,mark:m.target[i]})).concat(control('contain','Fechar gaiola de contenção',320,470,'claw'));
    m.act=a=>{if(a.id.startsWith('sensor'))m.sensors[+a.id.at(-1)]=mod(a.value??m.sensors[+a.id.at(-1)]+1,5);if(a.id==='contain'){if(same(m.sensors,m.target))m.done=true;else m.fail('Cruze os três sensores no mesmo foco antes de conter.');}};
    m.next=()=>{const i=m.sensors.findIndex((v,i)=>v!==m.target[i]);return i<0?tap('contain'):set('sensor'+i,m.target[i]);};
  });
  register('shield-iris',m=>{
    m.blades=[0,0,0];m.spring=0;
    m.controls=()=>m.blades.map((v,i)=>control('blade'+i,'Girar lâmina '+(i+1),160+i*160,i===1?150:330,'blade',{mode:'dial',value:v,max:3,mark:2})).concat(control('spring','Tensionar mola',320,470,'spring',{mode:'dial',value:m.spring,max:3,mark:2}));
    m.act=a=>{if(a.id.startsWith('blade')){const i=+a.id.at(-1),delta=mod((a.value??m.blades[i]+1)-m.blades[i],4);m.blades[i]=mod(m.blades[i]+delta,4);m.blades[(i+1)%3]=mod(m.blades[(i+1)%3]+delta,4);}if(a.id==='spring')m.spring=mod(a.value??m.spring+1,4);m.done=m.blades.every(v=>v===2)&&m.spring===2;};
    m.next=()=>{
      for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++){
        if(mod(m.blades[0]+a+c,4)!==2||mod(m.blades[1]+a+b,4)!==2||mod(m.blades[2]+b+c,4)!==2)continue;
        const turns=[a,b,c],i=turns.findIndex(v=>v>0);return i<0?set('spring',2):set('blade'+i,mod(m.blades[i]+turns[i],4));
      }
      return null;
    };
  });
  register('rack-busbars',m=>{
    m.bars=[false,false];m.torque=[0,0];m.isolated=false;
    m.controls=()=>[control('isolate','Isolar barramento',320,100,'breaker',{on:m.isolated}),...m.bars.flatMap((v,i)=>[control('bar'+i,'Inserir ponte condutora '+(i+1),150+i*330,v?255:420,'busbar',{mode:'drag',target:{x:150+i*330,y:255},locked:v}),control('bolt'+i,'Fixar contato '+(i+1),150+i*330,130,'screw',{mode:'dial',value:m.torque[i],max:4,mark:3})]),control('power','Restaurar potência',320,470,'power')];
    m.act=a=>{const i=+a.id.at(-1);if(a.id==='isolate')m.isolated=!m.isolated;if(a.id.startsWith('bar')&&a.target&&m.isolated)m.bars[i]=true;if(a.id.startsWith('bolt'))m.torque[i]=mod(a.value??m.torque[i]+1,5);
      if(a.id==='power'){if(m.isolated&&m.bars.every(Boolean)&&m.torque.every(v=>v===3))m.done=true;else m.fail('Isole a seção, insira as pontes e aperte os contatos.');}};
    m.next=()=>{if(!m.isolated)return tap('isolate');const i=m.bars.findIndex(v=>!v);if(i>=0)return drop('bar'+i,true);const j=m.torque.findIndex(v=>v!==3);return j<0?tap('power'):set('bolt'+j,3);};
  });
  register('replica-flywheels',m=>{
    m.phase=[0,0,0];m.lock=[false,false,false];m.target=[1+m.int(4),1+m.int(4),1+m.int(4)];
    m.controls=()=>m.phase.flatMap((v,i)=>[control('wheel'+i,'Ajustar fase da réplica '+(i+1),130+i*190,220,'wheel',{mode:'dial',value:v,max:5,mark:m.target[i],locked:m.lock[i]}),control('lock'+i,'Acoplar réplica '+(i+1),130+i*190,420,'clutch',{on:m.lock[i]})]);
    m.act=a=>{const i=+a.id.at(-1);if(a.id.startsWith('wheel')&&!m.lock[i])m.phase[i]=mod(a.value??m.phase[i]+1,6);if(a.id.startsWith('lock')){if(m.phase[i]===m.target[i]&&(i===0||m.lock[i-1]))m.lock[i]=true;else m.fail('Acople da esquerda para a direita com as marcas alinhadas.');}m.done=m.lock.every(Boolean);};
    m.next=()=>{const i=m.lock.findIndex(v=>!v);return m.phase[i]===m.target[i]?tap('lock'+i):set('wheel'+i,m.target[i]);};
  });
  register('backbone-prisms',m=>{
    m.positions=[0,0];m.angle=[0,0];m.target=[1+m.int(2),1+m.int(2),1,3];
    m.controls=()=>m.positions.flatMap((v,i)=>[control('rail'+i,'Deslocar prisma '+(i+1),180+i*280,200,'prism',{mode:'rail',value:v,max:3,mark:m.target[i]}),control('angle'+i,'Girar prisma '+(i+1),180+i*280,390,'mirror',{mode:'dial',value:m.angle[i],max:3,mark:m.target[2+i]})]);
    m.act=a=>{const i=+a.id.at(-1);if(a.id.startsWith('rail'))m.positions[i]=clamp(a.value??m.positions[i]+1,0,3);if(a.id.startsWith('angle'))m.angle[i]=mod(a.value??m.angle[i]+1,4);m.done=same([...m.positions,...m.angle],m.target);};
    m.next=()=>{const i=m.positions.findIndex((v,i)=>v!==m.target[i]);if(i>=0)return set('rail'+i,m.target[i]);const j=m.angle.findIndex((v,i)=>v!==m.target[i+2]);return set('angle'+j,m.target[j+2]);};
  });
  register('rack-gantry',m=>{
    m.rail=0;m.cargo=-1;m.source=[0,1,2];m.racks=[[],[]];m.capacity=[3,4];m.weight=[1,2,2];m.nextModule=0;
    m.controls=()=>[control('rail','Mover ponte rolante',320,150,'gantry',{mode:'rail',value:m.rail,max:2,mark:m.cargo<0?0:m.cargo===0?1:2}),control('claw','Baixar garra e transferir',320,440,'claw')];
    m.act=a=>{if(a.id==='rail')m.rail=clamp(a.value??m.rail+1,0,2);if(a.id==='claw'){
      if(m.cargo<0){if(m.rail===0&&m.nextModule<3)m.cargo=m.source[m.nextModule++];else m.fail('Carregue o próximo módulo no rack de origem.');}
      else{const rack=m.rail-1;if(rack<0||m.racks[rack].reduce((n,i)=>n+m.weight[i],0)+m.weight[m.cargo]>m.capacity[rack]||(m.cargo===2&&!m.racks[1].includes(1))){m.fail('O rack precisa ter capacidade e o módulo de suporte.');return;}
        m.racks[rack].push(m.cargo);m.cargo=-1;m.done=m.nextModule===3;}}};
    // Module 2 needs module 1 in the same rack; only the larger rack fits both.
    m.next=()=>{const destination=m.cargo<0?0:m.cargo===0?1:2;return m.rail===destination?tap('claw'):set('rail',destination);};
  });
  for(const [id,build] of Object.entries(ByteRunner.switchRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.routerRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.wifiRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.cablingRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.dhcpRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.dnsRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.firewallRepairModels))register(id,build);
  for(const [id,build] of Object.entries(ByteRunner.serversRepairModels))register(id,build);
  window.ByteRunner.repairV2Models=Object.freeze({
    ids:Object.freeze([...factories.keys()]),
    create(id,random=Math.random,options={}){const build=factories.get(id);if(!build)throw new Error('Unknown physical repair: '+id);const m=base(random,options);build(m);return m;}
  });
})();
