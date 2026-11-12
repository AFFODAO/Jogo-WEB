/* Equipamentos em pixel art, desenhados na resolução nativa do canvas. */
(() => {
 function create(ctx,entry,m){
  const ink='#081321',metal='#526c89',rim='#9eb5cc',green='#8df4ad',gold='#f3c57b',colors=['#79d8f6','#f3c57b','#c4a2f5','#f18e9c'];
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  const text=(s,x,y,size=14,c=rim)=>{ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(s,x,y);};
  const line=(pts,c,w=5)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(...pts[0]);pts.slice(1).forEach(p=>ctx.lineTo(...p));ctx.stroke();};
  const plate=(x,y,w,h)=>{r(x+5,y+6,w,h,'#040b14');r(x,y,w,h,metal);r(x+5,y+5,w-10,h-10,'#183449');r(x+8,y+8,w-16,3,rim);};
  const led=(x,y,on,c=green)=>{r(x-7,y-5,14,10,ink);r(x-4,y-2,8,4,on?c:metal);};
  const chip=(x,y,w=90,h=65)=>{r(x,y,w,h,ink);for(let i=0;i<8;i++){r(x+i*11,y-7,5,7,gold);r(x+i*11,y+h,5,7,gold);}r(x+8,y+8,w-16,h-16,'#273547');};
  let state;
  function background(s){state=s;r(0,0,640,560,ink);plate(20,25,600,510);text('BYTE RUNNER · SWITCH',320,55,19);for(let i=0;i<24;i++){r(35+i*24,70,12,3,ink);r(35+i*24,500,12,3,ink);}for(const x of [32,608])for(const y of [36,520]){r(x-4,y-4,8,8,rim);r(x-2,y-1,4,2,ink);}
   if(entry.key==='patch-leads'){
    plate(45,100,550,170);text('PAINEL DE CONEXÕES · RJ45',320,127);for(let i=0;i<4;i++){const j=m.order.indexOf(i),on=m.links[j]&&m.time-m.inserted[j]>.35;led(110+i*140,245,on);text('PORTA '+(i+1),110+i*140,150,12);}
    m.links.forEach((v,i)=>{const c=m.controls().find(c=>c.id==='lead'+i),p=state.position(c);ctx.beginPath();ctx.moveTo(70+i*145,510);ctx.bezierCurveTo(30+i*145,365,p.x+60,p.y+130,p.x,p.y+20);ctx.strokeStyle=ink;ctx.lineWidth=13;ctx.stroke();ctx.strokeStyle=colors[m.order[i]];ctx.lineWidth=7;ctx.stroke();});
   }else if(entry.key==='packet-diverter'){
    text('PACOTE '+Math.min(6,m.index+1)+'/6 · DESTINO '+((m.packets[m.index]??0)+1),320,93,16,gold);
    line([[65,220],[235,220],[535,155]],metal,12);line([[235,220],[385,330],[535,330]],metal,12);line([[385,330],[440,440],[535,440]],metal,12);
    for(let i=0;i<3;i++){plate(495,[125,300,410][i],90,60);text('SAÍDA '+(i+1),540,[150,325,435][i],12,colors[i]);led(540,[170,345,455][i],m.time-m.flash[i]<.8);text(''+m.delivered[i],580,[170,345,455][i],12);}
    if(m.flight){const f=m.flight,pts=f.destination===0?[[65,220],[235,220],[535,155]]:f.destination===1?[[65,220],[235,220],[385,330],[535,330]]:[[65,220],[235,220],[385,330],[440,440],[535,440]],n=f.progress*(pts.length-1),i=Math.min(pts.length-2,Math.floor(n)),a=n-i,x=pts[i][0]+(pts[i+1][0]-pts[i][0])*a,y=pts[i][1]+(pts[i+1][1]-pts[i][1])*a;r(x-12,y-10,24,20,colors[m.packets[m.index]]);text(''+(m.packets[m.index]+1),x,y+5,13,ink);}
   }else if(entry.key==='uplink-clutch'){
    plate(175,150,280,220);if(m.open){for(let i=0;i<6;i++)line([[190,175+i*28],[440,175+i*28]],'#387c73',3);chip(190,180,65,50);r(266,198,110,108,ink);for(let i=0;i<10;i++)r(272+i*10,310,5,14,gold);}else{for(let i=0;i<9;i++)r(195,175+i*18,240,6,ink);text('TAMPA',320,250);}
    text(m.fixed?'MÓDULO FIXADO':m.removed?'BAIA LIBERADA':'MÓDULO AVARIADO',320,390,14,gold);led(440,140,m.charge===1);if(m.charge>0){r(215,475,210*m.charge,10,green);text('RESTAURANDO ENERGIA',320,465,12);}
   }else{
    text('ATIVAR PORTAS '+m.required.map(i=>i+1).join(' E '),320,100,17,gold);
    for(let i=0;i<4;i++){const x=110+i*140;line([[x,145],[x,215]],gold,7);line([[x,255],[x,345]],gold,7);r(x-30,130,60,32,ink);led(x,145,m.charge[i]===1);text(''+(i+1),x,185,15,colors[i]);if(m.charge[i]>0){const y=275+(s.t*95)%50;r(x-3,y,6,7,green);}}
   }
  }
  function control(c,s){const {x,y}=s;ctx.save();ctx.translate(x,y);
   if(c.mode==='target'){r(-34,-28,68,56,ink);r(-29,-23,58,46,metal);r(-24,-18,48,36,ink);for(let i=0;i<8;i++)r(-24+i*6,-18,3,12,gold);text(c.id.startsWith('port')?c.id.slice(-1)*1+1:'ENCAIXE',0,44,12);}
   else if(c.id.startsWith('lead')){const i=+c.id.at(-1),dy=m.links[i]?Math.max(0,1-(m.time-m.inserted[i])/.35)*22:0;r(-24,-24+dy,48,48,rim);r(-18,-18+dy,36,30,colors[m.order[i]]);for(let j=0;j<8;j++)r(-21+j*6,-24+dy,3,14,gold);r(-10,20+dy,20,15,metal);text(c.number,0,10+dy,16,ink);}
   else if(c.id.startsWith('fork')){plate(-34,-30,68,60);const v=s.preview??c.value;line(v?[[0,-25],[0,0],[28,25]]:[[-28,0],[28,0]],gold,8);text(v?'RAMO':'DIRETO',0,44,12);}
   else if(c.id==='fault'||c.id==='new'){const age=Math.max(0,m.time-(m.seatedAt??-10));ctx.translate(0,c.id==='new'&&m.seated?Math.max(0,1-age/.45)*35:0);r(-45,-35,90,70,c.id==='fault'?'#633846':'#256253');chip(-35,-23,70,42);text(c.id==='fault'?'AVARIA':'NOVO',0,8,13,c.id==='fault'?'#ffb2a8':green);}
   else if(c.id.startsWith('bridge')){r(-30,-10,60,20,gold);r(-22,-5,44,10,rim);text('PONTE '+(1+(+c.id.at(-1))),0,32,12);}
   else{plate(-34,-29,68,58);r(-14,-22,28,44,ink);r(-10,c.on?-18:2,20,18,c.on?green:gold);text(c.id==='power'?'ENERGIA':c.id==='cover'?'ABRIR':c.id==='secure'?'TRAVAR':c.id==='send'?'ENVIAR':'CHAVE',0,46,12);}
   if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=gold;ctx.lineWidth=3;ctx.strokeRect(-45,-45,90,90);}ctx.restore();
  }
  function overlay(){if(m.done){plate(140,220,360,85);text('SWITCH RESTAURADO',320,270,23,green);}}
  return {background,control,overlay};
 }
 ByteRunner.switchRepairArt=Object.freeze({create});
})();
