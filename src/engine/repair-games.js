/* Component repair puzzles: model generation, accessible UI and modal lifecycle. */
(() => {
  'use strict';
  const api=window.ByteRunner;
  const names=['Circuitos de hardware','Restauração de software','Portas do switch','Rotas do roteador','Calibração Wi-Fi','Pares de cabeamento','Concessões DHCP','Resolução DNS','Políticas do firewall','Sincronização de servidores'];
  const types=['circuit','software','ethernet','route','wifi','cabling','dhcp','dns','firewall','servers'];
  const shuffle=(items,random)=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const rotate=mask=>((mask<<1)&15)|(mask>>3);
  const direction=(a,b,n)=>b===a-n?1:b===a+1?2:b===a+n?4:8;
  let serial=0;
  function modelFor(type,stage,random,componentIndex=0) {
    const n=stage>5 || componentIndex>=2?4:3;
    if(type==='circuit') {
      const path=[];for(let row=0;row<n;row++)for(let j=0;j<n;j++)path.push(row*n+(row%2?n-1-j:j));
      const answer=Array(n*n).fill(0);
      path.forEach((cell,i)=>{answer[cell]=(i?direction(cell,path[i-1],n):8)|(i<path.length-1?direction(cell,path[i+1],n):n%2?2:8);});
      const values=answer.map(mask=>{for(let i=0,k=1+Math.floor(random()*3);i<k;i++)mask=rotate(mask);return mask;});
      if(values.every((v,i)=>v===answer[i]))values[0]=rotate(values[0]);
      return {kind:'circuit',n,answer,values,path,source:0,target:path.at(-1),instructions:'Gire as peças para levar energia de IN até OUT. Cada clique ou Enter gira 90°. Os terminais precisam ficar conectados.',check(m){
        if(!(m.values[0]&8))return false;
        const seen=new Set([0]),queue=[0];
        for(const cell of queue)for(const [bit,delta,back] of [[1,-n,4],[2,1,8],[4,n,1],[8,-1,2]]) {
          const other=cell+delta;
          if(other<0||other>=n*n||Math.abs(cell%n-other%n)>1||!(m.values[cell]&bit)||!(m.values[other]&back)||seen.has(other))continue;
          seen.add(other);queue.push(other);
        }
        return seen.has(m.target)&&Boolean(m.values[m.target]&(n%2?2:8));
      }};
    }
    if(type==='route') {
      const path=[0,1,2,6,10,11,15], blocked=shuffle([4,5,7,8,9,12,13,14],random).slice(0,4);
      return {kind:'route',n:4,path:[0],answer:path,blocked,source:0,target:15,instructions:'Escolha um caminho de O até D usando casas vizinhas na horizontal ou vertical. Vermelho indica conexão bloqueada. Clique no último nó para voltar.',check:m=>m.path.at(-1)===15};
    }
    if(type==='wifi') {
      const channel=1+Math.floor(random()*11),power=45+Math.floor(random()*7)*5;
      return {kind:'wifi',answer:[channel,power],values:[channel===6?1:6,20],instructions:`O analisador encontrou o canal livre ${channel}. Ajuste o canal e a potência para ${power}%. A conexão precisa dos dois valores corretos.`,check:m=>m.values[0]===channel&&Math.abs(m.values[1]-power)<=5};
    }
    let labels,answer,options,instructions,kind='match';
    if(type==='software') {
      labels=['01 · Inicialização','02 · Verificação','03 · Restauração','04 · Execução'];
      answer=['Carregar arquivos','Verificar assinatura','Isolar corrompidos','Iniciar processo'];
      instructions='Restaure a ordem lógica: carregar → verificar → isolar → iniciar. Selecione a ação correta para cada etapa.';
    } else if(type==='ethernet') {
      const destinations=shuffle(['PC de suporte','Impressora','Servidor','Access point'],random);
      labels=destinations.map((d,i)=>`Porta ${i+1} → ${d}`);answer=destinations;
      instructions='Conecte cada porta ao destino indicado na etiqueta. Cada destino só pode ocupar uma porta.';
    } else if(type==='cabling') {
      const pattern=random()<.5?'T568A':'T568B';
      answer=pattern==='T568B'?['Branco/laranja','Laranja','Branco/verde','Azul','Branco/azul','Verde','Branco/marrom','Marrom']:['Branco/verde','Verde','Branco/laranja','Azul','Branco/azul','Laranja','Branco/marrom','Marrom'];
      labels=answer.map((_,i)=>`Pino ${i+1}`);
      instructions=`Padrão ${pattern}, pinos 1–8: ${answer.join(' · ')}. Organize os oito fios conforme a referência.`;
    } else if(type==='dhcp') {
      const subnet=10+Math.floor(random()*80),hosts=shuffle([21,22,23,24,25],random).slice(0,4);
      labels=hosts.map((host,i)=>`Dispositivo ${String.fromCharCode(65+i)} · reserva .${host}`);answer=hosts.map(host=>`192.168.${subnet}.${host}`);
      options=[...answer,`192.168.${subnet}.0`,`192.168.${subnet}.255`];
      instructions=`Rede 192.168.${subnet}.0/24. Respeite as reservas, sem IP duplicado. .0 é a rede e .255 é broadcast.`;
    } else if(type==='dns') {
      const base=20+Math.floor(random()*100),services=shuffle(['portal.byte.local','mail.byte.local','backup.byte.local','api.byte.local'],random);
      answer=services.map((_,i)=>`10.0.0.${base+i}`);labels=services.map((domain,i)=>`${domain} → registro final .${base+i}`);
      instructions='Reconstrua a tabela DNS. A pista de cada domínio indica o último número do IP correto. Todos usam a rede 10.0.0.x.';
    } else if(type==='firewall') {
      kind='firewall';const entries=shuffle([{label:'LAN → HTTPS 443',allow:true},{label:'Internet → SSH 22',allow:false},{label:'LAN → DNS 53',allow:true},{label:'Internet → Telnet 23',allow:false},{label:'LAN → HTTP 80',allow:false},{label:'Internet → RDP 3389',allow:false}],random).slice(0,5);
      labels=entries.map(e=>e.label);answer=entries.map(e=>e.allow?'PERMITIR':'BLOQUEAR');options=['PERMITIR','BLOQUEAR'];
      instructions='Política: permita apenas LAN → HTTPS 443 e LAN → DNS 53. Bloqueie todas as outras conexões.';
    } else {
      const stamp=1+Math.floor(random()*9);labels=['Servidor A · origem','Servidor B · réplica','Servidor C · réplica','Relay do núcleo'];
      answer=[`Época ${stamp}`,`Época ${stamp}`,`Época ${stamp}`,'ATIVAR RELAY'];
      options=[`Época ${stamp}`,`Época ${stamp+1}`,`Época ${stamp+2}`,'ATIVAR RELAY','MANTER OFFLINE'];
      instructions=`Sincronize os três servidores com o relógio mestre: Época ${stamp}. Depois selecione ATIVAR RELAY para restabelecer o núcleo.`;
    }
    options=shuffle(options || answer,random);
    if(kind!=='firewall' && !options.includes('Arquivo inválido') && type==='software')options.push('Arquivo inválido');
    return {kind,labels,answer,options,values:answer.map(()=>''),instructions,check:m=>m.values.every((v,i)=>v===m.answer[i])};
  }
  function createGame(spec,context) {
    const stage=Math.max(1,Math.min(10,spec.stage || 1));
    const type=spec.type,rank=Math.max(0,Math.min(5,context.repairRank || 0));
    const random=context.random || Math.random;
    let host=null,feedback=null,board=null,stats=null,abort=null,previousFocus=null;
    const game={
      blocksWorld:true,status:'running',progress:0,mode:'playing',mistakes:0,attempt:0,hints:1+rank,maxMistakes:3+Math.floor(rank/2),elapsed:0,winTime:0,
      model:null,
      active(){return this.status==='running'&&(!context.isActive || context.isActive());},
      start(){this.model=modelFor(type,stage,random,spec.componentIndex);this.mode='playing';this.mistakes=0;this.progress=0;this.hints=1+rank;this.elapsed=0;this.attempt++;},
      label(){return `${names[types.indexOf(type)]} · ${context.component?.label || context.component?.id || 'Componente'} · fase ${stage}`;},
      message(text,error=false){if(feedback){feedback.textContent=text;feedback.className='repair-feedback '+(error?'error':'correct');}},
      mutate(fn){if(!this.active()||this.mode!=='playing')return;fn(this.model);this.progress=this.model.kind==='route'?(this.model.path.length-1)/8:0;this.render();},
      verify(){
        if(!this.active()||this.mode!=='playing')return;
        if(this.model.check(this.model)) {
          this.mode='won';this.progress=1;this.winTime=0;this.render();this.message('SISTEMA RESTAURADO · conexão validada.');
        } else {
          this.model.invalid=true;
          this.mistakes++;
          if(this.mistakes>=this.maxMistakes){this.mode='failed';context.onFailure?.();this.render();this.message('Diagnóstico interrompido. Penalidade: até 5 de integridade, sem zerar a vida. Tente outra variação ou feche.',true);}
          else {this.render();this.message(`Conexão inválida. Confira as peças e as pistas. Restam ${this.maxMistakes-this.mistakes} verificações.`,true);}
        }
      },
      hint(){
        if(!this.active()||this.mode!=='playing'||this.hints<=0)return;
        const m=this.model;this.hints--;
        if(m.kind==='circuit') {
          const i=m.values.findIndex((v,i)=>v!==m.answer[i]);if(i>=0)m.values[i]=m.answer[i];
          this.render();this.message('Uma peça foi orientada corretamente. Complete o restante do circuito.');
        } else if(m.kind==='route') {
          m.path=[...m.answer.slice(0,2)];this.render();this.message('Primeiro salto restaurado. Continue até D.');
        } else {
          const i=m.values.findIndex((v,i)=>v!==m.answer[i]);this.render();this.message(i<0?'Os ajustes parecem corretos. Verifique a conexão.':`Dica: ${m.labels?.[i] || (i===0?'Canal':'Potência')} → ${m.answer[i]}`);
        }
      },
      update(dt){if(!this.active())return;this.elapsed+=dt;if(this.mode==='won'){this.winTime+=dt;if(this.winTime>=.45)this.status='success';}},
      cancel(){this.status='cancelled';},
      mount(target){host=target;previousFocus=document.activeElement;abort=new AbortController();this.render();host.querySelector('button,input,select')?.focus();},
      handleKey(event){
        if(event.key==='Tab') {
          const focus=[...document.getElementById('repairPanel').querySelectorAll('button:not(:disabled),input,select')];
          const i=focus.indexOf(document.activeElement),next=event.shiftKey?i-1:i+1;
          if(i<0||next<0||next>=focus.length){event.preventDefault();focus[i<0?0:(next+focus.length)%focus.length]?.focus();}return;
        }
        if(event.repeat)return;
        if(event.key.toLowerCase()==='v'){event.preventDefault();this.verify();}
        if(event.key.toLowerCase()==='h'){event.preventDefault();this.hint();}
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)&&document.activeElement?.classList.contains('repair-cell')) {
          event.preventDefault();const cells=[...host.querySelectorAll('.repair-cell')],i=cells.indexOf(document.activeElement),n=this.model.n;
          cells[Math.max(0,Math.min(cells.length-1,i+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-n,ArrowDown:n}[event.key])))]?.focus();
        }
      },
      render(){
        if(!host)return;
        const oldId=document.activeElement?.id;
        abort?.abort();abort=new AbortController();host.replaceChildren();
        const node=(tag,cls,text,parent=host)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;parent.append(el);return el;};
        const listen=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});
        const button=(text,fn,parent=host,cls='')=>{const el=node('button',cls,text,parent);el.type='button';el.disabled=this.mode!=='playing';listen(el,'click',()=>{if(this.active())fn();});return el;};
        node('p','repair-guide',this.model.instructions);
        node('p','repair-help','Mouse/toque para interagir · Tab para navegar · Enter para ativar · V verificar · H dica · Esc pausar');
        stats=node('div','repair-stats',`TENTATIVA ${this.attempt}   •   ERROS ${this.mistakes}/${this.maxMistakes}   •   DICAS ${this.hints}${rank?'   •   REPARO EFICIENTE '+rank:''}`);
        board=node('div','repair-board repair-'+this.model.kind);
        const m=this.model;
        if(m.kind==='circuit'||m.kind==='route') {
          board.style.setProperty('--grid',m.n);
          for(let i=0;i<m.n*m.n;i++) {
            const cell=button('',()=>this.mutate(model=>{
              if(model.kind==='circuit')model.values[i]=rotate(model.values[i]);
              else if(model.path.at(-1)===i&&model.path.length>1)model.path.pop();
              else if(!model.blocked.includes(i)&&!model.path.includes(i)&&Math.abs(model.path.at(-1)%m.n-i%m.n)+Math.abs(Math.floor(model.path.at(-1)/m.n)-Math.floor(i/m.n))===1)model.path.push(i);
            }),board,'repair-cell');
            cell.id='repair-cell-'+i;
            if(m.kind==='circuit') {
              const glyph=['','╵','╶','└','╷','│','┌','├','╴','┘','─','┴','┐','┤','┬','┼'][m.values[i]];
              node('span','pipe',glyph,cell);cell.setAttribute('aria-label',`Circuito ${i+1}, conexões ${['norte','leste','sul','oeste'].filter((_,bit)=>m.values[i]&(1<<bit)).join(', ')}. Girar.`);
            } else {
              cell.classList.toggle('blocked',m.blocked.includes(i));cell.classList.toggle('connected',m.path.includes(i));cell.disabled=cell.disabled||m.blocked.includes(i);
              cell.textContent=m.blocked.includes(i)?'×':m.path.includes(i)?'●':String(i+1);cell.setAttribute('aria-label',`Nó ${i+1}${m.blocked.includes(i)?', bloqueado':''}`);
            }
            if(i===m.source||i===m.target)node('small','terminal-tag',i===m.source?'IN · O':'OUT · D',cell);
          }
        } else if(m.kind==='wifi') {
          m.values.forEach((value,i)=>{
            const label=node('label','repair-tuner',i===0?'CANAL':'POTÊNCIA',board),output=node('output','',String(value)+(i?'%':''),label);
            const input=node('input','',undefined,label);input.type='range';input.min=i?'10':'1';input.max=i?'100':'11';input.step=i?'5':'1';input.value=value;input.disabled=this.mode!=='playing';input.id='repair-tuner-'+i;
            listen(input,'input',()=>{if(!this.active())return;m.values[i]=Number(input.value);output.textContent=input.value+(i?'%':'');});
          });
          const meter=node('div','signal-readout',`ALVO · canal ${m.answer[0]} / potência ${m.answer[1]}%`,board);meter.setAttribute('aria-live','polite');
        } else {
          m.labels.forEach((text,i)=>{
            const row=node('label','repair-match-row',undefined,board);node('span','',text,row);
            const select=node('select','',undefined,row);select.id='repair-choice-'+i;select.disabled=this.mode!=='playing';
            if(m.invalid)select.classList.add(m.values[i]===m.answer[i]?'valid-choice':'invalid-choice');
            const empty=node('option','','Escolha…',select);empty.value='';
            m.options.forEach(value=>{const opt=node('option','',value,select);opt.value=value;});select.value=m.values[i];
            listen(select,'change',()=>{if(this.active())m.values[i]=select.value;});
          });
        }
        const actions=node('div','repair-actions');
        if(this.mode==='failed') {
          const retry=button('TENTAR OUTRA VARIAÇÃO',()=>{this.start();this.render();this.message('Novo diagnóstico pronto.');host.querySelector('button,input,select')?.focus();},actions);
          retry.disabled=false;
        } else {
          const verify=button('VERIFICAR CONEXÃO [V]',()=>this.verify(),actions);verify.id='repair-verify';
          const hint=button(`DICA [H] · ${this.hints}`,()=>this.hint(),actions);hint.disabled=hint.disabled||this.hints===0;
          if(m.kind==='route')button('REINICIAR ROTA',()=>this.mutate(model=>{model.path=[0];}),actions);
        }
        feedback=node('p','repair-feedback','',host);feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
        if(this.mode==='won')this.message('Conexão correta. Aplicando restauração…');
        if(oldId)host.querySelector('#'+oldId)?.focus();
      },
      dispose(){abort?.abort();host?.replaceChildren();previousFocus?.focus?.();host=null;}
    };
    serial++;game.id=serial;game.start();return game;
  }
  types.forEach(type=>api.repairs.register(type,createGame));
  api.repairChallenges=Object.freeze({
    forPhase(index,componentIndex=0){return {type:types[Math.max(0,Math.min(9,index))],stage:index+1,componentIndex};},
    names,types
  });
})();
