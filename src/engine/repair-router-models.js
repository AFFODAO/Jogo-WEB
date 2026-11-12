/* Fase 4: topologia, painel traseiro, máquina de gateway e placa de roteamento. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:96,h:96,kind:'router',...extra});
  const zone=(id,label,x,y)=>c(id,label,x,y,{mode:'target',h:88});
  const wait={wait:true,message:'Aguarde o percurso do sinal e a confirmação do equipamento.'};
  const mod=n=>(n%4+4)%4;
  function topology(m){
    m.nodes=[[105,150],[320,150],[535,150],[105,345],[320,345],[535,345]];
    m.allowed=[[1,3],[2,4],[5],[4],[5],[]];m.links=Array(6).fill(-1);m.flight=null;m.route=[];m.delivered=0;
    m.preferred=m.componentId==='iface-console:transit'?[0,3,4,5]:[0,1,2,5];
    const ports=()=>m.nodes.map(([x,y],i)=>zone('node'+i,'Entrada do roteador '+String.fromCharCode(65+i),x,y));
    m.controls=()=>[...ports(),...m.nodes.slice(0,5).map(([x,y],i)=>c('edge'+i,'Conexão de saída do roteador '+String.fromCharCode(65+i),x,y+77,{mode:'drag',h:88,locked:!!m.flight,targets:ports().filter((_,j)=>j!==i)})),c('probe','Testar rota',535,490,{locked:!!m.flight||m.done})];
    m.trace=()=>{const route=[0];while(route.at(-1)!==5){const next=m.links[route.at(-1)];if(next<0||route.includes(next))return null;route.push(next);}return route;};
    m.act=a=>{
      if(m.flight||m.done)return;
      if(/^edge[0-4]$/.test(a.id)&&/^node[0-5]$/.test(a.target)){
        const i=+a.id.at(-1),j=+a.target.at(-1);
        if(!m.allowed[i].includes(j)||(i===1&&j===4)){m.message='Enlace indisponível. Siga as linhas pontilhadas; o enlace vermelho está rompido.';return;}
        m.links[i]=j;m.message='Enlace '+String.fromCharCode(65+i)+' → '+String.fromCharCode(65+j)+' conectado.';
      }
      if(a.id==='probe'){
        const route=m.trace();if(!route){m.fail('A origem A ainda não tem uma rota contínua até o destino F.');return;}
        m.route=route;m.flight={progress:0};m.message='Enviando três pacotes de confirmação pela rota reconstruída…';
      }
    };
    m.tick=dt=>{if(!m.flight)return;m.flight.progress=Math.min(1,m.flight.progress+dt/1.4);if(m.flight.progress===1){m.delivered++;if(m.delivered===3){m.done=true;m.flight=null;}else m.flight.progress=0;m.needsSync=true;}};
    m.next=()=>{if(m.flight||m.done)return wait;for(let i=0;i<m.preferred.length-1;i++){const a=m.preferred[i],b=m.preferred[i+1];if(m.links[a]!==b)return {id:'edge'+a,target:'node'+b};}return {id:'probe'};};
  }
  function interfaces(m){
    m.isolated=false;m.removed=[false,false];m.seated=[false,false];m.cables=[false,false];m.ports=[false,false];m.charge=[0,0];m.inserted=[-10,-10];
    const bays=()=>[0,1].map(i=>zone('bay'+i,'Baia '+(i?'WAN':'LAN'),260+i*235,175));
    const ports=()=>[0,1].map(i=>zone('port'+i,'Conector '+(i?'WAN':'LAN'),260+i*235,275));
    const tray=zone('tray','Bandeja de conectores danificados',100,440);
    m.controls=()=>[c('isolate','Isolar alimentação das interfaces',95,120,{on:m.isolated,locked:m.isolated}),tray,...[0,1].flatMap(i=>[
      ...(m.removed[i]?[bays()[i]]:[]),
      ...(!m.removed[i]?[c('damaged'+i,'Retirar conector danificado '+(i?'WAN':'LAN'),260+i*235,175,{mode:'drag',targets:[tray]})]:[c('replacement'+i,'Inserir módulo '+(i?'WAN':'LAN'),260+i*235,m.seated[i]?175:445,{mode:'drag',locked:m.seated[i],targets:[bays()[i]]})]),
      ...(m.seated[i]?[ports()[i],c('cable'+i,'Reconectar cabo '+(i?'WAN':'LAN'),260+i*235,m.cables[i]?275:445,{mode:'drag',locked:m.cables[i],targets:ports()}),c('activate'+i,'Ativar porta '+(i?'WAN':'LAN'),260+i*235,355,{on:m.ports[i],locked:m.ports[i]})]:[])
    ])];
    m.act=a=>{
      if(m.done)return;if(a.id==='isolate'){m.isolated=true;return;}
      if(/^damaged[01]$/.test(a.id)&&a.target==='tray'){if(!m.isolated){m.fail('Isole a alimentação antes de retirar um conector.');return;}m.removed[+a.id.at(-1)]=true;}
      if(/^replacement[01]$/.test(a.id)){const i=+a.id.at(-1);if(m.isolated&&m.removed[i]&&a.target==='bay'+i&&!m.seated[i]){m.seated[i]=true;m.inserted[i]=m.time;}}
      if(/^cable[01]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!=='port'+i){m.message='O cabo deve retornar à interface com a mesma etiqueta.';return;}if(m.seated[i])m.cables[i]=true;}
      if(/^activate[01]$/.test(a.id)){const i=+a.id.at(-1);if(!m.seated[i]||!m.cables[i]){m.fail('Instale o módulo e reconecte o cabo antes de ativar a porta.');return;}m.ports[i]=true;}
    };
    m.tick=dt=>{for(let i=0;i<2;i++)if(m.ports[i])m.charge[i]=Math.min(1,m.charge[i]+dt/.85);m.done=m.charge.every(v=>v===1);};
    m.next=()=>{if(!m.isolated)return {id:'isolate'};for(let i=0;i<2;i++){if(!m.removed[i])return {id:'damaged'+i,target:'tray'};if(!m.seated[i])return {id:'replacement'+i,target:'bay'+i};if(!m.cables[i])return {id:'cable'+i,target:'port'+i};if(!m.ports[i])return {id:'activate'+i};}return wait;};
  }
  function gateway(m){
    m.selector=0;m.bridge=0;m.targets=m.shuffle([0,1,2]);m.index=0;m.flight=null;m.received=[0,0,0];m.flash=[-10,-10,-10];
    m.controls=()=>[c('selector','Volante de destino: '+['filial','central','nuvem'][m.selector],145,425,{mode:'dial',max:2,value:m.selector,locked:!!m.flight}),c('bridge','Ponte de saída: '+(m.bridge?'externa':'retorno local'),330,425,{mode:'rail',max:1,value:m.bridge,locked:!!m.flight}),c('launch','Lançar pacote de teste',525,425,{locked:!!m.flight||m.done})];
    m.act=a=>{
      if(m.flight||m.done)return;
      if(a.id==='selector')m.selector=((a.value??m.selector+1)%3+3)%3;
      if(a.id==='bridge')m.bridge=(a.value??1-m.bridge)?1:0;
      if(a.id==='launch'){const correct=m.selector===m.targets[m.index]&&m.bridge===1;m.flight={progress:0,lane:m.selector,external:m.bridge===1,correct};if(!correct)m.fail(m.bridge?'O destino não corresponde ao endereço do pacote.':'A ponte está no retorno local. Direcione-a à saída externa.');else m.message='Pacote em trânsito. Aguardando confirmação do destino…';}
    };
    m.tick=dt=>{if(!m.flight)return;m.flight.progress=Math.min(1,m.flight.progress+dt/1.8);if(m.flight.progress<1)return;const f=m.flight;m.flight=null;if(f.correct){m.received[f.lane]++;m.flash[f.lane]=m.time;m.index++;m.done=m.index===3;}else m.message='Pacote devolvido. Ajuste o volante e a ponte de saída.';m.needsSync=true;};
    m.next=()=>m.flight||m.done?wait:m.selector!==m.targets[m.index]?{id:'selector',value:m.targets[m.index]}:m.bridge!==1?{id:'bridge',value:1}:{id:'launch'};
  }
  function core(m){
    m.target=m.shuffle([0,1,2]);m.rotation=m.target.map(t=>mod(t+1+m.int(3)));m.previous=[...m.rotation];m.turned=[-10,-10,-10];m.links=[false,false,false];m.booting=false;m.activation=0;
    const gaps=()=>[0,1,2].map(i=>zone('gap'+i,'Contato do canal '+(i+1),140+i*180,295));
    m.controls=()=>[...[0,1,2].map(i=>c('rotor'+i,'Girar módulo '+(i+1)+' até a marca '+(m.target[i]+1),140+i*180,170,{mode:'dial',max:3,value:m.rotation[i],mark:m.target[i],locked:m.booting})),...gaps(),...m.links.map((v,i)=>c('path'+i,'Reconectar via eletrônica '+(i+1),140+i*180,v?295:490,{mode:'drag',locked:v||m.booting,targets:gaps()})),c('cpu','Ativar processador central de roteamento',320,390,{locked:m.booting,on:m.booting})];
    m.act=a=>{
      if(m.booting||m.done)return;
      if(/^rotor[0-2]$/.test(a.id)){const i=+a.id.at(-1);m.previous[i]=m.rotation[i];m.rotation[i]=mod(a.value??m.rotation[i]+1);m.turned[i]=m.time;}
      if(/^path[0-2]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!=='gap'+i){m.message='Esta via pertence ao contato com o mesmo número.';return;}if(m.rotation[i]!==m.target[i]){m.message='Alinhe o módulo à marca dourada antes de reconectar sua via.';return;}m.links[i]=true;}
      if(a.id==='cpu'){if(!m.links.every(Boolean)||!m.rotation.every((v,i)=>v===m.target[i])){m.fail('Existem vias interrompidas ou módulos desalinhados. Revise os três canais.');return;}m.booting=true;m.message='Energizando as vias e iniciando o processador de roteamento…';}
    };
    m.tick=dt=>{if(m.booting)m.activation=Math.min(1,m.activation+dt/1.5);m.done=m.activation===1;};
    m.next=()=>{if(m.booting||m.done)return wait;const i=m.rotation.findIndex((v,i)=>v!==m.target[i]);if(i>=0)return {id:'rotor'+i,value:m.target[i]};const j=m.links.indexOf(false);return j>=0?{id:'path'+j,target:'gap'+j}:{id:'cpu'};};
  }
  ByteRunner.routerRepairModels=Object.freeze({'route-rail':topology,'interface-crimp':interfaces,'gateway-periscope':gateway,'prefix-cams':core});
})();
