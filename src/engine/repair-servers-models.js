/* Fase final: fontes redundantes, refrigeração, capacidade e dependências do núcleo. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:104,h:96,kind:'servers',...extra});
  const zone=(id,label,x,y,extra={})=>c(id,label,x,y,{mode:'target',...extra});
  const wait={wait:true,message:'Aguarde os testes, a estabilização e a propagação da energia.'};
  function power(m){
    m.isolated=false;m.grounded=false;m.modules=[-1,-1,-1];m.links=[false,false,false];m.starting=false;m.startup=0;
    m.supplies=[{name:'FONTE A',volts:48,watts:800},{name:'FONTE B',volts:48,watts:800},{name:'CONTROLE',volts:12,watts:180}];m.requirements=[{name:'CANAL A',volts:48,watts:600},{name:'CANAL B',volts:48,watts:600},{name:'CONTROLE',volts:12,watts:120}];
    m.compatible=(part,slot)=>m.supplies[part].volts===m.requirements[slot].volts&&m.supplies[part].watts>=m.requirements[slot].watts;
    const bays=()=>m.requirements.map((r,i)=>zone('bay'+i,r.name+' · '+r.volts+' V · mínimo '+r.watts+' W',350,145+i*115,{w:184}));
    const ports=()=>m.requirements.map((r,i)=>zone('port'+i,'Alimentação '+r.name,530,145+i*115));
    m.controls=()=>[...bays(),...ports(),...m.supplies.map((r,i)=>{const slot=m.modules.indexOf(i);return c('supply'+i,r.name+' · '+r.volts+' V · '+r.watts+' W',slot<0?110:350,145+(slot<0?i:slot)*115,{mode:'drag',w:144,locked:!m.isolated||slot>=0||m.starting,targets:bays()});}),...(m.modules.every(v=>v>=0)?m.links.map((v,i)=>c('cable'+i,'Cabo de alimentação '+m.requirements[i].name,v?530:110,145+i*115,{mode:'drag',locked:v||m.starting,targets:ports()})):[]),c('isolate','Abrir o disjuntor e isolar as fontes',90,495,{on:m.isolated,locked:m.isolated||m.starting}),c('ground','Fixar o aterramento do rack',300,495,{on:m.grounded,locked:m.grounded||m.starting}),c('boot','Iniciar o rack e testar as fontes redundantes',535,495,{on:m.starting,locked:m.starting})];
    m.act=a=>{
      if(m.starting||m.done)return;
      if(a.id==='isolate')m.isolated=true;
      if(a.id==='ground'){if(!m.isolated){m.fail('Abra o disjuntor antes de fixar o aterramento.');return;}m.grounded=true;}
      if(/^supply[0-2]$/.test(a.id)&&/^bay[0-2]$/.test(a.target)){const part=+a.id.at(-1),slot=+a.target.at(-1);if(!m.isolated){m.message='Isole as fontes antes de encaixar os módulos.';return;}if(!m.compatible(part,slot)){m.message='Tensão ou potência incompatível com este canal.';return;}if(m.modules[slot]>=0||m.modules.includes(part))return;m.modules[slot]=part;}
      if(/^cable[0-2]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!=='port'+i){m.message='O cabo precisa alimentar seu próprio canal, sem cruzar A, B e controle.';return;}if(m.modules.every(v=>v>=0)&&m.isolated)m.links[i]=true;}
      if(a.id==='boot'){if(!m.isolated||!m.grounded||m.modules.some(v=>v<0)||!m.links.every(Boolean)){m.fail('Isole, aterre, instale as três fontes compatíveis e reconecte os canais antes de iniciar.');return;}m.starting=true;m.isolated=false;m.message='Fechando o disjuntor. Testando redundância, barramentos e serviços do rack…';}
    };
    m.tick=dt=>{if(m.starting)m.startup=Math.min(1,m.startup+dt/2.4);m.done=m.startup===1;};
    m.next=()=>{if(m.starting)return wait;if(!m.isolated)return {id:'isolate'};if(!m.grounded)return {id:'ground'};const slot=m.modules.indexOf(-1);if(slot>=0)return {id:'supply'+m.supplies.findIndex((_,i)=>!m.modules.includes(i)&&m.compatible(i,slot)),target:'bay'+slot};const i=m.links.indexOf(false);return i>=0?{id:'cable'+i,target:'port'+i}:{id:'boot'};};
  }
  function cooling(m){
    m.isolated=false;m.removed=[false,false,false];m.fixed=[false,true,false];m.vents=[1,2,3];m.temperatures=[89,86,93];m.running=false;m.stable=0;
    const tray=zone('discard','Bandeja de ventoinhas avariadas',550,500);
    const bays=()=>[0,1,2].map(i=>zone('fanbay'+i,'Ventilação do rack '+(i+1),140+i*180,175,{w:112,h:112}));
    m.controls=()=>[tray,...bays(),...m.fixed.flatMap((v,i)=>m.removed[i]?[]:[c('damaged'+i,'Ventoinha '+(i+1)+(v?' · íntegra':' · avariada'),140+i*180,175,{mode:'drag',w:112,h:112,locked:v||!m.isolated||m.running,targets:[tray]})]),...[0,2].map((slot,i)=>c('fan'+i,'Ventoinha de reposição do rack '+(slot+1),m.fixed[slot]?140+slot*180:180+i*250,m.fixed[slot]?175:440,{mode:'drag',w:112,h:112,locked:!m.removed[slot]||m.fixed[slot]||m.running,targets:bays()})),...m.vents.map((v,i)=>c('vent'+i,'Direcionar a veneziana '+(i+1)+' para cima, rumo ao rack',140+i*180,320,{mode:'dial',max:3,value:v,mark:0,locked:m.done})),c('isolate','Isolar a alimentação das ventoinhas',90,500,{on:m.isolated,locked:m.isolated||m.running}),c('restart','Ligar a refrigeração da sala',320,500,{on:m.running,locked:m.running})];
    m.act=a=>{
      if(m.done)return;if(a.id==='isolate'&&!m.running)m.isolated=true;
      if(/^damaged[0-2]$/.test(a.id)&&a.target==='discard'){const i=+a.id.at(-1);if(m.fixed[i]){m.message='Preserve a ventoinha íntegra do rack central.';return;}if(!m.isolated||m.running){m.message='Isole a alimentação antes de retirar uma ventoinha.';return;}m.removed[i]=true;}
      if(/^fan[01]$/.test(a.id)&&a.target){const slot=[0,2][+a.id.at(-1)];if(a.target!=='fanbay'+slot){m.message='Instale a reposição no rack correspondente.';return;}if(m.isolated&&m.removed[slot]&&!m.running)m.fixed[slot]=true;}
      if(/^vent[0-2]$/.test(a.id)){const i=+a.id.at(-1);m.vents[i]=((a.value??m.vents[i]+1)%4+4)%4;m.stable=0;}
      if(a.id==='restart'){if(!m.isolated||!m.fixed.every(Boolean)){m.fail('Isole a alimentação e substitua as duas ventoinhas avariadas antes de ligar a refrigeração.');return;}m.running=true;m.isolated=false;m.message='Ventoinhas acionadas. Direcione ar frio aos três racks e estabilize até 55 °C…';}
    };
    m.tick=dt=>{if(!m.running)return;const f=1-Math.exp(-dt*1.8);m.temperatures=m.temperatures.map((temp,i)=>temp+((m.fixed[i]&&m.vents[i]===0?38+i*2:98)-temp)*f);m.stable=m.vents.every(v=>v===0)&&m.temperatures.every(v=>v<=55)?Math.min(1,m.stable+dt/1.4):0;m.done=m.stable===1;};
    m.next=()=>{if(!m.running&&!m.isolated)return {id:'isolate'};for(const slot of [0,2]){if(!m.removed[slot])return {id:'damaged'+slot,target:'discard'};if(!m.fixed[slot])return {id:'fan'+[0,2].indexOf(slot),target:'fanbay'+slot};}const i=m.vents.findIndex(v=>v!==0);return i>=0?{id:'vent'+i,value:0}:m.running?wait:{id:'restart'};};
  }
  function balance(m){
    m.capacities=[10,12,8];m.weights=[6,5,4,3,2,2];m.assignment=[0,0,0,1,1,2];m.plan=[0,1,2,1,0,2];m.testing=false;m.stability=0;
    m.loads=()=>m.capacities.map((_,s)=>m.weights.reduce((sum,w,i)=>sum+(m.assignment[i]===s?w:0),0));
    m.valid=()=>{const usage=m.loads().map((v,i)=>v/m.capacities[i]);return m.assignment.every(v=>v>=0)&&usage.every(v=>v>0&&v<=.85)&&Math.max(...usage)-Math.min(...usage)<=.25+1e-9;};
    const servers=()=>m.capacities.map((v,i)=>zone('server'+i,'Servidor '+(i+1)+' · capacidade '+v+' unidades · limite de uso 85%',110+i*210,220,{w:190,h:240}));
    const parking=zone('parking','Bancada temporária para liberar capacidade durante as trocas',320,430,{w:560,h:88});
    m.controls=()=>[...servers(),parking,...m.weights.map((w,i)=>{const server=m.assignment[i],peers=m.assignment.map((s,j)=>s===server?j:-1).filter(v=>v>=0),slot=peers.indexOf(i);return c('task'+i,'Módulo de processamento '+(i+1)+' · '+w+' unidades de CPU',server<0?75+slot*98:70+server*210+slot%2*80,server<0?430:200+Math.floor(slot/2)*70,{mode:'drag',w:88,h:88,locked:m.testing,targets:[...servers(),parking]});}),c('balance','Validar carga, reserva e equilíbrio entre servidores',535,510,{on:m.testing,locked:m.testing})];
    m.act=a=>{
      if(m.testing||m.done)return;
      if(/^task[0-5]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target==='parking'){m.assignment[i]=-1;return;}if(!/^server[0-2]$/.test(a.target))return;const dest=+a.target.at(-1),load=m.loads()[dest]-(m.assignment[i]===dest?m.weights[i]:0);if(load+m.weights[i]>m.capacities[dest]){m.message='Esse movimento sobrecarregaria o servidor. Use outro rack ou a bancada temporária.';return;}m.assignment[i]=dest;}
      if(a.id==='balance'){if(!m.valid()){m.fail('Atenda todos os módulos: uso até 85% por servidor e diferença de carga até 25 pontos percentuais.');return;}m.testing=true;m.message='Distribuição válida. Testando as filas de processamento e a reserva de capacidade…';}
    };
    m.tick=dt=>{if(m.testing)m.stability=Math.min(1,m.stability+dt/1.8);m.done=m.stability===1;};
    m.next=()=>{if(m.testing)return wait;if(m.valid())return {id:'balance'};const loads=m.loads();for(let i=0;i<6;i++)if(m.assignment[i]!==m.plan[i]&&loads[m.plan[i]]+m.weights[i]<=m.capacities[m.plan[i]])return {id:'task'+i,target:'server'+m.plan[i]};const i=m.assignment.findIndex((s,i)=>s>=0&&s!==m.plan[i]);return i>=0?{id:'task'+i,target:'parking'}:{id:'balance'};};
  }
  function core(m){
    m.links=[false,false,false];m.relayCharge=[0,0,0];m.engaged=[false,false,false,false];m.charge=[0,0,0,0];m.restoring=false;m.restoration=0;
    m.mechanisms=[{name:'PRÉ-CARGA',deps:[],x:110,y:295},{name:'REFRIGERAÇÃO',deps:[0],x:530,y:295},{name:'RELÓGIO',deps:[0],x:110,y:410},{name:'SINCRONISMO',deps:[1,2],x:530,y:410}];
    const ports=()=>['ALIMENTAÇÃO A','ALIMENTAÇÃO B','CONTROLE'].map((name,i)=>zone('relay'+i,'Relé '+name,120+i*200,145));
    m.controls=()=>[...ports(),...m.links.map((v,i)=>c('link'+i,'Reconectar relé '+['A','B','de controle'][i],v?120+i*200:110+i*210,v?145:405,{mode:'drag',locked:v||m.restoring,targets:ports()})),...(m.links.every(Boolean)?m.mechanisms.map((mec,i)=>c('mechanism'+i,'Acionar '+mec.name+(mec.deps.length?' · depende de '+mec.deps.map(j=>m.mechanisms[j].name).join(' e '):' · depende dos três relés'),mec.x,mec.y,{w:112,h:88,on:m.charge[i]===1,locked:m.engaged[i]||m.restoring})):[]),c('ignite','Ativar o núcleo após concluir todas as dependências',320,500,{w:112,on:m.restoring,locked:m.restoring})];
    m.act=a=>{
      if(m.restoring||m.done)return;
      if(/^link[0-2]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!=='relay'+i){m.message='Reconecte cada relé à sua linha: alimentação A, alimentação B ou controle.';return;}m.links[i]=true;}
      if(/^mechanism[0-3]$/.test(a.id)){const i=+a.id.at(-1),mechanism=m.mechanisms[i];if(!m.links.every(Boolean)){m.fail('Reconecte os três relés antes de acionar os mecanismos.');return;}if(!mechanism.deps.every(j=>m.charge[j]===1)){m.fail('Dependência pendente: '+mechanism.deps.map(j=>m.mechanisms[j].name).join(' e ')+'.');return;}if(!m.relayCharge.every(v=>v===1)){m.message='Aguarde a energia alcançar os três relés.';return;}m.engaged[i]=true;m.message=mechanism.name+' acionado. Energia em propagação até o núcleo…';}
      if(a.id==='ignite'){if(!m.charge.every(v=>v===1)){m.fail('Conclua pré-carga, refrigeração, relógio e sincronismo antes de ativar o núcleo.');return;}m.restoring=true;m.message='Dependências confirmadas. Iniciando a sequência de restauração do núcleo…';}
    };
    m.tick=dt=>{for(let i=0;i<3;i++)if(m.links[i])m.relayCharge[i]=Math.min(1,m.relayCharge[i]+dt/.6);for(let i=0;i<4;i++)if(m.engaged[i])m.charge[i]=Math.min(1,m.charge[i]+dt/.65);if(m.restoring)m.restoration=Math.min(1,m.restoration+dt/3.2);m.done=m.restoration===1;};
    m.next=()=>{if(m.restoring)return wait;const i=m.links.indexOf(false);if(i>=0)return {id:'link'+i,target:'relay'+i};if(!m.relayCharge.every(v=>v===1))return wait;const j=m.mechanisms.findIndex((mech,i)=>!m.engaged[i]&&mech.deps.every(d=>m.charge[d]===1));if(j>=0)return {id:'mechanism'+j};return m.charge.every(v=>v===1)?{id:'ignite'}:wait;};
  }
  ByteRunner.serversRepairModels=Object.freeze({'rack-busbars':power,'replica-flywheels':cooling,'rack-gantry':balance,'backbone-prisms':core});
})();
