/* Parallel v2 catalog/session adapter. Legacy factories remain registered. */
(() => {
  'use strict';
  const api=ByteRunner;
  const stages=[
    ['cpu-install','Instalação do processador','Pegue e gire o processador. Alinhe os triângulos, encaixe e feche a alavanca.','ram-install','Instalação de memória','Encaixe os três módulos nos slots com o mesmo entalhe.','power-wiring','Ligação da alimentação','Conecte os cabos da fonte às entradas com a mesma chave e número de contatos.','fan-replacement','Troca da ventoinha','Desconecte e retire a ventoinha avariada. Instale, fixe e conecte a reposição.'],
    ['virus-cleanup','Limpeza de vírus','Toque nos arquivos para analisar. Arraste somente as ameaças para a quarentena.','file-recovery','Recuperação de arquivos','Encaixe os recortes nas imagens correspondentes para reconstruir os arquivos.','process-repair','Reparo de processos','Reordene os módulos pelas dependências e acione a alavanca da esteira.','system-restore','Restauração do sistema','Reconecte as ligações e leve a energia do carregador até o sistema.'],
    ['packet-diverter','Roteamento de pacotes','Ajuste as junções e envie cada pacote à saída indicada. Aguarde a entrega.','patch-leads','Painel de conexões','Arraste os conectores RJ45 até as portas com o mesmo número.','vlan-shutters','Ativação de portas','Repare as trilhas e ligue somente as portas solicitadas.','uplink-clutch','Troca de módulo do switch','Desligue, abra a tampa, retire o módulo defeituoso e instale a reposição. Fixe e religue.'],
    ['route-rail','Reconstrução de rotas','Arraste a saída de cada roteador até a entrada do próximo. Construa uma rota de A até F e teste a comunicação.','interface-crimp','Reparo de interfaces','Isole a alimentação, retire os conectores avariados para a bandeja, insira os módulos, reconecte os cabos e ative as portas.','gateway-periscope','Restauração do gateway','Ajuste o volante ao destino solicitado e mova a ponte para a saída externa. Lance o pacote e acompanhe sua entrega.','prefix-cams','Núcleo de roteamento','Gire os módulos até as marcas douradas. Reconecte as três vias eletrônicas e ative o processador central.'],
    ['dish-gimbal','Alinhamento da antena','Arraste o prato da antena para girar o feixe até o receptor. Trave a direção e aguarde a confirmação do sinal.','spectrum-tuner','Limpeza de interferências','Arraste filtros sobre os três picos vermelhos do espectro. Preserve o sinal útil verde e estabilize a transmissão.','rf-compressor','Calibração do transmissor','Gire os controles físicos de potência e ventilação. Alinhe a potência à marca indicada, mantenha a temperatura até 60 °C e confirme.','repeater-mast','Posicionamento de repetidores','Arraste os repetidores para bases livres. Forme uma cadeia desde a origem, cubra as zonas A, B e C e confirme os enlaces.'],
    ['rj45-comb','Crimpagem RJ45','Arraste os oito fios até os pinos do padrão T568A ou T568B indicado. Aperte o alicate para crimpar o conector.','continuity-trace','Teste de cabeamento','Conecte as pontas às duas extremidades e teste. Repare somente os condutores rompidos e repita a medição até acender os oito LEDs.','cable-reel','Emenda de cabo','Leve o desencapador às duas pontas. Alinhe os condutores da mesma cor e feche a prensa para unir e restaurar o isolamento.','fiber-splice','Alinhamento de fibra','Mova os dois núcleos ópticos verticalmente até a marca central. Observe o feixe de luz e trave o acoplador com 100% de sinal.'],
    ['lease-pneumatics','Entrega de endereços','Arraste chips de IP para clientes da mesma sub-rede. Preserve reservas e exclua gateway, difusão e endereços ocupados.','conflict-localizer','Resolução de conflitos','Compare os IPs com o registro do servidor. Selecione a concessão duplicada e entregue um IP livre ao cliente incorreto.','reservation-drum','Reparo do servidor DHCP','Desligue e abra o servidor. Substitua o módulo de alocação, reconecte os três circuitos e reinicie o serviço preservando as reservas.','pool-sluice','Intervalo de endereços','Mova os batentes de início e fim. Atenda a quantidade de clientes sem incluir rede, difusão, gateway ou reservas e libere o intervalo.'],
    ['record-engraver','Conexão de domínios','Arraste os cabos dos nomes até os IPs indicados pelos registros A. Para CNAME, siga o nome de destino até seu endereço.','delegation-hoist','Reparo da árvore DNS','Arraste cada servidor para sua zona na hierarquia. Restaure o pai antes de conectar seus filhos e acompanhe as delegações.','cache-carousel','Limpeza do cache DNS','Retire para a bandeja os cartuchos com TTL expirado. Insira os registros renovados correspondentes, preserve os válidos e estabilize a memória.','query-courier','Rastreamento de consulta','Ajuste a comporta ativa e envie a consulta à raiz, ao domínio de topo e à autoridade da zona. Aguarde cada resposta retornar ao resolvedor.'],
    ['policy-camshaft','Motor de regras do firewall','Arraste módulos para as prioridades. A primeira regra correspondente decide o pacote. Bloqueie a origem hostil antes da permissão HTTPS e deixe o bloqueio geral por último.','inspection-airlock','Bloqueio de pacotes','Leia origem, porta e estado. Negue a origem 203.0.113.66 e conexões inválidas. Permita conexões estabelecidas, HTTPS, DNS previsto e SSH do administrador 10.0.0.10.','threat-triangulation','Scanner de ameaças','Inspecione cada pacote. Assinaturas MAL-01 e EXP-02 ou integridade inválida exigem quarentena. Libere apenas conteúdo íntegro sem essas assinaturas.','shield-iris','Barreira de segurança','Gire os módulos até as marcas, reconecte a alimentação de cada segmento e energize a barreira para restaurar toda a proteção.'],
    ['rack-busbars','Restauração de energia','Isole e aterre o rack. Instale fontes com tensão e potência compatíveis, reconecte os três canais e acompanhe a partida dos servidores.','replica-flywheels','Emergência de refrigeração','Isole as ventoinhas, substitua as duas avariadas e preserve a íntegra. Direcione as venezianas para cima, ligue a refrigeração e estabilize todos os racks até 55 °C.','backbone-prisms','Ativação do núcleo','Reconecte os três relés. Acione pré-carga, refrigeração e relógio antes do sincronismo. Aguarde a propagação de energia e ative a restauração central.','rack-gantry','Balanceamento de processamento','Mova módulos entre servidores ou pela bancada temporária. Atenda todos os módulos com uso até 85% por servidor e diferença de carga até 25 pontos percentuais.']
  ];
  const themes=['hardware','software','switch','router','wifi','cabling','dhcp','dns','firewall','servers'];
  const catalog=stages.flatMap((items,i)=>Array.from({length:4},(_,j)=>Object.freeze({id:'v2-'+items[j*3],key:items[j*3],name:items[j*3+1],instruction:items[j*3+2],stage:i+1,mechanic:items[j*3],difficulty:Math.ceil((i+1)/2)})));
  const byId=new Map(catalog.map(c=>[c.id,c]));
  function random(seed){let state=2166136261;for(const c of String(seed))state=Math.imul(state^c.charCodeAt(0),16777619);return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
  function create(spec,context={}){
    const entry=byId.get(spec.type),rank=Math.max(0,Math.min(5,context.repairRank||0));
    let host=null,view=null,abort=null,previousFocus=null,statusText=null,hintButton=null,retryButton=null,winTime=0,explicitlyPaused=false;
    const rng=context.random??random(spec.seed??Date.now());
    const modelOptions={difficulty:spec.difficulty??entry.difficulty,componentId:context.component?.id};
    const session={
      engine:'v2',blocksWorld:true,status:'running',mode:'playing',progress:0,mistakes:0,maxMistakes:3+Math.floor(rank/2),hints:1+rank,attempt:0,model:null,
      active(){return this.status==='running'&&this.mode==='playing'&&!explicitlyPaused&&(!context.isActive||context.isActive())&&!document.hidden;},
      label(){return entry.name;},
      start(){view?.dispose();view=null;this.model=api.repairV2Models.create(entry.key,rng,modelOptions);this.status='running';this.mode='playing';this.progress=0;this.mistakes=0;this.hints=1+rank;this.attempt++;winTime=0;if(host)this.mount(host);},
      action(action){
        if(!this.active())return;
        this.model.apply(action);
        if(this.model.error){this.mistakes++;if(this.mistakes>=this.maxMistakes){this.mode='failed';context.onFailure?.();}}
        if(this.model.done){this.mode='won';this.progress=1;winTime=0;}
        this.sync();
      },
      sync(){
        if(!host)return;view?.sync();hintButton.disabled=!this.active()||!this.hints;
        hintButton.textContent='DICA · '+this.hints;
        retryButton.hidden=this.mode!=='failed';
        statusText.textContent=this.mode==='won'?'SISTEMA RESTAURADO':this.mode==='failed'?'Tentativa interrompida. Até 5 de integridade descontados.':this.model.message||'';
        statusText.dataset.state=this.mode==='failed'||this.model.error?'error':'ready';
        host.dataset.state=this.mode;
      },
      hint(){
        if(!this.active()||this.hints<=0)return;this.hints--;const next=this.model.next();this.sync();
        if(next?.wait){statusText.textContent=next.message;return;}
        const control=this.model.controls().find(c=>c.id===next?.id);if(control){view.hint(control.id);statusText.textContent=control.label+(control.mark!==undefined?' · siga a marca '+(control.mark+1):'');}
      },
      mount(target){
        view?.dispose();abort?.abort();abort=new AbortController();host=target;if(!previousFocus)previousFocus=document.activeElement;host.replaceChildren();host.classList.add('repair-v2-host');
        const instruction=document.createElement('p');instruction.className='repair-v2-instruction';instruction.textContent=entry.instruction;host.append(instruction);
        view=api.repairV2Renderer.create(host,entry,this.model,{active:()=>this.active(),action:a=>this.action(a)});
        const footer=document.createElement('div');footer.className='repair-v2-tools';host.append(footer);
        const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn,{signal:abort.signal});footer.append(b);return b;};
        hintButton=button('DICA',()=>this.hint());retryButton=button('NOVA TENTATIVA',()=>this.start());
        button('RECOMEÇAR',()=>{if(this.active()){const used=this.mistakes,hints=this.hints;this.model=api.repairV2Models.create(entry.key,random(spec.seed??entry.id),modelOptions);this.mistakes=used;this.hints=hints;view.dispose();view=null;this.mount(host);}});
        const help=document.createElement('small');help.textContent='Arraste ou selecione a peça e seu destino. Setas ajustam; Enter aciona. H: dica.';help.className='repair-v2-help';host.append(help);
        statusText=document.createElement('p');statusText.className='repair-v2-feedback';statusText.setAttribute('role','status');statusText.setAttribute('aria-live','polite');host.append(statusText);this.sync();
        host.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
      },
      update(dt){
        const live=this.status==='running'&&!explicitlyPaused&&(!context.isActive||context.isActive())&&!document.hidden;
        view?.setPaused(!live);if(!live)return;
        if(this.mode==='playing'&&this.model.tick){
          this.model.tick(Math.min(.05,Math.max(0,dt||0)));
          if(this.model.done){this.mode='won';this.progress=1;winTime=0;this.model.needsSync=false;this.sync();}
          else if(this.model.needsSync){this.model.needsSync=false;this.sync();}
        }
        if(this.mode==='playing'||this.mode==='won')view?.update(Math.min(.05,Math.max(0,dt||0)));
        if(this.mode==='won'){winTime+=Math.max(0,dt||0);if(winTime>=.45)this.status='success';}
      },
      setPaused(value){explicitlyPaused=Boolean(value);view?.setPaused(explicitlyPaused);},
      handleKey(event){
        if(event.key==='Tab'&&!context.standalone){
          const panel=host?.closest('.repair-panel')??host,buttons=[...panel.querySelectorAll('button:not(:disabled):not([hidden])')];const i=buttons.indexOf(document.activeElement),next=i+(event.shiftKey?-1:1);
          if(next<0||next>=buttons.length){event.preventDefault();buttons[(next+buttons.length)%buttons.length]?.focus();}return;
        }
        if(event.key.toLowerCase()==='h'&&!event.repeat){event.preventDefault();this.hint();}
      },
      cancel(){this.status='cancelled';view?.setPaused(true);},
      dispose(){view?.dispose();view=null;abort?.abort();host?.replaceChildren();host?.classList.remove('repair-v2-host');if(host)delete host.dataset.state;host=null;previousFocus?.focus?.({preventScroll:true});previousFocus=null;}
    };
    session.start();return session;
  }
  for(const item of catalog)api.repairs.register(item.id,create);
  function assign(phase,index=0){
    const stage=Math.min(10,Math.max(1,themes.indexOf(phase.theme)+1||index+1)),pool=catalog.filter(c=>c.stage===stage),result=new Map(),counts=new Map(pool.map(c=>[c.id,0]));
    const pending=[];
    for(const c of phase.entities.components){
      if(c.repair&&c.repair.selection!=='auto'){result.set(c.id,c.repair);if(counts.has(c.repair.type))counts.set(c.repair.type,counts.get(c.repair.type)+1);}
      else pending.push(c);
    }
    pending.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
    for(const c of pending){
      const key=phase.id+'/'+c.id,preferred=api.repairV2Manifest?.[key];
      const chosen=preferred?byId.get(preferred.type):pool.reduce((a,b)=>counts.get(a.id)<=counts.get(b.id)?a:b);
      result.set(c.id,{type:chosen.id,stage,selection:'auto',difficulty:preferred?.difficulty??c.repair?.difficulty??Math.ceil(stage/2),seed:JSON.stringify([phase.id,phase.generation?.seed??phase.seed??'campaign',c.id,c.region??''])});
      counts.set(chosen.id,(counts.get(chosen.id)||0)+1);
    }
    return result;
  }
  api.repairV2={catalog:Object.freeze(catalog),assign,enabled:new URLSearchParams(location.search).get('repairs')!=='legacy'};
})();
