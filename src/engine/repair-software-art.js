/* Four original pixel scenes: desktop, recovery bench, execution line and boot rig. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#080d20',dark:'#172039',metal:'#52667f',rim:'#8296ab',paper:'#d9e1d1',violet:'#a793eb',cyan:'#77e0dc',green:'#a0ecaa',gold:'#edc37d',red:'#f4959d'};
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const path=(points,c=p.cyan,w=3)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...points[0]);for(const q of points.slice(1))ctx.lineTo(...q);ctx.stroke();};
    const poly=(points,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...points[0]);for(const q of points.slice(1))ctx.lineTo(...q);ctx.closePath();ctx.fill();};
    const text=(value,x,y,size=14,c=p.paper)=>{ctx.font=`bold ${size}px monospace`;ctx.fillStyle=c;ctx.textAlign='center';ctx.fillText(String(value),Math.round(x),Math.round(y));};
    const circle=(x,y,r,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+7,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+6,y+6,w-12,3,p.rim+'80');};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();
    const age=since=>Math.max(0,m.time-(since??-10));
    function logo(x,y,size=14,color=p.cyan){
      for(const [xx,yy] of [[0,0],[1,0],[0,1],[1,1],[2,1],[0,2],[1,2]])rect(x+xx*size,y+yy*size,size-3,size-3,color);
    }
    function stars(){for(let i=0;i<35;i++)rect(20+(i*137)%600,35+(i*83)%460,i%4===0?4:2,2,i%3?p.metal+'70':p.violet+'66');}
    function shell(){rect(0,0,640,560,p.ink);rect(10,10,620,540,p.dark);rect(18,18,604,4,p.rim);for(const x of [22,618])for(const y of [28,532]){rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);}}
    function desktop(t){
      rect(0,0,640,560,'#172541');stars();
      for(let i=0;i<6;i++)path([[620-i*34,335],[620-i*34,480-i*21],[350,480-i*21]],'#295077',2);
      logo(465,285,32,'#42639b');rect(0,0,640,40,'#091329');text('BYTEOS',73,26,17,p.cyan);text('ÁREA DE TRABALHO',330,26,14,p.rim);
      rect(0,531,640,29,'#0a142a');logo(20,538,6);text('ARQUIVOS   ·   PROTEÇÃO',245,550,13,p.rim);led(590,546,true,p.cyan);
      plate(425,363,180,150,'#21253d');rect(429,367,172,25,'#424669');text('QUARENTENA',515,384,14,p.gold);
      rect(447,400,136,82,p.ink);for(let i=0;i<5;i++)path([[450,408+i*15],[580,408+i*15]],'#29364e',2);
      for(let i=0;i<6;i++)if(m.quarantined[i]!==null){
        const v=m.quarantined[i];
        if(v<1){ctx.save();ctx.translate(515,442);ctx.scale(1-v*.8,1-v*.8);file(0,0,i,false,true);ctx.restore();
          for(let n=0;n<10;n++)rect(468+(n*19+v*70)%90,417+(n%4)*13,5*(1-v),5,p.red);
        }
      }
      text(m.deleted.filter(Boolean).length+'/3 ISOLADOS',515,504,12,p.cyan);
      rejection('quarantine',515,450,166,140);
      if(m.done){text('ÁREA DE TRABALHO SEGURA',246,472,17,p.green);}
    }
    function file(x,y,i,scanned,small=false){
      ctx.save();ctx.translate(x,y);const w=small?44:54,h=small?56:68;
      rect(-w/2+5,-h/2+6,w,h,'#060c1f');poly([[-w/2,-h/2],[w/2-14,-h/2],[w/2,-h/2+14],[w/2,h/2],[-w/2,h/2]],p.paper);
      poly([[w/2-14,-h/2],[w/2-14,-h/2+14],[w/2,-h/2+14]],p.metal);
      for(let row=0;row<4;row++)rect(-w/2+10,-15+row*10,w-20-(row%2)*7,3,'#738892');
      const infected=m.infected.includes(i),progress=m.scans[i];
      if(progress!==null&&progress<1){rect(-w/2-5,-h/2+progress*h,w+10,4,p.cyan);rect(-w/2-5,-h/2,w+10,h*progress,p.cyan+'20');}
      if(scanned){circle(w/2-2,h/2-2,13,infected?p.red:p.green);text(infected?'×':'✓',w/2-2,h/2+4,18,p.ink);}
      else if(infected&&!small){rect(-24,-20,8,3,'#afa0ce');rect(14,8,11,3,'#afa0ce');}
      ctx.restore();
    }
    function picture(x,y,group){
      if(group===0){
        rect(x,y,480,100,'#294d78');rect(x,y+60,480,40,'#417a70');circle(x+352,y+28,20,p.gold);
        poly([[x,y+83],[x+86,y+18],[x+178,y+82],[x+248,y+29],[x+340,y+87],[x+410,y+37],[x+480,y+83],[x+480,y+100],[x,y+100]],'#8ec2b8');
        poly([[x+14,y+100],[x+118,y+69],[x+201,y+100],[x+286,y+70],[x+380,y+100]],'#295856');
      }else{
        rect(x,y,480,100,'#16343e');path([[x+26,y+50],[x+130,y+50],[x+130,y+22],[x+290,y+22],[x+290,y+67],[x+451,y+67]],p.gold,6);
        for(let i=0;i<4;i++){rect(x+30+i*124,y+33,36,35,p.ink);rect(x+36+i*124,y+39,24,21,p.cyan);}
      }
    }
    function fragment(x,y,index,ghost=false){
      const group=Math.floor(index/3),col=index%3;
      ctx.save();ctx.translate(x,y);
      ctx.beginPath();ctx.moveTo(-80,-50);ctx.lineTo(80,-50);ctx.lineTo(80,-12);
      if(col<2){ctx.lineTo(93,-12);ctx.lineTo(93,12);ctx.lineTo(80,12);}ctx.lineTo(80,50);ctx.lineTo(-80,50);ctx.lineTo(-80,12);
      if(col>0){ctx.lineTo(-67,12);ctx.lineTo(-67,-12);ctx.lineTo(-80,-12);}ctx.closePath();ctx.clip();
      if(ghost)ctx.globalAlpha=.25;picture(-80-col*160,-50,group);
      if(m.rebuild[group]!==1){rect(-73,28,36,18,p.ink);text(String.fromCharCode(65+group)+(col+1),-55,42,12,p.paper);}
      ctx.restore();
      if(!ghost){ctx.strokeStyle=p.paper;ctx.lineWidth=2;ctx.strokeRect(x-79,y-49,158,98);}
    }
    function recovery(){
      shell();rect(25,28,590,299,'#101a2b');
      for(let group=0;group<2;group++){
        const y=120+group*140;
        text(group===0?'A · imagem.png':'B · configuracao.sys',240,y-63,13,p.rim);
        for(let col=0;col<3;col++){fragment(160+col*160,y,group*3+col,true);rejection('recovery-slot'+(group*3+col),160+col*160,y,157,108);}
        if(m.rebuild[group]>0&&m.rebuild[group]<1){rect(80+480*m.rebuild[group],y-52,5,104,p.cyan);}
        if(m.rebuild[group]===1){picture(80,y-50,group);text('✓',590,y+8,24,p.green);}
      }
      path([[30,339],[610,339]],p.metal,4);text('FRAGMENTOS RECUPERÁVEIS',320,358,14,p.gold);
      for(let i=0;i<12;i++)rect(30+i*53,546,25,3,p.metal);
    }
    function module(x,y,index,fault=false){
      ctx.save();ctx.translate(x,y);rect(-48+5,-47+7,96,94,p.ink);rect(-48,-47,96,94,fault?'#864b62':'#465a70');rect(-41,-40,82,80,fault?'#443047':'#192d43');
      for(let i=0;i<6;i++){rect(-57,-33+i*13,9,5,p.gold);rect(48,-33+i*13,9,5,p.gold);}
      rect(-30,-31,60,42,fault?p.red:p.violet);logo(-15,-23,10,p.ink);text(index+1,28,-14,16,p.ink);text(m.labels[index],0,31,11,p.paper);ctx.restore();
    }
    function execution(t){
      shell();rect(27,45,586,202,'#182737');text('DEPENDÊNCIAS',320,41,14,p.gold);
      for(let i=0;i<4;i++){text((i+1)+' · '+m.labels[i],110+i*140,74,11,p.cyan);rect(64+i*140,92,92,9,p.metal);if(i<3)text('→',180+i*140,162,22,p.gold);}
      plate(38,282,454,104,p.ink);rect(49,309,427,48,'#384a5e');
      for(let i=0;i<16;i++){const x=52+(i*28+(m.running?t*65:0))%420;rect(x,316,10,34,'#1c2b3b');}
      for(let i=0;i<8;i++){circle(64+i*55,378,14,p.metal);path([[58+i*55,378],[70+i*55,378]],p.ink,3);}
      plate(475,266,131,151,m.failedAt>=0?'#4c2941':'#223d50');rect(498,288,85,88,p.ink);logo(518,305,17,m.failedAt>=0?p.red:p.cyan);text('CPU',540,399,19,p.paper);
      for(let i=0;i<4;i++)led(390+i*44,463,m.processed.length>i);
      text('EXECUÇÃO',180,531,14,p.gold);
      if(m.failedAt>=0){text('FALHA NA ETAPA '+(m.failedAt+1),420,513,15,p.red);if(m.faultFor>0&&motion())for(let i=0;i<7;i++)rect(485+(i*23)%100,285+(i*37+t*33)%90,8,3,p.red);}
      if(m.done)text('FLUXO RESTAURADO',420,513,15,p.green);
    }
    function cable(a,b,c){
      for(const [color,w] of [[p.ink,15],[c,8],['#ffffff33',2]]){
        ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+75,a.y+40,b.x-65,b.y+35,b.x,b.y);ctx.stroke();
      }
    }
    function restore(state){
      const {t,position}=state;shell();plate(66,28,508,63,p.ink);
      if(m.rebooting){
        const title=m.restart<.35?'VERIFICANDO MÓDULOS':m.restart<.8?'REINICIANDO BYTEOS':'SISTEMA PRONTO';
        text(title,320,56,17,p.cyan);rect(86,71,468*m.restart,6,p.green);
      }else text('CIRCUITO DE RESTAURAÇÃO',320,65,18,p.rim);
      const names=['CARREGADOR','MEMÓRIA','SISTEMA'];
      for(let i=0;i<3;i++){
        const x=125+i*195;plate(x-69,105,138,111,m.switches[i]?'#244c4b':'#1c2b43');
        rect(x-44,125,88,53,p.ink);logo(x-24,133,13,m.switches[i]?p.green:p.metal);text(names[i],x,200,12,p.paper);led(x+50,119,m.switches[i]);
        path([[x,219],[x,313]],m.switches[i]?p.green:p.metal,8);text(i+1,x,424,17,p.gold);
        if(i<2)text('→',222+i*195,160,28,p.gold);
      }
      for(let i=0;i<2;i++){
        const c=m.controls().find(c=>c.id==='boot-link'+i);cable({x:175+i*195,y:225},position(c),i?p.gold:p.cyan);
        const x=i?515:290;plate(x-30,224,60,42,p.ink);rect(x-21,231,42,28,p.metal);
        for(let pin=0;pin<3;pin++)rect(x-14+pin*12,237,6,15,p.ink);
        rejection('boot-port'+i,x,245,110,101);
        if(!m.links[i])text('LIGAÇÃO '+(i+1),135+i*270,550,12,i?p.gold:p.cyan);
      }
      if(m.rebooting&&motion()){const x=66+(t*75)%508;rect(x,31,3,53,p.cyan+'55');}
    }
    function rejection(id,x,y,w,h){if(m.rejected!==id||m.rejectFor<=0)return;ctx.strokeStyle=p.red;ctx.lineWidth=4;ctx.strokeRect(x-w/2,y-h/2,w,h);}
    function background(state){
      rect(0,0,640,560,p.ink);
      if(entry.key==='virus-cleanup')desktop(state.t);
      else if(entry.key==='file-recovery')recovery();
      else if(entry.key==='process-repair')execution(state.t);
      else restore(state);
    }
    function control(c,state){
      let {x,y,t}=state;
      if(c.mode!=='target'){
        if(c.kind==='software-file'){
          file(x,y,c.number,m.scans[c.number]===1);text(m.names[c.number],x,y+54,12,p.paper);
        }else if(c.kind==='software-fragment'){
          const i=c.number,placed=m.slots.includes(i);
          if(placed&&motion())y-=12*Math.max(0,1-age(m.placedAt[i])/.25);
          if(m.rebuild[Math.floor(i/3)]<1)fragment(x,y,i);
        }else if(c.kind==='software-process'){
          if(m.running&&m.order[m.cursor]===c.number){x=90+m.travel*365;y=331;}
          else if(m.running&&m.processed.includes(c.number))return;
          module(x,y,c.number,m.failedAt>=0&&m.order[m.failedAt]===c.number);
        }else if(c.kind==='software-execute'){
          plate(x-47,y-31,94,73,p.ink);const v=state.preview??c.value;path([[x,y+29],[x-25+v*50,y-35]],p.rim,11);rect(x-47+v*50,y-47,43,21,p.gold);
        }else if(c.kind==='software-boot-plug'){
          const i=c.number,offset=m.links[i]&&motion()?10*Math.max(0,1-age(m.linkedAt[i])/.25):0;
          rect(x-28-offset,y-23,56,46,i?p.gold:p.cyan);rect(x-15-offset,y-29,30,9,p.paper);for(let n=0;n<3;n++)rect(x-16+n*12-offset,y-12,7,24,p.ink);
        }else if(c.kind==='software-boot-switch'){
          plate(x-33,y-40,66,80,p.ink);rect(x-21,y-30,42,59,'#35455c');rect(x-18,c.on?y-28:y+1,36,26,c.on?p.green:p.gold);rect(x-23,c.on?y-33:y-3,46,10,p.paper);
          rejection(c.id,x,y,c.w,c.h);
        }
      }
      if(state.focused===c.id||state.selection===c.id||state.hinted===c.id){ctx.strokeStyle=state.hinted===c.id?p.cyan:p.gold;ctx.lineWidth=3;ctx.setLineDash([7,6]);ctx.strokeRect(x-c.w/2+3,y-c.h/2+3,c.w-6,c.h-6);ctx.setLineDash([]);}
    }
    function overlay(){
      if(!m.done)return;
      const titles={'virus-cleanup':'AMEAÇAS REMOVIDAS','file-recovery':'ARQUIVOS RECUPERADOS','process-repair':'PROCESSOS RESTAURADOS','system-restore':'SISTEMA RESTAURADO'};
      plate(152,8,336,35,p.ink);text(titles[entry.key],320,31,16,p.green);
    }
    return {background,control,overlay};
  }
  ByteRunner.softwareRepairArt=Object.freeze({create});
})();
