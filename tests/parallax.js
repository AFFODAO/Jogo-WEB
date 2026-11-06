test('parallax: independent immutable profiles for all ten themes',()=>{
  const entries=Object.values(ByteRunner.parallaxProfiles.profiles);assert(entries.length===10,'missing profiles');
  assert(new Set(entries.map(c=>c.planes)).size===10&&new Set(entries.map(c=>c.particles)).size===10,'shared mutable phase settings');
  for(const phase of PHASES){const c=ByteRunner.parallaxProfiles.resolve(phase);assert(c&&c.theme===phase.theme&&Object.isFrozen(c.planes[0])&&Object.isFrozen(c),'profile mismatch');assert(c.planes.every(p=>Number.isInteger(p.scale)&&p.scale>0),'non-native scale');}
  assert(ByteRunner.parallaxProfiles.resolve({id:'phase-01',theme:'dns'}).asset==='vista-08','procedural theme resolved by phase number');
});
for(let index=0;index<10;index++){
  setup(index);await levelVisuals.ready;
  test('parallax: camera axes, cache lifecycle and readonly scenery / phase '+(index+1),()=>{
    const before=JSON.stringify({phaseData,player,components,checkpointX,checkpointY,xp,cameraX,cameraY});
    const c=document.createElement('canvas');c.width=320;c.height=224;const context=c.getContext('2d');context.imageSmoothingEnabled=true;context.globalAlpha=.85;context.translate(2,3);
    const state=()=>JSON.stringify([context.imageSmoothingEnabled,context.globalAlpha,context.getTransform().toString()]);const initial=state(),renderer=levelVisuals.parallax;
    const image=(x,y)=>{context.save();context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,320,224);context.restore();renderer.draw(context,{x,y,width:320,height:224},2,levelVisuals);return c.toDataURL();};
    const a=image(0,0),b=image(1200,0),d=image(0,1200);assert(a!==b&&a!==d&&image(0,0)===a,'camera axis ignored or render nondeterministic');image(-317,-173);
    const count=index===0?4:3;
    assert(state()===initial,'canvas state leaked');assert(renderer.stats.strips===count&&renderer.stats.builds===count&&renderer.stats.bytes<=4718592,'unbounded background cache');
    const builds=renderer.stats.builds;image(90000,90000);assert(renderer.stats.builds===builds&&renderer.stats.hits>0,'camera rebuilt atlas cache');
    const reduced=ByteRunner.experience.settings.reducedEffects;try{ByteRunner.experience.settings.reducedEffects=true;image(0,0);}finally{ByteRunner.experience.settings.reducedEffects=reduced;}
    let actorCalls=0;const old=drawRobot;drawRobot=()=>actorCalls++;try{drawBackground();assert(actorCalls===0,'scenery drew actor');}finally{drawRobot=old;}
    assert(JSON.stringify({phaseData,player,components,checkpointX,checkpointY,xp,cameraX,cameraY})===before,'scenery changed gameplay');
    const disposable=ByteRunner.parallax.create(phaseData);disposable.draw(context,{x:0,y:0,width:320,height:224},0,levelVisuals);disposable.dispose();assert(!disposable.stats.strips&&!disposable.draw(context,{x:0,y:0,width:320,height:224},0,levelVisuals),'disposed cache retained');
  });
}
test('parallax: scenery pass ordering and legacy procedural decorations preserved',()=>{
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d'),events=[],original=ByteRunner.art.background;
  ByteRunner.art.background=()=>events.push('sky');
  const phase={palette:PHASES[0].palette,presentation:{procedural:true}},visuals={layers(c,pass){events.push(pass);}},view={x:320,y:144,width:320,height:224};
  try{ByteRunner.backgroundScene.draw(context,view,0,0,phase,visuals,()=>{events.push('structures');assert(context.getTransform().e===-320&&context.getTransform().f===-144,'world decoration camera transform');});assert(events.join(',')==='sky,background,structures,midground','scenery order changed');assert(context.getTransform().isIdentity,'scene transform leaked');}finally{ByteRunner.art.background=original;}
});
running=false;
