const scenery=ByteRunner.parallaxLife,comfortBefore={...scenery.settings},globalBefore=experience.settings.reducedEffects;
const luminance=(d,i)=>(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722);
report.visibility=[];report.flashScreening=[];
test('ambient: independent comfort controls persist without changing global settings',()=>{
  const before=experience.settings.reducedEffects;
  for(const name of ['reduceParticles','reduceAnimations']){
    const input=document.querySelector('[data-scenery-setting="'+name+'"]');assert(input,'missing comfort control');
    input.checked=true;input.dispatchEvent(new Event('input'));
    assert(scenery.settings[name]&&JSON.parse(localStorage.getItem('byteRunner.scenery.v1'))[name],'setting not saved');
    input.checked=false;input.dispatchEvent(new Event('input'));
  }
  assert(experience.settings.reducedEffects===before,'independent settings changed master');
});
for(let index=0;index<10;index++){
  setup(index);await levelVisuals.ready;endPhaseIntro();damageCooldown=0;animationTime=1.2;
  scenery.configure({reduceParticles:false,reduceAnimations:false});experience.settings.reducedEffects=false;
  const service=levelVisuals,life=service.parallax.life;
  const canvasTest=document.createElement('canvas');canvasTest.width=width;canvasTest.height=height;
  const x=canvasTest.getContext('2d',{willReadFrequently:true});
  const view={x:0,y:Math.max(0,Math.min(worldHeight()-height,mapStart().y-height*.65)),width,height,runtime:levelRuntime};
  const render=t=>{service.parallax.draw(x,view,t,service);return x.getImageData(0,0,width,height).data;};
  const equal=(a,b)=>a.every((v,i)=>v===b[i]);
  test('ambient: progressive regions and bounded cache // phase '+(index+1),()=>{
    const districts=phaseData.map.regions||[];
    for(const district of districts){
      const area=district.areas[0];
      const current=life.region({...view,x:area.x+area.width/2-width/2,y:area.y+area.height/2-height/2});
      assert(current.blend>=0&&current.blend<=1&&current.labels.every(Boolean),'invalid district mixture');
    }
    render(0);const builds=service.parallax.stats.builds;
    for(let step=0;step<20;step++)service.parallax.draw(x,{...view,x:step*300,y:step*170},step,service);
    assert(service.parallax.stats.builds===builds&&service.parallax.stats.totalBytes<=4.25*1024*1024,'unbounded ambient cache');
  });
  test('ambient: sparse local animation, no large bright frame changes // phase '+(index+1),()=>{
    let previous=render(0),peakChanged=0,peakBright=0,meanPeak=0;
    for(let step=1;step<=24;step++){
      const current=render(step/6);let changed=0,bright=0,total=0;
      for(let i=0;i<current.length;i+=4){const delta=Math.abs(luminance(current,i)-luminance(previous,i));if(delta>.5)changed++;if(delta>24)bright++;total+=delta;}
      peakChanged=Math.max(peakChanged,changed/(width*height));peakBright=Math.max(peakBright,bright/(width*height));meanPeak=Math.max(meanPeak,total/(width*height));previous=current;
    }
    assert(peakChanged>0&&peakChanged<.015&&peakBright<.002&&meanPeak<.15,'animation area/flash budget exceeded');
    report.flashScreening.push({phase:index+1,peakChangedFraction:peakChanged,peakBrightFraction:peakBright,peakMeanLuminanceDelta:meanPeak,samples:24,intervalSeconds:1/6});
  });
  test('ambient: animation freeze and particle reduction are independent // phase '+(index+1),()=>{
    scenery.configure({reduceAnimations:true});assert(equal(render(0),render(7)),'freeze left time-dependent scenery');
    scenery.configure({reduceAnimations:false});
    let dust=0;const native=x.fillRect.bind(x);x.fillRect=(...args)=>{if(args[2]===1&&args[3]===1)dust++;return native(...args);};
    try{render(0);assert(dust===service.parallax.config.particles.count,'default dust count');dust=0;scenery.configure({reduceParticles:true});render(0);assert(dust===0,'particles not reduced');}finally{x.fillRect=native;scenery.configure({reduceParticles:false});}
    experience.settings.reducedEffects=true;assert(equal(render(0),render(7)),'master comfort not static');experience.settings.reducedEffects=false;
  });
  test('ambient: damage feedback follows readonly repair state // phase '+(index+1),()=>{
    const c=phaseData.entities.components.find(c=>Number.isFinite(c.y));assert(c,'missing component');
    const local={x:c.x-100,y:c.y-100,width,height,runtime:{matches:()=>false}};
    x.clearRect(0,0,width,height);life.draw(x,local,1,service);const damaged=x.getImageData(0,0,width,height).data;
    x.clearRect(0,0,width,height);life.draw(x,{...local,runtime:{matches:()=>true}},1,service);const repaired=x.getImageData(0,0,width,height).data;
    assert(!equal(damaged,repaired),'damage feedback did not stop after repair');
  });
  test('ambient: character remains readable at three map positions // phase '+(index+1),()=>{
    // Use collision-audited standing spans, not the middle of a support that
    // may be covered by a wall or another floor in the actual map.
    const supports=surfaces().filter(s=>s.z>=s.a&&s.y>=0&&s.y<worldHeight()-player.height);
    const axis=life.region(view).axis;
    for(let sample=0;sample<3;sample++){
      const target=(axis==='x'?worldWidth():worldHeight())*(sample+1)/4;
      const support=supports.slice().sort((a,b)=>Math.abs((axis==='x'?(a.a+a.z)/2:a.y)-target)-Math.abs((axis==='x'?(b.a+b.z)/2:b.y)-target))[0];assert(support,'missing support');
      player.x=(support.a+support.z)/2;player.y=support.y;player.vx=0;player.vy=0;player.grounded=true;player.shieldTime=0;previousRenderPlayer=null;
      cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-width,player.x-width*.44)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-height,player.y-height*.55)));
      animationTime=1.2+sample*2.7;
      const sx=Math.round(player.x+1-cameraX),sy=Math.round(player.y-cameraY),drawOriginal=drawRobot;
      let ratio=0,brightPixels=0;
      drawRobot=(...args)=>{
        const before=ctx.getImageData(sx,sy,32,48).data;drawOriginal(...args);const after=ctx.getImageData(sx,sy,32,48).data;
        let distinct=0;for(let i=0;i<after.length;i+=4){const lum=luminance(after,i);if(lum>100&&Math.abs(lum-luminance(before,i))>1){brightPixels++;if(lum-luminance(before,i)>40)distinct++;}}
        ratio=distinct/Math.max(1,brightPixels);
      };
      try{draw();}finally{drawRobot=drawOriginal;}
      report.visibility.push({phase:index+1,sample,x:player.x,y:player.y,brightPixels,distinctFraction:ratio});
      if(ratio<.85)report.snapshots.push({phase:index+1,position:'contrast-review-'+sample,image:captureCanvas()});
      assert(brightPixels>=60&&ratio>=.85,'robot lost contrast: '+ratio+' / '+brightPixels);
      if(sample===1)report.snapshots.push({phase:index+1,position:'visibility',image:captureCanvas()});
    }
  });
  test('ambient: visual pass preserves gameplay and Canvas state // phase '+(index+1),()=>{
    const state=()=>JSON.stringify({player,viruses,components,shapes:solids(),xp,checkpointX,checkpointY,flags:levelRuntime.save()});const before=state();
    x.globalAlpha=.8;x.imageSmoothingEnabled=true;x.translate(3,4);const transform=x.getTransform().toString();
    service.parallax.draw(x,view,2,service);assert(x.globalAlpha===.8&&x.imageSmoothingEnabled&&x.getTransform().toString()===transform,'Canvas leak');
    draw();assert(state()===before,'scenery changed gameplay');
  });
  if(index===0){
    for(const [name,progress] of [['board',0],['ram',1/3],['gpu',2/3],['power',1]]){
      cameraX=Math.floor((worldWidth()-width)*progress);cameraY=Math.max(0,worldHeight()-height);animationTime=1.2;
      const focus=cameraX+width*.44,stands=surfaces().filter(s=>s.y>=cameraY&&s.y<cameraY+height-60&&s.z>=cameraX&&s.a<cameraX+width);
      const stand=stands.sort((a,b)=>Math.abs((a.a+a.z)/2-focus)-Math.abs((b.a+b.z)/2-focus))[0];
      if(stand){player.x=Math.max(stand.a,Math.min(stand.z,focus));player.y=stand.y;previousRenderPlayer=null;}
      draw();report.snapshots.push({phase:1,position:name,image:captureCanvas()});
    }
    cameraX=0;cameraY=356;player.x=mapStart().x;player.y=mapStart().y;previousRenderPlayer=null;
    for(let frame=0;frame<4;frame++){animationTime=1.2+frame*.4;draw();report.snapshots.push({phase:1,position:'motion-'+frame,image:captureCanvas()});}
  }
}
scenery.configure(comfortBefore);experience.settings.reducedEffects=globalBefore;
running=false;
