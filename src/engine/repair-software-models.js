/* Stage 2 rules. The desktop and machines are fictional; no filesystem access. */
(() => {
  'use strict';
  const at=(id,label,x,y,kind,extra={})=>({id,label,x,y,kind,w:112,h:104,...extra});
  const zone=(id,label,x,y,w=112,h=112)=>at(id,label,x,y,'software-target',{mode:'target',w,h});
  const drop=(id,target)=>({id,target});
  function shared(m){
    m.rejected=null;m.rejectFor=0;m.needsSync=false;
    m.reject=(id,text)=>{m.rejected=id;m.rejectFor=.8;m.message=text;};
    m.feedback=dt=>{m.rejectFor=Math.max(0,m.rejectFor-dt);};
    m.clear=()=>{m.rejected=null;m.rejectFor=0;};
  }
  function cleanup(m){
    shared(m);m.names=['relatorio.txt','foto.png','servico.exe','atualizacao.dll','notas.txt','controlador.sys'];
    m.infected=m.shuffle([0,1,2,3,4,5]).slice(0,3);m.scans=Array(6).fill(null);m.quarantined=Array(6).fill(null);m.deleted=Array(6).fill(false);
    const bin={id:'quarantine',x:515,y:450,w:160,h:140};
    m.controls=()=>[
      zone(bin.id,'Câmara de quarentena',bin.x,bin.y,bin.w,bin.h),
      ...m.names.flatMap((name,i)=>m.quarantined[i]!==null?[]:[at('file'+i,name+(m.scans[i]===1?(m.infected.includes(i)?' · infectado':' · íntegro'):' · toque para analisar'),115+i%3*190,125+Math.floor(i/3)*155,'software-file',{
        mode:'drag',w:128,h:120,number:i,pickAction:'scan'+i,targets:[bin]})])
    ];
    m.act=a=>{
      if(/^scan[0-5]$/.test(a.id)||(/^file[0-5]$/.test(a.id)&&!a.target)){const i=Number(a.id.at(-1));if(m.scans[i]===null){m.scans[i]=0;m.message='Analisando '+m.names[i]+'…';}return;}
      if(!/^file[0-5]$/.test(a.id)||a.target!=='quarantine')return;
      const i=Number(a.id.at(-1));
      if(m.scans[i]!==1){m.reject('quarantine','Aguarde a análise do arquivo antes de colocá-lo em quarentena.');return;}
      if(!m.infected.includes(i)){m.fail('Arquivo íntegro. Preserve os arquivos normais da área de trabalho.');m.reject('quarantine',m.message);return;}
      if(m.quarantined[i]===null){m.quarantined[i]=0;m.clear();m.message='Ameaça isolada. Removendo a assinatura infectada…';}
    };
    m.tick=dt=>{
      m.feedback(dt);
      for(let i=0;i<6;i++){
        if(m.scans[i]!==null&&m.scans[i]<1){
          m.scans[i]=Math.min(1,m.scans[i]+dt/.55);
          if(m.scans[i]===1){m.needsSync=true;m.message=m.names[i]+(m.infected.includes(i)?' · ameaça detectada.':' · arquivo íntegro.');}
        }
        if(m.quarantined[i]!==null&&m.quarantined[i]<1){m.quarantined[i]=Math.min(1,m.quarantined[i]+dt/.7);if(m.quarantined[i]===1){m.deleted[i]=true;m.needsSync=true;}}
      }
      m.done=m.infected.every(i=>m.deleted[i]);
    };
    m.next=()=>{
      const i=m.infected.find(i=>m.quarantined[i]===null);
      if(i===undefined)return {wait:true,message:'A câmara está removendo as assinaturas isoladas.'};
      if(m.scans[i]===null)return {id:'file'+i};
      return m.scans[i]<1?{wait:true,message:'Aguarde o feixe terminar a análise.'}:drop('file'+i,'quarantine');
    };
  }
  function recovery(m){
    shared(m);m.scatter=m.shuffle([0,1,2,3,4,5]);m.slots=Array(6).fill(-1);m.placedAt=Array(6).fill(-10);m.rebuild=[0,0];
    const sockets=()=>Array.from({length:6},(_,i)=>({id:'recovery-slot'+i,x:160+i%3*160,y:120+Math.floor(i/3)*140,w:160,h:112}));
    m.controls=()=>[
      ...sockets().map((s,i)=>zone(s.id,'Fragmento '+String.fromCharCode(65+Math.floor(i/3))+(i%3+1),s.x,s.y,s.w,s.h)),
      ...[0,1,2,3,4,5].map(i=>{const slot=m.slots.indexOf(i),pos=m.scatter.indexOf(i);return at('fragment'+i,'Encaixar fragmento '+String.fromCharCode(65+Math.floor(i/3))+(i%3+1),slot<0?130+pos%3*190:160+slot%3*160,slot<0?390+Math.floor(pos/3)*105:120+Math.floor(slot/3)*140,'software-fragment',{
        mode:'drag',w:124,h:96,number:i,locked:slot>=0,targets:sockets()});})
    ];
    m.act=a=>{
      if(!/^fragment[0-5]$/.test(a.id)||!a.target)return;
      const i=Number(a.id.at(-1)),slot=sockets().findIndex(s=>s.id===a.target);
      if(slot<0)return;
      if(slot!==i){m.reject(a.target,'Este recorte pertence a outra parte do arquivo.');return;}
      if(m.slots[slot]>=0)return;m.slots[slot]=i;m.placedAt[slot]=m.time;m.clear();
    };
    m.tick=dt=>{m.feedback(dt);for(let i=0;i<2;i++)if(m.slots.slice(i*3,i*3+3).every(v=>v>=0))m.rebuild[i]=Math.min(1,m.rebuild[i]+dt/.8);m.done=m.rebuild.every(v=>v===1);};
    m.next=()=>{const i=m.slots.findIndex(v=>v<0);return i<0?{wait:true,message:'Os fragmentos estão sendo reconstruídos em arquivos íntegros.'}:drop('fragment'+i,'recovery-slot'+i);};
  }
  function process(m){
    shared(m);m.order=m.shuffle([0,1,2,3]);if(m.order.every((v,i)=>v===i))[m.order[0],m.order[3]]=[m.order[3],m.order[0]];
    m.labels=m.componentId==='kernel-stack:kernel'?['NÚCLEO','MEMÓRIA','SERVIÇOS','SAÍDA']:['CARREGAR','VALIDAR','EXECUTAR','LIBERAR'];
    m.running=false;m.cursor=0;m.travel=0;m.processed=[];m.failedAt=-1;m.faultFor=0;
    const seats=()=>[0,1,2,3].map(i=>({id:'process-seat'+i,x:110+i*140,y:165,w:120,h:128}));
    m.controls=()=>[
      ...seats().map((s,i)=>zone(s.id,'Posição '+(i+1)+' da esteira',s.x,s.y,s.w,s.h)),
      ...[0,1,2,3].map(i=>at('process'+i,'Mover módulo '+m.labels[i],110+m.order.indexOf(i)*140,165,'software-process',{mode:'drag',w:120,h:128,number:i,locked:m.running,targets:seats()})),
      at('execute','Puxar alavanca da execução',180,455,'software-execute',{mode:'rail',value:m.running?1:0,max:1,locked:m.running})
    ];
    m.act=a=>{
      if(m.running)return;
      if(/^process[0-3]$/.test(a.id)&&a.target){
        const module=Number(a.id.at(-1)),source=m.order.indexOf(module),target=seats().findIndex(s=>s.id===a.target);
        if(target<0)return;[m.order[source],m.order[target]]=[m.order[target],m.order[source]];m.failedAt=-1;m.processed=[];m.clear();return;
      }
      if(a.id==='execute'&&(a.value??1)===1){
        m.running=true;m.cursor=0;m.travel=0;m.processed=[];m.invalid=m.order.findIndex((v,i)=>v!==i);
        if(m.invalid>=0){m.failedAt=m.invalid;m.faultFor=1.5;m.fail('Sequência interrompida. Siga as dependências gravadas acima da esteira.');}
        else{m.failedAt=-1;m.message='Esteira em execução. Os processos estão atravessando a CPU.';}
      }
    };
    m.tick=dt=>{
      m.feedback(dt);m.faultFor=Math.max(0,m.faultFor-dt);if(!m.running)return;
      m.travel+=dt/.6;
      if(m.travel>=1){
        m.travel=0;
        if(m.cursor===m.invalid){m.running=false;m.needsSync=true;m.faultFor=1.2;return;}
        m.processed.push(m.order[m.cursor]);m.cursor++;
        if(m.cursor===4){m.running=false;m.done=true;m.needsSync=true;}
      }
    };
    m.next=()=>{
      if(m.running)return {wait:true,message:'Aguarde os módulos atravessarem a máquina.'};
      const i=m.order.findIndex((v,i)=>v!==i);
      return i<0?{id:'execute',value:1}:drop('process'+i,'process-seat'+i);
    };
  }
  function restore(m){
    shared(m);m.links=[false,false];m.linkedAt=[-10,-10];m.switches=[false,false,false];m.rebooting=false;m.restart=0;m.faultNode=-1;
    const ports=[{id:'boot-port0',x:290,y:245,w:112,h:104},{id:'boot-port1',x:515,y:245,w:112,h:104}];
    m.controls=()=>[
      ...ports.map(p=>zone(p.id,'Entrada do módulo '+(p.id.endsWith('0')?'de memória':'de inicialização'),p.x,p.y,p.w,p.h)),
      ...m.links.map((linked,i)=>at('boot-link'+i,'Reconectar ligação '+(i+1),linked?ports[i].x:135+i*270,linked?245:490,'software-boot-plug',{
        mode:'drag',locked:linked||m.rebooting,number:i,targets:ports})),
      ...m.switches.map((on,i)=>at('boot-switch'+i,['Ligar carregador','Ligar memória','Iniciar sistema'][i],125+i*195,365,'software-boot-switch',{on,locked:on||m.rebooting,number:i}))
    ];
    m.act=a=>{
      if(m.rebooting)return;
      if(/^boot-link[0-1]$/.test(a.id)&&a.target){
        const i=Number(a.id.at(-1));
        if(a.target!==ports[i].id){m.reject(a.target,'Esta ligação pertence ao outro encaixe do circuito de inicialização.');return;}
        m.links[i]=true;m.linkedAt[i]=m.time;m.clear();return;
      }
      if(/^boot-switch[0-2]$/.test(a.id)){
        const i=Number(a.id.at(-1)),next=m.switches.findIndex(v=>!v);
        if(!m.links.every(Boolean)||i!==next){m.faultNode=i;m.reject('boot-switch'+i,'');m.fail(!m.links.every(Boolean)?'Reconecte as duas ligações antes de ligar o sistema.':'A energia deve avançar do carregador para a memória e depois para o sistema.');return;}
        m.switches[i]=true;m.faultNode=-1;m.clear();
        if(m.switches.every(Boolean)){m.rebooting=true;m.message='Restaurando os módulos e reiniciando o sistema…';}
      }
    };
    m.tick=dt=>{m.feedback(dt);if(m.rebooting){m.restart=Math.min(1,m.restart+dt/1.4);m.done=m.restart===1;}};
    m.next=()=>{const link=m.links.findIndex(v=>!v);if(link>=0)return drop('boot-link'+link,ports[link].id);const i=m.switches.findIndex(v=>!v);return i<0?{wait:true,message:'O sistema está reiniciando a partir dos módulos restaurados.'}:{id:'boot-switch'+i};};
  }
  ByteRunner.softwareRepairModels=Object.freeze({'virus-cleanup':cleanup,'file-recovery':recovery,'process-repair':process,'system-restore':restore});
})();
