// One phase per invocation: run_review.py --identity-phase N.
setup(IDENTITY_PHASE-1);await levelVisuals.ready;endPhaseIntro();animationTime=1.2;
const identityConfig=levelVisuals.parallax.config;
const identityState=()=>JSON.stringify({phaseData,player,components,viruses,xp,checkpointX,checkpointY,cameraX,cameraY});
test('identity: native raster, empty margins, quiet variants and distinct plane silhouettes',()=>{
  const image=levelVisuals.source(identityConfig.asset),c=document.createElement('canvas');c.width=image.width;c.height=image.height;
  const x=c.getContext('2d');x.drawImage(image,0,0);const data=x.getImageData(0,0,c.width,c.height).data;
  const signatures=[];
  for(let row=0;row<identityConfig.planes.length;row++){
    let empty=0,filled=0;const signature=[];
    for(let f=0;f<8;f++){
      let count=0;
      for(let y=0;y<128;y++)for(let xx=0;xx<128;xx++){
        const offset=((row*128+y)*c.width+f*128+xx)*4,alpha=data[offset+3];
        assert(alpha===0||alpha===255,'antialiasing');
        if(xx===0||xx===127||y===0||y===127)assert(alpha===0,'tile border seam');
        if(alpha)count++;
        signature.push(alpha?1:0);
      }
      if(count)filled++;else empty++;
    }
    assert(empty>=4&&filled>=1,'missing breathing room or motif');signatures.push(signature.join(''));
  }
  assert(new Set(signatures).size===identityConfig.planes.length,'same silhouette across depth planes');
});
test('identity: camera X/Y, negative coordinates, determinism, cache and canvas state',()=>{
  const c=document.createElement('canvas');c.width=640;c.height=360;const x=c.getContext('2d');
  x.globalAlpha=.8;x.imageSmoothingEnabled=true;const state=()=>JSON.stringify([x.globalAlpha,x.imageSmoothingEnabled,x.getTransform().toString()]);
  const initial=state(),before=identityState(),render=(xx,y,t=1.2)=>{
    x.clearRect(0,0,640,360);
    levelVisuals.parallax.draw(x,{x:xx,y,width:640,height:360},t,levelVisuals);assert(state()===initial,'Canvas state leak');return c.toDataURL();
  };
  const a=render(0,0),b=render(1200,0),d=render(0,800);assert(a!==b&&a!==d&&render(0,0)===a,'axis/determinism');render(-317,-173);
  const builds=levelVisuals.parallax.stats.builds;render(90000,90000);
  assert(builds===identityConfig.planes.length&&levelVisuals.parallax.stats.builds===builds&&levelVisuals.parallax.stats.bytes<=4718592,'cache grew on travel');
  assert(identityState()===before,'gameplay state changed');
});
test('identity: reduced effects are static and retain authored scenery',()=>{
  const old=experience.settings.reducedEffects,c=document.createElement('canvas');c.width=640;c.height=360;const x=c.getContext('2d');
  const render=t=>{levelVisuals.parallax.draw(x,{x:300,y:200,width:640,height:360},t,levelVisuals);return c.toDataURL();};
  try{experience.settings.reducedEffects=true;assert(render(0)===render(6),'animated reduced mode');}finally{experience.settings.reducedEffects=old;}
});
test('identity: full scene preserves actors, collision shapes, objectives and nearest-neighbor',()=>{
  const before=identityState(),shapes=JSON.stringify(solids());draw();
  assert(identityState()===before&&JSON.stringify(solids())===shapes,'scene changed game');
  assert(!pixelContext.imageSmoothingEnabled&&!displayContext.imageSmoothingEnabled,'blurred framebuffer');
});
const maxX=Math.max(0,worldWidth()-width),maxY=Math.max(0,phaseData.map.height-height);
const startX=Math.max(0,Math.min(maxX,mapStart().x-width*.3)),startY=Math.max(0,Math.min(maxY,mapStart().y-height*.65));
for(const [position,x,y] of [['start',startX,startY],['horizontal',maxX*.62,startY],['vertical',maxX*.4,0]]){
  cameraX=Math.floor(x);cameraY=Math.floor(y);draw();report.snapshots.push({phase:IDENTITY_PHASE,position,image:captureCanvas()});
}
// Clean layer-only reference, so world decoration cannot hide a wrong atlas.
const reference=document.createElement('canvas');reference.width=width;reference.height=height;
levelVisuals.parallax.draw(reference.getContext('2d'),{x:0,y:0,width,height},1.2,levelVisuals);
report.snapshots.push({phase:IDENTITY_PHASE,position:'layers',image:reference.toDataURL()});
if(IDENTITY_PHASE===10){
  const arena=phaseData.layers.flatMap(l=>l.items||[]).find(item=>item.kind==='boss-arena');
  test('identity: corruption increases toward core and arena is gated in both axes',()=>{
    assert(arena&&levelVisuals.source('vista-10').height===512,'missing regional core atlas');
    const c=document.createElement('canvas');c.width=640;c.height=360;const x=c.getContext('2d'),sprite=levelVisuals.sprite;
    let coreCalls=0,fragments=0;const native=x.fillRect.bind(x);
    x.fillRect=(...args)=>{if(x.fillStyle==='#9a577e')fragments++;return native(...args);};
    levelVisuals.sprite=(ctx,visual,...args)=>{if(visual.animation==='arena')coreCalls++;return sprite(ctx,visual,...args);};
    const render=(xx,y)=>{coreCalls=0;fragments=0;levelVisuals.parallax.draw(x,{x:xx,y,width:640,height:360},0,levelVisuals);return {cores:coreCalls,fragments};};
    try{
      const entry=render(0,1300),approach=render(arena.x-700,arena.y),inside=render(arena.x,arena.y),below=render(arena.x,arena.y+arena.height+50);
      assert(entry.cores===0&&approach.cores===0&&below.cores===0&&inside.cores===1,'regional atmosphere leaks');
      assert(approach.fragments>entry.fragments&&inside.fragments>approach.fragments,'corruption is not progressive');
      const old=experience.settings.reducedEffects;try{experience.settings.reducedEffects=true;const reduced=render(arena.x,arena.y);assert(reduced.cores===1&&reduced.fragments===0,'reduced core');}finally{experience.settings.reducedEffects=old;}
    }finally{levelVisuals.sprite=sprite;}
  });
  cameraX=Math.floor(arena.x+arena.width/2-width/2);cameraY=Math.max(0,Math.floor(arena.y+arena.height/2-height/2));draw();
  report.snapshots.push({phase:10,position:'arena',image:captureCanvas()});
}
running=false;
