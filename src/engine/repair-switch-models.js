/* Fase 3: regras independentes da apresentação e do progresso da campanha. */
(() => {
 const c=(id,label,x,y,extra={})=>({id,label,x,y,w:96,h:96,kind:'switch',...extra});
 const target=(id,label,x,y)=>c(id,label,x,y,{mode:'target'});
 const wait={wait:true,message:'Aguarde a confirmação luminosa do equipamento.'};
 function patch(m){
  m.order=m.shuffle([0,1,2,3]);m.links=[false,false,false,false];m.inserted=[-10,-10,-10,-10];
  const ports=()=>[0,1,2,3].map(i=>target('port'+i,'Porta '+(i+1),110+i*140,185));
  m.controls=()=>[...ports(),...m.links.map((v,i)=>c('lead'+i,'Cabo RJ45 '+(m.order[i]+1),v?110+m.order[i]*140:110+i*140,v?185:425,{mode:'drag',locked:v,number:m.order[i]+1,targets:ports()}))];
  m.act=a=>{if(!/^lead[0-3]$/.test(a.id)||!a.target)return;const i=+a.id.at(-1);if(a.target!=='port'+m.order[i]){m.message='A etiqueta do cabo deve corresponder ao número da porta.';return;}if(!m.links[i]){m.links[i]=true;m.inserted[i]=m.time;}};
  m.tick=()=>{m.done=m.links.every((v,i)=>v&&m.time-m.inserted[i]>=.65);};
  m.next=()=>{const i=m.links.indexOf(false);return i<0?wait:{id:'lead'+i,target:'port'+m.order[i]};};
 }
 function routing(m){
  m.routes=[0,0];m.packets=m.shuffle([0,1,2,0,2,1]);m.index=0;m.flight=null;m.delivered=[0,0,0];m.flash=[-10,-10,-10];
  m.controls=()=>[c('fork0','Junção 1: saída 1 ou ramificação',235,220,{mode:'dial',value:m.routes[0],max:1,locked:!!m.flight}),c('fork1','Junção 2: saída 2 ou 3',385,330,{mode:'dial',value:m.routes[1],max:1,locked:!!m.flight}),c('send','Enviar pacote',105,440,{locked:!!m.flight||m.done})];
  m.act=a=>{if(m.flight||m.done)return;if(/^fork[01]$/.test(a.id)){const i=+a.id.at(-1);m.routes[i]=(a.value??m.routes[i]+1)%2;}if(a.id==='send'){const destination=m.routes[0]===0?0:m.routes[1]===0?1:2;m.flight={progress:0,destination};if(destination!==m.packets[m.index])m.fail('Destino incorreto. Ajuste as junções e reenvie o pacote.');}};
  m.tick=dt=>{if(!m.flight)return;m.flight.progress=Math.min(1,m.flight.progress+dt/.95);if(m.flight.progress<1)return;const d=m.flight.destination;m.flight=null;if(d!==m.packets[m.index]){m.message='Pacote devolvido. Ajuste as rotas.';m.needsSync=true;return;}m.delivered[d]++;m.flash[d]=m.time;m.index++;m.needsSync=true;m.done=m.index===m.packets.length;};
  m.next=()=>{if(m.flight||m.done)return wait;const d=m.packets[m.index];return m.routes[0]!==Number(d!==0)?{id:'fork0',value:Number(d!==0)}:d>0&&m.routes[1]!==Number(d===2)?{id:'fork1',value:Number(d===2)}:{id:'send'};};
 }
 function module(m){
  m.power=true;m.open=false;m.removed=false;m.seated=false;m.fixed=false;m.charge=0;
  const socket=target('socket','Baia do módulo',320,250),bin=target('bin','Bandeja de peças avariadas',115,440);
  m.controls=()=>[c('power','Alimentação: '+(m.power?'ligada':'desligada'),540,100,{on:m.power}),c('cover',m.open?'Tampa aberta':'Abrir tampa',110,110,{on:m.open,locked:m.open}),...(m.open?[socket,bin,...(!m.removed?[c('fault','Retirar módulo avariado',320,250,{mode:'drag',targets:[bin]})]:[]),...(m.removed?[c('new','Módulo de reposição',m.seated?320:520,m.seated?250:440,{mode:'drag',locked:m.seated,targets:[socket]})]:[]),c('secure','Travar módulo',535,275,{on:m.fixed,locked:m.fixed})]:[])];
  m.act=a=>{if(a.id==='power'){if(m.power){m.power=false;return;}if(!m.fixed){m.fail('Fixe o módulo antes de restaurar a energia.');return;}m.power=true;}if(a.id==='cover'){if(m.power){m.fail('Desligue a alimentação antes de abrir o switch.');return;}m.open=true;}if(a.id==='fault'&&a.target==='bin'&&m.open&&!m.power)m.removed=true;if(a.id==='new'&&a.target==='socket'&&m.removed&&!m.power){m.seated=true;m.seatedAt=m.time;}if(a.id==='secure'){if(!m.seated){m.fail('Insira o módulo de reposição na baia.');return;}m.fixed=true;}};
  m.tick=dt=>{if(m.power&&m.fixed)m.charge=Math.min(1,m.charge+dt/1.2);m.done=m.charge===1;};
  m.next=()=>m.fixed?(m.power?wait:{id:'power'}):m.power?{id:'power'}:!m.open?{id:'cover'}:!m.removed?{id:'fault',target:'bin'}:!m.seated?{id:'new',target:'socket'}:{id:'secure'};
 }
 function activation(m){
  m.traces=[false,false,false,false];m.switches=[false,false,false,false];m.required=m.shuffle([0,1,2,3]).slice(0,2);m.charge=[0,0,0,0];
  const gaps=()=>[0,1,2,3].map(i=>target('gap'+i,'Trilha da porta '+(i+1),110+i*140,235));
  m.controls=()=>[...gaps(),...m.traces.map((v,i)=>c('bridge'+i,'Ponte de circuito '+(i+1),110+i*140,v?235:440,{mode:'drag',locked:v,targets:[gaps()[i]]})),...m.switches.map((v,i)=>c('toggle'+i,'Chave da porta '+(i+1),110+i*140,340,{on:v}))];
  m.act=a=>{if(/^bridge[0-3]$/.test(a.id)){const i=+a.id.at(-1);if(a.target==='gap'+i)m.traces[i]=true;}if(/^toggle[0-3]$/.test(a.id)){const i=+a.id.at(-1);if(!m.traces[i]){m.fail('Repare a trilha antes de operar esta chave.');return;}m.switches[i]=!m.switches[i];}};
  m.tick=dt=>{for(let i=0;i<4;i++)m.charge[i]=m.traces[i]&&m.switches[i]?Math.min(1,m.charge[i]+dt/.7):0;m.done=m.traces.every(Boolean)&&m.switches.every((v,i)=>v===m.required.includes(i))&&m.required.every(i=>m.charge[i]===1);};
  m.next=()=>{const i=m.traces.indexOf(false);if(i>=0)return {id:'bridge'+i,target:'gap'+i};const j=m.switches.findIndex((v,i)=>v!==m.required.includes(i));return j<0?wait:{id:'toggle'+j};};
 }
 ByteRunner.switchRepairModels=Object.freeze({'patch-leads':patch,'packet-diverter':routing,'uplink-clutch':module,'vlan-shutters':activation});
})();
