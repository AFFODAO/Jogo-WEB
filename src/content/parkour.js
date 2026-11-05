// Pixel-aligned telegraphs; these hazards never become invisible collision walls.
(() => {
  const intersects=(p,h)=>p.x<h.x+h.width&&p.x+p.width>h.x&&p.y<h.y+h.height&&p.y+p.height>h.y;
  const status=(h,time)=>{const cycle=((time+(h.phase||0))%h.period+h.period)%h.period;return cycle<h.warning?'warning':cycle<h.warning+h.active?'active':'safe';};
  ByteRunner.parkourHazards=Object.freeze({status});
  ByteRunner.levels.registerMechanic('parkour-hazards',(spec,state)=>{
    let time=0;
    return {
      update(dt){time+=dt;for(const h of spec.hazards)if(status(h,time)==='active'&&intersects(state.context.player(),h))state.context.damagePlayer(h.damage||10,h);},
      draw(ctx,view){
        for(const h of spec.hazards){
          if(h.x+h.width<view.x||h.x>view.x+view.width||h.y+h.height<view.y||h.y>view.y+view.height)continue;
          const mode=status(h,time);ctx.save();ctx.fillStyle=mode==='active'?'#ff586d':mode==='warning'?'#ffd166':'#355563';
          if(mode==='active'){
            if(h.kind==='laser'){ctx.fillRect(h.x,h.y,h.width,h.height);ctx.fillStyle='#ffe5ea';ctx.fillRect(h.x+2,h.y,2,h.height);}
            else for(let x=h.x;x<h.x+h.width;x+=8){ctx.fillRect(x,h.y+4,6,4);ctx.fillRect(x+2,h.y,2,14);}
          }else for(let y=h.y;y<h.y+h.height;y+=8)ctx.fillRect(h.x,y,mode==='warning'?h.width:2,2);
          ctx.fillRect(h.x-4,h.y-5,h.width+8,4);ctx.fillRect(h.x-4,h.y+h.height,h.width+8,4);
          ByteRunner.pixelArt?.text(ctx,mode==='warning'?'AVISO':mode==='active'?'ON':'OFF',h.x-8,h.y-18,mode==='safe'?'#a5d7bf':'#ffe0ac',72);ctx.restore();
        }
      }
    };
  });
})();
