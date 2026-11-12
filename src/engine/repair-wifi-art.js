/* Bancadas Wi-Fi originais em pixel art; o desenho não altera as regras. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#090e22',dark:'#1c2947',metal:'#536c91',rim:'#a8bdd7',blue:'#82adff',cyan:'#7de5e3',green:'#96e9af',gold:'#f1c77f',red:'#ef909f'};
    const colors=[p.cyan,p.gold,'#c4a3f5'];let state;
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(points,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...points[0]);for(const a of points.slice(1))ctx.lineTo(...a);ctx.stroke();};
    const poly=(points,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...points[0]);for(const a of points.slice(1))ctx.lineTo(...a);ctx.closePath();ctx.fill();};
    const arc=(x,y,r,a,b,c,w=3)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.arc(x,y,r,a,b);ctx.stroke();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();
    const t=()=>motion()?state.t:0;
    function shell(title,subtitle){rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,48,'#111d38');text(title,320,42,20,p.cyan);text(subtitle,320,61,12);for(const x of [25,615])for(const y of [27,530])screw(x,y);for(let i=0;i<23;i++)rect(32+i*26,525,14,3,p.ink);}
    function antenna(){
      shell('ALINHAMENTO DA ANTENA','ARRASTE O PRATO · DIRECIONE O FEIXE AO RECEPTOR');
      for(let i=0;i<35;i++)rect(35+(i*137)%570,85+(i*79)%330,2,2,'#486081');
      for(let i=0;i<10;i++){const x=30+i*62,h=25+(i*37)%95;rect(x,449-h,47,h,'#101d35');for(let j=0;j<4;j++)rect(x+7+j*9,457-h,4,6,'#496387');}
      const angle=(state.drag?.id==='antenna'?state.drag.value:m.direction)*Math.PI/16,goal=m.target*Math.PI/16,rx=235+270*Math.sin(goal),ry=300-220*Math.cos(goal);
      line([[235,300],[rx,ry]],'#4b5e71',2);plate(rx-31,ry-29,62,58);rect(rx-21,ry-19,42,31,p.ink);text('R',rx,ry+3,21,p.cyan);led(rx,ry+20,m.locked);text('RECEPTOR',rx,ry+48,12,p.gold);
      ctx.save();ctx.beginPath();ctx.rect(25,75,590,377);ctx.clip();
      const heading=angle-Math.PI/2;
      poly([[235,300],[235+365*Math.cos(heading-.15),300+365*Math.sin(heading-.15)],[235+365*Math.cos(heading+.15),300+365*Math.sin(heading+.15)]],m.direction===m.target?'#96e9af18':'#82adff12');
      for(let i=0;i<4;i++){const r=100+(i*56+t()*48)%225;arc(235,300,r,heading-.22,heading+.22,m.locked?p.green:p.cyan,3);}
      ctx.restore();
      plate(184,422,102,41);rect(217,310,36,115,p.metal);rect(226,322,10,98,p.rim);
      text('DIREÇÃO '+Math.round(m.direction*11.25)+'°',190,494,16,p.gold);text('RECEPÇÃO '+Math.round(m.stable*100)+'%',390,494,13,m.locked?p.green:p.rim);
    }
    function spectrum(){
      shell('LIMPEZA DE INTERFERÊNCIAS','PRESERVE O SINAL VERDE · FILTRE OS TRÊS PICOS VERMELHOS');
      plate(43,95,554,293,'#0c2030');for(let y=120;y<=360;y+=40)line([[56,y],[584,y]],'#274655',1);
      for(let i=0;i<5;i++){
        const x=100+i*110,isNoise=m.noise.includes(i),filtered=m.filters.includes(i),age=Math.max(0,m.time-m.filteredAt[i]),fade=filtered?Math.max(.04,1-age/.65):1;
        const height=i===m.channel?135:isNoise?(152+Math.sin(t()*7+i)*18)*fade:18+Math.sin(t()*3+i)*6;
        poly([[x-36,357],[x-25,357-height*.18],[x-12,357-height*.72],[x,357-height],[x+12,357-height*.72],[x+25,357-height*.18],[x+36,357]],i===m.channel?'#96e9af33':isNoise?'#ef909f33':'#536c9122');
        const points=[];for(let j=-40;j<=40;j+=4){const h=height*Math.exp(-j*j/230),wobble=Math.sin(j*.8+t()*10+i)*(isNoise?8*fade:3);points.push([x+j,354-h+wobble]);}line(points,i===m.channel?p.green:isNoise?p.red:p.metal,3);
        text('FAIXA '+(i+1),x,409,12,i===m.channel?p.green:p.rim);text(i===m.channel?'ÚTIL':isNoise?(filtered?'FILTRADO':'RUÍDO'):'LIVRE',x,115,11,i===m.channel?p.green:isNoise?p.red:p.rim);
      }
      if(m.cleaning){rect(85,370,470*m.stable,5,p.green);text('ESTABILIZANDO',320,141,12,p.green);}
    }
    function repeaters(){
      shell('POSICIONAMENTO DE REPETIDORES','LIGUE A ORIGEM ÀS TRÊS ZONAS · EVITE A BASE OBSTRUÍDA');
      plate(35,82,570,333,'#172e40');const n=m.network();
      ctx.save();ctx.beginPath();ctx.rect(40,87,560,323);ctx.clip();
      for(let x=50;x<600;x+=25)line([[x,90],[x,408]],'#284456',1);for(let y=90;y<410;y+=25)line([[40,y],[600,y]],'#284456',1);
      for(const i of n.active){const a=m.pads[m.slots[i]];ctx.fillStyle=colors[i]+'0d';ctx.beginPath();ctx.arc(a.x,a.y,m.radius,0,Math.PI*2);ctx.fill();arc(a.x,a.y,m.radius,0,Math.PI*2,colors[i]+'88',2);arc(a.x,a.y,(t()*45+i*47)%m.radius,0,Math.PI*2,colors[i]+'66',2);}
      m.slots.forEach((v,i)=>{if(v<0)return;const a=m.pads[v];if(Math.hypot(a.x-m.base.x,a.y-m.base.y)<=m.reach)line([[m.base.x,m.base.y],[a.x,a.y]],n.active.includes(i)?p.cyan:p.red,3);for(let j=0;j<i;j++){if(m.slots[j]<0)return;const b=m.pads[m.slots[j]];if(Math.hypot(a.x-b.x,a.y-b.y)<=m.reach)line([[a.x,a.y],[b.x,b.y]],n.active.includes(i)&&n.active.includes(j)?p.cyan:p.red,3);}});
      // A wall identifies the unavailable mount without hiding other coverage.
      rect(326,290,68,75,'#343641');for(let y=296;y<360;y+=14){line([[328,y],[392,y]],'#63616b',2);for(let x=334+(y%28?0:14);x<390;x+=28)line([[x,y],[x,y+14]],'#63616b',2);}
      m.zones.forEach((z,i)=>{rect(z.x-14,z.y-14,28,28,n.covered[i]?'#2c6954':'#694253');text(String.fromCharCode(65+i),z.x,z.y+5,18,n.covered[i]?p.green:p.red);led(z.x,z.y+23,n.covered[i]);});
      rect(45,145,20,55,p.metal);line([[55,145],[55,120]],p.rim,5);text('ORIGEM',80,108,11,p.cyan);
      ctx.restore();text('ZONAS '+n.covered.filter(Boolean).length+'/3',150,440,15,p.green);text(m.testing?'CONFIRMANDO ENLACES…':'ARRASTE OS REPETIDORES',403,440,13,p.gold);
      if(m.testing)rect(80,405,480*m.stable,5,p.green);
    }
    function transmitter(){
      shell('CALIBRAÇÃO DO TRANSMISSOR','GIRE OS CONTROLES · SINAL ESTÁVEL · TEMPERATURA ATÉ 60 °C');
      plate(45,83,550,363,'#263247');for(let i=0;i<9;i++)rect(66+i*56,92,28,4,p.ink);
      plate(75,116,294,125,p.ink);text('FORÇA DO SINAL '+Math.round(m.signal)+'%',222,137,14,m.signal>=90?p.green:p.gold);
      const wave=[];for(let x=90;x<=354;x+=3)wave.push([x,185+Math.sin((x-90)*.13-t()*9)*(m.signal/100)*28]);line(wave,m.signal>=90?p.green:p.cyan,3);
      for(let i=0;i<5;i++)rect(285+i*13,222-i*6,8,8+i*6,m.signal>i*20?p.green:p.metal);
      plate(390,116,180,125,p.ink);rect(416,148,16,72,p.metal);rect(420,220-Math.min(70,m.temperature*.7),8,Math.min(70,m.temperature*.7),m.temperature>60?p.red:p.green);for(let i=0;i<4;i++)rect(437,153+i*20,9,2,p.rim);
      text(Math.round(m.temperature)+' °C',502,169,20,m.temperature>60?p.red:p.green);text(m.temperature>60?'QUENTE':'SEGURA',502,194,12,m.temperature>60?p.red:p.green);
      ctx.save();ctx.translate(505,220);ctx.rotate(t()*(m.cooling+1));for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);rect(4,-4,12,7,p.metal);}rect(-3,-3,6,6,p.rim);ctx.restore();
      text('POTÊNCIA · ALVO '+m.required,170,265,14,p.gold);text('VENTILAÇÃO',430,265,14,p.cyan);
      text('ESTABILIDADE '+Math.round(m.stable*100)+'%',240,491,16,m.running?p.green:p.rim);
      if(m.running)rect(75,459,350*m.stable,7,p.green);
    }
    function background(s){state=s;({'dish-gimbal':antenna,'spectrum-tuner':spectrum,'repeater-mast':repeaters,'rf-compressor':transmitter})[entry.key]();}
    function control(c,s){ctx.save();ctx.translate(s.x,s.y);
      if(c.id==='antenna'){
        const v=s.preview??c.value;ctx.save();ctx.rotate(v*Math.PI/16);
        // Riveted dish, curved stepped reflector, receiver feed and counterweight.
        poly([[-103,-47],[-92,-65],[-70,-80],[-42,-89],[0,-94],[42,-89],[70,-80],[92,-65],[103,-47],[89,-29],[64,-14],[30,-4],[-30,-4],[-64,-14],[-89,-29]],p.rim);
        poly([[-88,-48],[-65,-69],[-30,-81],[30,-81],[65,-69],[88,-48],[56,-29],[0,-16],[-56,-29]],p.metal);
        for(let x=-64;x<=64;x+=16)line([[x,-68],[x*.7,-27]],'#829bb9',2);line([[-76,-46],[76,-46]],p.rim,2);
        line([[-62,-29],[0,-139],[62,-29]],p.rim,5);rect(-11,-147,22,24,p.gold);rect(-5,-153,10,7,p.cyan);rect(-22,-3,44,42,p.metal);screw(0,12);rect(-12,39,24,20,p.ink);ctx.restore();
        arc(0,0,121,0,Math.PI*2,p.metal,2);for(let i=0;i<16;i++){const a=i*Math.PI/8;line([[Math.sin(a)*116,-Math.cos(a)*116],[Math.sin(a)*124,-Math.cos(a)*124]],i===m.target/2?p.gold:p.metal,3);}
      }else if(c.id.startsWith('band')){
        // Frequency destinations stay transparent so the animated spectrum remains visible.
      }else if(c.id.startsWith('filter')){
        const i=+c.id.at(-1),placed=m.filters[i]>=0,h=placed?172:58;
        rect(-38,-h/2,76,h,colors[i]);rect(-32,-h/2+5,64,h-10,placed?'#0b1a2677':p.dark);
        for(let k=0;k<6;k++)rect(-24+k*9,-h/2+9,4,8,p.gold);text('F'+(i+1),0,6,18,colors[i]);text(placed?'REJEIÇÃO':'FILTRO',0,h/2+18,11,colors[i]);
        if(placed){const age=m.time-m.filteredAt[m.filters[i]],y=-h/2+(motion()?Math.min(1,age/.65):1)*h;line([[-30,y],[30,y]],p.green,3);}
      }else if(c.id.startsWith('pad')){
        const i=+c.id.at(-1);ctx.strokeStyle=i===m.blocked?p.red:p.metal;ctx.lineWidth=3;ctx.setLineDash([5,5]);ctx.strokeRect(-33,-28,66,56);ctx.setLineDash([]);text(i===m.blocked?'×':i+1,0,7,20,i===m.blocked?p.red:p.rim);
      }else if(c.id.startsWith('repeater')){
        const i=+c.id.at(-1),n=m.network();plate(-29,-19,58,45);line([[-20,-18],[-25,-43]],p.rim,5);line([[20,-18],[25,-43]],p.rim,5);rect(-20,-9,40,9,p.ink);for(let j=0;j<3;j++)rect(-17+j*13,-6,7,3,colors[i]);led(0,15,n.active.includes(i));text('R'+(i+1),0,43,12,colors[i]);
      }else if(c.id==='gain'||c.id==='cooling'){
        const v=s.preview??c.value,r=58,ang=(value)=>(-135+value/c.max*270)*Math.PI/180;
        plate(-73,-72,146,144);for(let i=0;i<=c.max;i++){const a=ang(i);line([[Math.sin(a)*(r-3),-Math.cos(a)*(r-3)],[Math.sin(a)*(r+5),-Math.cos(a)*(r+5)]],c.id==='gain'&&i===m.required?p.gold:p.rim,4);}
        arc(0,0,43,0,Math.PI*2,p.ink,17);ctx.save();ctx.rotate(ang(v));poly([[-22,-25],[22,-25],[31,-8],[31,16],[16,31],[-16,31],[-31,16],[-31,-8]],p.metal);rect(-4,-28,8,29,c.id==='gain'?p.gold:p.cyan);rect(-8,-7,16,14,p.rim);ctx.restore();text('NÍVEL '+v,0,68,12,c.id==='gain'?p.gold:p.cyan);
      }else{
        plate(-37,-25,74,50);rect(-23,-13,46,26,c.on?p.green:p.gold);text(c.on?'✓':'▶',0,7,18,p.ink);text(c.id==='lock'?'TRAVAR':c.id==='connect'?'CONECTAR':c.id==='transmit'?'TRANSMITIR':'CONFIRMAR',0,44,11,p.gold);
      }
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}ctx.restore();
    }
    function overlay(){if(m.done){plate(110,225,420,91,p.ink);text('ENLACE WI-FI RESTAURADO',320,266,23,p.green);text('TRANSMISSÃO CONFIRMADA',320,294,14,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.wifiRepairArt=Object.freeze({create});
})();
