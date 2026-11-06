setup(0);await levelVisuals.ready;endPhaseIntro();running=true;xpRequired=999999;damageCooldown=99999;components.forEach(c=>c.repaired=true);
const timings={};
const present=displayContext.drawImage.bind(displayContext);displayContext.drawImage=(...args)=>{const t=performance.now();try{return present(...args);}finally{timings.present=(timings.present||0)+performance.now()-t;}};
function profileWrap(name,fn){return (...args)=>{const begin=performance.now();try{return fn(...args);}finally{timings[name]=(timings[name]||0)+performance.now()-begin;}};}
drawBackground=profileWrap('background',drawBackground);drawSolids=profileWrap('solids',drawSolids);drawComponents=profileWrap('components',drawComponents);drawCollectibles=profileWrap('collectibles',drawCollectibles);drawViruses=profileWrap('viruses',drawViruses);drawRobot=profileWrap('robot',drawRobot);drawEffects=profileWrap('effects',drawEffects);drawProjectiles=profileWrap('projectiles',drawProjectiles);updateHud=profileWrap('hud',updateHud);
levelVisuals.layers=profileWrap('layers',levelVisuals.layers);levelRuntime.draw=profileWrap('runtimeDraw',levelRuntime.draw);ByteRunner.art.atmosphere=profileWrap('atmosphere',ByteRunner.art.atmosphere);
for(let i=0;i<24;i++){update(1/60);cameraX=(worldWidth()-width)*[0,.5,1][i%3];cameraY=(worldHeight()-height)*[0,.5,1][Math.floor(i/3)%3];draw();}
for(const key of Object.keys(timings))timings[key]=0;
let total=performance.now();for(let i=0;i<60;i++){let t=performance.now();update(1/60);timings.update=(timings.update||0)+performance.now()-t;cameraX=(worldWidth()-width)*[0,.5,1][i%3];cameraY=(worldHeight()-height)*[0,.5,1][Math.floor(i/3)%3];t=performance.now();draw();timings.draw=(timings.draw||0)+performance.now()-t;}total=performance.now()-total;
report.profile={total,perFrame:Object.fromEntries(Object.entries(timings).map(([k,v])=>[k,v/60]))};running=false;
report.contexts=[displayContext,pixelContext].map(c=>({shadowBlur:c.shadowBlur,filter:c.filter,alpha:c.globalAlpha,composite:c.globalCompositeOperation,attributes:c.getContextAttributes(),transform:c.getTransform().toString()}));

