/* Component repair puzzles: model generation, accessible UI and modal lifecycle. */
(() => {
  'use strict';
  const api=window.ByteRunner;
  const names=['Circuitos de hardware','Restauração de software','Portas do switch','Rotas do roteador','Calibração Wi-Fi','Pares de cabeamento','Concessões DHCP','Resolução DNS','Políticas do firewall','Sincronização de servidores'];
  const types=['circuit','software','ethernet','route','wifi','cabling','dhcp','dns','firewall','servers'];
  const themes=['hardware','software','switch','router','wifi','cabling','dhcp','dns','firewall','servers'];
  const mechanics=['rotation','sequence','connection','path','tuning','swap','lease','lookup','policy','synchronization'];
  const difficulty=[2,1,1,3,1,3,2,3,2,4];
  const equipment=new Map(), campaignEquipment=new Map();
  const catalog=types.map((id,i)=>Object.freeze({id,name:names[i],mechanic:mechanics[i],difficulty:difficulty[i]}));
  const byType=new Map(catalog.map(item=>[item.id,item]));
  const pools=[
    ['circuit','ethernet','wifi','cabling','servers'],
    ['software','dns','firewall','servers','circuit'],
    ['ethernet','cabling','route','firewall','circuit'],
    ['route','ethernet','dhcp','firewall','dns'],
    ['wifi','route','ethernet','circuit','dhcp'],
    ['cabling','ethernet','circuit','route','wifi'],
    ['dhcp','ethernet','dns','route','servers'],
    ['dns','software','dhcp','route','servers'],
    ['firewall','route','software','ethernet','circuit'],
    ['servers','software','cabling','dns','circuit','route']
  ];
  const affinities={
    circuit:/cpu|gpu|ram|energia|power|motor|barramento/,
    software:/kernel|process|arquivo|paging|scheduler|software|backup/,
    ethernet:/ethernet|port[0-9a ]|connector|uplink|iface/,
    route:/gateway|wan|rote|rota|transit|distribui/,
    wifi:/wi.fi|sinal|antena|spectrum|carrier|association|repeater/,
    cabling:/cabl|fibra|patch|trunk|duto/,
    dhcp:/dhcp|scope|reserv|concess|endereco|conflit/,
    dns:/dns|recurs|cache|ttl|deleg|registros|referenc/,
    firewall:/firewall|politica|regras|inspec|conten/,
    servers:/servidor|server|relay|sincron|replica|transmiss/
  };
  function hash(text){
    let value=2166136261;
    for(const char of String(text))value=Math.imul(value^char.codePointAt(0),16777619);
    return value>>>0;
  }
  function seededRandom(seed){
    let state=hash(seed);
    return ()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
  }
  function regionFor(phase,spec){
    if(spec.region||spec.repair?.region)return spec.region||spec.repair.region;
    const region=phase.map?.regions?.find(r=>r.areas?.some(a=>spec.x>=a.x&&spec.x<a.x+a.width&&spec.y>=a.y&&spec.y<a.y+a.height));
    if(region)return region.id;
    const roomId=spec.id.split(':')[0];
    return phase.generation?.architecture?.rooms?.find(r=>r.id===roomId)?.region||roomId;
  }
  function assign(phase,fallbackIndex=0){
    const index=themes.indexOf(phase.theme),stage=index>=0?index+1:Math.max(1,Math.min(10,fallbackIndex+1));
    const pool=pools[stage-1],seed=phase.generation?.seed??phase.seed??'campaign';
    const specs=phase.entities.components, result=new Map(),counts=new Map(),regional=new Map(),families=new Set();
    const pending=[];
    function reserve(spec,repair){
      result.set(spec.id,repair);
      counts.set(repair.type,(counts.get(repair.type)||0)+1);
      const key=JSON.stringify([regionFor(phase,spec),repair.type]);
      regional.set(key,(regional.get(key)||0)+1);
      families.add(byType.get(repair.type)?.mechanic||repair.type);
    }
    for(const spec of specs){
      if(spec.repair&&spec.repair.selection!=='auto')reserve(spec,spec.repair);
      else pending.push(spec);
    }
    pending.sort((a,b)=>(a.repair?.componentIndex??Infinity)-(b.repair?.componentIndex??Infinity)||
      (a.id<b.id?-1:a.id>b.id?1:0));
    for(const [i,spec] of pending.entries()){
      const region=regionFor(phase,spec);
      const target=Math.max(1,Math.min(5,spec.repair?.difficulty??phase.generation?.gameplay?.difficulty??Math.ceil(stage/2)));
      const context=(spec.id+' '+(spec.label||'')+' '+region).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const identity=JSON.stringify([phase.id,seed,spec.id,region]);
      const preferred=campaignEquipment.get(phase.id)?.[spec.id];
      const candidates=catalog.filter(game=>(counts.get(game.id)||0)<2&&
        (!equipment.has(game.id)||equipment.get(game.id).stage===stage||game.id===preferred));
      if(!candidates.length)throw new Error('Repair catalog capacity exceeded for '+phase.id+' at '+spec.id);
      function score(game){
        const order=pool.indexOf(game.id);
        return (game.id===preferred?100:0)
          +(families.size<Math.min(3,specs.length)&&!families.has(game.mechanic)?50:0)
          +(equipment.has(game.id)?14:0)
          +(order<0?0:20-order*2)+(affinities[game.id]?.test(context)?10:0)
          -(regional.get(JSON.stringify([region,game.id]))||0)*8
          -Math.abs(game.difficulty-target)*2
          +hash(identity+'|'+game.id)/4294967296;
      }
      const chosen=candidates.reduce((best,game)=>score(game)>score(best)?game:best);
      reserve(spec,{type:chosen.id,stage,componentIndex:spec.repair?.componentIndex??i,difficulty:target,seed:identity});
    }
    return result;
  }
  const shuffle=(items,random)=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const rotate=mask=>((mask<<1)&15)|(mask>>3);
  const direction=(a,b,n)=>b===a-n?1:b===a+1?2:b===a+n?4:8;
  let serial=0;
  function equipmentType(stage,id,name,mechanic,build){
    equipment.set(id,{stage,build});
    const entry=Object.freeze({id,name,mechanic,difficulty:Math.ceil(stage/2)});
    catalog.push(entry);byType.set(id,entry);
  }
  function puzzle(instructions,values,answer,draw,solution,clue){
    return {kind:'equipment',instructions,values,answer,draw,solution,clue,
      initial:[...values],check:m=>m.values.length===answer.length&&answer.every((value,i)=>m.values[i]===value)};
  }
  function placement(random,items,sockets,instructions,answer=shuffle(items.map((_,i)=>i),random)){
    const trayOrder=shuffle(items.map((_,i)=>i),random);
    const m=puzzle(instructions,items.map(()=>-1),answer,(m,ui)=>{
      const tray=ui.group('repair-tray','Peças disponíveis');
      trayOrder.forEach(i=>ui.part(tray,'part-'+i,items[i],i,m.selected===i));
      const slots=ui.group('repair-slots','Destinos');
      sockets.forEach((socket,i)=>{
        const item=m.values[i],correct=item===answer[i];
        ui.socket(slots,'slot-'+i,socket+' · '+items[answer[i]]+' / '+(items[item]??'vazio'),i,
          item<0?'':correct?'good':'bad',part=>{
            const other=m.values.indexOf(part);
            if(other>=0)m.values[other]=-1;
            m.values[i]=part;
          });
      });
    },answer.flatMap((part,i)=>['part-'+part,'slot-'+i]),()=> 'Compare a etiqueta da peça com a inscrição de cada encaixe.');
    return m;
  }
  function hardwarePhase(){
    campaignEquipment.set('phase-01',{'socket:cpu-relay':'cooling','ram-base:ram-relay':'ram','bus-west:bus-relay':'circuit','gpu-east:gpu-relay':'gpu'});
    equipmentType(1,'ram','Banco de memória','keyed-module',random=>placement(random,
      ['DIMM A · 1 entalhe','DIMM B · 2 entalhes','DIMM C · 3 entalhes'],['Slot 1','Slot 2','Slot 3'],
      'Encaixe cada módulo no slot com a mesma inscrição. Arraste ou selecione o módulo e depois o slot.'));
    equipmentType(1,'cooling','Refrigeração da CPU','thermal-balance',random=>{
      const target=2+Math.floor(random()*3),heat=54+target*6;
      return puzzle('Ajuste a ventoinha até atingir 54 °C. O medidor mostra a temperatura prevista em cada rotação.',
        [0],[target],(m,ui)=>{
          const reading=speed=>{
            const temperature=heat-speed*6;
            return [temperature,temperature+' °C',temperature===54];
          };
          const meter=ui.meter('Temperatura',84,reading(m.values[0]));
          const fan=ui.group('repair-fan','Ventoinha');
          fan.style.setProperty('--fan-speed',m.values[0]?1/m.values[0]+'s':'0s');
          ui.dial('ventoinha','Rotação',m.values[0],0,4,0,'% PWM',25,speed=>meter(reading(speed)));
        },['dial-ventoinha:'+target],()=> 'Subir um nível reduz a temperatura em 6 °C.');
    });
    equipmentType(1,'gpu','Alimentação da GPU','power-interlock',()=>{
      return puzzle('Encaixe o cabo PCIe de 8 pinos. Ligue os dois bancos na ordem A, B e confirme.',
        [0,0,0],[1,1,1],(m,ui)=>{
          const rack=ui.group('repair-rack','Placa de vídeo');
          ui.control(rack,'power','PCIe 8 pinos · '+(m.values[0]?'conectado':'encaixar'),()=>{
            m.values[0]=1-m.values[0];m.values[1]=m.values[2]=0;
          },Boolean(m.values[0]));
          ui.control(rack,'bank-a','Circuito A',()=>{m.values[1]=1-m.values[1];m.values[2]=0;},Boolean(m.values[1]),!m.values[0]);
          ui.control(rack,'bank-b','Circuito B',()=>{m.values[2]=1-m.values[2];},Boolean(m.values[2]),!m.values[1]);
        },['power','bank-a','bank-b'],()=> 'O banco B depende do banco A, que depende do conector PCIe.');
    });
  }
  hardwarePhase();
  function softwarePhase(){
    campaignEquipment.set('phase-02',{'root:index':'files','scheduler:scheduler':'software','swap:paging':'boot',
      'recovery:recovery':'quarantine','kernel-stack:kernel':'software'});
    equipmentType(2,'files','Arquivo de recuperação','directory-sort',random=>placement(random,
      ['relatório.txt','captura.png','backup.zip'],['Documentos (.txt)','Imagens (.png)','Backups (.zip)'],
      'Arquive cada documento no diretório que aceita sua extensão. Arraste ou selecione arquivo e diretório.',[0,1,2]));
    equipmentType(2,'quarantine','Triagem de quarentena','signature-inspection',random=>{
      const files=['agenda','perfil','biblioteca','cache','índice'];
      const infected=shuffle([0,1,2,3,4],random).slice(0,2);
      const answer=files.map((_,i)=>Number(infected.includes(i)));
      return puzzle('O scanner marca assinaturas inválidas com ⚠. Isole somente os arquivos com esse símbolo.',
        files.map(()=>0),answer,(m,ui)=>{
          const tray=ui.group('repair-tray','Resultado do scanner');
          files.forEach((file,i)=>ui.control(tray,'file-'+i,
            (answer[i]?'⚠ ':'✓ ')+file+' · '+(m.values[i]?'isolado':'ativo'),
            ()=>{m.values[i]=1-m.values[i];},Boolean(m.values[i])));
        },infected.map(i=>'file-'+i),()=> 'A marca ✓ identifica um arquivo íntegro.');
    });
    equipmentType(2,'boot','Blocos de inicialização','boot-dependency',(random,stage,component)=>{
      const paging=component?.id==='swap:paging';
      const labels=paging?['Tabela de páginas','Mapeamento','Arquivo de swap','Retomar processos']:
        ['Firmware','Carregador','Núcleo','Serviços'];
      const answer=[1,1,1,1],initial=[0,0,0,0];
      const positions=shuffle([0,1,2,3],random);
      return puzzle('Reconstrua a cadeia de '+(paging?'paginação':'boot')+'. Ordem necessária: '+labels.join(' → ')+'.',
        initial,answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Barramento de inicialização');
          positions.forEach(i=>ui.control(rack,'boot-'+i,labels[i]+' · '+(m.values[i]?'pronto':'pendente'),()=>{
            if(m.values[i])m.values.fill(0,i);
            else m.values[i]=1;
          },Boolean(m.values[i]),i>0&&!m.values[i-1]));
        },labels.map((_,i)=>'boot-'+i),()=> labels[0]+' é o primeiro bloco; os demais dependem da etapa anterior.');
    });
  }
  softwarePhase();
  function switchPhase(){
    campaignEquipment.set('phase-03',{'port01:connector':'ethernet','port04:connector':'ethernet',
      'matrix-north:table':'packets','channel-relay:bus':'vlan','uplink-crown:uplink':'uplink','core-guard:fabric':'packets'});
    equipmentType(3,'packets','Despacho de pacotes','packet-queue',random=>{
      const names=['A','B','C'],lookup=shuffle([1,2,3],random);
      const queue=shuffle([0,0,1,2],random),answer=queue.map(address=>lookup[address]);
      return puzzle('Despache o pacote da frente pela porta indicada na tabela MAC. Desfazer devolve o último pacote à fila.',
        [],answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Tabela MAC');
          names.forEach((name,i)=>ui.note(rack,name+' → P'+lookup[i]));
          const belt=ui.group('repair-tray','Fila de entrada');
          ui.note(belt,queue.slice(m.values.length).map(i=>'['+names[i]+']').join(' → ')||'Fila vazia');
          ui.note(belt,'Despachados: '+(m.values.map((port,i)=>names[queue[i]]+' → P'+port).join(' / ')||'nenhum'));
          const ports=ui.group('repair-slots','Portas');
          [1,2,3].forEach(port=>ui.control(ports,'send-'+port,'Enviar P'+port,()=>{m.values.push(port);},undefined,m.values.length===queue.length));
          ui.control(ports,'packet-undo','Desfazer',()=>{m.values.pop();},undefined,!m.values.length);
        },answer.map(port=>'send-'+port),()=> 'Use a letra do primeiro pacote para consultar a tabela MAC.');
    });
    equipmentType(3,'vlan','Isolamento de VLAN','membership-matrix',random=>{
      const ports=shuffle([10,10,20,20],random);
      return puzzle('Cada porta pertence a uma VLAN. Ligue o contato na coluna inscrita na etiqueta da porta.',
        [0,0,0,0],ports,(m,ui)=>{
          ports.forEach((vlan,i)=>{
            const row=ui.group('repair-rack','P'+(i+1)+' · etiqueta '+vlan);
            [10,20].forEach(group=>ui.control(row,'vlan-'+i+'-'+group,'VLAN '+group,
              ()=>{m.values[i]=m.values[i]===group?0:group;},m.values[i]===group));
          });
        },ports.map((vlan,i)=>'vlan-'+i+'-'+vlan),()=> 'As duas colunas são mutuamente exclusivas em cada porta.');
    });
    equipmentType(3,'uplink','Uplink redundante','link-negotiation',random=>{
      const local=shuffle([1,10],random),answer=[...local,1,1];
      return puzzle('Iguale a velocidade de cada porta remota à local. Acione o link de cada par depois de sincronizar.',
        [0,0,0,0],answer,(m,ui)=>{
          local.forEach((rate,i)=>{
            const row=ui.group('repair-rack','Par '+(i+1)+' · local '+rate+' Gb/s');
            [1,10].forEach(speed=>ui.control(row,'speed-'+i+'-'+speed,speed+' Gb/s',()=>{
              m.values[i]=speed;m.values[i+2]=0;
            },m.values[i]===speed));
            ui.control(row,'link-'+i,'Link '+(m.values[i+2]?'ativo':'inativo'),()=>{
              m.values[i+2]=1-m.values[i+2];
            },Boolean(m.values[i+2]),m.values[i]!==rate);
          });
        },local.flatMap((rate,i)=>['speed-'+i+'-'+rate,'link-'+i]),()=> 'A trava de link só abre quando as duas pontas usam a mesma taxa.');
    });
  }
  switchPhase();
  function routerPhase(){
    campaignEquipment.set('phase-04',{'iface-lan:lan':'interfaces','iface-console:transit':'route',
      'iface-wan:wan':'interfaces','wan-relay:link':'route','core-main:table':'route-table','gateway-tower:gateway':'gateway'});
    equipmentType(4,'interfaces','Painel de interfaces','media-patching',random=>placement(random,
      ['RJ45 · cobre','SFP · fibra','USB · console'],['Equipamento A','Equipamento B','Equipamento C'],
      'Conecte cada interface ao equipamento que indica seu meio físico. Arraste ou selecione conector e destino.'));
    equipmentType(4,'gateway','Encaminhamento padrão','default-probe',random=>{
      const exit=Math.floor(random()*3),answer=[exit,1];
      return puzzle('Configure a saída padrão para o vizinho com acesso externo. Envie uma sonda para confirmar.',
        [-1,0],answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Saídas do roteador');
          ['A','B','C'].forEach((label,i)=>ui.control(rack,'exit-'+i,label+' · '+(i===exit?'Internet':'rede local'),()=>{
            m.values[0]=i;m.values[1]=0;
          },m.values[0]===i));
          ui.control(rack,'probe','Enviar sonda →',()=>{m.values[1]=m.values[0]===exit?1:-1;},undefined,m.values[0]<0);
          ui.note(rack,m.values[1]===1?'Resposta externa recebida':m.values[1]===-1?'Sonda ficou na rede local':'Aguardando sonda');
        },['exit-'+exit,'probe'],()=> 'A rota padrão precisa alcançar destinos fora das redes locais.');
    });
    equipmentType(4,'route-table','Tabela de roteamento','prefix-entry',random=>{
      const ports=shuffle([1,2,3],random),prefixes=[8,16,24];
      const answer=prefixes.flatMap((prefix,i)=>[prefix,ports[i]]);
      return puzzle('Preencha o prefixo e a porta em cada linha usando o inventário de redes. Clique nos campos para avançar.',
        [0,0,0,0,0,0],answer,(m,ui)=>{
          const inventory=ui.group('repair-tray','Inventário');
          prefixes.forEach((prefix,i)=>ui.note(inventory,'Rede '+(i+1)+' · /'+prefix+' → P'+ports[i]));
          prefixes.forEach((_,i)=>{
            const row=ui.group('repair-rack','Rede '+(i+1));
            [[0,8,16,24],[0,1,2,3]].forEach((choices,field)=>{
              const index=2*i+field;
              ui.control(row,'entry-'+index,(field?'Porta ':'Prefixo ')+(m.values[index]?(field?'P':'/')+m.values[index]:'—'),()=>{
                m.values[index]=choices[(choices.indexOf(m.values[index])+1)%choices.length];
              });
            });
          });
        },answer.flatMap((value,i)=>Array(i%2?value:prefixes.indexOf(value)+1).fill('entry-'+i)),
        ()=> 'Cada rede tem dois campos independentes. Confira tanto o prefixo quanto a porta.');
    });
  }
  routerPhase();
  function wifiPhase(){
    campaignEquipment.set('phase-05',{'base-west:association':'channel','transmit-west:carrier':'power-signal',
      'noise-center:spectrum':'channel','repeater-west:west':'repeaters','repeater-east:east':'repeaters','main-array:uplink':'antenna'});
    equipmentType(5,'antenna','Mira da antena','beam-alignment',random=>{
      const target=1+Math.floor(random()*7),directions=['N','NE','L','SE','S','SO','O','NO'];
      return puzzle('Gire a antena até o feixe apontar para o receptor marcado no radar.',
        [0],[target],(m,ui)=>{
          const radar=ui.group('repair-radar','Radar direcional');
          ui.indicator(radar,'repair-beam',m.values[0]*45);
          directions.forEach((direction,i)=>ui.note(radar,direction+(i===target?' · receptor':'')));
          ui.control(radar,'antenna-turn','Girar 45° · '+directions[m.values[0]],()=>{m.values[0]=(m.values[0]+1)%8;});
          ui.note(radar,m.values[0]===target?'Receptor alcançado':'Fora de alinhamento');
        },Array(target).fill('antenna-turn'),()=> 'A rotação segue a ordem N, NE, L, SE, S, SO, O, NO.');
    });
    equipmentType(5,'channel','Analisador de canais','spectrum-selection',random=>{
      const free=Math.floor(random()*5),levels=[2,4,1,3,2];levels[free]=0;
      return puzzle('Selecione a faixa sem barras de interferência. O analisador indica o ruído em cada canal.',
        [-1],[free],(m,ui)=>{
          const rack=ui.group('repair-spectrum','Espectro');
          levels.forEach((level,i)=>{
            const control=ui.control(rack,'channel-'+i,'CH '+(i+1)+' · ruído '+level,()=>{m.values[0]=i;},m.values[0]===i);
            control.style.setProperty('--noise',level*20+'%');
          });
        },['channel-'+free],()=> 'A faixa livre tem nível de ruído zero.');
    });
    equipmentType(5,'power-signal','Potência de transmissão','signal-budget',random=>{
      const target=2+Math.floor(random()*3),loss=target*10-10;
      return puzzle('Ajuste a potência até o receptor indicar 10 dB de margem. O medidor já desconta a perda da antena.',
        [0],[target],(m,ui)=>{
          const reading=power=>{
            const margin=power*10-loss;
            return [Math.max(0,margin),margin+' dB',margin===10];
          };
          const meter=ui.meter('Margem',50,reading(m.values[0]));
          ui.dial('signal','Potência',m.values[0],0,5,0,'%',20,power=>meter(reading(power)));
        },['dial-signal:'+target],()=> 'Cada nível aumenta a margem do receptor em 10 dB.');
    });
    equipmentType(5,'repeaters','Cobertura de repetidores','coverage-budget',random=>{
      const sites=shuffle([[1,1,0],[0,0,1],[1,0,0],[0,1,0]],random);
      const answer=sites.map(site=>Number(site[2]||site[0]&&site[1]));
      return puzzle('Cubra as zonas A, B e C com apenas dois repetidores. Cada base lista as zonas que alcança.',
        [0,0,0,0],answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Bases');
          const zones=['A','B','C'];
          const count=m.values.reduce((sum,value)=>sum+value,0);
          sites.forEach((site,i)=>ui.control(rack,'site-'+i,'Base '+(i+1)+' · '+zones.filter((_,j)=>site[j]).join(' + '),
            ()=>{m.values[i]=1-m.values[i];},Boolean(m.values[i]),count>=2&&!m.values[i]));
          const coverage=ui.group('repair-slots','Cobertura · '+count+'/2');
          zones.forEach((zone,j)=>{
            const covered=sites.some((site,i)=>m.values[i]&&site[j]);
            ui.note(coverage,zone+' · '+(covered?'coberta':'sem sinal')).dataset.signal=covered?'good':'bad';
          });
        },answer.flatMap((on,i)=>on?['site-'+i]:[]),()=> 'Uma base cobre duas zonas. Reserve o segundo repetidor para a zona restante.');
    });
  }
  wifiPhase();
  function cablingPhase(){
    campaignEquipment.set('phase-06',{'basement-power:power':'continuity','central-main:patch':'connectors',
      'central-east:trunk':'cabling','maintenance-west:service':'cabling','shaft-west-mid:motor':'continuity',
      'upper-hub:distribution':'connectors','roof-controls:antenna':'fiber'});
    equipmentType(6,'continuity','Teste de continuidade','continuity-probe',random=>{
      const breaks=shuffle([0,1,2,3,4],random).slice(0,2);
      const initial=Array.from({length:5},(_,i)=>Number(!breaks.includes(i)));
      return puzzle('Passe a sonda em cada trecho. Feche a emenda somente onde o medidor indicar circuito aberto.',
        initial,[1,1,1,1,1],(m,ui)=>{
          const line=ui.group('repair-rack','Condutores');
          m.values.forEach((_,i)=>ui.control(line,'probe-'+i,'Medir T'+(i+1),()=>{m.selected=i;},m.selected===i));
          const i=m.selected;
          ui.note(line,i==null?'Selecione um trecho':m.values[i]?'Continuidade · 0 Ω':'Circuito aberto · OL');
          ui.control(line,'splice','Fechar emenda',()=>{m.values[i]=1;},undefined,i==null||Boolean(m.values[i]));
        },breaks.flatMap(i=>['probe-'+i,'splice']),()=> 'OL indica uma interrupção; 0 Ω indica um trecho contínuo.');
    });
    equipmentType(6,'connectors','Painel de conectores','port-patching',random=>placement(random,
      ['RJ45 · cobre','LC · fibra','BNC · coaxial','USB · serviço'],['Porta A','Porta B','Porta C','Porta D'],
      'Arraste cada conector para a porta da mesma família. Também é possível selecionar conector e porta.'));
    equipmentType(6,'fiber','Alinhamento óptico','optical-coupling',(random,stage)=>{
      const range=stage===10?6:4;
      const answer=[1+Math.floor(random()*(range-1)),1+Math.floor(random()*(range-1)),1];
      const model=puzzle('Alinhe os dois eixos para obter 100% de sinal e depois feche a trava óptica.',
        [0,0,0],answer,(m,ui)=>{
          const signal=(x,y)=>Math.max(0,100-10*(Math.abs(x-answer[0])+Math.abs(y-answer[1])));
          const reading=(x,y)=>{
            const value=signal(x,y);
            return [value,value+'%',value===100];
          };
          const meter=ui.meter('Transmissão',100,reading(...m.values));
          const guide=ui.group('repair-rack','Acoplador de fibra');
          ui.note(guide,m.values[2]?'Trava fechada':'Trava aberta');
          ui.dial('fiber-x','Horizontal',m.values[0],0,range,0,'',1,x=>meter(reading(x,m.values[1])));
          ui.dial('fiber-y','Vertical',m.values[1],0,range,1,'',1,y=>meter(reading(m.values[0],y)));
          ui.control(guide,'fiber-lock','Travar fibra',()=>{m.values[2]=1;},Boolean(m.values[2]),signal(...m.values)!==100);
        },['dial-fiber-x:'+answer[0],'dial-fiber-y:'+answer[1],'fiber-lock'],
        ()=> 'Maximize primeiro um eixo; depois, mantenha-o fixo enquanto ajusta o outro.');
      model.onDialChange=()=>{model.values[2]=0;};
      return model;
    });
  }
  cablingPhase();
  function dhcpPhase(){
    campaignEquipment.set('phase-07',{'central-core:server':'ip-distribution','address-office:scope':'ip-pool',
      'conflict-core:conflict':'ip-conflicts','reserve-main:reservation':'ip-reservations',
      'distribution-south:relay':'ip-distribution','gateway-plaza:gateway':'ip-pool'});
    equipmentType(7,'ip-distribution','Bandeja de concessões','lease-allocation',random=>{
      const start=20+Math.floor(random()*30),hosts=[start,start+1,start+2,0,255];
      const devices=['Estação','Impressora','Telefone'];
      const model=puzzle('Distribua três IPs distintos. Use somente os endereços livres da rede /24 e deixe rede e broadcast na bandeja.',
        [-1,-1,-1],[0,1,2],(m,ui)=>{
          const tray=ui.group('repair-tray','Endereços');
          hosts.forEach((host,i)=>ui.part(tray,'lease-'+i,'192.168.7.'+host,i,m.selected===i));
          const rack=ui.group('repair-slots','Dispositivos');
          devices.forEach((device,i)=>{
            const value=m.values[i];
            ui.socket(rack,'device-'+i,device+' · '+(value<0?'sem IP':'.'+hosts[value]),i,
              value<0?'':value<3?'good':'bad',part=>{
                const other=m.values.indexOf(part);
                if(other>=0)m.values[other]=-1;
                m.values[i]=part;
              });
          });
        },devices.flatMap((_,i)=>['lease-'+i,'device-'+i]),()=> 'O sufixo .0 identifica a rede e .255 é broadcast.');
      model.check=m=>new Set(m.values).size===3&&m.values.every(value=>value>=0&&value<3);
      return model;
    });
    equipmentType(7,'ip-conflicts','Auditoria de conflitos','duplicate-remediation',random=>{
      const base=30+Math.floor(random()*20),second=1+Math.floor(random()*3);
      const initial=[base,base+1,base+2,base+3];initial[second]=base;
      const answer=[...initial];answer[second]=base+4;
      return puzzle('Marque a concessão duplicada mais recente e reemita seu IP usando o endereço livre. O servidor mantém a mais antiga.',
        initial,answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Registro em ordem de emissão');
          m.values.forEach((ip,i)=>{
            const row=ui.control(rack,'lease-row-'+i,'#'+(i+1)+' · 192.168.7.'+ip,()=>{m.selected=i;},m.selected===i);
            row.dataset.signal=m.values.filter(value=>value===ip).length>1?'bad':'';
          });
          ui.control(rack,'renew','Reemitir · .'+(base+4),()=>{m.values[m.selected]=base+4;},undefined,m.selected==null||m.values[m.selected]!==base);
          ui.control(rack,'revert-lease','Desfazer reemissão',()=>{m.values=[...initial];m.selected=null;});
        },['lease-row-'+second,'renew'],()=> 'No par duplicado, selecione o registro com o maior número de emissão.');
    });
    equipmentType(7,'ip-reservations','Reservas por MAC','reservation-binding',random=>placement(random,
      ['IP .40 · MAC 2A','IP .41 · MAC 7C','IP .42 · MAC 9F'],['Terminal','Impressora','Câmera'],
      'Associe cada reserva ao dispositivo com o mesmo sufixo MAC. O vínculo fica fixo no equipamento.'));
    equipmentType(7,'ip-pool','Limites do pool','lease-window',random=>{
      const start=10+Math.floor(random()*8),size=4+Math.floor(random()*4),end=start+size-1;
      return puzzle('A rede /24 reserva .1 para o gateway. Reserve também os endereços anteriores a .'+start+
        ' e posteriores a .'+end+'. Configure um intervalo de '+size+' concessões.',
        [0,0],[start,end],(m,ui)=>{
          const [low,high]=m.values;
          ui.meter('Endereços no intervalo',32,[Math.max(0,high-low+1),
            low===0||high<low?'limites inválidos':String(high-low+1),low===start&&high===end]);
          ui.dial('pool-start','Início',low,0,31,0);
          ui.dial('pool-end','Fim',high,0,31,1);
        },['dial-pool-start:'+start,'dial-pool-end:'+end],()=> 'O intervalo inclui os dois limites; .0 é o endereço de rede.');
    });
  }
  dhcpPhase();
  function dnsPhase(){
    campaignEquipment.set('phase-08',{'root-core:hints':'dns-tree','com-records:records':'dns-records',
      'com-zone:delegation':'dns-tree','org-records:records':'dns-records','cache-terminal:recursive':'dns-query',
      'cache-crown:ttl':'dns-cache','resolve-core:resolution':'dns-query'});
    equipmentType(8,'dns-records','Registros de endereço','record-patching',random=>{
      const base=40+Math.floor(random()*80);
      return placement(random,['10.0.8.'+base,'10.0.8.'+(base+1),'2001:db8::'+base],
        ['portal.byte','mail.byte','backup.byte'],
        'Conecte o endereço de cada registro ao domínio indicado. Os registros A usam IPv4 e AAAA usa IPv6.');
    });
    equipmentType(8,'dns-tree','Árvore de delegação','hierarchy-attachment',random=>{
      const children=shuffle(['.com','.org','byte.com','mirror.com','byte.org'],random);
      const parents=['Raiz','.com','.org'];
      const answer=children.map(name=>name.startsWith('.')?0:name.endsWith('.com')?1:2);
      return puzzle('Ligue os sufixos à Raiz e cada domínio ao sufixo correspondente. Um servidor pode ter vários filhos.',
        children.map(()=>-1),answer,(m,ui)=>{
          const tray=ui.group('repair-tray','Nós sem delegação');
          children.forEach((child,i)=>ui.part(tray,'child-'+i,child+' → '+(parents[m.values[i]]??'sem pai'),i,m.selected===i));
          const tree=ui.group('repair-slots','Servidores pai');
          parents.forEach((parent,i)=>ui.socket(tree,'parent-'+i,parent,i,'',child=>{m.values[child]=i;}));
        },answer.flatMap((parent,i)=>['child-'+i,'parent-'+parent]),()=> 'O último rótulo de um domínio indica seu servidor de sufixo.');
    });
    equipmentType(8,'dns-cache','Limpeza de cache','cache-invalidation',random=>{
      const records=shuffle([
        {ttl:0,serial:4},{ttl:30,serial:3},{ttl:16,serial:4},{ttl:42,serial:4},{ttl:0,serial:3}
      ],random);
      const answer=records.map(({ttl,serial})=>Number(ttl===0||serial!==4));
      return puzzle('Invalide entradas cujo TTL chegou a zero ou cujo serial difere do autoritativo (4). Preserve o restante.',
        records.map(()=>0),answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Cache do resolvedor');
          records.forEach(({ttl,serial},i)=>ui.control(rack,'cache-'+i,'R'+(i+1)+' · TTL '+ttl+' · serial '+serial+' · '+(m.values[i]?'removido':'em cache'),
            ()=>{m.values[i]=1-m.values[i];},Boolean(m.values[i])));
        },answer.flatMap((purge,i)=>purge?['cache-'+i]:[]),()=> 'TTL positivo só é válido com a versão atual do registro.');
    });
    equipmentType(8,'dns-query','Percurso de consulta','referral-walk',random=>{
      const org=random()<.5,zone=org?2:3,authority=org?4:5;
      const labels=['Resolvedor','Raiz','.org','.com','Autoritativo .org','Autoritativo .com'];
      const links=[[1],[2,3],[4],[5],[],[]],answer=[0,1,zone,authority];
      return puzzle('Resolva api.byte.'+(org?'org':'com')+' seguindo as referências até o servidor autoritativo. Volte se entrar em outra zona.',
        [0],answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Trajeto da consulta');
          ui.note(rack,m.values.map(i=>labels[i]).join(' → '));
          const current=m.values.at(-1);
          links[current].forEach(i=>ui.control(rack,'query-'+i,'Consultar '+labels[i],()=>{m.values.push(i);}));
          if(current>=4)ui.note(rack,current===authority?'Resposta autoritativa recebida':'Zona incorreta · volte');
          ui.control(rack,'query-back','Voltar',()=>{m.values.pop();},undefined,m.values.length<=1);
        },answer.slice(1).map(i=>'query-'+i),()=> 'A Raiz encaminha pelo sufixo do nome consultado.');
    });
  }
  dnsPhase();
  function firewallPhase(){
    campaignEquipment.set('phase-09',{c01:'policy-order',c02:'firewall',c05:'barriers',c06:'barriers',
      c03:'policy-order',c07:'threats',c04:'firewall',c08:'threats'});
    equipmentType(9,'policy-order','Prioridade das políticas','first-match-policy',random=>{
      const rules=['Bloquear hosts em quarentena','Permitir HTTPS da LAN','Bloquear todo o restante'];
      const flows=['HTTPS da LAN em quarentena','HTTPS da LAN normal','Outro tráfego'];
      const hits=[[0,1,2],[1,2],[2]],answer=[0,1,2];
      let initial=shuffle(answer,random);
      if(initial.every((value,i)=>value===i))initial=[1,2,0];
      const steps=[],order=[...initial];
      answer.forEach((rule,i)=>{
        const index=order.indexOf(rule);
        if(index===i)return;
        steps.push('rule-card-'+i,'rule-card-'+index);
        [order[i],order[index]]=[order[index],order[i]];
      });
      return puzzle('A primeira regra aplicável decide. Bloqueie quarentena, permita HTTPS normal da LAN e bloqueie o restante. Selecione dois cartões para trocar.',
        initial,answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Ordem de avaliação');
          m.values.forEach((rule,i)=>ui.control(rack,'rule-card-'+i,(i+1)+' · '+rules[rule],()=>{
            if(m.selected!=null){
              [m.values[m.selected],m.values[i]]=[m.values[i],m.values[m.selected]];
              m.selected=null;
            }else m.selected=i;
          },m.selected===i));
          const preview=ui.group('repair-tray','Simulação');
          flows.forEach((flow,i)=>{
            const allow=m.values.find(rule=>hits[i].includes(rule))===1;
            ui.note(preview,flow+' → '+(allow?'permitido':'bloqueado')).dataset.signal=allow===(i===1)?'good':'bad';
          });
        },steps,()=> 'A quarentena precisa vir antes da permissão; o bloqueio geral fica no fim.');
    });
    equipmentType(9,'threats','Inspeção de tráfego','evidence-correlation',random=>{
      const packets=shuffle([[8,0],[3,1],[1,0],[2,2],[6,1]],random);
      const answer=packets.map(([destinations,failures])=>Number(destinations>=6||failures>=2));
      return puzzle('Isole fluxos com pelo menos seis destinos ou duas falhas de autenticação. Abra o detalhe de cada captura antes de decidir.',
        packets.map(()=>0),answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Capturas');
          packets.forEach((_,i)=>ui.control(rack,'inspect-'+i,'Fluxo '+(i+1)+(m.values[i]?' · isolado':''),
            ()=>{m.selected=i;},m.selected===i));
          const i=m.selected;
          if(i!=null){
            const [destinations,failures]=packets[i];
            ui.note(rack,'Destinos: '+destinations+' · Falhas: '+failures);
            ui.control(rack,'isolate','Isolar / liberar',()=>{m.values[i]=1-m.values[i];},Boolean(m.values[i]));
          }
        },answer.flatMap((isolate,i)=>isolate?['inspect-'+i,'isolate']:[]),
        ()=> 'Basta um dos dois limiares para isolar um fluxo.');
    });
    equipmentType(9,'barriers','Segmentos da barreira','coupled-segments',random=>{
      const length=5,answer=Array(length).fill(1);
      const flip=(values,i)=>{
        for(const j of [(i+length-1)%length,i,(i+1)%length])values[j]=1-values[j];
      };
      const steps=shuffle([0,1,2,3,4],random).slice(0,3),initial=[...answer];
      steps.forEach(i=>flip(initial,i));
      return puzzle('Energize todos os segmentos do anel. Cada interruptor inverte seu segmento e os dois vizinhos, inclusive nas extremidades.',
        initial,answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Anel de proteção · S5 retorna a S1');
          m.values.forEach((on,i)=>ui.control(rack,'barrier-'+i,'S'+(i+1)+' · '+(on?'ativo':'apagado'),
            ()=>flip(m.values,i),Boolean(on)));
        },steps.map(i=>'barrier-'+i),()=> 'Acionar o mesmo segmento duas vezes desfaz seu efeito.');
    });
  }
  firewallPhase();
  function serversPhase(){
    campaignEquipment.set('phase-10',{c01:'rack-power',c02:'servers',c05:'fiber',c06:'rack-power',
      c07:'fiber',c03:'rack-load',c08:'circuit',c09:'rack-load',c10:'servers',c11:'circuit',
      c12:'core-relays',c04:'core-relays'});
    equipmentType(10,'rack-power','Energia redundante','redundant-power',random=>{
      const feeds=shuffle(['Fonte A · 12 V','Fonte B · 12 V','Fonte C · 5 V','Fonte D · 5 V'],random);
      const rails=['Barramento A','Barramento B','Controle C','Controle D'];
      const answer=['A','B','C','D'].map(name=>feeds.findIndex(feed=>feed.startsWith('Fonte '+name)));
      return placement(random,feeds,rails,
        'Reconecte as fontes aos circuitos pela letra e pela tensão da etiqueta. Os dois barramentos de 12 V são independentes.',answer);
    });
    equipmentType(10,'rack-load','Distribuição de processamento','capacity-packing',(random,stage,component)=>{
      const weights=shuffle([6,5,4,3,2],random),capacities=[8,7,5];
      const answer=weights.map(weight=>weight===6||weight===2?0:weight===4||weight===3?1:2);
      const model=puzzle((component?.id==='c09'?'O banco de memória corrompido foi isolado. Redistribua seus processos nos racks íntegros. ':
        'Redistribua os processos de transmissão central. ')+
        'Respeite a capacidade de cada servidor. Um rack pode receber vários processos.',
        weights.map(()=>-1),answer,(m,ui)=>{
          const tray=ui.group('repair-tray','Processos');
          weights.forEach((weight,i)=>ui.part(tray,'job-'+i,'P'+(i+1)+' · '+weight+' CPU'+
            (m.values[i]<0?'':' → S'+(m.values[i]+1)),i,m.selected===i));
          const rack=ui.group('repair-slots','Capacidade dos servidores');
          capacities.forEach((capacity,i)=>{
            const used=weights.reduce((total,weight,j)=>total+(m.values[j]===i?weight:0),0);
            ui.socket(rack,'rack-'+i,'S'+(i+1)+' · '+used+'/'+capacity+' CPU',i,
              used>capacity?'bad':used===capacity?'good':'',job=>{m.values[job]=i;});
          });
        },answer.flatMap((rack,i)=>['job-'+i,'rack-'+rack]),()=> 'Some as cargas. O total de CPU é igual à capacidade dos três racks.');
      model.check=m=>m.values.every(rack=>rack>=0&&rack<capacities.length)&&capacities.every((capacity,rack)=>
        weights.reduce((total,weight,i)=>total+(m.values[i]===rack?weight:0),0)<=capacity);
      return model;
    });
    equipmentType(10,'core-relays','Estabilização do núcleo','relay-dependency',random=>{
      const names=['Entrada','Resfriamento','Reserva','Distribuição','Núcleo'];
      const prerequisites=[[],[],[0],[0,1],[2,3]],answer=Array(5).fill(1);
      const order=shuffle([0,1,2,3,4],random);
      return puzzle('Restaure os relays da matriz. Cada relé indica seus pré-requisitos. Desligar uma entrada derruba os relays dependentes.',
        Array(5).fill(0),answer,(m,ui)=>{
          const rack=ui.group('repair-rack','Matriz de relays');
          const available=i=>prerequisites[i].every(parent=>m.values[parent]);
          order.forEach(i=>{
            const needs=prerequisites[i].map(parent=>names[parent]).join(' + ');
            ui.control(rack,'core-'+i,names[i]+' · '+(m.values[i]?'ligado':needs||'alimentação direta'),()=>{
              m.values[i]=1-m.values[i];
              for(let relay=0;relay<names.length;relay++)if(!available(relay))m.values[relay]=0;
            },Boolean(m.values[i]),!available(i));
          });
          const count=m.values.reduce((sum,value)=>sum+value,0);
          ui.meter('Estabilidade',5,[count,count+'/5 relays',count===5]);
        },names.map((_,i)=>'core-'+i),()=> 'Entrada e Resfriamento recebem alimentação direta.');
    });
  }
  serversPhase();
  function modelFor(type,stage,random,componentIndex=0,difficulty,component) {
    if(equipment.has(type))return equipment.get(type).build(random,stage,component);
    const n=stage>5 || componentIndex>=2 || difficulty>=4?4:3;
    if(type==='circuit') {
      const path=[];for(let row=0;row<n;row++)for(let j=0;j<n;j++)path.push(row*n+(row%2?n-1-j:j));
      const answer=Array(n*n).fill(0);
      path.forEach((cell,i)=>{answer[cell]=(i?direction(cell,path[i-1],n):8)|(i<path.length-1?direction(cell,path[i+1],n):n%2?2:8);});
      const values=answer.map(mask=>{for(let i=0,k=1+Math.floor(random()*3);i<k;i++)mask=rotate(mask);return mask;});
      if(values.every((v,i)=>v===answer[i]))values[0]=rotate(values[0]);
      const trace=m=>{
        if(!(m.values[0]&8))return new Set();
        const seen=new Set([0]),queue=[0];
        for(const cell of queue)for(const [bit,delta,back] of [[1,-n,4],[2,1,8],[4,n,1],[8,-1,2]]) {
          const other=cell+delta;
          if(other<0||other>=n*n||Math.abs(cell%n-other%n)>1||!(m.values[cell]&bit)||!(m.values[other]&back)||seen.has(other))continue;
          seen.add(other);queue.push(other);
        }
        return seen;
      };
      return {kind:'circuit',n,answer,values,path,source:0,target:path.at(-1),initial:[...values],trace,
        instructions:'Gire as placas 90 graus para levar energia de IN a OUT. Verifique quando OUT acender.',
        check:m=>trace(m).has(m.target)&&Boolean(m.values[m.target]&(n%2?2:8))};

    }
    if(type==='route') {
      const path=[0,1,2,6,10,11,15], blocked=shuffle([4,5,7,8,9,12,13,14],random).slice(0,4);
      return {kind:'route',n:4,path:[0],answer:path,blocked,source:0,target:15,instructions:'Escolha um caminho de O até D usando casas vizinhas na horizontal ou vertical. Vermelho indica conexão bloqueada. Clique no último nó para voltar.',check:m=>m.path.at(-1)===15};
    }
    if(type==='wifi') {
      const channel=1+Math.floor(random()*11),power=45+Math.floor(random()*7)*5;
      return {kind:'wifi',answer:[channel,power],values:[channel===6?1:6,20],instructions:`O analisador encontrou o canal livre ${channel}. Ajuste o canal e a potência para ${power}%. A conexão precisa dos dois valores corretos.`,check:m=>m.values[0]===channel&&Math.abs(m.values[1]-power)<=5};
    }
    const exact=m=>m.values.length===m.answer.length&&m.answer.every((v,i)=>m.values[i]===v);
    if(type==='software'){
      const answer=['Carregar arquivos','Verificar assinatura','Isolar corrompidos','Iniciar processo'];
      return {kind:type,answer,values:[],options:shuffle([...answer,'Executar sem verificar'],random),
        instructions:'Monte a fila de execução na ordem carregar → verificar → isolar → iniciar. Remova a última ação para corrigir a fila.',check:exact};
    }
    if(type==='ethernet'){
      const answer=shuffle(['PC de suporte','Impressora','Servidor','Access point'],random);
      return {kind:type,answer,values:answer.map(()=>''),labels:answer.map((v,i)=>`Porta ${i+1} → ${v}`),
        options:shuffle(answer,random),selected:0,instructions:'Selecione uma porta e encaixe seu destino. Cada destino aceita uma conexão.',
        check:m=>new Set(m.values).size===m.values.length&&exact(m)};
    }
    if(type==='cabling'){
      const pattern=random()<.5?'T568A':'T568B';
      const answer=pattern==='T568B'?['Branco/laranja','Laranja','Branco/verde','Azul','Branco/azul','Verde','Branco/marrom','Marrom']:['Branco/verde','Verde','Branco/laranja','Azul','Branco/azul','Laranja','Branco/marrom','Marrom'];
      const values=shuffle(answer,random);
      if(values.every((v,i)=>v===answer[i]))[values[0],values[1]]=[values[1],values[0]];
      return {kind:type,answer,values,selected:null,labels:answer.map((_,i)=>`Pino ${i+1}`),
        instructions:`Selecione dois fios para trocar suas posições. ${pattern}, pinos 1 a 8: ${answer.join(' → ')}.`,check:exact};
    }
    if(type==='dhcp'){
      const subnet=10+Math.floor(random()*80),hosts=shuffle([21,22,23,24,25],random).slice(0,4);
      const answer=hosts.map(host=>`192.168.${subnet}.${host}`),prefix=`192.168.${subnet}.`;
      return {kind:type,answer,values:answer.map(()=>''),labels:hosts.map((host,i)=>`Dispositivo ${String.fromCharCode(65+i)} → reserva .${host}`),
        options:shuffle([...answer,prefix+'0',prefix+'255'],random),
        instructions:`Distribua as reservas da rede ${prefix}0/24. Cada IP só pode ser atribuído uma vez. .0 e .255 são endereços reservados.`,
        check:m=>new Set(m.values).size===m.values.length&&m.values.every(v=>v.startsWith(prefix)&&v!==prefix+'0'&&v!==prefix+'255')&&exact(m)};
    }
    if(type==='dns'){
      const services=shuffle(['portal','mail','backup'],random),base=20+Math.floor(random()*100);
      const labels=services.map(s=>s+'.byte.local'),aliases=services.map(s=>s+'.node.local');
      const answer=services.map((_,i)=>`10.0.0.${base+i}`),records=new Map(aliases.map((alias,i)=>[alias,answer[i]]));
      return {kind:type,labels,aliases,answer,records,options:shuffle(aliases,random),addresses:shuffle(answer,random),
        hops:labels.map(()=>''),values:labels.map(()=>''),
        instructions:'Resolva cada nome em duas etapas. Siga o registro de alias, depois confirme o IP do nó no registro de endereço.',
        check:m=>m.hops.every((v,i)=>v===m.aliases[i]&&m.records.get(v)===m.values[i])};
    }
    if(type==='firewall'){
      const entries=shuffle([{label:'LAN → HTTPS 443',allow:true},{label:'Internet → SSH 22',allow:false},{label:'LAN → DNS 53',allow:true},{label:'Internet → Telnet 23',allow:false},{label:'LAN → HTTP 80',allow:false},{label:'Internet → RDP 3389',allow:false}],random).slice(0,5);
      return {kind:type,labels:entries.map(e=>e.label),answer:entries.map(e=>e.allow),values:entries.map(()=>null),
        instructions:'Defina uma decisão por conexão. Permita apenas LAN → HTTPS 443 e LAN → DNS 53.',check:exact};
    }
    const stamp=1+Math.floor(random()*9);
    return {kind:type,labels:['Servidor A','Servidor B','Servidor C'],answer:[stamp,stamp,stamp],
      values:[stamp%9+1,(stamp+2)%9+1,(stamp+4)%9+1],relay:false,
      instructions:`Avance o relógio de cada réplica até a época mestre ${stamp}. Quando as três coincidirem, ative o relay.`,
      check:m=>m.relay&&exact(m)};
  }

  function createGame(spec,context) {
    const stage=Math.max(1,Math.min(10,spec.stage || equipment.get(spec.type)?.stage || 1));
    const type=spec.type,rank=Math.max(0,Math.min(5,context.repairRank || 0));
    const random=context.random ?? (spec.seed==null?Math.random:seededRandom(spec.seed));
    let host=null,feedback=null,board=null,stats=null,abort=null,previousFocus=null;
    const game={
      blocksWorld:true,status:'running',progress:0,mode:'playing',mistakes:0,attempt:0,hints:1+rank,maxMistakes:3+Math.floor(rank/2),elapsed:0,winTime:0,
      model:null,
      active(){return this.status==='running'&&(!context.isActive || context.isActive());},
      start(){this.model=modelFor(type,stage,random,spec.componentIndex,spec.difficulty,context.component);this.mode='playing';this.mistakes=0;this.progress=0;this.hints=1+rank;this.elapsed=0;this.attempt++;},
      label(){return `${byType.get(type).name} · ${context.component?.label || context.component?.id || 'Componente'} · fase ${stage}`;},
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
        if(m.kind==='equipment') {
          this.render();this.message(m.clue());
        } else if(m.kind==='circuit') {
          const i=m.values.findIndex((v,i)=>v!==m.answer[i]);if(i>=0)m.values[i]=m.answer[i];
          this.render();this.message('Uma peça foi orientada corretamente. Complete o restante do circuito.');
        } else if(m.kind==='route') {
          m.path=[...m.answer.slice(0,2)];this.render();this.message('Primeiro salto restaurado. Continue até D.');
        } else {
          const i=m.answer.findIndex((v,i)=>m.values[i]!==v||(m.kind==='dns'&&m.hops[i]!==m.aliases[i]));
          const label=m.labels?.[i]||(m.kind==='software'?'Etapa '+(i+1):i===0?'Canal':'Potência');
          const value=m.kind==='firewall'?(m.answer[i]?'PERMITIR':'BLOQUEAR'):m.answer[i];
          this.render();this.message(i<0?'Os ajustes parecem corretos. Verifique a conexão.':`Dica: ${label} → ${value}`);
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
        const m=this.model;
        const frame=node('section','repair-console');
        frame.dataset.theme=themes[stage-1];
        frame.dataset.state=this.mode;
        const header=node('div','repair-console-header',undefined,frame);
        node('span','repair-console-led',undefined,header).setAttribute('aria-hidden','true');
        node('span','',this.mode==='won'?'REPARO CONCLUÍDO':this.mode==='failed'?'DIAGNÓSTICO INTERROMPIDO':'PAINEL DE MANUTENÇÃO',header);
        node('p','repair-guide',m.instructions,frame);
        node('p','repair-help','Mouse/toque para interagir · Tab para navegar · Enter para ativar · V verificar · H dica'+
          (context.standalone?'':' · Esc pausar'));
        stats=node('div','repair-stats',`TENTATIVA ${this.attempt}   •   ERROS ${this.mistakes}/${this.maxMistakes}   •   DICAS ${this.hints}${rank?'   •   REPARO EFICIENTE '+rank:''}`);
        board=node('div','repair-board repair-'+m.kind,undefined,frame);
        if(m.kind==='equipment'){
          const sockets=new Map();
          board.dataset.equipment=type;
          frame.dataset.ready=String(m.check(m));
          const control=(parent,id,text,fn,pressed,disabled=false)=>{
            const el=button(text,()=>this.mutate(fn),parent,'repair-object');
            el.id='repair-'+id;
            el.disabled||=disabled;
            if(pressed!==undefined)el.setAttribute('aria-pressed',String(pressed));
            return el;
          };
          m.draw(m,{
            note:(parent,text)=>node('span','repair-equipment-note',text,parent),
            indicator:(parent,cls,angle)=>{
              const el=node('span',cls,undefined,parent);
              el.setAttribute('aria-hidden','true');el.style.setProperty('--beam-angle',angle+'deg');
            },
            group:(cls,label)=>{
              const group=node('div','repair-equipment-group '+cls,undefined,board);
              group.setAttribute('role','group');group.setAttribute('aria-label',label);
              node('strong','repair-equipment-label',label,group);
              return group;
            },
            control,
            part:(parent,id,text,part,selected)=>{
              let suppressClick=false;
              const el=control(parent,id,text,()=>{
                if(!suppressClick)m.selected=m.selected===part?null:part;
                suppressClick=false;
              },selected);
              let pointer;
              listen(el,'pointerdown',event=>{
                if(!this.active()||!event.isPrimary||event.button!==0)return;
                suppressClick=false;
                pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
                el.setPointerCapture(event.pointerId);
              });
              listen(el,'pointermove',event=>{
                if(pointer?.id!==event.pointerId)return;
                const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
                if(Math.hypot(dx,dy)>8)el.classList.add('dragging');
                el.style.setProperty('--drag-x',dx+'px');el.style.setProperty('--drag-y',dy+'px');
              });
              listen(el,'pointercancel',()=>{pointer=null;el.classList.remove('dragging');});
              listen(el,'pointerup',event=>{
                if(pointer?.id!==event.pointerId)return;
                pointer=null;
                if(!el.classList.contains('dragging'))return;
                el.classList.remove('dragging');
                const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-repair-socket]');
                const drop=sockets.get(target);
                if(drop)this.mutate(()=>{drop(part);m.selected=null;});
                else suppressClick=true;
              });
            },
            socket:(parent,id,text,index,state,drop)=>{
              const el=control(parent,id,text,()=>{
                if(m.selected!=null){drop(m.selected);m.selected=null;}
              });
              el.dataset.repairSocket=index;el.dataset.signal=state;sockets.set(el,drop);
            },
            meter:(label,max,initial)=>{
              const readout=node('div','repair-meter',undefined,board);
              const caption=node('span','',undefined,readout);
              const meter=node('meter','',undefined,readout);
              meter.max=max;meter.setAttribute('aria-label',label);
              const update=([value,text,good])=>{
                caption.textContent=label+' · '+text;
                readout.dataset.signal=good?'good':'bad';
                meter.value=value;
              };
              update(initial);
              return update;
            },
            dial:(id,label,value,min,max,index,suffix='',scale=1,preview)=>{
              const row=node('label','repair-tuner',label,board);
              node('output','',value*scale+suffix,row);
              const input=node('input','',undefined,row);
              input.type='range';input.min=min;input.max=max;input.value=value;input.id='repair-dial-'+id;
              input.disabled=this.mode!=='playing';
              listen(input,'change',()=>this.mutate(()=>{
                m.values[index]=Number(input.value);
                m.onDialChange?.();
              }));
              listen(input,'input',()=>{
                if(!this.active())return;
                row.querySelector('output').textContent=input.value*scale+suffix;
                preview?.(Number(input.value));
              });
            }
          });
        } else if(m.kind==='circuit'){
          const powered=m.trace(m);
          const ready=m.check(m);
          frame.dataset.ready=String(ready);
          const readout=node('div','repair-circuit-readout',ready?'OUT · ENERGIZADO':'OUT · SEM SINAL',frame);
          readout.setAttribute('role','status');
          board.style.setProperty('--grid',m.n);
          board.setAttribute('role','group');
          board.setAttribute('aria-label','Placas do circuito');
          for(let i=0;i<m.values.length;i++){
            const cell=button('',()=>this.mutate(model=>{
              model.values[i]=rotate(model.values[i]);
              model.selected=i;
              model.invalid=false;
            }),board,'repair-cell');
            cell.id='repair-cell-'+i;
            cell.classList.toggle('powered',powered.has(i));
            cell.classList.toggle('selected',m.selected===i);
            const ports=['norte','leste','sul','oeste'].filter((_,bit)=>m.values[i]&(1<<bit));
            cell.setAttribute('aria-label',`Placa ${i+1}, ${ports.join(', ')}, ${powered.has(i)?'energizada':'sem energia'}. Girar.`);
            const plate=node('span','repair-plate',undefined,cell);
            plate.setAttribute('aria-hidden','true');
            ports.forEach(port=>node('span','repair-trace trace-'+port,undefined,plate));
            node('span','repair-chip',undefined,plate);
            if(i===m.source||i===m.target)node('small','terminal-tag',i===m.source?'IN':'OUT',cell);
          }
        } else if(m.kind==='route') {
          board.style.setProperty('--grid',m.n);
          for(let i=0;i<m.n*m.n;i++) {
            const cell=button('',()=>this.mutate(model=>{
              if(model.path.at(-1)===i&&model.path.length>1)model.path.pop();
              else if(!model.blocked.includes(i)&&!model.path.includes(i)&&Math.abs(model.path.at(-1)%m.n-i%m.n)+Math.abs(Math.floor(model.path.at(-1)/m.n)-Math.floor(i/m.n))===1)model.path.push(i);
            }),board,'repair-cell');
            cell.id='repair-cell-'+i;
            cell.classList.toggle('blocked',m.blocked.includes(i));cell.classList.toggle('connected',m.path.includes(i));cell.disabled=cell.disabled||m.blocked.includes(i);
            cell.textContent=m.blocked.includes(i)?'×':m.path.includes(i)?'●':String(i+1);cell.setAttribute('aria-label',`Nó ${i+1}${m.blocked.includes(i)?', bloqueado':''}`);
            if(i===m.source||i===m.target)node('small','terminal-tag',i===m.source?'IN · O':'OUT · D',cell);
          }
        } else if(m.kind==='wifi') {
          m.values.forEach((value,i)=>{
            const label=node('label','repair-tuner',i===0?'CANAL':'POTÊNCIA',board),output=node('output','',String(value)+(i?'%':''),label);
            const input=node('input','',undefined,label);input.type='range';input.min=i?'10':'1';input.max=i?'100':'11';input.step=i?'5':'1';input.value=value;input.disabled=this.mode!=='playing';input.id='repair-tuner-'+i;
            listen(input,'input',()=>{if(!this.active())return;m.values[i]=Number(input.value);output.textContent=input.value+(i?'%':'');});
          });
          const meter=node('div','signal-readout',`ALVO · canal ${m.answer[0]} / potência ${m.answer[1]}%`,board);meter.setAttribute('aria-live','polite');
        } else if(m.kind==='dhcp'){
          m.labels.forEach((text,i)=>{
            const row=node('label','repair-match-row',undefined,board);node('span','',text,row);
            const select=node('select','',undefined,row);select.id='repair-choice-'+i;select.disabled=this.mode!=='playing';
            if(m.invalid)select.classList.add(m.values[i]===m.answer[i]?'valid-choice':'invalid-choice');
            const empty=node('option','','Escolha…',select);empty.value='';
            m.options.forEach(value=>{const opt=node('option','',value,select);opt.value=value;});select.value=m.values[i];
            listen(select,'change',()=>{if(this.active())m.values[i]=select.value;});
          });
        } else {
          const controls=(parent=board)=>node('div','repair-actions',undefined,parent);
          const action=(id,text,fn,parent=board,pressed)=>{
            const control=button(text,()=>this.mutate(fn),parent);
            control.id='repair-'+id;
            if(pressed!==undefined)control.setAttribute('aria-pressed',String(pressed));
            return control;
          };
          if(m.kind==='software'){
            node('p','signal-readout',m.values.join(' → ')||'Fila vazia',board);
            const group=controls();
            m.options.forEach((value,i)=>{
              action('action-'+i,value,model=>model.values.push(value),group).disabled||=m.values.includes(value)||m.values.length>=m.answer.length;
            });
            action('undo','REMOVER ÚLTIMA AÇÃO',model=>model.values.pop(),group).disabled||=!m.values.length;
          }else if(m.kind==='ethernet'){
            const ports=controls(),sockets=controls();
            m.labels.forEach((label,i)=>action('port-'+i,label+(m.values[i]?' · '+m.values[i]:''),model=>{model.selected=i;},ports,i===m.selected));
            m.options.forEach((value,i)=>action('socket-'+i,value,model=>{
              const previous=model.values.indexOf(value);
              if(previous>=0)model.values[previous]='';
              model.values[model.selected]=value;
            },sockets));
          }else if(m.kind==='cabling'){
            const wires=controls();
            const colors={laranja:'#ed9b53',verde:'#74ce94',azul:'#7ebbef',marrom:'#b5876d'};
            m.values.forEach((wire,i)=>{
              const pin=action('wire-'+i,(i+1)+' · '+wire,model=>{
              const previous=model.selected;
              if(previous===null){model.selected=i;return;}
              [model.values[i],model.values[previous]]=[model.values[previous],model.values[i]];
              model.selected=null;
              },wires,i===m.selected);
              const color=colors[wire.split('/').at(-1).toLowerCase()];
              pin.style.setProperty('--wire-color',wire.includes('/')?
                'repeating-linear-gradient(90deg,'+color+' 0 7px,#e9eef0 7px 14px)':color);
            });
          }else if(m.kind==='dns'){
            node('p','signal-readout',m.labels.map((name,i)=>name+' → '+m.aliases[i]).join(' · '),board);
            node('p','repair-guide',[...m.records].map(([alias,ip])=>alias+' → '+ip).join(' · '),board);
            m.labels.forEach((label,i)=>{
              const row=node('section','repair-match-row',undefined,board);
              node('span','',[label,m.hops[i],m.values[i]].filter(Boolean).join(' → '),row);
              const choices=controls(row);
              m.options.forEach((alias,j)=>action('hop-'+i+'-'+j,alias,model=>{model.hops[i]=alias;model.values[i]='';},choices,m.hops[i]===alias));
              if(m.hops[i])m.addresses.forEach((ip,j)=>action('address-'+i+'-'+j,ip,model=>{model.values[i]=ip;},choices,m.values[i]===ip));
            });
          }else if(m.kind==='firewall'){
            m.labels.forEach((label,i)=>{
              const row=node('div','repair-match-row',undefined,board);
              node('span','',label,row);
              const choices=controls(row);
              for(const allow of [true,false])action('rule-'+i+'-'+Number(allow),allow?'PERMITIR':'BLOQUEAR',model=>{model.values[i]=allow;},choices,m.values[i]===allow);
            });
          }else if(m.kind==='servers'){
            m.labels.forEach((label,i)=>{
              const row=node('div','repair-match-row',undefined,board);
              node('span','',label,row);
              action('epoch-'+i,'Época '+m.values[i]+' · avançar',model=>{
                model.values[i]=model.values[i]%9+1;model.relay=false;
              },row);
            });
            action('relay',m.relay?'RELAY ATIVO':'ATIVAR RELAY',model=>{model.relay=true;}).disabled||=m.relay||m.values.some((v,i)=>v!==m.answer[i]);
          }
        }
        const actions=node('div','repair-actions repair-console-actions',undefined,frame);
        if(this.mode==='failed') {
          const retry=button('TENTAR OUTRA VARIAÇÃO',()=>{this.start();this.render();this.message('Novo diagnóstico pronto.');host.querySelector('button,input,select')?.focus();},actions);
          retry.disabled=false;
        } else {
          const verify=button('VERIFICAR CONEXÃO [V]',()=>this.verify(),actions);verify.id='repair-verify';
          const hint=button(`DICA [H] · ${this.hints}`,()=>this.hint(),actions);hint.disabled=hint.disabled||this.hints===0;
          if(m.kind==='circuit'){
            const reset=button('REINICIAR CIRCUITO',()=>this.mutate(model=>{
              model.values=[...model.initial];
              model.selected=null;
              model.invalid=false;
            }),actions);
            reset.id='repair-reset';
          }
          if(m.kind==='route')button('REINICIAR ROTA',()=>this.mutate(model=>{model.path=[0];}),actions);
          if(m.kind==='equipment'){
            const reset=button('REINICIAR PAINEL',()=>this.mutate(model=>{
              model.values=[...model.initial];model.selected=null;
            }),actions);
            reset.id='repair-reset';
          }
        }
        feedback=node('p','repair-feedback','',frame);feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
        if(this.mode==='won')this.message('Conexão correta. Aplicando restauração…');
        if(oldId)host.querySelector('#'+oldId)?.focus();
      },
      dispose(){abort?.abort();host?.replaceChildren();previousFocus?.focus?.();host=null;}
    };
    serial++;game.id=serial;game.start();return game;
  }
  for(const {id} of catalog)api.repairs.register(id,createGame);
  api.repairChallenges=Object.freeze({
    forPhase(index,componentIndex=0){return {selection:'auto',type:types[Math.max(0,Math.min(9,index))],stage:index+1,componentIndex};},
    assign,catalog:Object.freeze(catalog),names:Object.freeze(names),types:Object.freeze(types)
  });
})();
