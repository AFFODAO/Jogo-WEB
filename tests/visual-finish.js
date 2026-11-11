const finishPatterns=new Set();
const luminance=(data,i)=>data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;
report.visualFinish=[];
const clampCamera=(value,world,extent)=>Math.round(Math.max(0,Math.min(world-extent,value)));
for(let index=0;index<10;index++){
  setup(index);await levelVisuals.ready;endPhaseIntro();
  const phase=index+1, suffix=String(phase).padStart(2,'0'),parallax=levelVisuals.parallax;
  const result={phase,theme:phaseData.theme,contrast:[]};report.visualFinish.push(result);
  async function measure(){
    const samples=[],firstFrames=[];
    for(const [x,y] of [[.05,.92],[.5,.5],[.9,.1]]){
      const left=(worldWidth()-width)*x,top=(worldHeight()-height)*y;
      for(let i=0;i<40;i++){
        const startTime=performance.now();
        update(1/60);
        cameraX=clampCamera(left+i*3,worldWidth(),width);
        cameraY=clampCamera(top+i,worldHeight(),height);
        draw();
        const elapsed=performance.now()-startTime;
        if(i===0)firstFrames.push(elapsed);
        if(i>=20)samples.push(elapsed);
        if(i%4===3)await new Promise(resolve=>setTimeout(resolve,0));
      }
    }
    samples.sort((a,b)=>a-b);
    return {canvas:[width,height],samples:samples.length,medianMs:samples[30],p95Ms:samples[57],
      chunks:levelVisuals.terrain.cacheSize,parallaxBytes:parallax.stats.totalBytes,firstFramesMs:firstFrames};
  }
  result.performance=await measure();
  test('visual finish: custo de quadro e caches / '+phase,()=>{
    assert(result.performance.chunks<=96&&result.performance.p95Ms<=16.7,'custo local ou cache acima do orçamento');
  });
  test('visual finish: atlas native, variantes e bordas / '+phase,()=>{
    assert(!levelVisuals.errors.length,'falha ao carregar texturas');
    const atlas=levelVisuals.source('terrain-'+suffix);
    assert(atlas.width===256&&atlas.height===640,'escala do atlas incorreta');
    const sample=document.createElement('canvas');sample.width=32;sample.height=32;
    const context=sample.getContext('2d',{willReadFrequently:true}),variants=new Set();
    for(let frame=0;frame<8;frame++){
      context.drawImage(atlas,frame*32,15*32,32,32,0,0,32,32);
      const pixels=context.getImageData(0,0,32,32).data,colors=new Map(),pattern=[];
      for(let i=0;i<pixels.length;i+=4){
        assert(pixels[i+3]===255,'tile de piso não é opaco');
        const color=pixels[i]*65536+pixels[i+1]*256+pixels[i+2];
        if(!colors.has(color))colors.set(color,colors.size);
        pattern.push(colors.get(color));
      }
      variants.add(pattern.join(','));
      if(frame===0)finishPatterns.add(pattern.join(','));
    }
    assert(variants.size>=3,'variação insuficiente no terreno');
  });
  test('visual finish: profundidade independente e distritos / '+phase,()=>{
    const {config}=parallax;
    const depths=phase===1?config.planes:[...config.planes,config.landmarks];
    assert(depths.length===4,'planos estruturais ausentes');
    assert(new Set([...depths,config.particles].map(p=>p.rateX)).size===5&&
      new Set([...depths,config.particles].map(p=>p.rateY)).size===5,'camadas com velocidades repetidas');
    const sample=document.createElement('canvas');sample.width=640;sample.height=360;
    const context=sample.getContext('2d');
    for(const region of phaseData.map.regions||[]){
      const area=region.areas[0];
      const view={x:area.x+area.width/2-320,y:area.y+area.height/2-180,width:640,height:360};
      assert(Number.isFinite(parallax.life.region(view).blend),'transição de distrito inválida');
      parallax.draw(context,view,1.2,levelVisuals);
    }
    const view={x:333,y:271,width:640,height:360,runtime:levelRuntime};
    const frame=t=>{parallax.draw(context,view,t,levelVisuals);return sample.toDataURL();};
    const settings=ByteRunner.parallaxLife.settings;
    try{
      settings.reduceAnimations=false;assert(frame(0)!==frame(3),'ambiente não anima');
      settings.reduceAnimations=true;assert(frame(0)===frame(3),'modo estático animou');
    }finally{settings.reduceAnimations=false;}
    assert(parallax.stats.totalBytes<=4.25*1024*1024,'cache de profundidade acima do limite');
  });
  const stands=surfaces().filter(s=>s.a<=s.z&&s.y>=0&&s.y<worldHeight()-player.height);
  const start=mapStart(),checkpoint=phaseData.map.checkpoints[Math.floor(phaseData.map.checkpoints.length*.55)];
  const locations=[['entrada',start.x,start.y],['interior',checkpoint?.x??worldWidth()*.6,(checkpoint?.y??worldHeight()*.6)-player.height]];
  if(phase===10)locations.push(['arena',5480,900-player.height]);
  const scene=()=>{
    Object.assign(player,{vx:0,vy:0,grounded:true,shieldTime:0});previousRenderPlayer=null;
    cameraX=clampCamera(player.x-width*.44,worldWidth(),width);
    cameraY=clampCamera(player.y-height*.55,worldHeight(),height);
  };
  test('visual finish: contraste, arte nítida e estado estável / '+phase,()=>{
    for(const [name,x,y] of locations){
      if(name==='arena')components.forEach(c=>c.repaired=true);
      const distance=s=>Math.abs(Math.max(s.a,Math.min(s.z,x))-x)+2*Math.abs(s.y-y);
      const support=stands.reduce((best,s)=>!best||distance(s)<distance(best)?s:best,null);
      assert(support,'falta piso no enquadramento');
      Object.assign(player,{x:Math.max(support.a,Math.min(support.z,x)),y:support.y});scene();animationTime=2.1;
      const saved=JSON.stringify({player,shapes:solids(),components,viruses,xp,checkpointX,checkpointY,flags:levelRuntime.save()});
      const original=drawRobot;
      let bright=0,separated=0;
      drawRobot=(...args)=>{
        const sx=Math.round(player.x-cameraX),sy=Math.round(player.y-cameraY);
        const before=ctx.getImageData(sx,sy,34,48).data;
        original(...args);
        const after=ctx.getImageData(sx,sy,34,48).data;
        for(let i=0;i<after.length;i+=4){
          const final=luminance(after,i),change=final-luminance(before,i);
          if(final>100&&change>1){bright++;if(change>40)separated++;}
        }
      };
      try{draw();}finally{drawRobot=original;}
      const fraction=separated/Math.max(1,bright);
      result.contrast.push({position:name,bright,fraction});
      assert(bright>=60&&fraction>=.85,'silhueta do robô perdeu contraste em '+name+' / '+fraction);
      assert(!displayContext.imageSmoothingEnabled&&!pixelContext.imageSmoothingEnabled,'interpolação ativada');
      assert(saved===JSON.stringify({player,shapes:solids(),components,viruses,xp,checkpointX,checkpointY,flags:levelRuntime.save()}),'desenho mudou a simulação');
      report.snapshots.push({phase,position:name,image:captureCanvas()});
    }
  });

}
test('visual finish: dez materiais com silhuetas próprias',()=>assert(finishPatterns.size===10,'tilesets são recolorações'));
test('visual finish: retângulos fora da câmera não são enviados ao canvas',()=>{
  const service=ByteRunner.visuals.create({layers:[{type:'rects',parallaxX:.5,rects:[
    {x:10,y:20,width:8,height:8},{x:42,y:20,width:8,height:8},{x:1000,y:20,width:8,height:8}
  ]}]});
  const sample=document.createElement('canvas'),context=sample.getContext('2d'),native=context.fillRect.bind(context);
  let calls=0;context.fillRect=(...args)=>{calls++;native(...args);};
  try{service.layers(context,'background',{x:80,y:10,width:100,height:50},0);assert(calls===1,'desenho fora do recorte');}
  finally{service.dispose();}
});
running=false;
