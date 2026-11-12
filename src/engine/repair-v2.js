/* Parallel v2 catalog/session adapter. Legacy factories remain registered. */
(() => {
  'use strict';
  const api=ByteRunner;
  const stages=[
    ['cpu-install','Instalação do processador','Pegue e gire o processador. Alinhe os triângulos, encaixe e feche a alavanca.','ram-install','Instalação de memória','Encaixe os três módulos nos slots com o mesmo entalhe.','power-wiring','Ligação da alimentação','Conecte os cabos da fonte às entradas com a mesma chave e número de contatos.','fan-replacement','Troca da ventoinha','Desconecte e retire a ventoinha avariada. Instale, fixe e conecte a reposição.'],
    ['virus-cleanup','Limpeza de vírus','Toque nos arquivos para analisar. Arraste somente as ameaças para a quarentena.','file-recovery','Recuperação de arquivos','Encaixe os recortes nas imagens correspondentes para reconstruir os arquivos.','process-repair','Reparo de processos','Reordene os módulos pelas dependências e acione a alavanca da esteira.','system-restore','Restauração do sistema','Reconecte as ligações e leve a energia do carregador até o sistema.'],
    ['packet-diverter','Desviadores de pacotes','Oriente as agulhas para a saída do selo e solte o pacote.','patch-leads','Cordões do switch','Leve cada cabo à porta com a mesma etiqueta.','vlan-shutters','Comportas de isolamento','Mova as divisórias até as marcas e libere o sinal.','uplink-clutch','Embreagens do uplink','Iguale as marcas e acople as duas transmissões.'],
    ['route-rail','Trilhos de encaminhamento','Deslize as peças para ligar os trilhos de 1 a 5.','interface-crimp','Terminação de interface','Desencape e alinhe os contatos antes de prensar.','gateway-periscope','Periscópio de saída','Encontre o farol, abra o túnel e envie a sonda.','prefix-cams','Cames de prefixo','Alinhe as faixas e solte as esferas de endereço.'],
    ['dish-gimbal','Gimbal da antena','Alinhe os dois eixos com o receptor e trave o gimbal.','spectrum-tuner','Sintonia do espectro','Ajuste frequência e largura para transmitir na faixa limpa.','rf-compressor','Compressor de sinal','Bombeie até a faixa útil e emita três pulsos.','repeater-mast','Mastros de repetição','Estenda os mastros e oriente o rebatedor pelas marcas.'],
    ['rj45-comb','Pente e crimpagem','Passe os fios pelos pinos indicados e feche a prensa.','continuity-trace','Rastreamento de ruptura','Meça os trechos e aplique a emenda na ruptura.','cable-reel','Carretel e conduítes','Escolha o conduíte aberto e desenrole até a marca de folga.','fiber-splice','Fusão de fibra','Limpe as duas faces, alinhe os núcleos e faça a fusão.'],
    ['lease-pneumatics','Tubos de concessão','Direcione as cápsulas aos clientes usando endereços livres.','conflict-localizer','Localizador de colisão','Leia o eco duplicado e reemita a concessão mais recente.','reservation-drum','Tambor de reservas','Combine identidade e gabarito antes de perfurar a reserva.','pool-sluice','Eclusa do pool','Ajuste os batentes, bloqueie a reserva e abra o fluxo.'],
    ['record-engraver','Gravadora de registros','Percorra o molde com o estilete e insira a placa no leitor.','delegation-hoist','Guincho de delegação','Ice cada ramo até seu ponto de sustentação.','cache-carousel','Carrossel de cache','Preserve os lacres íntegros e ejete os vencidos.','query-courier','Mensageiro recursivo','Siga as referências e devolva a resposta à origem.'],
    ['policy-camshaft','Comando de políticas','Deslize os cames para aplicar a exceção antes da regra geral.','inspection-airlock','Eclusa de inspeção','Abra a entrada, examine o lacre e libere ou isole o fluxo.','threat-triangulation','Triangulação de ameaça','Cruze os três sensores e feche a gaiola no foco.','shield-iris','Íris de proteção','Alinhe as lâminas e tensione a mola para fechar a íris.'],
    ['rack-busbars','Barramentos de potência','Isole a seção, encaixe as pontes e aperte os contatos.','replica-flywheels','Volantes de sincronismo','Alinhe as marcas e acople as réplicas da esquerda para a direita.','backbone-prisms','Prismas do backbone','Desloque e gire os prismas para alimentar os receptores.','rack-gantry','Pórtico de recuperação','Leve os módulos da origem aos racks com capacidade e suporte.']
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
