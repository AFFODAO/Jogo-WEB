/* Camera input only: owns presentation caches, never gameplay state. */
(() => {
  const mod=(a,b)=>(a%b+b)%b;
  const signalPaths={software:[[44,48],[78,48]],switch:[[32,58],[32,92],[108,92]],router:[[14,98],[46,66],[46,28],[100,28]],dhcp:[[64,82],[64,98],[30,98]],dns:[[64,36],[64,58],[26,58],[26,82]],wifi:[[60,22],[64,22]],cabling:[[24,98],[44,98]],firewall:[[24,26],[28,26]],servers:[[36,28],[40,28]]};
  function create(phase){
    const config=ByteRunner.parallaxProfiles.resolve(phase),strips=new Map();
    const definition=ByteRunner.artAssets?.find(asset=>asset.id===config?.asset);
    const layers=(config?.planes||[]).map(p=>{
      const size=config.tileSize*p.scale;
      const parts=Array.from({length:config.variants},(_,i)=>{
        const bound=definition?.frameBounds?definition.frameBounds[p.frame+i]:[0,0,128,128];
        if(!bound)return null;
        const [x,y,w,h]=bound;
        return {x:x*p.scale,y:y*p.scale,w:w*p.scale,h:h*p.scale,sx:i*size+x*p.scale,frame:p.frame+i,bound};
      });
      return {name:p.name,size,period:size*config.variants,pitch:size*(config.rowSpacing||1),rateX:p.rateX,rateY:p.rateY*config.verticalMultiplier,opacity:p.opacity,parts,image:null,strip:null,ox:0,oy:0};
    });
    const life=config?ByteRunner.parallaxLife?.create(phase,config):null;
    // Snapshot presentation bounds; never retain or mutate runtime state.
    const arena=phase?.layers?.flatMap(l=>l.items||[]).find(item=>item.kind==='boss-arena');
    const arenaBounds=arena?{x:arena.x,y:arena.y,width:arena.width,height:arena.height}:null;
    const mapWidth=phase?.map?.width||6800;
    const signalPath=signalPaths[config?.theme];
    const signalLengths=signalPath?.slice(1).map((b,i)=>Math.hypot(b[0]-signalPath[i][0],b[1]-signalPath[i][1]));
    const signalPeriod=signalLengths?.reduce((a,b)=>a+b,0);
    let disposed=false,builds=0,hits=0,drawCalls=0,drawnPixels=0;
    return Object.freeze({config,life,
      get stats(){const bytes=[...strips.values()].reduce((sum,e)=>sum+e.strip.width*e.strip.height*4,0);return {strips:strips.size,builds,hits,bytes,extraBytes:life?.stats.bytes||0,totalBytes:bytes+(life?.stats.bytes||0),drawCalls,drawnPixels,offsets:layers.map(l=>({name:l.name,x:l.ox,y:l.oy}))};},
      draw(ctx,view,time,visuals){
        if(disposed||!config||!visuals.hasAsset(config.asset))return false;
        const reduced=ByteRunner.experience?.settings.reducedEffects;
        const comfort=ByteRunner.parallaxLife?.settings||{},still=reduced||comfort.reduceAnimations;
        ctx.save();
        try{
          ctx.imageSmoothingEnabled=false;ctx.fillStyle=config.background;ctx.fillRect(0,0,view.width,view.height);
          const image=visuals.source(config.asset),count=reduced?config.reducedLayerCount:layers.length;
          drawCalls=0;drawnPixels=0;
          for(let index=0;index<count;index++){
            const p=layers[index],size=p.size,ox=p.ox=Math.floor(view.x*p.rateX),oy=p.oy=Math.floor(view.y*p.rateY);
            if(image&&p.image!==image){
              const strip=p.strip||document.createElement('canvas');strip.width=p.period;strip.height=size;
              const c=strip.getContext('2d');c.imageSmoothingEnabled=false;c.globalAlpha=p.opacity;
              for(let i=0;i<p.parts.length;i++){
                const part=p.parts[i];if(!part)continue;
                const b=part.bound,frame=part.frame;
                c.drawImage(image,frame%8*128+b[0],Math.floor(frame/8)*128+b[1],b[2],b[3],part.sx,part.y,part.w,part.h);
              }
              p.image=image;p.strip=strip;strips.set(p.name,p);builds++;
            }else if(p.strip)hits++;
            if(!p.strip)continue;
            ctx.globalAlpha=1;
            const pitch=p.pitch,lastRow=Math.ceil((oy+view.height)/pitch),lastCol=Math.ceil((ox+view.width)/size);
            for(let row=Math.floor(oy/pitch);row<lastRow;row++)for(let col=Math.floor(ox/size);col<lastCol;col++){
              const part=p.parts[mod(col+row,config.variants)];if(!part)continue;
              const x=col*size-ox+part.x,y=row*pitch-oy+part.y;
              const left=Math.max(0,-x),top=Math.max(0,-y),w=Math.min(part.w-left,view.width-Math.max(0,x)),h=Math.min(part.h-top,view.height-Math.max(0,y));
              if(w<=0||h<=0)continue;
              ctx.drawImage(p.strip,part.sx+left,part.y+top,w,h,x+left,y+top,w,h);drawCalls++;drawnPixels+=w*h;
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
                const variant=mod(col+row,config.variants);if(variant!==1&&variant!==5)continue;
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
              const count=Math.floor(progress*3)+(inArena?2:0),tick=Math.floor(time*.5);
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
      dispose(){for(const layer of layers){if(layer.strip){layer.strip.width=0;layer.strip.height=0;}layer.strip=null;layer.image=null;}strips.clear();life?.dispose();disposed=true;}
    });
  }
  ByteRunner.parallax=Object.freeze({create});
})();
