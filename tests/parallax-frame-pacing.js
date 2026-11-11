report.framePacing=[];
const nativeFrame=()=>new Promise(resolve=>window.__reviewNativeRAF(resolve));
const percentile=(a,p)=>a.slice().sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))];
for(let index=0;index<=10;index++){
  setup(Math.min(index,9));
  if(index===10)loadMap(ByteRunner.proceduralMaps.generateGameplay({seed:'parallax-final-pacing',theme:'servers',difficulty:5,roomCount:24,optionalRatio:.2}),true);
  await levelVisuals.ready;soundEnabled=false;launchLoadedPhase(false);endPhaseIntro();damageCooldown=99999;xpRequired=999999;
  assert(overlay.classList.contains('hidden')&&document.querySelector('.game-shell').classList.contains('playing'),'benchmark left menu overlay visible');
  const maxX=Math.max(0,worldWidth()-width),maxY=Math.max(0,worldHeight()-height);
  const startX=Math.max(0,Math.min(maxX,mapStart().x-width*.44));
  const startY=Math.max(0,Math.min(maxY,mapStart().y-height*.55));
  for(const scenario of ['continuous','diagonal-stress']){
    const intervals=[],work=[];let previous=null,terrainBytes=0,terrainChunks=0;
    for(let i=0;i<102;i++){
      const timestamp=await nativeFrame();
      if(i>=12&&previous!==null)intervals.push(timestamp-previous);
      previous=timestamp;
      const begin=performance.now();update(1/60);
      cameraX=scenario==='continuous'?Math.min(maxX,startX+i*4):maxX*(.5+.45*Math.sin(i*.05));
      cameraY=scenario==='continuous'?Math.max(0,startY-i*2):maxY*(.5+.45*Math.sin(i*.035));
      draw();
      if(i>=12)work.push(performance.now()-begin);
      terrainBytes=Math.max(terrainBytes,levelVisuals.terrain.cacheBytes);
      terrainChunks=Math.max(terrainChunks,levelVisuals.terrain.cacheSize);
    }
    const mean=intervals.reduce((a,b)=>a+b,0)/intervals.length;
    report.framePacing.push({phase:index===10?'procedural-24':index+1,scenario,width,height,pixelRatio,frames:intervals.length,meanIntervalMs:mean,p95IntervalMs:percentile(intervals,.95),maxIntervalMs:Math.max(...intervals),observedFPS:1000/mean,intervalsAbove25Ms:intervals.filter(v=>v>25).length,meanUpdateDrawMs:work.reduce((a,b)=>a+b,0)/work.length,parallaxBytes:levelVisuals.parallax.stats.totalBytes,terrainBytes,terrainChunks,framebufferBytes:(canvas.width*canvas.height+pixelScene.width*pixelScene.height)*4,loadedAssets:levelVisuals.loadedAssets().length,heapBytes:performance.memory?.usedJSHeapSize??null,visibilityState:document.visibilityState});
    test('frame pacing: valid samples and bounded cache / '+index+' / '+scenario,()=>assert(intervals.length===90&&intervals.every(v=>Number.isFinite(v)&&v>0)&&terrainChunks<=96&&levelVisuals.parallax.stats.totalBytes<=4.25*1024*1024,'invalid sample or cache over budget'));
  }
}
report.conditions={viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,headlessChrome:true,gpuDisabled:true,menuOverlayHidden:overlay.classList.contains('hidden'),warmupFrames:12,samplesPerScenario:90,scope:'Native requestAnimationFrame intervals, ten campaign maps and one 24-room procedural map; fixed 1/60 simulation step; continuous and stress camera motion',certifies60FPS:false};
running=false;
