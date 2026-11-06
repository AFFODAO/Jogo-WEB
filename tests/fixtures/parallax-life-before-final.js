/* Decorative raster animation only. No simulation, random state or world writes. */
(() => {
  const api=ByteRunner,mod=(v,n)=>(v%n+n)%n,clamp=v=>Math.max(0,Math.min(1,v));
  const key='byteRunner.scenery.v1',settings={reduceParticles:false,reduceAnimations:false};
  try{const saved=JSON.parse(localStorage.getItem(key));for(const k of Object.keys(settings))if(typeof saved?.[k]==='boolean')settings[k]=saved[k];}catch{}
  function configure(value){
    for(const k of Object.keys(settings))if(typeof value?.[k]==='boolean')settings[k]=value[k];
    try{localStorage.setItem(key,JSON.stringify(settings));}catch{}
  }
  for(const input of document.querySelectorAll('[data-scenery-setting]')){
    input.checked=settings[input.dataset.scenerySetting];
    input.addEventListener('input',()=>configure({[input.dataset.scenerySetting]:input.checked}));
  }
  const names={hardware:['Placa-mãe','Memória RAM','GPU e barramentos','Alimentação final'],software:['Desktop','Diretórios','Processos','Sistema'],switch:['Backplane','Conexões','Portas ativas','Uplink'],router:['LAN','Interfaces','Rotas','Encaminhamento'],wifi:['Associação','Relays','Antenas','Uplink'],cabling:['Entrada','Dutos','Prumadas','Distribuição'],dhcp:['Diagnóstico','Sub-redes','Endereçamento','Gateway'],dns:['Raiz','Domínios','Subdomínios','Resolução'],firewall:['Perímetro','Inspeção','Barreiras','Cidadela'],servers:['Data center','Torres','Backbone','Núcleo']};
  // Four authored Hardware silhouettes, cached at native resolution.
  function hardwareBank(){
    const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    for(let n=0;n<4;n++){
      const rect=(a,b,w,h,color)=>{x.fillStyle=color;x.fillRect(n*128+a,b,w,h);};
      rect(12,20,104,88,'#0a2022');rect(12,20,104,2,'#25433d');rect(16,104,100,4,'#061719');
      if(n===0){
        rect(40,38,48,48,'#1a3530');rect(46,44,36,36,'#102723');
        for(const p of [44,56,68,80]){rect(p,30,4,8,'#3a4a38');rect(p,86,4,8,'#3a4a38');}
        rect(20,54,16,2,'#284b3b');rect(92,68,18,2,'#284b3b');
      }else if(n===1){
        for(const y of [34,66]){
          rect(22,y,84,24,'#1b3931');
          for(const a of [30,54,78]){rect(a,y+4,16,12,'#0c2422');rect(a+2,y+20,12,2,'#4e5037');}
        }
      }else if(n===2){
        rect(20,32,88,58,'#1b3934');rect(26,40,38,40,'#102626');
        for(const y of [42,52,62,72])rect(72,y,28,4,'#2d4c44');
        for(const a of [28,42,56,70,84])rect(a,94,8,6,'#4b5039');
        rect(18,112,92,2,'#294b3d');
      }else{
        for(const a of [24,48,72,96]){rect(a,30,8,54,'#203c34');rect(a,30,2,54,'#365746');}
        rect(20,90,88,8,'#254b38');rect(22,90,84,2,'#457053');
        for(const a of [28,60,92])rect(a,100,8,2,'#435b3b');
      }
    }
    return c;
  }
  function create(phase,config){
    const theme=config.theme,labels=names[theme]||names.hardware,bank=theme==='hardware'?hardwareBank():null;
    const specs=(phase?.entities?.components||[]).filter(c=>Number.isFinite(c.x)&&Number.isFinite(c.y)).map(c=>({id:c.id,x:c.x,y:c.y,w:c.width||34,h:c.height||44}));
    const horizontal=phase?.map?.layout!=='vertical'&&(phase?.map?.width||0)>=(Number(phase?.map?.height)||0);
    const startsHigh=(phase?.map?.start?.y||0)<(Number(phase?.map?.height)||0)/2;
    let disposed=false;
    function region(view){
      const w=phase?.map?.width||view.width,h=Number(phase?.map?.height)||view.height;
      const axis=horizontal||h<=view.height?'x':'y',extent=Math.max(1,(axis==='x'?w-view.width:h-view.height));
      let progress=clamp(view[axis]/extent);if(axis==='y'&&!startsHigh)progress=1-progress;
      const position=progress*3,from=Math.min(3,Math.floor(position)),to=Math.min(3,from+1),t=position-from,blend=t*t*(3-2*t);
      return {axis,progress,from,to,blend,labels:[labels[from],labels[to]]};
    }
    return Object.freeze({region,
      get stats(){return {bytes:bank?bank.width*bank.height*4:0,components:specs.length};},
      draw(ctx,view,time,visuals){
        if(disposed)return;
        const reduced=api.experience?.settings.reducedEffects,still=reduced||settings.reduceAnimations,t=still?0:time;
        if(reduced)return;
        const zone=region(view),accent=config.accent;
        ctx.save();
        try{
          ctx.imageSmoothingEnabled=false;
          // Regional landmarks are sparse and move at the existing near rate.
          // Cross-fade only adjacent motifs; no world-size surfaces or rebuilds.
          if(!reduced){
            const p=config.planes[2],ox=Math.floor(view.x*p.rateX),oy=Math.floor(view.y*p.rateY),pitch=768;
            for(let row=Math.floor(oy/pitch);row<Math.ceil((oy+view.height)/pitch);row++)for(let col=Math.floor(ox/1024);col<Math.ceil((ox+view.width)/1024);col++){
              const x=col*1024+330-ox,y=row*pitch+160-oy;
              if(x>view.width||x+256<0||y>view.height||y+256<0)continue;
              for(const [index,weight] of [[zone.from,1-zone.blend],[zone.to,zone.blend]]){
                if(weight<.001)continue;ctx.globalAlpha=.64*weight;
                if(bank)ctx.drawImage(bank,index*128,0,128,128,x,y,256,256);
                else{
                  const frames=[0,9,19,19],frame=frames[index];
                  const source=visuals.source(config.asset);
                  if(source)ctx.drawImage(source,frame%8*128,Math.floor(frame/8)*128,128,128,x,y,256,256);
                }
              }
              // Bounded neon strip and a pixel shadow, not a halo or blur.
              ctx.globalAlpha=.12+(zone.progress*.035)+(still?0:Math.sin(t*.55)*.015);
              ctx.fillStyle=accent;ctx.fillRect(x+44,y+190,164,2);
              ctx.fillStyle='#041014';ctx.globalAlpha=.4;ctx.fillRect(x+12,y+218,230,4);
            }
          }
          const plane=config.planes[1],size=128*plane.scale,pitch=size*(config.rowSpacing||1),ox=Math.floor(view.x*plane.rateX),oy=Math.floor(view.y*plane.rateY);
          // At most six visible equipment marks; slowly staggered, tiny lit areas.
          let count=0;
          for(let row=Math.floor(oy/pitch);row<Math.ceil((oy+view.height)/pitch)&&count<6;row++)for(let col=Math.floor(ox/size);col<Math.ceil((ox+view.width)/size)&&count<6;col++){
            const variant=mod(col+row,8),occupied=theme==='hardware'?[0,4].includes(variant):[1,5].includes(variant);
            if(!occupied)continue;count++;
            const x=Math.floor(col*size-ox),y=Math.floor(row*pitch-oy),cycle=mod(t+col*1.7+row*2.3,12);
            const pulse=still?.12:.10+.08*(.5+.5*Math.sin(cycle*Math.PI/6));
            ctx.fillStyle=accent;ctx.globalAlpha=pulse;ctx.fillRect(x+26,y+94,12,2);ctx.fillRect(x+24,y+92,16,6);
            ctx.globalAlpha=.20+(still?0:.08*Math.sin(cycle*Math.PI/6));ctx.fillRect(x+28,y+94,4,2);
            // Monitor scan advances a few pixels at 2 Hz, without changing its fill.
            if(['software','dhcp','dns','router'].includes(theme)){
              const yy=44+(still?0:Math.floor(t*2+col)%4)*4;
              ctx.globalAlpha=.20;ctx.fillRect(x+38,y+yy,18,2);
            }
            if(['hardware','cabling','servers'].includes(theme)){
              // Stepped four-frame fan, raster arms with a fixed housing.
              const fx=x+76,fy=y+50,frame=still?0:mod(Math.floor(t*3+col+row),4);
              ctx.fillStyle='#10282a';ctx.globalAlpha=.7;ctx.fillRect(fx-10,fy-10,20,20);
              ctx.fillStyle='#36534c';ctx.globalAlpha=.6;ctx.fillRect(fx-8,fy-10,16,2);ctx.fillRect(fx-10,fy-8,2,16);
              ctx.fillStyle='#467061';ctx.globalAlpha=.45;
              const arms=[[[2,0,6,2],[-8,0,6,2],[0,2,2,6],[0,-8,2,6]],[[2,2,4,4],[-6,-6,4,4],[-6,2,4,4],[2,-6,4,4]],[[0,2,6,2],[-6,-2,6,2],[-2,0,2,6],[2,-6,2,6]],[[2,0,4,4],[-6,-4,4,4],[-4,2,4,4],[0,-6,4,4]]][frame];
              for(const [a,b,w,h] of arms)ctx.fillRect(fx+a,fy+b,w,h);
              ctx.fillStyle='#1d3630';ctx.fillRect(fx-2,fy-2,4,4);
            }
            if(!still&&cycle<2.5){
              const step=Math.floor(cycle*12);ctx.fillStyle=accent;ctx.globalAlpha=.22;
              ctx.fillRect(x+24+step,y+102,6,2); // Occasional circuit activation.
            }
          }
          // Damage decoration is read-only and immediately follows real repairs.
          // Keep the diagnostic sprite, its label and its hitbox unobstructed.
          if(view.runtime?.matches)for(const c of specs){
            const x=Math.round(c.x-view.x),y=Math.round(c.y-view.y);
            if(x+c.w<0||x>view.width||y+c.h<0||y>view.height||view.runtime.matches({component:c.id}))continue;
            ctx.fillStyle='#91644f';ctx.globalAlpha=still?.10:.10+.05*Math.sin(t*.8+c.x);
            ctx.fillRect(x-8,y+c.h+8,c.w+16,2);
            if(!still&&mod(t+c.x*.01,9)<1.2){
              ctx.fillStyle='#ab6f64';ctx.globalAlpha=.22;ctx.fillRect(x-8,y+c.h+4,4,2);ctx.fillRect(x+c.w+4,y+c.h+8,4,2);
            }
          }
        }finally{ctx.restore();}
      },
      dispose(){disposed=true;if(bank){bank.width=0;bank.height=0;}}
    });
  }
  api.parallaxLife=Object.freeze({settings,configure,create});
})();
