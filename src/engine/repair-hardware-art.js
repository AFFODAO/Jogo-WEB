/* Original Stage 1 pixel equipment, painted in logical coordinates. No rules. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#071017',shadow:'#03090e',board:'#174e3e',edge:'#377f60',trace:'#40956d',copper:'#d5ac65',steel:'#62808b',bright:'#c0d1d2',light:'#8ff4b7',red:'#f28e74',dark:'#142735'};
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const path=(points,color,width=3)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='miter';ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.stroke();};
    const poly=(points,color)=>{ctx.beginPath();ctx.fillStyle=color;ctx.moveTo(...points[0]);for(const q of points.slice(1))ctx.lineTo(...q);ctx.closePath();ctx.fill();};
    const text=(value,x,y,size=13,c=p.bright)=>{ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(String(value),Math.round(x),Math.round(y));};
    const circle=(x,y,r,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+7,w,h,p.shadow);rect(x,y,w,h,p.steel);rect(x+4,y+4,w-8,h-8,c);rect(x+4,y+4,w-8,3,p.bright+'66');};
    const bolt=(x,y,on=false)=>{rect(x-8,y-8,16,16,p.ink);rect(x-6,y-6,12,12,on?p.light:p.steel);rect(x-4,y-1,8,2,p.ink);};
    const marker=(x,y,size=17,color=p.copper)=>poly([[x,y],[x+size,y],[x,y+size]],color);
    const led=(x,y,on,color=p.light)=>{rect(x-7,y-5,14,10,p.shadow);rect(x-4,y-3,8,6,on?color:'#294341');if(on)rect(x-2,y-2,4,2,'#effff4');};
    const elapsed=since=>Math.max(0,m.time-(since??-10));
    const lift=(since,amount,duration=.28)=>ByteRunner.repairScene.reducedMotion()?0:amount*Math.max(0,1-elapsed(since)/duration);
    function motherboard(x=22,y=22,w=596,h=516){
      plate(x,y,w,h,p.board);rect(x+10,y+10,w-20,h-20,'#1c5744');
      for(let i=0;i<11;i++){
        const yy=y+24+i*39;path([[x+15,yy],[x+38+i*7,yy],[x+56+i*7,yy+18],[x+w-20,yy+18]],i%2?p.trace+'66':'#123c32',2);
      }
      for(const xx of [x+13,x+w-13])for(const yy of [y+14,y+h-14])bolt(xx,yy);
      for(let i=0;i<8;i++){rect(x+26+i*68,y+18,42,15,p.ink);rect(x+30+i*68,y+15,7,6,p.copper);}
      for(let i=0;i<5;i++){rect(x+w-28,y+80+i*68,10,30,p.ink);rect(x+w-31,y+84+i*68,4,6,p.copper);}
    }
    function chip(x,y,w=52,h=38){
      for(let i=0;i<6;i++){rect(x-5,y+5+i*5,5,2,p.copper);rect(x+w,y+5+i*5,5,2,p.copper);}
      rect(x+3,y+4,w,h,p.shadow);rect(x,y,w,h,p.ink);rect(x+4,y+4,w-8,3,'#455b60');circle(x+7,y+h-7,2,p.steel);
    }
    function rejected(id,x,y,w,h){
      if(m.rejected!==id||m.rejectFor<=0)return;
      ctx.strokeStyle=p.red;ctx.lineWidth=5;ctx.strokeRect(x-w/2,y-h/2,w,h);text('×',x+w/2-10,y-h/2+22,24,p.red);
    }
    function socketFrame(){
      plate(211,90,218,222,p.steel);rect(225,104,190,194,p.ink);
      for(let row=0;row<14;row++)for(let col=0;col<14;col++)rect(235+col*12,117+row*12,5,5,p.copper);
      rect(301,169,39,48,p.ink);marker(216,96,23);marker(227,107,12,p.light);
      for(const x of [216,422])for(const y of [96,306])bolt(x,y);
      rejected('cpu-socket',320,200,220,222);
    }
    function cpuPiece(x,y,orientation,picked){
      ctx.save();ctx.translate(x,y);ctx.rotate(orientation*Math.PI/2);
      rect(-71+(picked?9:5),-67+(picked?14:7),142,142,p.shadow);
      rect(-72,-72,144,144,'#2c7260');rect(-63,-63,126,126,p.copper);
      for(let i=0;i<12;i++){rect(-58+i*10,-69,5,7,p.copper);rect(-58+i*10,63,5,7,p.copper);}
      rect(-53,-53,106,106,'#657d85');rect(-49,-49,98,98,'#a9babd');rect(-44,-44,88,9,'#e1e8df');rect(-44,36,88,8,'#718b91');
      marker(-67,-67,23,p.light);text('BYTE',0,-6,16,'#2e4550');text('BR-01',0,18,14,'#4b646c');
      ctx.restore();
    }
    const notchY=type=>[-35,0,35][type];
    function ramModule(x,y,type){
      ctx.save();ctx.translate(x,y);rect(-33+6,-82+9,66,164,p.shadow);rect(-33,-82,66,164,'#2b885e');rect(-29,-78,7,156,'#6dbb7b');
      for(let i=0;i<4;i++)chip(-18,-69+i*36,34,27);
      for(let i=0;i<20;i++)rect(29,-76+i*8,9,5,p.copper);
      rect(23,notchY(type)-7,15,14,p.ink);text(String.fromCharCode(65+type),-4,76,14,p.light);
      ctx.restore();
    }
    function ramSlot(index,type){
      const x=140+index*180,filled=m.slots[index]>=0,age=elapsed(m.insertedAt[index]),closed=filled?(ByteRunner.repairScene.reducedMotion()?1:Math.min(1,Math.max(0,(age-.18)/.25))):0;
      rect(x-48,88,96,204,p.shadow);rect(x-39,100,78,180,p.steel);rect(x-31,106,62,168,p.ink);
      for(let i=0;i<20;i++)rect(x+21,112+i*8,7,4,p.copper);
      rect(x+12,190+notchY(type)-8,18,16,p.copper);
      for(const sign of [-1,1]){
        const yy=190+sign*(106+(1-closed)*12);plate(x-34,yy-10,68,20,filled&&closed===1?p.light:p.steel);rect(x-12,yy-5,24,10,p.ink);
      }
      text(String.fromCharCode(65+type),x,65,20,p.copper);led(x,326,filled&&age>.32);rejected('dimm-slot'+index,x,190,114,196);
    }
    const colors=['#efb45d','#8acbd3','#bf9ce6'];
    function cable(a,b,color,width=9){
      const bend=Math.min(160,Math.abs(b.x-a.x)*.55+40);
      for(const [stroke,size] of [[p.shadow,width+7],[color,width],['#ffffff30',2]]){
        ctx.beginPath();ctx.strokeStyle=stroke;ctx.lineWidth=size;ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+bend,a.y+30,b.x-bend,b.y+44,b.x,b.y);ctx.stroke();
      }
    }
    function powerSocket(i,type){
      const x=500,y=110+i*165,n=[12,4,3][type],w=[100,64,56][type];
      plate(x-w/2-9,y-34,w+18,68,p.ink);rect(x-w/2,y-24,w,48,p.steel);
      for(let row=0;row<2;row++)for(let col=0;col<n;col++){const xx=x-w/2+5+col*(w-10)/n;rect(xx,y-16+row*17,(w-13)/n-1,12,p.ink);}
      rect(x-12,y-39,24,9,colors[type]);text(['ATX 24','CPU 8','GPU 6'][type],x,y+63,16,colors[type]);
      const source=m.connections.indexOf(i);led(578,y,source>=0&&elapsed(m.insertedAt[source])>.3,colors[type]);rejected('power-socket'+i,x,y,124,116);
    }
    function powerPlug(x,y,type){
      const n=[12,4,3][type],w=[96,64,56][type];
      rect(x-w/2+5,y-28+7,w,56,p.shadow);rect(x-w/2,y-28,w,56,'#26323c');rect(x-w/2+4,y-24,w-8,48,colors[type]);
      rect(x-13,y-34,26,10,p.bright);rect(x-w/2-8,y-17,10,34,p.ink);
      for(let row=0;row<2;row++)for(let col=0;col<n;col++)rect(x-w/2+5+col*(w-8)/n,y-16+row*17,Math.max(3,(w-12)/n-1),11,p.ink);
    }
    function fanPiece(x,y,r,broken=false,angle=0){
      ctx.save();ctx.translate(x,y);plate(-r,-r,r*2,r*2,broken?'#3c383c':'#344e59');
      circle(0,0,r-8,p.ink);circle(0,0,r-17,'#1b3039');
      for(const xx of [-r+9,r-9])for(const yy of [-r+9,r-9]){circle(xx,yy,5,p.shadow);}
      ctx.save();ctx.rotate(angle);
      for(let i=0;i<7;i++){
        ctx.save();ctx.rotate(i*Math.PI*2/7);
        if(broken&&i===2){poly([[8,0],[36,8],[24,20],[8,15]],p.red);ctx.restore();continue;}
        poly([[10,-9],[r-25,-26],[r-14,-5],[r-35,21],[8,14]],broken?'#77666b':'#9ab6bc');
        path([[22,-5],[r-28,-15]],broken?'#b58a7b':'#d4e4df',3);ctx.restore();
      }
      ctx.restore();circle(0,0,r*.24,broken?'#663f43':p.steel);circle(0,0,r*.16,p.ink);text(broken?'×':'BR',0,5,broken?24:12,broken?p.red:p.light);
      ctx.restore();
    }
    function rotationArrow(x,y){
      ctx.save();ctx.translate(x,y);circle(0,0,36,p.shadow);circle(0,0,31,p.dark);path([[-20,8],[-24,-12],[-12,-25],[11,-25],[24,-12]],p.copper,7);marker(14,-12,16,p.copper);text('90°',0,20,15,p.bright);ctx.restore();
    }
    function background(state){
      const {t,drag,position}=state;
      rect(0,0,640,560,p.ink);
      if(entry.key==='cpu-install'){
        motherboard();for(let i=0;i<4;i++)chip(65,95+i*53,62,34);for(let i=0;i<4;i++){rect(459,85+i*48,16,28,p.copper);rect(479,85+i*48,13,28,p.ink);}
        socketFrame();
        if(!m.leverClosed){plate(224,40,192,48,p.steel);rect(239,47,162,29,p.ink);path([[228,86],[228,99],[410,99],[410,86]],p.bright,6);}
        plate(53,349,415,173,'#122c2a');text('PROCESSADOR',155,347,14,p.copper);text('GIRAR',410,496,13,p.bright);
        for(let i=0;i<6;i++){const on=m.activation>(i+1)/7;led(245+i*29,326,on);if(on)path([[245+i*29,310],[245+i*29,320]],p.light,3);}
      }else if(entry.key==='ram-install'){
        motherboard();rect(57,350,526,173,'#12382e');path([[65,350],[575,350]],p.edge,3);
        for(let i=0;i<3;i++)ramSlot(i,m.slotTypes[i]);
        for(let i=0;i<2;i++)for(let j=0;j<4;j++)chip(220+i*180,92+j*55,24,28);
        text('MÓDULOS DE MEMÓRIA',320,545,13,p.copper);
      }else if(entry.key==='power-wiring'){
        motherboard(354,25,260,510);plate(25,28,166,502,'#263b47');text('FONTE',106,59,17,p.bright);
        for(let j=0;j<7;j++)for(let i=0;i<6;i++)rect(43+i*21,70+j*18,12,6,p.ink);
        for(let i=0;i<3;i++){plate(130,89+i*165,62,44,p.ink);rect(175,101+i*165,19,18,colors[i]);powerSocket(i,m.socketTypes[i]);}
        for(const c of m.controls().filter(c=>c.kind==='hardware-plug')){
          const i=Number(c.id.at(-1)),end=position(c);cable({x:184,y:110+i*165},end,colors[i],11);
          if(m.connections[i]>=0){const progress=Math.min(1,elapsed(m.insertedAt[i])/.7);path([[550,110+m.connections[i]*165],[585,110+m.connections[i]*165],[585,110+m.connections[i]*165+progress*62]],colors[i],4);}
        }
        text('24',212,114,13,colors[0]);text('8',212,279,13,colors[1]);text('6',212,444,13,colors[2]);
      }else if(entry.key==='fan-replacement'){
        plate(20,22,600,516,'#1a2c36');for(let i=0;i<16;i++)rect(205+i*15,40,7,295,i%2?'#394e55':'#243b45');
        for(const x of [185,435])path([[x,75],[x,310],[x-25,335]],p.copper,12);
        for(const [x,y] of [[150,90],[490,90],[150,300],[490,300]]){path([[x, y],[x<320?211:429,y]],p.steel,10);circle(x,y,10,p.ink);}
        if(m.oldRemoved&&!m.installed){circle(320,185,105,p.shadow);circle(320,185,73,p.dark);text('↓',320,198,36,p.copper);}
        plate(46,356,190,173,'#16252d');text('REPOSIÇÃO',140,347,14,p.light);
        plate(416,356,166,173,'#30282c');text('AVARIADA',498,347,14,p.red);
        if(m.oldRemoved){ctx.save();ctx.translate(490,445);ctx.rotate(-.2);fanPiece(0,0,59,true);ctx.restore();}
        if(!m.oldRemoved){cable({x:414,y:220},m.oldCable?{x:535,y:195}:{x:505,y:330},'#cdb871',6);}
        if(m.installed){
          const c=m.controls().find(c=>c.id==='fan-cable');if(c)cable({x:359,y:258},position(c),p.copper,6);
          else cable({x:359,y:258},{x:320,y:355},p.copper,6);
        }
        rect(63,124,36,130,p.ink);const temp=m.temperature??86;rect(69,248-(temp-40)*2.3,24,(temp-40)*2.3,temp>65?p.red:p.light);
        text(Math.ceil(temp)+' °C',100,277,19,temp>65?p.red:p.light);text(Math.round(m.rpm)+' RPM',88,304,11,p.bright);
        for(let i=0;i<4;i++){rect(518+i*11,177,6,35,p.copper);}led(563,164,m.connected);
      }
      if(drag&&['hardware-cpu','hardware-ram','hardware-fan','hardware-plug','hardware-fan-plug'].includes(m.controls().find(c=>c.id===drag.id)?.kind)){
        for(const z of m.controls().find(c=>c.id===drag.id)?.targets??[]){ctx.strokeStyle=p.copper+'99';ctx.lineWidth=2;ctx.setLineDash([6,7]);ctx.strokeRect(z.x-z.w/2,z.y-z.h/2,z.w,z.h);ctx.setLineDash([]);}
      }
    }
    function control(c,state){
      const {x,y,t,focused,selection,hinted}=state;
      if(c.mode!=='target'){
        if(c.kind==='hardware-cpu')cpuPiece(x,y-(m.seated?lift(m.insertedAt,12):0),m.orientation,m.picked&&!m.seated);
        else if(c.kind==='hardware-rotate')rotationArrow(x,y);
        else if(c.kind==='hardware-lever'){
          ctx.save();ctx.translate(x,y);ctx.rotate(m.leverClosed?(ByteRunner.repairScene.reducedMotion()?0:-(1-m.activation)*.75):-.75);path([[0,70],[0,-53],[19,-65]],p.shadow,14);path([[0,70],[0,-53],[19,-65]],p.bright,8);rect(8,-76,33,18,p.copper);ctx.restore();bolt(x,y+70,m.activation===1);
        }else if(c.kind==='hardware-ram'){
          const slot=m.slots.indexOf(c.number-1);ramModule(x,y-(slot<0?0:lift(m.insertedAt[slot],14)),c.number-1);
        }else if(c.kind==='hardware-plug')powerPlug(x-(c.locked?lift(m.insertedAt[c.number-1],12,.25):0),y,c.number-1);
        else if(c.kind==='hardware-old-fan')fanPiece(x,y,96,true);
        else if(c.kind==='hardware-fan')fanPiece(x,y-(m.installed?lift(m.insertedAt,12):0),80,false,m.connected?t*m.rpm*.018:0);
        else if(c.kind==='hardware-unplug'){
          if(m.oldCable){rect(x-26,y-25,52,50,p.copper);for(let i=0;i<4;i++)rect(x-17+i*10,y-13,5,25,p.ink);}
        }else if(c.kind==='hardware-fan-plug'){rect(x-26,y-22,52,44,p.copper);rect(x-18,y-28,36,9,p.bright);for(let i=0;i<4;i++)rect(x-17+i*10,y-12,5,24,p.ink);}
        else if(c.kind==='hardware-bolt'){
          circle(x,y,23,p.ink);circle(x,y,18,c.locked?p.light:p.steel);ctx.save();ctx.translate(x,y);ctx.rotate((state.preview??c.value??0)*Math.PI/3);path([[-11,0],[11,0]],p.ink,5);path([[0,-11],[0,11]],p.ink,5);ctx.restore();
          if(!c.locked){text('↻',x,y+43,24,p.copper);}
        }
      }
      if(focused===c.id||selection===c.id||hinted===c.id){ctx.strokeStyle=hinted===c.id?p.light:p.copper;ctx.lineWidth=3;ctx.setLineDash([7,6]);ctx.strokeRect(x-c.w/2+3,y-c.h/2+3,c.w-6,c.h-6);ctx.setLineDash([]);}
    }
    function overlay(){
      if(entry.key==='cpu-install'&&m.leverClosed){
        const close=ByteRunner.repairScene.reducedMotion()?1:m.activation;ctx.strokeStyle=p.bright;ctx.lineWidth=9;ctx.strokeRect(228,107+(1-close)*-35,184,184*(.35+.65*close));
        if(close>.8){marker(235,115,14,p.light);text('ATIVO',320,78,14,p.light);}
      }
      if(m.done){plate(169,15,302,35,p.ink);text('SISTEMA RESTAURADO',320,38,16,p.light);}
    }
    return {background,control,overlay};
  }
  ByteRunner.hardwareRepairArt=Object.freeze({create});
})();
