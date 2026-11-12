/* Fase 8: registros A/CNAME, delegação, TTL e consulta iterativa. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:104,h:96,kind:'dns',...extra});
  const zone=(id,label,x,y,extra={})=>c(id,label,x,y,{mode:'target',...extra});
  const wait={wait:true,message:'Aguarde a confirmação dos vínculos e a resposta DNS.'};
  function resolve(name,records,seen=new Set()){
    if(seen.has(name))return null;seen.add(name);const record=records.find(r=>r.name===name);
    return !record?null:record.type==='A'?record.value:record.type==='CNAME'?resolve(record.value,records,seen):null;
  }
  function domains(m){
    const org=m.componentId==='org-records:records';m.zone=org?'example.org':'example.com';const prefix=org?'198.51.100.':'192.0.2.';
    m.records=[{name:'portal.'+m.zone,type:'A',value:prefix+'10'},{name:'arquivos.'+m.zone,type:'A',value:prefix+'20'},{name:(org?'www.':'correio.')+m.zone,type:org?'CNAME':'A',value:org?'portal.'+m.zone:prefix+'30'}];
    m.ips=[prefix+'20',prefix+(org?'99':'30'),prefix+'10'];m.links=[-1,-1,-1];m.resolution=[0,0,0];
    const targets=()=>m.ips.map((ip,i)=>zone('ip'+i,'Nó IP '+ip,520,160+i*135,{w:164,h:112}));
    m.controls=()=>[...targets(),...m.records.map((r,i)=>c('domain'+i,'Conectar '+r.name+' · '+r.type+' '+r.value,300,160+i*135,{mode:'drag',locked:m.links[i]>=0,targets:targets()}))];
    m.act=a=>{if(m.done||!/^domain[0-2]$/.test(a.id)||!/^ip[0-2]$/.test(a.target))return;const i=+a.id.at(-1),j=+a.target.at(-1);if(m.links[i]>=0)return;if(resolve(m.records[i].name,m.records)!==m.ips[j]){m.message='Este IP não corresponde ao registro. Se houver CNAME, siga o nome de destino até seu registro A.';return;}m.links[i]=j;m.message='Cabo conectado. Consultando '+m.records[i].name+'…';};
    m.tick=dt=>{for(let i=0;i<3;i++)if(m.links[i]>=0)m.resolution[i]=Math.min(1,m.resolution[i]+dt/1.25);m.done=m.resolution.every(v=>v===1);};
    m.next=()=>{const i=m.links.indexOf(-1);return i<0?wait:{id:'domain'+i,target:'ip'+m.ips.indexOf(resolve(m.records[i].name,m.records))};};
  }
  function tree(m){
    m.nodes=[{zone:'.',role:'RAIZ',parent:-1,x:320,y:120},{zone:'.com',role:'TOPO .com',parent:0,x:175,y:250},{zone:'.org',role:'TOPO .org',parent:0,x:465,y:250},{zone:'example.com',role:'AUTORIDADE',parent:1,x:175,y:380},{zone:'example.org',role:'AUTORIDADE',parent:2,x:465,y:380}];
    m.order=m.shuffle([0,1,2,3,4]);m.placed=Array(5).fill(false);m.links=Array(5).fill(0);
    const seats=()=>m.nodes.map((n,i)=>zone('seat'+i,'Posição '+n.role+' · zona '+n.zone,n.x,n.y,{w:160,h:96}));
    m.controls=()=>[...seats(),...m.nodes.map((n,i)=>c('server'+i,'Servidor da zona '+n.zone+' · '+n.role,m.placed[i]?n.x:80+m.order.indexOf(i)*120,m.placed[i]?n.y:495,{mode:'drag',w:112,h:88,locked:m.placed[i],targets:seats()}))];
    m.act=a=>{if(m.done||!/^server[0-4]$/.test(a.id)||!/^seat[0-4]$/.test(a.target))return;const i=+a.id.at(-1),j=+a.target.at(-1);if(m.placed[i])return;if(i!==j){m.message='A posição precisa corresponder à zona atendida pelo servidor e ao seu nível na hierarquia.';return;}const parent=m.nodes[i].parent;if(parent>=0&&!m.placed[parent]){m.message='Restaure primeiro o servidor pai para publicar esta delegação.';return;}m.placed[i]=true;m.message=parent<0?'Raiz restaurada. Reconstrua as delegações .com e .org.':'Servidor instalado. Formando o vínculo com '+m.nodes[parent].zone+'…';};
    m.tick=dt=>{for(let i=0;i<5;i++)if(m.placed[i])m.links[i]=Math.min(1,m.links[i]+dt/.85);m.done=m.links.every(v=>v===1);};
    m.next=()=>{const i=m.placed.indexOf(false);return i<0?wait:{id:'server'+i,target:'seat'+i};};
  }
  function cache(m){
    m.now=1200;m.entries=[{name:'portal.example.com',type:'A',value:'192.0.2.10',ttl:300,cachedAt:1100},{name:'correio.example.com',type:'A',value:'192.0.2.20',ttl:60,cachedAt:1100},{name:'ns.example.org',type:'A',value:'198.51.100.53',ttl:600,cachedAt:1000},{name:'arquivos.example.org',type:'A',value:'198.51.100.20',ttl:120,cachedAt:1000}];
    m.remaining=i=>Math.max(0,m.entries[i].ttl-(m.now-m.entries[i].cachedAt));m.expired=m.entries.map((_,i)=>i).filter(i=>m.remaining(i)===0);m.removed=Array(4).fill(false);m.inserted=Array(4).fill(false);m.insertedAt=Array(4).fill(-10);m.syncing=false;m.stable=0;
    m.replacements=m.expired.map(i=>({slot:i,name:m.entries[i].name,type:m.entries[i].type,value:m.entries[i].value,ttl:300,cachedAt:m.now,authoritative:true}));
    const tray=zone('discard','Bandeja de registros expirados',85,450);
    const slots=()=>m.entries.map((r,i)=>zone('slot'+i,'Banco de memória '+(i+1)+' · '+r.name,100+i*145,210,{w:128,h:144}));
    m.controls=()=>[tray,...slots(),...m.entries.flatMap((r,i)=>m.removed[i]?[]:[c('cartridge'+i,'Cartucho '+r.name+' · TTL restante '+m.remaining(i)+' segundos',100+i*145,210,{mode:'drag',w:128,h:144,locked:!m.expired.includes(i)||m.syncing,targets:[tray]})]),...m.replacements.map((r,i)=>c('fresh'+i,'Registro renovado '+r.name+' · TTL '+r.ttl+' segundos',m.inserted[r.slot]?100+r.slot*145:230+i*180,m.inserted[r.slot]?210:435,{mode:'drag',w:128,h:112,locked:!m.removed[r.slot]||m.inserted[r.slot]||m.syncing,targets:slots()})),c('stabilize','Estabilizar a memória do cache',550,480,{locked:m.syncing,on:m.syncing})];
    m.act=a=>{
      if(m.syncing||m.done)return;
      if(/^cartridge[0-3]$/.test(a.id)&&a.target==='discard'){const i=+a.id.at(-1);if(!m.expired.includes(i)){m.message='Preserve os registros cujo TTL ainda é válido.';return;}m.removed[i]=true;m.message='Registro expirado retirado. Insira a resposta renovada da autoridade.';}
      if(/^fresh[01]$/.test(a.id)&&/^slot[0-3]$/.test(a.target)){const i=+a.id.at(-1),slot=+a.target.at(-1),r=m.replacements[i];if(slot!==r.slot||r.name!==m.entries[slot].name||r.type!==m.entries[slot].type){m.message='O cartucho renovado precisa ter o mesmo nome e tipo do registro removido.';return;}if(!m.removed[slot]||m.inserted[slot]||!r.authoritative||r.ttl<=0)return;m.entries[slot]={name:r.name,type:r.type,value:r.value,ttl:r.ttl,cachedAt:m.now};m.inserted[slot]=true;m.insertedAt[slot]=m.time;}
      if(a.id==='stabilize'){if(!m.expired.every(i=>m.removed[i]&&m.inserted[i])||m.entries.some((_,i)=>m.remaining(i)===0)){m.fail('Substitua os dois registros expirados e preserve os cartuchos válidos antes de estabilizar.');return;}m.syncing=true;m.message='Verificando TTLs renovados e estabilizando os bancos de memória…';}
    };
    m.tick=dt=>{if(m.syncing)m.stable=Math.min(1,m.stable+dt/1.5);m.done=m.stable===1;};
    m.next=()=>{if(m.syncing)return wait;for(const slot of m.expired){if(!m.removed[slot])return {id:'cartridge'+slot,target:'discard'};if(!m.inserted[slot])return {id:'fresh'+m.replacements.findIndex(r=>r.slot===slot),target:'slot'+slot};}return {id:'stabilize'};};
  }
  function query(m){
    const org=m.componentId==='resolve-core:resolution';m.domain=org?'arquivos.example.org':'portal.example.com';m.zone=org?'example.org':'example.com';m.ip=org?'198.51.100.20':'192.0.2.10';
    m.servers={resolver:{label:'RESOLVEDOR',x:80,y:205},root:{label:'RAIZ .',x:320,y:115},com:{label:'.com',x:520,y:150},org:{label:'.org',x:520,y:260},authorityCom:{label:'example.com',x:320,y:325},authorityOrg:{label:'example.org',x:120,y:325}};
    m.options=[['org','root','com'],['com','org','root'],['authorityOrg','root','authorityCom']];m.expected=['root',org?'org':'com',org?'authorityOrg':'authorityCom'];m.gates=[0,0,0];m.step=0;m.flight=null;m.visited=[];m.answer=null;
    m.controls=()=>[...m.gates.map((v,i)=>c('gate'+i,'Comporta '+(i+1)+' · próximo servidor '+m.servers[m.options[i][v]].label,110+i*190,420,{mode:'dial',value:v,max:2,locked:i!==m.step||!!m.flight,on:i<m.step})),c('send','Enviar consulta ao servidor selecionado',535,500,{locked:!!m.flight||m.done})];
    m.act=a=>{
      if(m.flight||m.done)return;
      if(/^gate[0-2]$/.test(a.id)){const i=+a.id.at(-1);if(i===m.step)m.gates[i]=((a.value??m.gates[i]+1)%3+3)%3;}
      if(a.id==='send'){const destination=m.options[m.step][m.gates[m.step]],correct=destination===m.expected[m.step];m.flight={destination,progress:0,correct};if(!correct)m.fail('Este servidor não atende à próxima delegação da consulta. Siga raiz, domínio de topo e autoridade da zona.');else m.message='Consulta enviada. Aguardando '+(m.step===2?'a resposta da autoridade':'a referência do próximo servidor')+'…';}
    };
    m.tick=dt=>{if(!m.flight)return;m.flight.progress=Math.min(1,m.flight.progress+dt/1.6);if(m.flight.progress<1)return;const f=m.flight;m.flight=null;if(f.correct){m.visited.push(f.destination);m.step++;if(m.step===3){m.answer=m.ip;m.done=true;}else m.message=m.step===1?'A raiz indicou '+(org?'.org':'.com')+'. Consulte esse domínio de topo.':'A delegação indicou '+m.zone+'. Consulte sua autoridade.';}else m.message='Servidor incorreto. A consulta voltou ao resolvedor sem uma resposta válida.';m.needsSync=true;};
    m.next=()=>m.flight||m.done?wait:m.options[m.step][m.gates[m.step]]!==m.expected[m.step]?{id:'gate'+m.step,value:m.options[m.step].indexOf(m.expected[m.step])}:{id:'send'};
  }
  ByteRunner.dnsResolution=Object.freeze({resolve});
  ByteRunner.dnsRepairModels=Object.freeze({'record-engraver':domains,'delegation-hoist':tree,'cache-carousel':cache,'query-courier':query});
})();
