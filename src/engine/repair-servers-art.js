/* Bancadas finais em pixel art: racks, ar frio, processamento e restauração central. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#0a1322',dark:'#20334b',metal:'#59768b',rim:'#b3ccda',cyan:'#83e4ed',green:'#a6edb6',gold:'#f4ca81',violet:'#baa5f3',red:'#f38fa0'};const colors=[p.cyan,p.gold,p.violet];let state;
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(pts,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.stroke();};
    const poly=(pts,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.closePath();ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();const t=()=>motion()?state.t:0;
    const circle=(x,y,r,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
    const ring=(x,y,r,c,w=3)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
    function shell(title,subtitle){rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,48,'#122438');text(title,320,42,20,p.cyan);text(subtitle,320,61,12);for(const x of [25,615])for(const y of [27,530])screw(x,y);for(let i=0;i<23;i++)rect(32+i*26,525,14,3,p.ink);}
    function cable(a,b,color){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x-30,a.y+65,b.x+60,b.y+90,b.x,b.y);ctx.lineWidth=12;ctx.strokeStyle=p.ink;ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle=color;ctx.stroke();}
    function power(){
      shell('RESTAURAÇÃO DE ENERGIA','FONTES A/B REDUNDANTES · CONTROLE INDEPENDENTE · ATERRAMENTO');
      plate(245,85,355,354,p.ink);for(let i=0;i<3;i++){
        const y=145+i*115;plate(260,y-44,180,88);text(m.requirements[i].name,350,y-24,12,colors[i]);text(m.requirements[i].volts+' V · ≥'+m.requirements[i].watts+' W',350,y+30,12,p.gold);
        for(let j=0;j<6;j++)rect(451+j*22,y-35,12,5,p.metal);led(580,y+25,m.startup>(i+1)*.23);
        if(m.modules.every(v=>v>=0)){const c=m.controls().find(c=>c.id==='cable'+i);cable({x:65,y:115+i*115},state.position(c),colors[i]);line([[440,y],[505,y]],m.links[i]?colors[i]:p.metal,6);}
      }
      if(m.grounded){line([[255,432],[300,432],[300,471]],p.green,5);for(let i=0;i<3;i++)rect(286+i*4,464+i*5,28-i*8,3,p.green);}
      if(m.starting){const labels=['AUTOTESTE DAS FONTES','BARRAMENTOS ESTÁVEIS','SERVIÇOS EM PARTIDA'];for(let i=0;i<3;i++){text(labels[i],120,128+i*115,11,m.startup>(i+1)*.23?p.green:p.rim);led(120,152+i*115,m.startup>(i+1)*.23);}rect(264,425,315*m.startup,5,p.green);const y=95+(t()*95)%322;line([[253,y],[590,y]],p.cyan+'66',2);}
    }
    function cooling(){
      shell('EMERGÊNCIA DE REFRIGERAÇÃO','PRESERVE A VENTOINHA ÍNTEGRA · AR FRIO PARA CIMA · META ≤55 °C');
      const vents=[...m.vents];if(state.drag?.id.startsWith('vent'))vents[+state.drag.id.at(-1)]=state.drag.value;
      for(let i=0;i<3;i++){
        const x=140+i*180,temp=m.temperatures[i];plate(x-70,88,140,165,temp>55?'#503747':'#244953');text(Math.round(temp)+' °C',x,115,20,temp>55?p.red:p.green);text('RACK '+(i+1),x,242,12,p.rim);
        for(let j=0;j<4;j++)rect(x-54+j*30,257,16,5,p.metal);
        if(temp>55){for(let j=0;j<4;j++){const y=230-(t()*20+j*27)%113;rect(x-58+j*35,y,3,13,p.red+'55');}}
        const angle=vents[i]*Math.PI/2,dx=Math.sin(angle),dy=-Math.cos(angle);if(m.running)for(let j=0;j<5;j++){const q=(t()*.7+j*.2)%1;line([[x+dx*q*80,320+dy*q*80],[x+dx*(q*80+12),320+dy*(q*80+12)]],p.cyan,3);}
      }
      line([[70,375],[570,375]],'#386580',18);for(let i=0;i<13;i++)rect(75+(i*38+t()*20)%490,371,14,3,p.cyan+'77');text('CORREDOR DE AR FRIO',320,396,13,p.cyan);
      if(m.running){rect(205,527,230*m.stable,4,p.green);text('ESTABILIDADE '+Math.round(m.stable*100)+'%',320,82,12,p.green);}
    }
    function balance(){
      shell('BALANCEAMENTO DE PROCESSAMENTO','USO ≤85% · DIFERENÇA ≤25 PONTOS · TODOS OS MÓDULOS ATENDIDOS');
      const loads=m.loads();for(let i=0;i<3;i++){
        const x=110+i*210,usage=loads[i]/m.capacities[i];plate(x-90,88,180,250,usage>1?'#593346':p.dark);text('SERVIDOR '+(i+1),x,110,14,p.cyan);text(loads[i]+'/'+m.capacities[i]+' CPU · '+Math.round(usage*100)+'%',x,135,13,usage>.85?p.red:p.green);
        rect(x-68,144,136,9,p.ink);rect(x-66,146,132*Math.min(1,usage),5,usage>.85?p.red:p.green);led(x-70,320,usage<=.85,usage<=.85?p.green:p.red);for(let j=0;j<5;j++)rect(x-48+j*24,317,12,4,p.metal);
      }
      plate(35,389,570,84,p.ink);text('BANCADA TEMPORÁRIA',150,370,13,p.gold);for(let i=0;i<6;i++){ctx.strokeStyle=p.metal;ctx.lineWidth=1;ctx.strokeRect(34+i*98,401,82,58);}
      if(m.testing){rect(65,490,350*m.stability,7,p.green);for(let i=0;i<6;i++){const q=(t()*.5+i*.16)%1;rect(65+q*510,349+Math.sin(q*Math.PI*2)*7,7,5,colors[i%3]);}text('TESTE DAS FILAS EM EXECUÇÃO',260,514,12,p.green);}
    }
    function core(){
      shell('ATIVAÇÃO DO NÚCLEO CENTRAL','RELÉS → PRÉ-CARGA → REFRIGERAÇÃO E RELÓGIO → SINCRONISMO');
      const cx=320,cy=280,charge=m.restoring?m.restoration:m.charge.reduce((a,b)=>a+b,0)/8;
      for(let i=0;i<34;i++){const x=40+(i*137)%560,y=88+(i*83)%370;rect(x,y,i%4===0?3:2,2,'#59768b66');}
      for(let i=0;i<3;i++){const x=120+i*200;line([[x,145],[x,180],[cx,cy]],m.links[i]?colors[i]:p.metal,6);if(m.links[i]){const q=m.relayCharge[i];rect(x+(cx-x)*q-4,180+(cy-180)*q-3,8,6,colors[i]);}}
      if(m.links.every(Boolean)){
        for(let i=0;i<4;i++){const n=m.mechanisms[i];for(const dep of n.deps){const a=m.mechanisms[dep];line([[a.x,a.y],[a.x,(a.y+n.y)/2],[n.x,(a.y+n.y)/2],[n.x,n.y]],m.charge[dep]===1?p.green:'#3b536a',3);}if(m.engaged[i]){const q=m.charge[i];line([[n.x,n.y],[cx,cy]],colors[i%3]+'88',3);rect(n.x+(cx-n.x)*q-4,n.y+(cy-n.y)*q-3,8,6,p.green);}}
      }
      const hex=[];for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;hex.push([cx+Math.cos(a)*105,cy+Math.sin(a)*105]);}poly(hex,'#14283b');line([...hex,hex[0]],charge>.3?p.cyan:p.metal,6);
      ctx.save();ctx.translate(cx,cy);ctx.rotate(t()*.18*(m.restoring?2:1));for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);rect(82,-5,15,10,charge>.4?p.gold:p.metal);}ctx.restore();ring(cx,cy,78,charge>.3?p.cyan:p.metal,5);ring(cx,cy,60,p.violet,3);
      const radius=24+Math.max(0,charge)*27;circle(cx,cy,radius,'#284a65');circle(cx,cy,Math.max(12,radius-8),charge>.55?p.cyan:p.ink);text('NÚCLEO',cx,cy+5,16,charge>.55?p.ink:p.cyan);
      if(!m.restoring)text('DEPENDÊNCIAS '+m.charge.filter(v=>v===1).length+'/4',320,450,14,p.gold);
      if(m.restoring){
        const r=m.restoration;const phase=r<.28?'FECHANDO ANÉIS':r<.58?'CARREGANDO O NÚCLEO':r<.82?'ONDA DE RESTAURAÇÃO':'NÚCLEO ESTÁVEL';text(phase,320,450,17,p.green);rect(220,467,200*r,6,p.green);
        ctx.save();ctx.beginPath();ctx.rect(24,75,592,412);ctx.clip();
        for(let i=0;i<24;i++){const a=i*Math.PI/12+t()*.16,d=50+(r*270+i*17)%260,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;rect(x,y,3+(i%3),3,p.cyan);if(r>.28&&i%3===0)line([[cx+Math.cos(a)*55,cy+Math.sin(a)*55],[x,y]],p.cyan+'44',2);}
        if(r>.58){const wave=Math.min(1,(r-.58)/.24)*350;ring(cx,cy,wave,p.cyan,5);ring(cx,cy,Math.max(1,wave-20),p.violet+'88',3);}
        if(r>.82){line([[32,91],[608,91]],p.green,3);line([[32,479],[608,479]],p.green,3);}
        ctx.restore();
      }
    }
    function background(s){state=s;({'rack-busbars':power,'replica-flywheels':cooling,'rack-gantry':balance,'backbone-prisms':core})[entry.key]();}
    function fan(healthy,spinning){plate(-48,-48,96,96);circle(0,0,39,p.ink);ctx.save();if(spinning)ctx.rotate(t()*9);for(let i=0;i<5;i++){ctx.rotate(Math.PI*2/5);poly([[3,-5],[11,-32],[30,-24],[25,-9],[10,3]],healthy?p.rim:'#876374');}ctx.restore();circle(0,0,9,healthy?p.cyan:p.red);if(!healthy){line([[-23,-24],[22,24]],p.red,4);text('AVARIA',0,63,11,p.red);}}
    function control(c,s){ctx.save();ctx.translate(s.x,s.y);
      if(c.id.startsWith('bay')){const r=m.requirements[+c.id.at(-1)];rect(-82,-36,164,72,p.ink);text(r.name,0,-9,14,p.gold);text(r.volts+' V · '+r.watts+' W',0,16,13);}
      else if(c.id.startsWith('supply')){const r=m.supplies[+c.id.at(-1)];plate(-67,-36,134,72);text(r.name,0,-13,14,p.cyan);text(r.volts+' V · '+r.watts+' W',0,10,13);for(let i=0;i<6;i++)rect(-48+i*18,20,9,4,p.ink);screw(-56,-25);screw(56,24);}
      else if(c.id.startsWith('port')){const i=+c.id.at(-1);rect(-27,-21,54,42,p.ink);for(let j=0;j<i+2;j++)rect(-16+j*12,-12,6,24,p.gold);text(['CANAL A','CANAL B','CONTROLE'][i],0,42,11,colors[i]);}
      else if(c.id.startsWith('cable')){const i=+c.id.at(-1);rect(-25,-18,50,36,p.rim);rect(-18,-11,36,22,colors[i]);for(let j=0;j<i+2;j++)rect(-16+j*12,-26,6,12,p.gold);text(['A','B','CONTROLE'][i],0,43,11,colors[i]);}
      else if(c.id==='discard'){plate(-38,-27,76,54,p.ink);text('RETIRAR',0,44,11,p.red);}
      else if(c.id.startsWith('fanbay')){rect(-47,-47,94,94,p.ink);for(const x of [-40,40])for(const y of [-40,40])screw(x,y);}
      else if(c.id.startsWith('damaged')){const i=+c.id.at(-1);fan(m.fixed[i],m.fixed[i]&&!m.isolated);}
      else if(/^fan[01]$/.test(c.id)){const slot=[0,2][+c.id.at(-1)];fan(true,m.running&&m.fixed[slot]);if(!m.fixed[slot])text('REPOSIÇÃO '+(slot+1),0,63,11,p.green);}
      else if(c.id.startsWith('vent')){const v=s.preview??c.value;plate(-42,-32,84,64);for(let i=0;i<5;i++)rect(-32,-22+i*10,64,4,p.ink);ctx.save();ctx.rotate(v*Math.PI/2);line([[0,22],[0,-22]],p.cyan,7);line([[-11,-9],[0,-23],[11,-9]],p.cyan,5);ctx.restore();text('RUMO AO RACK ↑',0,-43,11,p.cyan);}
      else if(c.id.startsWith('server')){const i=+c.id.at(-1);if(m.loads()[i]>m.capacities[i]){ctx.strokeStyle=p.red;ctx.lineWidth=3;ctx.strokeRect(-86,-112,172,224);}}
      else if(c.id==='parking'){}
      else if(c.id.startsWith('task')){const i=+c.id.at(-1);plate(-35,-24,70,48);text('T'+(i+1)+' · '+m.weights[i],0,5,16,colors[i%3]);for(let j=0;j<4;j++){rect(-29+j*18,-31,5,7,p.gold);rect(-29+j*18,24,5,7,p.gold);}}
      else if(c.id.startsWith('relay')){const i=+c.id.at(-1);plate(-38,-27,76,54,p.ink);rect(-23,-12,46,24,p.metal);for(let j=0;j<i+2;j++)rect(-15+j*10,-8,5,16,p.gold);text(['RELÉ A','RELÉ B','CONTROLE'][i],0,-38,12,colors[i]);}
      else if(c.id.startsWith('link')){const i=+c.id.at(-1);rect(-26,-17,52,34,p.rim);rect(-19,-11,38,22,colors[i]);for(let j=0;j<i+2;j++)rect(-15+j*10,-25,5,10,p.gold);text(['ALIMENTAÇÃO A','ALIMENTAÇÃO B','CONTROLE'][i],0,42,11,colors[i]);}
      else if(c.id.startsWith('mechanism')){const i=+c.id.at(-1),mech=m.mechanisms[i];plate(-51,-31,102,62,m.charge[i]===1?'#28544b':p.dark);text((i+1)+'. '+mech.name,0,-7,11,p.gold);led(0,16,m.charge[i]===1);text(mech.deps.length?'DEP.: '+mech.deps.map(d=>d+1).join(' + '):'DEP.: RELÉS',0,48,11,p.rim);}
      else{plate(-36,-25,72,50);rect(-22,-13,44,26,c.on?p.green:p.gold);text(c.on?'✓':'▶',0,7,18,p.ink);text(c.id==='isolate'?'ISOLAR':c.id==='ground'?'ATERRAR':c.id==='boot'?'INICIAR':c.id==='restart'?'REFRIGERAR':c.id==='balance'?'VALIDAR':'ATIVAR',0,46,11,p.gold);}
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}ctx.restore();
    }
    function overlay(){if(m.done){plate(100,225,440,96,p.ink);text(entry.key==='backbone-prisms'?'NÚCLEO RESTAURADO':'SERVIDORES RESTAURADOS',320,266,23,p.green);text('SISTEMAS ESTÁVEIS · REPARO CONFIRMADO',320,295,12,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.serversRepairArt=Object.freeze({create});
})();
