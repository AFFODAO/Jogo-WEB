const environmentIndices=typeof ENVIRONMENT_HARDWARE_ONLY!=='undefined'&&ENVIRONMENT_HARDWARE_ONLY?[0]:ByteRunner.artAssets.filter(a=>/^terrain-\d+$/.test(a.id)).map(a=>Number(a.id.slice(-2))-1);
const environmentSignatures=new Set();
test('environment: autotiling connects surfaces, preserves gaps and detects concave corners',()=>{
  const terrain=ByteRunner.environmentArt.terrain();
  const a={id:'a',x:0,y:0,w:32,h:32,kind:'floor',collision:'solid'};
  const b={...a,id:'b',x:32},c={...a,id:'c',y:32};terrain.sync([a,b,c]);
  const top=terrain.mask(a,0,0,32,32);assert(top.mask===6&&top.inner[2],'L-junction lacks inner corner');
  assert(terrain.mask(b,32,0,32,32).mask===8,'touching surfaces not connected');
  terrain.sync([a,{...b,x:33}]);assert(terrain.mask(a,0,0,32,32).mask===0,'real gap visually closed');
  terrain.sync([a,{...b,type:'moving'}]);assert(terrain.mask(a,0,0,32,32).mask===0,'moving geometry stitched to floor');
  terrain.sync([a,b]);assert(terrain.mask(a,0,0,32,32).mask===2,'repaired bridge did not update borders');
  terrain.sync([a,{...b,y:16,h:16}]);
  const partial=terrain.edgeRuns(a,1,0,32);assert(partial.length===2&&partial[0].exposed&&partial[0].length===16&&!partial[1].exposed,'partial connection loses exposed rim');terrain.dispose();
});
for(const index of environmentIndices) {
  setup(index);await levelVisuals.ready;animationTime=1;
  test('environment: cached parallax preserves pixels and reuses pre-scaled strips // phase '+(index+1),()=>{
    const make=()=>{const c=document.createElement('canvas');c.width=256;c.height=192;return c;},actual=make(),expected=make(),view={x:317,y:173,width:256,height:192},time=3.2,mod=(a,b)=>(a%b+b)%b;
    const reduced=ByteRunner.experience.settings.reducedEffects;ByteRunner.experience.settings.reducedEffects=false;
    try{
      ByteRunner.environmentArt.background(actual.getContext('2d'),view,time,index,levelVisuals);
      const c=expected.getContext('2d'),palette=ByteRunner.environmentArt.colors[index],id='vista-'+String(index+1).padStart(2,'0');c.imageSmoothingEnabled=false;c.fillStyle=palette[0];c.fillRect(0,0,256,192);
      for(const [name,rate,scale,alpha,base] of [['distant',.08,2,.5,0],['middle',.22,2,.48,8],['near',.4,1,.32,16]]){
        const size=128*scale,ox=Math.floor(view.x*rate),oy=Math.floor(view.y*rate*.45);c.globalAlpha=alpha;
        for(let y=Math.floor(oy/size)-1;y<Math.ceil((oy+view.height)/size);y++)for(let x=Math.floor(ox/size)-1;x<Math.ceil((ox+view.width)/size);x++)levelVisuals.sprite(c,{asset:id,animation:name,frame:base+mod(x+y,8)},{x:x*size-ox,y:y*size-oy,width:size,height:size},0);
      }
      for(let i=0;i<24;i++){const x=Math.floor(mod(i*137-view.x*.13+time*(4+i%4),view.width)),y=Math.floor(mod(i*71-view.y*.11+time*(i%3-1)*2,view.height));c.fillStyle=palette[2];c.globalAlpha=.08;c.fillRect(x-3,y-3,8,8);c.globalAlpha=.22;c.fillRect(x-1,y-1,4,4);c.globalAlpha=.75;c.fillRect(x,y,2,2);}
      const a=actual.getContext('2d').getImageData(0,0,256,192).data,b=c.getImageData(0,0,256,192).data;let max=0;for(let p=0;p<a.length;p++)max=Math.max(max,Math.abs(a[p]-b[p]));assert(max<=3,'cached parallax changed pixel composition: '+max);
      let calls=0;const original=levelVisuals.sprite;levelVisuals.sprite=(...args)=>{calls++;return original(...args);};try{ByteRunner.environmentArt.background(actual.getContext('2d'),view,time,index,levelVisuals);assert(calls===0,'parallax atlas rescaled every frame');}finally{levelVisuals.sprite=original;}
    }finally{ByteRunner.experience.settings.reducedEffects=reduced;}
  });
  test('environment: complete original tileset and three depth planes // phase '+(index+1),()=>{
    const suffix=String(index+1).padStart(2,'0');
    for(const name of ['terrain','structure','vista'])assert(levelVisuals.source(name+'-'+suffix),'missing environment PNG '+name);
    const atlas=ByteRunner.artAssets.find(a=>a.id==='terrain-'+suffix);
    for(let mask=0;mask<16;mask++)assert(atlas.animations['mask-'+mask]?.frames.length===8,'missing mask '+mask);
    for(let corner=0;corner<4;corner++)assert(atlas.animations['inner-'+corner],'missing inner corner');
    const vista=ByteRunner.artAssets.find(a=>a.id==='vista-'+suffix);
    for(const plane of ['distant','middle','near'])assert(vista.animations[plane],'missing parallax plane');
    for(const name of ['terrain','structure','vista']) {
      const image=levelVisuals.source(name+'-'+suffix),sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;const c=sample.getContext('2d');c.drawImage(image,0,0);
      const pixels=c.getImageData(0,0,sample.width,sample.height).data;for(let i=3;i<pixels.length;i+=4)assert(pixels[i]===0||pixels[i]===255,'antialiased source '+name);
    }
    const image=levelVisuals.source('terrain-'+suffix),sample=document.createElement('canvas');sample.width=32;sample.height=32;const c=sample.getContext('2d');c.drawImage(image,0,15*32,32,32,0,0,32,32);
    const data=c.getImageData(0,0,32,32).data,colors=new Map(),pattern=[];for(let p=0;p<data.length;p+=4){const key=data.slice(p,p+4).join(',');if(!colors.has(key))colors.set(key,colors.size);pattern.push(colors.get(key));}environmentSignatures.add(pattern.join(','));
  });
  test('environment: only current theme and required actors are loaded // phase '+(index+1),()=>{
    const suffix=String(index+1).padStart(2,'0'),loaded=levelVisuals.loadedAssets();
    assert(loaded.length<20,'loaded the entire art library');
    assert(loaded.filter(id=>/^(terrain|structure|vista|decor|tiles|sky)-/.test(id)).every(id=>id.endsWith(suffix)),'loaded another phase environment');
    assert(!loaded.includes('tiles-'+suffix)&&!loaded.includes('sky-'+suffix),'unused legacy scenery loaded');
    for(const enemy of viruses)assert(levelVisuals.source('virus-'+(enemy.variant||enemy.type)),'enemy sprite not selected');
  });
  test('environment: rendering leaves geometry, actors and progress unchanged // phase '+(index+1),()=>{
    const before=JSON.stringify({map:phaseData,shapes:solids(),player,components,viruses,xp,checkpointX,checkpointY});
    draw();assert(before===JSON.stringify({map:phaseData,shapes:solids(),player,components,viruses,xp,checkpointX,checkpointY}),'visual pass changed game state');
    assert(pixelContext.imageSmoothingEnabled===false&&displayContext.imageSmoothingEnabled===false,'filtered framebuffer');
  });
  damageCooldown=0;cameraX=Math.max(0,mapStart().x-width*.3);cameraY=Math.max(0,mapStart().y-height*.65);draw();
  report.snapshots.push({phase:index+1,position:'environment',image:captureCanvas()});
}
test('environment: themes differ structurally after removing palette colors',()=>assert(environmentSignatures.size===environmentIndices.length,'environment tiles are recolors'));
setup(0);await levelVisuals.ready;
test('environment: visible-only chunks are reused and memory stays bounded',()=>{
  const service=levelVisuals,terrain=service.terrain,shape={id:'huge-test',x:0,y:0,w:1000000,h:64,kind:'floor',collision:'solid'};
  const sample=document.createElement('canvas');sample.width=640;sample.height=96;const c=sample.getContext('2d');terrain.sync([shape]);
  const view={x:0,y:0,width:640,height:96},start=terrain.stats.builds;
  ByteRunner.environmentArt.platform(c,service,shape,0,0,view);assert(terrain.stats.builds-start<=3,'rasterized invisible world');
  const built=terrain.stats.builds;ByteRunner.environmentArt.platform(c,service,shape,0,0,view);assert(terrain.stats.builds===built&&terrain.stats.hits>0,'static chunks rebuilt');
  for(let i=0;i<120;i++)ByteRunner.environmentArt.platform(c,service,shape,0,0,{...view,x:i*1024});
  assert(terrain.cacheSize<=96,'unbounded chunk cache');
});
running=false;
