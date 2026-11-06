/* Read-only discrete traversal probes. Live tests compare these with movePlayer. */
(() => {
  'use strict';
  const api=ByteRunner,P=api.platformPhysics.base;
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.width>b.x&&a.y<b.y+b.h&&a.y+a.height>b.y;
  function spatialIndex(shapes) {
    const cells=new Map(),large=[];
    shapes.forEach((s,i)=>{
      const a=Math.floor(s.x/256),b=Math.floor((s.x+s.w)/256),top=Math.floor(s.y/256),bottom=Math.floor((s.y+s.h)/256);
      if((b-a+1)*(bottom-top+1)>4096){large.push(i);return;}
      for(let y=top;y<=bottom;y++)for(let x=a;x<=b;x++){const key=x+','+y;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);}
    });
    return {near(body){
      const found=new Set(large);
      for(let y=Math.floor((body.y-64)/256);y<=Math.floor((body.y+body.height+64)/256);y++)for(let x=Math.floor((body.x-64)/256);x<=Math.floor((body.x+body.width+64)/256);x++)for(const i of cells.get(x+','+y)||[])found.add(i);
      return [...found].sort((a,b)=>a-b).map(i=>shapes[i]);
    }};
  }
  function step(body,direction,jump,shapes,map,dt=1/60) {
    const b={...body},previousX=b.x;
    b.vx=direction*P.speed;if(jump&&b.grounded){b.vy=-P.jump;b.grounded=false;}
    b.x+=b.vx*dt;
    const clamp=()=>{if(map.bounds.left)b.x=Math.max(0,b.x);if(map.bounds.right)b.x=Math.min(map.width-b.width,b.x);};clamp();
    for(const s of shapes)if(s.collision!=='one-way'&&overlaps(b,s)){if(b.vx>0)b.x=s.x-b.width;else if(b.vx<0)b.x=s.x+s.w;}
    clamp();const y=b.y,vy=b.vy;b.vy=Math.min(vy+P.gravity*dt,1050);b.y+=(vy+b.vy)*.5*dt;b.grounded=false;
    for(const s of shapes) {
      const horizontal=b.x<s.x+s.w&&b.x+b.width>s.x;
      if(b.vy>=0&&y+b.height<=s.y+2&&b.y+b.height>=s.y&&horizontal){b.y=s.y-b.height;b.vy=0;b.grounded=true;}
      else if(s.collision!=='one-way'&&b.vy<0&&y>=s.y+s.h-2&&b.y<=s.y+s.h&&horizontal){b.y=s.y+s.h;b.vy=0;}
      else if(s.collision!=='one-way'&&overlaps(b,s)&&b.x>s.x&&b.x<s.x+s.w){if(previousX+b.width<=s.x)b.x=s.x-b.width;else if(previousX>=s.x+s.w)b.x=s.x+s.w;}
    }
    if(map.bounds.ceiling&&b.y<0){b.y=0;if(b.vy<0)b.vy=0;}clamp();return b;
  }
  function surfaces(shapes,width) {
    const nodes=[];
    for(const s of shapes) {
      if(s.y<P.height||s.type==='interference')continue;
      let spans=[[s.x,s.x+s.w-P.width]];
      for(const b of shapes) {
        if(b===s||b.collision==='one-way'||b.y>=s.y-1||b.y+b.h<=s.y-P.height+1)continue;
        spans=spans.flatMap(([a,z])=>b.x>=z+P.width||b.x+b.w<=a?[[a,z]]:[[a,Math.min(z,b.x-P.width)],[Math.max(a,b.x+b.w),z]]).filter(([a,z])=>z>=a);
      }
      for(const [a,z] of spans)nodes.push({id:s.id||'floor',a:Math.max(0,a),z:Math.min(width-P.width,z),y:s.y-P.height,dynamic:['moving','temporary','falling'].includes(s.type)});
    }
    return nodes;
  }
  function edge(from,to,shapes,map) {
    const fall=to.y-from.y,gap=Math.max(to.a-from.z,from.a-to.z,0);
    if(fall<-api.platformPhysics.jumpHeight-1||gap>Math.min(500,api.platformPhysics.horizontalAt(fall)+P.width))return false;
    const relevant=shapes.filter(s=>s.x+s.w>=Math.min(from.a,to.a)-64&&s.x<=Math.max(from.z,to.z)+P.width+64&&s.y+s.h>=Math.min(from.y,to.y)-P.jump*P.jump/(2*P.gravity)-P.height-8&&s.y<=Math.max(from.y,to.y)+P.height+16);
    for(const target of [to.a,to.z,(to.a+to.z)/2])for(const launch of [...new Set([Math.max(from.a,Math.min(from.z,target)),from.a,from.z,(from.a+from.z)/2])])for(const mode of ['jump','left','right']) {
      if(mode!=='jump'&&to.y<from.y)continue;
      let b={x:launch,y:from.y,vx:0,vy:0,width:P.width,height:P.height,grounded:true},left=false;
      for(let t=0;t<150;t++) {
        const aim=mode==='jump'||left?target:mode==='left'?from.a-36:from.z+36;
        b=step(b,Math.abs(aim-b.x)>2?Math.sign(aim-b.x):0,t===0&&mode==='jump',relevant,map);
        if(!b.grounded)left=true;if(b.y>map.height+100)break;
        if(b.grounded&&(left||mode!=='jump')&&t>1){if(b.x>=to.a-2&&b.x<=to.z+2&&Math.abs(b.y-to.y)<3)return true;if(left&&(Math.abs(b.y-to.y)>=3||b.x+P.width<=to.a||b.x>=to.z+P.width))break;}
      }
    }
    return false;
  }
  function topology(phase,links=[]) {
    const rooms=phase.generation?.rooms||[],edges=[...(phase.generation?.graph?.edges||phase.generation?.links?.map(e=>({from:e.from.room,to:e.to.room}))||[])];
    const at=p=>rooms.find(r=>p.x>=r.x&&p.x<r.x+r.width&&p.y>=r.y&&p.y<r.y+r.height)?.id;
    for(const link of links){const from=at(link),to=at(link.to);if(from&&to)edges.push({from,to,directed:true});}
    if(!rooms.length)return {rooms:0,isolated:[]};
    const root=phase.generation?.recipe?.start.room||rooms[0].id,seen=new Set([root]),queue=[root];
    for(const id of queue)for(const e of edges){const next=e.from===id?e.to:!e.directed&&e.to===id?e.from:null;if(next&&!seen.has(next)){seen.add(next);queue.push(next);}}
    return {rooms:rooms.length,isolated:rooms.filter(r=>!seen.has(r.id)).map(r=>r.id)};
  }
  async function analyze(phase,shapes,links=[],start=phase.map.start,{yieldEvery=12}={}) {
    const nodes=surfaces(shapes,phase.map.width),seen=new Set(),queue=[];
    const first=nodes.findIndex(n=>start.x>=n.a-1&&start.x<=n.z+1&&Math.abs(start.y-n.y)<3);
    if(first>=0){seen.add(first);queue.push(first);}
    for(let q=0;q<queue.length;q++) {
      const src=nodes[queue[q]];
      for(const link of links) {
        const px=Math.max(src.a,Math.min(src.z,link.x));
        if(Math.hypot(px+17-link.x-link.width/2,src.y+24-link.y-link.height/2)>=72)continue;
        const target=nodes.findIndex(n=>link.to.x>=n.a-1&&link.to.x<=n.z+1&&Math.abs(link.to.y-n.y)<3);
        if(target>=0&&!seen.has(target)){seen.add(target);queue.push(target);}
      }
      for(let j=0;j<nodes.length;j++)if(!seen.has(j)&&edge(src,nodes[j],shapes,phase.map)){seen.add(j);queue.push(j);}
      if(yieldEvery&&q%yieldEvery===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
    const reached=[...seen].map(i=>nodes[i]),missing=nodes.filter((_,i)=>!seen.has(i));
    const rooms=phase.generation?.rooms||[],exit=phase.map.exit;
    const containsExit=n=>n.z+P.width>exit.x&&n.a<exit.x+(exit.width||64)&&n.y+P.height>(exit.y??0)&&n.y<(exit.y??phase.map.height)+(exit.height||64);
    return {model:'discrete-base-physics/frozen-platforms',topology:topology(phase,links),spawnSupported:first>=0,exitReached:reached.some(containsExit),
      reached,unproven:missing,unreachableRooms:rooms.filter(r=>!reached.some(n=>n.a<r.x+r.width&&n.z+P.width>r.x&&n.y+P.height>r.y&&n.y<r.y+r.height)).map(r=>r.id),
      repairs:(phase.entities.components||[]).map(c=>({id:c.id,reached:reached.some(n=>Math.abs(c.y+(c.height||44)/2-n.y-P.height/2)<=78&&n.z+P.width/2>=c.x+(c.width||34)/2-76&&n.a+P.width/2<=c.x+(c.width||34)/2+76)}))};
  }
  function signature(phase) {
    const rows=[...phase.map.ground.segments,...phase.entities.platforms,...phase.entities.obstacles,...phase.entities.gates].map(s=>[s.x,s.y,s.width,s.height,s.type||'floor',s.motion||null]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    const text=JSON.stringify([phase.map.width,phase.map.height,rows]);let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);return (hash>>>0).toString(16).padStart(8,'0');
  }
  api.mapAudit=Object.freeze({step,surfaces,edge,topology,analyze,signature,spatialIndex});
})();
