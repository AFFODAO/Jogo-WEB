/* Servidor, clientes e máquina de escopo em pixel art; regras ficam no modelo. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#101b20',dark:'#243b3d',metal:'#617b7c',rim:'#b5cec6',green:'#afe392',cyan:'#85ddd7',gold:'#f0cd85',red:'#f2949d',violet:'#bfacf0'};let state;
    const colors=[p.cyan,p.gold,p.violet];
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(pts,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.stroke();};
    const poly=(pts,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.closePath();ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();
    const t=()=>motion()?state.t:0;
    function shell(title,subtitle){rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,48,'#1a2c32');text(title,320,42,20,p.green);text(subtitle,320,61,12);for(const x of [25,615])for(const y of [27,530])screw(x,y);for(let i=0;i<23;i++)rect(32+i*26,525,14,3,p.ink);}
    function chip(x,y,ip,color=p.cyan){plate(x-73,y-27,146,54);for(let i=0;i<8;i++){rect(x-61+i*17,y-33,6,6,p.gold);rect(x-61+i*17,y+27,6,6,p.gold);}rect(x-65,y-19,130,38,p.ink);text(ip,x,y+5,14,color);}
    function cable(a,b,color){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x-30,a.y+80,b.x+40,b.y+70,b.x,b.y);ctx.lineWidth=10;ctx.strokeStyle=p.ink;ctx.stroke();ctx.lineWidth=5;ctx.strokeStyle=color;ctx.stroke();}
    function delivery(){
      shell('ENTREGA DE ENDEREÇOS','SUB-REDES /29 · RESERVA DA IMPRESSORA: 192.168.10.3');
      plate(235,79,170,54);text('SERVIDOR DHCP',320,99,14,p.gold);for(let i=0;i<4;i++){rect(248+i*35,108,24,12,p.ink);led(260+i*35,114,Math.floor(t()*4+i)%3!==0);}
      m.devices.forEach((d,i)=>{line([[320,133],[320,145],[115+i*205,145],[115+i*205,174]],m.activation[i]===1?p.green:p.metal,3);});
      text('EM USO: 192.168.10.2 · GATEWAYS: .1 · DIFUSÃO: .7',320,505,12,p.gold);
      m.activation.forEach((a,i)=>{if(a>0&&a<1){const y=150+a*50;rect(111+i*205,y,8,6,p.green);}});
    }
    function conflict(){
      shell('RESOLUÇÃO DE CONFLITOS','PRESERVE A CONCESSÃO REGISTRADA · TROQUE APENAS A DUPLICATA');
      text('REGISTRO: 192.168.30.2 → PC-A · REDE /29',320,97,15,p.gold);
      line([[170,190],[320,252],[470,190]],p.metal,4);line([[170,315],[320,252],[470,315]],p.metal,4);
      plate(294,232,52,40);text('DHCP',320,257,12,p.cyan);
      if(m.replacement!==null){for(let i=0;i<4;i++){const d=m.controls().find(c=>c.id==='client'+i),q=(m.communication+i*.22)%1;rect(320+(d.x-320)*q-4,252+(d.y-252)*q-3,8,6,p.green);}}
      text(m.selected===null?'SELECIONE O CLIENTE COM CONCESSÃO INCORRETA':'ENTREGUE UM IP LIVRE AO CLIENTE SELECIONADO',320,402,12,p.gold);
    }
    function server(){
      shell('REPARO DO SERVIDOR DHCP','MÓDULO DE ALOCAÇÃO · REGISTROS E RESERVAS PRESERVADOS');
      plate(160,88,435,293,'#213e36');
      if(!m.open){for(let i=0;i<10;i++)rect(185,115+i*23,383,8,p.ink);text('CONTROLE DE ALOCAÇÃO',370,225,17,p.gold);}
      else{
        for(let i=0;i<9;i++){const y=110+i*28;line([[175,y],[215+i*12,y],[215+i*12,y+13],[575,y+13]],'#376452',3);}
        rect(244,143,152,116,p.ink);for(let i=0;i<12;i++)rect(253+i*12,248,5,14,p.gold);
        text('RESERVA: 192.168.10.3',420,111,13,p.gold);
        if(m.seated)m.links.forEach((linked,i)=>{const c=m.controls().find(c=>c.id==='circuit'+i),a=state.position(c);cable({x:185+i*130,y:510},a,colors[i]);line([[320,245],[320,275],[170+i*140,275],[170+i*140,300]],linked?p.gold:p.metal,4);});
        for(let i=0;i<4;i++){rect(490+i*18,145,10,42,p.ink);rect(492+i*18,150,6,8,p.metal);}
      }
      if(m.booting){const labels=['CONCESSÕES','RESERVAS','SERVIÇO'];for(let i=0;i<3;i++){led(200+i*120,389,m.service>=(i+1)/3);text(labels[i],200+i*120,410,12);}rect(170,460,310*m.service,7,p.green);text('REINICIANDO ALOCAÇÃO…',305,490,12,p.green);}
      led(565,360,m.power);text(m.power?'ENERGIA LIGADA':'ENERGIA ISOLADA',375,369,12,m.power?p.gold:p.green);
    }
    function pool(){
      shell('INTERVALO DE ENDEREÇOS','MÁQUINA DE ALOCAÇÃO · SUB-REDE 10.7.0.0/28');
      plate(35,87,570,388);text('GATEWAY: .1 · RESERVAS: '+m.reserved.map(n=>'.'+n).join(' E ')+' · CLIENTES: '+m.required,320,113,13,p.gold);
      text('REDE .0 E DIFUSÃO .15 NÃO PODEM SER CONCEDIDAS',320,138,12,p.rim);
      const bounds=[...m.bounds];if(state.drag?.id==='lower')bounds[0]=state.drag.value;if(state.drag?.id==='upper')bounds[1]=state.drag.value;
      for(let i=0;i<16;i++){
        const x=65+i*34,inside=i>=bounds[0]&&i<=bounds[1],valid=m.allowed(i);
        rect(x-13,176,26,91,p.ink);rect(x-9,182,18,65,inside?(valid?'#496b45':'#6c3b46'):'#33474a');
        text(i,x,283,12,valid?p.rim:p.red);led(x,255,m.slotsLit[i]);if(!valid)text(i===0?'R':i===15?'D':i===1?'G':'X',x,215,13,p.red);
      }
      for(const y of [335,430]){line([[65,y],[575,y]],p.ink,19);line([[65,y],[575,y]],p.rim,3);for(let i=0;i<16;i++)rect(63+i*34,y-7,3,14,p.metal);}
      text('INÍCIO',105,311,12,p.gold);text('FIM',105,405,12,p.cyan);
      const count=Math.max(0,bounds[1]-bounds[0]+1);text('FAIXA .'+bounds[0]+' → .'+bounds[1]+' · '+count+' VAGAS',260,496,15,p.gold);
      if(m.allocating)rect(65,155,510*m.progress,5,p.green);
    }
    function background(s){state=s;({'lease-pneumatics':delivery,'conflict-localizer':conflict,'reservation-drum':server,'pool-sluice':pool})[entry.key]();}
    function control(c,s){let {x,y}=s;ctx.save();ctx.translate(x,y);
      if(c.id.startsWith('device')){
        const i=+c.id.at(-1),d=m.devices[i];plate(-55,-35,110,66);rect(-45,-24,90,42,p.ink);text(d.name,0,-7,13,p.cyan);rect(-15,31,30,9,p.metal);led(0,23,m.activation[i]===1);
        text('192.168.'+(d.scope?20:10)+'.0/29',0,67,12);text(m.activation[i]===1?'ATIVO':m.leases[i]?'ATIVANDO':'SEM CONCESSÃO',0,86,11,m.activation[i]===1?p.green:p.rim);
      }else if(c.id.startsWith('address')){
        const i=+c.id.at(-1),assigned=m.assigned[i]>=0;
        if(assigned){rect(-73,5,146,25,p.ink);text(m.chips[i],0,22,14,p.green);}
        else{const q=Math.max(0,Math.min(1,(m.emission-i*.16)/.35));if(q>0){if(q<1){ctx.translate((320-x)*(1-q),(110-y)*(1-q));}chip(0,0,m.chips[i],i===2?p.violet:p.cyan);}}
      }else if(c.id.startsWith('client')){
        const i=+c.id.at(-1),d=m.devices[i],bad=m.duplicates()[i],flash=bad&&(!motion()||Math.sin(t()*9)>0);plate(-83,-36,166,72,flash?'#6c3b46':p.dark);text(d.name,0,-15,16,p.cyan);text(d.ip,0,8,16,bad?p.red:p.green);led(0,24,!bad);text('CONCESSÃO: '+d.minutes+' MIN',0,54,11);if(m.selected===i){ctx.strokeStyle=p.gold;ctx.lineWidth=4;ctx.strokeRect(-90,-43,180,86);}
      }else if(c.id.startsWith('replacement')){chip(0,0,m.chips[+c.id.at(-1)],m.selected===null?p.metal:p.cyan);}
      else if(c.id==='socket'){rect(-68,-47,136,94,p.ink);rect(-58,-36,116,72,'#365348');for(let i=0;i<10;i++)rect(-55+i*12,27,5,13,p.gold);}
      else if(c.id==='fault'||c.id==='module'){
        const dy=c.id==='module'&&m.seated&&motion()?Math.max(0,1-(m.time-m.insertedAt)/.4)*30:0;ctx.translate(0,dy);plate(-65,-43,130,86,c.id==='fault'?'#694351':'#326451');rect(-39,-26,78,44,p.ink);text('ALOCAÇÃO',0,-8,14,p.gold);text(c.id==='fault'?'AVARIA':'MÓDULO NOVO',0,12,12,c.id==='fault'?p.red:p.green);screw(-53,-31);screw(53,31);
      }else if(c.id==='tray'){plate(-38,-27,76,54,p.ink);text('RETIRAR',0,44,11,p.red);}
      else if(c.id.startsWith('port')){const i=+c.id.at(-1);rect(-27,-21,54,42,p.ink);for(let j=0;j<i+2;j++)rect(-16+j*12,-12,6,24,p.gold);text(['MEMÓRIA','CLIENTES','RELÓGIO'][i],0,40,11,colors[i]);}
      else if(c.id.startsWith('circuit')){const i=+c.id.at(-1);rect(-25,-17,50,34,p.rim);rect(-19,-11,38,22,colors[i]);for(let j=0;j<i+2;j++)rect(-16+j*12,-25,6,12,p.gold);}
      else if(c.id==='lower'||c.id==='upper'){
        const color=c.id==='lower'?p.gold:p.cyan;line([[0,-31],[0,273-y]],color,2);plate(-35,-29,70,58,p.ink);rect(-23,-20,46,40,p.metal);poly([[-11,-10],[0,-22],[11,-10]],color);screw(0,5);text('10.7.0.'+(s.preview??c.value),0,48,12,color);
      }else if(c.id==='power'||c.id==='cover'){
        plate(-30,-25,60,50);rect(-12,-19,24,38,p.ink);rect(-9,c.on?-16:0,18,16,c.on?p.green:p.gold);text(c.id==='power'?'ENERGIA':'ABRIR',0,43,11,p.gold);
      }else{plate(-36,-25,72,50);rect(-22,-13,44,26,c.on?p.green:p.gold);text(c.on?'✓':'▶',0,7,18,p.ink);text(c.id==='restart'?'REINICIAR':'LIBERAR',0,46,11,p.gold);}
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}ctx.restore();
    }
    function overlay(){if(m.done){plate(110,225,420,91,p.ink);text('ALOCAÇÃO RESTAURADA',320,266,23,p.green);text('CLIENTES E CONCESSÕES CONFIRMADOS',320,294,13,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.dhcpRepairArt=Object.freeze({create});
})();
