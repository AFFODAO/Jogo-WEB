report.framePacing=[];
const nativeFrame=()=>new Promise(resolve=>window.__reviewNativeRAF(resolve));
const percentile=(a,p)=>a.slice().sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))];
for(const index of [0,1,9,10]){
  setup(Math.min(index,9));
  if(index===10)loadMap(ByteRunner.proceduralMaps.generateGameplay({seed:'parallax-final-pacing',theme:'servers',difficulty:5,roomCount:24,optionalRatio:.2}),true);
  await levelVisuals.ready;soundEnabled=false;launchLoadedPhase(false);endPhaseIntro();damageCooldown=99999;xpRequired=999999;
  assert(overlay.classList.contains('hidden')&&document.querySelector('.game-shell').classList.contains('playing'),'benchmark left menu overlay visible');
  const intervals=[],work=[];let previous=null;
  for(let i=0;i<102;i++){
    const timestamp=await nativeFrame();
    if(i>=12&&previous!==null)intervals.push(timestamp-previous);
    previous=timestamp;
    const begin=performance.now();update(1/60);
    cameraX=Math.max(0,worldWidth()-width)*(.5+.45*Math.sin(i*.05));cameraY=Math.max(0,worldHeight()-height)*(.5+.45*Math.sin(i*.035));draw();
    if(i>=12)work.push(performance.now()-begin);
  }
  const mean=intervals.reduce((a,b)=>a+b,0)/intervals.length;
  report.framePacing.push({phase:index===10?'procedural-24':index+1,width,height,pixelRatio,frames:intervals.length,meanIntervalMs:mean,p95IntervalMs:percentile(intervals,.95),maxIntervalMs:Math.max(...intervals),observedFPS:1000/mean,intervalsAbove25Ms:intervals.filter(v=>v>25).length,meanUpdateDrawMs:work.reduce((a,b)=>a+b,0)/work.length,parallaxBytes:levelVisuals.parallax.stats.totalBytes,visibilityState:document.visibilityState});
  test('frame pacing: complete native RAF samples and bounded cache / '+index,()=>assert(intervals.length===90&&intervals.every(v=>Number.isFinite(v)&&v>0)&&levelVisuals.parallax.stats.totalBytes<=4.25*1024*1024,'incomplete/invalid frame sample'));
}
report.conditions={viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,headlessChrome:true,gpuDisabled:true,menuOverlayHidden:overlay.classList.contains('hidden'),warmupFrames:12,samplesPerMap:90,scope:'Native requestAnimationFrame intervals including browser presentation in launched gameplay, four workloads; fixed 1/60 simulation step; synthetic diagonal camera travel',certifies60FPS:false};
running=false;
