report.performance=[];
const perfPercentile=(values,p)=>values.slice().sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))];
for(let phase=0;phase<=10;phase++) {
  setup(Math.min(phase,9));
  if(phase===10){const begin=performance.now();loadMap(ByteRunner.proceduralMaps.generateGameplay({seed:'performance-large',theme:'servers',difficulty:5,roomCount:24,optionalRatio:.2}),true);report.largeMapGenerationMs=performance.now()-begin;campaignStarted=false;}
  await levelVisuals.ready;endPhaseIntro();running=true;xpRequired=999999;damageCooldown=99999;components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
  const enemy=phase===9?viruses.find(v=>v.multiStage):viruses[0];
  if(enemy){player.x=enemy.x-(enemy.multiStage?180:60);player.y=enemy.groundY-player.height;player.vy=0;player.grounded=true;if(enemy.multiStage){enemy.hp=enemy.maxHp*.2;enemy.bossStage=3;enemy.bossCycleCooldown=0;enemy.bossPhaseTransitionTime=0;}}
  function perfFrame(i){update(1/60);cameraX=Math.max(0,worldWidth()-width)*[0,.5,1][i%3];cameraY=Math.max(0,worldHeight()-height)*[0,.5,1][Math.floor(i/3)%3];draw();}
  for(let i=0;i<24;i++)perfFrame(i);
  const values=[];for(let i=0;i<60;i++){const t=performance.now();perfFrame(i);values.push(performance.now()-t);}
  const row={phase:phase<10?phase+1:'procedural-24',width,height,worldWidth:worldWidth(),worldHeight:worldHeight(),samples:values.length,meanMs:values.reduce((a,b)=>a+b,0)/values.length,p50Ms:perfPercentile(values,.5),p95Ms:perfPercentile(values,.95),maxMs:Math.max(...values),cacheSize:levelVisuals.terrain.cacheSize,shapes:solids().length,loadedAssets:levelVisuals.loadedAssets().length};report.performance.push(row);
  test('performance: bounded terrain cache / '+row.phase,()=>assert(row.cacheSize<=96,'unbounded terrain memory'));
  test('performance: local 60Hz frame budget / '+row.phase,()=>assert(row.p95Ms<=16.7,'p95 exceeds local 60Hz screening budget: '+row.p95Ms.toFixed(2)+' ms'));
}
report.performanceConditions={headlessChrome:true,gpuDisabled:true,warmupFrames:24,samplesPerMap:60,damageProtection:true,optionalSkills:false,scope:'update+draw; 9 camera regions; does not certify FPS on other devices'};
running=false;
