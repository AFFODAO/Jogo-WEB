// Reference code is the exact renderer and ambient module saved before this stage.
const finalRenderer=ByteRunner.parallax,finalLife=ByteRunner.parallaxLife;
(0,eval)(PARALLAX_FINAL_REFERENCE['parallax-life']);
(0,eval)(PARALLAX_FINAL_REFERENCE.parallax);
const referenceRenderer=ByteRunner.parallax;
ByteRunner.parallax=finalRenderer;ByteRunner.parallaxLife=finalLife;
report.pixelComparisons=[];report.presentationComparisons=[];report.culling=[];report.memory=[];
report.environment={viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,canvas:[width,height],nearestNeighbor:!pixelContext.imageSmoothingEnabled};
const finalCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const finalLuminance=(d,i)=>d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722;
for(let index=0;index<10;index++){
  setup(index);await levelVisuals.ready;endPhaseIntro();damageCooldown=0;animationTime=1.2;
  const optimized=levelVisuals.parallax;
  ByteRunner.parallaxLife=undefined; // The reference captures its own original ambient module below.
  (0,eval)(PARALLAX_FINAL_REFERENCE['parallax-life']);
  const reference=referenceRenderer.create(phaseData);ByteRunner.parallaxLife=finalLife;
  test('final parallax: reference pixels, diagonal seams and reversals // '+(index+1),()=>{
    let maximum=0,largeDifferences=0,samples=0,totalPixels=0;
    for(const [w,h] of [[320,180],[905,644],[1920,1080]]){
      const a=finalCanvas(w,h),b=finalCanvas(w,h),x=a.getContext('2d',{willReadFrequently:true}),y=b.getContext('2d',{willReadFrequently:true});
      const positions=[[0,0],[317,173],[1023,255],[1024,256],[1025,257],[2047,511],[2048,512],[317,173],[0,0]];
      if(w===320)for(const p of optimized.config.planes){
        const bx=128*p.scale/p.rateX,by=128*p.scale*(optimized.config.rowSpacing||1)/(p.rateY*optimized.config.verticalMultiplier);
        positions.push([bx-.1,by-.1],[bx+.1,by+.1],[bx-.1,by+.1],[bx+.1,by-.1]);
      }
      for(const [xx,yy] of positions){
        const view={x:xx,y:yy,width:w,height:h,runtime:levelRuntime};reference.draw(y,view,1.2,levelVisuals);optimized.draw(x,view,1.2,levelVisuals);
        const p=x.getImageData(0,0,w,h).data,q=y.getImageData(0,0,w,h).data;let large=0;
        for(let i=0;i<p.length;i+=4){let delta=0;for(let c=0;c<4;c++)delta=Math.max(delta,Math.abs(p[i+c]-q[i+c]));maximum=Math.max(maximum,delta);if(delta>5)large++;}
        largeDifferences+=large;samples++;totalPixels+=w*h;
        assert(large/(w*h)<.0001,'reference mismatch/seam: '+large+' pixels at '+xx+','+yy+' / '+w+'x'+h);
      }
    }
    report.pixelComparisons.push({phase:index+1,samples,totalPixels,maximumChannelDelta:maximum,pixelsDeltaAbove5:largeDifferences});
  });
  test('final parallax: integer offsets, fast reversal, diagonal and negative camera // '+(index+1),()=>{
    const c=finalCanvas(640,360),x=c.getContext('2d');let previous=null;
    const path=[0,.1,.4,1,2,4,10,100,1000,100,10,4,2,1,.4,.1,0,-.1,-4,-317,-4,0];
    let original=null;
    for(const position of path){
      const view={x:position,y:position*.7,width:640,height:360};optimized.draw(x,view,2,levelVisuals);
      const offsets=optimized.stats.offsets;
      for(let i=0;i<offsets.length;i++){
        const p=optimized.config.planes[i],o=offsets[i];assert(o.x===Math.floor(position*p.rateX)&&o.y===Math.floor(position*.7*p.rateY*optimized.config.verticalMultiplier),'offset drift');
        assert(Number.isInteger(o.x)&&Number.isInteger(o.y),'subpixel layer');
      }
      if(position===0){const image=c.toDataURL();if(original)assert(image===original,'reversal left cumulative drift');else original=image;}
      previous=offsets;
    }
  });
  test('final parallax: static cache reuse, visible bounds and complete disposal // '+(index+1),()=>{
    const c=finalCanvas(905,644),x=c.getContext('2d');let outside=0,pixels=0,calls=0;
    const native=x.drawImage.bind(x);x.drawImage=(...args)=>{
      // The main plane blits use nine arguments. Core and ambient sprites have
      // their own native-size culling, covered by the full scene tests.
      if(args.length===9&&args[0].width>=1024){calls++;pixels+=args[7]*args[8];if(args[5]<0||args[6]<0||args[5]+args[7]>905||args[6]+args[8]>644)outside++;}
      return native(...args);
    };
    const view={x:317,y:173,width:905,height:644};optimized.draw(x,view,1,levelVisuals);
    const before=optimized.stats,mixBefore=optimized.life.stats.mixBuilds;
    let textures=0;const create=document.createElement.bind(document);document.createElement=(tag,...args)=>{if(tag==='canvas')textures++;return create(tag,...args);};
    try{for(let i=0;i<60;i++)optimized.draw(x,view,i/60,levelVisuals);}finally{document.createElement=create;x.drawImage=native;}
    assert(!textures&&optimized.stats.builds===before.builds&&optimized.life.stats.mixBuilds===mixBefore,'texture recreated at fixed camera');
    assert(outside===0&&optimized.stats.drawnPixels<905*644*1.5,'offscreen/transparent overdraw');
    report.culling.push({phase:index+1,drawCalls:optimized.stats.drawCalls,planePixels:optimized.stats.drawnPixels,viewportPixels:905*644,allocatedCanvasesAfterWarmup:textures});
    for(const [w,h] of [[320,180],[1920,1080],[640,360]]){
      c.width=w;c.height=h;optimized.draw(x,{...view,width:w,height:h,x:90000,y:90000},1,levelVisuals);
    }
    assert(optimized.stats.totalBytes<=4.25*1024*1024&&optimized.stats.builds===before.builds,'resize/travel grew texture memory');
    const disposable=finalRenderer.create(phaseData);disposable.draw(x,view,0,levelVisuals);const peak=disposable.stats.totalBytes;disposable.dispose();
    assert(disposable.stats.totalBytes===0&&!disposable.draw(x,view,0,levelVisuals),'disposed texture memory retained');
    report.memory.push({phase:index+1,peakTextureBytes:peak,afterDisposeBytes:disposable.stats.totalBytes});
  });
  reference.dispose();
  cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-width,mapStart().x-width*.44)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-height,mapStart().y-height*.65)));
  test('final parallax: direct and offscreen full scene pixels agree // '+(index+1),()=>{
    const saved=pixelRatio,savedWidth=canvas.width,savedHeight=canvas.height;
    try{
      // Compare equal physical viewports. Merely changing the ratio on a
      // Retina-sized canvas leaves an extra drawing area past the logical edge.
      canvas.width=Math.ceil(width);canvas.height=Math.ceil(height);
      pixelRatio=1;displayContext.setTransform(1,0,0,1,0,0);draw();
      const direct=displayContext.getImageData(0,0,Math.ceil(width),Math.ceil(height)).data;
      if(Number.isInteger(width)&&Number.isInteger(height))assert(pixelScene.width===0&&pixelScene.height===0,'native path retained redundant framebuffer');
      else assert(pixelScene.width===Math.ceil(width),'fractional layout bypassed framebuffer');
      pixelRatio=2;draw();const buffered=displayContext.getImageData(0,0,Math.ceil(width),Math.ceil(height)).data;
      let maximum=0,different=0;
      for(let i=0;i<direct.length;i++){const delta=Math.abs(direct[i]-buffered[i]);maximum=Math.max(maximum,delta);if(delta>2)different++;}
      const examples=[];
      if(different)for(let i=0;i<direct.length&&examples.length<16;i+=4)if(Math.max(...direct.slice(i,i+3).map((v,c)=>Math.abs(v-buffered[i+c])))>2)examples.push({x:i/4%Math.ceil(width),y:Math.floor(i/4/Math.ceil(width)),direct:[...direct.slice(i,i+4)],buffered:[...buffered.slice(i,i+4)]});
      report.presentationComparisons.push({phase:index+1,maximumChannelDelta:maximum,channelsDeltaAbove2:different,examples});
      assert(different===0,'direct presentation changed scene pixels: '+different+' / '+maximum);
    }finally{pixelRatio=saved;canvas.width=savedWidth;canvas.height=savedHeight;displayContext.setTransform(saved,0,0,saved,0,0);draw();}
  });
  draw();report.snapshots.push({phase:index+1,position:'start',image:captureCanvas()});
}
setup(0);await levelVisuals.ready;endPhaseIntro();
test('final parallax: opaque framebuffers and nearest-neighbor survive real resize',()=>{
  const css=canvas.style.cssText;
  try{
    for(const [w,h] of [[320,240],[905,644],[905.5,644.5],[1280,720]]){
      canvas.style.width=w+'px';canvas.style.height=h+'px';resize();draw();
      assert(!pixelContext.imageSmoothingEnabled&&!displayContext.imageSmoothingEnabled,'resize blurred framebuffer');
      assert(!pixelContext.getContextAttributes().alpha&&!displayContext.getContextAttributes().alpha,'opaque framebuffer lost');
      assert(canvas.width===Math.round(width*pixelRatio)&&canvas.height===Math.round(height*pixelRatio),'DPR/size mismatch');
      if(pixelRatio===1&&(!Number.isInteger(width)||!Number.isInteger(height)))assert(pixelScene.width===Math.ceil(width),'fractional resize used direct path');
    }
  }finally{canvas.style.cssText=css;resize();}
});
test('final parallax: real camera follows rapid direction changes on both axes',()=>{
  const map={width:10000,height:5000,axes:['x','y'],offsetX:.44,offsetY:.55};let view={x:3000-905*.44,y:2000-644*.55,width:905,height:644};
  const p={...player,x:3000,y:2000,vx:255,vy:0,grounded:true};
  for(let step=0;step<360;step++){
    p.vx=step%60<30?255:-255;p.x+=p.vx/60;p.y+=step%80<40?1:-1;
    const next=experience.camera(p,view,map,1/60);assert(Number.isFinite(next.x)&&Number.isFinite(next.y)&&next.x>=0&&next.y>=0&&next.x<=9095&&next.y<=4356,'camera escaped');
    assert(Math.abs(next.x-view.x)<300&&Math.abs(next.y-view.y)<200,'camera teleported');
    if(step>60)assert(Math.abs(next.x-view.x)<40&&Math.abs(next.y-view.y)<40,'rapid reversal caused a camera jump');
    const expected=experience.camera(p,view,map,1/60);assert(next.x===expected.x&&next.y===expected.y,'camera nondeterminism');view={...view,...next};
  }
});
loadMap(ByteRunner.proceduralMaps.generateGameplay({seed:'parallax-final-large',theme:'servers',difficulty:5,roomCount:24,optionalRatio:.2}),true);await levelVisuals.ready;endPhaseIntro();
test('final parallax: large map travel, reduced modes and bounded textures',()=>{
  const c=finalCanvas(1280,720),x=c.getContext('2d'),settings={...finalLife.settings},reduced=experience.settings.reducedEffects;
  try{
    for(let i=0;i<120;i++){
      finalLife.settings.reduceParticles=i%3===0;finalLife.settings.reduceAnimations=i%5===0;experience.settings.reducedEffects=i%7===0;
      levelVisuals.parallax.draw(x,{x:(worldWidth()-1280)*i/119,y:(worldHeight()-720)*(i%13)/12,width:1280,height:720,runtime:levelRuntime},i/10,levelVisuals);
    }
    assert(levelVisuals.parallax.stats.totalBytes<=4.25*1024*1024&&levelVisuals.parallax.stats.builds===3,'large map grew cache');
    report.largeMap={width:worldWidth(),height:worldHeight(),shapes:solids().length,cacheBytes:levelVisuals.parallax.stats.totalBytes,frames:120};
  }finally{Object.assign(finalLife.settings,settings);experience.settings.reducedEffects=reduced;}
});
running=false;
