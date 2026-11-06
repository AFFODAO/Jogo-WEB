setup(0);await levelVisuals.ready;endPhaseIntro();animationTime=1.2;
const depthConfig=levelVisuals.parallax.config;
test('depth hardware: four ordered structure planes and separate sparse atmosphere',()=>{
  assert(depthConfig.planes.length===4&&depthConfig.particles.ambient&&depthConfig.particles.count===4,'five layers missing');
  assert(depthConfig.planes.map(p=>p.name).join(',')==='distant,middle,near,close','layer order');
  for(const axis of ['rateX','rateY'])assert(depthConfig.planes.every((p,i)=>p[axis]>0&&(!i||p[axis]>depthConfig.planes[i-1][axis])),'depth speed order '+axis);
  assert(depthConfig.planes[0].rateX<=.03&&depthConfig.planes.at(-1).rateX<1,'background camera speed');
  assert(ByteRunner.parallaxProfiles.profiles.software.planes.length===3,'later phase changed');
});
test('depth hardware: all variant edges tile seamlessly on both axes',()=>{
  const image=levelVisuals.source('vista-01'),c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);const data=x.getImageData(0,0,c.width,c.height).data;
  const equal=(a,b)=>{for(let channel=0;channel<4;channel++)assert(data[a+channel]===data[b+channel],'atlas seam at '+a+'/'+b);};
  for(let row=0;row<4;row++)for(let f=0;f<8;f++)for(let p=0;p<128;p++){
    equal(((row*128+p)*c.width+f*128+127)*4,((row*128+p)*c.width+((f+1)%8)*128)*4);
    equal(((row*128+127)*c.width+f*128+p)*4,((row*128)*c.width+((f+1)%8)*128+p)*4);
  }
});
test('depth hardware: smooth fractional camera input produces integer monotone offsets',()=>{
  const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');
  for(const axis of ['x','y']){
    let previous=null;
    for(let step=0;step<=40;step++){
      levelVisuals.parallax.draw(x,{x:axis==='x'?step*.1:0,y:axis==='y'?step*.1:0,width:128,height:128},0,levelVisuals);
      const offsets=levelVisuals.parallax.stats.offsets;assert(offsets.length===4,'missing planes');
      for(let i=0;i<4;i++){const value=offsets[i][axis];assert(Number.isInteger(value),'subpixel background');if(previous){const delta=value-previous[i];assert(delta>=0&&delta<=1,'camera jitter');}}
      previous=offsets.map(o=>o[axis]);
    }
  }
});
test('depth hardware: actual horizontal and vertical camera follow remains bounded',()=>{
  const p={...player,x:1400,y:700,vx:100,vy:0,grounded:true};
  for(const axis of ['x','y']){let view={x:0,y:0,width:320,height:224};const map={width:2800,height:1000,axes:[axis],offsetX:.44,offsetY:.55};
    for(let i=0;i<120;i++){const next=experience.camera(p,view,map,1/120);assert(next[axis]>=view[axis]&&next.x>=0&&next.y>=0&&next.x<=2480&&next.y<=776,'camera oscillation/bounds');assert(next[axis==='x'?'y':'x']===0,'disabled camera axis moved');view={...view,...next};}
    assert(view[axis]>100,'camera did not follow');
  }
});
test('depth hardware: atmosphere animates occasionally and reduced effects retain silhouettes',()=>{
  const c=document.createElement('canvas');c.width=320;c.height=224;const x=c.getContext('2d');const image=t=>{levelVisuals.parallax.draw(x,{x:200,y:150,width:320,height:224},t,levelVisuals);return c.toDataURL();};
  const a=image(0),b=image(4);assert(a!==b&&image(0)===a,'atmosphere frozen or cumulative');
  const reduced=experience.settings.reducedEffects;try{experience.settings.reducedEffects=true;assert(image(0)===image(4),'reduced mode has ambient motion');}finally{experience.settings.reducedEffects=reduced;}
  assert(levelVisuals.parallax.stats.strips===4&&levelVisuals.parallax.stats.bytes<=3670016,'cache bound');
});
test('depth hardware: scenery is drawn before solid platforms, enemies and robot',()=>{
  const events=[],background=ByteRunner.backgroundScene,scene=background.draw,s=drawSolids,v=drawViruses,r=drawRobot;
  ByteRunner.backgroundScene={...ByteRunner.backgroundScene,draw(...args){events.push('background');return scene(...args);}};
  drawSolids=(...args)=>{events.push('platforms');return s(...args);};drawViruses=(...args)=>{events.push('enemies');return v(...args);};drawRobot=(...args)=>{events.push('robot');return r(...args);};
  try{draw();assert(events.join(',')==='background,platforms,enemies,robot','background covers gameplay');}finally{ByteRunner.backgroundScene=background;drawSolids=s;drawViruses=v;drawRobot=r;}
});
test('depth hardware: motherboard decoration no longer masks the parallax',()=>{
  const c=document.createElement('canvas');c.width=320;c.height=224;const x=c.getContext('2d');x.fillStyle='#572448';x.fillRect(0,0,320,224);
  ByteRunner.environmentArt.feature(x,{kind:'board',x:0,y:0,width:320,height:224},{x:0,y:0,width:320,height:224},1,levelVisuals,0);
  assert([...x.getImageData(100,100,1,1).data].join(',')==='87,36,72,255','opaque motherboard still hides background');
});
for(const [name,x,y] of [['start',0,356],['horizontal',1200,356],['vertical',1200,0]]){
  cameraX=x;cameraY=y;draw();report.snapshots.push({phase:1,position:'depth-'+name,image:captureCanvas()});
}
running=false;
