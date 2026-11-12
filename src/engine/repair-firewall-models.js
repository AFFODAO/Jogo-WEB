/* Fase 9: políticas explícitas, inspeção de conteúdo e primeira correspondência. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:104,h:96,kind:'firewall',...extra});
  const zone=(id,label,x,y,extra={})=>c(id,label,x,y,{mode:'target',...extra});
  const wait={wait:true,message:'Aguarde a inspeção e a confirmação animada da proteção.'};
  const mod=n=>(n%4+4)%4;
  const allowPacket=p=>p.src!=='203.0.113.66'&&p.state!=='INVÁLIDA'&&(p.state==='ESTABELECIDA'||p.protocol==='TCP'&&p.port===443||p.protocol==='UDP'&&p.port===53&&p.dst==='192.0.2.53'||p.protocol==='TCP'&&p.port===22&&p.src==='10.0.0.10');
  function packets(){return [
    {src:'203.0.113.66',dst:'192.0.2.10',protocol:'TCP',port:443,state:'NOVA'},
    {src:'198.51.100.20',dst:'192.0.2.10',protocol:'TCP',port:443,state:'NOVA'},
    {src:'198.51.100.25',dst:'192.0.2.10',protocol:'TCP',port:22,state:'NOVA'},
    {src:'10.0.0.10',dst:'192.0.2.10',protocol:'TCP',port:22,state:'NOVA'},
    {src:'192.0.2.53',dst:'10.0.0.20',protocol:'UDP',port:53000,state:'ESTABELECIDA'},
    {src:'198.51.100.30',dst:'192.0.2.10',protocol:'TCP',port:443,state:'INVÁLIDA'}
  ];}
  function blocking(m){
    m.packets=packets();m.index=0;m.gates=[0,0];m.incoming=0;m.flight=null;m.history=[];
    m.controls=()=>[c('gate0','Porta de proteção: '+(m.gates[0]?'fechada':'aberta'),190,420,{on:!!m.gates[0],locked:!!m.flight||m.done}),c('gate1','Porta de descarte: '+(m.gates[1]?'aberta':'fechada'),410,420,{on:!!m.gates[1],locked:!!m.flight||m.done}),c('process','Processar o pacote em espera',535,500,{locked:!!m.flight||m.incoming<1||m.done})];
    m.act=a=>{
      if(m.flight||m.done)return;
      if(/^gate[01]$/.test(a.id)){const i=+a.id.at(-1);m.gates[i]=1-m.gates[i];}
      if(a.id==='process'){
        if(m.incoming<1){m.message='Aguarde a chegada do pacote ao posto de controle.';return;}
        const decision=m.gates.every(v=>v===0)?'permitir':m.gates.every(v=>v===1)?'bloquear':'reter';
        const expected=allowPacket(m.packets[m.index])?'permitir':'bloquear',correct=decision===expected;
        m.flight={decision,expected,correct,progress:0};
        if(!correct)m.fail(decision==='reter'?'Intertrave as portas: liberação com proteção aberta e descarte fechado; bloqueio na configuração inversa.':'A decisão contradiz a política. Verifique origem, porta e estado da conexão.');else m.message=decision==='permitir'?'Tráfego autorizado. Encaminhando à rede protegida…':'Política de bloqueio confirmada. Descartando o pacote…';
      }
    };
    m.tick=dt=>{
      if(!m.flight){if(m.done)return;const before=m.incoming;m.incoming=Math.min(1,m.incoming+dt/.55);if(before<1&&m.incoming===1)m.needsSync=true;return;}
      m.flight.progress=Math.min(1,m.flight.progress+dt/.95);if(m.flight.progress<1)return;const f=m.flight;m.flight=null;if(f.correct){m.history.push({packet:{...m.packets[m.index]},decision:f.decision});m.index++;m.done=m.index===m.packets.length;m.incoming=0;}else m.message='Pacote devolvido ao posto de controle. Corrija as portas e tente novamente.';m.needsSync=true;
    };
    m.next=()=>{if(m.flight||m.done||m.incoming<1)return wait;const value=allowPacket(m.packets[m.index])?0:1;const i=m.gates.findIndex(v=>v!==value);return i>=0?{id:'gate'+i}:{id:'process'};};
  }
  function shield(m){
    m.target=m.componentId==='c06'?[2,0,3]:[0,1,2];m.rotation=m.target.map(v=>mod(v+1+m.int(3)));m.previous=[...m.rotation];m.turned=Array(3).fill(-10);m.links=[false,false,false];m.powering=false;m.progress=0;m.segments=[0,0,0];
    const ports=()=>[0,1,2].map(i=>zone('coupler'+i,'Acoplador do segmento '+(i+1),140+i*180,330));
    m.controls=()=>[...m.rotation.map((v,i)=>c('rotor'+i,'Girar módulo '+(i+1)+' até a marca '+(m.target[i]+1),140+i*180,200,{mode:'dial',max:3,value:v,mark:m.target[i],locked:m.powering})),...ports(),...m.links.map((v,i)=>c('powerlink'+i,'Reconectar alimentação do segmento '+(i+1),v?140+i*180:100+i*180,v?330:460,{mode:'drag',locked:v||m.powering,targets:ports()})),c('energize','Energizar e testar a barreira completa',550,500,{locked:m.powering,on:m.powering})];
    m.act=a=>{
      if(m.powering||m.done)return;
      if(/^rotor[0-2]$/.test(a.id)){const i=+a.id.at(-1);m.previous[i]=m.rotation[i];m.rotation[i]=mod(a.value??m.rotation[i]+1);m.turned[i]=m.time;}
      if(/^powerlink[0-2]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!=='coupler'+i){m.message='Este cabo alimenta outro segmento da barreira.';return;}if(m.rotation[i]!==m.target[i]){m.message='Alinhe a entrada do módulo à marca antes de reconectar a alimentação.';return;}m.links[i]=true;}
      if(a.id==='energize'){if(!m.links.every(Boolean)||!m.rotation.every((v,i)=>v===m.target[i])){m.fail('Há módulos desalinhados ou circuitos interrompidos. Restaure os três segmentos.');return;}m.powering=true;m.message='Energizando os módulos e recompondo o campo de proteção…';}
    };
    m.tick=dt=>{if(m.powering)m.progress=Math.min(1,m.progress+dt/1.6);m.segments=m.segments.map((_,i)=>Math.max(0,Math.min(1,m.progress*3-i)));m.done=m.segments.every(v=>v===1);};
    m.next=()=>{if(m.powering)return wait;const i=m.rotation.findIndex((v,i)=>v!==m.target[i]);if(i>=0)return {id:'rotor'+i,value:m.target[i]};const j=m.links.indexOf(false);return j>=0?{id:'powerlink'+j,target:'coupler'+j}:{id:'energize'};};
  }
  const signatures=Object.freeze(['MAL-01','EXP-02']);
  const malicious=p=>signatures.includes(p.signature)||!p.integrity;
  function scanner(m){
    m.packets=[{name:'Atualização',signature:'MAL-01',integrity:true},{name:'Contrato',signature:null,integrity:true},{name:'Diagnóstico',signature:'EXP-02',integrity:true},{name:'Cópia de segurança',signature:null,integrity:true}];
    if(m.componentId==='c08')m.packets.push({name:'Arquivo corrompido',signature:null,integrity:false});
    m.index=0;m.inspected=false;m.scanning=false;m.scanProgress=0;m.flight=null;m.quarantine=[];m.forwarded=[];
    const clean=zone('clean','Saída de tráfego legítimo',105,450,{w:152,h:112}),quarantine=zone('quarantine','Câmara de quarentena',535,450,{w:152,h:112});
    m.controls=()=>[clean,quarantine,c('scan','Acionar o scanner de assinatura e integridade',320,450,{locked:m.scanning||m.inspected||!!m.flight||m.done,on:m.scanning}),c('packet','Separar o pacote '+(m.packets[m.index]?.name||'concluído'),320,250,{mode:'drag',w:144,h:96,locked:!m.inspected||!!m.flight||m.done,targets:[clean,quarantine]})];
    m.act=a=>{
      if(m.flight||m.done)return;
      if(a.id==='scan'&&!m.inspected&&!m.scanning){m.scanning=true;m.scanProgress=0;m.message='Lendo o conteúdo e comparando com as assinaturas de ameaça…';}
      if(a.id==='packet'&&a.target){if(!m.inspected){m.message='Inspecione o conteúdo antes de decidir o destino do pacote.';return;}if(!['clean','quarantine'].includes(a.target))return;const expected=malicious(m.packets[m.index])?'quarantine':'clean',correct=a.target===expected;m.flight={target:a.target,correct,progress:0};if(!correct)m.fail('O destino contradiz a inspeção: quarentena para assinatura conhecida ou integridade inválida; liberação nos demais casos.');else m.message=a.target==='quarantine'?'Isolando o conteúdo na câmara de quarentena…':'Conteúdo íntegro e sem assinatura maliciosa. Liberando o pacote…';}
    };
    m.tick=dt=>{
      if(m.scanning){m.scanProgress=Math.min(1,m.scanProgress+dt/.8);if(m.scanProgress===1){m.scanning=false;m.inspected=true;m.needsSync=true;m.message=malicious(m.packets[m.index])?'Inspeção concluída: ameaça detectada. Encaminhe à quarentena.':'Inspeção concluída: tráfego legítimo. Preserve a comunicação.';}}
      if(!m.flight)return;m.flight.progress=Math.min(1,m.flight.progress+dt/.9);if(m.flight.progress<1)return;const f=m.flight;m.flight=null;if(f.correct){(f.target==='quarantine'?m.quarantine:m.forwarded).push({...m.packets[m.index]});m.index++;m.done=m.index===m.packets.length;m.inspected=false;m.scanProgress=0;}else m.message='Classificação rejeitada. O pacote voltou à mesa de inspeção.';m.needsSync=true;
    };
    m.next=()=>m.flight||m.scanning||m.done?wait:!m.inspected?{id:'scan'}:{id:'packet',target:malicious(m.packets[m.index])?'quarantine':'clean'};
  }
  const ruleDefinitions=Object.freeze([
    Object.freeze({title:'BLOQUEAR ORIGEM',condition:'203.0.113.66',decision:'bloquear',match:p=>p.src==='203.0.113.66'}),
    Object.freeze({title:'PERMITIR HTTPS',condition:'TCP · PORTA 443',decision:'permitir',match:p=>p.protocol==='TCP'&&p.port===443}),
    Object.freeze({title:'PERMITIR SSH ADMIN',condition:'10.0.0.10 · TCP 22',decision:'permitir',match:p=>p.src==='10.0.0.10'&&p.protocol==='TCP'&&p.port===22}),
    Object.freeze({title:'BLOQUEAR RESTANTE',condition:'QUALQUER PACOTE',decision:'bloquear',match:()=>true})
  ]);
  function firstMatch(packet,order){for(let slot=0;slot<order.length;slot++){const id=order[slot],rule=ruleDefinitions[id];if(rule?.match(packet))return {rule:id,slot,decision:rule.decision};}return {rule:null,slot:order.length,decision:'bloquear'};}
  function rules(m){
    m.rules=ruleDefinitions;m.slots=[-1,-1,-1,-1];m.testing=false;m.cursor=0;m.travel=0;m.results=[];
    m.tests=[{src:'203.0.113.66',protocol:'TCP',port:443,expected:'bloquear'},{src:'198.51.100.20',protocol:'TCP',port:443,expected:'permitir'},{src:'10.0.0.10',protocol:'TCP',port:22,expected:'permitir'},{src:'198.51.100.25',protocol:'TCP',port:22,expected:'bloquear'}];
    const slots=()=>[0,1,2,3].map(i=>zone('priority'+i,'Prioridade '+(i+1)+' · primeira correspondência encerra a avaliação',455,135+i*110,{w:240,h:88}));
    m.controls=()=>[...slots(),...m.rules.map((r,i)=>{const slot=m.slots.indexOf(i);return c('rule'+i,r.title+' · '+r.condition,slot<0?145:455,135+(slot<0?i:slot)*110,{mode:'drag',w:220,h:88,locked:m.testing,targets:slots()});}),c('run','Executar os quatro testes de primeira correspondência',300,500,{w:88,h:88,locked:m.testing,on:m.testing})];
    m.act=a=>{
      if(m.testing||m.done)return;
      if(/^rule[0-3]$/.test(a.id)&&/^priority[0-3]$/.test(a.target)){const id=+a.id.at(-1),target=+a.target.at(-1),origin=m.slots.indexOf(id),occupant=m.slots[target];if(origin>=0)m.slots[origin]=occupant;m.slots[target]=id;m.results=[];m.message='Prioridades atualizadas. Execute os pacotes de teste para validar o primeiro resultado.';}
      if(a.id==='run'){if(m.slots.includes(-1)){m.fail('Preencha as quatro prioridades antes de executar o motor de regras.');return;}m.testing=true;m.cursor=0;m.travel=0;m.results=[];if(m.tests.some(p=>firstMatch(p,m.slots).decision!==p.expected))m.fail('Esta ordem produz decisões incorretas. Acompanhe qual regra encerra cada teste e reorganize os módulos.');else m.message='Executando os pacotes e verificando a primeira regra correspondente…';}
    };
    m.tick=dt=>{if(!m.testing)return;m.travel=Math.min(1,m.travel+dt/.95);if(m.travel<1)return;const packet=m.tests[m.cursor],result=firstMatch(packet,m.slots);m.results.push({packet:{...packet},...result,passed:result.decision===packet.expected});m.cursor++;m.travel=0;if(m.cursor===m.tests.length){m.testing=false;m.done=m.results.every(r=>r.passed);m.message=m.done?'As quatro decisões respeitam a primeira correspondência.':'Teste rejeitado. Uma regra ampla está ocultando uma exceção ou uma restrição de maior prioridade.';m.needsSync=true;}};
    m.next=()=>{if(m.testing||m.done)return wait;for(let i=0;i<4;i++)if(m.slots[i]!==i)return {id:'rule'+i,target:'priority'+i};return {id:'run'};};
  }
  ByteRunner.firewallLogic=Object.freeze({allowPacket,malicious,firstMatch,ruleDefinitions,signatures});
  ByteRunner.firewallRepairModels=Object.freeze({'inspection-airlock':blocking,'shield-iris':shield,'threat-triangulation':scanner,'policy-camshaft':rules});
})();
