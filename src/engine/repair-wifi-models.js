/* Fase 5: regras de rádio independentes da arte e do armazenamento da campanha. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:96,h:96,kind:'wifi',...extra});
  const zone=(id,label,x,y,extra={})=>c(id,label,x,y,{mode:'target',h:88,...extra});
  const wait={wait:true,message:'Aguarde a estabilização e a confirmação do enlace sem fio.'};
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function antenna(m){
    m.direction=22+m.int(6);m.target=4+m.int(5);m.locked=false;m.stable=0;
    m.controls=()=>[c('antenna','Girar antena: direção '+Math.round(m.direction*11.25)+' graus; receptor em '+Math.round(m.target*11.25)+' graus',235,300,{mode:'dial',w:300,h:300,max:31,value:m.direction,angleStep:11.25,locked:m.locked}),c('lock','Travar antena e confirmar recepção',535,465,{locked:m.locked,on:m.locked})];
    m.act=a=>{if(m.locked||m.done)return;if(a.id==='antenna')m.direction=((a.value??m.direction+1)%32+32)%32;if(a.id==='lock'){if(m.direction!==m.target){m.fail('O feixe ainda não alcança o receptor. Gire a antena até alinhar os marcadores.');return;}m.locked=true;m.message='Antena travada. Confirmando a recepção das ondas…';}};
    m.tick=dt=>{if(m.locked)m.stable=Math.min(1,m.stable+dt/1.3);m.done=m.stable===1;};
    m.next=()=>m.locked?wait:m.direction!==m.target?{id:'antenna',value:m.target}:{id:'lock'};
  }
  function spectrum(m){
    m.channel=m.int(5);m.noise=m.shuffle([0,1,2,3,4].filter(i=>i!==m.channel)).slice(0,3);m.filters=[-1,-1,-1];m.filteredAt=Array(5).fill(-10);m.cleaning=false;m.stable=0;
    const bins=()=>[0,1,2,3,4].map(i=>zone('band'+i,'Faixa '+(i+1)+(i===m.channel?' · sinal útil':m.noise.includes(i)?' · interferência':' · faixa livre'),100+i*110,245,{h:190}));
    m.controls=()=>[...bins(),...m.filters.map((v,i)=>c('filter'+i,'Filtro de rejeição '+(i+1),v<0?105+i*145:100+v*110,v<0?465:245,{mode:'drag',w:88,h:104,locked:v>=0||m.cleaning,targets:bins()})),c('transmit','Estabilizar transmissão',550,465,{locked:m.cleaning,on:m.cleaning})];
    m.act=a=>{
      if(m.cleaning||m.done)return;
      if(/^filter[0-2]$/.test(a.id)&&/^band[0-4]$/.test(a.target)){
        const i=+a.id.at(-1),b=+a.target.at(-1);if(m.filters[i]>=0)return;
        if(b===m.channel){m.message='Preserve o sinal útil verde. Posicione o filtro sobre um pico vermelho.';return;}
        if(!m.noise.includes(b)||m.filters.includes(b)){m.message='Esta faixa não contém interferência disponível para filtrar.';return;}
        m.filters[i]=b;m.filteredAt[b]=m.time;m.message='Interferência da faixa '+(b+1)+' isolada.';
      }
      if(a.id==='transmit'){if(m.filters.some(v=>v<0)){m.fail('Ainda há interferências. Cubra os três picos vermelhos com filtros.');return;}m.cleaning=true;m.message='Removendo ruído residual e estabilizando a transmissão…';}
    };
    m.tick=dt=>{if(m.cleaning)m.stable=Math.min(1,m.stable+dt/1.4);m.done=m.stable===1;};
    m.next=()=>{if(m.cleaning)return wait;const i=m.filters.indexOf(-1);return i>=0?{id:'filter'+i,target:'band'+m.noise.find(b=>!m.filters.includes(b))}:{id:'transmit'};};
  }
  function repeaters(m){
    m.base={x:55,y:175};m.pads=[{x:180,y:175},{x:360,y:175},{x:520,y:300},{x:180,y:330},{x:360,y:330},{x:520,y:175}];
    m.zones=[{x:350,y:105},{x:550,y:160},{x:550,y:365}];m.blocked=4;m.slots=[-1,-1,-1];m.testing=false;m.stable=0;m.radius=145;m.reach=205;
    m.plan=m.componentId==='repeater-east:east'?[0,2,1]:[0,1,2];
    m.network=()=>{
      const active=new Set();let changed=true;while(changed){changed=false;for(let i=0;i<3;i++)if(m.slots[i]>=0&&!active.has(i)){const p=m.pads[m.slots[i]];if(distance(p,m.base)<=m.reach||[...active].some(j=>distance(p,m.pads[m.slots[j]])<=m.reach)){active.add(i);changed=true;}}}
      return {active:[...active],covered:m.zones.map(z=>[...active].some(i=>distance(z,m.pads[m.slots[i]])<=m.radius))};
    };
    const pads=()=>m.pads.map((p,i)=>zone('pad'+i,'Base '+(i+1)+(i===m.blocked?' · obstruída':''),p.x,p.y));
    m.controls=()=>[...pads(),...m.slots.map((v,i)=>c('repeater'+i,'Mover repetidor '+(i+1),v<0?105+i*140:m.pads[v].x,v<0?480:m.pads[v].y,{mode:'drag',locked:m.testing,targets:pads()})),c('connect','Conectar todas as zonas',550,480,{locked:m.testing,on:m.testing})];
    m.act=a=>{
      if(m.testing||m.done)return;
      if(/^repeater[0-2]$/.test(a.id)&&/^pad[0-5]$/.test(a.target)){
        const i=+a.id.at(-1),j=+a.target.at(-1);if(j===m.blocked){m.message='Esta base está obstruída. Escolha um ponto livre no mapa.';return;}
        if(m.slots.some((v,k)=>k!==i&&v===j)){m.message='Esta base já possui um repetidor.';return;}m.slots[i]=j;
        const n=m.network();m.message=n.active.includes(i)?'Repetidor conectado à rede. Confira os círculos de cobertura.':'Sem enlace com a origem. Aproxime este repetidor da rede ativa.';
      }
      if(a.id==='connect'){const n=m.network();if(!n.covered.every(Boolean)||n.active.length!==3){m.fail('Há zonas sem cobertura ou repetidores isolados. Reposicione os dispositivos.');return;}m.testing=true;m.message='Propagando o sinal pela cadeia de repetidores…';}
    };
    m.tick=dt=>{if(m.testing)m.stable=Math.min(1,m.stable+dt/1.5);m.done=m.stable===1;};
    m.next=()=>{if(m.testing)return wait;for(let i=0;i<3;i++)if(m.slots[i]!==m.plan[i]){const occupant=m.slots.findIndex((v,j)=>j!==i&&v===m.plan[i]);if(occupant>=0){const spare=[0,1,2,3,5].find(p=>!m.slots.includes(p));return {id:'repeater'+occupant,target:'pad'+spare};}return {id:'repeater'+i,target:'pad'+m.plan[i]};}return {id:'connect'};};
  }
  function transmitter(m){
    m.gain=1;m.cooling=0;m.required=3+m.int(3);m.temperature=40;m.signal=15;m.running=false;m.stable=0;
    m.strength=()=>Math.max(0,100-Math.abs(m.gain-m.required)*22);
    m.thermal=()=>Math.max(25,28+m.gain*9-m.cooling*6);
    m.controls=()=>[c('gain','Girar controle de potência · nível '+m.gain,170,350,{mode:'dial',w:160,h:160,max:8,value:m.gain,locked:m.running}),c('cooling','Girar controle de ventilação · nível '+m.cooling,430,350,{mode:'dial',w:160,h:160,max:6,value:m.cooling,locked:m.running}),c('emit','Confirmar calibração do transmissor',535,485,{locked:m.running,on:m.running})];
    m.act=a=>{
      if(m.running||m.done)return;
      if(a.id==='gain')m.gain=Math.max(0,Math.min(8,a.value??(m.gain+1)%9));
      if(a.id==='cooling')m.cooling=Math.max(0,Math.min(6,a.value??(m.cooling+1)%7));
      if(a.id==='emit'){if(m.strength()<90){m.fail('Sinal fora da faixa de recepção. Gire o controle de potência até a marca indicada.');return;}if(m.thermal()>60){m.fail('Temperatura excessiva. Aumente a ventilação antes de transmitir.');return;}m.running=true;m.message='Calibrando a portadora com sinal estável e temperatura segura…';}
    };
    m.tick=dt=>{const f=1-Math.exp(-dt*3);m.temperature+=(m.thermal()-m.temperature)*f;m.signal+=(m.strength()-m.signal)*f;if(m.running){m.stable=m.temperature<=60&&m.signal>=90?Math.min(1,m.stable+dt/1.4):0;}m.done=m.stable===1;};
    m.next=()=>m.running?wait:m.gain!==m.required?{id:'gain',value:m.required}:m.cooling!==4?{id:'cooling',value:4}:{id:'emit'};
  }
  ByteRunner.wifiRepairModels=Object.freeze({'dish-gimbal':antenna,'spectrum-tuner':spectrum,'repeater-mast':repeaters,'rf-compressor':transmitter});
})();
