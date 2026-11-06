/* Camera input only: owns presentation caches, never gameplay state. */
(() => {
  const mod=(a,b)=>(a%b+b)%b;
  const signalPaths={software:[[44,48],[78,48]],switch:[[32,58],[32,92],[108,92]],router:[[14,98],[46,66],[46,28],[100,28]],dhcp:[[64,82],[64,98],[30,98]],dns:[[64,36],[64,58],[26,58],[26,82]],wifi:[[60,22],[64,22]],cabling:[[24,98],[44,98]],firewall:[[24,26],[28,26]],servers:[[36,28],[40,28]]};
  function create(phase){
    const config=ByteRunner.parallaxProfiles.resolve(phase),strips=new Map();
    const life=config?ByteRunner.parallaxLife?.create(phase,config):null;
    // Snapshot presentation bounds; never retain or mutate runtime state.
    const arena=phase?.layers?.flatMap(l=>l.items||[]).find(item=>item.kind==='boss-arena');
    const arenaBounds=arena?{x:arena.x,y:arena.y,width:arena.width,height:arena.height}:null;
    const mapWidth=phase?.map?.width||6800;
    const signalPath=signalPaths[config?.theme];
    const signalLengths=signalPath?.slice(1).map((b,i)=>Math.hypot(b[0]-signalPath[i][0],b[1]-signalPath[i][1]));
    const signalPeriod=signalLengths?.reduce((a,b)=>a+b,0);
    let disposed=false,builds=0,hits=0;
    return Object.freeze({config,life,
      get stats(){const bytes=[...strips.values()].reduce((sum,e)=>sum+e.strip.width*e.strip.height*4,0);return {strips:strips.size,builds,hits,bytes,extraBytes:life?.stats.bytes||0,totalBytes:bytes+(life?.stats.bytes||0)};},
      draw(ctx,view,time,visuals){
        if(disposed||!config||!visuals.hasAsset(config.asset))return false;
        const reduced=ByteRunner.experience?.settings.reducedEffects;
        const comfort=ByteRunner.parallaxLife?.settings||{},still=reduced||comfort.reduceAnimations;
        ctx.save();
        try{
          ctx.imageSmoothingEnabled=false;ctx.fillStyle=config.background;ctx.fillRect(0,0,view.width,view.height);
          const planes=reduced?config.planes.slice(0,config.reducedLayerCount):config.planes;
          for(const p of planes){
            const size=config.tileSize*p.scale,ox=Math.floor(view.x*p.rateX),oy=Math.floor(view.y*p.rateY*config.verticalMultiplier),period=size*config.variants;
            const image=visuals.source(config.asset);let entry=strips.get(p.name);
            if(image&&entry?.image!==image){
              const strip=document.createElement('canvas');strip.width=period;strip.height=size;
              const c=strip.getContext('2d',{alpha:p.name!=='distant',willReadFrequently:true});c.imageSmoothingEnabled=false;
              if(p.name==='distant'){c.fillStyle=config.background;c.fillRect(0,0,strip.width,strip.height);}c.globalAlpha=p.opacity;
              for(let x=0;x<config.variants;x++)visuals.sprite(c,{asset:config.asset,animation:p.name,frame:p.frame+x},{x:x*size,y:0,width:size,height:size},0);
              entry={image,strip};strips.set(p.name,entry);builds++;
            }else if(entry)hits++;
            if(!entry)continue;
            ctx.globalAlpha=1;
            const pitch=size*(config.rowSpacing||1);
            for(let y=Math.floor(oy/pitch);y<Math.ceil((oy+view.height)/pitch);y++){
              let dx=0,sx=mod(ox+y*size,period);
              while(dx<view.width){const take=Math.min(period-sx,view.width-dx);ctx.drawImage(entry.strip,sx,0,take,size,dx,y*pitch-oy,take,size);dx+=take;sx=0;}
            }
          }
          life?.draw(ctx,view,time,visuals);
          // A single packet/status mark per authored middle bay. Its route is
          // in atlas coordinates, so it follows both axes without screen drift.
          if(!still){
            const path=signalPath,lengths=signalLengths,p=config.planes[1];
            if(path){
              const size=config.tileSize*p.scale,pitch=size*(config.rowSpacing||1),ox=Math.floor(view.x*p.rateX),oy=Math.floor(view.y*p.rateY*config.verticalMultiplier);
              let distance=mod(time*8,signalPeriod),segment=0;
              while(segment<lengths.length-1&&distance>lengths[segment])distance-=lengths[segment++];
              const a=path[segment],b=path[segment+1],t=distance/lengths[segment];
              ctx.fillStyle=config.accent;ctx.globalAlpha=.24;
              for(let row=Math.floor(oy/pitch);row<Math.ceil((oy+view.height)/pitch);row++)for(let col=Math.floor(ox/size);col<Math.ceil((ox+view.width)/size);col++){
                if(![1,5].includes(mod(col+row,config.variants)))continue;
                ctx.fillRect(Math.floor(col*size-ox+(a[0]+(b[0]-a[0])*t)*p.scale),Math.floor(row*pitch-oy+(a[1]+(b[1]-a[1])*t)*p.scale),2,2);
                if(config.theme==='wifi'&&mod(time+col+row,8)<.35){
                  ctx.fillRect(col*size-ox+34,row*pitch-oy+30,6,2);
                  ctx.fillRect(col*size-ox+86,row*pitch-oy+22,4,2);
                }
              }
            }
          }
          if(config.theme==='servers'){
            const cx=view.x+view.width/2;
            const progress=Math.max(0,Math.min(1,cx/mapWidth));
            const inArena=arenaBounds&&view.x+view.width>arenaBounds.x&&view.x<arenaBounds.x+arenaBounds.width&&view.y+view.height>arenaBounds.y&&view.y<arenaBounds.y+arenaBounds.height;
            if(inArena){
              ctx.save();
              ctx.beginPath();ctx.rect(arenaBounds.x-view.x,arenaBounds.y-view.y,arenaBounds.width,arenaBounds.height);ctx.clip();
              const size=256,x=Math.floor(arenaBounds.x+arenaBounds.width/2-size/2-view.x),y=Math.floor(arenaBounds.y+arenaBounds.height/2-size/2-view.y);
              ctx.globalAlpha=.72;visuals.sprite(ctx,{asset:config.asset,animation:'arena',frame:24},{x,y,width:size,height:size},0);
              ctx.restore();
            }
            // Corruption grows spatially towards the core. Slow, small raster
            // fragments, no screen flashes; reduced mode retains the static core.
            if(!still&&!comfort.reduceParticles){
              const count=Math.floor(progress*6)+(inArena?4:0),tick=Math.floor(time*.5);
              ctx.fillStyle='#9a577e';ctx.globalAlpha=inArena?.25:.16;
              for(let i=0;i<count;i++){
                const x=Math.floor(mod(i*173+tick*19-view.x*.12,view.width)),y=Math.floor(mod(i*97+tick*7-view.y*.1,view.height));
                ctx.fillRect(x,y,4+i%3*4,2);
              }
            }
          }
          if(!reduced&&!comfort.reduceParticles)for(let i=0;i<config.particles.count;i++){
            const ambient=config.particles.ambient;
            const t=still?0:time;
            const x=Math.floor(mod(i*137-view.x*config.particles.rateX+t*(ambient ? 1+i%3 : 4+i%4),view.width)),y=Math.floor(mod(i*71-view.y*config.particles.rateY+t*(i%3-1)*(ambient ? .4 : 2),view.height));
            ctx.fillStyle=config.accent;ctx.globalAlpha=.18;ctx.fillRect(x,y,1,1);
          }
          return true;
        }finally{ctx.restore();}
      },
      dispose(){strips.clear();life?.dispose();disposed=true;}
    });
  }
  ByteRunner.parallax=Object.freeze({create});
})();
