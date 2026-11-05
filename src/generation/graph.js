// Seeded topology, independent of rendering, entities and campaign state.
(() => {
  const api=window.ByteRunner, rng=api.mapGeneration.random;
  const directions=[[1,0],[-1,0],[0,1],[0,-1]];
  const key=(x,y)=>x+','+y;
  function graph(input={}) {
    const options={seed:'byte-runner',roomCount:12,difficulty:1,optionalRatio:.35,portals:false,...input};
    if(!Number.isInteger(options.roomCount)||options.roomCount<8||options.roomCount>24)throw new Error('roomCount must be 8..24');
    if(!Number.isInteger(options.difficulty)||options.difficulty<1||options.difficulty>5)throw new Error('difficulty must be 1..5');
    if(!Number.isFinite(options.optionalRatio)||options.optionalRatio<.2||options.optionalRatio>.7)throw new Error('optionalRatio must be .2.. .7');
    if(typeof options.portals!=='boolean')throw new Error('portals must be boolean');
    const random=rng(options.seed).fork('topology'), optional=Math.max(2,Math.min(options.roomCount-3,Math.round(options.roomCount*options.optionalRatio))), mainCount=options.roomCount-optional;
    const nodes=[],edges=[],occupied=new Map();
    const add=(x,y,main)=>{const node={id:'r'+nodes.length,x,y,main,type:'exploration'};nodes.push(node);occupied.set(key(x,y),node);return node;};
    const edge=(a,b,role)=>{const vertical=a.x===b.x;edges.push({id:'edge-'+edges.length,from:a.id,to:b.id,role,kind:vertical?'vertical':random.pick(['corridor','door','tunnel','bridge'])});};
    for(let x=0;x<mainCount;x++){const n=add(x,0,true);if(x)edge(nodes[x-1],n,'main');}
    // Two optional rooms close a guaranteed loop beside a seeded section of the spine.
    const junction=random.int(0,mainCount-2),side=random.pick([-1,1]);
    const a=add(junction,side,false),b=add(junction+1,side,false);
    edge(nodes[junction],a,'branch');edge(a,b,'branch');edge(b,nodes[junction+1],'shortcut');
    while(nodes.length<options.roomCount){
      const frontier=[];
      for(const parent of nodes)for(const [dx,dy]of directions){const x=parent.x+dx,y=parent.y+dy;if(x>=0&&x<mainCount&&Math.abs(y)<=2&&!occupied.has(key(x,y)))frontier.push({parent,x,y});}
      if(!frontier.length)throw new Error('No room placement available');
      const slot=random.pick(frontier),node=add(slot.x,slot.y,false);edge(slot.parent,node,'branch');
    }
    const connected=(a,b)=>edges.some(e=>(e.from===a.id&&e.to===b.id)||(e.from===b.id&&e.to===a.id));
    for(const node of nodes)for(const [dx,dy]of [[1,0],[0,1]]){const next=occupied.get(key(node.x+dx,node.y+dy));if(next&&!connected(node,next)&&random.next()<.4)edge(node,next,'shortcut');}
    nodes[0].type='initial';nodes[mainCount-1].type='final';
    const types=['exploration','parkour','combat','repair','reward','secret'];
    const middle=nodes.filter(n=>n.type==='exploration');
    // Cover every role, then vary extras. Secret and reward stay off the required spine.
    const optionalNodes=middle.filter(n=>!n.main);
    optionalNodes[0].type='secret';optionalNodes[1].type='reward';
    const remaining=middle.filter(n=>!['secret','reward'].includes(n.type));
    remaining.forEach((n,i)=>n.type=i<4?types[i]:random.pick(types.slice(0,5)));
    const minY=Math.min(...nodes.map(n=>n.y));nodes.forEach(n=>n.y-=minY);
    return {version:1,options,nodes,edges,mainPath:nodes.filter(n=>n.main).map(n=>n.id),optionalCount:optional,actualOptionalRatio:optional/options.roomCount};
  }
  api.proceduralMaps={graph};
})();
