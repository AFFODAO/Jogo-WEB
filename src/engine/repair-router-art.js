/* Arte original em pixels: quatro bancadas com sinais, peças e percursos animados. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#090f1e',dark:'#17293d',metal:'#556e87',rim:'#a1b8c9',gold:'#f3c47f',green:'#8de4a3',cyan:'#7cdbec',red:'#f18c94'};
    const colors=[p.cyan,p.gold,'#b6a0ed'];
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(pts,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...pts[0]);for(const point of pts.slice(1))ctx.lineTo(...point);ctx.stroke();};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const chip=(x,y,w,h,label)=>{for(let i=0;i<w/12;i++){rect(x+i*12,y-7,5,7,p.gold);rect(x+i*12,y+h,5,7,p.gold);}rect(x,y,w,h,p.ink);rect(x+6,y+6,w-12,h-12,'#2b3a50');if(label)text(label,x+w/2,y+h/2+5,13);};
    const port=(x,y,color=p.gold)=>{rect(x-25,y-19,50,38,p.rim);rect(x-21,y-15,42,28,p.ink);for(let i=0;i<8;i++)rect(x-20+i*5,y-15,3,12,color);rect(x-9,y+13,18,5,p.ink);};
    const cable=(a,b,c)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x-50,a.y+80,b.x+40,b.y+80,b.x,b.y);ctx.lineWidth=11;ctx.strokeStyle=p.ink;ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle=c;ctx.stroke();};
    const packet=(x,y,c)=>{rect(x-13,y-10,26,20,p.ink);rect(x-10,y-7,20,14,c);rect(x-6,y-3,7,3,p.ink);rect(x+4,y+2,3,3,p.ink);};
    function travel(points,t){const n=Math.min(.99999,Math.max(0,t))*(points.length-1),i=Math.floor(n),f=n-i;return [points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f];}
    const motion=()=>!ByteRunner.repairScene.reducedMotion();
    let state;
    function shell(title,subtitle){
      rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,49,'#101d30');text(title,320,42,20,p.cyan);text(subtitle,320,61,12);
      for(const x of [25,615])for(const y of [27,530])screw(x,y);
      for(let i=0;i<22;i++){rect(35+i*26,521,15,3,p.ink);if(i%3===0)rect(35+i*26,525,15,3,p.ink);}
    }
    function topology(){
      shell('RECONSTRUÇÃO DE ROTAS','A → F · ARRASTE AS CONEXÕES ENTRE ROTEADORES');
      ctx.setLineDash([7,8]);
      m.allowed.forEach((list,i)=>list.forEach(j=>line([m.nodes[i],m.nodes[j]],i===1&&j===4?p.red:'#35475b',3)));
      ctx.setLineDash([]);text('ROMPIDO',356,265,11,p.red);
      m.links.forEach((j,i)=>{if(j>=0){line([m.nodes[i],m.nodes[j]],p.ink,12);line([m.nodes[i],m.nodes[j]],p.cyan,5);}});
      if(state.drag){const c=m.controls().find(c=>c.id===state.drag.id);if(c?.id.startsWith('edge')){const i=+c.id.at(-1),b=state.position(c);line([m.nodes[i],[b.x,b.y]],p.gold,5);}}
      text('ORIGEM',105,100,12,p.gold);text('DESTINO',535,300,12,p.green);
      text('CONFIRMAÇÕES '+m.delivered+'/3',210,485,15,p.green);
      if(m.flight){const [x,y]=travel(m.route.map(i=>m.nodes[i]),m.flight.progress);packet(x,y,p.gold);}
      for(let i=0;i<6;i++)led(m.nodes[i][0]+32,m.nodes[i][1]-25,m.route.includes(i)&&!!m.flight,p.cyan);
    }
    function interfaces(){
      shell('REPARO DE INTERFACES','PAINEL TRASEIRO · RETIRE, SUBSTITUA, RECONECTE');
      plate(185,88,400,306,'#203444');
      for(let i=0;i<2;i++){
        const x=260+i*235;rect(x-50,118,100,100,p.ink);text(i?'INTERFACE WAN':'INTERFACE LAN',x,108,12,colors[i]);
        for(let j=0;j<8;j++)rect(x-38+j*11,205,5,14,p.gold);
        screw(x-45,122);screw(x+45,212);led(x+44,240,m.charge[i]===1);text(m.charge[i]===1?'PORTA ATIVA':'SEM ENLACE',x,244,11,m.charge[i]===1?p.green:p.rim);
        if(m.seated[i]){const c=m.controls().find(c=>c.id==='cable'+i),b=state.position(c);cable({x:x-35,y:515},b,colors[i]);}
        if(m.charge[i]>0){rect(x-40,395,80*m.charge[i],5,p.green);if(m.charge[i]<1)text('NEGOCIANDO',x,415,11,p.green);}
      }
      for(let i=0;i<5;i++)rect(365,130+i*15,40,5,p.ink);
      text('ISOLAMENTO',95,190,11,m.isolated?p.green:p.gold);
      if(m.removed.some(Boolean)){rect(63,417,74,47,'#5b3544');text('AVARIA',100,444,11,p.red);}
    }
    function gateway(){
      shell('RESTAURAÇÃO DO GATEWAY','DESTINO DO TESTE: '+['FILIAL','CENTRAL','NUVEM'][m.targets[Math.min(m.index,2)]]+' · '+Math.min(m.index+1,3)+'/3');
      plate(40,88,560,245,'#132a37');
      line([[65,200],[200,200]],p.metal,18);
      for(let i=0;i<3;i++){
        const y=125+i*75;line([[200,200],[290,y],[405,y],[470,200]],'#33495e',13);
        text(['FILIAL','CENTRAL','NUVEM'][i],348,y-13,12,colors[i]);led(416,y,m.time-m.flash[i]<.8,colors[i]);
      }
      line([[200,200],[290,125+m.selector*75],[405,125+m.selector*75],[470,200]],colors[m.selector],5);
      line(m.bridge?[[470,200],[560,200]]:[[470,200],[470,310],[105,310]],m.bridge?p.green:p.red,7);
      rect(536,173,43,55,p.ink);text('SAÍDA',557,245,12,p.green);text('RETORNO LOCAL',180,305,11,p.red);
      text('VOLANTE',145,350,14,p.gold);text('PONTE',330,350,14,p.gold);text('TESTE',525,350,14,p.gold);
      if(m.flight){const f=m.flight,points=[[65,200],[200,200],[290,125+f.lane*75],[405,125+f.lane*75],[470,200],...(f.external?[[560,200]]:[[470,310],[105,310]])];const [x,y]=travel(points,f.progress);packet(x,y,colors[m.targets[m.index]]);}
    }
    function core(){
      shell('NÚCLEO DE ROTEAMENTO','ALINHE AS MARCAS · RECONECTE AS VIAS · ATIVE A CPU');
      plate(45,82,550,430,'#183d3c');
      for(let i=0;i<15;i++){const x=65+i*36;line([[x,97],[x,110+i%3*12],[575-i*12,110+i%3*12]],'#2a5b54',2);}
      for(let i=0;i<3;i++){
        const x=140+i*180;line([[x,210],[x,273]],p.gold,7);line([[x,317],[x,350],[320,350],[320,370]],m.links[i]?p.gold:p.metal,6);
        const angle=m.target[i]*Math.PI/2;line([[x+Math.sin(angle)*43,170-Math.cos(angle)*43],[x+Math.sin(angle)*53,170-Math.cos(angle)*53]],p.gold,9);
        text('MARCA '+(m.target[i]+1),x,112,12,p.gold);
        if(m.booting){const [px,py]=travel([[x,210],[x,295],[x,350],[320,350],[320,390]],m.activation);packet(px,py,colors[i]);}
      }
      for(const [x,y] of [[65,100],[575,100],[65,495],[575,495]])screw(x,y);
      for(let i=0;i<3;i++)chip(60+i*32,370,22,42);
      for(let i=0;i<5;i++){rect(500+i*14,390,8,23,p.metal);rect(500+i*14,390,8,4,p.rim);}
      if(m.booting){rect(240,450,160*m.activation,8,p.green);text('INICIALIZANDO',320,440,12,p.green);}
    }
    function background(s){state=s;({ 'route-rail':topology,'interface-crimp':interfaces,'gateway-periscope':gateway,'prefix-cams':core})[entry.key]();}
    function control(c,s){
      const {x,y}=s;ctx.save();ctx.translate(x,y);
      if(c.id.startsWith('node')){
        plate(-43,-28,86,56);text(String.fromCharCode(65+(+c.id.at(-1))),0,-3,20,p.cyan);
        for(let i=0;i<4;i++)rect(-30+i*17,10,11,8,p.ink);screw(-34,-18);screw(34,19);
      }else if(c.id.startsWith('edge')){
        rect(-17,-14,34,24,p.ink);rect(-12,-10,24,16,p.gold);rect(-7,-5,14,6,p.metal);text('CONECTAR',0,29,11,p.gold);
      }else if(c.id==='tray'){
        plate(-43,-28,86,56,'#292537');rect(-34,-20,68,35,p.ink);text('RETIRAR',0,38,12,p.red);
      }else if(c.id.startsWith('bay')){
        rect(-44,-35,88,70,p.ink);rect(-35,-25,70,50,'#2f4449');for(let i=0;i<8;i++)rect(-34+i*9,24,4,12,p.gold);
      }else if(c.id.startsWith('port')){port(0,0);}
      else if(c.id.startsWith('damaged')||c.id.startsWith('replacement')){
        const i=+c.id.at(-1),damaged=c.id.startsWith('damaged'),age=m.time-m.inserted[i],dy=!damaged&&m.seated[i]&&motion()?Math.max(0,1-age/.45)*30:0;
        ctx.translate(0,dy);plate(-43,-34,86,68,damaged?'#623446':'#215854');port(0,-2,damaged?p.red:p.gold);screw(-34,-23);screw(34,22);text(damaged?'AVARIA':'MÓDULO '+(i?'WAN':'LAN'),0,47,11,damaged?p.red:p.green);
        if(damaged)line([[-24,-18],[-8,-6],[-20,4],[5,16]],p.red,3);
      }else if(c.id.startsWith('cable')){
        const i=+c.id.at(-1);rect(-23,-24,46,45,p.rim);rect(-17,-17,34,28,colors[i]);for(let j=0;j<8;j++)rect(-20+j*5,-24,3,13,p.gold);rect(-9,21,18,13,p.metal);text(i?'WAN':'LAN',0,5,12,p.ink);
      }else if(c.id==='selector'){
        const v=s.preview??c.value;plate(-43,-40,86,80);for(let i=0;i<3;i++)text(i+1,Math.sin((i-1)*1.2)*34,-Math.cos((i-1)*1.2)*30,12,colors[i]);
        ctx.save();ctx.rotate((v-1)*1.2);rect(-15,-15,30,30,p.metal);rect(-4,-29,8,35,p.gold);rect(-4,-4,8,8,p.rim);ctx.restore();text(['FILIAL','CENTRAL','NUVEM'][v],0,57,12,colors[v]);
      }else if(c.id==='bridge'){
        plate(-44,-35,88,70);rect(-31,-8,62,16,p.ink);rect((s.preview??c.value)?7:-31,-18,24,36,p.gold);text(c.value?'EXTERNA':'LOCAL',0,57,12,c.value?p.green:p.red);
      }else if(c.id.startsWith('rotor')){
        const i=+c.id.at(-1),age=Math.min(1,Math.max(0,(m.time-m.turned[i])/.22)),from=m.previous[i],to=s.preview??m.rotation[i];
        const angle=(motion()?from+(to-from)*(1-Math.pow(1-age,3)):to)*Math.PI/2;
        plate(-39,-39,78,78,'#143132');ctx.save();ctx.rotate(angle);chip(-28,-28,56,56);line([[0,24],[0,-23]],colors[i],7);line([[-9,-12],[0,-24],[9,-12]],colors[i],5);ctx.restore();text('CANAL '+(i+1),0,58,12,colors[i]);
      }else if(c.id.startsWith('gap')){
        rect(-35,-14,70,28,p.ink);rect(-33,-11,14,22,p.gold);rect(19,-11,14,22,p.gold);text(+c.id.at(-1)+1,0,7,16,p.rim);
      }else if(c.id.startsWith('path')){
        const i=+c.id.at(-1);rect(-35,-11,70,22,'#26645b');line([[-31,0],[31,0]],colors[i],6);rect(-34,-10,9,20,p.gold);rect(25,-10,9,20,p.gold);if(!m.links[i])text('VIA '+(i+1),0,33,12,colors[i]);
      }else if(c.id==='cpu'){
        chip(-42,-33,84,66,'CPU');led(0,20,m.activation===1);text('ATIVAR',0,52,12,p.green);
      }else if(c.id==='isolate'||c.id.startsWith('activate')){
        plate(-30,-25,60,50);rect(-12,-19,24,38,p.ink);rect(-9,c.on?-16:0,18,16,c.on?p.green:p.gold);text(c.id==='isolate'?'ISOLAR':'ATIVAR',0,42,12,c.on?p.green:p.gold);
      }else{
        plate(-39,-27,78,54);rect(-23,-14,46,28,p.gold);text('▶',0,7,19,p.ink);text(c.id==='probe'?'TESTAR':'LANÇAR',0,46,12,p.gold);
      }
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}
      ctx.restore();
    }
    function overlay(){if(m.done){plate(112,225,416,91,p.ink);text('ROTEADOR RESTAURADO',320,266,23,p.green);text('COMUNICAÇÃO CONFIRMADA',320,293,14,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.routerRepairArt=Object.freeze({create});
})();
