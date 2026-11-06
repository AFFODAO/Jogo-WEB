window.__reviewProgress?.('PNG pixel art verification');
setup(0);await levelVisuals.ready;
const pixelLibrary=ByteRunner.visuals.create({assets:ByteRunner.artAssets});await pixelLibrary.ready;
test('pixel art: native PNG dimensions, opaque palette pixels and complete robot actions',()=>{
  const robot=ByteRunner.artAssets.find(a=>a.id==='r07');
  assert(robot.frameWidth===32&&robot.frameHeight===48&&robot.columns===8,'robot native grid');
  for(const state of ['idle','run','jump','fall','attack','hit','repair','death','ability'])assert(robot.animations[state]?.frames.length===8,'missing robot row '+state);
  for(const asset of ByteRunner.artAssets) {
    const source=pixelLibrary.source(asset.id);assert(source&&source.width===asset.frameWidth*8,'sheet width '+asset.id);
    const max=Math.max(...Object.values(asset.animations).flatMap(a=>a.frames));assert((Math.floor(max/8)+1)*asset.frameHeight===source.height,'sheet bounds '+asset.id);
    const sample=document.createElement('canvas');sample.width=source.width;sample.height=source.height;const c=sample.getContext('2d');c.drawImage(source,0,0);
    const data=c.getImageData(0,0,sample.width,sample.height).data;
    for(let i=3;i<data.length;i+=4)assert(data[i]===0||data[i]===255,'antialiased source pixels '+asset.id);
  }
});
test('pixel art: tilesets differ structurally after removing palette colors',()=>{
  const hashes=new Set(),surface=document.createElement('canvas');surface.width=32;surface.height=32;const c=surface.getContext('2d');
  for(let phase=1;phase<=10;phase++) {
    const id='tiles-'+String(phase).padStart(2,'0'),asset=ByteRunner.artAssets.find(a=>a.id===id);
    for(const state of ['idle','fill','bottom','wall','moving','temporary','dangerous','wire','screen'])assert(asset.animations[state],'incomplete tileset '+id+'/'+state);
    c.clearRect(0,0,32,32);pixelLibrary.sprite(c,{asset:id,animation:'fill'},{x:0,y:0,width:32,height:32},0);
    const rgba=c.getImageData(0,0,32,32).data,colors=new Map();let hash=2166136261;
    for(let i=0;i<rgba.length;i+=4){const key=rgba.slice(i,i+4).join(',');if(!colors.has(key))colors.set(key,colors.size);hash=Math.imul(hash^colors.get(key),16777619);}
    hashes.add(hash>>>0);
  }
  assert(hashes.size===10,'tiles only recolored: '+hashes.size);
});
pixelLibrary.dispose();
test('pixel art: activating a real ability and respawning select the new animation rows',()=>{
  damageCooldown=0;xp=100;openLevelChoice();ui.levelOverlay.querySelector('[data-skill]').click();
  assert(abilityPose>0,'ability pose not triggered');
  const calls=[],original=levelVisuals.sprite;levelVisuals.sprite=(c,v,b,t,s)=>{calls.push({visual:v,box:b,state:s});return original(c,v,b,t,s);};
  try {
    drawRobot();assert(calls.some(c=>c.state==='ability'&&c.box.width===32&&c.box.height===48),'ability sprite not rendered at native size');
    const old={x:player.x+180,y:player.y};player.x=old.x;respawnAtCheckpoint();drawRobot();
    assert(calls.some(c=>c.visual.animation==='death'&&Math.abs(c.box.x-old.x)<3),'death not rendered at previous location');
    draw();assert(displayContext.imageSmoothingEnabled===false&&pixelContext.imageSmoothingEnabled===false,'nearest-neighbor disabled');
  }finally{levelVisuals.sprite=original;}
});
for(const phase of [1,2,4,7,8]) {
  setup(phase);await levelVisuals.ready;
  test('pixel art: thematic enemy and death PNG are used in phase '+(phase+1),()=>{
    const e=viruses.find(v=>v.variant);assert(e,'thematic enemy absent');
    const calls=[],original=levelVisuals.sprite;levelVisuals.sprite=(c,v,b,t,s)=>{calls.push({visual:v,state:s});return original(c,v,b,t,s);};
    try {
      cameraX=Math.max(0,e.x-width/2);cameraY=Math.max(0,e.y-height/2);drawViruses();
      assert(calls.some(c=>c.visual.asset==='virus-'+e.variant),'base sprite used instead of thematic variant');
      e.alive=false;e.deathAt=animationTime;drawViruses();
      assert(calls.some(c=>c.visual.asset==='virus-'+e.variant&&c.visual.animation==='death'),'thematic death not used');
    }finally{levelVisuals.sprite=original;}
  });
}
running=false;

setup(0);await levelVisuals.ready;
test('pixel art: repair frames advance while player and world stay frozen',()=>{
  player.x=components[0].x;player.y=components[0].y;keys.add('e');updateRepair(0);
  const before=JSON.stringify({player,viruses,animationTime}),calls=[],original=levelVisuals.sprite;
  levelVisuals.sprite=(c,v,b,t,s)=>{if(v.asset==='r07')calls.push({time:t,state:s});return original(c,v,b,t,s);};
  try {
    drawRobot();update(.15);drawRobot();
    assert(before===JSON.stringify({player,viruses,animationTime}),'repair animation moved the world');
    assert(calls.length===2&&calls.every(c=>c.state==='repair')&&calls[1].time>calls[0].time,'repair animation clock frozen');
  }finally{levelVisuals.sprite=original;cancelRepair();}
});
running=false;
