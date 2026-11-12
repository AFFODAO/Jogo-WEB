/* Quatro bancadas de cabeamento em pixel art, sem mutações nas regras. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#120f20',dark:'#30283d',metal:'#79697f',rim:'#c6b6c6',gold:'#f0c47a',green:'#91e8ad',cyan:'#7adfe4',red:'#f18d9e'};
    const colors=['#65c58b','#65c58b','#ef9a56','#7aa8ed','#7aa8ed','#ef9a56','#ae8465','#ae8465'];
    const striped=[true,false,true,false,true,false,true,false],codes=['B/VD','VD','B/LR','AZ','B/AZ','LR','B/MR','MR'];let state;
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(pts,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.stroke();};
    const poly=(pts,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.closePath();ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const led=(x,y,v)=>{rect(x-7,y-5,14,10,p.ink);rect(x-4,y-2,8,4,v===null?p.metal:v?p.green:p.red);};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();
    const t=()=>motion()?state.t:0;
    function shell(title,subtitle){rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,48,'#201b30');text(title,320,42,20,p.gold);text(subtitle,320,61,12);for(const x of [25,615])for(const y of [27,530])screw(x,y);for(let i=0;i<23;i++)rect(32+i*26,525,14,3,p.ink);}
    function wire(a,b,i,width=7){
      const trace=()=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x,a.y-70,b.x,b.y+70,b.x,b.y);};
      trace();ctx.strokeStyle=p.ink;ctx.lineWidth=width+4;ctx.stroke();trace();ctx.strokeStyle=striped[i]?'#f1e7db':colors[i];ctx.lineWidth=width;ctx.stroke();
      if(striped[i]){trace();ctx.strokeStyle=colors[i];ctx.lineWidth=width;ctx.setLineDash([9,9]);ctx.stroke();ctx.setLineDash([]);}
    }
    function crimp(){
      shell('CRIMPAGEM RJ45 · '+m.standard,'CONTATOS À VISTA · PINO 1 À ESQUERDA · SIGA AS CORES');
      plate(35,151,570,143,'#4a4458');rect(42,161,556,117,'#302f42');
      m.expected.forEach((color,i)=>{const x=75+i*70;rect(x-22,93,44,28,striped[color]?'#f1e7db':colors[color]);if(striped[color])for(let j=0;j<4;j++)rect(x-21+j*12,94,6,26,colors[color]);text(codes[color],x,139,12);rect(x-13,169,26,82,p.ink);rect(x-8,174,16,52,p.gold);text(i+1,x,280,15,p.gold);});
      text('B = BRANCO · VD = VERDE · LR = LARANJA · AZ = AZUL · MR = MARROM',320,317,11);
      namesControls('wire').forEach(c=>{const i=+c.id.at(-1);wire({x:290+(i-3.5)*9,y:510},state.position(c),i);});
      rect(255,480,85,43,'#48465c');rect(261,487,73,36,p.metal);for(let i=0;i<6;i++)rect(267+i*12,492,5,30,'#a392a2');
      if(m.crimping){const q=Math.sin(Math.min(1,m.closure)*Math.PI/2);rect(43,152+q*15,554,15,p.metal);for(let i=0;i<8;i++){rect(67+i*70,182,16,36+q*13,p.gold);if(m.closure<.7){rect(70+i*70,240+(i%2)*5,6,6,p.cyan);}}text('PRENSANDO CONTATOS…',225,455,14,p.green);}
    }
    function namesControls(prefix){return m.controls().filter(c=>c.id.startsWith(prefix));}
    function splice(){
      shell('EMENDA DE CABO','RETIRE AS CAPAS · COMBINE AS CORES · RESTAURE O ISOLAMENTO');
      for(let i=0;i<9;i++)rect(40+i*65,92,30,3,'#66566d');
      const complete=m.stripped.every(v=>v===1);
      if(m.joining){
        const q=Math.min(1,m.restoration*2);for(let i=0;i<4;i++){const y=235+(i-1.5)*13;line([[30,235],[140,y],[500,y],[610,235]],colors[[1,5,3,7][i]],7);if(q<1)rect(315,229+(i-1.5)*13,9,8,p.cyan);}
        rect(25,205,140,60,'#655769');rect(475,205,140,60,'#655769');const cover=Math.max(0,(m.restoration-.35)/.65);rect(320-cover*155,193,cover*310,84,p.ink);if(cover>0){rect(325-cover*155,199,Math.max(0,cover*310-10),72,p.metal);for(let i=0;i<Math.floor(cover*14);i++)rect(320-cover*155+i*22,202,5,66,'#9b8698');}text(m.restoration<.4?'UNINDO CONDUTORES…':'RESTAURANDO ISOLAMENTO…',270,390,16,p.green);return;
      }
      if(!complete){
        for(let side=0;side<2;side++){
          const x=side?450:190,progress=m.stripped[side];
          for(let i=0;i<4;i++){const y=235+(i-1.5)*12;line([[side?610:30,y],[x+(side?-1:1)*progress*75,y]],colors[[1,5,3,7][i]],7);}
          rect(side?x+progress*75:25,200,side?165-progress*75:165-progress*75,70,'#655769');rect(side?x+progress*75:25,205,side?165-progress*75:165-progress*75,7,p.rim);
          if(progress>0&&progress<1){const peelX=x+(side?1:-1)*progress*90;poly([[peelX,207],[peelX+23,224],[peelX+12,257],[peelX-12,244]],p.metal);text('RETIRANDO CAPA',x,310,12,p.gold);}
          text(side?'PONTA DIREITA':'PONTA ESQUERDA',x,150,14,p.gold);
        }
      }else{
        for(let i=0;i<4;i++){
          const y=140+i*100,originY=140+m.order.indexOf(i)*100,c=m.controls().find(c=>c.id==='conductor'+i),pos=state.position(c),color=colors[[1,5,3,7][i]];
          line([[40,originY],[100,originY],[pos.x,pos.y]],color,7);line([[440,y],[590,y]],color,7);
          if(m.joins[i]){line([[pos.x-10,pos.y],[pos.x+12,pos.y]],p.gold,11);led(555,y-15,true);}
        }
      }
    }
    function fiber(){
      shell('ALINHAMENTO DE FIBRA','MOVA OS NÚCLEOS NA VERTICAL · TRAVE COM 100% DE SINAL');
      plate(45,92,550,336,'#29333e');const positions=[...m.positions];if(state.drag?.id.startsWith('core'))positions[+state.drag.id.at(-1)]=state.drag.value;
      const ys=positions.map(v=>170+v*24),signal=Math.max(0,100-(Math.abs(positions[0]-4)+Math.abs(positions[1]-4))*12.5);
      for(let i=0;i<2;i++){const x=200+i*240;rect(x-12,129,24,279,p.ink);rect(x-5,135,10,267,p.metal);for(let j=0;j<9;j++){rect(x-50,170+j*24,15,3,j===4?p.gold:p.rim);text(j+1,x+61,174+j*24,10,j===4?p.gold:p.rim);}screw(x,126);screw(x,411);}
      ctx.setLineDash([6,7]);line([[70,266],[570,266]],p.gold,2);ctx.setLineDash([]);
      line([[65,ys[0]],[200,ys[0]]],p.cyan,9);line([[200,ys[0]],[440,ys[1]]],signal===100?p.green:'#79bad4',Math.max(2,signal/16));line([[440,ys[1]],[575,ys[1]]],signal===100?p.green:'#446079',Math.max(2,signal/13));
      if(signal<100)for(let i=0;i<3;i++)line([[220,ys[0]],[410,ys[0]+(i-1)*22]],'#7adfe422',2);
      for(let i=0;i<4;i++){const f=(t()*.5+i*.25)%1;rect(220+f*200,ys[0]+(ys[1]-ys[0])*f-3,7,6,signal===100?p.green:p.cyan);}
      text('SINAL ÓPTICO '+Math.round(signal)+'%',250,470,21,signal===100?p.green:p.gold);text('ESQUERDA',200,114,13);text('DIREITA',440,114,13);
    }
    function tester(){
      shell('TESTE DE CABEAMENTO','CONECTE · DIAGNOSTIQUE · REPARE · TESTE NOVAMENTE');
      plate(38,89,564,148,'#3c3447');rect(50,101,540,118,p.ink);text(m.scanning?'MEDINDO CONTINUIDADE…':m.diagnosed?'DIAGNÓSTICO DOS CONDUTORES':'AGUARDANDO PONTAS DE TESTE',320,126,14,p.gold);
      for(let i=0;i<8;i++){const x=75+i*70;led(x,178,m.leds[i]);text(i+1,x,153,14);text(m.leds[i]===null?'—':m.leds[i]?'OK':'FALHA',x,205,11,m.leds[i]===false?p.red:p.green);}
      for(let i=0;i<2;i++){const control=m.controls().find(c=>c.id==='probe'+i);wire({x:130+i*380,y:230},state.position(control),i?5:3,6);}
      plate(35,310,570,103,'#3c3447');
      for(let i=0;i<8;i++){const x=75+i*70,broken=m.diagnosed&&m.faults.includes(i)&&!m.repaired[i];line([[x,320],[x,349]],p.gold,7);line([[x,broken?379:350],[x,403]],p.gold,7);if(broken)line([[x-10,356],[x+9,373]],p.red,3);text(i+1,x,435,12,p.gold);}
      if(m.scanning){const x=75+Math.min(7,Math.floor(m.scanProgress*8))*70;rect(x-14,215,28,4,p.cyan);rect(75,286,490*m.scanProgress,5,p.cyan);}
      text(m.diagnosed?'REPARE SOMENTE OS PONTOS VERMELHOS':'O TESTE REVELARÁ AS RUPTURAS',320,457,11,p.gold);
    }
    function background(s){state=s;({'rj45-comb':crimp,'cable-reel':splice,'fiber-splice':fiber,'continuity-trace':tester})[entry.key]();}
    function control(c,s){ctx.save();ctx.translate(s.x,s.y);
      if(c.id.startsWith('pin')){const i=+c.id.at(-1);rect(-15,-31,30,62,p.rim);rect(-10,-26,20,52,p.ink);rect(-5,-23,10,20,p.gold);if(m.pins[i]<0)text(i+1,0,18,14,p.gold);}
      else if(c.id.startsWith('wire')){const i=+c.id.at(-1);rect(-9,-21,18,42,striped[i]?'#f1e7db':colors[i]);if(striped[i])for(let j=0;j<3;j++)rect(-9,-20+j*14,18,7,colors[i]);rect(-6,-31,12,12,p.gold);text(codes[i],0,48,11,colors[i]);}
      else if(c.id==='crimp'){
        const q=m.crimping?m.closure:(s.preview??c.value)/3;rect(-28,-34,56,33,p.metal);rect(-15,-29,30,19,p.ink);screw(0,-6);ctx.save();ctx.rotate(-.45+q*.32);rect(-27,4,15,44,p.red);rect(-25,9,5,30,'#cc667e');ctx.restore();ctx.save();ctx.rotate(.45-q*.32);rect(12,4,15,44,p.red);ctx.restore();text('APERTAR',0,61,11,p.gold);
      }else if(/^end[01]$/.test(c.id)){const i=+c.id.at(-1);ctx.strokeStyle=m.stripped[i]===1?p.green:p.gold;ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.strokeRect(-58,-45,116,90);ctx.setLineDash([]);}
      else if(c.id==='stripper'){rect(-25,-22,50,28,p.metal);rect(-14,-17,28,18,p.ink);rect(-20,7,12,32,p.gold);rect(8,7,12,32,p.gold);screw(0,1);text('DESCAPAR',0,58,11,p.gold);}
      else if(c.id.startsWith('conductor')){if(!m.joining){const i=+c.id.at(-1);rect(-17,-12,34,24,colors[[1,5,3,7][i]]);rect(10,-8,17,16,p.gold);text(['VERDE','LARANJA','AZUL','MARROM'][i],0,31,11,colors[[1,5,3,7][i]]);}}
      else if(c.id.startsWith('contact')){if(!m.joining){const i=+c.id.at(-1);rect(-25,-19,50,38,p.ink);rect(-19,-13,38,26,colors[[1,5,3,7][i]]);rect(-7,-10,14,20,p.gold);}}
      else if(c.id.startsWith('core')){plate(-48,-28,96,56,'#435266');rect(-33,-17,66,34,p.ink);rect(-28,-9,56,18,p.rim);rect(-35,-4,70,8,p.cyan);screw(-39,20);screw(39,-20);text('NÚCLEO '+(1+(+c.id.at(-1))),0,49,11,p.cyan);}
      else if(c.id.startsWith('endpoint')){rect(-29,-17,58,34,p.rim);rect(-24,-12,48,24,p.ink);for(let i=0;i<8;i++)rect(-20+i*5,-9,3,14,p.gold);text(c.id.endsWith('0')?'ORIGEM':'RETORNO',0,35,11);}
      else if(c.id.startsWith('probe')){const i=+c.id.at(-1);rect(-24,-17,48,34,i?p.gold:p.cyan);rect(-17,-12,34,24,p.ink);for(let j=0;j<8;j++)rect(-20+j*5,-25,3,9,p.gold);text(i?'RETORNO':'ORIGEM',0,40,11,i?p.gold:p.cyan);}
      else if(c.id.startsWith('trace')){const i=+c.id.at(-1),broken=m.diagnosed&&m.faults.includes(i)&&!m.repaired[i];rect(-16,-10,32,20,broken?'#6d3545':p.ink);if(m.repaired[i])line([[-13,0],[13,0]],p.gold,7);else if(broken)text('×',0,7,20,p.red);}
      else if(c.id==='repair'){rect(-23,-21,46,28,p.metal);rect(-14,-15,28,16,p.gold);rect(-17,8,10,25,p.cyan);rect(7,8,10,25,p.cyan);text('EMENDAR',0,55,11,p.cyan);}
      else{plate(-36,-25,72,50);rect(-22,-13,44,26,c.on?p.green:p.gold);text(c.on?'✓':'▶',0,7,18,p.ink);text(c.id==='join'?'PRENSAR':c.id==='lock'?'TRAVAR':'TESTAR',0,46,11,p.gold);}
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}ctx.restore();
    }
    function overlay(){if(m.done){plate(110,225,420,91,p.ink);text('CABEAMENTO RESTAURADO',320,266,23,p.green);text('ENLACE CONFIRMADO',320,294,14,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.cablingRepairArt=Object.freeze({create});
})();
