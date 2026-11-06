// Real image decode and atlas sampling, including fallback after a missing resource.
setup(0);
await levelVisuals.ready;
const artLibrary=ByteRunner.visuals.create({assets:ByteRunner.artAssets});await artLibrary.ready;
test('art: all 77 original PNG atlases decode and every declared frame paints pixels',()=>{
  assert(ByteRunner.artAssets.length===77,'atlas count');
  assert(ByteRunner.artAssets.every(asset=>asset.src.endsWith('.png')&&asset.pixelArt),'non-raster primary asset');
  assert(artLibrary.errors.length===0,'failed assets: '+artLibrary.errors);
  const surface=document.createElement('canvas');surface.width=64;surface.height=64;
  const c=surface.getContext('2d');
  for(const asset of ByteRunner.artAssets)for(const state of Object.keys(asset.animations))for(let f=0;f<asset.animations[state].frames.length;f++) {
    c.clearRect(0,0,64,64);
    assert(artLibrary.sprite(c,{asset:asset.id,animation:state},{x:0,y:0,width:64,height:64},f/asset.animations[state].fps+.00001),'sprite not drawn '+asset.id);
    assert(c.getImageData(0,0,64,64).data.some((v,i)=>i%4===3&&v>0),'empty frame '+asset.id+':'+state+':'+f);
  }
});
artLibrary.dispose();
const missing=ByteRunner.visuals.create({assets:[{id:'missing-test',src:'assets/absent.svg'}]});
await missing.ready;
test('art: failed image returns fallback signal',()=>{
  assert(missing.errors.includes('missing-test'),'missing resource not reported');
  assert(missing.sprite(ctx,{asset:'missing-test'},player,0)===false,'fallback signal missing');
});
missing.dispose();
for(let i=0;i<10;i++) {
  setup(i);await levelVisuals.ready;animationTime=1;damageCooldown=0;
  draw();report.snapshots.push({phase:i+1,position:'art-start',image:captureCanvas()});
}
setup(0);await levelVisuals.ready;
test('art: robot actions and shield draw without changing gameplay',()=>{
  for(const state of ['idle','run','jump','fall','attack','hit','repair','death','ability'])assert(levelVisuals.sprite(ctx,{asset:'r07',animation:state},player,1),'robot '+state);
  const x=player.x,y=player.y,hp=player.health;
  player.shieldTime=2;drawRobot();player.shieldTime=0;
  assert(player.x===x&&player.y===y&&player.health===hp,'renderer mutated gameplay');
});
running=false;
