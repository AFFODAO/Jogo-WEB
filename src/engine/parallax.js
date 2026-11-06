/* Camera input only: owns presentation caches, never gameplay state. */
(() => {
  const mod=(a,b)=>(a%b+b)%b;
  function create(phase){
    const config=ByteRunner.parallaxProfiles.resolve(phase),strips=new Map();
    let disposed=false,builds=0,hits=0;
    return Object.freeze({config,
      get stats(){return {strips:strips.size,builds,hits,bytes:[...strips.values()].reduce((sum,e)=>sum+e.strip.width*e.strip.height*4,0)};},
      draw(ctx,view,time,visuals){
        if(disposed||!config||!visuals.hasAsset(config.asset))return false;
        const reduced=ByteRunner.experience?.settings.reducedEffects;
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
            for(let y=Math.floor(oy/size);y<Math.ceil((oy+view.height)/size);y++){
              let dx=0,sx=mod(ox+y*size,period);
              while(dx<view.width){const take=Math.min(period-sx,view.width-dx);ctx.drawImage(entry.strip,sx,0,take,size,dx,y*size-oy,take,size);dx+=take;sx=0;}
            }
          }
          if(!reduced)for(let i=0;i<config.particles.count;i++){
            const ambient=config.particles.ambient;
            const x=Math.floor(mod(i*137-view.x*config.particles.rateX+time*(ambient ? 1+i%3 : 4+i%4),view.width)),y=Math.floor(mod(i*71-view.y*config.particles.rateY+time*(i%3-1)*(ambient ? .4 : 2),view.height));
            ctx.fillStyle=config.accent;ctx.globalAlpha=ambient ? .035 : .08;ctx.fillRect(x-3,y-3,8,8);ctx.globalAlpha=ambient ? .09 : .22;ctx.fillRect(x-1,y-1,4,4);ctx.globalAlpha=ambient ? .32 : .75;ctx.fillRect(x,y,2,2);
            if(ambient&&mod(time+i*1.7,config.particles.pulsePeriod)<.6){ctx.globalAlpha=.18;ctx.fillRect(x-4,y+1,10,1);}
          }
          return true;
        }finally{ctx.restore();}
      },
      dispose(){strips.clear();disposed=true;}
    });
  }
  ByteRunner.parallax=Object.freeze({create});
})();
