/* Quatro equipamentos DNS em pixel art. Animações representam consulta e resposta. */
(() => {
  'use strict';
  function create(ctx,entry,m){
    const p={ink:'#0b1426',dark:'#20344b',metal:'#586f8c',rim:'#adc0d2',gold:'#efce85',cyan:'#8adfe7',green:'#a3e4ac',red:'#f097a2',violet:'#b5a5ef'};const colors=[p.cyan,p.gold,p.violet];let state;
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const text=(s,x,y,size=13,c=p.rim)=>{ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(String(s),Math.round(x),Math.round(y));};
    const line=(pts,c=p.metal,w=4)=>{ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='miter';ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.stroke();};
    const poly=(pts,c)=>{ctx.beginPath();ctx.fillStyle=c;ctx.moveTo(...pts[0]);for(const a of pts.slice(1))ctx.lineTo(...a);ctx.closePath();ctx.fill();};
    const plate=(x,y,w,h,c=p.dark)=>{rect(x+5,y+6,w,h,p.ink);rect(x,y,w,h,p.metal);rect(x+4,y+4,w-8,h-8,c);rect(x+7,y+7,w-14,2,p.rim);};
    const screw=(x,y)=>{rect(x-4,y-4,8,8,p.rim);rect(x-2,y-1,4,2,p.ink);};
    const led=(x,y,on,c=p.green)=>{rect(x-6,y-4,12,8,p.ink);rect(x-3,y-2,6,4,on?c:p.metal);};
    const packet=(x,y,color)=>{rect(x-12,y-9,24,18,p.ink);rect(x-9,y-6,18,12,color);rect(x-5,y-2,8,3,p.ink);};
    const motion=()=>!ByteRunner.repairScene.reducedMotion();const t=()=>motion()?state.t:0;
    function shell(title,subtitle){rect(0,0,640,560,p.ink);plate(12,12,616,536);rect(20,20,600,48,'#14253b');text(title,320,42,20,p.gold);text(subtitle,320,61,12);for(const x of [25,615])for(const y of [27,530])screw(x,y);for(let i=0;i<23;i++)rect(32+i*26,525,14,3,p.ink);}
    function travel(points,q){const v=Math.min(.99999,Math.max(0,q))*(points.length-1),i=Math.floor(v),f=v-i;return [points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f];}
    function progressive(points,q,color){if(q<=0)return;const n=Math.min(1,q)*(points.length-1),i=Math.min(points.length-2,Math.floor(n)),f=n-i;line([...points.slice(0,i+1),[points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f]],color,5);}
    function cable(a,b,color){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+100,a.y,b.x-110,b.y,b.x,b.y);ctx.lineWidth=11;ctx.strokeStyle=p.ink;ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle=color;ctx.stroke();}
    function domains(){
      shell('CONEXÃO DE DOMÍNIOS','ZONA AUTORITATIVA: '+m.zone+' · SIGA OS REGISTROS A E CNAME');
      m.records.forEach((r,i)=>{
        const y=160+i*135;plate(35,y-45,232,90);text(r.name,151,y-17,14,colors[i]);text(r.type,63,y+9,12,p.gold);text(r.value,167,y+10,12);led(65,y+29,m.resolution[i]===1);
        if(m.links[i]>=0){const b={x:520,y:160+m.links[i]*135};cable({x:278,y},b,colors[i]);const q=m.resolution[i];if(q<1){const f=q<.5?q*2:(1-q)*2,[x,py]=travel([[285,y],[400,y],[440,b.y],[520,b.y]],f);packet(x,py,q<.5?colors[i]:p.green);}else text('RESOLVIDO',155,y+61,12,p.green);}
        else if(state.drag?.id==='domain'+i)cable({x:265,y},state.position(m.controls().find(c=>c.id==='domain'+i)),colors[i]);
      });
    }
    function tree(){
      shell('REPARO DA ÁRVORE DNS','RAIZ → DOMÍNIOS DE TOPO → AUTORIDADES DAS ZONAS');
      for(let i=1;i<5;i++){const n=m.nodes[i],parent=m.nodes[n.parent],mid=(parent.y+n.y)/2,points=[[parent.x,parent.y+30],[parent.x,mid],[n.x,mid],[n.x,n.y-28]];ctx.setLineDash([6,8]);line(points,'#455a74',3);ctx.setLineDash([]);progressive(points,m.links[i],colors[i%3]);if(m.links[i]>0&&m.links[i]<1){const [x,y]=travel(points,m.links[i]);packet(x,y,p.green);}}
      text('SERVIDORES DISPONÍVEIS',320,450,13,p.gold);for(let i=0;i<5;i++)rect(34+i*120,460,92,4,p.metal);
    }
    function cache(){
      shell('LIMPEZA DO CACHE DNS','MEMÓRIA FÍSICA · TEMPO DE REFERÊNCIA: '+m.now+' s');
      plate(30,105,580,221,'#273347');
      for(let i=0;i<4;i++){const x=100+i*145;rect(x-61,133,122,149,p.ink);for(let j=0;j<9;j++)rect(x-52+j*13,283,5,15,p.gold);led(x,309,m.remaining(i)>0&&(!m.removed[i]||m.inserted[i]));}
      text('PRESERVE TTL VÁLIDO · RENOVE APENAS OS EXPIRADOS',320,347,12,p.gold);text('REPOSIÇÕES RECEBIDAS DA AUTORIDADE',347,365,12,p.cyan);
      if(m.syncing){const y=136+(t()*70)%145;line([[45,y],[595,y]],p.green,2);rect(75,331,490*m.stable,5,p.green);}
    }
    function query(){
      shell('RASTREAMENTO DE CONSULTA','CONSULTA: '+m.domain+' · TIPO A');
      const s=m.servers;
      ctx.setLineDash([5,8]);for(const key of ['com','org'])line([[s.root.x,s.root.y],[s[key].x,s[key].y]],'#3c526b',2);line([[s.com.x,s.com.y],[s.authorityCom.x,s.authorityCom.y]],'#3c526b',2);line([[s.org.x,s.org.y],[s.authorityOrg.x,s.authorityOrg.y]],'#3c526b',2);ctx.setLineDash([]);
      for(const [key,n] of Object.entries(s)){plate(n.x-49,n.y-26,98,52);text(n.label,n.x,n.y+1,key==='resolver'?11:12,key==='resolver'?p.cyan:p.rim);for(let j=0;j<3;j++)rect(n.x-29+j*22,n.y+10,13,6,p.ink);led(n.x+34,n.y+15,m.visited.includes(key));}
      text(m.done?'RESPOSTA: '+m.answer:'PRÓXIMO: '+s[m.expected[Math.min(2,m.step)]].label,315,83,12,p.gold);
      if(m.flight){const f=m.flight,b=s[f.destination],out=f.progress<.5,q=out?f.progress*2:(1-f.progress)*2,x=s.resolver.x+(b.x-s.resolver.x)*q,y=s.resolver.y+(b.y-s.resolver.y)*q;line([[s.resolver.x,s.resolver.y],[b.x,b.y]],'#6a82a1',3);packet(x,y,!f.correct?p.red:out?p.violet:m.step===2?p.green:p.gold);text(!f.correct?'SEM RESPOSTA':out?'CONSULTA':m.step===2?'RESPOSTA':'REFERÊNCIA',x,y-15,10,!f.correct?p.red:p.cyan);}
      text('ETAPAS CONFIRMADAS '+m.visited.length+'/3',320,365,12,p.green);
      for(let i=0;i<3;i++)text(['RAIZ','TOPO','AUTORIDADE'][i],110+i*190,380,12,i===m.step?p.gold:p.metal);
    }
    function background(s){state=s;({'record-engraver':domains,'delegation-hoist':tree,'cache-carousel':cache,'query-courier':query})[entry.key]();}
    function cartridge(record,remaining,expired){
      plate(-57,-62,114,124,expired?'#663c4e':'#304a4d');rect(-45,-47,90,77,p.ink);const parts=record.name.split('.');text(parts[0],0,-28,13,expired?p.red:p.cyan);text(parts.slice(1).join('.'),0,-12,11);text(record.value,0,7,11);text('TTL '+remaining+' s',0,25,13,expired?p.red:p.green);for(let i=0;i<7;i++)rect(-43+i*14,50,6,15,p.gold);if(expired){line([[-53,-52],[-43,-33],[-52,-18],[-40,-3]],p.red,3);text('EXPIRADO',0,44,11,p.red);}else text('VÁLIDO',0,44,11,p.green);
    }
    function control(c,s){ctx.save();ctx.translate(s.x,s.y);
      if(c.id.startsWith('ip')){plate(-73,-35,146,70);rect(-63,-23,126,40,p.ink);text(m.ips[+c.id.at(-1)],0,3,15,p.cyan);for(let i=0;i<5;i++)rect(-43+i*19,22,10,5,p.gold);}
      else if(c.id.startsWith('domain')){const i=+c.id.at(-1);rect(-20,-15,40,30,p.rim);rect(-14,-9,28,18,colors[i]);rect(-8,-22,16,9,p.gold);if(m.links[i]<0)text('CONECTAR',0,43,11,colors[i]);}
      else if(c.id.startsWith('seat')){const n=m.nodes[+c.id.at(-1)];ctx.strokeStyle=p.metal;ctx.lineWidth=3;ctx.setLineDash([6,7]);ctx.strokeRect(-70,-34,140,68);ctx.setLineDash([]);text(n.role,0,-6,13,p.gold);text(n.zone,0,16,13);}
      else if(c.id.startsWith('server')){const i=+c.id.at(-1),n=m.nodes[i];plate(-52,-28,104,56);text(n.zone,0,-3,13,p.cyan);rect(-36,8,72,11,p.ink);for(let j=0;j<4;j++)led(-26+j*17,13,m.placed[i]&&m.links[i]===1);text(n.parent<0?'RAIZ':n.parent===0?'TOPO':'AUTORIDADE',0,42,10,p.gold);}
      else if(c.id==='discard'){plate(-38,-30,76,60,p.ink);rect(-29,-21,58,38,'#4e3245');text('RETIRAR',0,49,11,p.red);}
      else if(c.id.startsWith('slot')){const i=+c.id.at(-1);if(m.removed[i]&&!m.inserted[i]){text('BANCO '+(i+1),0,-15,12);text('VAZIO',0,8,13,p.gold);}}
      else if(c.id.startsWith('cartridge')){const i=+c.id.at(-1);cartridge(m.entries[i],m.remaining(i),m.expired.includes(i));}
      else if(c.id.startsWith('fresh')){const r=m.replacements[+c.id.at(-1)],age=m.time-m.insertedAt[r.slot];if(m.inserted[r.slot]&&motion())ctx.translate(0,Math.max(0,1-age/.4)*25);cartridge(r,r.ttl,false);}
      else if(c.id.startsWith('gate')){
        const i=+c.id.at(-1),v=s.preview??c.value,active=i===m.step&&!m.flight;plate(-45,-29,90,58,active?'#34425b':p.dark);for(let j=0;j<3;j++)rect(-32+j*28,-20,9,8,j===v?p.gold:p.metal);line([[0,24],[0,5],[-28+v*28,-15]],active?p.gold:p.metal,7);screw(0,5);text(m.servers[m.options[i][v]].label,0,49,12,active?p.gold:p.rim);
      }else{plate(-36,-25,72,50);rect(-22,-13,44,26,c.on?p.green:p.gold);text(c.on?'✓':'▶',0,7,18,p.ink);text(c.id==='send'?'ENVIAR':'ESTABILIZAR',0,46,11,p.gold);}
      if(s.focused===c.id||s.selection===c.id||s.hinted===c.id){ctx.strokeStyle=p.gold;ctx.lineWidth=3;ctx.strokeRect(-c.w/2+3,-c.h/2+3,c.w-6,c.h-6);}ctx.restore();
    }
    function overlay(){if(m.done){plate(110,225,420,91,p.ink);text('RESOLUÇÃO DNS RESTAURADA',320,266,22,p.green);text(m.answer||'NOMES E REGISTROS CONFIRMADOS',320,294,14,p.cyan);}}
    return {background,control,overlay};
  }
  ByteRunner.dnsRepairArt=Object.freeze({create});
})();
