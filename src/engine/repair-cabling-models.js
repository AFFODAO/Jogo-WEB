/* Fase 6: pinagem, emenda de cobre, acoplamento óptico e continuidade. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:96,h:96,kind:'cabling',...extra});
  const zone=(id,label,x,y,extra={})=>c(id,label,x,y,{mode:'target',w:88,h:96,...extra});
  const wait={wait:true,message:'Aguarde o movimento da ferramenta e a confirmação do enlace.'};
  const names=['branco e verde','verde','branco e laranja','azul','branco e azul','laranja','branco e marrom','marrom'];
  const standards=Object.freeze({T568A:Object.freeze([0,1,2,3,4,5,6,7]),T568B:Object.freeze([2,5,0,3,4,1,6,7])});
  function crimp(m){
    m.standard=m.componentId==='maintenance-west:service'?'T568A':m.componentId==='central-east:trunk'?'T568B':m.int(2)?'T568B':'T568A';
    m.expected=standards[m.standard];m.order=m.shuffle([0,1,2,3,4,5,6,7]);m.pins=Array(8).fill(-1);m.inserted=Array(8).fill(-10);m.press=0;m.crimping=false;m.closure=0;
    const pins=()=>m.expected.map((wire,i)=>zone('pin'+i,'Pino '+(i+1)+' · '+names[wire],75+i*70,215));
    m.controls=()=>[...pins(),...names.map((name,i)=>{const slot=m.pins.indexOf(i);return c('wire'+i,'Fio '+name,slot<0?75+m.order.indexOf(i)*70:75+slot*70,slot<0?400:215,{mode:'drag',w:88,locked:slot>=0||m.crimping,targets:pins()});}),c('crimp','Apertar o alicate de crimpagem',535,490,{mode:'stroke',max:3,value:m.press,locked:m.crimping})];
    m.act=a=>{
      if(m.crimping||m.done)return;
      if(/^wire[0-7]$/.test(a.id)&&/^pin[0-7]$/.test(a.target)){
        const wire=+a.id.at(-1),pin=+a.target.at(-1);if(m.pins.includes(wire))return;
        if(m.expected[pin]!==wire){m.message='Este pino exige o fio '+names[m.expected[pin]]+' no padrão '+m.standard+'.';return;}
        if(m.pins[pin]>=0)return;m.pins[pin]=wire;m.inserted[pin]=m.time;
      }
      if(a.id==='crimp'){
        const value=Math.max(0,Math.min(3,a.value??m.press+1));
        if(m.pins.some(v=>v<0)){m.press=0;m.fail('Insira os oito fios conforme o padrão antes de apertar o alicate.');return;}
        m.press=value;if(value===3){m.crimping=true;m.message='Prensando os oito contatos e travando o conector RJ45…';}
      }
    };
    m.tick=dt=>{if(m.crimping)m.closure=Math.min(1,m.closure+dt/1.2);m.done=m.closure===1;};
    m.next=()=>{if(m.crimping)return wait;const i=m.pins.indexOf(-1);return i>=0?{id:'wire'+m.expected[i],target:'pin'+i}:{id:'crimp',value:3};};
  }
  function splice(m){
    m.stripped=[0,0];m.stripping=[false,false];m.order=m.shuffle([0,1,2,3]);m.joins=[false,false,false,false];m.joining=false;m.restoration=0;
    const ends=[zone('end0','Capa da extremidade esquerda',190,235,{w:144,h:140}),zone('end1','Capa da extremidade direita',450,235,{w:144,h:140})];
    const contacts=()=>[0,1,2,3].map(i=>zone('contact'+i,'Condutor '+['verde','laranja','azul','marrom'][i]+' da extremidade direita',440,140+i*100));
    m.controls=()=>[
      ...(m.stripped.every(v=>v===1)?[...contacts(),...[0,1,2,3].map(i=>c('conductor'+i,'Alinhar condutor '+['verde','laranja','azul','marrom'][i],m.joins[i]?440:190,m.joins[i]?140+i*100:140+m.order.indexOf(i)*100,{mode:'drag',locked:m.joins[i]||m.joining,targets:contacts()}))]:[...ends,c('stripper','Levar o desencapador até uma extremidade',105,465,{mode:'drag',locked:m.joining,targets:ends})]),
      c('join','Fechar a prensa de emenda e restaurar o isolamento',535,490,{locked:m.joining,on:m.joining})
    ];
    m.act=a=>{
      if(m.joining||m.done)return;
      if(a.id==='stripper'&&/^end[01]$/.test(a.target)){const i=+a.target.at(-1);if(m.stripped[i]<1)m.stripping[i]=true;m.message='Retirando a capa sem danificar os condutores…';}
      if(/^conductor[0-3]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(!m.stripped.every(v=>v===1)){m.message='Retire a capa das duas extremidades antes de alinhar os condutores.';return;}if(a.target!=='contact'+i){m.message='Una apenas condutores com a mesma cor.';return;}m.joins[i]=true;}
      if(a.id==='join'){if(!m.stripped.every(v=>v===1)||!m.joins.every(Boolean)){m.fail('Desencape as duas pontas e alinhe os quatro condutores antes de fechar a prensa.');return;}m.joining=true;m.message='Unindo os condutores e restaurando a manga isolante…';}
    };
    m.tick=dt=>{for(let i=0;i<2;i++)if(m.stripping[i]&&m.stripped[i]<1){m.stripped[i]=Math.min(1,m.stripped[i]+dt/.7);if(m.stripped[i]===1)m.needsSync=true;}if(m.joining)m.restoration=Math.min(1,m.restoration+dt/1.6);m.done=m.restoration===1;};
    m.next=()=>{if(m.joining)return wait;const i=m.stripped.findIndex(v=>v<1);if(i>=0)return m.stripping[i]?wait:{id:'stripper',target:'end'+i};const j=m.joins.indexOf(false);return j>=0?{id:'conductor'+j,target:'contact'+j}:{id:'join'};};
  }
  function fiber(m){
    m.positions=[1+m.int(2),6+m.int(2)];m.target=4;m.locked=false;m.stable=0;
    m.signal=()=>Math.max(0,100-(Math.abs(m.positions[0]-4)+Math.abs(m.positions[1]-4))*12.5);
    m.controls=()=>m.positions.map((v,i)=>c('core'+i,'Mover núcleo óptico '+(i?'direito':'esquerdo')+' · posição '+(v+1)+' · marca central 5',200+i*240,170+v*24,{mode:'rail',dragAxis:'y',dragStep:24,w:120,h:96,value:v,max:8,locked:m.locked})).concat(c('lock','Travar o acoplador com sinal óptico total',535,480,{locked:m.locked,on:m.locked}));
    m.act=a=>{if(m.locked||m.done)return;if(/^core[01]$/.test(a.id))m.positions[+a.id.at(-1)]=Math.max(0,Math.min(8,a.value??(m.positions[+a.id.at(-1)]+1)%9));if(a.id==='lock'){if(m.signal()!==100){m.fail('Alinhe os dois núcleos à marca central até atingir 100% de sinal.');return;}m.locked=true;m.message='Acoplador travado. Confirmando a transmissão de luz…';}};
    m.tick=dt=>{if(m.locked)m.stable=Math.min(1,m.stable+dt/1.3);m.done=m.stable===1;};
    m.next=()=>m.locked?wait:m.positions[0]!==4?{id:'core0',value:4}:m.positions[1]!==4?{id:'core1',value:4}:{id:'lock'};
  }
  function tester(m){
    m.probes=[false,false];m.faults=m.shuffle([0,1,2,3,4,5,6,7]).slice(0,m.componentId==='basement-power:power'?2:1);m.repaired=Array(8).fill(false);m.leds=Array(8).fill(null);m.diagnosed=false;m.scanning=false;m.scanProgress=0;
    const ends=[zone('endpoint0','Extremidade de origem',130,265),zone('endpoint1','Extremidade de retorno',510,265)];
    const pins=()=>[0,1,2,3,4,5,6,7].map(i=>zone('trace'+i,'Condutor '+(i+1)+(m.diagnosed?(m.faults.includes(i)&&!m.repaired[i]?' · rompido':' · íntegro'):''),75+i*70,365));
    m.controls=()=>[...ends,...pins(),...m.probes.map((v,i)=>c('probe'+i,'Conectar ponta de teste '+(i?'de retorno':'de origem'),v?ends[i].x:180+i*260,v?265:480,{mode:'drag',locked:v||m.scanning,targets:ends})),c('repair','Aplicar emenda ao condutor diagnosticado',100,480,{mode:'drag',locked:!m.diagnosed||m.scanning,targets:pins()}),c('scan','Acionar teste de continuidade dos oito condutores',535,480,{locked:m.scanning,on:m.scanning})];
    m.act=a=>{
      if(m.scanning||m.done)return;
      if(/^probe[01]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!==ends[i].id){m.message='Conecte a ponta à extremidade com a mesma identificação.';return;}m.probes[i]=true;}
      if(a.id==='repair'&&/^trace[0-7]$/.test(a.target)){const i=+a.target.at(-1);if(!m.diagnosed){m.message='Execute o teste para localizar a ruptura antes de reparar.';return;}if(!m.faults.includes(i)||m.repaired[i]){m.message='Este condutor está íntegro. Preserve as conexões normais.';return;}m.repaired[i]=true;m.message='Condutor '+(i+1)+' reparado. Repita o teste para confirmar a continuidade.';}
      if(a.id==='scan'){if(!m.probes.every(Boolean)){m.fail('Conecte as duas pontas de teste antes de iniciar a medição.');return;}m.scanning=true;m.scanProgress=0;m.leds.fill(null);m.message='Testando a continuidade de cada condutor…';}
    };
    m.tick=dt=>{if(!m.scanning)return;m.scanProgress=Math.min(1,m.scanProgress+dt/1.6);const index=Math.min(7,Math.floor(m.scanProgress*8));for(let i=0;i<=index;i++)m.leds[i]=!m.faults.includes(i)||m.repaired[i];if(m.scanProgress===1){m.scanning=false;m.diagnosed=true;m.done=m.leds.every(v=>v===true);m.message=m.done?'Os oito condutores apresentam continuidade.':'Ruptura nos condutores '+m.faults.filter(i=>!m.repaired[i]).map(i=>i+1).join(' e ')+'. Aplique a emenda nos pontos vermelhos.';m.needsSync=true;}};
    m.next=()=>{if(m.scanning||m.done)return wait;const i=m.probes.indexOf(false);if(i>=0)return {id:'probe'+i,target:ends[i].id};if(!m.diagnosed)return {id:'scan'};const j=m.faults.find(i=>!m.repaired[i]);return j!==undefined?{id:'repair',target:'trace'+j}:{id:'scan'};};
  }
  ByteRunner.cablingPinout=Object.freeze({names:Object.freeze(names),standards});
  ByteRunner.cablingRepairModels=Object.freeze({'rj45-comb':crimp,'cable-reel':splice,'fiber-splice':fiber,'continuity-trace':tester});
})();
