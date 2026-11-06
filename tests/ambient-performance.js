report.performance=[];
const ambientPercentile=(values,p)=>values.slice().sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))];
const ambientPrevious=experience.settings.reducedEffects;
for(let index=0;index<10;index++){
  setup(index);await levelVisuals.ready;endPhaseIntro();
  const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');
  for(const reduced of [false,true]){
    experience.settings.reducedEffects=reduced;
    const frame=i=>{
      levelVisuals.parallax.draw(x,{x:Math.max(0,worldWidth()-width)*[0,.5,1][i%3],y:Math.max(0,worldHeight()-height)*[0,.5,1][Math.floor(i/3)%3],width,height,runtime:levelRuntime},i/12,levelVisuals);
      x.getImageData(0,0,1,1); // Force completion of raster work in both runs.
    };
    for(let i=0;i<24;i++)frame(i);
    const values=[];for(let i=0;i<120;i++){const begin=performance.now();frame(i);values.push(performance.now()-begin);}
    report.performance.push({phase:index+1,reduced,width,height,samples:120,meanMs:values.reduce((a,b)=>a+b,0)/120,p50Ms:ambientPercentile(values,.5),p95Ms:ambientPercentile(values,.95),maxMs:Math.max(...values),cacheBytes:levelVisuals.parallax.stats.bytes});
  }
}
experience.settings.reducedEffects=ambientPrevious;
report.conditions={headlessChrome:true,gpuDisabled:true,warmupFrames:24,samples:120,scope:'background only with 1px synchronous completion; nine camera regions; normal and reduced',certifies60FPS:false};
running=false;
