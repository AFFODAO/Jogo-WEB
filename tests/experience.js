test('experience: reduced effects persist, bound particles and suppress shake',()=>{
  setup(0);const previous={...experience.settings};
  try {
    experience.configure({reducedEffects:true,shake:true,volume:.4});
    experience.shake(20,2);assert(experience.offset().x===0,'reduced effects shook camera');
    effects=[];for(let i=0;i<100;i++)emitParticles(20,20,'white',30);assert(effects.length===48,'reduced particle cap');
    assert(JSON.parse(localStorage.getItem('byteRunner.experience.v1')).volume===.4,'volume not persisted');
    experience.configure({reducedEffects:false,shake:true});experience.shake(30,9);experience.update(.01);
    assert(Math.abs(experience.offset().x)<=3&&Math.abs(experience.offset().y)<=3,'excessive shake');
    const x=cameraX,y=cameraY;draw();assert(x===cameraX&&y===cameraY,'render shake moved real camera');
    experience.update(.5);assert(experience.offset().x===0,'shake did not expire');
  }finally{experience.configure(previous);experience.reset();}
});
test('experience: intro freezes the world, can be skipped and settings pause safely',()=>{
  setup(0);paused=false;player.x=components[0].x;player.y=components[0].y;
  const snapshot=JSON.stringify({player,viruses,animationTime});beginPhaseIntro();
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'e'}));update(.1);
  assert(!repairSession&&snapshot===JSON.stringify({player,viruses,animationTime}),'intro advanced world or opened puzzle');
  assert(!document.getElementById('phaseIntro').hidden&&document.getElementById('introMission').textContent===phaseData.objective,'intro mission absent');
  document.getElementById('skipIntro').click();assert(phaseIntroTime===0&&!keys.size,'intro skip failed');
  document.getElementById('settingsButton').click();assert(!running&&paused&&document.getElementById('settingsDialog').open,'settings did not pause');
  document.getElementById('closeSettings').click();startButton.click();assert(running,'resume after settings');
});
test('experience: camera anticipation and vertical safety stay inside all map bounds',()=>{
  for(let i=0;i<10;i++) {
    setup(i);const map={width:worldWidth(),height:worldHeight(),axes:phaseData.map.camera.axes,offsetX:phaseData.map.camera.followOffsetX,offsetY:phaseData.map.camera.followOffsetY};
    for(const direction of [-1,1]) {
      const p={...player,x:map.width/2,y:map.height/2,vx:direction*255,vy:700,grounded:false};
      let view={x:0,y:0,width,height};
      for(let t=0;t<120;t++)view={...view,...experience.camera(p,view,map,1/60)};
      assert(view.x>=0&&view.x<=Math.max(0,map.width-width)&&view.y>=0&&view.y<=Math.max(0,map.height-height),'camera outside '+i);
      if(map.axes.includes('y'))assert(p.y-view.y>=-1&&p.y+p.height-view.y<=height,'camera lost falling player');
    }
  }
  const at30=experience.follow(0,100,1/30),at60=experience.follow(experience.follow(0,100,1/60),100,1/60);
  assert(Math.abs(at30-at60)<1e-8,'camera smoothing depends on frame rate');
});
test('experience: fixed simulation gives consistent travel at 30, 60 and 144 Hz',()=>{
  const results=[];
  for(const rate of [30,60,144]) {
    setup(0);xpRequired=999999;viruses.forEach(v=>v.alive=false);keys.add('d');lastFrame=0;frameAccumulator=0;
    for(let i=1;i<=rate/2;i++)frame(i*1000/rate);
    results.push(player.x);keys.clear();
  }
  assert(Math.max(...results)-Math.min(...results)<3,'frame rates changed travel: '+results);
});
test('experience: optional caches have clear support, are reachable and save once',()=>{
  let count=0;
  for(let phase=0;phase<10;phase++) {
    setup(phase);xpRequired=999999;components.forEach(component=>component.repaired=true);fulfilGoalsForQuestionTest();
    const accessible=reachability();
    for(const cache of pacing.caches) {
      count++;
      const support=solids().find(s=>cache.x>=s.x&&cache.x<s.x+s.w&&Math.abs(s.y-cache.y-23)<1);
      assert(support,'unsupported cache '+phase+'/'+cache.id);
      const box={x:cache.x-17,y:cache.y-25,width:34,height:48};
      assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(box,s)),'cache embedded '+cache.id);
      assert(accessible.some(n=>cache.x>=n.a-17&&cache.x<=n.z+34&&Math.abs(n.y+24-cache.y)<30),'cache not reachable '+phase+'/'+cache.id);
      player.x=cache.x-17;player.y=cache.y-24;
      const before=xp;pacing.update(.01);const after=xp;pacing.update(.01);
      assert(after>before&&xp===after&&levelRuntime.getFlag(cache.id),'cache reward repeated');
      assert(getSavedCampaign().levelState.flags[cache.id],'cache collection not saved');
    }
  }
  assert(count>=15,'not enough exploration rewards: '+count);
});
test('experience: original ambience differs across phases and schedules bounded voices',()=>{
  const notes=[],contexts=[],previous={...experience.settings};
  experience.configure({volume:.6,music:.3});
  function context() {
    const c={state:'running',currentTime:0,destination:{}};
    const param=()=>({cancelScheduledValues(){},setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
    c.createGain=()=>({context:c,gain:param(),connect(){},disconnect(){}});
    c.createOscillator=()=>({frequency:{setValueAtTime:f=>notes.push(f)},connect(){},start(){},stop(){},disconnect(){}});
    return c;
  }
  try {
    const signatures=[];
    for(let phase=0;phase<10;phase++) {
      const c=context();contexts.push(c);const start=notes.length;experience.audio(c,phase,true);
      signatures.push(notes.slice(start).join(','));
      for(let i=0;i<60;i++){c.currentTime+=.1;experience.audio(c,phase,true);}
      assert(notes.length-start<=12,'unbounded ambience voices');
    }
    assert(new Set(signatures).size===10,'phases share identical ambience');
    const before=notes.length;experience.audio(contexts.at(-1),9,false);assert(notes.length===before,'paused ambience scheduled notes');
  }finally{experience.configure(previous);}
});
running=false;
