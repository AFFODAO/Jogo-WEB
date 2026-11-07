/* Visual-only terrain union, bounded raster chunks and original environment atlases. */
(() => {
  'use strict';
  const api=ByteRunner,TILE=32,CHUNK=256,LIMIT=96;
  const colors=[['#071719','#153b32','#60eab4'],['#100e22','#30234b','#bc9afa'],['#061923','#153b50','#62d9ed'],['#091626','#203b58','#7bbfff'],['#071b2a','#184454','#83e8f5'],['#141c23','#353e46','#e5b675'],['#081e1a','#254e40','#96e5ad'],['#141329','#3c3159','#c8b0f5'],['#200c15','#502030','#ff736d'],['#061522','#15374d','#67dbff']];
  const themes=['hardware','software','switch','router','wifi','cabling','dhcp','dns','firewall','servers'];
  const mod=(a,b)=>(a%b+b)%b;
  const dynamic=o=>['moving','temporary','falling','dangerous'].includes(o.type)||o.collision==='dangerous'||o.kind==='gate';
  const compatible=(a,b)=>(a.collision==='one-way')===(b.collision==='one-way')&&!dynamic(b);
  function terrain() {
    let signature='',version=0,rects=[],buckets=new Map(),large=[];
    const chunks=new Map(),stats={builds:0,hits:0,draws:0,cells:0,releases:0};
    // Large-map streaming must release raster storage at eviction, not wait for GC.
    const release=canvas=>{canvas.width=0;canvas.height=0;stats.releases++;};
    const clearChunks=()=>{for(const canvas of chunks.values())release(canvas);chunks.clear();};
    const state={stats,
      sync(shapes) {
        const next=shapes.filter(o=>!dynamic(o));
        const key=next.map(o=>[o.id,o.x,o.y,o.w,o.h,o.collision].join(',')).join('|');
        if(key===signature)return;signature=key;version++;rects=next.map(o=>({...o}));buckets=new Map();large=[];clearChunks();
        for(const r of rects) {
          const left=Math.floor(r.x/128),right=Math.floor((r.x+r.w)/128),top=Math.floor(r.y/128),bottom=Math.floor((r.y+r.h)/128);
          if((right-left+1)*(bottom-top+1)>4096){large.push(r);continue;}
          for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const k=x+','+y;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(r);}
        }
      },
      occupied(x,y,object) {
        if(x>=object.x&&x<object.x+object.w&&y>=object.y&&y<object.y+object.h)return true;
        if(dynamic(object))return false;
        return [...(buckets.get(Math.floor(x/128)+','+Math.floor(y/128))||[]),...large].some(r=>compatible(object,r)&&x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
      },
      mask(object,x,y,w,h) {
        const has=(dx,dy)=>state.occupied(dx,dy,object);
        const n=has(x+w/2,y-.5),e=has(x+w+.5,y+h/2),s=has(x+w/2,y+h+.5),west=has(x-.5,y+h/2);
        const mask=(n?1:0)|(e?2:0)|(s?4:0)|(west?8:0);
        return {mask,inner:[n&&west&&!has(x-.5,y-.5),n&&e&&!has(x+w+.5,y-.5),s&&e&&!has(x+w+.5,y+h+.5),s&&west&&!has(x-.5,y+h+.5)]};
      },
      edgeRuns(object,side,offset,length) {
        const runs=[];
        for(let p=0;p<length;p++) {
          const along=offset+p+.5;
          const x=side===0||side===2?object.x+along:side===1?object.x+object.w+.5:object.x-.5;
          const y=side===1||side===3?object.y+along:side===0?object.y-.5:object.y+object.h+.5;
          const exposed=!state.occupied(x,y,object),last=runs.at(-1);
          if(last&&last.exposed===exposed)last.length++;else runs.push({start:p,length:1,exposed});
        }
        return runs;
      },
      chunk(object,cx,cy,visuals,id) {
        const key=[version,object.id||'shape',dynamic(object)?0:object.x,dynamic(object)?0:object.y,object.w,object.h,object.type,cx,cy].join(':');
        if(chunks.has(key)){const hit=chunks.get(key);chunks.delete(key);chunks.set(key,hit);stats.hits++;return hit;}
        const canvas=document.createElement('canvas');canvas.width=Math.min(CHUNK,object.w-cx);canvas.height=Math.min(CHUNK,object.h-cy);
        const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
        const image=visuals.source(id);
        // Nine-slice each partial tile, keeping its exposed rim inside the exact shape.
        function patch(frame,x,y,w,h) {
          const sx=frame%8*TILE,sy=Math.floor(frame/8)*TILE,b=Math.min(4,Math.floor(Math.min(w,h)/2));
          const src=[0,b,TILE-b,TILE],dstX=[x,x+b,x+w-b,x+w],dstY=[y,y+b,y+h-b,y+h];
          for(let yy=0;yy<3;yy++)for(let xx=0;xx<3;xx++)if(dstX[xx+1]>dstX[xx]&&dstY[yy+1]>dstY[yy])ctx.drawImage(image,sx+src[xx],sy+src[yy],src[xx+1]-src[xx],src[yy+1]-src[yy],dstX[xx],dstY[yy],dstX[xx+1]-dstX[xx],dstY[yy+1]-dstY[yy]);
        }
        for(let y=0;y<canvas.height;y+=TILE)for(let x=0;x<canvas.width;x+=TILE) {
          const w=Math.min(TILE,canvas.width-x),h=Math.min(TILE,canvas.height-y),worldX=object.x+cx+x,worldY=object.y+cy+y;
          const cell=state.mask(object,worldX,worldY,w,h),variant=mod(Math.floor(worldX/TILE)*3+Math.floor(worldY/TILE),8);
          patch(cell.mask*8+variant,x,y,w,h);
          for(let corner=0;corner<4;corner++)if(cell.inner[corner])patch((16+corner)*8,x,y,w,h);
          // Non-grid map rectangles may join for only part of an edge. Repair
          // that rim per pixel; never snap or expand their collision geometry.
          for(let side=0;side<4;side++) {
            if(![cy+y===0,cx+x+w===object.w,cy+y+h===object.h,cx+x===0][side])continue;
            const horizontal=side===0||side===2,runs=state.edgeRuns(object,side,horizontal?cx+x:cy+y,horizontal?w:h);
            if(runs.length<2)continue;
            for(const run of runs) {
              const frame=(run.exposed?0:15)*8+variant,fx=frame%8*TILE,fy=Math.floor(frame/8)*TILE;
              const dx=side===1?w-3:0,dy=side===2?h-3:0;
              const sx=side===1?29:0,sy=side===2?29:0;
              if(horizontal)ctx.drawImage(image,fx+run.start,fy+sy,run.length,3,x+run.start,y+dy,run.length,3);
              else ctx.drawImage(image,fx+sx,fy+run.start,3,run.length,x+dx,y+run.start,3,run.length);
            }
          }
          stats.cells++;
        }
        chunks.set(key,canvas);stats.builds++;while(chunks.size>LIMIT){const oldest=chunks.keys().next().value;release(chunks.get(oldest));chunks.delete(oldest);}return canvas;
      },
      get cacheSize(){return chunks.size;},get cacheBytes(){let bytes=0;for(const canvas of chunks.values())bytes+=canvas.width*canvas.height*4;return bytes;},dispose(){clearChunks();buckets.clear();rects=[];large=[];}
    };
    return state;
  }
  function platform(ctx,visuals,o,time,index,view) {
    const id='terrain-'+String(index+1).padStart(2,'0');if(!visuals?.hasAsset(id)||!visuals.terrain||!['floor','platform','gate','obstacle'].includes(o.kind))return false;
    if(!visuals.source(id)){ctx.fillStyle=colors[index][1];ctx.fillRect(Math.round(o.x),Math.round(o.y),o.w,o.h);return true;}
    const left=Math.max(0,Math.floor((view.x-o.x)/CHUNK)*CHUNK),top=Math.max(0,Math.floor((view.y-o.y)/CHUNK)*CHUNK);
    const right=Math.min(o.w,view.x+view.width-o.x),bottom=Math.min(o.h,view.y+view.height-o.y);
    if(right<=left||bottom<=top)return true;
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(let y=top;y<bottom;y+=CHUNK)for(let x=left;x<right;x+=CHUNK){const chunk=visuals.terrain.chunk(o,x,y,visuals,id);ctx.drawImage(chunk,Math.round(o.x+x),Math.round(o.y+y));visuals.terrain.stats.draws++;}
    const accent=colors[index][2],x0=Math.max(o.x,view.x),x1=Math.min(o.x+o.w,view.x+view.width);
    if(['moving','temporary','falling'].includes(o.type)) {
      ctx.fillStyle=o.type==='moving'?accent:'#ffd38b';
      for(let x=Math.floor(x0/12)*12;x<x1;x+=12)ctx.fillRect(Math.round(x),Math.round(o.y+5),6,2);
      api.pixelArt.text(ctx,o.type==='moving'?'LIFT':o.type==='falling'?'CAI':'TEMP',o.x+8,o.y+9,'#f8e0ad',o.w-12);
    }
    if(o.type==='dangerous'||o.collision==='dangerous') {
      ctx.fillStyle='#ff6e84';for(let x=Math.floor(x0/8)*8;x<x1;x+=8)ctx.fillRect(Math.round(x+2),Math.round(o.y),3,5);
    }
    ctx.restore();return true;
  }
  const architectureKinds=new Set(['board','backplane','building','datacenter','server-tower','rack','fortress','tunnel','window-room','address-sector','domain-room','domain-root','domain-false','boss-arena','battle-hall','security-hall','citadel','lift-shaft','duct']);
  function feature(ctx,item,view,time,visuals,index) {
    const suffix=String(index+1).padStart(2,'0'),id='structure-'+suffix;
    if(!visuals?.hasAsset(id))return false;
    // The motherboard is already expressed by the parallax modules. Repeating
    // authored circuit bays over them creates a second, competing screen grid.
    if(item.kind==='board')return true;
    const {x,y,width:w,height:h,kind,label}=item,palette=colors[index],reduced=api.experience?.settings.reducedEffects||api.parallaxLife?.settings.reduceAnimations;
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.beginPath();ctx.rect(Math.round(x),Math.round(y),w,h);ctx.clip();
    if(architectureKinds.has(kind)){
      // Preserve each authored room's location and label without covering its
      // themed parallax with an opaque repeated panel grid.
      ctx.fillStyle=palette[1];
      for(const [xx,yy,sx,sy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
        ctx.fillRect(Math.round(xx+(sx<0?-28:0)),Math.round(yy+(sy<0?-2:0)),28,2);
        ctx.fillRect(Math.round(xx+(sx<0?-2:0)),Math.round(yy+(sy<0?-24:0)),2,24);
      }
      ctx.restore();if(label)api.pixelArt.text(ctx,label,x+8,y+9,'#d2e7e4',w-16);return true;
    }
    {
      const animation={ethernet:'port',cache:'terminal',process:'terminal'}[kind]||kind;
      if(kind==='cpu')visuals.sprite(ctx,{asset:id,animation:'structure'},{x:Math.round(x+(w-128)/2),y:Math.round(y+(h-128)/2),width:128,height:128},reduced?0:time);
      else {
        const scale=Math.max(1,Math.min(3,Math.floor(Math.min(w,h)/64))),size=64*scale,count=Math.max(1,Math.floor(w/size));
        for(let i=0;i<count;i++)visuals.sprite(ctx,{asset:'decor-'+suffix,animation},{x:Math.round(x+(w-count*size)/2+i*size),y:Math.round(y+(h-size)/2),width:size,height:size},reduced?0:time);
      }
    }
    ctx.restore();if(label)api.pixelArt.text(ctx,label,x+8,y+9,'#d2e7e4',w-16);return true;
  }
  function background(ctx,view,time,index,visuals) {
    return visuals?.parallax?.draw(ctx,view,time,visuals) || false;
  }
  api.environmentArt=Object.freeze({terrain,platform,feature,background,colors,themes});
})();
