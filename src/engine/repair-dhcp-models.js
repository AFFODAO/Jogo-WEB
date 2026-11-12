/* Fase 7: concessões IPv4, registro de clientes e limites de escopo. */
(() => {
  'use strict';
  const c=(id,label,x,y,extra={})=>({id,label,x,y,w:96,h:96,kind:'dhcp',...extra});
  const zone=(id,label,x,y,extra={})=>c(id,label,x,y,{mode:'target',...extra});
  const wait={wait:true,message:'Aguarde a confirmação do serviço de alocação.'};
  function parse(ip){const a=String(ip).split('.');if(a.length!==4||a.some(v=>!/^\d{1,3}$/.test(v)||+v>255))return null;return a.reduce((n,v)=>(n*256+Number(v))>>>0,0);}
  function scope(network,prefix,gateway){const first=parse(network);return Object.freeze({network,prefix,gateway,first,last:first+2**(32-prefix)-1});}
  function usable(ip,s){const n=parse(ip);return n!==null&&n>s.first&&n<s.last&&ip!==s.gateway;}
  function delivery(m){
    m.scopes=[scope('192.168.10.0',29,'192.168.10.1'),scope('192.168.20.0',29,'192.168.20.1')];
    m.devices=[{name:'Impressora',mac:'02:00:00:00:00:A1',scope:0,reserved:'192.168.10.3'},{name:'Terminal',mac:'02:00:00:00:00:B2',scope:0},{name:m.componentId==='distribution-south:relay'?'Sensor via retransmissor':'Sensor',mac:'02:00:00:00:00:C3',scope:1}];
    m.chips=['192.168.10.3','192.168.10.4','192.168.20.2','192.168.10.1','192.168.10.2','192.168.10.7'];m.occupied=['192.168.10.2'];m.order=m.shuffle([0,1,2,3,4,5]);m.assigned=Array(6).fill(-1);m.leases=[null,null,null];m.activation=[0,0,0];m.emission=0;m.ready=0;
    m.reason=(i,d)=>{
      const ip=m.chips[i],device=m.devices[d];if(!device||!ip)return 'Dispositivo ou endereço inválido.';
      if(m.leases[d])return 'Este dispositivo já possui uma concessão ativa.';
      if(!usable(ip,m.scopes[device.scope]))return 'O IP precisa pertencer à sub-rede do cliente e excluir rede, difusão e gateway.';
      if(m.occupied.includes(ip)||m.leases.includes(ip))return 'Este endereço já está em uso. Escolha um IP livre.';
      if(device.reserved&&ip!==device.reserved)return 'Esta impressora exige a reserva '+device.reserved+' registrada para seu identificador.';
      if(m.devices.some((other,j)=>j!==d&&other.reserved===ip))return 'Este IP está reservado para outro cliente.';return '';
    };
    const devices=()=>m.devices.map((d,i)=>zone('device'+i,d.name+' · sub-rede '+m.scopes[d.scope].network+'/29'+(d.reserved?' · reserva '+d.reserved:''),115+i*205,190,{w:160,h:112}));
    m.controls=()=>[...devices(),...m.chips.map((ip,i)=>{const d=m.assigned[i],pos=m.order.indexOf(i);return c('address'+i,'Chip de IP '+ip,d<0?115+pos%3*205:115+d*205,d<0?330+Math.floor(pos/3)*115:190,{mode:'drag',w:156,h:88,locked:d>=0||i>=m.ready,targets:devices()});})];
    m.act=a=>{if(m.done||!/^address[0-5]$/.test(a.id)||!/^device[0-2]$/.test(a.target))return;const i=+a.id.at(-1),d=+a.target.at(-1);if(i>=m.ready||m.assigned[i]>=0)return;const reason=m.reason(i,d);if(reason){m.message=reason;return;}m.assigned[i]=d;m.leases[d]=m.chips[i];m.message='Concessão confirmada para '+m.devices[d].name+'. Ativando o dispositivo…';};
    m.tick=dt=>{m.emission+=dt;const ready=Math.max(0,Math.min(6,Math.floor((m.emission-.35)/.16)+1));if(ready!==m.ready){m.ready=ready;m.needsSync=true;}for(let i=0;i<3;i++)if(m.leases[i])m.activation[i]=Math.min(1,m.activation[i]+dt/.85);m.done=m.activation.every(v=>v===1);};
    m.next=()=>{const d=m.leases.indexOf(null);if(d<0)return wait;const i=m.chips.findIndex((_,i)=>m.assigned[i]<0&&!m.reason(i,d));return i>=m.ready?wait:{id:'address'+i,target:'device'+d};};
  }
  function conflict(m){
    m.scope=scope('192.168.30.0',29,'192.168.30.1');
    m.devices=[{name:'PC-A',mac:'02:00:00:00:30:A1',ip:'192.168.30.2',minutes:90},{name:'PC-B',mac:'02:00:00:00:30:B2',ip:'192.168.30.2',minutes:5},{name:'Sensor',mac:'02:00:00:00:30:C3',ip:'192.168.30.3',minutes:70},{name:'Impressora',mac:'02:00:00:00:30:D4',ip:'192.168.30.6',minutes:120}];
    m.registry={'192.168.30.2':m.devices[0].mac,'192.168.30.3':m.devices[2].mac,'192.168.30.6':m.devices[3].mac};m.reserved=['192.168.30.6'];m.chips=['192.168.30.4','192.168.30.3','192.168.30.7'];m.selected=null;m.replacement=null;m.communication=0;
    m.duplicates=()=>m.devices.map((d,i)=>m.devices.some((o,j)=>i!==j&&o.ip===d.ip));
    m.bad=()=>m.devices.findIndex(d=>m.registry[d.ip]!==d.mac);
    const clients=()=>m.devices.map((d,i)=>c('client'+i,d.name+' · IP '+d.ip+' · concessão há '+d.minutes+' minutos',170+i%2*300,190+Math.floor(i/2)*125,{mode:m.selected===i?'target':undefined,w:200,h:104}));
    m.controls=()=>[...clients(),...m.chips.map((ip,i)=>c('replacement'+i,'Nova concessão '+ip,115+i*205,465,{mode:'drag',w:156,h:88,locked:m.selected===null||m.replacement!==null,targets:clients()}))];
    m.act=a=>{
      if(m.replacement!==null||m.done)return;
      if(/^client[0-3]$/.test(a.id)){const i=+a.id.at(-1);if(i!==m.bad()){m.message='Preserve as concessões registradas. O servidor confirma o IP .2 para PC-A.';return;}m.selected=i;m.message='Concessão duplicada identificada. Substitua apenas o IP do PC-B por um endereço livre.';}
      if(/^replacement[0-2]$/.test(a.id)&&/^client[0-3]$/.test(a.target)){
        const i=+a.id.at(-1),d=+a.target.at(-1),ip=m.chips[i];if(d!==m.selected||d!==m.bad()){m.message='Substitua somente a concessão que diverge do registro do servidor.';return;}
        if(!usable(ip,m.scope)||m.devices.some(o=>o.ip===ip)||m.reserved.includes(ip)){m.message='A nova concessão deve usar um IP livre e válido nesta sub-rede.';return;}
        m.devices[d].ip=ip;m.registry[ip]=m.devices[d].mac;m.replacement=i;m.message='IP exclusivo concedido. Restabelecendo a comunicação…';
      }
    };
    m.tick=dt=>{if(m.replacement!==null)m.communication=Math.min(1,m.communication+dt/1.4);m.done=m.communication===1;};
    m.next=()=>m.replacement!==null?wait:m.selected===null?{id:'client'+m.bad()}:{id:'replacement0',target:'client'+m.selected};
  }
  function server(m){
    m.power=true;m.open=false;m.removed=false;m.seated=false;m.links=[false,false,false];m.booting=false;m.service=0;m.insertedAt=-10;
    m.reservations=Object.freeze({'192.168.10.3':'02:00:00:00:00:A1'});m.records=Object.freeze({'192.168.10.2':'02:00:00:00:00:EF'});
    const tray=zone('tray','Bandeja do módulo avariado',80,470),socket=zone('socket','Soquete do módulo de alocação',320,200,{w:144,h:112});
    const names=['memória de concessões','rede dos clientes','relógio de validade'];const ports=()=>names.map((name,i)=>zone('port'+i,'Circuito de '+name,170+i*140,320));
    m.controls=()=>[c('power','Desligar a alimentação do servidor',95,115,{on:m.power,locked:m.booting}),c('cover','Abrir a placa de controle do servidor',95,245,{on:m.open,locked:m.open||m.booting}),...(m.open?[tray,socket,...(!m.removed?[c('fault','Retirar módulo de alocação avariado',320,200,{mode:'drag',w:144,h:112,targets:[tray]})]:[c('module','Instalar módulo de alocação compatível',320,m.seated?200:450,{mode:'drag',w:144,h:112,locked:m.seated,targets:[socket]})]),...(m.seated?[...ports(),...m.links.map((v,i)=>c('circuit'+i,'Reconectar '+names[i],170+i*140,v?320:435,{mode:'drag',locked:v||m.booting,targets:ports()}))]:[])]:[]),c('restart','Reiniciar o serviço de alocação',540,495,{locked:m.booting,on:m.booting})];
    m.act=a=>{
      if(m.booting||m.done)return;
      if(a.id==='power'){if(m.power)m.power=false;else m.message='Restaure a energia pelo comando de reinício, após reparar os circuitos.';}
      if(a.id==='cover'){if(m.power){m.fail('Desligue o servidor antes de abrir a placa de controle.');return;}m.open=true;}
      if(a.id==='fault'&&a.target==='tray'&&m.open&&!m.power)m.removed=true;
      if(a.id==='module'&&a.target==='socket'&&m.removed&&!m.power){m.seated=true;m.insertedAt=m.time;}
      if(/^circuit[0-2]$/.test(a.id)&&a.target){const i=+a.id.at(-1);if(a.target!=='port'+i){m.message='Reconecte o circuito à entrada com a mesma função e chave física.';return;}if(m.seated&&!m.power)m.links[i]=true;}
      if(a.id==='restart'){if(m.power||!m.open||!m.seated||!m.links.every(Boolean)){m.fail('Desligue, substitua o módulo e reconecte os três circuitos antes de reiniciar.');return;}m.power=true;m.booting=true;m.message='Validando concessões, preservando reservas e iniciando o serviço DHCP…';}
    };
    m.tick=dt=>{if(m.booting)m.service=Math.min(1,m.service+dt/1.6);m.done=m.service===1;};
    m.next=()=>{if(m.booting)return wait;if(m.power)return {id:'power'};if(!m.open)return {id:'cover'};if(!m.removed)return {id:'fault',target:'tray'};if(!m.seated)return {id:'module',target:'socket'};const i=m.links.indexOf(false);return i>=0?{id:'circuit'+i,target:'port'+i}:{id:'restart'};};
  }
  function pool(m){
    m.scope=scope('10.7.0.0',28,'10.7.0.1');m.reserved=m.componentId==='address-office:scope'?[4,10]:[4];m.required=m.componentId==='address-office:scope'?4:6;m.bounds=[0,15];m.allocating=false;m.progress=0;m.slotsLit=Array(16).fill(false);
    m.allowed=n=>n>=0&&n<=15&&usable('10.7.0.'+n,m.scope)&&!m.reserved.includes(n);
    const start=Array.from({length:16},(_,i)=>i).find(i=>Array.from({length:m.required},(_,j)=>i+j).every(m.allowed));m.plan=[start,start+m.required-1];
    m.valid=()=>m.bounds[0]<=m.bounds[1]&&m.bounds[1]-m.bounds[0]+1>=m.required&&Array.from({length:m.bounds[1]-m.bounds[0]+1},(_,i)=>m.bounds[0]+i).every(m.allowed);
    m.controls=()=>[c('lower','Mover limite inicial · 10.7.0.'+m.bounds[0],65+m.bounds[0]*34,335,{mode:'rail',dragAxis:'x',dragStep:34,value:m.bounds[0],max:15,w:104,h:88,locked:m.allocating}),c('upper','Mover limite final · 10.7.0.'+m.bounds[1],65+m.bounds[1]*34,430,{mode:'rail',dragAxis:'x',dragStep:34,value:m.bounds[1],max:15,w:104,h:88,locked:m.allocating}),c('allocate','Liberar intervalo de endereços',535,495,{locked:m.allocating,on:m.allocating})];
    m.act=a=>{
      if(m.allocating||m.done)return;
      if(a.id==='lower'||a.id==='upper'){const i=a.id==='lower'?0:1;m.bounds[i]=Math.max(0,Math.min(15,a.value??(m.bounds[i]+1)%16));}
      if(a.id==='allocate'){
        if(m.bounds[0]>m.bounds[1]){m.fail('O início do intervalo precisa ser menor ou igual ao fim.');return;}
        if(!Array.from({length:m.bounds[1]-m.bounds[0]+1},(_,i)=>m.bounds[0]+i).every(m.allowed)){m.fail('Exclua endereço de rede, difusão, gateway e reservas do intervalo.');return;}
        if(m.bounds[1]-m.bounds[0]+1<m.required){m.fail('O intervalo precisa comportar pelo menos '+m.required+' clientes.');return;}
        m.allocating=true;m.message='Liberando os endereços disponíveis do intervalo selecionado…';
      }
    };
    m.tick=dt=>{if(!m.allocating)return;m.progress=Math.min(1,m.progress+dt/1.5);const count=Math.floor(m.progress*(m.bounds[1]-m.bounds[0]+1));for(let i=0;i<count;i++)m.slotsLit[m.bounds[0]+i]=true;m.done=m.progress===1;};
    m.next=()=>m.allocating?wait:m.bounds[0]!==m.plan[0]?{id:'lower',value:m.plan[0]}:m.bounds[1]!==m.plan[1]?{id:'upper',value:m.plan[1]}:{id:'allocate'};
  }
  ByteRunner.dhcpNetwork=Object.freeze({parse,scope,usable});
  ByteRunner.dhcpRepairModels=Object.freeze({'lease-pneumatics':delivery,'conflict-localizer':conflict,'reservation-drum':server,'pool-sluice':pool});
})();
