/* Original, code-drawn pixel equipment. Rendering never changes a puzzle rule. */
(() => {
  'use strict';
  const palettes=[['#103a30','#77edaa','#d5ae65'],['#26213e','#ba9aef','#66dbd0'],['#102e46','#6fc6ee','#ed9c55'],['#15333a','#e0b575','#80d2db'],['#191e47','#88a9ff','#7febd9'],['#342836','#edb176','#e080d5'],['#24332e','#bfe77b','#f1d7a3'],['#152844','#efcf78','#8cbbef'],['#39272d','#ed8b68','#91bdc2'],['#172b41','#90d8ee','#b69be7']];
  function create(host,entry,model,callbacks){
    const scene=ByteRunner.repairScene.create(host,{width:640,height:560,label:entry.name,isActive:callbacks.active});
    scene.viewport.classList.add('repair-v2-viewport');
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=280;
    canvas.className='repair-v2-canvas';canvas.setAttribute('aria-hidden','true');scene.stage.append(canvas);
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const equipment=entry.stage===1?ByteRunner.hardwareRepairArt.create(ctx,entry,model):entry.stage===2?ByteRunner.softwareRepairArt.create(ctx,entry,model):entry.stage===3?ByteRunner.switchRepairArt.create(ctx,entry,model):entry.stage===4?ByteRunner.routerRepairArt.create(ctx,entry,model):entry.stage===5?ByteRunner.wifiRepairArt.create(ctx,entry,model):entry.stage===6?ByteRunner.cablingRepairArt.create(ctx,entry,model):entry.stage===7?ByteRunner.dhcpRepairArt.create(ctx,entry,model):entry.stage===8?ByteRunner.dnsRepairArt.create(ctx,entry,model):entry.stage===9?ByteRunner.firewallRepairArt.create(ctx,entry,model):entry.stage===10?ByteRunner.serversRepairArt.create(ctx,entry,model):null;
    const [dark,accent,gold]=palettes[entry.stage-1],ink='#080f19',metal='#41606b',light='#b5cbd0';
    let controls=[],drag=null,selection=null,focused=null,hinted=null,disposed=false;
    const transitions=new Map();
    const elements=new Map(),abort=new AbortController();
    const listen=(el,event,fn,options={})=>el.addEventListener(event,fn,{...options,signal:abort.signal});
    const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const line=(points,color=accent,width=4)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='miter';ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.stroke();};
    const text=(value,x,y,color=light,size=12)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(String(value),x,y);};
    const circle=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
    const plate=(x,y,w,h,color=dark)=>{rect(x+5,y+7,w,h,ink);rect(x,y,w,h,metal);rect(x+5,y+5,w-10,h-10,color);rect(x+8,y+8,w-16,3,'#ffffff15');};
    const screw=(x,y)=>{rect(x-5,y-5,10,10,light);rect(x-3,y-1,6,2,ink);};
    function gear(x,y,r,rotation=0,color=gold){
      ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
      for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);rect(r-5,-5,13,10,color);}
      circle(0,0,r,color);circle(0,0,r-8,metal);circle(0,0,7,ink);rect(-3,-r+12,6,12,light);ctx.restore();
    }
    const cable=(a,b,color=gold)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+70,a.y,b.x-70,b.y,b.x,b.y);ctx.lineWidth=12;ctx.strokeStyle=ink;ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle=color;ctx.stroke();};
    function motherboard(){
      plate(35,55,570,450,dark);
      for(let i=0;i<9;i++){const y=90+i*44;line([[55,y],[100+i*8,y],[100+i*8,y+22],[570,y+22]],'#2f76664d',3);}
      for(let i=0;i<5;i++){plate(50+i*110,65,54,28,ink);for(let j=0;j<4;j++)rect(54+i*110+j*11,100,5,10,gold);}
      [[50,70],[590,70],[50,485],[590,485]].forEach(([x,y])=>screw(x,y));
    }
    function rack(x,y,w=140,h=350){
      plate(x,y,w,h,ink);for(let i=0;i<Math.floor(h/48);i++){rect(x+10,y+12+i*48,w-20,36,metal);for(let j=0;j<4;j++)rect(x+18+j*18,y+19+i*48,10,4,ink);rect(x+w-24,y+25+i*48,6,6,accent);}
    }
    function pipe(points,color=metal){line(points,ink,24);line(points,color,16);line(points,'#ffffff22',3);}
    function waveform(x,y,w,h,phase=0){const points=[];for(let i=0;i<=w;i+=4)points.push([x+i,y+Math.sin(i*.06+phase)*Math.sin(i*.017)*h]);line(points,accent,3);}
    function background(t){
      if(equipment){equipment.background({t,drag,position});return;}
      rect(0,0,640,560,ink);
      // Riveted framing is low-level scenery; the equipment inside differs per task.
      rect(10,8,620,544,dark);rect(18,16,604,5,metal);rect(18,540,604,6,metal);
      // Original etched texture and vents, deliberately away from interaction targets.
      for(let i=0;i<12;i++){rect(35+i*48,30,24,3,'#ffffff0c');rect(35+i*48,519,24,3,'#00000040');}
      for(const x of [25,615])for(const y of [30,530])screw(x,y);
      switch(entry.key){
        case 'fan-drive':
          motherboard();plate(60,345,170,135,ink);for(let i=0;i<7;i++)rect(73+i*20,356,9,110,metal);
          gear(105,390,32,t*2);circle(108,389,13,light);
          if(model.belt){line([[150,175],[380,175],[380,220],[150,220],[150,175]],gold,9);for(let i=0;i<7;i++)rect(150+(i*35+t*35)%220,174,13,5,ink);}
          text('54 °C',330,75,accent,22);break;
        case 'dimm-seat':
          motherboard();rect(150,280,340,65,ink);for(let i=0;i<22;i++)rect(165+i*14,295,7,34,gold);rect(292,280,14,65,dark);
          text('MEMÓRIA',320,490,accent,16);break;
        case 'bus-solder':
          motherboard();for(let i=0;i<3;i++){const y=130+i*140;line([[65,y],[275,y]],gold,10);line([[370,y],[570,y]],gold,10);rect(280,y-17,85,34,ink);line([[280,y],[280+model.traces[i]*21,y]],light,8);}
          break;
        case 'gpu-latch':
          motherboard();rect(90,265,310,35,ink);for(let i=0;i<18;i++)rect(95+i*16,270,6,25,gold);
          cable({x:580,y:70},{x:490,y:330},'#cbae70');rack(40,345,130,130);break;
        case 'disk-recovery':
          plate(50,60,450,430);circle(275,265,175,metal);circle(275,265,161,'#12212d');
          for(let r=55;r<160;r+=25){ctx.strokeStyle=light;ctx.lineWidth=2;ctx.beginPath();ctx.arc(275,265,r,0,Math.PI*2);ctx.stroke();}
          for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[275,265],[275+Math.cos(a)*160,265+Math.sin(a)*160]],dark,6);text(i+1,275+Math.cos(a+.3)*135,270+Math.sin(a+.3)*135,model.wanted.includes(i)?accent:metal,20);}
          line([[555,100],[520,205],[290+model.sector*5,235]],gold,16);text(model.recovered.length+'/'+model.wanted.length,530,490,accent,20);break;
        case 'process-loom':
          for(const y of [180,380]){pipe([[60,y],[360,y],[470,280],[590,280]]);for(let i=0;i<5;i++){const x=50+(i*75+t*30)%345;rect(x,y-17,30,34,i%2?accent:gold);}}
          gear(530,280,60,t);text(model.index+'/'+model.sequence.length,515,100,accent,24);break;
        case 'page-shuttle':
          rack(400,85,185,390);pipe([[180,95],[180,450]]);for(let i=0;i<3;i++){rect(220,145+i*110,150,12,metal);text(['DISCO','BANCO 1','BANCO 2'][i],480,150+i*110,light,13);}
          plate(130,390-model.floor*125,100,60,model.cargo?gold:metal);text(model.index+'/4',90,85,accent,20);break;
        case 'quarantine-vacuum':
          plate(45,70,550,270);for(let i=0;i<3;i++){plate(80+i*165,180,145,100,model.scanned[i]?(i===model.infected?'#673545':'#234c40'):ink);if(model.scanned[i])text(i===model.infected?'✕':'✓',150+i*165,245,i===model.infected?gold:accent,32);}
          line([[110+model.zone*170,90],[110+model.zone*170,320]],accent,4);cable({x:600,y:500},{x:480,y:420},metal);break;
        case 'packet-diverter':
          pipe([[45,260],[220,260],[310,120],[580,120]]);pipe([[220,260],[410,260],[500,300],[580,300]]);pipe([[410,260],[470,460],[580,460]]);
          for(let i=0;i<3;i++){plate(545,85+i*170,60,75,ink);text(i+1,575,135+i*170,accent,26);}
          rect(55+(t*35)%120,245,28,28,gold);text((model.packets[model.index]??0)+1,80,225,gold,24);text(model.index+'/'+model.packets.length,320,75,accent,20);break;
        case 'patch-leads':
          rack(40,60,140,455);rack(440,60,160,455);model.order.forEach((v,i)=>{const c=controls.find(c=>c.id==='lead'+i);const end=drag?.id===c.id?drag.point:{x:c.x,y:c.y};cable({x:95,y:130+i*155},end,[accent,gold,'#c987bd'][i]);text(i+1,80,135+i*155,ink,20);text('↔ '+(i+1),570,135+v*155,accent,16);});break;
        case 'vlan-shutters':
          plate(45,80,550,370,ink);for(let i=0;i<3;i++){rect(65+i*185,105,160,305,['#164f50','#55492c','#3e3259'][i]);for(let j=0;j<4;j++)circle(90+i*185+(j*31+t*11)%115,140+j*65,9,[accent,gold,'#bb9ae3'][i]);}
          text('I',130,80,accent,20);text('II',320,80,gold,20);text('III',510,80,light,20);break;
        case 'uplink-clutch':
          plate(70,80,500,390,ink);pipe([[170,200],[170,410],[470,410],[470,200]]);gear(320,305,60,t*(model.lock.every(Boolean)?3:.3));text('A',170,90,accent,22);text('B',470,90,gold,22);break;
        case 'route-rail':
          plate(70,80,510,365,ink);for(let i=0;i<6;i++){rect(100+i%3*165,120+Math.floor(i/3)*165,140,140,dark);}
          text('1 → 2 → 3 → 4 → 5',320,490,gold,22);break;
        case 'interface-crimp':
          cable({x:40,y:265},{x:600,y:265},'#b4ad95');plate(75,320,490,185);gear(130,435,35,t*.3);gear(510,435,35,-t*.3);text('TERMINAÇÃO',320,85,accent,20);break;
        case 'gateway-periscope':
          for(let i=0;i<4;i++){const y=100+i*115;pipe([[270,260],[400,y],[570,y]],i===model.target?accent:metal);text(i+1,580,y+5,gold,18);}
          circle(240,260,120,metal);circle(240,260,100,ink);line([[240,260],[325+model.tunnel*12,170+model.tunnel*50]],accent,12);break;
        case 'prefix-cams':
          pipe([[70,230],[570,230]],gold);for(let i=0;i<2;i++){circle(190+i*270,230,110,metal);circle(190+i*270,230,80,ink);gear(190+i*270,230,70,model.rings[i]*Math.PI*.4);}
          for(let i=0;i<3;i++)circle(260+i*60,90,10,model.case>i?accent:metal);break;
        case 'dish-gimbal':
          plate(90,420,460,80);line([[300,400],[300,290]],metal,25);ctx.save();ctx.translate(300,245);ctx.rotate((model.aim[0]-2)*.12);ctx.scale(1,.65+model.aim[1]*.08);circle(0,0,125,metal);circle(0,0,105,light);line([[-90,0],[90,0]],dark,8);line([[0,-90],[0,90]],dark,8);circle(0,0,15,gold);ctx.restore();
          line([[310,230],[450,80]],accent,4);rect(440,55,32,40,gold);break;
        case 'spectrum-tuner':
          plate(55,65,530,210,ink);waveform(75,180,480,60,t);rect(100+model.clean*65,95,58,140,'#74e6bb30');rect(90+model.frequency*65,105,28+model.width*25,120,'#c1bdff44');text('ESPECTRO',320,85,accent,16);break;
        case 'rf-compressor':
          pipe([[145,370],[145,230],[470,230],[470,370]]);plate(240,85,160,270,ink);for(let i=0;i<6;i++)rect(260,315-i*32,120,24,i<model.pressure?(i===model.target-1?accent:gold):dark);text(model.pulses+'/3',320,490,accent,20);break;
        case 'repeater-mast':
          rect(25,430,590,90,'#0c1426');for(let i=0;i<6;i++){rect(40+i*100,250+(i%2)*90,70,220,metal);rect(50+i*100,265+(i%2)*90,15,20,ink);}
          model.height.forEach((v,i)=>{const x=150+i*330;line([[x,430],[x,290-v*45]],light,12);for(let r=30;r<130;r+=30){ctx.strokeStyle=accent+'60';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,290-v*45,r,Math.PI,Math.PI*2);ctx.stroke();}});break;
        case 'rj45-comb':
          plate(35,270,570,225,ink);for(let i=0;i<8;i++){const x=85+i%4*155,y=308+Math.floor(i/4)*105;rect(x-37,y-24,74,48,metal);text(i+1,x,y+8,gold,22);}
          model.order.forEach((v,i)=>{const c=controls.find(c=>c.id==='wire'+i),p=drag?.id===c.id?drag.point:c;cable({x:45+i*75,y:32},{x:p.x,y:p.y},['#d49660','#6ac494','#74acdf','#b18be0'][i%4]);});break;
        case 'continuity-trace':
          pipe([[55,200],[585,200]],gold);for(let i=0;i<3;i++){rect(145+i*160,175,30,50,i===model.break?ink:gold);if(model.measured[i])text(i===model.break?'✕':'✓',160+i*160,120,i===model.break?gold:accent,30);}
          cable({x:110,y:485},drag?.point??{x:110,y:420},accent);plate(210,365,220,130,ink);waveform(225,430,190,model.probe===model.break?3:28,t);break;
        case 'cable-reel':
          for(let i=0;i<3;i++)pipe([[230,340],[330,105+i*120],[570,105+i*120]],i===model.target?accent:metal);
          gear(170,340,105,model.length*.5);circle(170,340,45,ink);text('FOLGA',170,490,gold,16);break;
        case 'fiber-splice':
          plate(45,60,550,340,ink);line([[50,200],[285,200+model.align[0]*7]],'#db8ee4',12);line([[590,200],[355,185+model.align[1]*7]],accent,12);
          for(let i=0;i<2;i++){circle(170+i*300,140,35,model.clean[i]===3?accent:metal);if(model.clean[i]<3)for(let j=0;j<4;j++)rect(150+i*300+j*13,130+(j%2)*16,8,8,gold);}
          text('FUSÃO ÓPTICA',320,75,light,16);break;
        case 'lease-pneumatics':
          for(let i=0;i<3;i++){pipe([[320,440],[320,300],[95+i*220,300],[95+i*220,80]],metal);text('192.168.0.'+(i+1),95+i*220,75,model.leases[i]>=0?accent:light,13);circle(95+i*220,130,20,model.leases[i]>=0?accent:dark);}
          circle(320,300+Math.sin(t)*20,14,gold);break;
        case 'conflict-localizer':
          pipe([[70,260],[570,260]],gold);for(let i=0;i<3;i++){rack(90+i*180,80,100,110);waveform(85+i*180,320,100,i===model.duplicate?35:15,t+i);}
          text('ECO DUPLICADO',320,70,gold,16);break;
        case 'reservation-drum':
          plate(65,90,505,290,ink);for(let i=0;i<3;i++){text('MAC '+(i+1),145+i*170,125,accent,16);rect(100+i*170,150,90,175,metal);for(let j=0;j<5;j++)rect(115+i*170,165+j*28,60,8,ink);}
          text(model.bound+'/3',320,505,gold,20);break;
        case 'pool-sluice':
          pipe([[65,250],[575,250]],accent);for(let i=0;i<7;i++){text('.'+i,80+i*80,140,i===0||i===6?gold:light,18);circle(80+i*80,280,15,i>=mBound(0)&&i<=mBound(1)?accent:metal);}
          text('RESERVA',160,370,gold,16);break;
        case 'record-engraver':
          plate(60,90,520,320,'#374245');line(model.points,metal,12);
          {const progress=(drag?.id==='engrave'?drag.value:model.stroke)/6*4,segment=Math.min(3,Math.floor(progress)),fraction=Math.min(1,progress-segment),a=model.points[segment],b=model.points[segment+1];
            const tip=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction];
            line([...model.points.slice(0,segment+1),tip],accent,7);circle(...model.points[0],10,gold);line([[100,75],[320,100],tip],gold,12);}
          text(['byte.local','rede.local','nucleo.local'][model.name],320,385,gold,20);break;
        case 'delegation-hoist':
          pipe([[70,80],[570,80]]);line([[210,80],[210,170],[440,170]],gold,5);for(let i=0;i<3;i++){const c=controls.find(c=>c.id==='branch'+i),p=drag?.id===c.id?drag.point:c;line([[p.x,85],[p.x,p.y]],metal,4);}
          text('RAIZ',210,130,accent,16);text('ZONA',440,130,gold,16);break;
        case 'cache-carousel':
          circle(320,255,165,metal);circle(320,255,135,ink);for(let i=0;i<6;i++){const a=(i-model.index)*Math.PI/3+t*.06;const x=320+Math.cos(a)*115,y=255+Math.sin(a)*115;plate(x-25,y-30,50,60,model.items[i]?dark:'#673545');text(model.items[i]?'✓':'✕',x,y+7,model.items[i]?accent:gold,24);}
          text(model.items[model.index]?'LACRE ÍNTEGRO':'LACRE VENCIDO',320,65,model.items[model.index]?accent:gold,18);break;
        case 'query-courier':
          pipe([[100,280],[260,130],[430,280],[540,280]]);pipe([[100,280],[260,420],[430,280]]);
          const n=model.next();const target=controls.find(c=>c.id===n?.id);if(target){line([[target.x-30,target.y-65],[target.x,target.y-45],[target.x+30,target.y-65]],gold,6);}
          text(model.returning?'RESPOSTA → ORIGEM':'CONSULTA → AUTORIDADE',320,70,accent,17);break;
        case 'policy-camshaft':
          pipe([[60,230],[580,230]],gold);for(let i=0;i<3;i++){line([[150+i*170,280],[150+i*170,370]],metal,12);text(['EXCEÇÃO','PERMITIR','BLOQUEAR'][model.order[i]],150+i*170,350,accent,13);}
          text('1 → 2 → 3',320,90,gold,24);break;
        case 'inspection-airlock':
          plate(60,115,520,245,ink);rect(190,145,260,185,dark);plate(260,195,130,95,model.inspected?(model.rules[model.cleared]? '#245a4d':'#693840'):metal);
          text(model.inspected?(model.rules[model.cleared]?'✓':'✕'):'?',320,260,model.inspected?accent:gold,40);text(model.cleared+'/4',320,80,accent,20);break;
        case 'threat-triangulation':
          for(let i=0;i<3;i++){const c=controls[i],ready=model.sensors[i]===model.target[i];line([[c.x,c.y],[ready?320:120+i*140,300]],ready?accent:metal,3);}
          circle(320,300,55,'#6a2f46');rect(300,280,40,40,gold);text('✕',320,315,ink,26);break;
        case 'shield-iris':
          circle(320,275,200,metal);circle(320,275,170,ink);for(let i=0;i<8;i++){ctx.save();ctx.translate(320,275);ctx.rotate(i*Math.PI/4+t*.015);line([[70,-15],[150,-35],[150,35],[70,15]],dark,24);ctx.restore();}
          circle(320,275,45,accent+'44');break;
        case 'rack-busbars':
          rack(45,65,160,430);rack(435,65,160,430);pipe([[190,240],[450,240]],gold);pipe([[190,320],[450,320]],accent);text(model.isolated?'ISOLADO':'ENERGIZADO',320,360,model.isolated?accent:gold,18);break;
        case 'replica-flywheels':
          plate(45,100,550,375,ink);pipe([[130,220],[510,220]],gold);model.phase.forEach((v,i)=>gear(130+i*190,220,73,model.lock[i]?v: t*.5+v,model.lock[i]?accent:metal));
          text('MESTRE → RÉPLICAS',320,75,gold,20);break;
        case 'backbone-prisms':
          rack(40,70,100,415);rack(500,70,100,415);line([[90,220],[180,160+model.positions[0]*25],[460,160+model.positions[1]*25],[550,260]],accent,8);line([[460,160+model.positions[1]*25],[550,420]],gold,5);
          for(let i=0;i<8;i++){const x=130+(i*60+t*45)%370;rect(x,200,9,9,light);}break;
        case 'rack-gantry':
          pipe([[70,95],[570,95]]);for(let i=0;i<3;i++){rack(75+i*190,275,115,220);text(i===0?(model.componentId==='c09'?'ISOLADO':model.componentId==='c04'?'CONTROLE':'ORIGEM'):'RACK '+i,132+i*190,530,light,16);}
          line([[130+model.rail*190,95],[130+model.rail*190,260]],gold,5);if(model.cargo>=0)plate(105+model.rail*190,230,50,50,gold);
          model.racks.forEach((items,i)=>items.forEach((v,j)=>rect(275+i*190,315+j*60,80,40,accent)));break;
      }
      function mBound(i){return model.bounds[i];}
    }
    function position(c){
      let {x,y}=c;if(drag?.id===c.id&&c.mode==='drag')({x,y}=drag.point);
      if(drag?.id===c.id&&c.mode==='rail'&&c.dragAxis==='y')y+=(drag.value-c.value)*c.dragStep;
      if(drag?.id===c.id&&c.mode==='rail'&&c.dragAxis==='x')x+=(drag.value-c.value)*c.dragStep;
      const transition=transitions.get(c.id);
      if(transition&&!ByteRunner.repairScene.reducedMotion()){
        const progress=Math.min(1,(model.time-transition.start)/.25),ease=1-Math.pow(1-progress,3);
        x=transition.x+(x-transition.x)*ease;y=transition.y+(y-transition.y)*ease;
        if(progress===1)transitions.delete(c.id);
      }
      return {x,y};
    }
    function drawControl(c,t){
      const {x,y}=position(c);
      if(equipment){equipment.control(c,{x,y,t,focused,selection,hinted,preview:drag?.id===c.id?drag.value:c.value});return;}
      if(c.mode==='drag'&&!c.locked){const p=c.target;ctx.setLineDash([7,7]);ctx.strokeStyle=accent+'88';ctx.lineWidth=3;ctx.strokeRect(p.x-42,p.y-35,84,70);ctx.setLineDash([]);text(c.number??'↓',p.x,p.y+8,accent,24);}
      ctx.save();ctx.translate(x,y);
      const on=c.on||c.locked,value=drag?.id===c.id?drag.value:c.value??0;
      switch(c.kind){
        case 'gear':gear(0,0,22+(c.number??1)*5,(model.belt&&c.locked?t*(c.number%2?1:-1):0),gold);break;
        case 'wheel':case 'tuner':case 'scope':case 'cam':case 'screw':case 'micrometer':case 'valve':case 'reel':case 'drum':case 'mirror':case 'sensor':case 'spring':
          circle(0,5,42,ink);circle(0,0,40,metal);circle(0,0,31,dark);
          for(let i=0;i<=(c.max??4);i++){const a=-Math.PI*.75+i*Math.PI*1.5/(c.max||4);rect(Math.cos(a)*47-3,Math.sin(a)*47-3,6,6,i===c.mark?accent:metal);}
          ctx.save();ctx.rotate(-Math.PI*.75+value*Math.PI*1.5/(c.max||4));rect(0,-4,32,8,gold);ctx.restore();circle(0,0,7,light);if(c.kind==='screw')line([[-14,0],[14,0]],light,5);break;
        case 'dimm':plate(-83,-28,166,56,'#3e8a64');for(let i=0;i<4;i++)plate(-70+i*37,-16,28,26,ink);for(let i=0;i<15;i++)rect(-72+i*10,26,5,13,gold);break;
        case 'gpu':plate(-95,-38,190,76,'#394854');circle(-42,0,28,ink);gear(-42,0,22,t*2,metal);gear(40,0,22,-t*2,metal);rect(-80,39,130,12,gold);break;
        case 'plug':rect(-28,-22,56,44,ink);rect(-23,-18,46,32,on?accent:metal);rect(-16,-26,32,8,gold);for(let i=0;i<4;i++)rect(-16+i*9,17,5,9,light);break;
        case 'wire':line([[-35,0],[25,0]],['#d49660','#6ac494','#74acdf','#b18be0'][(c.number-1)%4],13);rect(25,-5,20,10,gold);text(c.number,-5,-15,light,17);break;
        case 'busbar':rect(-45,-13,90,26,gold);circle(-30,0,7,ink);circle(30,0,7,ink);break;
        case 'branch':pipe([[-32,-15],[0,0],[32,-15]],gold);plate(-20,0,40,38,dark);text(c.number,0,27,accent,18);break;
        case 'engraver':break; // The pantograph and its actual trace are drawn in scene space.
        case 'solder':
          if(c.mode==='stroke'){line([[-c.w/2+20,8],[c.w/2-20,8]],metal,12);line([[-c.w/2+20,8],[-c.w/2+20+(c.w-40)*value/c.max,8]],accent,6);rect(-c.w/2+10+(c.w-40)*value/c.max,-30,16,35,gold);}else{line([[-30,30],[20,-20]],gold,14);rect(20,-28,18,15,light);}break;
        case 'rail':plate(-60,-60,120,120);line([[-45,0],[45,0]],gold,14);line([[-45,-12],[45,-12]],ink,4);text(c.number,0,45,accent,18);break;
        case 'disk':circle(0,0,24,gold);rect(-4,-20,8,40,ink);break;
        case 'gate':case 'shutter':case 'sluice':
          plate(-34,-44,68,88,ink);for(let i=0;i<5;i++)rect(-28,-35+i*15,56,9,on?accent:metal);if(c.mode==='rail'){rect(-40,38,80,6,gold);circle(-35+value*70/(c.max||2),41,10,light);}break;
        case 'prism':ctx.beginPath();ctx.moveTo(-30,28);ctx.lineTo(0,-35);ctx.lineTo(35,28);ctx.closePath();ctx.fillStyle=accent;ctx.fill();line([[-18,19],[0,-18],[22,19]],light,3);text(value+1,0,56,gold,14);break;
        case 'blade':ctx.save();ctx.rotate(value*Math.PI/2);line([[-35,-30],[35,-10],[20,30],[-35,30]],light,15);ctx.restore();break;
        case 'station':circle(0,0,40,on?accent:metal);circle(0,0,29,ink);text(c.number,0,10,gold,28);break;
        case 'scanner':case 'elevator':case 'comb':case 'stripper':case 'mast':case 'gantry':
          line([[-42,0],[42,0]],metal,20);for(let i=0;i<=(c.max??2);i++)rect(-40+i*80/(c.max||2),-18,3,36,i===c.mark?accent:gold);plate(-52+value*80/(c.max||2),-20,30,40,light);break;
        case 'fork':
          line([[-40,0],[0,0],[35,-30]],metal,13);line([[0,0],[35,30]],metal,13);line([[-35,0],[0,0],[35,value%2?30:-30]],gold,8);break;
        case 'claw':line([[-32,-28],[-32,25],[-12,35]],gold,12);line([[32,-28],[32,25],[12,35]],gold,12);line([[0,-45],[0,-20]],metal,16);break;
        case 'fiber':circle(0,0,35,ink);circle(0,0,27,value===c.max?accent:metal);circle(0,0,7,gold);break;
        case 'press':plate(-40,-40,80,80,ink);line([[-28,-22],[28,-22]],metal,18);line([[-28,25],[28,25]],gold,16);rect(-10,-8,20,15,accent);break;
        case 'probe':line([[-24,30],[22,-28]],light,12);line([[22,-28],[32,-42]],gold,7);break;
        case 'pump':rect(-20,-30,40,60,metal);rect(-38,-35,76,12,gold);line([[0,30],[0,47]],accent,8);break;
        case 'vacuum':cable({x:40,y:40},{x:-25,y:-20},metal);rect(-40,-30,35,20,accent);break;
        default:
          plate(-28,-38,56,76,ink);rect(-14,on?-20:0,28,34,on?accent:gold);rect(-20,on?-23:-3,40,12,light);break;
      }
      // Small engraved glyphs replace text-heavy control rows.
      if(c.mode==='dial'||c.mode==='rail')text(value+1,0,73,light,14);
      if(c.number&&c.kind!=='wire'&&c.kind!=='station'&&c.kind!=='rail'&&c.kind!=='branch')text(c.number,0,62,gold,15);
      if(focused===c.id||selection===c.id||hinted===c.id){ctx.strokeStyle=hinted===c.id?accent:gold;ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.strokeRect(-c.w/2+2,-c.h/2+2,c.w-4,c.h-4);ctx.setLineDash([]);}
      ctx.restore();
    }
    function paint(){
      if(disposed)return;
      ctx.setTransform(.5,0,0,.5,0,0);ctx.clearRect(0,0,640,560);
      const t=ByteRunner.repairScene.reducedMotion()?0:model.time;
      background(t);controls.forEach(c=>drawControl(c,t));
      if(equipment)equipment.overlay();
      else if(model.done){rect(170,230,300,90,ink);text('SISTEMA RESTAURADO',320,285,accent,23);}
    }
    function dispatch(action,origin){if(callbacks.active()){
      if(action.target){const c=controls.find(c=>c.id===action.id);transitions.set(action.id,{x:origin?.x??c.x,y:origin?.y??c.y,start:model.time});}
      const keepSelection=controls.find(c=>c.id===selection)?.rotationId===action.id;
      if(!keepSelection)selection=null;hinted=null;callbacks.action(action);sync();}}
    function bind(button,id,target=false){
      const lookup=()=>controls.find(c=>c.id===id);
      const swapSelectedProcess=c=>{
        if(c.kind!=='software-process'||!selection||selection===c.id)return false;
        const selected=controls.find(c=>c.id===selection),zone=selected?.targets?.find(z=>Math.abs(c.x-z.x)<z.w/2&&Math.abs(c.y-z.y)<z.h/2);
        if(!zone)return false;dispatch({id:selection,target:zone.id});return true;
      };
      listen(button,'focus',()=>{focused=id;paint();});listen(button,'blur',()=>{focused=null;paint();});
      listen(button,'click',event=>{
        if(event.detail>0)return; // Pointer lifecycle below also handles physical clicks.
        const c=lookup();if(!c)return;
        if(c.mode==='target'){if(selection)dispatch({id:selection,target:c.id});return;}
        if(target){if(selection===id)dispatch({id,target:true});return;}
        if(c.mode==='drag'){if(swapSelectedProcess(c))return;if(c.pickAction)callbacks.action({id:c.pickAction});selection=id;paint();return;}
        dispatch({id,value:c.mode==='stroke'?Math.min(c.max,c.value+1):c.mode==='rail'?(c.value+1)%(c.max+1):undefined});
      });
      listen(button,'keydown',event=>{
        const c=lookup();if(!c)return;
        if(c.rotationId&&['r','R','ArrowLeft','ArrowRight'].includes(event.key)){
          event.preventDefault();event.stopPropagation();dispatch({id:c.rotationId});return;
        }
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)&&['dial','rail','stroke'].includes(c.mode)){
          event.preventDefault();event.stopPropagation();const delta=c.dragAxis==='y'?(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1):['ArrowLeft','ArrowDown'].includes(event.key)?-1:1;
          dispatch({id,value:event.key==='Home'?0:event.key==='End'?c.max:c.mode==='dial'?(c.value+delta+c.max+1)%(c.max+1):Math.max(0,Math.min(c.max,c.value+delta))});
        }
      });
      listen(button,'wheel',event=>{const c=lookup();if(c?.rotationId&&!c.locked){event.preventDefault();dispatch({id:c.rotationId});}},{passive:false});
      let startValue=0,startAngle=0,stroke=0;
      scene.bindPointer(button,{
        start(point,event){const c=lookup();if(!c||!callbacks.active()||c.locked)return false;
          if(c.mode==='target'){if(selection)dispatch({id:selection,target:c.id});return false;}
          if(target){if(selection===id)dispatch({id,target:true});return false;}
          if(c.pickAction)callbacks.action({id:c.pickAction});
          transitions.delete(id);
          startValue=c.value??0;startAngle=Math.atan2(point.y-c.y,point.x-c.x);stroke=0;
          drag={id,point,start:point,last:point,value:startValue,moved:false};button.focus({preventScroll:true});return true;},
        move(point,start){const c=lookup();if(!c||!drag)return;
          drag.moved||=Math.hypot(point.x-start.x,point.y-start.y)>8;
          if(c.mode==='stroke'){
            if(c.kind==='engraver'){
              // Follow the connected stencil in order, rather than rewarding scribbles.
              const progress=drag.value/c.max*4,segment=Math.min(3,Math.floor(progress)),a=model.points[segment],b=model.points[segment+1],dx=b[0]-a[0],dy=b[1]-a[1];
              const fraction=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/(dx*dx+dy*dy)));
              if(Math.hypot(point.x-a[0]-fraction*dx,point.y-a[1]-fraction*dy)<32&&segment+fraction<=progress+.65)drag.value=Math.max(drag.value,(segment+fraction)/4*c.max);
            }else if(c.kind==='solder'){
              if(Math.abs(point.y-c.y)<40)drag.value=Math.max(drag.value,Math.min(c.max,Math.floor((point.x-c.x+c.w/2-20)/(c.w-40)*c.max)));
            }else if(Math.hypot(point.x-c.x,point.y-c.y)<60){
              stroke+=Math.hypot(point.x-drag.last.x,point.y-drag.last.y);drag.value=Math.min(c.max,startValue+Math.floor(stroke/32));
            }
          }
          if(c.mode==='rail')drag.value=Math.max(0,Math.min(c.max,Math.round(startValue+(c.dragAxis==='y'?(point.y-start.y)/c.dragStep:c.dragAxis==='x'?(point.x-start.x)/c.dragStep:(point.x-start.x)/35-(point.y-start.y)/60))));
          if(c.mode==='dial'){const angle=Math.atan2(point.y-c.y,point.x-c.x);drag.value=((startValue+Math.round(ByteRunner.repairScene.angleDelta(startAngle*180/Math.PI,angle*180/Math.PI)/(c.angleStep??(270/c.max))))%(c.max+1)+c.max+1)%(c.max+1);}
          drag.point=point;drag.last=point;paint();
        },
        end(point){const c=lookup(),current=drag;drag=null;if(!c||!current)return;
          if(c.mode==='drag'){
            if(!current.moved){if(swapSelectedProcess(c))return;selection=id;paint();return;}
            const zone=c.targets?.find(z=>Math.abs(point.x-z.x)<z.w/2&&Math.abs(point.y-z.y)<z.h/2);
            const hit=c.target&&Math.abs(point.x-c.target.x)<54&&Math.abs(point.y-c.target.y)<54;
            if(zone||hit)dispatch({id,target:zone?.id??true},point);else{transitions.set(id,{x:point.x,y:point.y,start:model.time});paint();}
          }else if(['dial','rail','stroke'].includes(c.mode)){
            const value=current.moved?current.value:((c.value??0)+1)%(c.max+1);dispatch({id,value});
          }else dispatch({id});
        },
        cancel(){drag=null;selection=null;paint();}
      });
    }
    function sync(){
      controls=model.controls();
      const live=new Set();
      for(const c of controls){
        for(const target of (c.mode==='drag'&&c.target&&!c.locked?[false,true]:[false])){
          const key=c.id+(target?'-target':'');live.add(key);let button=elements.get(key);
          if(!button){button=document.createElement('button');button.type='button';button.className='repair-v2-handle';button.dataset.control=c.id;button.dataset.target=String(target);scene.stage.append(button);elements.set(key,button);bind(button,c.id,target);}
          const p=target?c.target:c;
          Object.assign(button.style,{left:p.x-c.w/2+'px',top:p.y-c.h/2+'px',width:c.w+'px',height:c.h+'px'});
          button.setAttribute('aria-label',(target?'Destino: ':'')+c.label+(['dial','rail','stroke'].includes(c.mode)?' · posição '+(c.value+1)+(c.mark!==undefined?' · marca '+(c.mark+1):''):''));
          button.disabled=!callbacks.active()||Boolean(c.locked);button.setAttribute('aria-pressed',String(Boolean(c.on||c.locked)));
        }
      }
      for(const [id,button] of elements)if(!live.has(id)){button.remove();elements.delete(id);}
      paint();
    }
    sync();
    return {scene,canvas,sync,paint,hint(id){hinted=id;paint();elements.get(id)?.focus({preventScroll:true});},
      update(dt){scene.update(dt);model.time+=dt;paint();},
      setPaused(value){scene.setPaused(value);},
      dispose(){disposed=true;abort.abort();scene.dispose();elements.clear();}};
  }
  ByteRunner.repairV2Renderer=Object.freeze({create});
})();
