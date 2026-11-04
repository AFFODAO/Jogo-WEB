// Real image decode and atlas sampling, including fallback after a missing resource.
setup(0);
await levelVisuals.ready;
test('art: all 22 local atlases decode and every animation paints pixels',()=>{
  assert(ByteRunner.artAssets.length===22,'atlas count');
  assert(levelVisuals.errors.length===0,'failed assets: '+levelVisuals.errors);
  const surface=document.createElement('canvas');surface.width=64;surface.height=64;
  const c=surface.getContext('2d');
  for(const asset of ByteRunner.artAssets)for(const state of Object.keys(asset.animations))for(let f=0;f<6;f++) {
    c.clearRect(0,0,64,64);
    assert(levelVisuals.sprite(c,{asset:asset.id,animation:state},{x:0,y:0,width:64,height:64},f/8),'sprite not drawn '+asset.id);
    assert(c.getImageData(0,0,64,64).data.some((v,i)=>i%4===3&&v>0),'empty frame '+asset.id+':'+state+':'+f);
  }
});
const missing=ByteRunner.visuals.create({assets:[{id:'missing-test',src:'assets/absent.svg'}]});
await missing.ready;
test('art: failed image returns fallback signal',()=>{
  assert(missing.errors.includes('missing-test'),'missing resource not reported');
  assert(missing.sprite(ctx,{asset:'missing-test'},player,0)===false,'fallback signal missing');
});
missing.dispose();
for(let i=0;i<10;i++) {
  setup(i);await levelVisuals.ready;animationTime=1;damageCooldown=0;
  draw();report.snapshots.push({phase:i+1,position:'art-start',image:canvas.toDataURL()});
}
setup(0);await levelVisuals.ready;
test('art: robot actions and shield draw without changing gameplay',()=>{
  for(const state of ['idle','run','jump','fall','attack','hit','repair','death'])assert(levelVisuals.sprite(ctx,{asset:'r07',animation:state},player,1),'robot '+state);
  const x=player.x,y=player.y,hp=player.health;
  player.shieldTime=2;drawRobot();player.shieldTime=0;
  assert(player.x===x&&player.y===y&&player.health===hp,'renderer mutated gameplay');
});
running=false;
