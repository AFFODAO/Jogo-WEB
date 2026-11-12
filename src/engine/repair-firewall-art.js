/* Equipamentos de segurança em pixel art. O desenho não decide as políticas. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#1c1220',dark:'#392a37',metal:'#856575',rim:'#d3b3bd',gold:'#f1c382',red:'#f2929a',green:'#9ce4b2',cyan:'#85dae6',violet:'#b7a2eb'};const colors=[p.cyan,p.gold,p.violet];let state;
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(pts,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.stroke();};
    const poly=(pts,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.closePath();ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const packet=(x,y,color,scale=1)=>{ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);rect(-15,-11,30,22,p.ink);rect(-11,-7,22,14,color);rect(-6,-3,7,3,p.ink);rect(4,2,4,3,p.ink);ctx.restore();};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();const t=()=>motion()?state.t:0;
    function shell(title,subtitle){rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,48,'#2d1f30');text(title,320,42,20,p.gold);text(subtitle,320,61,12);for(const x of [25,615])for(const y of [27,530])screw(x,y);for(let i=0;i<23;i++)rect(32+i*26,525,14,3,p.ink);}
    function travel(points,q){const v=Math.min(.99999,Math.max(0,q))*(points.length-1),i=Math.floor(v),f=v-i;return [points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f];}
    function cable(a,b,color){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x-35,a.y+75,b.x+45,b.y+90,b.x,b.y);ctx.lineWidth=11;ctx.strokeStyle=p.ink;ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle=color;ctx.stroke();}
    function blocking(){
      shell('BLOQUEIO DE PACOTES','PORTAS INTERTRAVADAS · LIBERAÇÃO OU DESCARTE CONFORME A POLÍTICA');
      const item=m.packets[Math.min(m.index,m.packets.length-1)];
      text('NEGAR: 203.0.113.66 OU ESTADO INVÁLIDO',320,93,13,p.red);text('PERMITIR: ESTABELECIDA, HTTPS, DNS PREVISTO, SSH DO ADMIN',320,114,11,p.green);
      plate(40,130,560,63,p.ink);text(item.src+' → '+item.dst,320,155,15,p.cyan);text(item.protocol+' · PORTA '+item.port+' · CONEXÃO '+item.state,320,179,13,p.gold);
      plate(40,202,560,151);line([[55,245],[580,245]],p.metal,16);line([[350,245],[350,325],[565,325]],p.metal,16);
      for(let i=0;i<8;i++){rect(70+(i*63+t()*22)%500,239,12,3,'#ffffff22');}
      rect(381,210,18,m.gates[0]?70:16,m.gates[0]?p.red:p.green);rect(337,294,m.gates[1]?13:76,15,m.gates[1]?p.green:p.red);
      text('REDE PROTEGIDA',507,224,12,p.green);text('DESCARTE',520,351,12,p.red);
      if(!m.flight&&!m.done)packet(65+m.incoming*185,245,p.violet);
      if(m.flight){const f=m.flight,points=f.decision==='permitir'?[[250,245],[390,245],[580,245]]:f.decision==='bloquear'?[[250,245],[350,245],[350,325],[565,325]]:[[250,245],[320,245],[250,245]],q=f.progress,[x,y]=travel(points,q);packet(x,y,f.correct?(f.decision==='permitir'?p.green:p.red):p.red,f.decision==='bloquear'&&q>.85?Math.max(.15,1-(q-.85)*5):1);}
      text('PACOTES VALIDADOS '+m.history.length+'/'+m.packets.length,320,376,13,p.green);
      text('PROTEÇÃO',190,483,12,p.gold);text('DESCARTE',410,483,12,p.gold);
    }
    function shield(){
      shell('BARREIRA DE SEGURANÇA','ALINHE MÓDULOS · RECONECTE CIRCUITOS · RESTAURE O CAMPO');
      for(let i=0;i<3;i++){
        const x=140+i*180,charge=m.segments[i];plate(x-74,89,148,195,'#2c3043');
        for(let row=0;row<6;row++)for(let col=0;col<4;col++){const xx=x-53+col*34+(row%2)*5,yy=109+row*28;poly([[xx-10,yy],[xx-4,yy-10],[xx+7,yy-10],[xx+13,yy],[xx+7,yy+10],[xx-4,yy+10]],row/6<charge?'#43746e':'#424057');}
        if(charge<1)line([[x-60,120],[x-30,146],[x-42,165],[x-11,187]],p.red,3);
        text('MARCA '+(m.target[i]+1),x,112,12,p.gold);line([[x,246],[x,306]],m.links[i]?p.gold:p.metal,7);
        const c=m.controls().find(c=>c.id==='powerlink'+i);cable({x:90+i*180,y:515},state.position(c),colors[i]);
        if(m.powering){const [px,py]=travel([[x,330],[x,260],[x,145]],Math.max(0,Math.min(1,m.progress*3-i)));packet(px,py,colors[i],.6);}
      }
      const protection=Math.round(m.segments.reduce((a,b)=>a+b,0)/3*100);text('PROTEÇÃO '+protection+'%',275,391,21,protection===100?p.green:p.gold);
      if(m.powering){const y=125+(t()*45)%140;line([[65,y],[575,y]],p.cyan+'66',2);}
    }
    function scanner(){
      shell('SCANNER DE AMEAÇAS','QUARENTENA: MAL-01, EXP-02 OU INTEGRIDADE INVÁLIDA');
      const item=m.packets[Math.min(m.index,m.packets.length-1)];
      plate(180,89,280,276,'#3c354a');rect(197,116,246,222,p.ink);for(let i=0;i<7;i++)rect(209+i*33,98,16,3,p.rim);
      text('INSPEÇÃO '+Math.min(m.index+1,m.packets.length)+'/'+m.packets.length,320,139,15,p.gold);
      if(m.inspected){text('ASSINATURA: '+(item.signature||'NENHUMA'),320,167,13,item.signature?p.red:p.green);text('INTEGRIDADE '+(item.integrity?'VÁLIDA':'INVÁLIDA'),320,190,13,item.integrity?p.green:p.red);}else text('CONTEÚDO AINDA NÃO INSPECIONADO',320,173,11,p.rim);
      if(m.scanning){const y=195+m.scanProgress*120;rect(208,y,224,4,p.cyan);for(let i=0;i<6;i++)rect(214+i*38,y-8,8,5,p.cyan+'66');}
      line([[320,338],[320,375],[105,375],[105,410]],p.metal,8);line([[320,375],[535,375],[535,410]],p.metal,8);
      if(m.flight){const f=m.flight,target=f.target==='clean'?105:535,q=f.correct?f.progress:f.progress<.5?f.progress*2:(1-f.progress)*2,[x,y]=travel([[320,250],[320,375],[target,375],[target,450]],q);packet(x,y,f.correct?(f.target==='clean'?p.green:p.red):p.red,f.correct&&f.target==='quarantine'&&q>.85?Math.max(.25,1-(q-.85)*4):1);}
      text('LIBERADOS '+m.forwarded.length,105,530,11,p.green);text('ISOLADOS '+m.quarantine.length,535,530,11,p.red);
    }
    function rules(){
      shell('MOTOR DE REGRAS DO FIREWALL','A PRIMEIRA REGRA CORRESPONDENTE ENCERRA A AVALIAÇÃO');
      plate(325,87,276,432);for(let i=0;i<4;i++){text(i+1,334,140+i*110,14,p.gold);for(let j=0;j<4;j++)rect(586,113+i*110+j*12,6,5,p.ink);}
      if(!m.slots.includes(-1)){
        const item=m.tests[Math.min(m.cursor,m.tests.length-1)];plate(36,88,230,131,p.ink);text('PACOTE DE TESTE',150,113,14,p.cyan);text(item.src,150,141,15);text(item.protocol+' · PORTA '+item.port,150,166,14,p.gold);text('ESPERADO: '+item.expected.toUpperCase(),150,197,12,p.rim);
        m.results.forEach((r,i)=>{text('TESTE '+(i+1)+' · P'+(r.slot+1),140,262+i*41,13,r.passed?p.green:p.red);text(r.decision.toUpperCase()+(r.passed?' · CORRETO':' · INCORRETO'),140,278+i*41,11,r.passed?p.green:p.red);});
      }
      if(m.testing){const item=m.tests[m.cursor],result=ByteRunner.firewallLogic.firstMatch(item,m.slots),points=[[275,135],[455,135]];for(let i=1;i<=result.slot;i++)points.push([455,135+i*110]);points.push([610,135+result.slot*110]);if(result.decision==='bloquear')points.push([610,510]);const [x,y]=travel(points,m.travel);packet(x,y,result.decision==='bloquear'?p.red:p.green);}
    }
    function background(s){state=s;({'inspection-airlock':blocking,'shield-iris':shield,'threat-triangulation':scanner,'policy-camshaft':rules})[entry.key]();}
    function control(c,s){ctx.save();ctx.translate(s.x,s.y);
      if(c.id.startsWith('gate')){
        const i=+c.id.at(-1),value=m.gates[i];plate(-42,-31,84,62);rect(-28,-10,56,20,p.ink);ctx.save();ctx.rotate(value?-.6:.6);rect(-8,-23,16,46,p.metal);rect(-13,-29,26,14,value?p.red:p.green);ctx.restore();screw(0,4);text(i===0?(value?'FECHADA':'ABERTA'):(value?'ABERTO':'FECHADO'),0,48,12,value?p.red:p.green);
      }else if(c.id.startsWith('rotor')){
        const i=+c.id.at(-1),q=Math.min(1,Math.max(0,(m.time-m.turned[i])/.23)),value=motion()?m.previous[i]+((s.preview??c.value)-m.previous[i])*(1-Math.pow(1-q,3)):(s.preview??c.value);plate(-43,-43,86,86,p.ink);ctx.save();ctx.rotate(value*Math.PI/2);rect(-27,-29,54,58,p.metal);line([[0,24],[0,-24]],colors[i],7);line([[-10,-12],[0,-25],[10,-12]],colors[i],5);ctx.restore();text('MÓDULO '+(i+1),0,59,11,colors[i]);
      }else if(c.id.startsWith('coupler')){rect(-29,-22,58,44,p.ink);rect(-22,-16,44,32,p.metal);rect(-15,-10,30,20,p.ink);text('SEGMENTO '+(1+(+c.id.at(-1))),0,42,11,p.rim);}
      else if(c.id.startsWith('powerlink')){const i=+c.id.at(-1);rect(-24,-18,48,36,p.rim);rect(-17,-11,34,22,colors[i]);for(let j=0;j<4;j++)rect(-16+j*10,-26,5,10,p.gold);}
      else if(c.id==='clean'){plate(-66,-48,132,96,'#28443e');rect(-52,-31,104,37,p.ink);text('SAÍDA LIMPA',0,-9,12,p.green);led(0,22,true);}
      else if(c.id==='quarantine'){plate(-66,-48,132,96,'#523340');rect(-52,-31,104,37,p.ink);text('QUARENTENA',0,-9,12,p.red);for(let i=0;i<5;i++)rect(-39+i*19,14,7,22,p.metal);if(m.flight?.target==='quarantine')rect(-48,14,96*m.flight.progress,22,p.red+'66');}
      else if(c.id==='packet'){if(!m.flight){const item=m.packets[Math.min(m.index,m.packets.length-1)];plate(-65,-36,130,72);text(item.name,0,-10,12,p.cyan);text('TCP · PORTA 443',0,14,11);led(0,26,m.inspected,m.inspected&&ByteRunner.firewallLogic.malicious(item)?p.red:p.green);}}
      else if(c.id.startsWith('priority')){ctx.strokeStyle=p.metal;ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.strokeRect(-116,-40,232,80);ctx.setLineDash([]);text('PRIORIDADE '+(1+(+c.id.at(-1))),0,5,14,p.gold);}
      else if(c.id.startsWith('rule')){const id=+c.id.at(-1),r=m.rules[id],slot=m.slots.indexOf(id),active=m.testing&&slot===Math.min(ByteRunner.firewallLogic.firstMatch(m.tests[m.cursor],m.slots).slot,Math.floor(m.travel*(ByteRunner.firewallLogic.firstMatch(m.tests[m.cursor],m.slots).slot+1)));plate(-107,-38,214,76,active?'#554156':p.dark);text(r.title,0,-9,13,r.decision==='bloquear'?p.red:p.green);text(r.condition,0,16,12,p.rim);for(let i=0;i<6;i++){rect(-87+i*32,34,8,7,p.gold);}screw(-96,-27);screw(96,27);}
      else{plate(-36,-25,72,50);rect(-22,-13,44,26,c.on?p.green:p.gold);text(c.on?'✓':'▶',0,7,18,p.ink);text(c.id==='scan'?'INSPECIONAR':c.id==='energize'?'ENERGIZAR':c.id==='run'?'TESTAR':'PROCESSAR',0,46,11,p.gold);}
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}ctx.restore();
    }
    function overlay(){if(m.done){plate(110,225,420,91,p.ink);text('FIREWALL RESTAURADO',320,266,23,p.green);text('PROTEÇÃO E POLÍTICAS CONFIRMADAS',320,294,13,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.firewallRepairArt=Object.freeze({create});
})();
