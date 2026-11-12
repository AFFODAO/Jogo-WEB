/* Stage 1 rules: physical assembly only. No DOM, drawing or campaign writes. */
(() => {
  'use strict';
  const at=(id,label,x,y,kind,extra={})=>({id,label,x,y,kind,w:104,h:104,...extra});
  const zone=(id,label,x,y,w=112,h=112)=>at(id,label,x,y,'hardware-socket',{mode:'target',w,h});
  const tap=id=>({id}),drop=(id,target)=>({id,target});
  function shared(m){
    m.rejected=null;m.rejectFor=0;
    m.reject=(id,text)=>{m.rejected=id;m.rejectFor=.8;m.message=text;};
    m.clearRejection=()=>{m.rejected=null;m.rejectFor=0;};
    m.advanceFeedback=dt=>{m.rejectFor=Math.max(0,m.rejectFor-dt);};
  }
  function cpu(m){
    shared(m);m.orientation=1+m.int(3);m.picked=false;m.seated=false;m.leverClosed=false;m.activation=0;
    m.controls=()=>[
      zone('cpu-socket','Soquete do processador · triângulo no canto superior esquerdo',320,200,188,188),
      at('cpu','Processador · marcador na posição '+(m.orientation+1),m.seated?320:155,m.seated?200:430,'hardware-cpu',{
        mode:'drag',w:172,h:172,locked:m.seated,pickAction:'pick-cpu',rotationId:'rotate-cpu',value:m.orientation,
        targets:[{id:'cpu-socket',x:320,y:200,w:188,h:188}]}),
      at('rotate-cpu','Girar processador 90 graus',410,430,'hardware-rotate',{locked:m.seated}),
      at('cpu-lever','Fechar alavanca de retenção',540,210,'hardware-lever',{locked:m.leverClosed,on:m.leverClosed})
    ];
    m.act=a=>{
      if(a.id==='pick-cpu'&&!m.seated)m.picked=true;
      if(a.id==='rotate-cpu'&&!m.seated){m.orientation=(m.orientation+1)%4;m.clearRejection();}
      if(a.id==='cpu'&&a.target){
        if(a.target!=='cpu-socket')return;
        if(m.orientation!==0){m.reject('cpu-socket','Alinhe os dois triângulos antes de encaixar o processador.');return;}
        m.seated=true;m.insertedAt=m.time;m.clearRejection();
      }
      if(a.id==='cpu-lever'&&!m.leverClosed){
        if(!m.seated){m.fail('Encaixe o processador alinhado antes de fechar a alavanca.');m.reject('cpu-socket',m.message);return;}
        m.leverClosed=true;m.lockedAt=m.time;
      }
    };
    m.tick=dt=>{m.advanceFeedback(dt);if(m.leverClosed){m.activation=Math.min(1,m.activation+dt/0.8);m.done=m.activation===1;}};
    m.next=()=>m.orientation!==0?tap('rotate-cpu'):!m.seated?drop('cpu','cpu-socket'):!m.leverClosed?tap('cpu-lever'):{wait:true,message:'O soquete está travando e ativando o processador.'};
  }
  function ram(m){
    shared(m);m.slotTypes=m.shuffle([0,1,2]);m.slots=[-1,-1,-1];m.insertedAt=[-10,-10,-10];m.settle=0;
    const sockets=()=>m.slotTypes.map((type,i)=>({id:'dimm-slot'+i,x:140+i*180,y:190,w:112,h:148,type}));
    m.controls=()=>[
      ...sockets().map((s,i)=>zone(s.id,'Slot '+(i+1)+' · entalhe '+(s.type+1),s.x,s.y,s.w,s.h)),
      ...[0,1,2].map(i=>{const slot=m.slots.indexOf(i);return at('ram'+i,'Módulo '+String.fromCharCode(65+i)+' · entalhe '+(i+1),slot<0?140+i*180:140+slot*180,slot<0?440:190,'hardware-ram',{
        mode:'drag',w:112,h:160,number:i+1,locked:slot>=0,targets:sockets()});})
    ];
    m.act=a=>{
      if(!/^ram[0-2]$/.test(a.id)||!a.target)return;
      const part=Number(a.id.at(-1)),slot=sockets().findIndex(s=>s.id===a.target);
      if(slot<0)return;
      if(m.slotTypes[slot]!==part){m.reject(a.target,'O entalhe deste módulo não combina com este slot.');return;}
      if(m.slots[slot]>=0||m.slots.includes(part)){m.reject(a.target,'Este slot já está ocupado.');return;}
      m.slots[slot]=part;m.insertedAt[slot]=m.time;m.settle=0;m.clearRejection();
    };
    m.tick=dt=>{m.advanceFeedback(dt);if(m.slots.every(v=>v>=0)){m.settle+=dt;m.done=m.settle>=.5;}};
    m.next=()=>{const part=[0,1,2].find(i=>!m.slots.includes(i));return part===undefined?{wait:true,message:'As presilhas estão travando e os LEDs estão acendendo.'}:drop('ram'+part,'dimm-slot'+m.slotTypes.indexOf(part));};
  }
  function power(m){
    shared(m);m.socketTypes=m.shuffle([0,1,2]);m.connections=[-1,-1,-1];m.insertedAt=[-10,-10,-10];m.charge=0;
    const names=['ATX · 24 contatos','CPU · 8 contatos','GPU · 6 contatos'];
    const sockets=()=>m.socketTypes.map((type,i)=>({id:'power-socket'+i,x:500,y:110+i*165,w:120,h:112,type}));
    m.controls=()=>[
      ...sockets().map(s=>zone(s.id,'Conector '+names[s.type],s.x,s.y,s.w,s.h)),
      ...m.connections.map((slot,i)=>at('power-cable'+i,'Cabo '+names[i],slot<0?260:500,slot<0?110+i*165:110+slot*165,'hardware-plug',{
        mode:'drag',w:112,h:112,number:i+1,locked:slot>=0,targets:sockets()}))
    ];
    m.act=a=>{
      if(!/^power-cable[0-2]$/.test(a.id)||!a.target)return;
      const part=Number(a.id.at(-1)),slot=sockets().findIndex(s=>s.id===a.target);
      if(slot<0)return;
      if(m.socketTypes[slot]!==part){m.reject(a.target,'A chave e a quantidade de contatos precisam coincidir.');return;}
      if(m.connections.includes(slot)||m.connections[part]>=0)return;
      m.connections[part]=slot;m.insertedAt[part]=m.time;m.charge=0;m.clearRejection();
    };
    m.tick=dt=>{m.advanceFeedback(dt);if(m.connections.every(v=>v>=0)){m.charge=Math.min(1,m.charge+dt/.85);m.done=m.charge===1;}};
    m.next=()=>{const i=m.connections.findIndex(v=>v<0);return i<0?{wait:true,message:'A alimentação está percorrendo os circuitos da placa.'}:drop('power-cable'+i,'power-socket'+m.socketTypes.indexOf(i));};
  }
  function fan(m){
    shared(m);m.oldCable=true;m.oldRemoved=false;m.installed=false;m.mounts=[false,false,false,false];m.torque=[0,0,0,0];m.connected=false;m.rpm=0;m.temperature=86;m.stable=0;
    const mounts=[[150,90],[490,90],[150,300],[490,300]];
    m.controls=()=>[
      ...(!m.oldRemoved?[at('unplug-old','Desconectar cabo da ventoinha avariada',535,195,'hardware-unplug',{locked:!m.oldCable}),
        at('old-fan','Retirar ventoinha avariada',320,185,'hardware-old-fan',{mode:'drag',w:196,h:196,locked:m.oldCable,targets:[{id:'fan-bin',x:490,y:445,w:128,h:128}]}),
        zone('fan-bin','Bandeja para a ventoinha avariada',490,445,128,128)]:[]),
      at('new-fan','Instalar ventoinha de reposição',m.installed?320:140,m.installed?185:445,'hardware-fan',{
        mode:'drag',w:164,h:164,locked:!m.oldRemoved||m.installed,targets:[{id:'fan-mount',x:320,y:185,w:196,h:196}]}),
      ...(m.oldRemoved&&!m.installed?[zone('fan-mount','Alojamento da ventoinha',320,185,196,196)]:[]),
      ...(m.installed?mounts.map(([x,y],i)=>at('fan-screw'+i,'Fixar apoio '+(i+1),x,y,'hardware-bolt',{mode:'dial',value:m.torque[i],max:2,locked:m.mounts[i]})):[]),
      ...(m.installed&&m.mounts.every(Boolean)?[
        at('fan-cable','Conectar cabo da ventoinha',m.connected?535:320,m.connected?195:445,'hardware-fan-plug',{mode:'drag',w:112,h:112,locked:m.connected,targets:[{id:'fan-header',x:535,y:195,w:112,h:112}]}),
        zone('fan-header','Conector de quatro pinos da ventoinha',535,195,112,112)]:[])
    ];
    m.act=a=>{
      if(a.id==='unplug-old')m.oldCable=false;
      if(a.id==='old-fan'&&a.target==='fan-bin'&&!m.oldCable){m.oldRemoved=true;m.removedAt=m.time;}
      if(a.id==='new-fan'&&a.target==='fan-mount'&&m.oldRemoved){m.installed=true;m.insertedAt=m.time;}
      if(/^fan-screw[0-3]$/.test(a.id)&&m.installed){const i=Number(a.id.at(-1));m.torque[i]=Math.max(0,Math.min(2,a.value??m.torque[i]+1));if(m.torque[i]===2){m.mounts[i]=true;m.fastenedAt=m.time;}}
      if(a.id==='fan-cable'&&a.target==='fan-header'&&m.installed&&m.mounts.every(Boolean)){m.connected=true;m.connectedAt=m.time;}
    };
    m.tick=dt=>{
      m.advanceFeedback(dt);if(!m.connected)return;
      m.rpm=Math.min(1600,m.rpm+dt*1400);m.temperature=Math.max(54,m.temperature-dt*14);
      if(m.temperature===54){m.stable+=dt;m.done=m.stable>=.5;}
    };
    m.next=()=>{
      if(m.oldCable)return tap('unplug-old');if(!m.oldRemoved)return drop('old-fan','fan-bin');if(!m.installed)return drop('new-fan','fan-mount');
      const i=m.mounts.findIndex(v=>!v);if(i>=0)return {id:'fan-screw'+i,value:2};
      return !m.connected?drop('fan-cable','fan-header'):{wait:true,message:'Aguarde a ventoinha estabilizar a temperatura em 54 °C.'};
    };
  }
  ByteRunner.hardwareRepairModels=Object.freeze({'cpu-install':cpu,'ram-install':ram,'power-wiring':power,'fan-replacement':fan});
})();
